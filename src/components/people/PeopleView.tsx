import React, { useState } from 'react';
import { Plus, Trash2, User, Users, Mail, Phone } from 'lucide-react';
import type { Person } from '../../core/types';
import { db } from '../../db/dexie';

interface PeopleViewProps {
  people: Person[];
}

export const PeopleView: React.FC<PeopleViewProps> = ({ people }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const now = new Date().toISOString();
    await db.people.add({
      id: crypto.randomUUID(),
      name: name.trim(),
      role: role.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    });

    setName('');
    setRole('');
    setEmail('');
    setPhone('');
    setIsCreating(false);
  };

  const handleDeletePerson = async (id: string) => {
    if (confirm('Deseja realmente remover este contato?')) {
      await db.people.delete(id);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between pt-4 border-b border-[#232734] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" /> Contatos & Responsáveis
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Pessoas vinculadas a delegações e retornos pendentes
          </p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition-all"
        >
          <Plus className="w-4 h-4" /> Novo
        </button>
      </div>

      {/* Formulário de Criação */}
      {isCreating && (
        <form
          onSubmit={handleCreatePerson}
          className="bg-[#12141a] border border-[#232734] rounded-2xl p-4 space-y-3.5 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Nome
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ex: Carlos Silva, Fornecedor X..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#171a23] border border-[#262b3a] rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Cargo / Papel / Relação
            </label>
            <input
              type="text"
              placeholder="Ex: Gerente de Projetos, Cliente, Financeiro..."
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-[#171a23] border border-[#262b3a] rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                E-mail (opcional)
              </label>
              <input
                type="email"
                placeholder="nome@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#171a23] border border-[#262b3a] rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Telefone (opcional)
              </label>
              <input
                type="text"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#171a23] border border-[#262b3a] rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
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
              Salvar Contato
            </button>
          </div>
        </form>
      )}

      {/* Lista de Contatos */}
      <div className="space-y-2.5">
        {people.length === 0 ? (
          <div className="text-center py-12 px-4 bg-[#12141a] rounded-2xl border border-[#232734]">
            <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-xs text-slate-300 font-medium">Nenhum contato cadastrado ainda</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Cadastre pessoas para atribuir pendências de resposta no painel.
            </p>
          </div>
        ) : (
          people.map((person) => (
            <div
              key={person.id}
              className="flex items-center justify-between p-3.5 bg-[#12141a] border border-[#232734] rounded-xl hover:border-[#2d3243] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-100">{person.name}</h3>
                  {person.role && (
                    <span className="text-[10px] text-slate-400 block">{person.role}</span>
                  )}
                  {(person.email || person.phone) && (
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                      {person.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {person.email}
                        </span>
                      )}
                      {person.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {person.phone}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleDeletePerson(person.id)}
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