                          <td className="py-3 px-3 font-mono text-slate-300">{off.pin_code}</td>
                          <td className="py-3 px-3 font-mono font-bold text-rose-400">{off.warnings || 0}</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1">
                              {isTopCommand && (
                                <>
                                  <button
                                    onClick={() => handleChangeOfficerRank(off, 1)}
                                    className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-[10px] font-bold"
                                  >
                                    +Patente
                                  </button>
                                  <button
                                    onClick={() => handleChangeOfficerRank(off, -1)}
                                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                                  >
                                    -Patente
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleToggleOfficerWarning(off, 1)}
                                className="px-2 py-1 rounded bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 text-[10px] font-bold"
                              >
                                +Adv
                              </button>
                              {isTopCommand && (
                                <button
                                  onClick={() =>
                                    handleUpdateOfficerStatus(
                                      off,
                                      off.status === 'Suspenso' ? 'Ativo' : 'Suspenso'
                                    )
                                  }
                                  className="px-2 py-1 rounded bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 text-[10px]"
                                >
                                  {off.status === 'Suspenso' ? 'Reativar' : 'Suspender'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {isHighRank && reportToasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm space-y-2.5 pointer-events-none px-4 sm:px-0">
          {reportToasts.map((toast) => (
            <div
              key={toast.toastId}
              className="pointer-events-auto bg-slate-900/95 border border-amber-500/50 rounded-2xl p-4 shadow-2xl shadow-black/70 backdrop-blur-md space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4 text-amber-300 animate-bounce" />
                  </span>
                  <div>
                    <div className="text-[11px] font-mono uppercase font-bold text-amber-300">
                      Novo Relatório Recebido
                    </div>
                    <div className="text-xs font-bold text-white">
                      @{toast.author_nick} • {toast.incident_code}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.toastId)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-300 bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 space-y-1">
                <div>
                  Local: <strong className="text-white">{toast.location}</strong>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Desfecho: <strong className="text-emerald-400">{toast.outcome}</strong></span>
                  <span className="font-mono">{formatDateTime(toast.created_at)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => dismissToast(toast.toastId)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Ignorar
                </button>
                <button
                  type="button"
                  onClick={() => openReportFromToast(toast)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                >
                  Abrir Pasta
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
