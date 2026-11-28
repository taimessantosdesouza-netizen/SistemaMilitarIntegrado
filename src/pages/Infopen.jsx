import React from 'react';
import { Users, Plus, Fingerprint } from 'lucide-react';

export default function Infopen({
  citizenSearch,
  setCitizenSearch,
  filteredCitizens,
  handleUpdateCitizenStatus,
  crimeInput,
  setCrimeInput,
  handleAddCrimeRecord,
  handleAddCitizen,
  newCitizen,
  setNewCitizen
}) {
  return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="lg:col-span-3 relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/70 to-slate-950/90 p-6 shadow-lg shadow-blue-950/30">
              <div className="flex flex-wrap items-center gap-5">
                <div className="w-16 h-16 shrink-0 rounded-xl bg-blue-500/10 border border-blue-400/40 flex items-center justify-center shadow-lg shadow-blue-950/40"><Fingerprint className="w-8 h-8 text-blue-400" aria-hidden="true" /></div>
                <div className="flex-1 min-w-[180px]">
                  <p className="text-[10px] font-mono tracking-widest text-blue-400">SIGP / CENTRAL DE INTELIGÊNCIA</p>
                  <h1 className="text-2xl md:text-3xl font-black text-white mt-2">INFOPEN</h1>
                  <p className="text-sm text-slate-400 mt-1">Consulta de cidadãos e antecedentes criminais</p>
                </div>
                <div className="rounded-xl border border-blue-500/30 bg-slate-950/70 px-5 py-3">
                  <p className="text-2xl font-bold text-blue-300">{filteredCitizens.length}</p>
                  <p className="text-xs text-slate-400">Resultados da consulta</p>
                </div>
              </div>
            </section>
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900/80 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-5 shadow-lg shadow-blue-950/20">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    INFOPEN — Fichas Criminais e Antecedentes
                  </h2>
                  <input
                    type="text"
                    placeholder="Filtrar por Passaporte, Nome ou Nick..."
                    value={citizenSearch}
                    onChange={(e) => setCitizenSearch(e.target.value)}
                    className="bg-slate-950 border border-blue-500/30 focus:border-blue-400 focus:ring-1 focus:ring-blue-500 outline-none transition-colors rounded-xl px-3 py-2 text-xs text-white w-full sm:w-64"
                  />
                </div>

                <div className="space-y-4">
                  {filteredCitizens.length === 0 && (
                    <div className="rounded-xl border border-dashed border-blue-500/25 py-10 text-center text-sm text-slate-400">
                      <Users className="w-8 h-8 mx-auto mb-3 text-blue-400/60" />
                      Nenhum cidadão encontrado.
                    </div>
                  )}
                  {filteredCitizens.map((cit) => (
                    <div key={cit.id} className="bg-slate-950/80 border border-blue-500/20 hover:border-blue-400/40 transition-colors rounded-xl p-4 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                              {cit.passport}
                            </span>
                            <h3 className="font-bold text-white text-sm">{cit.rp_name}</h3>
                            {cit.roblox_nick && (
                              <span className="text-xs text-slate-400">(@{cit.roblox_nick})</span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-3">
                            <span>CNH: <strong className={cit.cnh_status === 'Suspensa' ? 'text-rose-400' : 'text-emerald-400'}>{cit.cnh_status}</strong></span>
                            <span>Porte de Arma: <strong className={cit.gun_license ? 'text-emerald-400' : 'text-slate-500'}>{cit.gun_license ? 'Possui' : 'Não possui'}</strong></span>
                            {cit.phone && <span>Tel: <strong className="text-slate-300">{cit.phone}</strong></span>}
                          </div>
                        </div>

                        <select
                          value={cit.wanted_status}
                          onChange={(e) => handleUpdateCitizenStatus(cit, e.target.value)}
                          style={{ colorScheme: 'dark' }}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                            cit.wanted_status === 'Procurado'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : cit.wanted_status === 'Preso'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          <option value="Limpo">Limpo</option>
                          <option value="Procurado">Procurado</option>
                          <option value="Preso">Preso</option>
                        </select>
                      </div>

                      <div className="border-t border-slate-800/80 pt-2.5">
                        <div className="text-[11px] font-semibold uppercase text-slate-400 mb-1.5">
                          Passagens / Boletins ({(cit.criminal_records || []).length})
                        </div>
                        {(cit.criminal_records || []).length === 0 ? (
                          <p className="text-xs text-slate-500 italic">Nenhuma ocorrência criminal registrada.</p>
                        ) : (
                          <ul className="space-y-1 text-xs">
                            {cit.criminal_records.map((rec, idx) => (
                              <li key={idx} className="bg-slate-900 px-2.5 py-1.5 rounded text-slate-300 flex justify-between gap-2">
                                <span>• {rec.crime}</span>
                                <span className="text-[10px] font-mono text-slate-500 shrink-0">{rec.date} ({rec.officer})</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        <div className="flex gap-2 mt-2.5">
                          <input
                            type="text"
                            placeholder="Adicionar nova passagem / crime..."
                            value={crimeInput[cit.id] || ''}
                            onChange={(e) => setCrimeInput({ ...crimeInput, [cit.id]: e.target.value })}
                            className="flex-1 bg-slate-900 border border-blue-500/20 focus:border-blue-400 focus:ring-1 focus:ring-blue-500 outline-none transition-colors rounded-lg px-3 py-1.5 text-xs text-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddCrimeRecord(cit)}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 shadow-md shadow-blue-950/40 transition-colors text-white text-xs font-bold"
                          >
                            Registrar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-5 shadow-lg shadow-blue-950/20 h-fit">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <Plus className="w-5 h-5 text-emerald-400" />
                Cadastrar Cidadão no INFOPEN
              </h3>
              <form onSubmit={handleAddCitizen} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Passaporte / ID</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: PTN-1004"
                    value={newCitizen.passport}
                    onChange={(e) => setNewCitizen({ ...newCitizen, passport: e.target.value })}
                    className="w-full bg-slate-950 border border-blue-500/20 focus:border-blue-400 focus:ring-1 focus:ring-blue-500 outline-none transition-colors rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Nome Completo (RP)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Lucas Almeida"
                    value={newCitizen.rp_name}
                    onChange={(e) => setNewCitizen({ ...newCitizen, rp_name: e.target.value })}
                    className="w-full bg-slate-950 border border-blue-500/20 focus:border-blue-400 focus:ring-1 focus:ring-blue-500 outline-none transition-colors rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Nick Roblox</label>
                  <input
                    type="text"
                    placeholder="Ex: lucas_rp"
                    value={newCitizen.roblox_nick}
                    onChange={(e) => setNewCitizen({ ...newCitizen, roblox_nick: e.target.value })}
                    className="w-full bg-slate-950 border border-blue-500/20 focus:border-blue-400 focus:ring-1 focus:ring-blue-500 outline-none transition-colors rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">CNH</label>
                    <select
                      value={newCitizen.cnh_status}
                      onChange={(e) => setNewCitizen({ ...newCitizen, cnh_status: e.target.value })}
                      style={{ colorScheme: 'dark' }}
                      className="w-full bg-slate-950 border border-blue-500/20 focus:border-blue-400 focus:ring-1 focus:ring-blue-500 outline-none transition-colors rounded-lg px-2 py-2 text-white"
                    >
                      <option value="Válida">Válida</option>
                      <option value="Suspensa">Suspensa</option>
                      <option value="Sem CNH">Sem CNH</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Status</label>
                    <select
                      value={newCitizen.wanted_status}
                      onChange={(e) => setNewCitizen({ ...newCitizen, wanted_status: e.target.value })}
                      style={{ colorScheme: 'dark' }}
                      className="w-full bg-slate-950 border border-blue-500/20 focus:border-blue-400 focus:ring-1 focus:ring-blue-500 outline-none transition-colors rounded-lg px-2 py-2 text-white"
                    >
                      <option value="Limpo">Limpo</option>
                      <option value="Procurado">Procurado</option>
                      <option value="Preso">Preso</option>
                    </select>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-slate-300 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newCitizen.gun_license}
                    onChange={(e) => setNewCitizen({ ...newCitizen, gun_license: e.target.checked })}
                  />
                  Possui Porte de Arma legalizado
                </label>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 shadow-md shadow-blue-950/40 transition-colors text-white font-bold py-2.5 rounded-xl transition mt-2"
                >
                  Salvar Ficha no INFOPEN
                </button>
              </form>
            </div>
          </div>
  );
}

