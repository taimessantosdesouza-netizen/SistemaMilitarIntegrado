import React from 'react';
import { Scale } from 'lucide-react';
import { PENAL_ARTICLES } from '../constants/penalArticles';

export default function CodigoPenal({ selectedArticles, setSelectedArticles, penaltySummary, activeShift, fineTarget, setFineTarget, handleRegisterShiftFine, fineFeedback, setFineFeedback }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-3 relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/80 to-slate-950 p-5 shadow-lg shadow-blue-950/40">
        <div className="flex items-center gap-4">
          <img src="/gvcr.png" alt="GVCR" className="w-16 h-16 rounded-xl object-cover border border-blue-400/40" />
          <div>
            <p className="text-[10px] tracking-widest text-blue-400 font-mono">SIGP / CENTRAL DE LEGISLAÇÃO</p>
            <h1 className="text-2xl font-extrabold text-white">Código Penal</h1>
            <p className="text-xs text-slate-400">Consulta de artigos e cálculo de penalidades</p>
          </div>
        </div>
      </div>
            <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur-sm border border-blue-500/25 shadow-lg shadow-blue-950/30 rounded-2xl p-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <Scale className="w-5 h-5 text-blue-400" />
                Calculadora Penal — Selecione os Artigos Aplicados
              </h2>
              <div className="space-y-2.5">
                
{PENAL_ARTICLES.length === 0 && (
  <div className="bg-slate-950/80 border border-blue-500/20 rounded-xl p-8 text-center">
    <Scale className="w-10 h-10 text-blue-400 mx-auto mb-3" />
    <h3 className="text-white font-bold">
      Código Penal em elaboração
    </h3>
    <p className="text-sm text-slate-400 mt-2">
      Aguardando a publicação da tabela oficial
      de crimes, penas e multas pelo Comando.
    </p>
  </div>
)}

                {PENAL_ARTICLES.map((art) => {
                  const checked = selectedArticles.includes(art.id);
                  return (
                    <label
                      key={art.id}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                        checked
                          ? 'bg-blue-600/15 border-blue-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-blue-400/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setSelectedArticles((prev) =>
                              prev.includes(art.id) ? prev.filter((x) => x !== art.id) : [...prev, art.id]
                            )
                          }
                        />
                        <div>
                          <div className="text-xs font-bold">
                            {art.code} — {art.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {art.bail ? 'Permite fiança' : 'Inafiançável'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-mono text-xs">
                        <div className="font-bold text-amber-400">{art.months} meses</div>
                        <div className="text-emerald-400">${(art.fine ?? 0).toLocaleString()}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-sm border border-blue-500/25 shadow-lg shadow-blue-950/30 rounded-2xl p-5 h-fit space-y-4">
              <h3 className="text-base font-bold text-white">Resumo da Pena & Registro no Ponto</h3>
              <div className="bg-slate-950/80 border border-blue-500/20 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Artigos selecionados:</span>
                  <span className="font-mono font-extrabold text-white text-base">{penaltySummary.count}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Tempo de Prisão:</span>
                  <span className="font-mono font-extrabold text-amber-400 text-base">
                    {penaltySummary.totalMonths} meses
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Multa Total:</span>
                  <span className="font-mono font-extrabold text-emerald-400 text-base">
                    ${penaltySummary.totalFine.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Situação de Fiança:</span>
                  <span className={`font-bold ${penaltySummary.hasNonBailable ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {penaltySummary.count === 0 ? '—' : penaltySummary.hasNonBailable ? 'INAFIANÇÁVEL' : 'AFIANÇÁVEL'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-blue-500/20 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold">
                    Passaporte, Nome ou Placa do Autuado
                  </label>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    activeShift
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {activeShift ? 'Ponto Ativo' : 'Ponto Fechado'}
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="Ex: PTN-1001, Nickolas Silva ou PTN-9X88"
                  value={fineTarget}
                  onChange={(e) => setFineTarget(e.target.value)}
                  className="w-full bg-slate-950/80 border border-blue-500/20 rounded-lg px-3 py-2 text-white"
                />
                <button
                  type="button"
                  disabled={penaltySummary.count === 0}
                  onClick={handleRegisterShiftFine}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-white font-bold transition"
                >
                  Aplicar Multa e Registrar no Turno
                </button>
                {fineFeedback && (
                  <p className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5">
                    {fineFeedback}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedArticles([]);
                  setFineFeedback('');
                }}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Limpar Seleção
              </button>
            </div>
          </div>
  );
}
