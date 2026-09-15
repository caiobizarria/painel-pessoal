import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Search } from 'lucide-react';
import { db } from './db/dexie';
import type { Front, Person, Task } from './core/types';
import { DEFAULT_SETTINGS } from './core/types';
import { compileTodayBriefing } from './core/logic/today-triage';
import { BottomNav } from './components/layout/BottomNav';
import type { TabType } from './components/layout/BottomNav';
import { QuickCaptureModal } from './components/quick-capture/QuickCaptureModal';
import { TodayView } from './components/today/TodayView';
import { TaskDetailDrawer } from './components/tasks/TaskDetailDrawer';
import { FrontsView } from './components/fronts/FrontsView';
import { PeopleView } from './components/people/PeopleView';
import { TasksView } from './components/tasks/TasksView';
import { IdeasView } from './components/ideas/IdeasView';
import { SearchModal } from './components/search/SearchModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const tasks = useLiveQuery(() => db.tasks.toArray()) || [];
  const fronts = useLiveQuery(() => db.fronts.toArray()) || [];
  const people = useLiveQuery(() => db.people.toArray()) || [];
  const ideas = useLiveQuery(() => db.ideas.toArray()) || [];
  const settingsList = useLiveQuery(() => db.settings.toArray()) || [];

  const settings = settingsList[0] || DEFAULT_SETTINGS;

  const frontsMap = new Map<string, Front>(fronts.map((f) => [f.id, f]));
  const peopleMap = new Map<string, Person>(people.map((p) => [p.id, p]));

  const briefing = compileTodayBriefing(tasks, settings);

  // Atalho de teclado: Cmd+K / Ctrl+K abre a busca
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCompleteTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const now = new Date().toISOString();
    await db.tasks.update(taskId, {
      status: 'COMPLETED',
      completedAt: now,
      updatedAt: now,
      lastMeaningfulMovementAt: now,
    });
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] text-slate-100 flex flex-col font-sans">
      {/* Top Header com Botão de Busca */}
      <header className="px-4 py-3 border-b border-[#1f2330] flex items-center justify-between max-w-md mx-auto w-full">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Painel Pessoal
        </span>
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 bg-[#171a23] hover:bg-[#202432] text-slate-400 hover:text-slate-200 border border-[#262b3a] px-3 py-1.5 rounded-xl text-xs transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Buscar...</span>
          <kbd className="text-[10px] bg-[#101217] px-1.5 py-0.5 rounded border border-[#262b3a] text-slate-500">
            ⌘K
          </kbd>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto">
        {activeTab === 'today' && (
          <TodayView
            briefing={briefing}
            frontsMap={frontsMap}
            peopleMap={peopleMap}
            settings={settings}
            onCompleteTask={handleCompleteTask}
            onSelectTask={(task) => setSelectedTask(task)}
          />
        )}

        {activeTab === 'fronts' && <FrontsView fronts={fronts} />}

        {activeTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            frontsMap={frontsMap}
            onSelectTask={(task) => setSelectedTask(task)}
          />
        )}

        {activeTab === 'ideas' && <IdeasView ideas={ideas} frontsMap={frontsMap} />}

        {activeTab === 'people' && <PeopleView people={people} />}
      </main>

      {/* Botão Flutuante de Captura Rápida */}
      <button
        onClick={() => setIsCaptureOpen(true)}
        className="fixed bottom-20 right-5 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 transition-transform active:scale-95 z-30"
      >
        <Plus className="w-6 h-6" />
      </button>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <QuickCaptureModal
        isOpen={isCaptureOpen}
        onClose={() => setIsCaptureOpen(false)}
        fronts={fronts}
      />

      <TaskDetailDrawer
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        frontsMap={frontsMap}
        people={people}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        tasks={tasks}
        ideas={ideas}
        frontsMap={frontsMap}
        onSelectTask={(task) => setSelectedTask(task)}
      />
    </div>
  );
};

export default App;