import {
  db,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  waitForAuthReady,
  ensureAuthSession
} from './firebase.js';
import { filterCirculares, getUniqueDepartments } from './search.js';

const cardsContainer = document.getElementById('cardsContainer');
const searchInput = document.getElementById('searchInput');
const departmentFilter = document.getElementById('departmentFilter');
const statusText = document.getElementById('statusText');

let allCirculares = [];
let unsubscribeCirculares = null;

const safeText = (value) => (value === null || value === undefined || value === '' ? 'Sin dato' : value);

const normalizeCircular = (id, data = {}) => ({
  id,
  codigo: data.codigo || '',
  numero: data.numero || '',
  departamento: data.departamento || '',
  descripcion: data.descripcion || '',
  fecha: data.fecha || '',
  pdfUrl: data.pdfUrl || '#',
  codigoNormalizado: data.codigoNormalizado || '',
  numeroNormalizado: data.numeroNormalizado || '',
  createdAt: data.createdAt || null,
  createdBy: data.createdBy || ''
});

const circularCard = (id, circular) => `
  <article class="card">
    <div class="card-header">
      <h3>CIRCULAR #${safeText(circular.numero)}</h3>
      <span class="badge">${safeText(circular.departamento)}</span>
    </div>
    <p class="meta">Fecha: ${safeText(circular.fecha)}</p>
    <div class="card-actions">
      <a class="btn btn-secondary" href="./detalle.html?id=${id}">Ver detalle</a>
      <a class="btn" href="${safeText(circular.pdfUrl)}" target="_blank" rel="noopener noreferrer">Ver PDF</a>
    </div>
  </article>
`;

const renderCards = (circulares) => {
  if (!circulares.length) {
    cardsContainer.innerHTML = '<p class="empty">No se encontraron circulares.</p>';
    return;
  }
  cardsContainer.innerHTML = circulares.map(({ id, ...c }) => circularCard(id, c)).join('');
};

const renderDepartmentOptions = () => {
  const current = departmentFilter.value;
  const departments = getUniqueDepartments(allCirculares);

  departmentFilter.innerHTML = [
    '<option value="TODOS">Todos los departamentos</option>',
    ...departments.map((d) => `<option value="${d}">${d}</option>`)
  ].join('');

  if (departments.includes(current)) {
    departmentFilter.value = current;
  }
};

const applyFilters = () => {
  const filtered = filterCirculares(allCirculares, searchInput.value, departmentFilter.value);
  renderCards(filtered);
};

const subscribeToCirculares = (circularesQuery) =>
  onSnapshot(
    circularesQuery,
    (snapshot) => {
      allCirculares = snapshot.docs.map((docSnap) => normalizeCircular(docSnap.id, docSnap.data()));
      renderDepartmentOptions();
      applyFilters();
      statusText.textContent = `Circulares cargadas: ${allCirculares.length}`;
    },
    (error) => {
      console.error('[APP][SNAPSHOT]', error);
      const isPermissionError = error?.code === 'permission-denied';
      statusText.textContent = isPermissionError
        ? 'No hay permisos para leer las circulares. Revisa reglas de Firestore.'
        : 'No fue posible cargar las circulares.';
      cardsContainer.innerHTML = '<p class="empty">Error al cargar datos.</p>';
    }
  );

const loadCirculares = async () => {
  statusText.textContent = 'Cargando circulares...';
  await waitForAuthReady();
  await ensureAuthSession();

  const baseCollection = collection(db, 'circulares');
  const orderedQuery = query(baseCollection, orderBy('createdAt', 'desc'), limit(100));

  try {
    unsubscribeCirculares?.();
    unsubscribeCirculares = subscribeToCirculares(orderedQuery);
  } catch (error) {
    console.warn('[APP] Falló query con orderBy(createdAt), usando fallback.', error);
    const fallbackQuery = query(baseCollection, limit(100));
    unsubscribeCirculares?.();
    unsubscribeCirculares = subscribeToCirculares(fallbackQuery);
  }
};

searchInput.addEventListener('input', applyFilters);
departmentFilter.addEventListener('change', applyFilters);

loadCirculares();
