import React, { useState, useEffect } from 'react';
import { Shield, Lock, UserCheck, KeyRound, Database, Eye, EyeOff, AlertTriangle, Radio, ArrowRight, Clock } from 'lucide-react';

export default function LoginForm({ loginIdentifier, setLoginIdentifier, loginPin, setLoginPin, loginError, onSubmit, isSupabaseConfigured }) {
  const [showPin, setShowPin] = useState(false);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const inputClass = 'w-full rounded-lg border border-blue-900/70 bg-slate-950/80 py-3.5 pl-11 pr-12 text-sm text-white outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20';
  return (
    <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-2xl border border-blue-500/25 bg-slate-950/90 shadow-2xl shadow-blue-950/60 grid md:grid-cols-2 sigp-login-reveal">
      <style>{`
        @keyframes sigpRadar { to { transform: rotate(360deg); } }
        @keyframes sigpReveal { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: no-preference) {
          .sigp-radar { animation: sigpRadar 4s linear infinite; }
          .sigp-login-reveal { animation: sigpReveal .8s ease-out both; }
        }
      `}</style>
      <section className="relative overflow-hidden bg-slate-950 p-7 sm:p-12 flex flex-col justify-between gap-10 border-b md:border-b-0 md:border-r border-slate-800">
        <div aria-hidden="true" className="absolute inset-0 opacity-20 pointer-events-none" style={{backgroundImage:'linear-gradient(#1e3a8a 1px, transparent 1px), linear-gradient(90deg, #1e3a8a 1px, transparent 1px)',backgroundSize:'45px 45px',maskImage:'linear-gradient(to bottom, black, transparent)'}} />
        <div aria-hidden="true" className="absolute top-0 right-0 w-72 h-72 bg-blue-600/20 blur-3xl rounded-full pointer-events-none" />
        <div className="relative text-xs font-mono tracking-widest text-blue-400">SIGP // CAPITAL VILLE</div>
        <div className="relative flex flex-col items-center text-center">
          <div aria-hidden="true" className="relative w-44 h-44 flex items-center justify-center mb-7">
            <div className="absolute inset-0 rounded-full border border-blue-500/20" />
            <div className="absolute inset-4 rounded-full border border-blue-500/30" />
            <div className="absolute inset-8 rounded-full border border-blue-500/40" />
            <div className="absolute inset-0 rounded-full border-t-2 border-blue-400 sigp-radar" />
            <Shield className="w-16 h-16 text-blue-400 drop-shadow-[0_0_25px_#2563eb]" />
          </div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-[0.25em] text-blue-400 mb-4"><Radio className="w-4 h-4 motion-safe:animate-pulse" /> REDE OPERACIONAL</div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-wider text-white">POLÍCIA MILITAR</h1>
          <h2 className="mt-3 text-lg tracking-[0.3em] text-slate-400">CAPITAL VILLE</h2>
          <p className="mt-5 text-sm text-slate-500">Sistema Integrado de Gestão Policial</p>
        </div>
        <div className="relative border-t border-slate-800 pt-5 flex items-center gap-3">
          <Clock className="w-5 h-5 text-blue-400" />
          <div><div className="font-mono text-2xl tabular-nums text-white">{now.toLocaleTimeString('pt-BR')}</div><div className="text-xs text-slate-400 capitalize">{now.toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</div></div>
        </div>
      </section>
      <section className="p-7 sm:p-12 flex flex-col justify-center">
        <div className="mb-7"><span className="text-xs font-semibold tracking-widest uppercase text-blue-400">Identificação funcional</span><h2 className="mt-2 text-3xl font-bold text-white">Acesso operacional</h2><p className="mt-2 text-sm text-slate-400">Informe suas credenciais para acessar o terminal.</p></div>
        {!isSupabaseConfigured && <div className="mb-5 flex gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300"><Database className="w-4 h-4 shrink-0" /> Modo demonstração local ativo. Supabase não configurado.</div>}
        <form onSubmit={onSubmit} className="space-y-5">
          <div><label htmlFor="sigp-user" className="block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">Nick Roblox ou matrícula</label><div className="relative"><UserCheck className="absolute left-4 top-4 w-4 h-4 text-slate-500 pointer-events-none" /><input id="sigp-user" autoComplete="username" required value={loginIdentifier} onChange={e=>setLoginIdentifier(e.target.value)} placeholder="Ex: PM-001" className={inputClass} /></div></div>
          <div><label htmlFor="sigp-pin" className="block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">Senha / PIN funcional</label><div className="relative"><Lock className="absolute left-4 top-4 w-4 h-4 text-slate-500 pointer-events-none" /><input id="sigp-pin" autoComplete="current-password" type={showPin?'text':'password'} required value={loginPin} onChange={e=>setLoginPin(e.target.value)} placeholder="••••" className={inputClass} /><button type="button" aria-label={showPin?'Ocultar senha':'Mostrar senha'} aria-pressed={showPin} onClick={()=>setShowPin(v=>!v)} className="absolute right-2 top-2 p-2 rounded-lg text-slate-400 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-400">{showPin?<EyeOff className="w-5 h-5" />:<Eye className="w-5 h-5" />}</button></div></div>
          {loginError && <div role="alert" className="flex gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-300"><AlertTriangle className="w-5 h-5 shrink-0" />{loginError}</div>}
          <button type="submit" className="group w-full flex items-center justify-center gap-3 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-[0.99] transition py-4 font-bold text-white shadow-lg shadow-blue-950/50 focus-visible:ring-2 focus-visible:ring-blue-400"><KeyRound className="w-4 h-4" /> Acessar terminal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></button>
        </form>
        <div className="mt-8 pt-5 border-t border-slate-800 text-xs text-slate-400 leading-relaxed">Acesso destinado ao efetivo autorizado. Em caso de dificuldade com suas credenciais, procure o Alto Comando.</div>
        <div className="mt-5 text-[11px] text-slate-500">SIGP • Capital Ville RP</div>
      </section>
    </div>
  );
}
