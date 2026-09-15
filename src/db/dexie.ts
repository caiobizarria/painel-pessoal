import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { Front, Person, Task, TaskEvent, UserSettings, Idea } from '../core/types';

export class AppDatabase extends Dexie {
  tasks!: Table<Task, string>;
  fronts!: Table<Front, string>;
  people!: Table<Person, string>;
  taskEvents!: Table<TaskEvent, string>;
  settings!: Table<UserSettings, string>;
  ideas!: Table<Idea, string>;

  constructor() {
    super('PainelPessoalDB');
    this.version(1).stores({
      tasks: 'id, frontId, personId, priority, status, scheduledDate, syncStatus, deletedAt, lastMeaningfulMovementAt',
      fronts: 'id, name, deletedAt',
      people: 'id, name, deletedAt',
      taskEvents: 'id, taskId, eventType, createdAt',
      settings: 'userId',
      ideas: 'id, frontId, deletedAt, createdAt',
    });
  }
}

export const db = new AppDatabase();