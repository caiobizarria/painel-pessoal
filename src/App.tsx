import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Task } from './core/db/schema';
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Plus, 
  Trash2, 
  FolderKanban, 
  Lightbulb, 
  Users, 
  CheckSquare 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'today' | 'tasks' | 'fronts' | 'ideas' | 'people'>('tasks');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');

  const tasks = useLiveQuery(() => db.tasks.toArray()) ?? [];

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await db.tasks.add({
      title: newTaskTitle.trim(),
      completed: false,
      dueDate: newTaskDate || undefined,
      createdAt: new Date().toISOString(),
    });

    setNewTaskTitle('');
    setNewTaskDate('');
  };

  const handleToggleTask = async (task: Task) => {
    if (!task.id) return;
    await db.tasks.update(task.id, {
      completed: !task.completed,
    });
  };

  const handleDeleteTask = async (id?: number) => {
    if (!id) return;
    await db.tasks.delete(id);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/80 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <h1 className="text-base font-semibold tracking-tight text-zinc-100">Painel Pessoal</h1>
          <span className="text-xs font-medium text-zinc-500">Local-First</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-4 max-w-md mx-auto w-full pb-24">
        {/* Formulário de Adição Rápida de Tarefa */}
        <section className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 shadow-sm">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">Nova Tarefa</h2>
          <form onSubmit={handleAddTask} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="O que precisa ser feito?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-zinc-500"
            />
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="date"
                  value={newTaskDate}
                  onChange={(e) => setNewTaskDate(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-500 [color-scheme:dark]"
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-1.5 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </button>
            </div>
          </form>
        </section>

        {/* Lista de Tarefas */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Tarefas Cadastradas</h2>
            <span className="text-xs text-zinc-500">{tasks.length} total</span>
          </div>

          <div className="flex flex-col gap-2">
            {tasks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
                Nenhuma tarefa pendente.
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 transition hover:border-zinc-700"
                >
                  <button
                    onClick={() => handleToggleTask(task)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-zinc-600 shrink-0" />
                    )}
                    <div className="flex flex-col">
                      <span className={`text-sm font-medium ${task.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                        {task.title}
                      </span>
                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-xs text-zinc-400 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          <span>{task.dueDate}</span>
                        </div>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="rounded-md p-1 text-zinc-500 transition hover:bg-zinc-800 hover:text-rose-400"
                    title="Excluir tarefa"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Bottom Navigation (Mobile Bar) */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-zinc-800 bg-zinc-950/90 px-4 py-2 backdrop-blur-lg">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition ${
              activeTab === 'today' ? 'text-zinc-100' : 'text-zinc-500'
            }`}
          >
            <Calendar className="h-5 w-5" />
            Hoje
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition ${
              activeTab === 'tasks' ? 'text-zinc-100' : 'text-zinc-500'
            }`}
          >
            <CheckSquare className="h-5 w-5" />
            Tarefas
          </button>
          <button
            onClick={() => setActiveTab('fronts')}
            className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition ${
              activeTab === 'fronts' ? 'text-zinc-100' : 'text-zinc-500'
            }`}
          >
            <FolderKanban className="h-5 w-5" />
            Frentes
          </button>
          <button
            onClick={() => setActiveTab('ideas')}
            className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition ${
              activeTab === 'ideas' ? 'text-zinc-100' : 'text-zinc-500'
            }`}
          >
            <Lightbulb className="h-5 w-5" />
            Ideias
          </button>
          <button
            onClick={() => setActiveTab('people')}
            className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-medium transition ${
              activeTab === 'people' ? 'text-zinc-100' : 'text-zinc-500'
            }`}
          >
            <Users className="h-5 w-5" />
            Contatos
          </button>
        </div>
      </nav>
    </div>
  );
}