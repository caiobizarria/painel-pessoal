import React, { useState } from 'react';
import { Plus, Trash2, Folder, Layers } from 'lucide-react';
import type { Front } from '../../core/types';
import { db } from '../../db/dexie';

interface FrontsViewProps {
  fronts: Front[];
}

export const FrontsView: React.FC<FrontsViewProps> = ({ fronts }) => {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('💼');
  const [color, setColor] = useState('#3b82f6');
  const [isCreating, setIsCreating] = useState(false);

  const presetEmojis = ['💼', '📈', '🐴', '🎬', '🏠', '🎯', '💡', '⚖️'];
  const presetColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const handleCreateFront = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const now = new Date().toISOString();
    await db.fronts.add({
      id: crypto.randomUUID(),
      name: name.trim(),
      emoji: emoji.trim() || '📁',
      color,
      order: fronts.length,
      createdAt: now,
      updatedAt: now,
    });

    setName('');
    setIsCreating(false);
  };

  const handleDeleteFront = async (id: string) => {
    if (confirm('Deseja realmente remover esta frente?')) {
      await db.fronts.delete(id);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 pb-28">
      <div className="flex items-center justify-between pt-4 border-b border-[#232734] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-500" /> Frentes de Trabalho
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Pilares estratégicos e operacionais da sua rotina
          </p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition-all"
        >
          <Plus className="w-4 h-4" /> Nova
        </button>
      </div>

      {isCreating && (
        <form
          onSubmit={handleCreateFront}
          className="bg-[#12141a] border border-[#232734] rounded-2xl p-4 space-y-4 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Nome da Frente
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ex: Comercial, Produção, Gestão..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#171a23] border border-[#262b3a] rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Ícone / Emoji
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                maxLength={2}
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="w-10 h-10 text-center bg-[#171a23] border border-[#262b3a] rounded-xl text-base focus:outline-none focus:border-blue-500"
              />
              <div className="flex gap-1.5 flex-wrap">
                {presetEmojis.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setEmoji(em)}
                    className="w-8 h-8 rounded-lg bg-[#171a23] hover:bg-[#202533] border border-[#262b3a] flex items-center justify-center text-sm transition-colors"
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Cor de Destaque
            </label>
            <div className="flex gap-2 items-center">
              {presetColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
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
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all"
            >
              Salvar Frente
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2.5">
        {fronts.length === 0 ? (
          <div className="text-center py-12 px-4 bg-[#12141a] rounded-2xl border border-[#232734]">
            <Folder className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-xs text-slate-300 font-medium">Nenhuma frente cadastrada ainda</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Crie categorias para agrupar suas tarefas por projetos ou áreas.
            </p>
          </div>
        ) : (
          fronts.map((front) => (
            <div
              key={front.id}
              className="flex items-center justify-between p-3.5 bg-[#12141a] border border-[#232734] rounded-xl hover:border-[#2d3243] transition-all"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base border"
                  style={{
                    backgroundColor: `${front.color || '#3b82f6'}15`,
                    borderColor: `${front.color || '#3b82f6'}30`,
                  }}
                >
                  {front.emoji || '📁'}
                </span>
                <div>
                  <h3 className="text-xs font-semibold text-slate-100">{front.name}</h3>
                  <span className="text-[10px] text-slate-400">Ativa</span>
                </div>
              </div>

              <button
                onClick={() => handleDeleteFront(front.id)}
                className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-[#1a1d26] transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};