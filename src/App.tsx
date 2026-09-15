import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Task, type Front, type Idea, type Contact } from './core/db/schema';
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Plus, 
  Trash2, 
  FolderKanban, 
  Lightbulb, 
  Users, 
  CheckSquare,
  Clock,
  Tag
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'today' | 'tasks' | 'fronts' | 'ideas' | 'people'>('today');

  // --- Estados de Formulários ---
  // Tarefas
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [taskFrontId, setTaskFrontId] = useState<string>('');

  // Frentes
  const [frontName, setFrontName] = useState('');
  const [frontColor, setFrontColor] = useState('#3b82f6');

  // Ideias
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaContent, setIdeaContent] = useState('');

  // Contatos
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactNotes, setContactNotes] = useState('');

  // --- Consultas reativas ao Dexie ---
  const tasks = useLiveQuery(() => db.tasks.reverse().toArray()) ?? [];
  const fronts = useLiveQuery(() => db.fronts.toArray()) ?? [];
  const ideas = useLiveQuery(() => db.ideas.reverse().toArray()) ?? [];
  const contacts = useLiveQuery(() => db.contacts.reverse().toArray()) ?? [];

  // Data de hoje formatada (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

  // --- Handlers Tarefas ---
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    await db.tasks.add({
      title: taskTitle.trim(),
      completed: false,
      dueDate: taskDate || undefined,
      frontId: taskFrontId ? Number(taskFrontId) : undefined,
      createdAt: new Date().toISOString(),
    });

    setTaskTitle('');
    setTaskDate('');
    setTaskFrontId('');
  };

  const handleToggleTask = async (task: Task) => {
    if (!task.id) return;
    await db.tasks.update(task.id, { completed: !task.completed });
  };

  const handleDeleteTask = async (id?: number) => {
    if (!id) return;
    await db.tasks.delete(id);
  };

  // --- Handlers Frentes ---
  const handleAddFront = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontName.trim()) return;

    await db.fronts.add({
      name: frontName.trim(),
      color: frontColor,
    });

    setFrontName('');
  };

  const handleDeleteFront = async (id?: number) => {
    if (!id) return;
    await db.fronts.delete(id);
  };

  // --- Handlers Ideias ---
  const handleAddIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaTitle.trim()) return;

    await db.ideas.add({
      title: ideaTitle.trim(),
      content: ideaContent.trim(),
      createdAt: new Date().toISOString(),
    });

    setIdeaTitle('');
    setIdeaContent('');
  };

  const handleDeleteIdea = async (id?: number) => {
    if (!id) return;
    await db.ideas.delete(id);
  };

  // --- Handlers Contatos ---
  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim()) return;

    await db.contacts.add({
      name: contactName.trim(),
      role: contactRole.trim(),
      notes: contactNotes.trim(),
      createdAt: new Date().toISOString(),
    });

    setContactName('');
    setContactRole('');
    setContactNotes('');
  };

  const handleDeleteContact = async (id?: number) => {
    if (!id) return;
    await db.contacts.delete(id);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Barra de Topo Fixa */}
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <h1 className="text-base font-semibold tracking-tight text-zinc-100">Painel Pessoal</h1>
          <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            {activeTab === 'today' && 'Hoje'}
            {activeTab === 'tasks' && 'Tarefas'}
            {activeTab === 'fronts' && 'Frentes'}
            {activeTab === 'ideas' && 'Ideias'}
            {activeTab === 'people' && 'Contatos'}
          </span>
        </div>
      </header>

      {/* Conteúdo Central Variável de acordo com a Aba */}
      <main className="flex-1 px-4 py-4 max-w-md mx-auto w-full pb-28">
        
        {/* ================= ABA HOJE ================= */}
        {activeTab === 'today' && (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                <Clock className="h-4 w-4 text-emerald-400" />
                Foco do Dia
              </div>
              <p className="mt-1 text-xs text-zinc-500">Tarefas agendadas para hoje ou pendentes prioritárias.</p>
            </div>

            <div className="flex flex-col gap-2">
              {tasks.filter(t => t.dueDate === todayStr || (!t.dueDate && !t.completed)).length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
                  Tudo limpo para hoje! Nenhuma pendência imediata.
                </div>
              ) : (
                tasks
                  .filter(t => t.dueDate === todayStr || (!t.dueDate && !t.completed))
                  .map(task => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5"
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
                        <span className={`text-sm truncate ${task.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                          {task.title}
                        </span>
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* ================= ABA TAREFAS ================= */}
        {activeTab === 'tasks' && (
          <div className="flex flex-col gap-5">
            <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">Nova Tarefa</h2>
              <form onSubmit={handleAddTask} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="O que precisa ser feito?"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-400"
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Data</label>
                    <input
                      type="date"
                      value={taskDate}
                      onChange={(e) => setTaskDate(e.target.value)}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 outline-none [color-scheme:dark]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Frente</label>
                    <select
                      value={taskFrontId}
                      onChange={(e) => setTaskFrontId(e.target.value)}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none [color-scheme:dark]"
                    >
                      <option value="">Sem frente</option>
                      {fronts.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-1 flex items-center justify-center gap-1.5 rounded-xl bg-zinc-100 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 active:scale-95"
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  Adicionar Tarefa
                </button>
              </form>
            </section>

            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                <span>Lista Geral</span>
                <span>{tasks.length} total</span>
              </div>

              {tasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
                  Nenhuma tarefa registrada.
                </div>
              ) : (
                tasks.map((task) => {
                  const front = fronts.find(f => f.id === task.frontId);
                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5 transition"
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
                          <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                            {task.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {task.dueDate}
                              </span>
                            )}
                            {front && (
                              <span 
                                className="px-1.5 py-0.2 rounded text-[10px] font-medium"
                                style={{ backgroundColor: `${front.color}22`, color: front.color }}
                              >
                                {front.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </section>
          </div>
        )}

        {/* ================= ABA FRENTES ================= */}
        {activeTab === 'fronts' && (
          <div className="flex flex-col gap-5">
            <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">Nova Frente / Projeto</h2>
              <form onSubmit={handleAddFront} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Nome da frente (ex: Recanto, Carreira, Pessoal)"
                  value={frontName}
                  onChange={(e) => setFrontName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-400"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={frontColor}
                    onChange={(e) => setFrontColor(e.target.value)}
                    className="h-10 w-14 rounded-xl border border-zinc-700 bg-zinc-900 p-1 cursor-pointer"
                  />
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-zinc-100 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 active:scale-95"
                  >
                    Criar Frente
                  </button>
                </div>
              </form>
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Frentes Ativas</h2>
              {fronts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
                  Nenhuma frente criada. Agrupe suas tarefas por projetos.
                </div>
              ) : (
                fronts.map((front) => (
                  <div
                    key={front.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: front.color }} />
                      <span className="text-sm font-medium text-zinc-200">{front.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteFront(front.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </section>
          </div>
        )}

        {/* ================= ABA IDEIAS ================= */}
        {activeTab === 'ideas' && (
          <div className="flex flex-col gap-5">
            <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">Captura de Ideia</h2>
              <form onSubmit={handleAddIdea} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Título ou tema central"
                  value={ideaTitle}
                  onChange={(e) => setIdeaTitle(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-400"
                />
                <textarea
                  placeholder="Detalhes ou anotação rápida..."
                  rows={3}
                  value={ideaContent}
                  onChange={(e) => setIdeaContent(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-400 resize-none"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-100 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 active:scale-95"
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  Salvar Ideia
                </button>
              </form>
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Caderno de Ideias</h2>
              {ideas.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
                  Nenhuma ideia anotada ainda.
                </div>
              ) : (
                ideas.map((idea) => (
                  <div
                    key={idea.id}
                    className="flex flex-col gap-1.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-medium text-zinc-200">{idea.title}</h3>
                      <button
                        type="button"
                        onClick={() => handleDeleteIdea(idea.id)}
                        className="p-1 text-zinc-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {idea.content && (
                      <p className="text-xs text-zinc-400 whitespace-pre-wrap">{idea.content}</p>
                    )}
                  </div>
                ))
              )}
            </section>
          </div>
        )}

        {/* ================= ABA CONTATOS ================= */}
        {activeTab === 'people' && (
          <div className="flex flex-col gap-5">
            <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">Novo Contato</h2>
              <form onSubmit={handleAddContact} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Nome"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-400"
                />
                <input
                  type="text"
                  placeholder="Papel / Cargo / Contexto (ex: Fornecedor, Cliente)"
                  value={contactRole}
                  onChange={(e) => setContactRole(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-400"
                />
                <input
                  type="text"
                  placeholder="Notas adicionais ou telefone"
                  value={contactNotes}
                  onChange={(e) => setContactNotes(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-400"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-100 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 active:scale-95"
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  Salvar Contato
                </button>
              </form>
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Diretório de Contatos</h2>
              {contacts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
                  Nenhum contato salvo ainda.
                </div>
              ) : (
                contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3.5"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-zinc-200">{contact.name}</span>
                      {contact.role && (
                        <span className="text-xs text-zinc-400">{contact.role}</span>
                      )}
                      {contact.notes && (
                        <span className="text-[11px] text-zinc-500 mt-0.5">{contact.notes}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteContact(contact.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </section>
          </div>
        )}

      </main>

      {/* Barra de Navegação Inferior Fixa */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-zinc-800/80 bg-zinc-950/95 px-3 py-2 backdrop-blur-lg">
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