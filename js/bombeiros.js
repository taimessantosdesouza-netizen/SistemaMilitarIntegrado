const cbmClient =
  typeof supabaseClient !== "undefined" && supabaseClient
    ? supabaseClient
    : typeof supabase !== "undefined" && supabase?.from
      ? supabase
      : null;

const LOCAL_STORAGE_KEY = "cbm_registros_local";
let cbmRecords = [];

function generateMatricula() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function getInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "BM";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDateTime(dt) {
  if (!dt) return "-";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return dt;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function showNotice(msg) {
  const box = document.getElementById("cbmNotice");
  if (!box) return;
  box.textContent = msg;
  box.classList.remove("hidden");
}

function renderCbmCards() {
  const grid = document.getElementById("cbmGrid");
  const count = document.getElementById("cbmCount");
  const term = (document.getElementById("cbmSearchInput")?.value || "").trim().toLowerCase();
  const atoFilter = (document.getElementById("cbmFilterAto")?.value || "").trim().toUpperCase();

  const filtered = cbmRecords.filter((item) => {
    if (atoFilter && String(item.ato || "").toUpperCase() !== atoFilter) {
      return false;
    }
    if (term) {
      const hay = `${item.nome} ${item.nome_guerra} ${item.matricula} ${item.patente} ${item.grupamento}`.toLowerCase();
      if (!hay.includes(term)) return false;
    }
    return true;
  });

  if (count) {
    count.innerHTML = `Exibindo <strong>${filtered.length}</strong> ${filtered.length === 1 ? "registro" : "registros"}`;
  }

  if (!grid) return;

  if (!filtered.length) {
    grid.innerHTML = `
      <div class="cbm-card" style="grid-column:1 / -1;justify-content:center;">
        <p style="color:#64748b;">Nenhum registro encontrado. Clique em <strong>+ Novo Registro</strong> no topo para publicar o primeiro bombeiro.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered
    .map((item) => {
      const photoHtml = item.foto_url
        ? `<img src="${item.foto_url}" alt="${item.nome}" loading="lazy" />`
        : `<span>${getInitials(item.nome)}</span>`;

      return `
        <article class="cbm-card">
          <div class="cbm-badge">
            <div class="cbm-photo">${photoHtml}</div>
            <div class="cbm-badge-foot">
              <div class="cbm-war-name">${item.nome_guerra || "BOMBEIRO"}</div>
              <div class="cbm-ato-tag">${item.ato || "PUBLICADO"}</div>
            </div>
          </div>

          <div class="cbm-info">
            <h3>${item.nome}</h3>
            <ul class="cbm-meta">
              <li><strong>Patente:</strong> ${item.patente}</li>
              <li><strong>Matrícula CBM:</strong> ${item.matricula}</li>
              <li><strong>Grupamento:</strong> ${item.grupamento}</li>
              <li><strong>Ato:</strong> ${item.ato}</li>
              <li><strong>Publicado em:</strong> ${formatDateTime(item.created_at)}</li>
            </ul>
          </div>
        </article>
      `;
    })
    .join("");
}

async function loadCbmRecords() {
  if (cbmClient) {
    const { data, error } = await cbmClient
      .from("bombeiros_registros")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      cbmRecords = data;
      renderCbmCards();
      return;
    }
  }

  try {
    cbmRecords = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
  } catch {
    cbmRecords = [];
  }
  renderCbmCards();
}

async function saveCbmRecord(payload) {
  if (cbmClient) {
    const { data, error } = await cbmClient
      .from("bombeiros_registros")
      .insert([payload])
      .select()
      .single();

    if (!error && data) {
      cbmRecords.unshift(data);
      renderCbmCards();
      return true;
    }
  }

  const localItem = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    ...payload,
    created_at: new Date().toISOString()
  };
  cbmRecords.unshift(localItem);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cbmRecords));
  renderCbmCards();
  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  loadCbmRecords();

  const adminBox = document.getElementById("cbmAdminBox");
  document.getElementById("toggleAdminCbm")?.addEventListener("click", () => {
    adminBox?.classList.toggle("hidden");
  });
  document.getElementById("closeAdminCbm")?.addEventListener("click", () => {
    adminBox?.classList.add("hidden");
  });

  document.getElementById("cbmSearchInput")?.addEventListener("input", renderCbmCards);
  document.getElementById("cbmFilterAto")?.addEventListener("change", renderCbmCards);

  document.getElementById("cbmForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      matricula: generateMatricula(),
      nome: document.getElementById("cbmNome").value.trim(),
      nome_guerra: document.getElementById("cbmNomeGuerra").value.trim().toUpperCase(),
      patente: document.getElementById("cbmPatente").value,
      grupamento: document.getElementById("cbmGrupamento").value.trim(),
      ato: document.getElementById("cbmAto").value,
      foto_url: document.getElementById("cbmFoto").value.trim() || null
    };

    await saveCbmRecord(payload);
    e.target.reset();
    showNotice(`Registro publicado com sucesso! Matrícula CBM: ${payload.matricula}`);
  });
});
