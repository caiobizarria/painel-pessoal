import React, { useState } from 'react';
import { CheckSquare, CheckCircle2, Circle, Trash2, Filter, Flag } from 'lucide-react';
import type { Task, Front } from '../../core/types';
import { db } from '../../db/dexie';

interface TasksViewProps {
  tasks: Task[];
  frontsMap: Map<string, Front>;
  onSelectTask: (task: Task) => void;
}

type FilterType = 'ALL' | 'PENDING' | 'COMPLETED';

export const TasksView: React.FC<TasksViewProps> = ({ tasks, frontsMap, onSelectTask }) => {
  const [filter, setFilter] = useState<FilterType>('PENDING');
  const [selectedFront, setSelectedFront] = useState<string>('ALL');

  const filteredTasks = tasks.filter((task) => {
    // Filtro de status
    if (filter === 'PENDING' && task.status === 'COMPLETED') return false;
    if (filter === 'COMPLETED' && task.status !== 'COMPLETED') return false;

    // Filtro por Frente
    if (selectedFront !== 'ALL' && task.frontId !== selectedFront) return false;

    return true;
  });

  const handleToggleComplete = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    const now = new Date().toISOString();
    const isCurrentlyDone = task.status === 'COMPLETED';

    await db.tasks.update(task.id, {
      status: isCurrentlyDone ? 'INBOX' : 'COMPLETED',
      completedAt: isCurrentlyDone ? undefined : now,
      updatedAt: now,
      lastMeaningfulMovementAt: now,
    });
  };

  const handleDeleteTask = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Deseja excluir esta tarefa?')) {
      await db.tasks.delete(id);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      case 'MEDIUM':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      default:
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-5 pb-28">
      {/* Header */}
      <div className="pt-4 border-b border-[#232734] pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-blue-500" /> Todas as Tarefas
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Visão geral do backlog, pendências e histórico
        </p>
      </div>

      {/* Controles de Filtros */}
      <div className="space-y-2.5">
        {/* Status Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-[#12141a] p-1 rounded-xl border border-[#232734]">
          <button
            onClick={() => setFilter('PENDING')}
            className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
              filter === 'PENDING'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
              filter === 'COMPLETED'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Concluídas
          </button>
          <button
            onClick={() => setFilter('ALL')}
            className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
              filter === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todas
          </button>
        </div>

        {/* Filtro por Frente */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedFront('ALL')}
            className={`px-3 py-1 text-xs font-medium rounded-lg border whitespace-nowrap transition-all ${
              selectedFront === 'ALL'
                ? 'bg-[#1f2433] text-white border-blue-500/50'
                : 'bg-[#12141a] text-slate-400 border-[#232734] hover:bg-[#1a1d26]'
            }`}
          >
            Todas as Frentes
          </button>
          {Array.from(frontsMap.values()).map((front) => (
            <button
              key={front.id}
              onClick={() => setSelectedFront(front.id)}
              className={`px-3 py-1 text-xs font-medium rounded-lg border whitespace-nowrap flex items-center gap-1.5 transition-all ${
                selectedFront === front.id
                  ? 'bg-[#1f2433] text-white border-blue-500/50'
                  : 'bg-[#12141a] text-slate-400 border-[#232734] hover:bg-[#1a1d26]'
              }`}
            >
              <span>{front.emoji || '📁'}</span>
              <span>{front.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Tarefas */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 px-4 bg-[#12141a] rounded-2xl border border-[#232734]">
            <CheckSquare className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-xs text-slate-300 font-medium">Nenhuma tarefa encontrada</p>
            <p className="text-[11px] text-slate-500 mt-1">
              {filter === 'COMPLETED'
                ? 'Você ainda não concluiu tarefas com os filtros atuais.'
                : 'Nenhuma pendência em aberto para esta visualização.'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const front = task.frontId ? frontsMap.get(task.frontId) : null;
            const isCompleted = task.status === 'COMPLETED';

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className={`p-3.5 bg-[#12141a] border border-[#232734] hover:border-[#2f3548] rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isCompleted ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Botão de Marcar Concluído */}
                  <button
                    onClick={(e) => handleToggleComplete(e, task)}
                    className="text-slate-500 hover:text-blue-400 pt-0.5 shrink-0 transition-colors"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`text-xs font-medium text-slate-100 truncate ${
                          isCompleted ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {task.title}
                      </h3>
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border uppercase ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority === 'HIGH'
                          ? 'Alta'
                          : task.priority === 'MEDIUM'
                          ? 'Média'
                          : 'Baixa'}
                      </span>
                    </div>

                    {front && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                        <span>{front.emoji}</span>
                        <span>{front.name}</span>
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => handleDeleteTask(e, task.id)}
                  className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-[#1a1d26] transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};