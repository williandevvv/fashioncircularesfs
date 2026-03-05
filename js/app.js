import {
  db,
  collection,
  onSnapshot,
  orderBy,
  query,
  limit,
  waitForAuthReady
} from './firebase.js';
import { filterCirculares, getUniqueDepartments } from './search.js';

const cardsContainer = document.getElementById('cardsContainer');
const searchInput = document.getElementById('searchInput');
const departmentFilter = document.getElementById('departmentFilter');
const statusText = document.getElementById('statusText');

let allCirculares = [];

const safeText = (value) => value || 'Sin dato';

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

const loadCirculares = async () => {
  statusText.textContent = 'Cargando circulares...';
  await waitForAuthReady();

  const circularesQuery = query(
    collection(db, 'circulares'),
    orderBy('createdAt', 'desc'),
    limit(100)
  );

  onSnapshot(
    circularesQuery,
    (snapshot) => {
      allCirculares = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      renderDepartmentOptions();
      applyFilters();
      statusText.textContent = `Circulares cargadas: ${allCirculares.length}`;
    },
    (error) => {
      console.error(error);
      statusText.textContent = 'No fue posible cargar las circulares.';
      cardsContainer.innerHTML = '<p class="empty">Error al cargar datos.</p>';
    }
  );
};

searchInput.addEventListener('input', applyFilters);
departmentFilter.addEventListener('change', applyFilters);

loadCirculares();
