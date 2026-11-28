import React from 'react';
import { Car, ShieldCheck, Search } from 'lucide-react';

export default function Renavam({
  vehicleSearch,
  setVehicleSearch,
  filteredVehicles
}) {
  return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3 rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/80 to-slate-950/90 p-5 flex items-center gap-4 shadow-xl">
              <img src="/gvcr.png" alt="GVCR" className="w-16 h-16 rounded-xl object-cover border border-blue-400/40" />
              <div className="flex-1">
                <p className="text-[10px] tracking-widest text-blue-300 font-mono">SIGP / CENTRAL DE CONSULTA VEICULAR</p>
                <h1 className="text-2xl font-bold text-white">RENAVAM</h1>
                <p className="text-xs text-slate-400">Base veicular do Departamento de Trânsito</p>
              </div>
              <div className="text-right"><p className="text-2xl font-bold text-blue-300">{filteredVehicles.length}</p><p className="text-xs text-slate-400">Resultados</p></div>
            </div>
            <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur-sm border border-blue-500/25 rounded-2xl p-5 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Car className="w-5 h-5 text-blue-400" />
                  RENAVAM — Consulta de Placas e Veículos
                </h2>
                <input
                  type="text"
                  placeholder="Buscar placa (PTN-...), modelo ou proprietário..."
                  value={vehicleSearch}
                  onChange={(e) => setVehicleSearch(e.target.value)}
                  className="bg-slate-950/80 border border-blue-500/20 rounded-xl px-3 py-2 text-xs text-white w-full sm:w-64 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-3">
                {filteredVehicles.length === 0 && (
                  <div className="bg-slate-950/80 border border-blue-500/20 rounded-xl p-8 text-center text-sm text-slate-400">
                    <Search className="w-8 h-8 text-blue-400/70 mx-auto mb-3" />
                    Nenhum veículo encontrado. Os registros são disponibilizados pelo DOT.
                  </div>
                )}
                {filteredVehicles.map((veh) => (
                  <div key={veh.id} className="bg-slate-950/80 border border-blue-500/20 rounded-xl p-4 hover:border-blue-400/50 transition-colors flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded bg-slate-800 text-amber-300 border border-slate-700">
                          {veh.plate}
                        </span>
                        <span className="font-bold text-white text-sm">{veh.model}</span>
                        <span className="text-xs text-slate-400">• {veh.color}</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Proprietário: <strong className="text-slate-200">{veh.owner_name}</strong> ({veh.owner_passport})
                      </div>
                      {veh.notes && <div className="text-xs text-slate-500">{veh.notes}</div>}
                    </div>

                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                        veh.status === 'Roubado/Furtado'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : veh.status === 'Apreendido'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : veh.status === 'Regular'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                     >
                      {veh.status || "Não informado"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-sm border border-blue-500/25 rounded-2xl p-5 shadow-lg h-fit">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                Gerenciamento exclusivo do DOT
              </h3>
              <div className="mb-3 text-xs font-mono text-blue-300 tracking-wider">MODO CONSULTA</div>
              <p className="text-sm text-slate-400">O cadastro e a atualização dos veículos são de responsabilidade do Departamento de Trânsito. A Polícia Militar possui acesso somente para consulta.</p>
            </div>
          </div>
  );
}
