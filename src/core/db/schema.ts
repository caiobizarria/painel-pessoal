import Dexie, { type Table } from 'dexie';

export type CriticalityLevel = 'baixa' | 'media' | 'alta';

export interface Task {
  id?: number;
  title: string;
  notes?: string;
  frontId?: number;
  completed: boolean;
  dueDate?: string;
  criticality?: CriticalityLevel;
  pinned?: boolean;
  order?: number;
  createdAt: string;
}

export interface Front {
  id?: number;
  name: string;
  color: string;
}

export interface Idea {
  id?: number;
  title: string;
  content: string;
  createdAt: string;
}

export interface DebtCollection {
  id?: number;
  contactName: string;
  phone: string;
  reason: string;
  details?: string;
  amount?: string;
  dueDate?: string;
  status: 'pendente' | 'cobrado' | 'resolvido';
  createdAt: string;
}

export interface MonthlySchedule {
  id?: number;
  monthKey: string; // formato YYYY-MM
  rawText: string;
  updatedAt: string;
}

export class PersonalDatabase extends Dexie {
  tasks!: Table<Task>;
  fronts!: Table<Front>;
  ideas!: Table<Idea>;
  collections!: Table<DebtCollection>;
  schedules!: Table<MonthlySchedule>;

  constructor() {
    super('PersonalDatabase');
    this.version(1).stores({
      tasks: '++id, title, frontId, completed, dueDate, createdAt',
      fronts: '++id, name, color',
      ideas: '++id, title, createdAt',
      contacts: '++id, name, role, createdAt',
    });
    this.version(2).stores({
      tasks: '++id, title, notes, frontId, completed, dueDate, createdAt',
    });
    this.version(3).stores({
      tasks: '++id, title, notes, frontId, completed, dueDate, criticality, createdAt',
    });
    this.version(4).stores({
      collections: '++id, contactName, phone, status, dueDate, createdAt',
    });
    this.version(5).stores({
      tasks: '++id, title, notes, frontId, completed, dueDate, criticality, pinned, order, createdAt',
    });
    // Versão 6: Tabela para histórico mensal da Agenda (Ctrl+C / Ctrl+V livre)
    this.version(6).stores({
      schedules: '++id, &monthKey, updatedAt',
    });
  }
}

export const db = new PersonalDatabase();