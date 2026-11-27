import React from 'react';
import { Radio, CheckCircle2, Clock, Check, Copy, Activity } from 'lucide-react';
import { formatDuration, formatDateTime } from '../utils/formatters';

export default function Dashboard({
  activeShift,
  vtrPrefix,
  setVtrPrefix,
  patrolArea,
  setPatrolArea,
  handleStartShift,
  elapsedSeconds,
  shiftSummary,
  setShiftSummary,
  activeShiftFines,
  handleEndShift,
  dutyLogs,
  currentUser,
  copyDiscordFormat,
  formatDutyForDiscord,
  copiedId,
  activeShiftsAll,
  isHighCommand,
  dutyFilterOfficer,
  setDutyFilterOfficer,
  officers,
  dutyFilterStatus,
  setDutyFilterStatus,
  filteredDutyLogs,
  nowTick
}) {
  return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Radio className="w-5 h-5 text-blue-400" />
                    Controle de Ponto Eletrônico
                  </h2>
                  <p className="text-xs text-slate-400">
                    Registre o início e o término do seu patrulhamento. Multas aplicadas durante o turno entram automaticamente nas observações ao encerrar.
                  </p>
                </div>

                {!activeShift ? (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Prefixo / Tipo de Viatura</label>
                        <select
                          value={vtrPrefix}
                          onChange={(e) => setVtrPrefix(e.target.value)}
                          style={{ colorScheme: 'dark' }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white"
                        >
                          <option value="Caracterizada">Viatura Caracterizada</option>
                          <option value="VTR-01 Patrulha">VTR-01 Patrulha Ostensiva</option>
                          <option value="VTR-02 Tática">VTR-02 Tática / Choque</option>
                          <option value="GRAer / Águia">GRAer / Helicóptero</option>
                          <option value="Moto Patrulha">Moto Patrulha</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Área de Patrulhamento</label>
                        <input
                          type="text"
                          value={patrolArea}
                          onChange={(e) => setPatrolArea(e.target.value)}
                          placeholder="Ex: GV e Horton, Túnel de Brookmere..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleStartShift}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      INICIAR SERVIÇO AGORA
                    </button>
                  </div>
                ) : (
                  <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-xl p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold uppercase text-emerald-400">Turno em Andamento</span>
                        <div className="text-3xl font-mono font-extrabold text-white mt-1">
                          {formatDuration(elapsedSeconds)}
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          Iniciado em: <strong>{formatDateTime(activeShift.started_at)}</strong> • {activeShift.vtr_prefix} ({activeShift.patrol_area})
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 mb-1">
                        Resumo do Turno / Ocorrências Atendidas
                      </label>
                      <textarea
                        rows={3}
                        value={shiftSummary}
                        onChange={(e) => setShiftSummary(e.target.value)}
                        placeholder="Ex: Patrulhamento em GV e Horton, abordagem a suspeito, apoio em ocorrência..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                      />
                    </div>

                    {activeShiftFines.length > 0 && (
                      <div className="bg-slate-950/90 border border-amber-500/35 rounded-xl p-3.5 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-amber-300 font-bold">
                          <span>Multas registradas neste turno ({activeShiftFines.length})</span>
                          <span className="font-mono text-emerald-400">
                            ${activeShiftFines.reduce((acc, f) => acc + f.fine, 0).toLocaleString()}
                          </span>
                        </div>
                        <ul className="space-y-1 text-slate-300">
                          {activeShiftFines.map((f) => (
                            <li key={f.id} className="flex justify-between gap-2 text-[11px]">
                              <span>
                                • <strong>{f.artCode}</strong> — {f.artName} (Alvo: {f.target})
                              </span>
                              <span className="font-mono text-emerald-400 shrink-0">
                                ${f.fine.toLocaleString()}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <p className="text-[11px] text-slate-400 pt-1">
                          Estas autuações serão anexadas automaticamente às observações ao encerrar o serviço.
                        </p>
                      </div>
                    )}

                    <button
                      onClick={handleEndShift}
                      className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-rose-950"
                    >
                      <Clock className="w-5 h-5" />
                      ENCERRAR SERVIÇO E REGISTRAR SAÍDA
                    </button>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-bold text-slate-300 mb-3">Meus Últimos Turnos Registrados</h3>
                  <div className="space-y-2">
                    {dutyLogs
                      .filter((l) => l.officer_nick.toLowerCase() === currentUser.roblox_nick.toLowerCase())
                      .slice(0, 5)
                      .map((log) => (
                        <div
                          key={log.id}
                          className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2 text-xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <div className="font-semibold text-white">
                                {log.vtr_prefix} • {log.patrol_area}
                              </div>
                              <div className="text-slate-400 font-mono text-[11px]">
                                Início: {formatDateTime(log.started_at)} | Fim: {log.ended_at ? formatDateTime(log.ended_at) : 'Ativo'}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-emerald-400">
                                {formatDuration(log.duration_seconds)}
                              </span>
                              <button
                                onClick={() => copyDiscordFormat(formatDutyForDiscord(log), log.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1"
                              >
                                {copiedId === log.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                Discord
                              </button>
                            </div>
                          </div>
                          {log.summary_notes && (
                            <div className="text-[11px] text-slate-300 bg-slate-900/90 border border-slate-800/80 rounded-lg px-2.5 py-1.5">
                              <strong className="text-slate-400">Observações:</strong> {log.summary_notes}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  Efetivo em Serviço Agora ({activeShiftsAll.length})
                </h3>

                {activeShiftsAll.length === 0 ? (
                  <p className="text-xs text-slate-400 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    Nenhum policial em serviço no momento. Inicie seu turno ao lado!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {activeShiftsAll.map((s) => (
                      <div key={s.id} className="bg-slate-950 border border-emerald-500/30 rounded-xl p-3.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{s.officer_rp_name}</span>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">EM SERVIÇO</span>
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          {s.officer_rank} • {s.vtr_prefix}
                        </div>
                        <div className="text-slate-500 font-mono text-[10px] mt-2">
                          Entrada: {formatDateTime(s.started_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {isHighCommand && (
              <div className="bg-slate-900 border border-amber-500/25 rounded-2xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-400" />
                      Auditoria Completa de Turnos / Ponto ({dutyLogs.length} registros)
                    </h2>
                    <p className="text-xs text-slate-400">
                      Acompanhe horários exatos de entrada, saída, tempo patrulhado e observações/multas de cada policial.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <select
                      value={dutyFilterOfficer}
                      onChange={(e) => setDutyFilterOfficer(e.target.value)}
                      style={{ colorScheme: 'dark' }}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                    >
                      <option value="TODOS">Todos os Policiais</option>
                      {officers.map((o) => (
                        <option key={o.id} value={o.roblox_nick}>
                          {o.badge_number} • {o.rp_name} (@{o.roblox_nick})
                        </option>
                      ))}
                    </select>

                    <select
                      value={dutyFilterStatus}
                      onChange={(e) => setDutyFilterStatus(e.target.value)}
                      style={{ colorScheme: 'dark' }}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                    >
                      <option value="TODOS">Todos os Status</option>
                      <option value="EM_SERVICO">Em Serviço</option>
                      <option value="ENCERRADO">Turnos Encerrados</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] uppercase text-slate-400">
                        <th className="py-2.5 px-3">Policial / Matrícula</th>
                        <th className="py-2.5 px-3">Patente</th>
                        <th className="py-2.5 px-3">Viatura / Área</th>
                        <th className="py-2.5 px-3">Início do Turno</th>
                        <th className="py-2.5 px-3">Término do Turno</th>
                        <th className="py-2.5 px-3">Tempo Patrulhado</th>
                        <th className="py-2.5 px-3">Observações / Multas</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70 text-xs">
                      {filteredDutyLogs.map((log) => {
                        const liveSec =
                          log.status === 'EM_SERVICO'
                            ? Math.floor((nowTick - new Date(log.started_at).getTime()) / 1000)
                            : log.duration_seconds;
                        return (
                          <tr key={log.id} className="hover:bg-slate-800/40">
                            <td className="py-3 px-3">
                              <div className="font-bold text-white">{log.officer_rp_name}</div>
                              <div className="text-[11px] font-mono text-slate-400">
                                {log.badge_number} • @{log.officer_nick}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-slate-300">{log.officer_rank}</td>
                            <td className="py-3 px-3">
                              <div className="text-blue-400 font-semibold">{log.vtr_prefix}</div>
                              <div className="text-[11px] text-slate-400">{log.patrol_area}</div>
                            </td>
                            <td className="py-3 px-3 font-mono text-emerald-300">
                              {formatDateTime(log.started_at)}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-300">
                              {log.ended_at ? (
                                formatDateTime(log.ended_at)
                              ) : (
                                <span className="text-emerald-400 italic">Em andamento...</span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-white">
                              {formatDuration(liveSec)}
                            </td>
                            <td className="py-3 px-3 text-slate-300 max-w-xs">
                              {log.summary_notes || '—'}
                            </td>
                            <td className="py-3 px-3">
                              {log.status === 'EM_SERVICO' ? (
                                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                  EM SERVIÇO
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                                  ENCERRADO
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
  );
}

