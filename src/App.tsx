import React, { useState, useEffect, useRef } from 'react';
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
  Download,
  Upload,
  X,
  Search,
  Edit3,
  FastForward,
  AlertCircle
} from 'lucide-react';

// Função utilitária para adicionar dias a uma data (YYYY-MM-DD)
function addDaysToDate(baseDateStr: string | undefined, daysToAdd: number): string {
  const base = baseDateStr ? new Date(`${baseDateStr}T12:00:00`) : new Date();
  base.setDate(base.getDate() + daysToAdd);
  return base.toISOString().split('T')[0];
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'today' | 'tasks' | 'fronts' | 'ideas' | 'people'>('today');
  
  // Modais de Criação / Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingFrontId, setEditingFrontId] = useState<number | null>(null);

  // Busca e Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFrontFilter, setSelectedFrontFilter] = useState<number | 'all'>('all');

  // Formulário Tarefa
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

  // --- Seed Automático de Atividades Legadas ---
  useEffect(() => {
    const seedLegacyData = async () => {
      const existingTasksCount = await db.tasks.count();
      if (existingTasksCount > 0) return;

      const fCidadeId = await db.fronts.add({ name: '🎸 Cidade Dormitório', color: '#ec4899' }) as number;
      const fPetraId = await db.fronts.add({ name: 'Petra', color: '#3b82f6' }) as number;
      const fAirbnbId = await db.fronts.add({ name: '🏡 Airbnb', color: '#10b981' }) as number;
      const fPessoalId = await db.fronts.add({ name: 'Pessoal', color: '#f59e0b' }) as number;

      const legacyItems: Array<{ title: string; frontId?: number; dueDate?: string }> = [
        { title: 'Hospedagem bananada recibo', frontId: fCidadeId, dueDate: '2026-09-01' },
        { title: 'Falar com Rodolfo e clovis leads', frontId: fPetraId, dueDate: '2026-09-01' },
        { title: 'Acompanhar Meta', frontId: fCidadeId, dueDate: '2026-09-01' },
        { title: 'Arrumar outdoor adezam', frontId: fPetraId, dueDate: '2026-09-01' },
        { title: 'Portabilidade investimento XP', dueDate: '2026-09-01' },
        { title: 'Casa natura dia 03', dueDate: '2026-09-03' },
        { title: 'Aumento demanda airbnb', frontId: fAirbnbId, dueDate: '2026-09-06' },
        { title: 'Finalizar edital', frontId: fCidadeId },
        { title: 'Fazer mais folhetos Petra A4', frontId: fPetraId },
        { title: 'Fazer app to do list' },
        { title: 'Flavia - Projeto casas Petra', frontId: fPetraId },
        { title: 'IBRESP' },
        { title: 'Locais ação SJC', frontId: fPetraId },
        { title: 'Pintura' },
        { title: 'Arrumar maquete', frontId: fPetraId },
        { title: 'Planilha orçamento salão' },
        { title: 'Placa administrativo', frontId: fPetraId },
        { title: 'Ajustar layout stand', frontId: fPetraId },
        { title: 'Treinar teclado ou jam', frontId: fPessoalId },
        { title: 'Levar urina 24h', frontId: fPessoalId },
        { title: 'Enviar nota bigberg' },
        { title: 'Melhorar app life logger - colocar alerta' },
        { title: 'Basquete ou corrida ou acad', frontId: fPessoalId },
        { title: 'Cobrar Joilson', frontId: fCidadeId },
        { title: 'Feira', frontId: fPessoalId },
        { title: 'Conta de luz Serasa', frontId: fPessoalId },
        { title: 'Viagens' },
        { title: 'Traking' },
        { title: 'Aparecida viagem' },
        { title: 'Corrida eu na montanha dia 27 de setembro', frontId: fPetraId, dueDate: '2026-09-27' },
        { title: 'Calculo life logger', frontId: fPessoalId },
        { title: 'Serassa', frontId: fPessoalId },
        { title: 'Documentos creci', frontId: fPessoalId },
        { title: 'Folhetos construvale/blacknovember', frontId: fPetraId },
        { title: 'Book construvale/stand 10 unid' },
        { title: 'Fotos mudas/placas evento', frontId: fPetraId },
        { title: 'Video evento' }
      ];

      for (const item of legacyItems) {
        await db.tasks.add({
          title: item.title,
          frontId: item.frontId,
          dueDate: item.dueDate,
          completed: false,
          createdAt: new Date().toISOString()
        });
      }
    };

    seedLegacyData();
  }, []);

  // Abrir Modal para Criar
  const handleOpenCreateModal = () => {
    setEditingTaskId(null);
    setEditingFrontId(null);
    setTaskTitle('');
    setTaskNotes('');
    setTaskDate(activeTab === 'today' ? todayStr : '');
    setTaskFrontId('');
    setFrontName('');
    setFrontColor('#3b82f6');
    setIdeaTitle('');
    setIdeaContent('');
    setContactName('');
    setContactRole('');
    setContactNotes('');
    setIsModalOpen(true);
  };

  // Abrir Modal para Editar Tarefa
  const handleEditTask = (task: Task) => {
    if (!task.id) return;
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskNotes(task.notes || '');
    setTaskDate(task.dueDate || '');
    setTaskFrontId(task.frontId ? String(task.frontId) : '');
    setIsModalOpen(true);
  };

  // Adiar/Prorrogar Validade (+1, +3 ou +5 dias)
  const handleSnoozeTask = async (e: React.MouseEvent, task: Task, days: number) => {
    e.stopPropagation();
    if (!task.id) return;
    // Se a tarefa já está atrasada ou sem data, conta a partir de hoje; senão, soma ao prazo atual
    const baseDate = (task.dueDate && task.dueDate >= todayStr) ? task.dueDate : todayStr;
    const newDueDate = addDaysToDate(baseDate, days);
    
    await db.tasks.update(task.id, {
      dueDate: newDueDate,
      completed: false
    });
  };

  // Abrir Modal para Editar Frente
  const handleEditFront = (front: Front) => {
    if (!front.id) return;
    setEditingFrontId(front.id);
    setFrontName(front.name);
    setFrontColor(front.color);
    setIsModalOpen(true);
  };

  // Salvar (Criação ou Edição)
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'today' || activeTab === 'tasks') {
      if (!taskTitle.trim()) return;

      if (editingTaskId) {
        await db.tasks.update(editingTaskId, {
          title: taskTitle.trim(),
          notes: taskNotes.trim() || undefined,
          dueDate: taskDate || undefined,
          frontId: taskFrontId ? Number(taskFrontId) : undefined,
        });
      } else {
        await db.tasks.add({
          title: taskTitle.trim(),
          notes: taskNotes.trim() || undefined,
          completed: false,
          dueDate: taskDate || undefined,
          frontId: taskFrontId ? Number(taskFrontId) : undefined,
          createdAt: new Date().toISOString(),
        });
      }

      setTaskTitle('');
      setTaskNotes('');
      setTaskDate('');
      setTaskFrontId('');
      setEditingTaskId(null);
    } else if (activeTab === 'fronts') {
      if (!frontName.trim()) return;

      if (editingFrontId) {
        await db.fronts.update(editingFrontId, {
          name: frontName.trim(),
          color: frontColor,
        });
      } else {
        await db.fronts.add({ name: frontName.trim(), color: frontColor });
      }

      setFrontName('');
      setEditingFrontId(null);
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

  const handleToggleTask = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    if (!task.id) return;
    await db.tasks.update(task.id, { completed: !task.completed });
  };

  const handleDeleteTask = async (e: React.MouseEvent, id?: number) => {
    e.stopPropagation();
    if (!id) return;
    await db.tasks.delete(id);
  };

  // Exportar Backup
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

  // Importar Backup
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

  // Filtros Reativos
  const filterTaskList = (list: Task[]) => {
    return list.filter((task) => {
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesFront = 
        selectedFrontFilter === 'all' || task.frontId === selectedFrontFilter;

      return matchesSearch && matchesFront;
    });
  };

  // Na aba Hoje entram as tarefas de hoje, as atrasadas (dueDate < hoje) e as sem data pendentes
  const todayBaseTasks = tasks.filter(t => (t.dueDate && t.dueDate <= todayStr && !t.completed) || (!t.dueDate && !t.completed));
  const filteredTodayTasks = filterTaskList(todayBaseTasks);
  const filteredAllTasks = filterTaskList(tasks);

  // Renderizador de Card de Tarefa com Validade e Snooze Rápido
  const renderTaskCard = (task: Task) => {
    const front = fronts.find(f => f.id === task.frontId);
    const isOverdue = task.dueDate && task.dueDate < todayStr && !task.completed;
    const isDueToday = task.dueDate === todayStr && !task.completed;

    return (
      <div
        key={task.id}
        onClick={() => handleEditTask(task)}
        className="cursor-pointer flex flex-col gap-2 rounded-xl border border-zinc-800/70 bg-zinc-900/30 p-3.5 transition active:bg-zinc-900/60 hover:border-zinc-700"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-1 items-start gap-3 overflow-hidden">
            <button
              type="button"
              onClick={(e) => handleToggleTask(e, task)}
              className="shrink-0 pt-0.5"
            >
              {task.completed ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <Circle className="h-5 w-5 text-zinc-600" />
              )}
            </button>
            <div className="flex flex-col min-w-0">
              <span className={`text-sm leading-snug break-words ${task.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                {task.title}
              </span>
              
              {/* Badges de Validade, Frente e Prazo */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] mt-1">
                {task.dueDate && (
                  <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded font-medium ${
                    isOverdue 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                      : isDueToday 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                      : 'text-zinc-400'
                  }`}>
                    {isOverdue && <AlertCircle className="h-3 w-3 text-rose-400" />}
                    <Calendar className="h-3 w-3" />
                    <span>{task.dueDate}</span>
                    {isOverdue && <span className="font-bold">Atrasada</span>}
                    {isDueToday && <span className="font-bold">Hoje</span>}
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
          </div>

          {/* Botões de Ação Direta (+1, +3, +5 e Excluir) */}
          <div className="flex items-center gap-1 shrink-0">
            {!task.completed && (
              <div className="flex items-center gap-0.5 bg-zinc-950/70 border border-zinc-800 rounded-lg p-0.5">
                <button
                  type="button"
                  title="Cobrar / Adiar +1 dia"
                  onClick={(e) => handleSnoozeTask(e, task, 1)}
                  className="px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition"
                >
                  +1d
                </button>
                <button
                  type="button"
                  title="Cobrar / Adiar +3 dias"
                  onClick={(e) => handleSnoozeTask(e, task, 3)}
                  className="px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition"
                >
                  +3d
                </button>
                <button
                  type="button"
                  title="Cobrar / Adiar +5 dias"
                  onClick={(e) => handleSnoozeTask(e, task, 5)}
                  className="px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition"
                >
                  +5d
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={(e) => handleDeleteTask(e, task.id)}
              className="p-1.5 text-zinc-500 hover:text-rose-400 transition"
              title="Excluir"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {task.notes && (
          <div className="pl-8 pt-1 border-t border-zinc-800/30">
            <p className="text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed">{task.notes}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Header com Safe Area */}
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

        {/* Lupa e Carrossel de Frentes */}
        {(activeTab === 'today' || activeTab === 'tasks') && (
          <div className="mx-auto max-w-md mt-3 flex flex-col gap-2">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar tarefas ou anotações..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-9 pr-8 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 p-0.5 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
              <button
                type="button"
                onClick={() => setSelectedFrontFilter('all')}
                className={`whitespace-nowrap px-2.5 py-1 rounded-lg font-medium text-[11px] transition ${
                  selectedFrontFilter === 'all'
                    ? 'bg-zinc-100 text-zinc-950 font-semibold'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800/80 hover:bg-zinc-800'
                }`}
              >
                Todas
              </button>
              {fronts.map((front) => {
                const isSelected = selectedFrontFilter === front.id;
                return (
                  <button
                    key={front.id}
                    type="button"
                    onClick={() => setSelectedFrontFilter(isSelected ? 'all' : (front.id as number))}
                    className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] transition border flex items-center gap-1.5 ${
                      isSelected
                        ? 'border-transparent font-semibold text-zinc-950'
                        : 'border-zinc-800/80 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                    }`}
                    style={{
                      backgroundColor: isSelected ? front.color : undefined,
                    }}
                  >
                    {!isSelected && (
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: front.color }} />
                    )}
                    <span>{front.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 px-4 py-4 max-w-md mx-auto w-full pb-28">
        
        {/* ABA HOJE */}
        {activeTab === 'today' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider py-1">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-emerald-400" />
                Foco do Dia & Validades
              </span>
              <span className="text-zinc-500">{filteredTodayTasks.length} itens</span>
            </div>

            {filteredTodayTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800/80 p-12 text-center">
                <p className="text-sm font-medium text-zinc-400">Tudo em dia para hoje</p>
                <p className="text-xs text-zinc-600 mt-1">Toque no "+" para registrar ou adiar prazos.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredTodayTasks.map(renderTaskCard)}
              </div>
            )}
          </div>
        )}

        {/* ABA TAREFAS */}
        {activeTab === 'tasks' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider py-1">
              <span>Todas as Tarefas</span>
              <span className="text-zinc-500">{filteredAllTasks.length} de {tasks.length}</span>
            </div>

            {filteredAllTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800/80 p-12 text-center">
                <p className="text-sm font-medium text-zinc-400">Nenhuma tarefa encontrada</p>
                <p className="text-xs text-zinc-600 mt-1">Altere o filtro ou adicione uma nova.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredAllTasks.map(renderTaskCard)}
              </div>
            )}
          </div>
        )}

        {/* ABA FRENTES */}
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
                    onClick={() => handleEditFront(front)}
                    className="cursor-pointer flex items-center justify-between rounded-xl border border-zinc-800/70 bg-zinc-900/30 p-3.5 hover:border-zinc-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: front.color }} />
                      <span className="text-sm font-medium text-zinc-200">{front.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditFront(front)}
                        className="p-1.5 text-zinc-500 hover:text-zinc-200 transition"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          front.id && db.fronts.delete(front.id);
                        }}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA IDEIAS */}
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

        {/* ABA CONTATOS */}
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

      {/* Botão Flutuante (+) */}
      <button
        type="button"
        onClick={handleOpenCreateModal}
        className="fixed bottom-20 right-5 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-950 shadow-lg shadow-black/50 transition active:scale-90"
        title="Adicionar"
      >
        <Plus className="h-6 w-6 stroke-[2.5]" />
      </button>

      {/* Modal / Gaveta */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm p-0"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="w-full max-w-md rounded-t-3xl border-t border-zinc-800 bg-zinc-950 p-5 shadow-2xl pb-safe animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {editingTaskId 
                  ? 'Editar Tarefa'
                  : editingFrontId 
                  ? 'Editar Frente'
                  : activeTab === 'today' 
                  ? 'Adicionar ao Dia de Hoje'
                  : activeTab === 'tasks' 
                  ? 'Nova Tarefa'
                  : activeTab === 'fronts' 
                  ? 'Nova Frente'
                  : activeTab === 'ideas' 
                  ? 'Nova Ideia' 
                  : 'Novo Contato'}
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
                  
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-semibold text-zinc-500">Validade / Prazo</label>
                      {/* Botões Rápidos de Prazo no Modal */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setTaskDate(addDaysToDate(taskDate || todayStr, 1))}
                          className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-medium text-zinc-300 hover:bg-zinc-700"
                        >
                          +1 dia
                        </button>
                        <button
                          type="button"
                          onClick={() => setTaskDate(addDaysToDate(taskDate || todayStr, 3))}
                          className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-medium text-zinc-300 hover:bg-zinc-700"
                        >
                          +3 dias
                        </button>
                        <button
                          type="button"
                          onClick={() => setTaskDate(addDaysToDate(taskDate || todayStr, 5))}
                          className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-medium text-zinc-300 hover:bg-zinc-700"
                        >
                          +5 dias
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={taskDate}
                        onChange={(e) => setTaskDate(e.target.value)}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 outline-none [color-scheme:dark]"
                      />
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
                    placeholder="Cargo ou papel"
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
                {editingTaskId || editingFrontId ? 'Salvar Alterações' : 'Salvar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Navegação Inferior */}
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