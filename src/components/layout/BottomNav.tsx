import React from 'react';
import { Sun, Layers, CheckSquare, Lightbulb, Users } from 'lucide-react';

export type TabType = 'today' | 'fronts' | 'tasks' | 'ideas' | 'people';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'today' as TabType, label: 'Hoje', icon: Sun },
    { id: 'fronts' as TabType, label: 'Frentes', icon: Layers },
    { id: 'tasks' as TabType, label: 'Tarefas', icon: CheckSquare },
    { id: 'ideas' as TabType, label: 'Ideias', icon: Lightbulb },
    { id: 'people' as TabType, label: 'Contatos', icon: Users },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#13151c]/95 backdrop-blur-md border-t border-[#272b37] z-20">
      <div className="max-w-lg mx-auto flex justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
                isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};