/**
 * Dashboard de Evaluaciones de Desempeño RRHH
 * Cruz Roja Madrid
 */

'use strict';

// ─── State ────────────────────────────────────────────────────────────────────
let allEmployees = [];
let filtered = [];
let sortKey = 'nombre';
let sortAsc = true;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const ESTADO_LABELS = {
  excelente: '⭐ Excelente',
  bueno: '✅ Bueno',
  mejorable: '⚠️ Mejorable',
  insuficiente: '❌ Insuficiente',
};

const COMPETENCIA_LABELS = {
  liderazgo: 'Liderazgo',
  comunicacion: 'Comunicación',
  trabajoEquipo: 'Trabajo en Equipo',
  iniciativa: 'Iniciativa',
  cumplimientoObjetivos: 'Cumplimiento Obj.',
};

function scoreColor(score) {
  if (score >= 85) return '#28a745';
  if (score >= 70) return '#17a2b8';
  if (score >= 60) return '#ffc107';
  return '#dc3545';
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// ─── Data Loading ─────────────────────────────────────────────────────────────
async function loadData() {
  const res = await fetch('data/employees.json');
  if (!res.ok) throw new Error('No se pudo cargar el fichero de datos.');
  return res.json();
}

// ─── KPI Cards ────────────────────────────────────────────────────────────────
function renderKPIs(employees) {
  const total = employees.length;
  const avg = total ? Math.round(employees.reduce((s, e) => s + e.puntuacion, 0) / total) : 0;
  const counts = { excelente: 0, bueno: 0, mejorable: 0, insuficiente: 0 };
  employees.forEach(e => { counts[e.estado] = (counts[e.estado] || 0) + 1; });

  $('#kpi-total').textContent = total;
  $('#kpi-avg').textContent = avg;
  $('#kpi-excelente').textContent = counts.excelente;
  $('#kpi-bueno').textContent = counts.bueno;
  $('#kpi-mejorable').textContent = counts.mejorable;
  $('#kpi-insuficiente').textContent = counts.insuficiente;
}

// ─── Bar Chart: Average by Department ─────────────────────────────────────────
function renderDeptChart(employees) {
  const deptMap = {};
  employees.forEach(e => {
    if (!deptMap[e.departamento]) deptMap[e.departamento] = [];
    deptMap[e.departamento].push(e.puntuacion);
  });
  const depts = Object.entries(deptMap)
    .map(([name, scores]) => ({
      name,
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }))
    .sort((a, b) => b.avg - a.avg);

  const container = $('#dept-chart');
  container.innerHTML = depts.length
    ? depts.map(d => `
        <div class="bar-row">
          <span class="bar-label" title="${d.name}">${d.name}</span>
          <div class="bar-track">
            <div class="bar-fill" style="width:${d.avg}%; background:${scoreColor(d.avg)}"></div>
          </div>
          <span class="bar-value">${d.avg}</span>
        </div>`).join('')
    : '<p class="no-results">Sin datos</p>';
}

// ─── Donut Chart: Distribution by Estado ──────────────────────────────────────
function renderDonut(employees) {
  const total = employees.length;
  const counts = { excelente: 0, bueno: 0, mejorable: 0, insuficiente: 0 };
  employees.forEach(e => { counts[e.estado] = (counts[e.estado] || 0) + 1; });

  const COLORS = {
    excelente: '#28a745',
    bueno: '#17a2b8',
    mejorable: '#ffc107',
    insuficiente: '#dc3545',
  };

  const avg = total ? Math.round(employees.reduce((s, e) => s + e.puntuacion, 0) / total) : 0;

  // SVG donut
  const R = 54;
  const C = 2 * Math.PI * R;
  let offset = 0;
  const segments = Object.entries(counts).map(([key, count]) => {
    const pct = total ? (count / total) : 0;
    const dash = pct * C;
    const seg = { key, count, pct, dash, offset };
    offset += dash;
    return seg;
  }).filter(s => s.count > 0);

  const svgCircles = segments.map(s => `
    <circle cx="70" cy="70" r="${R}"
      fill="none"
      stroke="${COLORS[s.key]}"
      stroke-width="16"
      stroke-dasharray="${s.dash} ${C - s.dash}"
      stroke-dashoffset="${-s.offset}"
    />`).join('');

  $('#donut-svg').innerHTML = `
    <circle cx="70" cy="70" r="${R}" fill="none" stroke="#f0f0f0" stroke-width="16"/>
    ${svgCircles}`;

  $('#donut-avg').textContent = avg;

  const legend = $('#donut-legend');
  const NAMES = { excelente: 'Excelente', bueno: 'Bueno', mejorable: 'Mejorable', insuficiente: 'Insuficiente' };
  legend.innerHTML = Object.entries(counts).map(([key, count]) => `
    <div class="legend-item">
      <span class="legend-dot" style="background:${COLORS[key]}"></span>
      <span class="legend-name">${NAMES[key]}</span>
      <span class="legend-count">${count}</span>
    </div>`).join('');
}

// ─── Employee Table ────────────────────────────────────────────────────────────
function sortEmployees(arr) {
  return [...arr].sort((a, b) => {
    let va = a[sortKey];
    let vb = b[sortKey];
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return sortAsc ? -1 : 1;
    if (va > vb) return sortAsc ? 1 : -1;
    return 0;
  });
}

function renderTable(employees) {
  const sorted = sortEmployees(employees);
  const tbody = $('#employee-tbody');
  const count = $('#table-count');
  count.textContent = `Mostrando ${sorted.length} de ${allEmployees.length} evaluaciones`;

  if (!sorted.length) {
    tbody.innerHTML = `
      <tr><td colspan="6">
        <div class="no-results">
          <span class="no-results-icon">🔍</span>
          No se encontraron resultados con los filtros aplicados.
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = sorted.map(e => `
    <tr data-id="${e.id}" tabindex="0" role="button" aria-label="Ver detalle de ${e.nombre}">
      <td>
        <div class="employee-name">${e.nombre}</div>
        <div class="employee-cargo">${e.cargo}</div>
      </td>
      <td>${e.departamento}</td>
      <td>
        <div class="score-cell">
          <span class="score-num" style="color:${scoreColor(e.puntuacion)}">${e.puntuacion}</span>
          <div class="mini-bar-track">
            <div class="mini-bar-fill" style="width:${e.puntuacion}%; background:${scoreColor(e.puntuacion)}"></div>
          </div>
        </div>
      </td>
      <td><span class="badge badge-${e.estado}">${ESTADO_LABELS[e.estado] || e.estado}</span></td>
      <td>${formatDate(e.fechaEvaluacion)}</td>
      <td style="text-align:right">
        <button class="btn-detail" data-id="${e.id}" style="
          padding:5px 12px;background:transparent;border:1px solid var(--color-primary);
          color:var(--color-primary);border-radius:5px;font-size:0.78rem;font-weight:600;cursor:pointer;
          transition:background .2s,color .2s;"
          onmouseover="this.style.background='var(--color-primary)';this.style.color='white';"
          onmouseout="this.style.background='transparent';this.style.color='var(--color-primary)';"
        >Ver</button>
      </td>
    </tr>`).join('');

  // Update sort icons
  $$('thead th[data-sort]').forEach(th => {
    const icon = th.querySelector('.sort-icon');
    if (th.dataset.sort === sortKey) {
      th.classList.add('sorted');
      icon.textContent = sortAsc ? '▲' : '▼';
    } else {
      th.classList.remove('sorted');
      icon.textContent = '⇅';
    }
  });
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function openModal(employee) {
  const overlay = $('#modal-overlay');
  $('#modal-name').textContent = employee.nombre;
  $('#modal-meta').textContent = `${employee.cargo} · ${employee.departamento}`;
  $('#modal-score').innerHTML = `${employee.puntuacion}<span>/100</span>`;
  $('#modal-badge').innerHTML = `<span class="badge badge-${employee.estado}">${ESTADO_LABELS[employee.estado]}</span>`;
  $('#modal-fecha').textContent = `Evaluado el ${formatDate(employee.fechaEvaluacion)}`;

  const compContainer = $('#modal-competencias');
  compContainer.innerHTML = Object.entries(employee.competencias).map(([key, val]) => `
    <div class="competencia-row">
      <span class="competencia-name">${COMPETENCIA_LABELS[key] || key}</span>
      <div class="competencia-track">
        <div class="competencia-fill" style="width:${val}%"></div>
      </div>
      <span class="competencia-value">${val}</span>
    </div>`).join('');

  $('#modal-comentarios').textContent = employee.comentarios;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  $('#modal-close').focus();
}

function closeModal() {
  $('#modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ─── Filters ──────────────────────────────────────────────────────────────────
function applyFilters() {
  const dept = $('#filter-dept').value;
  const estado = $('#filter-estado').value;
  const search = $('#filter-search').value.trim().toLowerCase();

  filtered = allEmployees.filter(e => {
    const matchDept = !dept || e.departamento === dept;
    const matchEstado = !estado || e.estado === estado;
    const matchSearch = !search
      || e.nombre.toLowerCase().includes(search)
      || e.cargo.toLowerCase().includes(search)
      || e.departamento.toLowerCase().includes(search);
    return matchDept && matchEstado && matchSearch;
  });

  renderKPIs(filtered);
  renderDeptChart(filtered);
  renderDonut(filtered);
  renderTable(filtered);
}

function populateDeptFilter(employees) {
  const depts = [...new Set(employees.map(e => e.departamento))].sort();
  const sel = $('#filter-dept');
  depts.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    sel.appendChild(opt);
  });
}

// ─── Event Listeners ──────────────────────────────────────────────────────────
function attachEvents() {
  // Filters
  $('#filter-dept').addEventListener('change', applyFilters);
  $('#filter-estado').addEventListener('change', applyFilters);
  $('#filter-search').addEventListener('input', applyFilters);
  $('#btn-reset').addEventListener('click', () => {
    $('#filter-dept').value = '';
    $('#filter-estado').value = '';
    $('#filter-search').value = '';
    applyFilters();
  });

  // Table sort
  $$('thead th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (sortKey === key) {
        sortAsc = !sortAsc;
      } else {
        sortKey = key;
        sortAsc = true;
      }
      renderTable(filtered);
    });
  });

  // Table row click -> modal
  $('#employee-tbody').addEventListener('click', e => {
    const row = e.target.closest('tr[data-id]');
    if (!row) return;
    const id = parseInt(row.dataset.id, 10);
    const emp = allEmployees.find(x => x.id === id);
    if (emp) openModal(emp);
  });

  // Keyboard accessibility for rows
  $('#employee-tbody').addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const row = e.target.closest('tr[data-id]');
      if (row) {
        e.preventDefault();
        const id = parseInt(row.dataset.id, 10);
        const emp = allEmployees.find(x => x.id === id);
        if (emp) openModal(emp);
      }
    }
  });

  // Modal close
  $('#modal-close').addEventListener('click', closeModal);
  $('#modal-overlay').addEventListener('click', e => {
    if (e.target === $('#modal-overlay')) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
}

// ─── Init ─────────────────────────────────────────────────────────────────────
async function init() {
  try {
    allEmployees = await loadData();
    filtered = [...allEmployees];
    populateDeptFilter(allEmployees);
    applyFilters();
    attachEvents();

    // Set current date
    const now = new Date();
    $('#header-date').textContent = now.toLocaleDateString('es-ES', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch (err) {
    console.error(err);
    document.body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;text-align:center;padding:24px;">
        <div>
          <div style="font-size:3rem;margin-bottom:12px">⚠️</div>
          <h2 style="color:#e8001d">Error al cargar los datos</h2>
          <p style="color:#666;margin-top:8px">${err.message}</p>
          <p style="color:#999;font-size:.85rem;margin-top:4px">Abre la aplicación desde un servidor HTTP (no directamente como fichero).</p>
        </div>
      </div>`;
  }
}

document.addEventListener('DOMContentLoaded', init);
