import React, { useState } from 'react';
import { X, Clock, Check, AlertTriangle, ChevronDown, CheckCircle2 } from 'lucide-react';
import type { Task, Front, Person } from '../../core/types';
import { postponeTask, setTaskWaiting, resumeTask } from '../../core/logic/task-actions';
import { db } from '../../db/dexie';

interface TaskDetailDrawerProps {
  task: Task | null;
  onClose: () => void;
  frontsMap: Map<string, Front>;
  people: Person[];
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  onClose,
  frontsMap,
  people,
}) => {
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [followUpDays] = useState<number>(3);

  if (!task) return null;

  const front = task.frontId ? frontsMap.get(task.frontId) : null;
  const isCompleted = task.status === 'COMPLETED';

  const handleToggleComplete = async () => {
    const now = new Date().toISOString();
    await db.tasks.update(task.id, {
      status: isCompleted ? 'INBOX' : 'COMPLETED',
      completedAt: isCompleted ? undefined : now,
      updatedAt: now,
      lastMeaningfulMovementAt: now,
    });
    onClose();
  };

  const handlePostpone = async (days: number) => {
    await postponeTask(task.id, days);
    onClose();
  };

  const handleSetWaiting = async () => {
    if (!selectedPersonId) return;
    await setTaskWaiting(task.id, selectedPersonId, followUpDays);
    onClose();
  };

  const handleResume = async () => {
    await resumeTask(task.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#12141a] border border-[#232734] rounded-t-3xl sm:rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom duration-200">
        
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#1f2330]">
          <div className="space-y-1">
            {front && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#1a1d26] text-xs font-medium text-slate-300 border border-[#272b37]">
                <span>{front.emoji || '📁'}</span>
                <span>{front.name}</span>
              </span>
            )}
            <h2 className={`text-base font-semibold tracking-tight leading-snug ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
              {task.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#1a1d26] transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Descrição */}
        {task.description && (
          <div className="bg-[#171a23] border border-[#262b3a] rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed">
            {task.description}
          </div>
        )}

        {/* Botão de Concluir / Reabrir Tarefa */}
        <div>
          <button
            onClick={handleToggleComplete}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-98 border ${
              isCompleted
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/30 shadow-md shadow-emerald-600/20'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {isCompleted ? 'Reabrir Tarefa' : 'Marcar como Concluída'}
          </button>
        </div>

        {/* Ações de Gestão (apenas se não estiver concluída) */}
        {!isCompleted && (
          <>
            {/* Bloco Adiar */}
            <div className="space-y-2 pt-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" /> Adiar Tarefa
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 3, 7].map((days) => (
                  <button
                    key={days}
                    onClick={() => handlePostpone(days)}
                    className="py-2.5 px-3 bg-[#171a23] hover:bg-[#1f2330] active:scale-95 text-slate-200 text-xs font-medium rounded-xl border border-[#262b3a] flex items-center justify-center gap-1.5 transition-all"
                  >
                    +{days} {days === 1 ? 'Dia' : 'Dias'}
                  </button>
                ))}
              </div>
            </div>

            {/* Bloco Aguardando Resposta ou Retomar */}
            {task.status !== 'WAITING' ? (
              <div className="space-y-2 pt-2 border-t border-[#1f2330]">
                <label className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Aguardar Retorno
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <select
                      value={selectedPersonId}
                      onChange={(e) => setSelectedPersonId(e.target.value)}
                      className="w-full appearance-none bg-[#171a23] border border-[#262b3a] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 pr-8 cursor-pointer"
                    >
                      <option value="">Selecionar pessoa...</option>
                      {people.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                  <button
                    disabled={!selectedPersonId}
                    onClick={handleSetWaiting}
                    className="px-4 py-2 bg-amber-600/90 hover:bg-amber-600 disabled:opacity-40 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5" /> Definir
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-[#1f2330]">
                <button
                  onClick={handleResume}
                  className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <Check className="w-4 h-4" /> Destravar / Retomar Tarefa
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};