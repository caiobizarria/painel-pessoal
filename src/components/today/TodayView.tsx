import React from 'react';
import { AlertCircle, Clock, CheckCircle2, ChevronRight, User } from 'lucide-react';
import type { Front, Person, Task, UserSettings } from '../../core/types';
import type { TodayBriefing } from '../../core/logic/today-triage';
import { calculateTaskAging } from '../../core/logic/aging';

interface TodayViewProps {
  briefing: TodayBriefing;
  frontsMap: Map<string, Front>;
  peopleMap: Map<string, Person>;
  settings: UserSettings;
  onCompleteTask: (taskId: string) => void;
  onSelectTask: (task: Task) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  briefing,
  frontsMap,
  peopleMap,
  settings,
  onCompleteTask,
  onSelectTask,
}) => {
  return (
    <div className="p-4 max-w-lg mx-auto space-y-6 pb-28">
      <header className="pt-2">
        <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase">Briefing Diário</span>
        <h1 className="text-2xl font-bold tracking-tight text-white mt-0.5">☀️ Bom dia.</h1>
        <p className="text-sm text-slate-400 mt-1">{briefing.summaryText}</p>
      </header>

      {briefing.followUpsDue.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
            <Clock className="w-4 h-4" />
            <span>Cobranças para hoje ({briefing.followUpsDue.length})</span>
          </div>
          <div className="space-y-2">
            {briefing.followUpsDue.map((task) => {
              const person = task.personId ? peopleMap.get(task.personId) : null;
              const front = task.frontId ? frontsMap.get(task.frontId) : null;
              return (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="bg-[#13151c] border border-amber-500/20 rounded-xl p-3.5 flex items-center justify-between cursor-pointer hover:border-amber-500/40"
                >
                  <div className="space-y-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md">
                        <User className="w-3 h-3" />
                        {person?.name || 'Aguardando'}
                      </span>
                      {front && (
                        <span className="text-[11px] text-slate-400">
                          {front.emoji} {front.name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-100">{task.title}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {(briefing.overdue.length > 0 || briefing.criticalAging.length > 0) && (
        <section className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span>Requer atenção imediata</span>
          </div>
          <div className="space-y-2">
            {[...briefing.overdue, ...briefing.criticalAging].map((task) => {
              const front = task.frontId ? frontsMap.get(task.frontId) : null;
              const aging = calculateTaskAging(task, settings);
              return (
                <div
                  key={task.id}
                  className="bg-[#13151c] border border-red-500/20 rounded-xl p-3.5 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-start gap-3 pr-2" onClick={() => onSelectTask(task)}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCompleteTask(task.id);
                      }}
                      className="mt-0.5 text-slate-500 hover:text-emerald-400"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-100">{task.title}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        {front && <span>{front.emoji} {front.name}</span>}
                        <span className="text-red-400 font-medium">
                          {task.scheduledDate ? 'Data vencida' : aging.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {briefing.dueToday.length > 0 && (
        <section className="space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Agendadas para Hoje ({briefing.dueToday.length})
          </span>
          <div className="space-y-2">
            {briefing.dueToday.map((task) => {
              const front = task.frontId ? frontsMap.get(task.frontId) : null;
              return (
                <div
                  key={task.id}
                  className="bg-[#13151c] border border-[#272b37] rounded-xl p-3.5 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-start gap-3 pr-2" onClick={() => onSelectTask(task)}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCompleteTask(task.id);
                      }}
                      className="mt-0.5 text-slate-500 hover:text-emerald-400"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-100">{task.title}</p>
                      {front && (
                        <span className="text-[11px] text-slate-400">
                          {front.emoji} {front.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {briefing.totalActionRequired === 0 && (
        <div className="bg-[#1e212b] border border-[#272b37] rounded-2xl p-8 text-center space-y-2 mt-8">
          <p className="text-sm font-medium text-slate-300">Nenhuma pendência crítica hoje</p>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Tarefas futuras e itens sem urgência estão guardados e não exigem atenção agora.
          </p>
        </div>
      )}
    </div>
  );
};