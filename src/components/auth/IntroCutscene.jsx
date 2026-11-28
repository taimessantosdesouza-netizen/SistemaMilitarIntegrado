import React, { useEffect, useState } from 'react';
import { Shield, ChevronRight } from 'lucide-react';

export default function IntroCutscene({ onFinish }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();

    const timer = setInterval(() => {
      const value = Math.min(
        ((Date.now() - start) / 5000) * 100,
        100
      );

      setProgress(value);
    }, 30);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress >= 100) onFinish();
  }, [progress, onFinish]);

  const message =
    progress < 25 ? 'INICIALIZANDO TERMINAL...' :
    progress < 50 ? 'CARREGANDO INTERFACE OPERACIONAL...' :
    progress < 75 ? 'PREPARANDO IDENTIFICAÇÃO FUNCIONAL...' :
    'TERMINAL PRONTO PARA ACESSO';

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 text-white flex flex-col items-center justify-center overflow-hidden">

      <style>{`
        @keyframes introReveal {
          from { opacity: 0; transform: scale(.75); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes radarSpin {
          to { transform: rotate(360deg); }
        }

        .intro-reveal {
          animation: introReveal 1.5s ease-out both;
        }

        .radar-spin {
          animation: radarSpin 4s linear infinite;
        }
      `}</style>

      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(#1e3a8a 1px, transparent 1px), linear-gradient(90deg, #1e3a8a 1px, transparent 1px)',
          backgroundSize: '45px 45px'
        }}
      />

      <div className="absolute w-96 h-96 bg-blue-600/10 blur-3xl rounded-full" />

      <div className="absolute inset-0 pointer-events-none">
  <img
    src="/gvcr.png"
    alt=""
    className="w-full h-full object-cover opacity-20"
  />
  <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/30 to-slate-950" />
</div>

      <div className="absolute top-6 left-6 text-xs font-mono tracking-widest text-blue-400">
        SIGP // CAPITAL VILLE
      </div>

      <div className="relative intro-reveal flex flex-col items-center px-6 text-center">

        <div className="relative w-48 h-48 flex items-center justify-center mb-8">

          <div className="absolute inset-0 rounded-full border border-blue-500/20" />

          <div className="absolute inset-4 rounded-full border border-blue-500/30" />

          <div className="absolute inset-8 rounded-full border border-blue-500/40" />

          <div className="absolute inset-0 rounded-full border-t-2 border-blue-400 radar-spin" />

          {progress < 40 ? (
  <img
    src="/gvcr.png"
    alt="GVCR"
    className="w-32 h-32 object-cover rounded-2xl intro-reveal shadow-[0_0_40px_#2563eb]"
  />
) : (
  <Shield className="w-20 h-20 text-blue-400 intro-reveal drop-shadow-[0_0_25px_#2563eb]" />
)}
        </div>

        <p className="text-blue-400 text-xs font-mono tracking-[0.4em] mb-4">
          REDE OPERACIONAL
        </p>

        <h1 className="text-3xl md:text-5xl font-black tracking-wider">
          POLÍCIA MILITAR
        </h1>

        <h2 className="text-lg md:text-2xl text-slate-400 tracking-[0.3em] mt-3">
          CAPITAL VILLE
        </h2>

        <p className="mt-5 text-sm text-slate-500">
          Sistema Integrado de Gestão Policial
        </p>

        <div className="w-64 md:w-96 mt-12">

          <div className="flex justify-between text-[10px] font-mono text-blue-400 mb-3">
            <span>{message}</span>
            <span>{Math.floor(progress)}%</span>
          </div>

          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>

        </div>

      </div>

      <button
        type="button"
        onClick={onFinish}
        className="absolute bottom-6 right-6 flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
      >
        Pular introdução
        <ChevronRight className="w-4 h-4" />
      </button>

      <div className="absolute bottom-6 left-6 text-[10px] font-mono text-slate-600">
        SIGP • CAPITAL VILLE RP
      </div>

    </div>
  );
}
