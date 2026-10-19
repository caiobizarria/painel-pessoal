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
  FolderKanban, 
  Lightbulb, 
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
  ChevronRight
} from 'lucide-react';

function addDaysToDate(baseDateStr: string | undefined, daysToAdd: number): string {
  const base = baseDateStr ? new Date(`${baseDateStr}T12:00:00`) : new Date();
  base.setDate(base.getDate() + daysToAdd);
  return base.toISOString().split('T')[0];
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'critical' | 'fronts' | 'schedule' | 'collections' | 'ideas'>('critical');
  
  // Controle de Frente Ativa
  const [activeFrontId, setActiveFrontId] = useState<number | null>(null);

  // Ordenação na aba Críticas
  const [sortBy, setSortBy] = useState<'pinned' | 'criticality' | 'dueDate'>('pinned');

  // Mês Selecionado para a Agenda (YYYY-MM)
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
  const [taskFrontId, setTaskFrontId] = useState<string>('');
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

  // Define a primeira frente como ativa caso nenhuma esteja selecionada
  useEffect(() => {
    if (fronts.length > 0 && activeFrontId === null) {
      setActiveFrontId(fronts[0].id || null);
    }
  }, [fronts, activeFrontId]);

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

  const handleOpenCreateModal = () => {
    setEditingTaskId(null);
    setEditingFrontId(null);
    setEditingCollectionId(null);
    setTaskTitle('');
    setTaskNotes('');
    setTaskCriticality(activeTab === 'critical' ? 'alta' : 'media');
    setTaskDate(activeTab === 'critical' ? todayStr : '');
    setTaskFrontId(activeTab === 'fronts' && activeFrontId ? String(activeFrontId) : '');
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
    setTaskFrontId(task.frontId ? String(task.frontId) : '');
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
    
    await db.tasks.update(task.id, {
      dueDate: newDueDate,
      completed: false
    });
  };

  const handleTogglePin = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    if (!task.id) return;
    await db.tasks.update(task.id, {
      pinned: !task.pinned
    });
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'critical' || activeTab === 'fronts') {
      if (!taskTitle.trim()) return;

      const resolvedFrontId = taskFrontId 
        ? Number(taskFrontId) 
        : (activeTab === 'fronts' && activeFrontId ? activeFrontId : undefined);

      if (editingTaskId) {
        await db.tasks.update(editingTaskId, {
          title: taskTitle.trim(),
          notes: taskNotes.trim() || undefined,
          dueDate: taskDate || undefined,
          frontId: resolvedFrontId,
          criticality: taskCriticality,
        });
      } else {
        await db.tasks.add({
          title: taskTitle.trim(),
          notes: taskNotes.trim() || undefined,
          completed: false,
          dueDate: taskDate || undefined,
          frontId: resolvedFrontId,
          criticality: taskCriticality,
          pinned: false,
          createdAt: new Date().toISOString(),
        });
      }
    } else if (editingFrontId) {
      if (!frontName.trim()) return;
      await db.fronts.update(editingFrontId, { name: frontName.trim(), color: frontColor });
    } else if (activeTab === 'ideas') {
      if (!ideaTitle.trim()) return;
      await db.ideas.add({
        title: ideaTitle.trim(),
        content: ideaContent.trim(),
        createdAt: new Date().toISOString(),
      });
    } else if (activeTab === 'collections') {
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

      try {
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
        setBackupTextModal(jsonString);
      }
    } catch (err: any) {
      console.error('Erro ao exportar:', err);
      try {
        const fallbackTasks = await db.tasks.toArray();
        const jsonFallback = JSON.stringify({ tasks: fallbackTasks }, null, 2);
        await navigator.clipboard.writeText(jsonFallback);
        alert('Backup copiado para a Área de Transferência!');
      } catch {
        alert('Falha ao exportar dados.');
      }
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
      alert('Nenhuma cobrança registrada para exportar.');
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
    const url = `https://wa.me/${phoneWithDDI}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
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

  // Aba Críticas
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

  // Aba Frentes (exclusiva)
  const activeFront = fronts.find(f => f.id === activeFrontId);
  const frontTasks = tasks.filter(t => t.frontId === activeFrontId);
  const filteredFrontTasks = filterList(frontTasks);

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
            <span className="rounded-full bg-zinc-800/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              {activeTab === 'critical' && 'Críticas'}
              {activeTab === 'fronts' && (activeFront ? activeFront.name : 'Frentes')}
              {activeTab === 'schedule' && 'Agenda Mensal'}
              {activeTab === 'collections' && 'Cobrança'}
              {activeTab === 'ideas' && 'Ideias'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {activeTab === 'collections' ? (
              <button
                onClick={handleExportCollectionsCSV}
                title="Exportar Cobranças em Planilha Excel/CSV"
                className="flex items-center gap-1 rounded-lg border border-emerald-800/60 bg-emerald-950/50 px-2.5 py-1 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-900 active:scale-95"
              >
                <FileSpreadsheet className="h-3.5 w-3.5"/>
                <span>Planilha</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleExportData}
                  title="Exportar Backup Geral"
                  className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 active:scale-95"
                >
                  <Download className="h-3.5 w-3.5"/>
                  <span>Exportar</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Restaurar Backup"
                  className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition active:scale-95"
                >
                  <Upload className="h-3.5 w-3.5"/>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportData}
                  accept=".json"
                  className="hidden"
                />
              </>
            )}
          </div>
        </div>

        {/* Lupa e Filtros em Críticas e Frentes */}
        {(activeTab === 'critical' || activeTab === 'fronts') && (
          <div className="mx-auto max-w-md mt-3 flex flex-col gap-2">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-zinc-500"/>
              <input
                type="text"
                placeholder={activeTab === 'critical' ? "Buscar nas críticas..." : `Buscar em ${activeFront ? activeFront.name : 'tarefas'}...`}
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

            {/* Abas exclusivas de cada Frente */}
            {activeTab === 'fronts' && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {fronts.map((front) => {
                  const isSelected = activeFrontId === front.id;
                  const count = tasks.filter(t => t.frontId === front.id && !t.completed).length;
                  return (
                    <button
                      key={front.id}
                      type="button"
                      onClick={() => setActiveFrontId(front.id as number)}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-2 ${
                        isSelected
                          ? 'border-transparent text-zinc-950 shadow-md scale-100'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
                      }`}
                      style={{ backgroundColor: isSelected ? front.color : undefined }}
                    >
                      {!isSelected && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: front.color }} />}
                      <span>{front.name}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        isSelected ? 'bg-black/30 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 px-4 py-4 max-w-md mx-auto w-full pb-28">
        
        {/* ================= 1. ABA CRÍTICAS ================= */}
        {activeTab === 'critical' && (
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

        {/* ================= 2. ABA FRENTES ================= */}
        {activeTab === 'fronts' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider py-1">
              <span className="flex items-center gap-1.5">
                <FolderKanban className="h-3.5 w-3.5 text-zinc-400"/>
                {activeFront ? activeFront.name : 'Selecione uma frente'}
              </span>
              <span className="text-zinc-500">{filteredFrontTasks.length} tarefas</span>
            </div>

            {filteredFrontTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800/80 p-12 text-center">
                <p className="text-sm font-medium text-zinc-400">Nenhuma tarefa nesta frente</p>
                <p className="text-xs text-zinc-600 mt-1">Toque no "+" para registrar uma atividade para {activeFront?.name}.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredFrontTasks.map(renderTaskCard)}
              </div>
            )}
          </div>
        )}

        {/* ================= 3. ABA AGENDA ================= */}
        {activeTab === 'schedule' && (
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
                placeholder={`Cole aqui o histórico de compromissos do mês em bullet points (Ctrl+C e Ctrl+V):\n\n• 05/10 - Reunião com fornecedor 14h\n• 12/10 - Alinhamento stand Petra\n• 19/10 - Check-in Airbnb às 11h\n• 25/10 - Ensaio Cidade Dormitório\n\nEdite, apague e organize suas semanas livremente.`}
                rows={16}
                className="w-full bg-transparent font-mono text-xs text-zinc-200 placeholder-zinc-600 outline-none resize-none leading-relaxed"
              />
            </div>
            <p className="text-[10px] text-zinc-500 px-1 text-center">
              Dica: O texto é gravado localmente para o mês selecionado. Ao mudar de mês ou sair do campo, as alterações ficam salvas.
            </p>
          </div>
        )}

        {/* ================= 4. ABA COBRANÇA ================= */}
        {activeTab === 'collections' && (
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

                        <div className="flex items-center gap-1 shrink-0">
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
                            title="Copiar texto para colar"
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

        {/* ================= 5. ABA IDEIAS ================= */}
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
      {activeTab !== 'schedule' && (
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="fixed bottom-20 right-5 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-950 shadow-lg shadow-black/50 transition active:scale-90"
          title="Adicionar"
        >
          <Plus className="h-6 w-6 stroke-[2.5]"/>
        </button>
      )}

      {/* Modal / Gaveta de Criação e Edição */}
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
                  : editingFrontId 
                  ? 'Editar Frente'
                  : activeTab === 'critical' 
                  ? 'Nova Tarefa Crítica'
                  : activeTab === 'fronts' 
                  ? `Nova Tarefa (${activeFront?.name || 'Frente'})`
                  : activeTab === 'collections' 
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
              {(activeTab === 'critical' || activeTab === 'fronts') && (
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

              {activeTab === 'collections' && (
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

      {/* Modal de Fallback de Backup */}
      {backupTextModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-100">Backup dos Dados</h3>
              <button onClick={() => setBackupTextModal(null)} className="text-zinc-500 hover:text-zinc-200">
                <X className="h-5 w-5"/>
              </button>
            </div>
            <p className="text-xs text-zinc-400">
              O download automático foi bloqueado pelo navegador. Toque abaixo para copiar o texto completo do backup e colar no Bloco de Notas:
            </p>
            <textarea
              readOnly
              value={backupTextModal}
              rows={8}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-2.5 font-mono text-[10px] text-zinc-300 outline-none"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(backupTextModal);
                alert('Backup copiado para a Área de Transferência!');
                setBackupTextModal(null);
              }}
              className="w-full rounded-xl bg-zinc-100 py-2.5 text-xs font-bold text-zinc-950 transition hover:bg-zinc-200 active:scale-98"
            >
              Copiar para Área de Transferência
            </button>
          </div>
        </div>
      )}

      {/* Navegação Inferior Atualizada: Críticas, Frentes, Agenda, Cobrança, Ideias */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-zinc-800/80 bg-zinc-950/95 px-3 pt-2 pb-safe backdrop-blur-lg">
        <div className="mx-auto flex max-w-md items-center justify-around">
          <button
            type="button"
            onClick={() => setActiveTab('critical')}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition ${
              activeTab === 'critical' ? 'text-rose-400 font-bold' : 'text-zinc-500'
            }`}
          >
            <Zap className="h-5 w-5"/>
            Críticas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fronts')}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition ${
              activeTab === 'fronts' ? 'text-zinc-100 font-bold' : 'text-zinc-500'
            }`}
          >
            <FolderKanban className="h-5 w-5"/>
            Frentes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition ${
              activeTab === 'schedule' ? 'text-emerald-400 font-bold' : 'text-zinc-500'
            }`}
          >
            <CalendarDays className="h-5 w-5"/>
            Agenda
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('collections')}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition ${
              activeTab === 'collections' ? 'text-emerald-400 font-bold' : 'text-zinc-500'
            }`}
          >
            <PhoneCall className="h-5 w-5"/>
            Cobrança
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ideas')}
            className={`flex flex-col items-center gap-1 p-1 text-[10px] font-medium transition ${
              activeTab === 'ideas' ? 'text-zinc-100' : 'text-zinc-500'
            }`}
          >
            <Lightbulb className="h-5 w-5"/>
            Ideias
          </button>
        </div>
      </nav>
    </div>
  );
}