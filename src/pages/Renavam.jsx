import React from 'react';
import { Car, Plus } from 'lucide-react';

export default function Renavam({
  vehicleSearch,
  setVehicleSearch,
  filteredVehicles,
  handleUpdateVehicleStatus,
  handleAddVehicle,
  newVehicle,
  setNewVehicle
}) {
  return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
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
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white w-full sm:w-64"
                />
              </div>

              <div className="space-y-3">
                {filteredVehicles.map((veh) => (
                  <div key={veh.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
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

                    <select
                      value={veh.status}
                      onChange={(e) => handleUpdateVehicleStatus(veh, e.target.value)}
                      style={{ colorScheme: 'dark' }}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                        veh.status === 'Roubado/Furtado'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : veh.status === 'Apreendido'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      <option value="Regular">Regular</option>
                      <option value="Roubado/Furtado">Roubado/Furtado</option>
                      <option value="Apreendido">Apreendido</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-fit">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <Plus className="w-5 h-5 text-emerald-400" />
                Registrar Veículo no RENAVAM
              </h3>
              <form onSubmit={handleAddVehicle} className="space-y-3 text-xs">
                <input
                  type="text"
                  required
                  placeholder="Placa (Ex: PTN-8K20)"
                  value={newVehicle.plate}
                  onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                />
                <input
                  type="text"
                  required
                  placeholder="Modelo (Ex: Lancer Evolution)"
                  value={newVehicle.model}
                  onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
                <input
                  type="text"
                  placeholder="Cor"
                  value={newVehicle.color}
                  onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
                <input
                  type="text"
                  required
                  placeholder="Nome do Proprietário"
                  value={newVehicle.owner_name}
                  onChange={(e) => setNewVehicle({ ...newVehicle, owner_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
                <input
                  type="text"
                  placeholder="Passaporte (Ex: PTN-1002)"
                  value={newVehicle.owner_passport}
                  onChange={(e) => setNewVehicle({ ...newVehicle, owner_passport: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                />
                <select
                  value={newVehicle.status}
                  onChange={(e) => setNewVehicle({ ...newVehicle, status: e.target.value })}
                  style={{ colorScheme: 'dark' }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                >
                  <option value="Regular">Regular</option>
                  <option value="Roubado/Furtado">Roubado/Furtado</option>
                  <option value="Apreendido">Apreendido</option>
                </select>
                <input
                  type="text"
                  placeholder="Observações"
                  value={newVehicle.notes}
                  onChange={(e) => setNewVehicle({ ...newVehicle, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition"
                >
                  Cadastrar Veículo
                </button>
              </form>
            </div>
          </div>
  );
}

