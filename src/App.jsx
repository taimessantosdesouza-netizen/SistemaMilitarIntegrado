import { useState } from "react";
import { supabase } from "./lib/supabase";

export default function App() {
  const [selectedCorp, setSelectedCorp] = useState(null);
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const accesses = [
    {
      id: "bombeiros",
      label: "ACESSO BOMBEIROS",
      isFirefighter: true,
      description: "Sistema do Corpo de Bombeiros — ocorrências, efetivo e boletins."
    },
    {
      id: "policia-militar",
      label: "ACESSO POLÍCIA MILITAR",
      isFirefighter: false,
      description: "Sistema da Polícia Militar — registros e consultas operacionais."
    }
  ];

  async function handleOpenCorp(corp) {
    setSelectedCorp(corp);
    setLoading(true);
    try {
      if (supabase?.from) {
        const { data } = await supabase
          .from("bombeiros_registros")
          .select("*")
          .order("created_at", { ascending: false });
        setRecords(Array.isArray(data) ? data : []);
      }
    } finally {
      setLoading(false);
    }
  }

  const filteredRecords = records.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return `${item.nome || ""} ${item.nome_guerra || ""} ${item.matricula || ""} ${item.grupamento || ""}`
      .toLowerCase()
      .includes(q);
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f5f7] text-[#22262e]">
      <header className="bg-white border-b border-[#e5e7eb] px-6 py-4">
        <div className="max-w-[760px] mx-auto flex items-center justify-between gap-4">
          <span className="font-extrabold text-[#0057ff] tracking-wide">SISTEMA</span>
          {selectedCorp && (
            <button
              type="button"
              onClick={() => setSelectedCorp(null)}
              className="text-sm font-semibold text-[#22262e] underline cursor-pointer"
            >
              Voltar aos acessos
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-[760px] w-full mx-auto my-7 px-4">
        {!selectedCorp ? (
          <section className="flex flex-col gap-3">
            {accesses.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleOpenCorp(item)}
                className="w-full text-left bg-white border border-[#dfe3ea] rounded-[10px] px-5 py-4 shadow-xs hover:border-[#cbd5e1] flex items-center justify-between gap-3 cursor-pointer"
              >
                <span
                  className={`text-base font-bold ${
                    item.isFirefighter ? "text-[#dc2626]" : "text-[#1f2937]"
                  }`}
                >
                  {item.label}
                </span>
                <span className="font-bold text-[#68707e]">→</span>
              </button>
            ))}
          </section>
        ) : (
          <section className="bg-white border border-[#dfe3ea] rounded-[10px] p-5 shadow-xs">
            <h1
              className={`text-lg font-extrabold mb-3 ${
                selectedCorp.isFirefighter ? "text-[#dc2626]" : "text-[#1f2937]"
              }`}
            >
              {selectedCorp.label}
            </h1>
            <p className="text-sm text-[#68707e] mb-4">{selectedCorp.description}</p>

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar registro..."
              className="w-full h-10 px-3.5 rounded-lg border border-[#cbd5e1] text-sm mb-4"
            />

            {loading ? (
              <p className="text-sm text-[#68707e]">Carregando...</p>
            ) : filteredRecords.length === 0 ? (
              <p className="text-sm text-[#68707e]">Nenhum registro encontrado.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {filteredRecords.map((rec, idx) => (
                  <div
                    key={rec.id || idx}
                    className="border border-[#e5e7eb] rounded-lg p-3 text-sm"
                  >
                    <div className="font-bold text-[#1f2937]">
                      {rec.nome} ({rec.nome_guerra})
                    </div>
                    <div className="text-[#68707e]">
                      {rec.patente} • Matrícula: {rec.matricula} • {rec.grupamento}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="mt-auto bg-[#141820] text-[#e5e7eb] px-6 py-4 text-sm">
        <div className="max-w-[760px] mx-auto">EL Sistema</div>
      </footer>
    </div>
  );
}
