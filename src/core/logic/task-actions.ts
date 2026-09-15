import { addDays, format } from 'date-fns';
import { db } from '../../db/dexie';
import type { Task, TaskPriority } from '../types';
export async function postponeTask(task: Task, daysToAdd: number, reason?: string) {
  const now = new Date();
  const nextDate = addDays(now, daysToAdd);
  const nextDateStr = format(nextDate, 'yyyy-MM-dd');
  const updatedCount = (task.postponementCount || 0) + 1;

  await db.tasks.update(task.id, {
    scheduledDate: nextDateStr,
    postponementCount: updatedCount,
    lastMeaningfulMovementAt: now.toISOString(),
    updatedAt: now.toISOString(),
    syncStatus: 'PENDING_SHEETS',
  });

  await db.taskEvents.add({
    id: crypto.randomUUID(),
    taskId: task.id,
    eventType: 'POSTPONED',
    description: `Adiada em +${daysToAdd} ${daysToAdd === 1 ? 'dia' : 'dias'}${reason ? ` (${reason})` : ''}`,
    metadata: { daysAdded: daysToAdd, postponementCount: updatedCount },
    createdAt: now.toISOString(),
  });
}

export async function setTaskWaiting(task: Task, personId: string, nextFollowUpDate?: string) {
  const now = new Date();
  const followUp = nextFollowUpDate || format(addDays(now, 2), 'yyyy-MM-dd');

  await db.tasks.update(task.id, {
    status: 'WAITING',
    personId,
    waitingSince: now.toISOString(),
    nextFollowUpAt: followUp,
    lastMeaningfulMovementAt: now.toISOString(),
    updatedAt: now.toISOString(),
    syncStatus: 'PENDING_SHEETS',
  });

  await db.taskEvents.add({
    id: crypto.randomUUID(),
    taskId: task.id,
    eventType: 'WAITING_SET',
    description: 'Status alterado para Aguardando retorno',
    metadata: { personId, nextFollowUpAt: followUp },
    createdAt: now.toISOString(),
  });
}

export async function resumeTask(task: Task) {
  const now = new Date();
  await db.tasks.update(task.id, {
    status: 'IN_PROGRESS',
    waitingSince: null,
    nextFollowUpAt: null,
    lastMeaningfulMovementAt: now.toISOString(),
    updatedAt: now.toISOString(),
    syncStatus: 'PENDING_SHEETS',
  });

  await db.taskEvents.add({
    id: crypto.randomUUID(),
    taskId: task.id,
    eventType: 'STARTED',
    description: 'Retomada para execução',
    createdAt: now.toISOString(),
  });
}
