import { format } from 'date-fns';
import type { Task, UserSettings } from '../types';
import { calculateTaskAging } from './aging';

export interface TodayBriefing {
  followUpsDue: Task[];
  dueToday: Task[];
  overdue: Task[];
  criticalAging: Task[];
  warningAging: Task[];
  summaryText: string;
  totalActionRequired: number;
}

export function compileTodayBriefing(tasks: Task[], settings: UserSettings, today: Date = new Date()): TodayBriefing {
  const todayStr = format(today, 'yyyy-MM-dd');
  const activeTasks = tasks.filter(t => !t.deletedAt && t.status !== 'COMPLETED');

  const followUpsDue: Task[] = [];
  const dueToday: Task[] = [];
  const overdue: Task[] = [];
  const criticalAging: Task[] = [];
  const warningAging: Task[] = [];

  for (const task of activeTasks) {
    if (task.status === 'WAITING') {
      if (task.nextFollowUpAt && task.nextFollowUpAt <= todayStr) {
        followUpsDue.push(task);
      }
      continue;
    }

    if (task.scheduledDate && task.scheduledDate > todayStr) {
      continue;
    }

    if (task.scheduledDate) {
      if (task.scheduledDate === todayStr) {
        dueToday.push(task);
      } else if (task.scheduledDate < todayStr) {
        overdue.push(task);
      }
      continue;
    }

    const aging = calculateTaskAging(task, settings, today);
    if (aging.level === 'CRITICAL') {
      criticalAging.push(task);
    } else if (aging.level === 'WARNING') {
      warningAging.push(task);
    }
  }

  const totalActionRequired = followUpsDue.length + dueToday.length + overdue.length + criticalAging.length;

  let summaryText = 'Tudo em ordem no momento.';
  if (totalActionRequired > 0) {
    summaryText = `${totalActionRequired} ${totalActionRequired === 1 ? 'atividade precisa' : 'atividades precisam'} da sua atenção hoje.`;
  }

  return { followUpsDue, dueToday, overdue, criticalAging, warningAging, summaryText, totalActionRequired };
}