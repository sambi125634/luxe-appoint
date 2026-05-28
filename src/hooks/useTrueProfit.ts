import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSalonId } from '@/hooks/useSalonId';
import { useProducts } from '@/hooks/useProducts';
import { useServiceRecipes } from '@/hooks/useServiceRecipes';
import {
  ServiceProfit,
  ClientLTV,
  ProfitSummary,
  CAC_ESTIMATES,
  DEFAULT_HOURLY_RATE,
} from '@/modules/analytics/types';
import { startOfMonth, endOfMonth, startOfDay, endOfDay, subMonths, format } from 'date-fns';
import {
  computeStaffCostForAppointment,
  blendedHourlyCost,
  formatCompensation,
  type StaffCompensation,
  type CompensationDefaults,
} from '@/lib/compensation';

function estimateCAC(source: string | null): number {
  if (!source) return CAC_ESTIMATES[''];
  const key = source.toLowerCase();
  return CAC_ESTIMATES[key] ?? CAC_ESTIMATES[''];
}

export function useTrueProfit() {
  const { salonId } = useSalonId();

  // Fetch services directly
  const { data: services } = useQuery({
    queryKey: ['tp-services', salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('salon_id', salonId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!salonId,
  });

  const { products } = useProducts(salonId || '');
  const { recipes, getMaterialCost } = useServiceRecipes(salonId || '');

  // Fetch staff members with their compensation models
  const { data: staffMembers } = useQuery({
    queryKey: ['tp-staff', salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from('staff_members')
        .select('id, compensation_type, commission_rate, hourly_rate, base_salary, flat_rate_per_service')
        .eq('salon_id', salonId);
      if (error) throw error;
      return (data || []) as (StaffCompensation & { id: string })[];
    },
    enabled: !!salonId,
  });

  // Fetch salon-wide defaults from settings.team
  const { data: salonDefaults } = useQuery({
    queryKey: ['tp-team-defaults', salonId],
    queryFn: async () => {
      if (!salonId) return null;
      const { data, error } = await supabase
        .from('salons')
        .select('settings')
        .eq('id', salonId)
        .maybeSingle();
      if (error) throw error;
      const team = ((data?.settings as any)?.team) || {};
      return {
        defaultCompensationType: (team.defaultCompensationType as 'hourly' | 'commission') || 'hourly',
        defaultHourlyRate: Number(team.defaultHourlyRate) || DEFAULT_HOURLY_RATE,
        defaultCommissionRate: Number(team.defaultCommissionRate) || 30,
      } as CompensationDefaults;
    },
    enabled: !!salonId,
  });

  const defaults: CompensationDefaults = salonDefaults || {
    defaultCompensationType: 'hourly',
    defaultHourlyRate: DEFAULT_HOURLY_RATE,
    defaultCommissionRate: 30,
  };

  const staffById = useMemo(() => {
    const m = new Map<string, StaffCompensation>();
    (staffMembers || []).forEach((s) => m.set(s.id, s));
    return m;
  }, [staffMembers]);

  const now = new Date();
  const todayStart = startOfDay(now).toISOString();
  const todayEnd = endOfDay(now).toISOString();
  const monthStart = startOfMonth(now).toISOString();
  const monthEnd = endOfMonth(now).toISOString();
  const prevMonthStart = startOfMonth(subMonths(now, 1)).toISOString();
  const prevMonthEnd = endOfMonth(subMonths(now, 1)).toISOString();

  // Fetch completed appointments for current month
  const { data: monthAppointments } = useQuery({
    queryKey: ['tp-appointments-month', salonId, format(now, 'yyyy-MM')],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from('appointments')
        .select('id, service_id, staff_id, client_id, start_time, end_time, price, status')
        .eq('salon_id', salonId)
        .gte('start_time', monthStart)
        .lte('start_time', monthEnd)
        .in('status', ['completed', 'booked']);
      if (error) throw error;
      return data || [];
    },
    enabled: !!salonId,
  });

  // Fetch previous month for comparison
  const { data: prevMonthAppointments } = useQuery({
    queryKey: ['tp-appointments-prev', salonId, format(subMonths(now, 1), 'yyyy-MM')],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from('appointments')
        .select('id, service_id, staff_id, client_id, start_time, end_time, price, status')
        .eq('salon_id', salonId)
        .gte('start_time', prevMonthStart)
        .lte('start_time', prevMonthEnd)
        .in('status', ['completed', 'booked']);
      if (error) throw error;
      return data || [];
    },
    enabled: !!salonId,
  });

  // Fetch clients for CAC
  const { data: clients } = useQuery({
    queryKey: ['tp-clients', salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from('clients')
        .select('id, first_name, last_name, source, created_at, last_visit_at')
        .eq('salon_id', salonId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!salonId,
  });

  // Fetch transactions for client LTV
  const { data: transactions } = useQuery({
    queryKey: ['tp-transactions', salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select('id, client_id, amount, type, transaction_date')
        .eq('salon_id', salonId)
        .eq('type', 'service');
      if (error) throw error;
      return data || [];
    },
    enabled: !!salonId,
  });

  const hasMaterialData = !!(recipes && recipes.length > 0);
  const hasStaffRates = !!(staffMembers && staffMembers.some((s) => formatCompensation(s).isConfigured));

  // Service profit ranking
  const serviceProfits: ServiceProfit[] = useMemo(() => {
    if (!services || !monthAppointments) return [];

    const serviceCounts = new Map<string, number>();
    for (const apt of monthAppointments) {
      serviceCounts.set(apt.service_id, (serviceCounts.get(apt.service_id) || 0) + 1);
    }

    // Blended hourly cost — anchor uses average service price/hour as proxy
    const anchorPph = services.length > 0
      ? services.reduce((a, s) => a + (s.price / Math.max(s.duration / 60, 0.25)), 0) / services.length
      : 0;
    const blended = blendedHourlyCost(staffMembers || [], anchorPph, defaults);

    return services
      .filter((s) => s.is_active)
      .map((s) => {
        const matCost = getMaterialCost(s.id);
        const staffCost = (s.duration / 60) * blended;
        const tp = s.price - matCost - staffCost;
        const tpPerHour = tp / (s.duration / 60);
        return {
          serviceId: s.id,
          serviceName: s.name,
          price: s.price,
          materialCost: matCost,
          staffCostPerVisit: staffCost,
          duration: s.duration,
          trueProfitPerVisit: tp,
          trueProfitPerHour: tpPerHour,
          executionCount: serviceCounts.get(s.id) || 0,
          hasMaterialData: matCost > 0,
        };
      })
      .sort((a, b) => b.trueProfitPerHour - a.trueProfitPerHour);
  }, [services, monthAppointments, getMaterialCost, staffMembers, defaults]);

  // Client LTV ranking
  const clientLTVs: ClientLTV[] = useMemo(() => {
    if (!clients || !transactions) return [];

    const clientSpending = new Map<string, { total: number; count: number }>();
    for (const t of transactions) {
      if (!t.client_id) continue;
      const curr = clientSpending.get(t.client_id) || { total: 0, count: 0 };
      curr.total += Number(t.amount);
      curr.count += 1;
      clientSpending.set(t.client_id, curr);
    }

    return clients
      .filter((c) => clientSpending.has(c.id))
      .map((c) => {
        const spending = clientSpending.get(c.id)!;
        const cac = estimateCAC(c.source);
        return {
          clientId: c.id,
          clientName: `${c.first_name} ${c.last_name}`,
          totalSpent: spending.total,
          visitCount: spending.count,
          acquisitionCost: cac,
          source: c.source,
          ltvCacRatio: cac > 0 ? spending.total / cac : Infinity,
          firstVisit: c.created_at,
          lastVisit: c.last_visit_at,
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [clients, transactions]);

  // Monthly summary
  const calcSummary = (appointments: typeof monthAppointments): ProfitSummary => {
    if (!appointments || !services) {
      return { revenue: 0, materialCosts: 0, staffCosts: 0, acquisitionCosts: 0, trueProfit: 0, trueMargin: 0, hasMaterialData, hasStaffRates };
    }

    let revenue = 0;
    let materialCosts = 0;
    let staffCosts = 0;
    const uniqueClients = new Set<string>();

    for (const apt of appointments) {
      const price = apt.price ?? 0;
      revenue += price;
      const svc = services.find((s) => s.id === apt.service_id);
      if (svc) {
        materialCosts += getMaterialCost(svc.id);
        const staff = apt.staff_id ? staffById.get(apt.staff_id) : null;
        staffCosts += computeStaffCostForAppointment(staff, Number(price) || svc.price, svc.duration, defaults);
      }
      if (apt.client_id) uniqueClients.add(apt.client_id);
    }

    // Rough CAC amortization: count unique new clients this period
    let acquisitionCosts = 0;
    if (clients) {
      for (const cid of uniqueClients) {
        const client = clients.find((c) => c.id === cid);
        if (client) {
          const clientTxCount = transactions?.filter((t) => t.client_id === cid).length || 1;
          acquisitionCosts += estimateCAC(client.source) / clientTxCount;
        }
      }
    }

    const trueProfit = revenue - materialCosts - staffCosts - acquisitionCosts;
    const trueMargin = revenue > 0 ? (trueProfit / revenue) * 100 : 0;

    return { revenue, materialCosts, staffCosts, acquisitionCosts, trueProfit, trueMargin, hasMaterialData, hasStaffRates };
  };

  const monthlySummary = useMemo(() => calcSummary(monthAppointments), [monthAppointments, services, clients, transactions, getMaterialCost]);
  const prevMonthlySummary = useMemo(() => calcSummary(prevMonthAppointments), [prevMonthAppointments, services, clients, transactions, getMaterialCost]);

  // Today summary
  const todaySummary = useMemo(() => {
    if (!monthAppointments) return calcSummary([]);
    const todayAppts = monthAppointments.filter((a) => a.start_time >= todayStart && a.start_time <= todayEnd);
    return calcSummary(todayAppts);
  }, [monthAppointments, todayStart, todayEnd, services, clients, transactions, getMaterialCost]);

  // Best service today by TP/h
  const bestServiceToday = useMemo(() => {
    if (!monthAppointments || !services) return null;
    const todayAppts = monthAppointments.filter((a) => a.start_time >= todayStart && a.start_time <= todayEnd);
    const svcCounts = new Map<string, number>();
    for (const a of todayAppts) svcCounts.set(a.service_id, (svcCounts.get(a.service_id) || 0) + 1);

    const anchorPph = services.length > 0
      ? services.reduce((a, s) => a + (s.price / Math.max(s.duration / 60, 0.25)), 0) / services.length
      : 0;
    const blended = blendedHourlyCost(staffMembers || [], anchorPph, defaults);

    let best: { name: string; tpPerHour: number } | null = null;
    for (const [sid] of svcCounts) {
      const svc = services.find((s) => s.id === sid);
      if (!svc) continue;
      const mat = getMaterialCost(sid);
      const staff = (svc.duration / 60) * blended;
      const tp = svc.price - mat - staff;
      const tph = tp / (svc.duration / 60);
      if (!best || tph > best.tpPerHour) best = { name: svc.name, tpPerHour: tph };
    }
    return best;
  }, [monthAppointments, services, todayStart, todayEnd, getMaterialCost, staffMembers, defaults]);

  const monthOverMonthChange = prevMonthlySummary.trueProfit !== 0
    ? ((monthlySummary.trueProfit - prevMonthlySummary.trueProfit) / Math.abs(prevMonthlySummary.trueProfit)) * 100
    : 0;

  return {
    todaySummary,
    monthlySummary,
    prevMonthlySummary,
    monthOverMonthChange,
    bestServiceToday,
    serviceProfits,
    clientLTVs,
    hasMaterialData,
    hasStaffRates,
    salonId,
  };
}
