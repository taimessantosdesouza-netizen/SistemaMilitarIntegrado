const STORAGE_KEY = "bombeiros_registros_cache";
let items = [];

function getSupaClient() {
  if (typeof supabaseClient !== "undefined" && supabaseClient?.from) return supabaseClient;
  if (typeof supabase !== "undefined" && typeof supabase.from === "function") return supabase;
  if (typeof supabase !== "undefined" && typeof supabase.createClient === "function") {
    const url = window.SUPABASE_URL || "";
    const key = window.SUPABASE_ANON_KEY || "";
    if (url && key) return supabase.createClient(url, key);
  }
  return null;
}

const supa = getSupaClient();

function makeMatricula() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function renderList() {
  const container = document.getElementById("cardsList");
  const query = (document.getElementById("searchInput")?.value || "").trim().toLowerCase();
  if (!container) return;

  const filtered = items.filter((row) => {
    if (!query) return true;
    return `${row.nome || ""} ${row.nome_guerra || ""} ${row.matricula || ""} ${row.patente || ""} ${row.grupamento || ""}`
      .toLowerCase()
      .includes(query);
  });

  if (!filtered.length) {
    container.innerHTML = `<div class="card-item"><p class="card-meta">Nenhum registro encontrado.</p></div>`;
    return;
  }

  container.innerHTML = filtered
    .map(
      (row) => `
      <article class="card-item">
        <h2 class="card-title">${row.nome} (${row.nome_guerra})</h2>
        <p class="card-meta">
          <strong>Patente:</strong> ${row.patente} •
          <strong>Matrícula:</strong> ${row.matricula} •
          <strong>Grupamento:</strong> ${row.grupamento}
        </p>
      </article>
    `
    )
    .join("");
}

async function loadItems() {
  if (supa) {
    const { data, error } = await supa
      .from("bombeiros_registros")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && Array.isArray(data)) {
      items = data;
      renderList();
      return;
    }
  }

  try {
    items = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    items = [];
  }
  renderList();
}

async function saveItem(payload) {
  if (supa) {
    const { data, error } = await supa
      .from("bombeiros_registros")
      .insert([payload])
      .select()
      .single();
    if (!error && data) {
      items.unshift(data);
      renderList();
      return;
    }
  }

  const localRow = { id: String(Date.now()), ...payload, created_at: new Date().toISOString() };
  items.unshift(localRow);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  renderList();
}

document.addEventListener("DOMContentLoaded", () => {
  loadItems();

  const panel = document.getElementById("formPanel");
  document.getElementById("toggleFormBtn")?.addEventListener("click", () => {
    panel?.classList.toggle("hidden");
  });

  document.getElementById("searchInput")?.addEventListener("input", renderList);

  document.getElementById("bombeiroForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      matricula: makeMatricula(),
      nome: document.getElementById("nomeInput").value.trim(),
      nome_guerra: document.getElementById("guerraInput").value.trim().toUpperCase(),
      patente: document.getElementById("patenteInput").value.trim(),
      grupamento: document.getElementById("grupamentoInput").value.trim()
    };

    await saveItem(payload);
    e.target.reset();

    const msg = document.getElementById("statusMsg");
    if (msg) {
      msg.textContent = `Salvo! Matrícula: ${payload.matricula}`;
      msg.classList.remove("hidden");
    }
  });
});
