import React from 'react';
import { Shield, Lock, AlertTriangle, UserCheck, KeyRound, Database } from 'lucide-react';

export default function LoginForm({
  loginIdentifier,
  setLoginIdentifier,
  loginPin,
  setLoginPin,
  loginError,
  onSubmit,
  onQuickFill,
  isSupabaseConfigured,
}) {
  return (
    <div className="w-full max-w-md z-10">
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-8 backdrop-blur-md">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 shadow-lg shadow-blue-900/40 flex items-center justify-center mb-4">
            <Shield className="w-9 h-9 text-blue-400" />
          </div>
          <span className="text-xs font-mono uppercase tracking-widest font-semibold text-blue-400">
            Polícia Militar de Capital Ville • Rede Operacional
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            SIGP — Terminal da Polícia Militar
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Identifique-se com o seu Nick Roblox ou Matrícula para aceder ao sistema.
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
            <Database className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Modo demonstração local ativo. Configure as variáveis do <strong>Supabase</strong> na Vercel para persistir dados na nuvem.
            </span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Nick Roblox ou Matrícula
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="Ex: Felipe, Tsantos ou PM-001"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Senha / PIN Funcional
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••"
                value={loginPin}
                onChange={(e) => setLoginPin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/40 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            Autenticar no Sistema
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2.5 text-center">
            Acesso Rápido (Testes / Comando)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onQuickFill('Felipe', '2026')}
              className="text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 transition"
            >
              <div className="text-xs font-bold text-amber-400">Cmdt. Felipe</div>
              <div className="text-[10px] text-slate-400">Comandante-Geral</div>
            </button>
            <button
              type="button"
              onClick={() => onQuickFill('Tsantos', '1900')}
              className="text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 transition"
            >
              <div className="text-xs font-bold text-blue-400">Subcmdt. Tsantos</div>
              <div className="text-[10px] text-slate-400">Subcomandante</div>
            </button>
            <button
              type="button"
              onClick={() => onQuickFill('lucero', '1903')}
              className="text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 transition"
            >
              <div className="text-xs font-bold text-cyan-400">Sup. Lucero</div>
              <div className="text-[10px] text-slate-400">Supervisor Operacional</div>
            </button>
            <button
              type="button"
              onClick={() => onQuickFill('krussttelles', '1234')}
              className="text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 transition"
            >
              <div className="text-xs font-bold text-slate-200">Sd. Krussttelles</div>
              <div className="text-[10px] text-slate-400">Policial Militar</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
