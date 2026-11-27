import React from 'react';
import { ShieldAlert, FolderOpen, Folder, ChevronUp, ChevronDown, Check, Copy, Trash2, Plus } from 'lucide-react';
import { RANKS } from '../constants/ranks';
import { formatDateTime } from '../utils/formatters';

export default function AltoComando({
  currentUser,
  activeShiftsAll,
  officers,
  pendingReportsCount,
  isHighRank,
  cmdReportsFolderOpen,
  setCmdReportsFolderOpen,
  reports,
  cmdReportFilterStatus,
  setCmdReportFilterStatus,
  copyDiscordFormat,
  formatReportForDiscord,
  copiedId,
  handleDeleteReport,
  cmdReviewNotesMap,
  setCmdReviewNotesMap,
  handleReviewReport,
  handleAddOfficer,
  newOfficer,
  setNewOfficer
}) {
  return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <ShieldAlert className="w-5 h-5" />
                  PAINEL DO ALTO COMANDO — {currentUser.rank_name.toUpperCase()}
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Pasta de relatórios para aprovação/reprovação e recrutamento. A auditoria de turnos fica em <strong>Ponto & Patrulha</strong> e o prontuário do efetivo em <strong>Hierarquia & Mural</strong>.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl text-center">
                  <div className="text-lg font-extrabold text-emerald-400">{activeShiftsAll.length}</div>
                  <div className="text-[10px] uppercase text-slate-400">Em Serviço</div>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl text-center">
                  <div className="text-lg font-extrabold text-blue-400">{officers.length}</div>
                  <div className="text-[10px] uppercase text-slate-400">Efetivo Total</div>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl text-center">
                  <div className="text-lg font-extrabold text-amber-400">{pendingReportsCount}</div>
                  <div className="text-[10px] uppercase text-slate-400">Rel. Pendentes</div>
                </div>
              </div>
            </div>

            {isHighRank && (
              <div className="bg-slate-900 border border-amber-500/30 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setCmdReportsFolderOpen((prev) => !prev)}
                  className="w-full p-5 flex flex-wrap items-center justify-between gap-3 text-left hover:bg-slate-800/40 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      {cmdReportsFolderOpen ? (
                        <FolderOpen className="w-5 h-5 text-amber-300" />
                      ) : (
                        <Folder className="w-5 h-5 text-amber-300" />
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-extrabold text-white tracking-tight">
                          PASTA DE RELATÓRIOS — APROVAÇÃO E REPROVAÇÃO
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {cmdReportsFolderOpen ? 'PASTA ABERTA' : 'PASTA RECOLHIDA'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Arquivo reservado de ocorrências enviadas pelas tropas. Clique para abrir ou recolher.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono font-bold">
                        {pendingReportsCount} pendentes
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 font-mono">
                        {reports.length} total
                      </span>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      {cmdReportsFolderOpen ? (
                        <>
                          Ocultar Pasta <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Abrir Pasta <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </span>
                  </div>
                </button>

                {cmdReportsFolderOpen && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-4 bg-slate-950/40">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs text-slate-400">
                        Filtre os relatórios para avaliar ou apagar ocorrências já encerradas.
                      </span>
                      <select
                        value={cmdReportFilterStatus}
                        onChange={(e) => setCmdReportFilterStatus(e.target.value)}
                        style={{ colorScheme: 'dark' }}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                      >
                        <option value="PENDENTE">Somente Pendentes</option>
                        <option value="TODOS">Todos os Relatórios</option>
                        <option value="APROVADO">Aprovados</option>
                        <option value="REPROVADO">Reprovados</option>
                      </select>
                    </div>

                    {reports.filter((rep) => {
                      const status = rep.review_status || 'PENDENTE';
                      return cmdReportFilterStatus === 'TODOS' || status === cmdReportFilterStatus;
                    }).length === 0 ? (
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-400">
                        Nenhum relatório encontrado neste filtro dentro da pasta.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {reports
                          .filter((rep) => {
                            const status = rep.review_status || 'PENDENTE';
                            return cmdReportFilterStatus === 'TODOS' || status === cmdReportFilterStatus;
                          })
                          .map((rep) => {
                            const status = rep.review_status || 'PENDENTE';
                            return (
                              <div
                                key={rep.id}
                                className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[11px] font-bold">
                                      {rep.incident_code}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                                        status === 'APROVADO'
                                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                          : status === 'REPROVADO'
                                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                      }`}
                                    >
                                      {status}
                                    </span>
                                    <span className="font-bold text-white text-xs sm:text-sm">
                                      {rep.location}
                                    </span>
                                    <span className="text-[11px] text-slate-400">
                                      • Por <strong className="text-slate-200">@{rep.author_nick}</strong> ({rep.author_rank})
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => copyDiscordFormat(formatReportForDiscord(rep), `cmd-${rep.id}`)}
                                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
                                    >
                                      {copiedId === `cmd-${rep.id}` ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                      Discord
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteReport(rep)}
                                      className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      Apagar
                                    </button>
                                  </div>
                                </div>

                                <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
                                  {rep.description}
                                </p>

                                <div className="flex flex-wrap justify-between gap-2 text-[11px] text-slate-400">
                                  <span>Envolvidos: <strong className="text-slate-200">{rep.involved_citizens || 'N/A'}</strong></span>
                                  <span>Desfecho: <strong className="text-emerald-400">{rep.outcome}</strong></span>
                                  <span className="font-mono">{formatDateTime(rep.created_at)}</span>
                                </div>

                                <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2">
                                  <input
                                    type="text"
                                    placeholder="Parecer do Comando..."
                                    value={cmdReviewNotesMap[rep.id] ?? rep.review_notes ?? ''}
                                    onChange={(e) =>
                                      setCmdReviewNotesMap((prev) => ({ ...prev, [rep.id]: e.target.value }))
                                    }
                                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleReviewReport(
                                          rep,
                                          'APROVADO',
                                          cmdReviewNotesMap[rep.id] ?? rep.review_notes
                                        )
                                      }
                                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                                    >
                                      Aprovar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleReviewReport(
                                          rep,
                                          'REPROVADO',
                                          cmdReviewNotesMap[rep.id] ?? rep.review_notes
                                        )
                                      }
                                      className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                                    >
                                      Reprovar
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <Plus className="w-5 h-5 text-emerald-400" />
                Recrutar / Cadastrar Policial
              </h3>
              <form onSubmit={handleAddOfficer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
                <input
                  type="text"
                  required
                  placeholder="Matrícula (Ex: PM-007)"
                  value={newOfficer.badge_number}
                  onChange={(e) => setNewOfficer({ ...newOfficer, badge_number: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                />
                <input
                  type="text"
                  required
                  placeholder="Nick Roblox"
                  value={newOfficer.roblox_nick}
                  onChange={(e) => setNewOfficer({ ...newOfficer, roblox_nick: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
                <input
                  type="text"
                  placeholder="Nome RP (Ex: Sd. Silva)"
                  value={newOfficer.rp_name}
                  onChange={(e) => setNewOfficer({ ...newOfficer, rp_name: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
                <select
                  value={newOfficer.rank_level}
                  onChange={(e) => setNewOfficer({ ...newOfficer, rank_level: Number(e.target.value) })}
                  style={{ colorScheme: 'dark' }}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-white"
                >
                  {RANKS.map((r) => (
                    <option key={r.level} value={r.level}>
                      {r.name} (Nível {r.level})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  placeholder="PIN (Ex: 1234)"
                  value={newOfficer.pin_code}
                  onChange={(e) => setNewOfficer({ ...newOfficer, pin_code: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg transition"
                >
                  Cadastrar
                </button>
              </form>
            </div>
          </div>
  );
}

