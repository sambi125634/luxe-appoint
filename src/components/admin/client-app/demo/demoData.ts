export const DEMO_STATS = {
  appUsers: 47,
  activeLastMonth: 31,
  bookingsFromApp: 89,
  avgRating: 4.8,
  totalReviews: 23,
  vipClients: 8,
  activeCoupons: 12,
  referralsCompleted: 6,
  pushOpenRate: 68,
};

export const DEMO_ACTIVITY_CHART = [3, 7, 4, 9, 5, 8, 6];

export const DEMO_GALLERY = [
  { id: '1', url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400', category: 'portfolio', caption: 'Manicure hybrydowy', is_active: true, display_order: 1 },
  { id: '2', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400', category: 'salon', caption: 'Nasz salon', is_active: true, display_order: 2 },
  { id: '3', url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400', category: 'portfolio', caption: 'Stylizacja rzęs', is_active: true, display_order: 3 },
  { id: '4', url: 'https://images.unsplash.com/photo-1487412947147-5cebf100d293?w=400', category: 'team', caption: 'Nasz zespół', is_active: true, display_order: 4 },
  { id: '5', url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400', category: 'portfolio', caption: 'Pedicure SPA', is_active: true, display_order: 5 },
  { id: '6', url: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400', category: 'before_after', caption: 'Przed i po zabiegu', is_active: true, display_order: 6 },
];

export const DEMO_LOYALTY_REWARDS = [
  { id: '1', name: 'Darmowy manicure klasyczny', points_required: 300, reward_type: 'free_service', reward_value: null, is_active: true, description: null },
  { id: '2', name: '20% zniżki na dowolny zabieg', points_required: 200, reward_type: 'discount', reward_value: 20, is_active: true, description: null },
  { id: '3', name: 'Darmowe stylizacje brwi', points_required: 150, reward_type: 'free_service', reward_value: null, is_active: false, description: null },
];

export const DEMO_TOP_CLIENTS = [
  { name: 'Karolina W.', visits: 14, spent: 2340, isVip: true, lastVisit: '2025-04-08' },
  { name: 'Marta K.', visits: 11, spent: 1890, isVip: true, lastVisit: '2025-04-05' },
  { name: 'Anna P.', visits: 9, spent: 1450, isVip: true, lastVisit: '2025-04-01' },
  { name: 'Zofia R.', visits: 7, spent: 980, isVip: false, lastVisit: '2025-03-28' },
  { name: 'Ewa M.', visits: 6, spent: 870, isVip: false, lastVisit: '2025-03-22' },
];

export const DEMO_PUSH_HISTORY = [
  { id: '1', title: 'Promocja weekendowa 🌸', body: 'Manicure hybrydowy -20% tylko w ten weekend!', sent_at: '2025-04-05', recipients_count: 47, opened_count: 32, segment: 'all' },
  { id: '2', title: 'Zwolnił się termin ⚡', body: 'Mamy wolne miejsce jutro o 14:30!', sent_at: '2025-04-03', recipients_count: 23, opened_count: 19, segment: 'vip' },
  { id: '3', title: 'Nowe usługi w ofercie ✨', body: 'Sprawdź nasze nowe zabiegi na wiosnę', sent_at: '2025-03-28', recipients_count: 47, opened_count: 25, segment: 'all' },
];

export const DEMO_BRANDING = {
  primary_color: '#D4537E',
  salon_name: 'Salon Piękności Bella',
  description: 'Twoje miejsce relaksu i piękna w centrum miasta 🌸',
  logo_url: null as string | null,
};

export const DEMO_BIRTHDAY_CONFIG = {
  is_active: true,
  discount_type: 'percentage' as const,
  discount_value: 15,
  send_days_before: 3,
  coupon_valid_days: 14,
  message_template: 'Z okazji Twoich urodzin przygotowałyśmy dla Ciebie wyjątkowy prezent! 🎂',
};

export const COLOR_PRESETS = ['#D4537E', '#7F77DD', '#E24B4A', '#1D9E75', '#378ADD', '#BA7517', '#2C2C2A'];
