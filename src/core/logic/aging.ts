import { differenceInCalendarDays, parseISO } from 'date-fns';
import type { Task, UserSettings } from '../types';

export type AgingLevel = 'NORMAL' | 'WARNING' | 'CRITICAL';

export interface AgingInfo {
  daysIdle: number;
  level: AgingLevel;
  label: string;
}

export function calculateTaskAging(
  task: Task,
  settings: UserSettings,
  referenceDate: Date = new Date()
): AgingInfo {
  if (task.status === 'WAITING' || task.status === 'COMPLETED') {
    return { daysIdle: 0, level: 'NORMAL', label: '' };
  }

  const lastMovement = parseISO(task.lastMeaningfulMovementAt);
  const daysIdle = Math.max(0, differenceInCalendarDays(referenceDate, lastMovement));

  let warningThreshold = settings.agingMediumWarningDays;
  let criticalThreshold = settings.agingMediumCriticalDays;

  if (task.priority === 'HIGH') {
    warningThreshold = settings.agingHighWarningDays;
    criticalThreshold = settings.agingHighCriticalDays;
  } else if (task.priority === 'LOW') {
    warningThreshold = settings.agingLowWarningDays;
    criticalThreshold = settings.agingLowCriticalDays;
  }

  if (daysIdle >= criticalThreshold) {
    return {
      daysIdle,
      level: 'CRITICAL',
      label: `Parada há ${daysIdle} dias (Crítico)`,
    };
  }

  if (daysIdle >= warningThreshold) {
    return {
      daysIdle,
      level: 'WARNING',
      label: `Parada há ${daysIdle} dias`,
    };
  }

  return {
    daysIdle,
    level: 'NORMAL',
    label: daysIdle === 0 ? 'Movimentada hoje' : `Parada há ${daysIdle} dias`,
  };
}