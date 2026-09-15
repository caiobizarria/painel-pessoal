import React, { useState, useEffect } from 'react';
import { Search, X, CheckSquare, Lightbulb, CheckCircle2, Circle } from 'lucide-react';
import type { Task, Idea, Front } from '../../core/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  ideas: Idea[];
  frontsMap: Map<string, Front>;
  onSelectTask: (task: Task) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  tasks,
  ideas,
  frontsMap,
  onSelectTask,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedQuery = query.toLowerCase().trim();

  const filteredTasks = normalizedQuery
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(normalizedQuery) ||
          (t.description && t.description.toLowerCase().includes(normalizedQuery))
      )
    : [];

  const filteredIdeas = normalizedQuery
    ? ideas.filter((i) => i.content.toLowerCase().includes(normalizedQuery))
    : [];

  const hasResults = filteredTasks.length > 0 || filteredIdeas.length > 0;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-start justify-center p-4 sm:pt-16">
      <div className="bg-[#12141a] border border-[#232734] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-0 animate-in fade-in zoom-in-95 duration-150">
        {/* Barra de Entrada */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#1f2330] gap-3">
          <Search className="w-5 h-5 text-blue-500 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Buscar tarefas, notas ou ideias... (ESC para fechar)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-500 hover:text-slate-300 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 px-2 py-1 text-xs bg-[#171a23] border border-[#262b3a] rounded-lg"
          >
            ESC
          </button>
        </div>

        {/* Resultados */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {!normalizedQuery && (
            <div className="text-center py-8 text-slate-500 text-xs">
              Digite uma palavra-chave para buscar no seu painel.
            </div>
          )}

          {normalizedQuery && !hasResults && (
            <div className="text-center py-8 text-slate-500 text-xs">
              Nenhum resultado encontrado para &quot;{query}&quot;.
            </div>
          )}

          {/* Tarefas Encontradas */}
          {filteredTasks.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 block">
                Tarefas ({filteredTasks.length})
              </span>
              {filteredTasks.map((t) => {
                const front = t.frontId ? frontsMap.get(t.frontId) : null;
                const isCompleted = t.status === 'COMPLETED';

                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      onSelectTask(t);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-[#171a23] hover:bg-[#1f2433] border border-[#262b3a] flex items-center justify-between gap-3 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                      <span
                        className={`text-xs text-slate-200 truncate ${
                          isCompleted ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {t.title}
                      </span>
                    </div>
                    {front && (
                      <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1 bg-[#12141a] px-2 py-0.5 rounded-md border border-[#232734]">
                        <span>{front.emoji}</span>
                        <span>{front.name}</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Ideias Encontradas */}
          {filteredIdeas.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 block">
                Ideias ({filteredIdeas.length})
              </span>
              {filteredIdeas.map((i) => {
                const front = i.frontId ? frontsMap.get(i.frontId) : null;

                return (
                  <div
                    key={i.id}
                    className="p-2.5 rounded-xl bg-[#171a23] border border-[#262b3a] flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-300 leading-snug line-clamp-2">
                        {i.content}
                      </p>
                    </div>
                    {front && (
                      <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1 bg-[#12141a] px-2 py-0.5 rounded-md border border-[#232734]">
                        <span>{front.emoji}</span>
                        <span>{front.name}</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};