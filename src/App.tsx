import React, { useState, useRef } from 'react';
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
  CheckSquare,
  Clock,
  Download,
  Upload,
  X
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'today' | 'tasks' | 'fronts' | 'ideas' | 'people'>('today');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formulário Unificado de Tarefa
  const [taskTitle, setTaskTitle] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [taskFrontId, setTaskFrontId] = useState<string>('');

  // Formulário Frentes
  const [frontName, setFrontName] = useState('');
  const [frontColor, setFrontColor] = useState('#3b82f6');

  // Formulário Ideias
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaContent, setIdeaContent] = useState('');

  // Formulário Contatos
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactNotes, setContactNotes] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const tasks = useLiveQuery(() => db.tasks.reverse().toArray()) ?? [];
  const fronts = useLiveQuery(() => db.fronts.toArray()) ?? [];
  const ideas = useLiveQuery(() => db.ideas.reverse().toArray()) ?? [];
  const contacts = useLiveQuery(() => db.contacts.reverse().toArray()) ?? [];

  const todayStr = new Date().toISOString().split('T')[0];

  const handleOpenModal = () => {
    if (activeTab === 'today') {
      setTaskDate(todayStr);
    }
    setIsModalOpen(true);
  };

  const handleExportData = async () => {
    try {
      const exportData = {
        version: 2,
        exportedAt: new Date().toISOString(),
        tasks: await db.tasks.toArray(),
        fronts: await db.fronts.toArray(),
        ideas: await db.ideas.toArray(),
        contacts: await db.contacts.toArray(),
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `backup-painel-${todayStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch {
      alert('Falha ao gerar backup.');
    }
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (confirm('Deseja restaurar este backup? Dados existentes serão preservados.')) {
          if (json.tasks?.length) await db.tasks.bulkPut(json.tasks);
          if (json.fronts?.length) await db.fronts.bulkPut(json.fronts);
          if (json.ideas?.length) await db.ideas.bulkPut(json.ideas);
          if (json.contacts?.length) await db.contacts.bulkPut(json.contacts);
          alert('Dados sincronizados com sucesso!');
        }
      } catch {
        alert('Arquivo de backup inválido.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'today' || activeTab === 'tasks') {
      if (!taskTitle.trim()) return;

      await db.tasks.add({
        title: taskTitle.trim(),
        notes: taskNotes.trim() || undefined,
        completed: false,
        dueDate: taskDate || undefined,
        frontId: taskFrontId ? Number(taskFrontId) : undefined,
        createdAt: new Date().toISOString(),
      });

      setTaskTitle('');
      setTaskNotes('');
      setTaskDate('');
      setTaskFrontId('');
    } else if (activeTab === 'fronts') {
      if (!frontName.trim()) return;
      await db.fronts.add({ name: frontName.trim(), color: frontColor });
      setFrontName('');
    } else if (activeTab === 'ideas') {
      if (!ideaTitle.trim()) return;
      await db.ideas.add({
        title: ideaTitle.trim(),
        content: ideaContent.trim(),
        createdAt: new Date().toISOString(),
      });
      setIdeaTitle('');
      setIdeaContent('');
    } else if (activeTab === 'people') {
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
    }

    setIsModalOpen(false);
  };

  const handleToggleTask = async (task: Task) => {
    if (!task.id) return;
    await db.tasks.update(task.id, { completed: !task.completed });
  };

  const handleDeleteTask = async (id?: number) => {
    if (!id) return;
    await db.tasks.delete(id);
  };

  const todayTasks = tasks.filter(t => t.dueDate === todayStr || (!t.dueDate && !t.completed));

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Cabeçalho Limpo com Safe Area */}
      <header className="sticky top-0 z-20 border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md pt-safe px-4 pb-3">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold tracking-tight text-zinc-100">Painel Pessoal</h1>
            <span className="rounded-full bg-zinc-800/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              {activeTab === 'today' && 'Hoje'}
              {activeTab === 'tasks' && 'Tarefas'}
              {activeTab === 'fronts' && 'Frentes'}
              {activeTab === 'ideas' && 'Ideias'}
              {activeTab === 'people' && 'Contatos'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportData}
              title="Exportar"
              className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-300 transition hover:bg-zinc-800 active:scale-95"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Exportar</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Restaurar"
              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition active:scale-95"
            >
              <Upload className="h-3.5 w-3.5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportData}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </header>

      {/* Listagem Pura e Sem Poluição */}
      <main className="flex-1 px-4 py-4 max-w-md mx-auto w-full pb-28">
        
        {/* ================= ABA HOJE ================= */}
        {activeTab === 'today' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider py-1">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-emerald-400" />
                Foco de Hoje
              </span>
              <span className="text-zinc-500">{todayTasks.length} pendentes</span>
            </div>

            {todayTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800/80 p-12 text-center">
                <p className="text-sm font-medium text-zinc-400">Tudo em dia para hoje</p>
                <p className="text-xs text-zinc-600 mt-1">Toque no "+" para registrar uma nova tarefa.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {todayTasks.map(task => {
                  const front = fronts.find(f => f.id === task.frontId);
                  return (
                    <div
                      key={task.id}
                      className="flex flex-col gap-1.5 rounded-xl border border-zinc-800/70 bg-zinc-900/30 p-3.5 transition active:bg-zinc-900/60"
                    >
                      <div className="flex items-center justify-between gap-3">
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
                            {front && (
                              <span 
                                className="w-fit mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-medium"
                                style={{ backgroundColor: `${front.color}22`, color: front.color }}
                              >
                                {front.name}
                              </span>
                            )}
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

                      {task.notes && (
                        <div className="pl-8 pt-1 border-t border-zinc-800/30">
                          <p className="text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed">{task.notes}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= ABA TAREFAS ================= */}
        {activeTab === 'tasks' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider py-1">
              <span>Todas as Tarefas</span>
              <span className="text-zinc-500">{tasks.length} total</span>
            </div>

            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800/80 p-12 text-center">
                <p className="text-sm font-medium text-zinc-400">Nenhuma tarefa cadastrada</p>
                <p className="text-xs text-zinc-600 mt-1">Toque no "+" para registrar.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {tasks.map((task) => {
                  const front = fronts.find(f => f.id === task.frontId);
                  return (
                    <div
                      key={task.id}
                      className="flex flex-col gap-1.5 rounded-xl border border-zinc-800/70 bg-zinc-900/30 p-3.5 transition"
                    >
                      <div className="flex items-center justify-between gap-3">
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
                                  className="px-1.5 py-0.5 rounded text-[10px] font-medium"
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

                      {task.notes && (
                        <div className="pl-8 pt-1 border-t border-zinc-800/30">
                          <p className="text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed">{task.notes}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= ABA FRENTES ================= */}
        {activeTab === 'fronts' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider py-1">
              <span>Frentes & Projetos</span>
              <span className="text-zinc-500">{fronts.length} total</span>
            </div>

            {fronts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800/80 p-12 text-center text-sm text-zinc-500">
                Nenhuma frente cadastrada. Toque no "+" para organizar seus projetos.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {fronts.map((front) => (
                  <div
                    key={front.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-800/70 bg-zinc-900/30 p-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: front.color }} />
                      <span className="text-sm font-medium text-zinc-200">{front.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => front.id && db.fronts.delete(front.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= ABA IDEIAS ================= */}
        {activeTab === 'ideas' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider py-1">
              <span>Caderno de Ideias</span>
              <span className="text-zinc-500">{ideas.length} total</span>
            </div>

            {ideas.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800/80 p-12 text-center text-sm text-zinc-500">
                Nenhum registro ainda. Toque no "+" para capturar ideias rápidas.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {ideas.map((idea) => (
                  <div
                    key={idea.id}
                    className="flex flex-col gap-1.5 rounded-xl border border-zinc-800/70 bg-zinc-900/30 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-medium text-zinc-200">{idea.title}</h3>
                      <button
                        type="button"
                        onClick={() => idea.id && db.ideas.delete(idea.id)}
                        className="p-1 text-zinc-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {idea.content && (
                      <p className="text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed">{idea.content}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= ABA CONTATOS ================= */}
        {activeTab === 'people' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider py-1">
              <span>Diretório de Contatos</span>
              <span className="text-zinc-500">{contacts.length} total</span>
            </div>

            {contacts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800/80 p-12 text-center text-sm text-zinc-500">
                Nenhum contato salvo. Toque no "+" para registrar contatos-chave.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-800/70 bg-zinc-900/30 p-3.5"
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
                      onClick={() => contact.id && db.contacts.delete(contact.id)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Único Botão Flutuante (+) no Canto Inferior Direito */}
      <button
        type="button"
        onClick={handleOpenModal}
        className="fixed bottom-20 right-5 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-950 shadow-lg shadow-black/50 transition active:scale-90"
        title="Adicionar"
      >
        <Plus className="h-6 w-6 stroke-[2.5]" />
      </button>

      {/* Gaveta Modal Padronizada */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm p-0">
          <div 
            className="w-full max-w-md rounded-t-3xl border-t border-zinc-800 bg-zinc-950 p-5 shadow-2xl pb-safe animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {activeTab === 'today' && 'Adicionar ao Dia de Hoje'}
                {activeTab === 'tasks' && 'Nova Tarefa'}
                {activeTab === 'fronts' && 'Nova Frente'}
                {activeTab === 'ideas' && 'Nova Ideia'}
                {activeTab === 'people' && 'Novo Contato'}
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="flex flex-col gap-3">
              {(activeTab === 'today' || activeTab === 'tasks') && (
                <>
                  <input
                    type="text"
                    placeholder="O que precisa ser feito?"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    autoFocus
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-400"
                  />
                  <textarea
                    placeholder="Anotações, links ou detalhes..."
                    rows={3}
                    value={taskNotes}
                    onChange={(e) => setTaskNotes(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-zinc-400 resize-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-semibold text-zinc-500">Data</label>
                      <input
                        type="date"
                        value={taskDate}
                        onChange={(e) => setTaskDate(e.target.value)}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 outline-none [color-scheme:dark]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-semibold text-zinc-500">Frente</label>
                      <select
                        value={taskFrontId}
                        onChange={(e) => setTaskFrontId(e.target.value)}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 outline-none [color-scheme:dark]"
                      >
                        <option value="">Sem frente</option>
                        {fronts.map(f => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'fronts' && (
                <>
                  <input
                    type="text"
                    placeholder="Nome da frente (ex: Recanto, Carreira)"
                    value={frontName}
                    onChange={(e) => setFrontName(e.target.value)}
                    autoFocus
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-400"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-zinc-400">Cor de Identificação:</label>
                    <input
                      type="color"
                      value={frontColor}
                      onChange={(e) => setFrontColor(e.target.value)}
                      className="h-9 w-12 rounded-xl border border-zinc-700 bg-zinc-900 p-1 cursor-pointer"
                    />
                  </div>
                </>
              )}

              {activeTab === 'ideas' && (
                <>
                  <input
                    type="text"
                    placeholder="Título da ideia"
                    value={ideaTitle}
                    onChange={(e) => setIdeaTitle(e.target.value)}
                    autoFocus
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-400"
                  />
                  <textarea
                    placeholder="Anotações e desenvolvimento..."
                    rows={4}
                    value={ideaContent}
                    onChange={(e) => setIdeaContent(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-zinc-400 resize-none"
                  />
                </>
              )}

              {activeTab === 'people' && (
                <>
                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    autoFocus
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-400"
                  />
                  <input
                    type="text"
                    placeholder="Cargo ou papel (ex: Fornecedor, Cerimonialista)"
                    value={contactRole}
                    onChange={(e) => setContactRole(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-400"
                  />
                  <input
                    type="text"
                    placeholder="Telefone ou anotações"
                    value={contactNotes}
                    onChange={(e) => setContactNotes(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-400"
                  />
                </>
              )}

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-zinc-100 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 active:scale-98"
              >
                Salvar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Barra de Navegação Inferior */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-zinc-800/80 bg-zinc-950/95 px-3 pt-2 pb-safe backdrop-blur-lg">
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