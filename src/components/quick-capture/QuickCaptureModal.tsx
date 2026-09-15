import React, { useState } from 'react';
import { X, ChevronDown, Flag } from 'lucide-react';
import type { Front, TaskPriority } from '../../core/types';
import { db } from '../../db/dexie';

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  fronts: Front[];
}

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({
  isOpen,
  onClose,
  fronts,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frontId, setFrontId] = useState<string>('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const now = new Date().toISOString();

      await db.tasks.add({
        id: crypto.randomUUID(),
        title: title.trim(),
        description: description.trim() || undefined,
        frontId: frontId || undefined,
        priority,
        status: 'INBOX',
        scheduledDate: now.split('T')[0],
        syncStatus: 'LOCAL',
        createdAt: now,
        updatedAt: now,
        lastMeaningfulMovementAt: now,
      });

      setTitle('');
      setDescription('');
      setFrontId('');
      setPriority('MEDIUM');
      onClose();
    } catch (err) {
      console.error('Erro ao criar tarefa:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#12141a] border border-[#232734] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-1 border-b border-[#1f2330]">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">Nova Tarefa</h2>
            <p className="text-xs text-slate-400">Capture rapidamente o que precisa ser feito</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#1a1d26] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div>
            <input
              type="text"
              required
              autoFocus
              placeholder="O que precisa ser feito?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#171a23] border border-[#262b3a] rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Descrição */}
          <div>
            <textarea
              rows={2}
              placeholder="Adicionar notas ou contexto (opcional)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#171a23] border border-[#262b3a] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
            />
          </div>

          {/* Frente e Prioridade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Seletor Customizado de Frente */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Frente
              </label>
              <div className="relative">
                <select
                  value={frontId}
                  onChange={(e) => setFrontId(e.target.value)}
                  className="w-full appearance-none bg-[#171a23] border border-[#262b3a] rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer pr-8"
                >
                  <option value="">📁 Geral / Sem frente</option>
                  {fronts.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.emoji ? `${f.emoji} ` : ''}{f.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Chips de Prioridade */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Prioridade
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPriority('LOW')}
                  className={`py-2 px-2 text-xs font-medium rounded-xl border flex items-center justify-center gap-1 transition-all ${
                    priority === 'LOW'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-[#171a23] text-slate-400 border-[#262b3a] hover:bg-[#1f2330]'
                  }`}
                >
                  <Flag className="w-3 h-3" /> Baixa
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('MEDIUM')}
                  className={`py-2 px-2 text-xs font-medium rounded-xl border flex items-center justify-center gap-1 transition-all ${
                    priority === 'MEDIUM'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-[#171a23] text-slate-400 border-[#262b3a] hover:bg-[#1f2330]'
                  }`}
                >
                  <Flag className="w-3 h-3" /> Média
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('HIGH')}
                  className={`py-2 px-2 text-xs font-medium rounded-xl border flex items-center justify-center gap-1 transition-all ${
                    priority === 'HIGH'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                      : 'bg-[#171a23] text-slate-400 border-[#262b3a] hover:bg-[#1f2330]'
                  }`}
                >
                  <Flag className="w-3 h-3" /> Alta
                </button>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="pt-3 flex justify-end items-center gap-2 border-t border-[#1f2330]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-slate-200 text-xs font-medium rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95"
            >
              {isSubmitting ? 'Criando...' : 'Adicionar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};