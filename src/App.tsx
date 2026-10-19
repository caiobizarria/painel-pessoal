import React, { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  db, 
  type Task, 
  type Front, 
  type DebtCollection, 
  type CriticalityLevel 
} from './core/db/schema';
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  X, 
  Search, 
  AlertCircle,
  Flame,
  PhoneCall,
  Copy,
  Check,
  FileSpreadsheet,
  BadgeAlert,
  Send,
  Zap,
  Pin,
  ArrowUpDown,
  CalendarDays,
  FileText,
  ChevronLeft,
  ChevronRight,
  Folder,
  Lightbulb
} from 'lucide-react';

function addDaysToDate(baseDateStr: string | undefined, daysToAdd: number): string {
  const base = baseDateStr ? new Date(`${baseDateStr}T12:00:00`) : new Date();
  base.setDate(base.getDate() + daysToAdd);
  return base.toISOString().split('T')[0];
}

export default function App() {
  // Navegação: pode ser o ID numérico de uma Frente OU uma das abas utilitárias de topo
  const [activeView, setActiveView] = useState<number | 'critical' | 'schedule' | 'collections' | 'ideas'>('critical');

  // Ordenação na aba Críticas
  const [sortBy, setSortBy] = useState<'pinned' | 'criticality' | 'dueDate'>('pinned');

  // Agenda Mensal (YYYY-MM)
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);
  const [scheduleText, setScheduleText] = useState<string>('');
  const [scheduleSavedFeedback, setScheduleSavedFeedback] = useState(false);

  // Modais de Criação / Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingFrontId, setEditingFrontId] = useState<number | null>(null);
  const [editingCollectionId, setEditingCollectionId] = useState<number | null>(null);
  const [backupTextModal, setBackupTextModal] = useState<string | null>(null);

  // Busca e Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCriticalityFilter, setSelectedCriticalityFilter] = useState<CriticalityLevel | 'all'>('all');

  // Formulário Tarefa
  const [taskTitle, setTaskTitle] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [taskCriticality, setTaskCriticality] = useState<CriticalityLevel>('media');

  // Formulário Frentes
  const [frontName, setFrontName] = useState('');
  const [frontColor, setFrontColor] = useState('#3b82f6');

  // Formulário Ideias
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaContent, setIdeaContent] = useState('');

  // Formulário Cobrança
  const [colContactName, setColContactName] = useState('');
  const [colPhone, setColPhone] = useState('');
  const [colReason, setColReason] = useState('');
  const [colDetails, setColDetails] = useState('');
  const [colAmount, setColAmount] = useState('');
  const [colStatus, setColStatus] = useState<'pendente' | 'cobrado' | 'resolvido'>('pendente');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const tasks = useLiveQuery(() => db.tasks.reverse().toArray()) ?? [];
  const fronts = useLiveQuery(() => db.fronts.toArray()) ?? [];
  const ideas = useLiveQuery(() => db.ideas.reverse().toArray()) ?? [];
  const collections = useLiveQuery(() => db.collections.reverse().toArray()) ?? [];

  const todayStr = new Date().toISOString().split('T')[0];

  // Sincroniza o texto da Agenda ao trocar de mês
  useEffect(() => {
    let isMounted = true;
    db.schedules.where('monthKey').equals(selectedMonth).first().then((record) => {
      if (isMounted) {
        setScheduleText(record ? record.rawText : '');
      }
    });
    return () => { isMounted = false; };
  }, [selectedMonth]);

  const handleScheduleChange = (text: string) => {
    setScheduleText(text);
  };

  const handleSaveSchedule = async () => {
    const existing = await db.schedules.where('monthKey').equals(selectedMonth).first();
    if (existing && existing.id) {
      await db.schedules.update(existing.id, {
        rawText: scheduleText,
        updatedAt: new Date().toISOString()
      });
    } else {
      await db.schedules.add({
        monthKey: selectedMonth,
        rawText: scheduleText,
        updatedAt: new Date().toISOString()
      });
    }
    setScheduleSavedFeedback(true);
    setTimeout(() => setScheduleSavedFeedback(false), 2000);
  };

  const handleMonthStep = (step: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + step, 1);
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${newYear}-${newMonth}`);
  };

  // Abre o modal atribuindo automaticamente a Frente ativa atual
  const handleOpenCreateModal = () => {
    setEditingTaskId(null);
    setEditingFrontId(null);
    setEditingCollectionId(null);
    setTaskTitle('');
    setTaskNotes('');
    setTaskCriticality(activeView === 'critical' ? 'alta' : 'media');
    setTaskDate(activeView === 'critical' ? todayStr : '');
    setFrontName('');
    setFrontColor('#3b82f6');
    setIdeaTitle('');
    setIdeaContent('');
    setColContactName('');
    setColPhone('');
    setColReason('');
    setColDetails('');
    setColAmount('');
    setColStatus('pendente');
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    if (!task.id) return;
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskNotes(task.notes || '');
    setTaskDate(task.dueDate || '');
    setTaskCriticality(task.criticality || 'media');
    setIsModalOpen(true);
  };

  const handleEditCollection = (col: DebtCollection) => {
    if (!col.id) return;
    setEditingCollectionId(col.id);
    setColContactName(col.contactName);
    setColPhone(col.phone);
    setColReason(col.reason);
    setColDetails(col.details || '');
    setColAmount(col.amount || '');
    setColStatus(col.status);
    setIsModalOpen(true);
  };

  const handleSnoozeTask = async (e: React.MouseEvent, task: Task, days: number) => {
    e.stopPropagation();
    if (!task.id) return;
    const baseDate = (task.dueDate && task.dueDate >= todayStr) ? task.dueDate : todayStr;
    const newDueDate = addDaysToDate(baseDate, days);
    await db.tasks.update(task.id, { dueDate: newDueDate, completed: false });
  };

  const handleTogglePin = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    if (!task.id) return;
    await db.tasks.update(task.id, { pinned: !task.pinned });
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();

    const isInsideFront = typeof activeView === 'number';

    if (activeView === 'critical' || isInsideFront) {
      if (!taskTitle.trim()) return;

      // Se estiver em uma frente, atribui o frontId automaticamente sem perguntar
      const targetFrontId = isInsideFront ? activeView : undefined;

      if (editingTaskId) {
        await db.tasks.update(editingTaskId, {
          title: taskTitle.trim(),
          notes: taskNotes.trim() || undefined,
          dueDate: taskDate || undefined,
          criticality: taskCriticality,
        });
      } else {
        await db.tasks.add({
          title: taskTitle.trim(),
          notes: taskNotes.trim() || undefined,
          completed: false,
          dueDate: taskDate || undefined,
          frontId: targetFrontId,
          criticality: taskCriticality,
          pinned: false,
          createdAt: new Date().toISOString(),
        });
      }
    } else if (editingFrontId) {
      if (!frontName.trim()) return;
      await db.fronts.update(editingFrontId, { name: frontName.trim(), color: frontColor });
    } else if (activeView === 'ideas') {
      if (!ideaTitle.trim()) return;
      await db.ideas.add({
        title: ideaTitle.trim(),
        content: ideaContent.trim(),
        createdAt: new Date().toISOString(),
      });
    } else if (activeView === 'collections') {
      if (!colContactName.trim() || !colReason.trim()) return;
      if (editingCollectionId) {
        await db.collections.update(editingCollectionId, {
          contactName: colContactName.trim(),
          phone: colPhone.trim(),
          reason: colReason.trim(),
          details: colDetails.trim() || undefined,
          amount: colAmount.trim() || undefined,
          status: colStatus
        });
      } else {
        await db.collections.add({
          contactName: colContactName.trim(),
          phone: colPhone.trim(),
          reason: colReason.trim(),
          details: colDetails.trim() || undefined,
          amount: colAmount.trim() || undefined,
          status: colStatus,
          createdAt: new Date().toISOString()
        });
      }
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

  const handleExportData = async () => {
    try {
      const exportTasks = await db.tasks.toArray().catch(() => []);
      const exportFronts = await db.fronts.toArray().catch(() => []);
      const exportIdeas = await db.ideas.toArray().catch(() => []);
      const exportCollections = db.collections ? await db.collections.toArray().catch(() => []) : [];
      const exportSchedules = db.schedules ? await db.schedules.toArray().catch(() => []) : [];

      const exportData = {
        version: 6,
        exportedAt: new Date().toISOString(),
        tasks: exportTasks,
        fronts: exportFronts,
        ideas: exportIdeas,
        collections: exportCollections,
        schedules: exportSchedules,
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const filename = `backup-painel-${todayStr}.json`;

      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = url;
      downloadAnchor.download = filename;
      downloadAnchor.target = '_blank';
      downloadAnchor.rel = 'noopener';
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();

      setTimeout(() => {
        document.body.removeChild(downloadAnchor);
        URL.revokeObjectURL(url);
      }, 800);
    } catch {
      alert('Falha ao exportar backup diretamente.');
    }
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (confirm('Deseja restaurar este backup?')) {
          if (json.tasks?.length) await db.tasks.bulkPut(json.tasks);
          if (json.fronts?.length) await db.fronts.bulkPut(json.fronts);
          if (json.ideas?.length) await db.ideas.bulkPut(json.ideas);
          if (json.collections?.length) await db.collections.bulkPut(json.collections);
          if (json.schedules?.length) await db.schedules.bulkPut(json.schedules);
          alert('Dados sincronizados com sucesso!');
        }
      } catch {
        alert('Arquivo de backup inválido.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExportCollectionsCSV = () => {
    if (collections.length === 0) {
      alert('Nenhuma cobrança registrada.');
      return;
    }

    const headers = ['Nome / Contato', 'Celular', 'Motivo', 'Descricao / Detalhes', 'Valor', 'Status', 'Data Criacao'];
    const rows = collections.map(c => [
      `"${c.contactName.replace(/"/g, '""')}"`,
      `"${c.phone.replace(/"/g, '""')}"`,
      `"${c.reason.replace(/"/g, '""')}"`,
      `"${(c.details || '').replace(/"/g, '""')}"`,
      `"${(c.amount || '').replace(/"/g, '""')}"`,
      `"${c.status}"`,
      `"${c.createdAt.split('T')[0]}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cobrancas-planilha-${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 800);
  };

  const handleOpenWhatsApp = (e: React.MouseEvent, phone: string, text: string) => {
    e.stopPropagation();
    const cleanPhone = phone.replace(/\D/g, '');
    const phoneWithDDI = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    window.open(`https://wa.me/${phoneWithDDI}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyText = (e: React.MouseEvent, id: number, textToCopy: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filterList = (list: Task[]) => {
    const q = searchQuery.toLowerCase().trim();
    return list.filter((task) => {
      const taskCrit = task.criticality ? task.criticality.toLowerCase() : '';
      const matchesSearch = 
        !q ||
        task.title.toLowerCase().includes(q) ||
        (task.notes && task.notes.toLowerCase().includes(q)) ||
        taskCrit.includes(q) ||
        (q === 'média' && taskCrit === 'media');
      
      const matchesCriticality = selectedCriticalityFilter === 'all' || task.criticality === selectedCriticalityFilter;
      return matchesSearch && matchesCriticality;
    });
  };

  // 1. Críticas
  const criticalBaseTasks = tasks.filter(t => 
    !t.completed && (
      t.criticality === 'alta' || 
      (t.dueDate && t.dueDate <= todayStr)
    )
  );
  const filteredCriticalTasks = filterList(criticalBaseTasks);

  const sortedCriticalTasks = [...filteredCriticalTasks].sort((a, b) => {
    if (sortBy === 'pinned') {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
    }
    if (sortBy === 'criticality') {
      const weight = { alta: 3, media: 2, baixa: 1 };
      const diff = (weight[b.criticality || 'media']) - (weight[a.criticality || 'media']);
      if (diff !== 0) return diff;
    }
    if (sortBy === 'dueDate') {
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
    }
    return (b.id || 0) - (a.id || 0);
  });

  // 2. Tarefas da Frente Selecionada
  const isFrontActive = typeof activeView === 'number';
  const currentFront = fronts.find(f => f.id === activeView);
  const currentFrontTasks = isFrontActive ? tasks.filter(t => t.frontId === activeView) : [];
  const filteredFrontTasks = filterList(currentFrontTasks);

  const getCriticalityBadge = (level?: CriticalityLevel) => {
    switch (level) {
      case 'alta':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-0.5"><Flame className="h-3 w-3 text-rose-400"/> Alta</span>;
      case 'baixa':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">Baixa</span>;
      case 'media':
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/25">Média</span>;
    }
  };

  const renderTaskCard = (task: Task) => {
    const front = fronts.find(f => f.id === task.frontId);
    const isOverdue = task.dueDate && task.dueDate < todayStr && !task.completed;
    const isDueToday = task.dueDate === todayStr && !task.completed;
    const isHighCriticality = task.criticality === 'alta' && !task.completed;
    const isUrgent = isOverdue || isHighCriticality;

    return (
      <div
        key={task.id}
        onClick={() => handleEditTask(task)}
        className={`cursor-pointer flex flex-col gap-2 rounded-xl p-3.5 transition active:scale-[0.99] ${
          task.pinned
            ? 'border-2 border-amber-500/80 bg-amber-950/20 shadow-lg shadow-amber-950/40'
            : isUrgent
            ? 'border border-rose-500/80 bg-rose-950/20 shadow-lg shadow-rose-950/30 ring-1 ring-rose-500/20'
            : 'border border-zinc-800/70 bg-zinc-900/30 hover:border-zinc-700'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-1 items-start gap-3 overflow-hidden">
            <button
              type="button"
              onClick={(e) => handleToggleTask(e, task)}
              className="shrink-0 pt-0.5"
            >
              {task.completed ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500"/>
              ) : (
                <Circle className={`h-5 w-5 ${task.pinned ? 'text-amber-400' : isUrgent ? 'text-rose-400' : 'text-zinc-600'}`}/>
              )}
            </button>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                {task.pinned && <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded border border-amber-500/30">PIN 📌</span>}
                <span className={`text-sm leading-snug break-words ${task.completed ? 'text-zinc-500 line-through' : isUrgent ? 'text-rose-100 font-semibold' : 'text-zinc-200'}`}>
                  {task.title}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] mt-1.5">
                {getCriticalityBadge(task.criticality)}
                {task.dueDate && (
                  <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded font-medium ${
                    isOverdue 
                      ? 'bg-rose-500/30 text-rose-200 border border-rose-500/50 font-bold' 
                      : isDueToday 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                      : 'text-zinc-400'
                  }`}>
                    {isOverdue && <AlertCircle className="h-3 w-3 text-rose-300"/>}
                    <Calendar className="h-3 w-3"/>
                    <span>{task.dueDate}</span>
                    {isOverdue && <span>(Atrasada!)</span>}
                    {isDueToday && <span className="font-bold">Hoje</span>}
                  </span>
                )}
                {/* Mostra a tag de frente apenas se estiver na aba Críticas */}
                {front && activeView === 'critical' && (
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

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              title={task.pinned ? "Desafixar do topo" : "Fixar no topo"}
              onClick={(e) => handleTogglePin(e, task)}
              className={`p-1.5 rounded-lg border transition ${
                task.pinned
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              <Pin className={`h-3.5 w-3.5 ${task.pinned ? 'fill-amber-400 text-amber-400' : ''}`}/>
            </button>

            {!task.completed && (
              <div className="flex items-center gap-0.5 bg-zinc-950/80 border border-zinc-800 rounded-lg p-0.5">
                <button
                  type="button"
                  title="Adiar +1 dia"
                  onClick={(e) => handleSnoozeTask(e, task, 1)}
                  className="px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition"
                >
                  +1d
                </button>
                <button
                  type="button"
                  title="Adiar +3 dias"
                  onClick={(e) => handleSnoozeTask(e, task, 3)}
                  className="px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition"
                >
                  +3d
                </button>
                <button
                  type="button"
                  title="Adiar +5 dias"
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
              <Trash2 className="h-4 w-4"/>
            </button>
          </div>
        </div>

        {task.notes && (
          <div className={`pl-8 pt-1.5 border-t ${task.pinned ? 'border-amber-900/40' : isUrgent ? 'border-rose-900/40' : 'border-zinc-800/30'}`}>
            <p className="text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed">{task.notes}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <header className="sticky top-0 z-20 border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md pt-safe px-4 pb-3">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold tracking-tight text-zinc-100">Painel Pessoal</h1>
            {currentFront && (
              <span 
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                style={{ backgroundColor: `${currentFront.color}22`, color: currentFront.color }}
              >
                {currentFront.name}
              </span>
            )}
          </div>

          {/* Abas Globais no Topo Direito (Críticas, Agenda, Cobrança, Ideias) */}
          <div className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setActiveView('critical')}
              title="Foco Crítico"
              className={`p-1.5 rounded-lg transition ${
                activeView === 'critical' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Zap className="h-4 w-4"/>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('schedule')}
              title="Agenda Mensal"
              className={`p-1.5 rounded-lg transition ${
                activeView === 'schedule' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <CalendarDays className="h-4 w-4"/>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('collections')}
              title="Cobranças"
              className={`p-1.5 rounded-lg transition ${
                activeView === 'collections' ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <PhoneCall className="h-4 w-4"/>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('ideas')}
              title="Ideias"
              className={`p-1.5 rounded-lg transition ${
                activeView === 'ideas' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Lightbulb className="h-4 w-4"/>
            </button>

            <div className="h-4 w-[1px] bg-zinc-800 mx-0.5" />

            {activeView === 'collections' ? (
              <button
                onClick={handleExportCollectionsCSV}
                title="Exportar Planilha CSV"
                className="p-1.5 text-emerald-400 hover:text-emerald-300"
              >
                <FileSpreadsheet className="h-4 w-4"/>
              </button>
            ) : (
              <button
                onClick={handleExportData}
                title="Exportar Backup JSON"
                className="p-1.5 text-zinc-400 hover:text-zinc-200"
              >
                <Download className="h-4 w-4"/>
              </button>
            )}
          </div>
        </div>

        {/* Lupa de busca rápida (em Críticas ou Frentes) */}
        {(activeView === 'critical' || isFrontActive) && (
          <div className="mx-auto max-w-md mt-3 relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-zinc-500"/>
            <input
              type="text"
              placeholder={activeView === 'critical' ? "Buscar nas críticas..." : `Buscar em ${currentFront?.name || 'tarefas'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 pl-9 pr-8 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-0.5 text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-3.5 w-3.5"/>
              </button>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 px-4 py-4 max-w-md mx-auto w-full pb-28">
        
        {/* ================= 1. ABA CRÍTICAS ================= */}
        {activeView === 'critical' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs pb-1">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-rose-400">
                <BadgeAlert className="h-4 w-4 text-rose-500 animate-pulse"/>
                <span>Foco Crítico ({sortedCriticalTasks.length})</span>
              </div>

              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-[10px]">
                <ArrowUpDown className="h-3 w-3 text-zinc-500 ml-1"/>
                <button
                  onClick={() => setSortBy('pinned')}
                  className={`px-1.5 py-0.5 rounded font-medium transition ${
                    sortBy === 'pinned' ? 'bg-zinc-800 text-zinc-100 font-bold' : 'text-zinc-400'
                  }`}
                >
                  Fixadas 📌
                </button>
                <button
                  onClick={() => setSortBy('criticality')}
                  className={`px-1.5 py-0.5 rounded font-medium transition ${
                    sortBy === 'criticality' ? 'bg-zinc-800 text-zinc-100 font-bold' : 'text-zinc-400'
                  }`}
                >
                  Urgência 🔥
                </button>
                <button
                  onClick={() => setSortBy('dueDate')}
                  className={`px-1.5 py-0.5 rounded font-medium transition ${
                    sortBy === 'dueDate' ? 'bg-zinc-800 text-zinc-100 font-bold' : 'text-zinc-400'
                  }`}
                >
                  Prazo 📅
                </button>
              </div>
            </div>

            {sortedCriticalTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800/80 p-12 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500/50 mb-2"/>
                <p className="text-sm font-medium text-zinc-300">Nenhuma tarefa crítica pendente!</p>
                <p className="text-xs text-zinc-600 mt-1">Sem itens de alta criticidade ou prazos atrasados.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {sortedCriticalTasks.map(renderTaskCard)}
              </div>
            )}
          </div>
        )}

        {/* ================= 2. FRENTES ESPECÍFICAS ================= */}
        {isFrontActive && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider py-1">
              <span className="flex items-center gap-1.5" style={{ color: currentFront?.color }}>
                <Folder className="h-3.5 w-3.5"/>
                {currentFront?.name}
              </span>
              <span className="text-zinc-500">{filteredFrontTasks.length} tarefas</span>
            </div>

            {filteredFrontTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800/80 p-12 text-center">
                <p className="text-sm font-medium text-zinc-400">Nenhuma tarefa nesta frente</p>
                <p className="text-xs text-zinc-600 mt-1">
                  Toque no "+" para adicionar diretamente em <strong className="text-zinc-200">{currentFront?.name}</strong>.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredFrontTasks.map(renderTaskCard)}
              </div>
            )}
          </div>
        )}

        {/* ================= 3. AGENDA MENSAL ================= */}
        {activeView === 'schedule' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5">
              <button
                type="button"
                onClick={() => handleMonthStep(-1)}
                className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition active:scale-95"
              >
                <ChevronLeft className="h-4 w-4"/>
              </button>

              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-emerald-400"/>
                <span className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
                  {selectedMonth}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleMonthStep(1)}
                className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition active:scale-95"
              >
                <ChevronRight className="h-4 w-4"/>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-zinc-500"/>
                Histórico & Bullet Points do Mês
              </span>
              <button
                type="button"
                onClick={handleSaveSchedule}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition active:scale-95 ${
                  scheduleSavedFeedback
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'bg-zinc-100 text-zinc-950 hover:bg-zinc-200'
                }`}
              >
                {scheduleSavedFeedback ? 'Salvo ✓' : 'Salvar'}
              </button>
            </div>

            <div className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3 shadow-inner">
              <textarea
                value={scheduleText}
                onChange={(e) => handleScheduleChange(e.target.value)}
                onBlur={handleSaveSchedule}
                placeholder={`Cole aqui compromissos do mês em bullet points (Ctrl+C e Ctrl+V):\n\n• 05/10 - Reunião fornecedor 14h\n• 12/10 - Alinhamento stand Petra\n• 19/10 - Check-in Airbnb às 11h\n• 25/10 - Ensaio Cidade Dormitório`}
                rows={16}
                className="w-full bg-transparent font-mono text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* ================= 4. COBRANÇA ================= */}
        {activeView === 'collections' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider py-1">
              <span className="flex items-center gap-1.5">
                <PhoneCall className="h-3.5 w-3.5 text-emerald-400"/>
                Painel de Cobranças
              </span>
              <span className="text-zinc-500">{collections.length} registros</span>
            </div>

            {collections.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800/80 p-12 text-center">
                <p className="text-sm font-medium text-zinc-400">Nenhuma cobrança registrada</p>
                <p className="text-xs text-zinc-600 mt-1">Toque no "+" para cadastrar alguém que você precisa cobrar.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {collections.map((col) => {
                  const messageText = `Olá ${col.contactName}! Estou entrando em contato referente a: ${col.reason}.${col.details ? ` (${col.details})` : ''}${col.amount ? ` Valor: ${col.amount}` : ''}`;
                  return (
                    <div
                      key={col.id}
                      onClick={() => handleEditCollection(col)}
                      className="cursor-pointer flex flex-col gap-2.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 transition hover:border-zinc-700 active:scale-[0.99]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-zinc-100">{col.contactName}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              col.status === 'pendente' 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                                : col.status === 'cobrado' 
                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' 
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {col.status}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-zinc-300 mt-1">
                            Motivo: <strong className="text-zinc-100">{col.reason}</strong>
                          </span>
                          {col.amount && (
                            <span className="text-xs text-emerald-400 font-semibold mt-0.5">
                              Valor: {col.amount}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            col.id && db.collections.delete(col.id);
                          }}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 transition"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4"/>
                        </button>
                      </div>

                      {col.details && (
                        <div className="rounded-lg bg-zinc-950/60 p-2 border border-zinc-800/50">
                          <p className="text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed">{col.details}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-zinc-800/50 gap-2">
                        <span className="text-xs text-zinc-500 font-mono">
                          {col.phone ? col.phone : 'Sem número'}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleCopyText(e, col.id!, messageText)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-300 hover:bg-zinc-800 active:scale-95 transition"
                          >
                            {copiedId === col.id ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-400"/>
                                <span className="text-emerald-400">Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5"/>
                                <span>Copiar</span>
                              </>
                            )}
                          </button>

                          {col.phone && (
                            <button
                              type="button"
                              onClick={(e) => handleOpenWhatsApp(e, col.phone, messageText)}
                              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 text-xs font-bold text-white shadow hover:bg-emerald-500 active:scale-95 transition"
                            >
                              <Send className="h-3.5 w-3.5"/>
                              <span>WhatsApp</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= 5. IDEIAS ================= */}
        {activeView === 'ideas' && (
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
                        <Trash2 className="h-4 w-4"/>
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

      </main>

      {/* Botão Flutuante (+) */}
      {activeView !== 'schedule' && (
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="fixed bottom-20 right-5 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-950 shadow-lg shadow-black/50 transition active:scale-90"
          title="Adicionar"
        >
          <Plus className="h-6 w-6 stroke-[2.5]"/>
        </button>
      )}

      {/* Modal de Criação / Edição */}
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
                  : editingCollectionId 
                  ? 'Editar Cobrança'
                  : isFrontActive 
                  ? `Nova Tarefa em ${currentFront?.name}`
                  : activeView === 'critical' 
                  ? 'Nova Tarefa Crítica'
                  : activeView === 'collections' 
                  ? 'Nova Cobrança'
                  : 'Nova Ideia'}
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition"
              >
                <X className="h-5 w-5"/>
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="flex flex-col gap-3">
              {(activeView === 'critical' || isFrontActive) && (
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
                    <label className="text-[10px] uppercase font-semibold text-zinc-500 flex items-center gap-1">
                      <Flame className="h-3 w-3 text-amber-500"/> Grau de Criticidade
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setTaskCriticality('baixa')}
                        className={`py-2 rounded-xl text-xs font-semibold border transition ${
                          taskCriticality === 'baixa'
                            ? 'border-zinc-300 bg-zinc-200 text-zinc-950 shadow'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                        }`}
                      >
                        Baixa
                      </button>
                      <button
                        type="button"
                        onClick={() => setTaskCriticality('media')}
                        className={`py-2 rounded-xl text-xs font-semibold border transition ${
                          taskCriticality === 'media'
                            ? 'border-amber-400 bg-amber-500 text-zinc-950 shadow'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                        }`}
                      >
                        Média
                      </button>
                      <button
                        type="button"
                        onClick={() => setTaskCriticality('alta')}
                        className={`py-2 rounded-xl text-xs font-semibold border transition ${
                          taskCriticality === 'alta'
                            ? 'border-rose-400 bg-rose-500 text-white shadow'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                        }`}
                      >
                        Alta 🔥
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-semibold text-zinc-500">Validade / Prazo</label>
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
                    
                    <input
                      type="date"
                      value={taskDate}
                      onChange={(e) => setTaskDate(e.target.value)}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 outline-none [color-scheme:dark]"
                    />
                  </div>
                </>
              )}

              {activeView === 'collections' && (
                <>
                  <input
                    type="text"
                    placeholder="Nome da pessoa / contato"
                    value={colContactName}
                    onChange={(e) => setColContactName(e.target.value)}
                    autoFocus
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-400"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Celular (ex: 11999998888)"
                      value={colPhone}
                      onChange={(e) => setColPhone(e.target.value)}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-400"
                    />
                    <input
                      type="text"
                      placeholder="Valor (ex: R$ 500)"
                      value={colAmount}
                      onChange={(e) => setColAmount(e.target.value)}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-400"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Motivo da cobrança"
                    value={colReason}
                    onChange={(e) => setColReason(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-400"
                  />

                  <textarea
                    placeholder="Descrição / Detalhes..."
                    rows={3}
                    value={colDetails}
                    onChange={(e) => setColDetails(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-zinc-400 resize-none"
                  />

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-semibold text-zinc-500">Status</label>
                    <select
                      value={colStatus}
                      onChange={(e) => setColStatus(e.target.value as any)}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 outline-none [color-scheme:dark]"
                    >
                      <option value="pendente">Pendente</option>
                      <option value="cobrado">Cobrado / Aguardando</option>
                      <option value="resolvido">Resolvido</option>
                    </select>
                  </div>
                </>
              )}

              {activeView === 'ideas' && (
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

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-zinc-100 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 active:scale-98"
              >
                {editingTaskId || editingCollectionId || editingFrontId ? 'Salvar Alterações' : 'Salvar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Barra Inferior Fixa dedicada 100% às FRENTES */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-zinc-800/80 bg-zinc-950/95 px-2 pt-2 pb-safe backdrop-blur-lg">
        <div className="mx-auto flex max-w-md items-center justify-around gap-1 overflow-x-auto no-scrollbar">
          {fronts.map((front) => {
            const isSelected = activeView === front.id;
            const count = tasks.filter(t => t.frontId === front.id && !t.completed).length;
            return (
              <button
                key={front.id}
                type="button"
                onClick={() => setActiveView(front.id as number)}
                className={`flex flex-1 flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl transition ${
                  isSelected 
                    ? 'bg-zinc-900 text-zinc-100 font-bold border border-zinc-800' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <span 
                    className="h-2.5 w-2.5 rounded-full" 
                    style={{ backgroundColor: front.color }}
                  />
                  {count > 0 && (
                    <span className="absolute -top-1.5 -right-3 px-1 py-0.2 bg-zinc-800 text-[9px] font-mono text-zinc-300 rounded-full border border-zinc-700">
                      {count}
                    </span>
                  )}
                </div>
                <span className="text-[11px] truncate max-w-[70px]">
                  {front.name.replace(/^[^\w\s]+/, '').trim() || front.name}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}