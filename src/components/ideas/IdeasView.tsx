import React, { useState } from 'react';
import { Lightbulb, Plus, Trash2, ArrowRight, ChevronDown } from 'lucide-react';
import type { Idea, Front } from '../../core/types';
import { db } from '../../db/dexie';

interface IdeasViewProps {
  ideas: Idea[];
  frontsMap: Map<string, Front>;
}

export const IdeasView: React.FC<IdeasViewProps> = ({ ideas, frontsMap }) => {
  const [content, setContent] = useState('');
  const [frontId, setFrontId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const now = new Date().toISOString();
    await db.ideas.add({
      id: crypto.randomUUID(),
      content: content.trim(),
      frontId: frontId || undefined,
      syncStatus: 'LOCAL',
      createdAt: now,
      updatedAt: now,
    });

    setContent('');
    setFrontId('');
    setIsCreating(false);
  };

  const handleDeleteIdea = async (id: string) => {
    if (confirm('Deseja excluir esta ideia?')) {
      await db.ideas.delete(id);
    }
  };

  const handleConvertToTask = async (idea: Idea) => {
    const now = new Date().toISOString();

    // Cria a tarefa a partir da ideia
    await db.tasks.add({
      id: crypto.randomUUID(),
      title: idea.content,
      frontId: idea.frontId,
      priority: 'MEDIUM',
      status: 'INBOX',
      scheduledDate: now.split('T')[0],
      syncStatus: 'LOCAL',
      createdAt: now,
      updatedAt: now,
      lastMeaningfulMovementAt: now,
    });

    // Remove a ideia original
    await db.ideas.delete(idea.id);
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between pt-4 border-b border-[#232734] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" /> Banco de Ideias
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Pensamentos, insights e rascunhos livres
          </p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition-all"
        >
          <Plus className="w-4 h-4" /> Nova Ideia
        </button>
      </div>

      {/* Formulário de Criação */}
      {isCreating && (
        <form
          onSubmit={handleCreateIdea}
          className="bg-[#12141a] border border-[#232734] rounded-2xl p-4 space-y-3.5 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Conteúdo da Ideia
            </label>
            <textarea
              rows={3}
              required
              autoFocus
              placeholder="Descreva sua ideia, reflexão ou insight..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[#171a23] border border-[#262b3a] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Frente (opcional)
            </label>
            <div className="relative">
              <select
                value={frontId}
                onChange={(e) => setFrontId(e.target.value)}
                className="w-full appearance-none bg-[#171a23] border border-[#262b3a] rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 pr-8 cursor-pointer"
              >
                <option value="">📁 Sem frente associada</option>
                {Array.from(frontsMap.values()).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.emoji ? `${f.emoji} ` : ''}{f.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#1f2330]">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 text-slate-400 hover:text-slate-200 text-xs font-medium rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition-all"
            >
              Salvar Ideia
            </button>
          </div>
        </form>
      )}

      {/* Lista de Ideias */}
      <div className="space-y-3">
        {ideas.length === 0 ? (
          <div className="text-center py-12 px-4 bg-[#12141a] rounded-2xl border border-[#232734]">
            <Lightbulb className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-xs text-slate-300 font-medium">Nenhuma ideia registrada ainda</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Guarde lampejos criativos aqui e transforme-os em tarefas quando for o momento.
            </p>
          </div>
        ) : (
          ideas.map((idea) => {
            const front = idea.frontId ? frontsMap.get(idea.frontId) : null;

            return (
              <div
                key={idea.id}
                className="p-4 bg-[#12141a] border border-[#232734] rounded-2xl space-y-3 hover:border-[#2d3243] transition-all"
              >
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {idea.content}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[#1a1d26]">
                  {front ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#171a23] text-[10px] font-medium text-slate-400 border border-[#262b3a]">
                      <span>{front.emoji}</span>
                      <span>{front.name}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">Geral</span>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleConvertToTask(idea)}
                      title="Transformar em Tarefa"
                      className="px-2.5 py-1 text-[11px] text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-600 rounded-lg flex items-center gap-1 transition-all active:scale-95"
                    >
                      <span>Mover p/ Tarefas</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteIdea(idea.id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-[#1a1d26] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};