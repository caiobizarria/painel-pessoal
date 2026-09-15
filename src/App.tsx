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

  // Consulta reativa ao Dexie com fallback seguro
  const tasks = useLiveQuery(async () => {
    try {
      return await db.tasks.reverse().toArray();
    } catch (err) {
      console.error("Erro ao carregar tarefas:", err);
      return [];
    }
  }) ?? [];

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      await db.tasks.add({
        title: newTaskTitle.trim(),
        completed: false,
        dueDate: newTaskDate || undefined,
        createdAt: new Date().toISOString(),
      });
      setNewTaskTitle('');
      setNewTaskDate('');
    } catch (err) {
      console.error("Erro ao adicionar tarefa:", err);
    }
  };

  const handleToggleTask = async (task: Task) => {
    if (!task.id) return;
    try {
      await db.tasks.update(task.id, {
        completed: !task.completed,
      });
    } catch (err) {
      console.error("Erro ao alterar tarefa:", err);
    }
  };

  const handleDeleteTask = async (id?: number) => {
    if (!id) return;
    try {
      await db.tasks.delete(id);
    } catch (err) {
      console.error("Erro ao deletar tarefa:", err);
    }
  };

  // Filtragem rápida se estiver na aba "Hoje"
  const todayStr = new Date().toISOString().split('T')[0];
  const displayedTasks = activeTab === 'today' 
    ? tasks.filter(t => t.dueDate === todayStr || (!t.dueDate && !t.completed))
    : tasks;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Barra de Topo Fixa */}
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <h1 className="text-base font-semibold tracking-tight text-zinc-100">Painel Pessoal</h1>
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-400">
            {activeTab.toUpperCase()}
          </span>
        </div>
      </header>

      {/* Conteúdo Principal com Scroll Livre */}
      <main className="flex-1 px-4 py-5 max-w-md mx-auto w-full pb-32">
        {/* Formulário de Adição de Tarefa */}
        <section className="mb-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 shadow-sm">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">Adicionar Tarefa</h2>
          <form onSubmit={handleAddTask} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="O que precisa ser feito?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-zinc-400"
            />
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={newTaskDate}
                onChange={(e) => setNewTaskDate(e.target.value)}
                className="flex-1 rounded-xl border border-zinc-700/80 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-400 [color-scheme:dark]"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-1 rounded-xl bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-950 shadow transition hover:bg-zinc-200 active:scale-95"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                Salvar
              </button>
            </div>
          </form>
        </section>

        {/* Listagem de Tarefas */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {activeTab === 'today' ? 'Tarefas para Hoje' : 'Todas as Tarefas'}
            </h2>
            <span className="text-xs text-zinc-500">{displayedTasks.length} itens</span>
          </div>

          <div className="flex flex-col gap-2">
            {displayedTasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
                Nenhum item cadastrado no momento.
              </div>
            ) : (
              displayedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5 transition active:bg-zinc-900/70"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleTask(task)}
                    className="flex flex-1 items-center gap-3 text-left overflow-hidden"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-zinc-600 shrink-0" />
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className={`text-sm truncate ${task.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                        {task.title}
                      </span>
                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-0.5">
                          <Calendar className="h-3 w-3 shrink-0" />
                          <span>{task.dueDate}</span>
                        </div>
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 text-zinc-500 transition hover:text-rose-400 active:scale-95"
                    aria-label="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Barra de Navegação Inferior Fixa */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-zinc-800/80 bg-zinc-950/95 px-3 py-2 backdrop-blur-lg pb-safe">
        <div className="mx-auto flex max-w-md items-center justify-around">
          <button
            type="button"
            onClick={() => setActiveTab('today')}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition ${
              activeTab === 'today' ? 'text-zinc-100' : 'text-zinc-500'
            }`}
          >
            <Calendar className="h-5 w-5" />
            Hoje
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition ${
              activeTab === 'tasks' ? 'text-zinc-100' : 'text-zinc-500'
            }`}
          >
            <CheckSquare className="h-5 w-5" />
            Tarefas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fronts')}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition ${
              activeTab === 'fronts' ? 'text-zinc-100' : 'text-zinc-500'
            }`}
          >
            <FolderKanban className="h-5 w-5" />
            Frentes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ideas')}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition ${
              activeTab === 'ideas' ? 'text-zinc-100' : 'text-zinc-500'
            }`}
          >
            <Lightbulb className="h-5 w-5" />
            Ideias
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('people')}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition ${
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