
import React from 'react';
import {
  Shield,
  LogOut,
  Radio,
  Users,
  Car,
  FileText,
  Award,
  Scale,
  Megaphone,
  Search,
  Volume2,
  ArrowLeft
} from 'lucide-react';

import { formatDuration } from '../../utils/formatters';

export default function Header({
  currentUser,
  globalSearch,
  setGlobalSearch,
  activeShift,
  activeShiftFines,
  elapsedSeconds,
  isHighRank,
  isHighCommand,
  soundEnabled,
  setSoundEnabled,
  soundEnabledRef,
  unlockAudioContext,
  playNotificationSound,
  handleLogout,
  activeTab,
  setActiveTab,
  activeShiftsAll,
  pendingReportsCount
}) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white tracking-tight">
                SIGP CAPITAL VILLE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                RP MILITAR
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Oficial: <strong className="text-slate-200">{currentUser.rp_name}</strong> (@{currentUser.roblox_nick}) •{' '}
              <span className="text-amber-400 font-semibold">
                {currentUser.rank_name}
              </span>
            </p>
          </div>
        </div>

        <div className="flex-1 max-w-xs min-w-[180px]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Buscar Passaporte, Nome ou Placa..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeShift ? (
            <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/40 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono font-bold text-emerald-300">
                {formatDuration(elapsedSeconds)}
              </span>

              {activeShiftFines.length > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/35">
                  {activeShiftFines.length} multa(s)
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-xs font-mono text-slate-300">
                FORA DE SERVIÇO
              </span>
            </div>
          )}

          {isHighRank && (
            <button
              type="button"
              onClick={async () => {
                unlockAudioContext();

                if (!soundEnabled) {
                  setSoundEnabled(true);
                  soundEnabledRef.current = true;
                  await playNotificationSound();
                } else {
                  await playNotificationSound();
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setSoundEnabled((prev) => !prev);
              }}
              title="Clique para testar o som (botão direito para ativar/mutar)"
              className={`p-2 rounded-xl border text-xs font-semibold transition flex items-center gap-1 ${
                soundEnabled
                  ? 'bg-amber-500/15 border-amber-500/35 text-amber-300 hover:bg-amber-500/25'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden md:inline">
                {soundEnabled ? 'Som ON' : 'Mudo'}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('operacional')}
            title="Voltar ao painel operacional"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Painel</span>
          </button>

          <button
            onClick={handleLogout}
            title="Sair do Terminal"
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 border border-slate-700 text-slate-200 transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-2.5 pt-1 flex flex-wrap items-center gap-1.5">
        {isHighCommand && (
          <button
            onClick={() => setActiveTab('comando')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'comando'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-amber-400/90 hover:bg-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Alto Comando ({activeShiftsAll.length})

            {isHighRank && pendingReportsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/25 text-amber-200 border border-amber-500/40">
                {pendingReportsCount}
              </span>
            )}
          </button>
        )}

        {[
          { id: 'operacional', label: 'Ponto & Patrulha', Icon: Radio },
          { id: 'infopen', label: 'INFOPEN', Icon: Users },
          { id: 'veiculos', label: 'RENAVAM', Icon: Car },
          { id: 'relatorios', label: 'Relatórios', Icon: FileText },
          { id: 'codigo-penal', label: 'Código Penal', Icon: Scale },
          { id: 'hierarquia', label: 'Hierarquia & Mural', Icon: Megaphone }
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === id
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>
    </header>
  );
}

