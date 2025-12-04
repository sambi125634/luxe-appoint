// Schedule Management Types

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  color: string;
  avatar?: string;
}

export interface WorkingHours {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string;
  endTime: string;
  isWorking: boolean;
}

export interface ScheduleTemplate {
  id: string;
  name: string;
  description: string;
  workingHours: WorkingHours[];
  isDefault?: boolean;
}

export interface StaffSchedule {
  staffId: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  isWorking: boolean;
  templateId?: string;
  note?: string;
}

export interface ScheduleBlock {
  id: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'break' | 'block' | 'training' | 'meeting';
  note?: string;
}

export interface ScheduleGap {
  staffId: string;
  staffName: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

export interface SmartSlot {
  date: string;
  time: string;
  staffId: string;
  staffName: string;
  isRecommended: boolean;
  fillsGap: boolean;
  occupancyBefore: number; // percentage
  occupancyAfter: number; // percentage
}

export interface OccupancyData {
  staffId: string;
  staffName: string;
  date: string;
  occupancyPercent: number;
  totalMinutes: number;
  bookedMinutes: number;
}

// Mock data
export const mockStaffMembers: StaffMember[] = [
  { id: "1", name: "Maria Nowakowska", role: "Kosmetolog", color: "hsl(var(--primary))" },
  { id: "2", name: "Karolina Wiśniewska", role: "Stylistka brwi", color: "hsl(var(--secondary))" },
  { id: "3", name: "Joanna Lewandowska", role: "Masażystka", color: "hsl(var(--accent))" },
  { id: "4", name: "Anna Kowalczyk", role: "Kosmetolog", color: "hsl(var(--chart-1))" },
];

export const defaultTemplates: ScheduleTemplate[] = [
  {
    id: "standard",
    name: "Standardowy",
    description: "Typowy tydzień pracy 9:00-17:00",
    isDefault: true,
    workingHours: [
      { dayOfWeek: 0, startTime: "09:00", endTime: "17:00", isWorking: false },
      { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isWorking: true },
      { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", isWorking: true },
      { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", isWorking: true },
      { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", isWorking: true },
      { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", isWorking: true },
      { dayOfWeek: 6, startTime: "10:00", endTime: "14:00", isWorking: false },
    ],
  },
  {
    id: "wakacyjny",
    name: "Wakacyjny",
    description: "Krótsze godziny w sezonie letnim",
    workingHours: [
      { dayOfWeek: 0, startTime: "10:00", endTime: "14:00", isWorking: false },
      { dayOfWeek: 1, startTime: "10:00", endTime: "16:00", isWorking: true },
      { dayOfWeek: 2, startTime: "10:00", endTime: "16:00", isWorking: true },
      { dayOfWeek: 3, startTime: "10:00", endTime: "16:00", isWorking: true },
      { dayOfWeek: 4, startTime: "10:00", endTime: "16:00", isWorking: true },
      { dayOfWeek: 5, startTime: "10:00", endTime: "14:00", isWorking: true },
      { dayOfWeek: 6, startTime: "10:00", endTime: "14:00", isWorking: false },
    ],
  },
  {
    id: "popoludniowy",
    name: "Popołudniowy",
    description: "Zmiana popołudniowa 12:00-20:00",
    workingHours: [
      { dayOfWeek: 0, startTime: "12:00", endTime: "20:00", isWorking: false },
      { dayOfWeek: 1, startTime: "12:00", endTime: "20:00", isWorking: true },
      { dayOfWeek: 2, startTime: "12:00", endTime: "20:00", isWorking: true },
      { dayOfWeek: 3, startTime: "12:00", endTime: "20:00", isWorking: true },
      { dayOfWeek: 4, startTime: "12:00", endTime: "20:00", isWorking: true },
      { dayOfWeek: 5, startTime: "12:00", endTime: "20:00", isWorking: true },
      { dayOfWeek: 6, startTime: "10:00", endTime: "16:00", isWorking: false },
    ],
  },
  {
    id: "konsultacje",
    name: "Tylko konsultacje",
    description: "Krótkie okno na konsultacje",
    workingHours: [
      { dayOfWeek: 0, startTime: "10:00", endTime: "12:00", isWorking: false },
      { dayOfWeek: 1, startTime: "10:00", endTime: "12:00", isWorking: true },
      { dayOfWeek: 2, startTime: "10:00", endTime: "12:00", isWorking: false },
      { dayOfWeek: 3, startTime: "10:00", endTime: "12:00", isWorking: true },
      { dayOfWeek: 4, startTime: "10:00", endTime: "12:00", isWorking: false },
      { dayOfWeek: 5, startTime: "10:00", endTime: "12:00", isWorking: true },
      { dayOfWeek: 6, startTime: "10:00", endTime: "12:00", isWorking: false },
    ],
  },
];

export const dayNames = ["Nd", "Pon", "Wt", "Śr", "Czw", "Pt", "Sob"];
export const dayNamesFull = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];
