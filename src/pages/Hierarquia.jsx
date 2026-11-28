import React from 'react';
import { Megaphone, Trash2, Shield, Award } from 'lucide-react';
import { RANKS } from '../constants/ranks';
import { formatDateTime } from '../utils/formatters';

export default function Hierarquia({ isHighCommand, handleAddAnnouncement, newAnnouncement, setNewAnnouncement, announcements, handleDeleteAnnouncement }) {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/70 via-slate-900/90 to-slate-950/90 p-5 shadow-xl shadow-blue-950/30">
        <div className="relative flex flex-wrap items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-400/40 flex items-center justify-center shadow-lg shadow-blue-500/10">
            <Award className="w-8 h-8 text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-mono tracking-widest text-blue-400 uppercase">SIGP / Central institucional</p>
            <h1 className="text-2xl font-extrabold text-white">Hierarquia &amp; Mural</h1>
            <p className="text-xs text-slate-400 mt-1">Estrutura de comando e comunicados oficiais</p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-xl border border-blue-500/25 bg-slate-950/70 px-4 py-2 text-center"><p className="text-xl font-bold text-blue-300">{RANKS.length}</p><p className="text-[10px] text-slate-400 uppercase">Postos</p></div>
            <div className="rounded-xl border border-amber-500/25 bg-slate-950/70 px-4 py-2 text-center"><p className="text-xl font-bold text-amber-300">{announcements.length}</p><p className="text-[10px] text-slate-400 uppercase">Notas</p></div>
          </div>
        </div>
      </section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-5">
              {isHighCommand && (
                <div className="bg-slate-900/75 backdrop-blur-sm border border-amber-500/30 rounded-2xl p-5 shadow-lg shadow-black/25">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-amber-400" />
                      Publicar Nota / Parametrização no Mural
                    </h3>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Comando
                    </span>
                  </div>
                  <form onSubmit={handleAddAnnouncement} className="space-y-2.5 text-xs">
                    <input
                      type="text"
                      required
                      placeholder="Título (Ex: PARAMETRIZAÇÃO — RECRUTA...)"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/60 rounded-xl px-3.5 py-2.5 text-white focus:outline-none transition"
                    />
                    <textarea
                      rows={3}
                      required
                      placeholder="Texto oficial da publicação..."
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/60 rounded-xl p-3 text-white focus:outline-none transition"
                    />
                    <button
                      type="submit"
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl transition shadow-md shadow-amber-950/40"
                    >
                      Publicar no Mural
                    </button>
                  </form>
                </div>
              )}

              <div className="bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-amber-500/35 rounded-2xl p-5 space-y-3.5 shadow-xl shadow-black/30">
                <div className="flex items-center justify-between gap-2 border-b border-slate-800/90 pb-3">
                  <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                      <Megaphone className="w-4 h-4 text-amber-400" />
                    </span>
                    Mural de Avisos & Parametrizações
                  </h2>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-950 text-amber-300 border border-slate-800">
                    {announcements.length} {announcements.length === 1 ? 'nota' : 'notas'}
                  </span>
                </div>

                {announcements.length === 0 ? (
                  <div className="bg-slate-950/80 border border-blue-500/20 rounded-xl p-6 text-center text-xs text-slate-400">
                    Nenhuma nota publicada no mural até o momento.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {announcements.map((a, idx) => (
                      <article
                        key={a.id}
                        className={`rounded-xl p-4 space-y-2 border transition ${
                          idx === 0
                            ? 'bg-slate-950/95 border-amber-500/40 shadow-md shadow-amber-950/20'
                            : 'bg-slate-950/75 border-slate-800/90 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-extrabold tracking-wide text-amber-400 uppercase">
                            {a.title}
                          </span>
                          <div className="flex items-center gap-2">
                            {idx === 0 && (
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                Recente
                              </span>
                            )}
                            {isHighCommand && (
                              <button
                                type="button"
                                onClick={() => handleDeleteAnnouncement(a)}
                                title="Apagar comunicado"
                                className="px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[11px] font-bold flex items-center gap-1 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Apagar
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                          {a.content}
                        </p>
                        <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-2">
                          <span>
                            Por <strong className="text-slate-300">@{a.author_nick}</strong>
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">
                            {formatDateTime(a.created_at)}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-900/75 backdrop-blur-sm border border-blue-500/25 rounded-2xl p-5 space-y-2.5 shadow-lg shadow-black/20">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800/90 pb-3 mb-1">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-400" />
                  </span>
                  Hierarquia Oficial — PM Capital Ville
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  {RANKS.length} Postos
                </span>
              </div>

              {RANKS.map((r) => (
                <div
                  key={r.level}
                  className="bg-slate-950/90 hover:bg-slate-950 border border-blue-500/15 hover:border-blue-400/50 rounded-xl px-3.5 py-3 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs sm:text-sm text-white">
                      {6 - r.level}. {r.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/25 shrink-0">
                      Nível {r.level}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
    </div>
  );
}

