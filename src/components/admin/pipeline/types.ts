export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
  description?: string;
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
  packageType: string; // np. "Pakiet 3 zabiegów", "Pakiet 5 zabiegów"
  totalVisits: number;
  completedVisits: number;
  nextVisitDate?: string;
  lastVisitDate?: string;
  reservationDate: string;
  value: number; // wartość pakietu
  notes?: string;
  tags: string[];
  surveys: ContactSurvey[];
  history: StageHistory[];
}

export interface ContactSurvey {
  id: string;
  visitNumber: number;
  completed: boolean;
  rating?: number; // 1-5
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

// Domyślne stage'e pipeline'u dla pakietów wizyt
export const defaultPipelineStages: PipelineStage[] = [
  {
    id: 'reserved',
    name: 'Zarezerwowane',
    color: 'bg-blue-500',
    order: 1,
    description: 'Klientka zarezerwowała pierwszą wizytę z Twojej reklamy'
  },
  {
    id: 'no-show',
    name: 'Nie stawił się',
    color: 'bg-red-500',
    order: 2,
    description: 'AI podejmuje próby odzyskania klientki'
  },
  {
    id: 'visit-1-done',
    name: 'Wizyta 1 ✓',
    color: 'bg-green-500',
    order: 3,
    description: 'Pierwsza wizyta zakończona sukcesem'
  },
  {
    id: 'between-1-2',
    name: 'Między 1 a 2',
    color: 'bg-amber-500',
    order: 4,
    description: 'Automatyczny follow-up w toku — dbamy o powrót'
  },
  {
    id: 'visit-2-done',
    name: 'Wizyta 2 ✓',
    color: 'bg-green-500',
    order: 5,
    description: 'Druga wizyta potwierdza zaangażowanie klientki'
  },
  {
    id: 'between-2-3',
    name: 'Między 2 a 3',
    color: 'bg-amber-500',
    order: 6,
    description: 'System buduje lojalność — klientka wraca regularnie'
  },
  {
    id: 'visit-3-done',
    name: 'Wizyta 3 ✓',
    color: 'bg-green-500',
    order: 7,
    description: 'Klientka na dobrej drodze do ukończenia cyklu'
  },
  {
    id: 'between-3-4',
    name: 'Między 3 a 4',
    color: 'bg-amber-500',
    order: 8,
    description: 'Klientka blisko celu — utrzymujemy momentum'
  },
  {
    id: 'visit-4-done',
    name: 'Wizyta 4 ✓',
    color: 'bg-green-500',
    order: 9,
    description: 'Jeszcze jedna wizyta do pełnego sukcesu'
  },
  {
    id: 'between-4-5',
    name: 'Między 4 a 5',
    color: 'bg-amber-500',
    order: 10,
    description: 'Ostatni follow-up przed zakończeniem cyklu'
  },
  {
    id: 'visit-5-done',
    name: 'Wizyta 5 ✓',
    color: 'bg-emerald-600',
    order: 11,
    description: 'Pełny cykl zabiegów ukończony!'
  },
  {
    id: 'completed',
    name: 'Ukończone',
    color: 'bg-purple-500',
    order: 12,
    description: 'Cel osiągnięty — klientka ukończyła pełny cykl zabiegów'
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
