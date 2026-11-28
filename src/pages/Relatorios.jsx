import React from 'react';
import { Check, Copy, FileText, Trash2 } from 'lucide-react';
import { formatDateTime } from '../utils/formatters';

export default function Relatorios({
  handleAddReport,
  newReport,
  setNewReport,
  reportImage,
  setReportImage,
  reportImageName,
  setReportImageName,
  cropZoom,
  setCropZoom,
  reports,
  isHighRank,
  currentUser,
  reportSearch,
  setReportSearch,
  reportFilterType,
  setReportFilterType,
  reportFilterStatus,
  setReportFilterStatus,
  copyDiscordFormat,
  formatReportForDiscord,
  copiedId,
  handleDeleteReport,
  reviewNotesMap,
  setReviewNotesMap,
  handleReviewReport
}) {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-slate-950/90 p-5 shadow-[0_0_30px_rgba(37,99,235,0.12)]">
        <div className="relative flex items-center gap-4">
          <img src="/gvcr.png" alt="GVCR" className="w-16 h-16 rounded-xl object-cover border border-blue-400/40" />
          <div>
            <p className="text-[10px] font-mono tracking-widest text-blue-400">SIGP / ARQUIVO OPERACIONAL</p>
            <h1 className="text-2xl font-extrabold text-white">Relatórios operacionais</h1>
            <p className="text-xs text-slate-400 mt-1">Registro, consulta e acompanhamento de ocorrências</p>
          </div>
        </div>
      </section>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900/80 backdrop-blur-sm border border-blue-500/20 shadow-lg shadow-blue-950/20 rounded-2xl p-5 h-fit">
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-400" />
                Lavrar Relatório Pós-Ocorrência
              </h2>
              <form onSubmit={handleAddReport} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Natureza do registro</label>
                  <select
                    value={newReport.report_type}
                    onChange={(e) => setNewReport({ ...newReport, report_type: e.target.value })}
                    style={{ colorScheme: 'dark' }}
                    className="w-full bg-slate-950/90 border border-blue-500/20 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-500/30 transition-colors rounded-lg px-2 py-2 text-white"
                  >
                    <option value="OCORRENCIA">Ocorrência policial</option>
                    <option value="ABORDAGEM">Abordagem</option>
                    <option value="PERSEGUICAO">Perseguição</option>
                    <option value="APREENSAO">Apreensão</option>
                    <option value="APOIO">Apoio operacional</option>
                    <option value="OUTRO">Outro registro</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Código / Tipo</label>
                    <select
                      value={newReport.incident_code}
                      onChange={(e) => setNewReport({ ...newReport, incident_code: e.target.value })}
                      style={{ colorScheme: 'dark' }}
                      className="w-full bg-slate-950/90 border border-blue-500/20 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-500/30 transition-colors rounded-lg px-2 py-2 text-white"
                    >
                      <option value="Código 1">Código 1 (Patrulha)</option>
                      <option value="Código 2">Código 2 (Urgência)</option>
                      <option value="Código 3">Código 3 (Emergência / Fuga)</option>
                      <option value="Código 4">Código 4 (Tiroteio / Confronto)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Viatura</label>
                    <input
                      type="text"
                      value={newReport.vtr_prefix}
                      onChange={(e) => setNewReport({ ...newReport, vtr_prefix: e.target.value })}
                      className="w-full bg-slate-950/90 border border-blue-500/20 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-500/30 transition-colors rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Local da Ocorrência</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Túnel de Brookmere, GV e Horton..."
                    value={newReport.location}
                    onChange={(e) => setNewReport({ ...newReport, location: e.target.value })}
                    className="w-full bg-slate-950/90 border border-blue-500/20 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-500/30 transition-colors rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Policiais Envolvidos</label>
                  <input
                    type="text"
                    placeholder="Ex: @Krustelles_22 @wyzontheradar"
                    value={newReport.involved_officers}
                    onChange={(e) => setNewReport({ ...newReport, involved_officers: e.target.value })}
                    className="w-full bg-slate-950/90 border border-blue-500/20 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-500/30 transition-colors rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Pessoas Envolvidas</label>
                  <input
                    type="text"
                    placeholder="Ex: nick (PTN-1001)"
                    value={newReport.involved_citizens}
                    onChange={(e) => setNewReport({ ...newReport, involved_citizens: e.target.value })}
                    className="w-full bg-slate-950/90 border border-blue-500/20 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-500/30 transition-colors rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Descrição Resumida</label>
                  <textarea
                    rows={5}
                    required
                    minLength={20}
                    maxLength={3000}
                    placeholder="Registre os fatos em ordem cronológica: situação inicial, ações dos envolvidos, intervenção policial e desfecho..."
                    value={newReport.description}
                    onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                    className="w-full bg-slate-950/90 border border-blue-500/20 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-500/30 transition-colors rounded-lg p-2.5 text-white"
                  />
                  <div className="text-right text-[10px] text-slate-500">{newReport.description.length}/3000 caracteres (mínimo 20)</div>
                </div>

                <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/70 p-3 space-y-3">
                  <div>
                    <label className="block text-slate-200 font-semibold mb-1">Evidência da ocorrência (print)</label>
                    <p className="text-[11px] text-slate-500">Envie uma imagem do computador. O recorte será ajustado para 16:9 antes de anexar ao relatório.</p>
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 8 * 1024 * 1024) {
                        window.alert('A imagem deve ter no máximo 8 MB.');
                        e.target.value = '';
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        setReportImage(String(reader.result || ''));
                        setReportImageName(file.name);
                        setCropZoom(1);
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="block w-full text-[11px] text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-blue-500"
                  />
                  {reportImage && (
                    <div className="space-y-2">
                      <div className="aspect-video overflow-hidden rounded-lg border border-slate-700 bg-black">
                        <img
                          src={reportImage}
                          alt="Prévia do recorte da evidência"
                          className="h-full w-full object-cover"
                          style={{ objectPosition: 'center', transform: `scale(${cropZoom})` }}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <label className="text-[11px] text-slate-400">Ajustar aproximação</label>
                        <span className="text-[11px] text-blue-300 font-mono">{cropZoom.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="2.5"
                        step="0.1"
                        value={cropZoom}
                        onChange={(e) => setCropZoom(Number(e.target.value))}
                        className="w-full accent-blue-500"
                      />
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-500 truncate">{reportImageName}</span>
                        <button type="button" onClick={() => { setReportImage(''); setReportImageName(''); setCropZoom(1); }} className="text-[11px] text-rose-300 hover:text-rose-200">Remover imagem</button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Providências</label>
                    <input
                      type="text"
                      value={newReport.actions_taken}
                      onChange={(e) => setNewReport({ ...newReport, actions_taken: e.target.value })}
                      className="w-full bg-slate-950/90 border border-blue-500/20 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-500/30 transition-colors rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Resultado Final</label>
                    <select
                      value={newReport.outcome}
                      onChange={(e) => setNewReport({ ...newReport, outcome: e.target.value })}
                      style={{ colorScheme: 'dark' }}
                      className="w-full bg-slate-950/90 border border-blue-500/20 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-500/30 transition-colors rounded-lg px-2 py-2 text-white"
                    >
                      <option value="Preso">Preso</option>
                      <option value="Abatido em Confronto">Abatido em Confronto</option>
                      <option value="Liberado após Averiguação">Liberado após Averiguação</option>
                      <option value="Suspeito Evadiu">Suspeito Evadiu</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition"
                >
                  Salvar e Enviar para Comando
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Total', value: reports.filter((r) => isHighRank || (r.author_nick || '').toLowerCase() === (currentUser?.roblox_nick || '').toLowerCase()), tone: 'text-slate-100' },
                  { label: 'Pendentes', value: reports.filter((r) => (isHighRank || (r.author_nick || '').toLowerCase() === (currentUser?.roblox_nick || '').toLowerCase()) && (r.review_status || 'PENDENTE') === 'PENDENTE'), tone: 'text-amber-300' },
                  { label: 'Aprovados', value: reports.filter((r) => (isHighRank || (r.author_nick || '').toLowerCase() === (currentUser?.roblox_nick || '').toLowerCase()) && r.review_status === 'APROVADO'), tone: 'text-emerald-300' },
                  { label: 'Reprovados', value: reports.filter((r) => (isHighRank || (r.author_nick || '').toLowerCase() === (currentUser?.roblox_nick || '').toLowerCase()) && r.review_status === 'REPROVADO'), tone: 'text-rose-300' }
                ].map((metric) => (
                  <div key={metric.label} className="bg-slate-900/80 backdrop-blur-sm border border-blue-500/20 shadow-lg shadow-blue-950/20 rounded-xl p-3">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">{metric.label}</div>
                    <div className={`text-xl font-extrabold ${metric.tone}`}>{metric.value.length}</div>
                  </div>
                ))}
              </div>
              <div className="bg-slate-900/80 backdrop-blur-sm border border-blue-500/20 shadow-lg shadow-blue-950/20 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-300">
                  {isHighRank ? (
                    <>
                      <strong className="text-amber-400">Visão de Comando:</strong> Você visualiza todos os relatórios e pode{' '}
                      <strong className="text-white">Aprovar</strong>, <strong className="text-white">Reprovar</strong> ou <strong className="text-white">Apagar</strong>.
                    </>
                  ) : (
                    <>
                      <strong className="text-blue-400">Acesso Restrito:</strong> Você visualiza apenas os relatórios enviados por você.
                    </>
                  )}
                </div>
                <input
                  type="search"
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                  placeholder="Buscar por local, policial, envolvido ou descrição..."
                  className="min-w-[220px] flex-1 bg-slate-950/90 border border-blue-500/20 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-500/30 transition-colors rounded-lg px-3 py-1.5 text-xs text-white"
                />
                <select
                  value={reportFilterType}
                  onChange={(e) => setReportFilterType(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                  className="bg-slate-950/90 border border-blue-500/20 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-500/30 transition-colors rounded-lg px-3 py-1.5 text-xs text-slate-200"
                >
                  <option value="TODOS">Todas as naturezas</option>
                  <option value="OCORRENCIA">Ocorrência</option>
                  <option value="ABORDAGEM">Abordagem</option>
                  <option value="PERSEGUICAO">Perseguição</option>
                  <option value="APREENSAO">Apreensão</option>
                  <option value="APOIO">Apoio</option>
                  <option value="OUTRO">Outro</option>
                </select>
                <select
                  value={reportFilterStatus}
                  onChange={(e) => setReportFilterStatus(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                  className="bg-slate-950/90 border border-blue-500/20 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-500/30 transition-colors rounded-lg px-3 py-1.5 text-xs text-slate-200"
                >
                  <option value="TODOS">Todos os Status</option>
                  <option value="PENDENTE">Pendentes</option>
                  <option value="APROVADO">Aprovados</option>
                  <option value="REPROVADO">Reprovados</option>
                </select>
              </div>

              {reports
                .filter((rep) => {
                  const canView =
                    isHighRank ||
                    (rep.author_nick || '').toLowerCase() === (currentUser?.roblox_nick || '').toLowerCase();
                  if (!canView) return false;

                  const status = rep.review_status || 'PENDENTE';
                  const matchesStatus = reportFilterStatus === 'TODOS' || status === reportFilterStatus;
                  const matchesType = reportFilterType === 'TODOS' || (rep.report_type || 'OCORRENCIA') === reportFilterType;
                  const query = reportSearch.trim().toLocaleLowerCase('pt-BR');
                  const searchable = [rep.location, rep.author_nick, rep.author_rank, rep.involved_officers, rep.involved_citizens, rep.description, rep.incident_code, rep.vtr_prefix, rep.actions_taken, rep.outcome, rep.report_type].join(' ').toLocaleLowerCase('pt-BR');
                  return matchesStatus && matchesType && (!query || searchable.includes(query));
                })
                .map((rep) => {
                  const status = rep.review_status || 'PENDENTE';
                  const isAuthor =
                    (rep.author_nick || '').toLowerCase() === (currentUser?.roblox_nick || '').toLowerCase();
                  const canDelete = isHighRank || isAuthor;

                  return (
                    <div key={rep.id} className="bg-slate-900/80 backdrop-blur-sm border border-blue-500/20 shadow-lg shadow-blue-950/20 rounded-2xl p-5 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-xs font-bold">
                            {rep.incident_code}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
                              status === 'APROVADO'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : status === 'REPROVADO'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            {status}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">{({ OCORRENCIA: 'OCORRÊNCIA', ABORDAGEM: 'ABORDAGEM', PERSEGUICAO: 'PERSEGUIÇÃO', APREENSAO: 'APREENSÃO', APOIO: 'APOIO', OUTRO: 'OUTRO' })[rep.report_type] || 'OCORRÊNCIA'}</span>
                          <span className="font-bold text-white text-sm">{rep.location}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => copyDiscordFormat(formatReportForDiscord(rep), rep.id)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5"
                          >
                            {copiedId === rep.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copiedId === rep.id ? 'Copiado!' : 'Copiar p/ Discord'}
                          </button>

                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDeleteReport(rep)}
                              className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              Apagar
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="rounded-lg bg-slate-950 border border-slate-800 p-2"><span className="text-slate-500">Viatura</span><div className="text-slate-200 font-semibold">{rep.vtr_prefix || 'Não informada'}</div></div>
                        <div className="rounded-lg bg-slate-950 border border-slate-800 p-2"><span className="text-slate-500">Código operacional</span><div className="text-slate-200 font-semibold">{rep.incident_code || 'Não informado'}</div></div>
                        <div className="rounded-lg bg-slate-950 border border-slate-800 p-2"><span className="text-slate-500">Policiais envolvidos</span><div className="text-slate-200">{rep.involved_officers || 'Não informado'}</div></div>
                        <div className="rounded-lg bg-slate-950 border border-slate-800 p-2"><span className="text-slate-500">Providências</span><div className="text-slate-200">{rep.actions_taken || 'Não informado'}</div></div>
                      </div>
                      <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 whitespace-pre-wrap">
                        {rep.description}
                      </p>
                      {rep.evidence_image && (
                        <a href={rep.evidence_image} target="_blank" rel="noreferrer" className="block">
                          <img src={rep.evidence_image} alt="Evidência anexada à ocorrência" className="w-full max-h-72 object-contain rounded-lg border border-slate-700 bg-black" />
                        </a>
                      )}

                      <div className="flex flex-wrap justify-between gap-2 text-[11px] text-slate-400">
                        <span>Responsável: <strong className="text-slate-200">@{rep.author_nick}</strong> ({rep.author_rank})</span>
                        <span>Envolvidos: <strong className="text-slate-200">{rep.involved_citizens || 'N/A'}</strong></span>
                        <span>Resultado: <strong className="text-emerald-400">{rep.outcome}</strong></span>
                        <span className="font-mono">{formatDateTime(rep.created_at)}</span>
                      </div>

                      {rep.reviewed_by && (
                        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-bold text-slate-200">
                              Avaliação do Comando: @{rep.reviewed_by} ({rep.reviewer_rank})
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {formatDateTime(rep.reviewed_at)}
                            </span>
                          </div>
                          <p className="text-slate-300">{rep.review_notes}</p>
                        </div>
                      )}

                      {isHighRank && (
                        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            placeholder="Parecer do Comando (opcional)..."
                            value={reviewNotesMap[rep.id] ?? rep.review_notes ?? ''}
                            onChange={(e) => setReviewNotesMap((prev) => ({ ...prev, [rep.id]: e.target.value }))}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleReviewReport(rep, 'APROVADO')}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                            >
                              Aprovar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReviewReport(rep, 'REPROVADO')}
                              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                            >
                              Reprovar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
    </div>
  );
}

