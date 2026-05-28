/**
 * Single source of truth for staff compensation formatting and cost computation.
 * Used by TeamSettings, useTrueProfit, StaffCompensationReport and any other
 * place that needs to display or calculate the real cost of a staff member.
 */

export type CompensationType =
  | "commission"
  | "salary"
  | "hourly"
  | "salary_plus_commission"
  | "flat_per_service";

export interface StaffCompensation {
  compensation_type?: string | null;
  commission_rate?: number | null;
  hourly_rate?: number | null;
  base_salary?: number | null;
  salary_bonus_threshold?: number | null;
  salary_bonus_rate?: number | null;
  flat_rate_per_service?: number | null;
}

export interface CompensationDefaults {
  defaultCompensationType: CompensationType;
  defaultHourlyRate: number;
  defaultCommissionRate: number;
}

export const DEFAULT_COMPENSATION_DEFAULTS: CompensationDefaults = {
  defaultCompensationType: "hourly",
  defaultHourlyRate: 35,
  defaultCommissionRate: 30,
};

const HOURS_PER_MONTH = 160; // standard full-time

function fmtPln(n: number): string {
  return `${Math.round(n).toLocaleString("pl-PL")} zł`;
}

/**
 * Human-readable label that honors the staff member's real compensation model.
 * Never returns "35 zł/h" unless the staff actually has hourly comp.
 */
export function formatCompensation(staff: StaffCompensation | null | undefined): {
  label: string;
  short: string;
  isConfigured: boolean;
} {
  if (!staff || !staff.compensation_type) {
    return { label: "Nieustawione", short: "—", isConfigured: false };
  }

  const type = staff.compensation_type as CompensationType;

  switch (type) {
    case "commission": {
      const rate = Number(staff.commission_rate) || 0;
      return {
        label: `${rate}% prowizji od usługi`,
        short: `${rate}% prowizji`,
        isConfigured: rate > 0,
      };
    }
    case "hourly": {
      const rate = Number(staff.hourly_rate) || 0;
      return {
        label: `${fmtPln(rate)}/h`,
        short: `${fmtPln(rate)}/h`,
        isConfigured: rate > 0,
      };
    }
    case "salary": {
      const base = Number(staff.base_salary) || 0;
      return {
        label: `${fmtPln(base)}/mies.`,
        short: `${fmtPln(base)}/mies.`,
        isConfigured: base > 0,
      };
    }
    case "salary_plus_commission": {
      const base = Number(staff.base_salary) || 0;
      const rate = Number(staff.commission_rate) || 0;
      return {
        label: `${fmtPln(base)}/mies. + ${rate}%`,
        short: `${fmtPln(base)} + ${rate}%`,
        isConfigured: base > 0 || rate > 0,
      };
    }
    case "flat_per_service": {
      const flat = Number(staff.flat_rate_per_service) || 0;
      return {
        label: `${fmtPln(flat)}/zabieg`,
        short: `${fmtPln(flat)}/zabieg`,
        isConfigured: flat > 0,
      };
    }
    default:
      return { label: "Nieustawione", short: "—", isConfigured: false };
  }
}

/**
 * Calculates the real cost of a single appointment for a given staff member.
 * Falls back to salon-wide defaults, then to system defaults (35 zł/h).
 */
export function computeStaffCostForAppointment(
  staff: StaffCompensation | null | undefined,
  servicePrice: number,
  durationMinutes: number,
  defaults: CompensationDefaults = DEFAULT_COMPENSATION_DEFAULTS,
): number {
  const hours = durationMinutes / 60;

  if (!staff || !staff.compensation_type) {
    // fallback chain
    if (defaults.defaultCompensationType === "commission") {
      return servicePrice * (defaults.defaultCommissionRate / 100);
    }
    return hours * defaults.defaultHourlyRate;
  }

  const type = staff.compensation_type as CompensationType;

  switch (type) {
    case "hourly":
      return hours * (Number(staff.hourly_rate) || defaults.defaultHourlyRate);
    case "commission":
      return servicePrice * ((Number(staff.commission_rate) || defaults.defaultCommissionRate) / 100);
    case "flat_per_service":
      return Number(staff.flat_rate_per_service) || 0;
    case "salary":
      return ((Number(staff.base_salary) || 0) / HOURS_PER_MONTH) * hours;
    case "salary_plus_commission":
      return (
        ((Number(staff.base_salary) || 0) / HOURS_PER_MONTH) * hours +
        servicePrice * ((Number(staff.commission_rate) || 0) / 100)
      );
    default:
      return hours * defaults.defaultHourlyRate;
  }
}

/**
 * Effective hourly cost for a staff member, used for service-level rankings
 * where we don't know which staff will perform the service. Uses anchor price
 * for commission/flat models so they can be compared with hourly rates.
 */
export function effectiveHourlyCost(
  staff: StaffCompensation,
  anchorPricePerHour: number,
  defaults: CompensationDefaults = DEFAULT_COMPENSATION_DEFAULTS,
): number {
  const type = (staff.compensation_type || defaults.defaultCompensationType) as CompensationType;
  switch (type) {
    case "hourly":
      return Number(staff.hourly_rate) || defaults.defaultHourlyRate;
    case "commission":
      return anchorPricePerHour * ((Number(staff.commission_rate) || defaults.defaultCommissionRate) / 100);
    case "salary":
      return (Number(staff.base_salary) || 0) / HOURS_PER_MONTH;
    case "salary_plus_commission":
      return (
        (Number(staff.base_salary) || 0) / HOURS_PER_MONTH +
        anchorPricePerHour * ((Number(staff.commission_rate) || 0) / 100)
      );
    case "flat_per_service":
      // assume 1 service per hour on average
      return Number(staff.flat_rate_per_service) || defaults.defaultHourlyRate;
    default:
      return defaults.defaultHourlyRate;
  }
}

/**
 * Salon-wide blended hourly cost — average of effectiveHourlyCost across
 * configured staff. Used for service-level True Profit ranking.
 */
export function blendedHourlyCost(
  staff: StaffCompensation[],
  anchorPricePerHour: number,
  defaults: CompensationDefaults = DEFAULT_COMPENSATION_DEFAULTS,
): number {
  const configured = staff.filter((s) => formatCompensation(s).isConfigured);
  if (configured.length === 0) return defaults.defaultHourlyRate;
  const sum = configured.reduce(
    (acc, s) => acc + effectiveHourlyCost(s, anchorPricePerHour, defaults),
    0,
  );
  return sum / configured.length;
}