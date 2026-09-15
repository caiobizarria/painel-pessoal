export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'WAITING' | 'COMPLETED';
export type SyncStatus = 'SYNCED' | 'PENDING_SHEETS' | 'ERROR_SHEETS';

export type EventType =
  | 'CREATED'
  | 'EDITED'
  | 'PRIORITY_CHANGED'
  | 'DATE_CHANGED'
  | 'STARTED'
  | 'WAITING_SET'
  | 'FOLLOW_UP_SENT'
  | 'POSTPONED'
  | 'CONVERTED_TO_IDEA'
  | 'CONVERTED_TO_TASK'
  | 'COMPLETED'
  | 'REOPENED'
  | 'DISCARDED';

export interface Front {
  id: string;
  userId: string;
  name: string;
  emoji: string;
  color: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Person {
  id: string;
  userId: string;
  name: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Task {
  id: string;
  userId: string;
  frontId?: string | null;
  personId?: string | null;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  scheduledDate?: string | null;
  nextReviewAt?: string | null;
  lastMeaningfulMovementAt: string;
  waitingSince?: string | null;
  nextFollowUpAt?: string | null;
  lastFollowUpAt?: string | null;
  postponementCount: number;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  syncStatus: SyncStatus;
  lastSyncedAt?: string | null;
}

export interface TaskEvent {
  id: string;
  taskId: string;
  eventType: EventType;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Idea {
  id: string;
  userId: string;
  frontId?: string | null;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  convertedToTaskId?: string | null;
}

export interface UserSettings {
  userId: string;
  agingLowWarningDays: number;
  agingLowCriticalDays: number;
  agingMediumWarningDays: number;
  agingMediumCriticalDays: number;
  agingHighWarningDays: number;
  agingHighCriticalDays: number;
  briefingTime: string;
  notificationsEnabled: boolean;
  googleSheetsId?: string;
  lastBackupAt?: string;
}

export const DEFAULT_SETTINGS: UserSettings = {
  userId: 'default',
  agingLowWarningDays: 7,
  agingLowCriticalDays: 21,
  agingMediumWarningDays: 4,
  agingMediumCriticalDays: 14,
  agingHighWarningDays: 2,
  agingHighCriticalDays: 7,
  briefingTime: '08:00',
  notificationsEnabled: true,
};