import React, { useState } from 'react';
import { Flame, Shield, ArrowRight } from 'lucide-react';
import BombeirosApp from './BombeirosApp';
import PoliciaApp from './PoliciaApp';

export default function App() {
  const [selectedCorps, setSelectedCorps] = useState(() => {
    const saved = localStorage.getItem('sigp_pantanoria_selected_corps');
    if (saved === 'bombeiros' || saved === 'policia') return saved;
    if (localStorage.getItem('sigp_pantanoria_bm_user')) return 'bombeiros';
    if (localStorage.getItem('sigp_pantanoria_user')) return 'policia';
    return null;
  });

  const handleSelectCorps = (corps) => {
    setSelectedCorps(corps);
    localStorage.setItem('sigp_pantanoria_selected_corps', corps);
  };

  const handleSwitchCorps = () => {
    setSelectedCorps(null);
    localStorage.removeItem('sigp_pantanoria_selected_corps');
  };

  if (selectedCorps === 'bombeiros') {
    return <BombeirosApp onSwitchCorps={handleSwitchCorps} />;
  }

  if (selectedCorps === 'policia') {
    return <PoliciaApp onSwitchCorps={handleSwitchCorps} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/25 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="w-full max-w-lg z-10 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold">
            Estado de Pantanória • Rede Integrada de Segurança e Resgate
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Portal das Corporações
          </h1>
          <p className="text-xs text-slate-400">
            Escolha qual sistema deseja abrir neste terminal.
          </p>
        </div>

        <div className="space-y-4">
          {/* 1. ACESSO BOMBEIROS (Tema Vermelho) */}
          <button
            type="button"
            onClick={() => handleSelectCorps('bombeiros')}
            className="w-full text-left group bg-gradient-to-r from-red-950/70 via-slate-900 to-slate-900 hover:from-red-900/60 border border-red-500/45 hover:border-red-400 rounded-2xl p-6 transition shadow-xl shadow-red-950/30 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-600/25 border border-red-500/50 flex items-center justify-center shrink-0">
                <Flame className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-red-400 font-bold">
                  Corpo de Bombeiros Militar • CBM
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                  ACESSO BOMBEIROS
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Plantão operacional, resgate APH, combate a incêndios, prontuário médico e comando CBM.
                </p>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-red-400 group-hover:translate-x-1 transition shrink-0" />
          </button>

          {/* 2. ACESSO POLÍCIA MILITAR (Tema Azul) */}
          <button
            type="button"
            onClick={() => handleSelectCorps('policia')}
            className="w-full text-left group bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-900 hover:from-blue-900/60 border border-blue-500/40 hover:border-blue-400 rounded-2xl p-6 transition shadow-xl shadow-blue-950/30 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/25 border border-blue-500/50 flex items-center justify-center shrink-0">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-blue-400 font-bold">
                  Polícia Militar de Pantanória • SIGP
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                  ACESSO POLÍCIA MILITAR
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Ponto eletrônico, INFOPEN, RENAVAM, relatórios pós-ocorrência, código penal e alto comando.
                </p>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-blue-400 group-hover:translate-x-1 transition shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
