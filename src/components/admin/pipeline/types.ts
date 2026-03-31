export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
  description?: string;
  tooltip?: string;
  emptyMessage?: string;
}

export interface PipelineContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  stageId: string;
  serviceName: string;
  packageType: string;
  totalVisits: number;
  completedVisits: number;
  nextVisitDate?: string;
  lastVisitDate?: string;
  reservationDate: string;
  value: number;
  notes?: string;
  tags: string[];
  surveys: ContactSurvey[];
  history: StageHistory[];
}

export interface ContactSurvey {
  id: string;
  visitNumber: number;
  completed: boolean;
  rating?: number;
  feedback?: string;
  completedAt?: string;
}

export interface StageHistory {
  id: string;
  fromStage: string;
  toStage: string;
  changedAt: string;
  changedBy: string;
  note?: string;
}

export const defaultPipelineStages: PipelineStage[] = [
  {
    id: 'reserved',
    name: 'Zarezerwowane',
    color: 'bg-blue-500',
    order: 1,
    description: 'Czeka na pierwszą wizytę',
    tooltip: 'Klientki które zarezerwowały ale jeszcze nie odbyły pierwszej wizyty. System wyśle potwierdzenie automatycznie.',
    emptyMessage: 'Brak nadchodzących rezerwacji. Udostępnij link do rezerwacji →'
  },
  {
    id: 'no-show',
    name: 'Nie stawiła się',
    color: 'bg-red-500',
    order: 2,
    description: 'Wymaga kontaktu',
    tooltip: 'Klientka nie pojawiła się na wizycie. Działaj szybko — pierwsze 24h są kluczowe dla odzyskania kontaktu.',
    emptyMessage: '🎉 Wszystkie klientki się stawiają!'
  },
  {
    id: 'visit-1-done',
    name: '1. Wizyta ✓',
    color: 'bg-green-500',
    order: 3,
    description: 'Pierwsza wizyta odbyta',
    tooltip: 'Klientka była po raz pierwszy. Teraz najważniejsze — sprawić żeby wróciła. System prowadzi follow-up automatycznie.',
    emptyMessage: 'Czeka na pierwszą ukończoną wizytę'
  },
  {
    id: 'between-1-2',
    name: 'Między 1 a 2',
    color: 'bg-amber-500',
    order: 4,
    description: 'W drodze na drugą wizytę',
    tooltip: 'Klientka po pierwszej wizycie. Statystycznie 60% nie wraca bez dodatkowego impulsu — autopilot to zmienia.',
    emptyMessage: 'Autopilot czeka na klientki z tego etapu'
  },
  {
    id: 'visit-2-done',
    name: '2. Wizyta ✓',
    color: 'bg-green-500',
    order: 5,
    description: 'Wraca — dobry znak',
    tooltip: 'Klientka wróciła po raz drugi. Ryzyko rezygnacji spada o 40%. Cel: doprowadzić ją do 5. wizyty.',
    emptyMessage: 'Czeka na klientki po drugiej wizycie'
  },
  {
    id: 'between-2-3',
    name: 'Między 2 a 3',
    color: 'bg-amber-500',
    order: 6,
    description: 'Budowanie nawyku',
    emptyMessage: 'Autopilot czeka na klientki z tego etapu'
  },
  {
    id: 'visit-3-done',
    name: '3. Wizyta ✓',
    color: 'bg-green-500',
    order: 7,
    description: 'Staje się regularna',
    emptyMessage: 'Czeka na klientki po trzeciej wizycie'
  },
  {
    id: 'between-3-4',
    name: 'Między 3 a 4',
    color: 'bg-amber-500',
    order: 8,
    description: 'Już prawie stała',
    emptyMessage: 'Autopilot czeka na klientki z tego etapu'
  },
  {
    id: 'visit-4-done',
    name: '4. Wizyta ✓',
    color: 'bg-green-500',
    order: 9,
    description: 'Lojalna klientka',
    emptyMessage: 'Czeka na klientki po czwartej wizycie'
  },
  {
    id: 'between-4-5',
    name: 'Między 4 a 5',
    color: 'bg-amber-500',
    order: 10,
    description: 'Ostatni krok',
    emptyMessage: 'Autopilot czeka na klientki z tego etapu'
  },
  {
    id: 'visit-5-done',
    name: '5. Wizyta ✓ — Stała bywalczyni',
    color: 'bg-primary',
    order: 11,
    description: 'Cel osiągnięty 🎉',
    tooltip: 'Gratulacje! Ta klientka jest teraz Twoją stałą bywalczynią. Średnia wartość takiej klientki to 5× więcej niż jednorazowej.',
    emptyMessage: 'Tu pojawią się Twoje stałe bywalczyni'
  },
  {
    id: 'completed',
    name: 'Ukończone',
    color: 'bg-purple-500',
    order: 12,
    description: 'Pełny cykl zakończony',
    emptyMessage: 'Tu pojawią się klientki po ukończeniu pełnego cyklu'
  }
];

// Mock data dla demo
export const mockPipelineContacts: PipelineContact[] = [
  {
    id: '1',
    firstName: 'Anna',
    lastName: 'Kowalska',
    email: 'anna.kowalska@email.com',
    phone: '+48 600 100 200',
    stageId: 'between-1-2',
    serviceName: 'Depilacja laserowa - nogi',
    packageType: 'Pakiet 5 zabiegów',
    totalVisits: 5,
    completedVisits: 1,
    nextVisitDate: '2024-02-15',
    lastVisitDate: '2024-01-20',
    reservationDate: '2024-01-10',
    value: 1500,
    tags: ['VIP', 'Polecenie'],
    surveys: [
      { id: 's1', visitNumber: 1, completed: true, rating: 5, feedback: 'Świetna obsługa!', completedAt: '2024-01-20' }
    ],
    history: [
      { id: 'h1', fromStage: 'reserved', toStage: 'visit-1-done', changedAt: '2024-01-20', changedBy: 'System' },
      { id: 'h2', fromStage: 'visit-1-done', toStage: 'between-1-2', changedAt: '2024-01-20', changedBy: 'System' }
    ]
  },
  {
    id: '2',
    firstName: 'Magdalena',
    lastName: 'Nowak',
    email: 'magda.nowak@email.com',
    phone: '+48 601 200 300',
    stageId: 'reserved',
    serviceName: 'Mezoterapia twarzy',
    packageType: 'Pakiet 3 zabiegów',
    totalVisits: 3,
    completedVisits: 0,
    nextVisitDate: '2024-02-10',
    reservationDate: '2024-02-01',
    value: 900,
    tags: ['Nowy klient'],
    surveys: [],
    history: []
  },
  {
    id: '3',
    firstName: 'Karolina',
    lastName: 'Wiśniewska',
    email: 'karolina.w@email.com',
    phone: '+48 602 300 400',
    stageId: 'no-show',
    serviceName: 'Lifting RF',
    packageType: 'Pakiet 5 zabiegów',
    totalVisits: 5,
    completedVisits: 0,
    nextVisitDate: '2024-01-25',
    reservationDate: '2024-01-15',
    value: 2000,
    tags: ['Wymaga kontaktu'],
    surveys: [],
    history: [
      { id: 'h3', fromStage: 'reserved', toStage: 'no-show', changedAt: '2024-01-25', changedBy: 'System' }
    ]
  },
  {
    id: '4',
    firstName: 'Joanna',
    lastName: 'Dąbrowska',
    email: 'joanna.d@email.com',
    phone: '+48 603 400 500',
    stageId: 'visit-3-done',
    serviceName: 'Depilacja laserowa - bikini',
    packageType: 'Pakiet 5 zabiegów',
    totalVisits: 5,
    completedVisits: 3,
    nextVisitDate: '2024-02-20',
    lastVisitDate: '2024-02-05',
    reservationDate: '2023-12-01',
    value: 1800,
    tags: ['Stały klient'],
    surveys: [
      { id: 's2', visitNumber: 1, completed: true, rating: 5, completedAt: '2023-12-15' },
      { id: 's3', visitNumber: 2, completed: true, rating: 4, completedAt: '2024-01-10' },
      { id: 's4', visitNumber: 3, completed: true, rating: 5, feedback: 'Coraz lepsze efekty!', completedAt: '2024-02-05' }
    ],
    history: []
  },
  {
    id: '5',
    firstName: 'Patrycja',
    lastName: 'Lewandowska',
    email: 'patrycja.l@email.com',
    phone: '+48 604 500 600',
    stageId: 'completed',
    serviceName: 'Peeling kawitacyjny',
    packageType: 'Pakiet 3 zabiegów',
    totalVisits: 3,
    completedVisits: 3,
    lastVisitDate: '2024-01-30',
    reservationDate: '2023-11-15',
    value: 450,
    tags: ['Ukończone', 'Do upsell'],
    surveys: [
      { id: 's5', visitNumber: 1, completed: true, rating: 4, completedAt: '2023-11-25' },
      { id: 's6', visitNumber: 2, completed: true, rating: 5, completedAt: '2023-12-20' },
      { id: 's7', visitNumber: 3, completed: true, rating: 5, feedback: 'Polecam!', completedAt: '2024-01-30' }
    ],
    history: []
  },
  {
    id: '6',
    firstName: 'Natalia',
    lastName: 'Zielińska',
    email: 'natalia.z@email.com',
    phone: '+48 605 600 700',
    stageId: 'between-2-3',
    serviceName: 'Endermologia',
    packageType: 'Pakiet 5 zabiegów',
    totalVisits: 5,
    completedVisits: 2,
    nextVisitDate: '2024-02-18',
    lastVisitDate: '2024-02-01',
    reservationDate: '2024-01-05',
    value: 2500,
    tags: ['Premium'],
    surveys: [
      { id: 's8', visitNumber: 1, completed: true, rating: 5, completedAt: '2024-01-15' },
      { id: 's9', visitNumber: 2, completed: false }
    ],
    history: []
  },
  {
    id: '7',
    firstName: 'Aleksandra',
    lastName: 'Kamińska',
    email: 'ola.k@email.com',
    phone: '+48 606 700 800',
    stageId: 'reserved',
    serviceName: 'Mikrodermabrazja',
    packageType: 'Pakiet 3 zabiegów',
    totalVisits: 3,
    completedVisits: 0,
    nextVisitDate: '2024-02-12',
    reservationDate: '2024-02-05',
    value: 600,
    tags: ['Facebook Ads'],
    surveys: [],
    history: []
  }
];