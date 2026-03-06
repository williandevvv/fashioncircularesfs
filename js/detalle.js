import { db, doc, getDoc, waitForAuthReady, ensureAuthSession } from './firebase.js';

const detailContainer = document.getElementById('detailContainer');

const params = new URLSearchParams(window.location.search);
const circularId = params.get('id');

const safeText = (value) => (value === null || value === undefined || value === '' ? 'Sin dato' : value);

const renderError = (message) => {
  detailContainer.innerHTML = `<p class="empty">${message}</p>`;
};

const renderCircular = (circular) => {
  const pdfUrl = circular.pdfUrl || '';

  detailContainer.innerHTML = `
    <article class="detail-card">
      <h2>Circular #${safeText(circular.numero)}</h2>
      <dl class="detail-grid">
        <div><dt>Código</dt><dd>${safeText(circular.codigo)}</dd></div>
        <div><dt>Número</dt><dd>${safeText(circular.numero)}</dd></div>
        <div><dt>Departamento</dt><dd>${safeText(circular.departamento)}</dd></div>
        <div><dt>Fecha</dt><dd>${safeText(circular.fecha)}</dd></div>
      </dl>
      <div class="description">
        <h3>Descripción</h3>
        <p>${safeText(circular.descripcion)}</p>
      </div>
      <div class="pdf-wrapper">
        <h3>Documento PDF</h3>
        ${pdfUrl ? `<iframe src="${pdfUrl}" title="PDF de la circular"></iframe>` : '<p class="empty">PDF no disponible.</p>'}
      </div>
      ${
        pdfUrl
          ? `<a class="btn" href="${pdfUrl}" target="_blank" rel="noopener noreferrer">Abrir PDF en nueva pestaña</a>`
          : ''
      }
    </article>
  `;
};

const loadDetail = async () => {
  if (!circularId) {
    renderError('ID de circular no válido.');
    return;
  }

  await waitForAuthReady();
  await ensureAuthSession();

  try {
    const snap = await getDoc(doc(db, 'circulares', circularId));
    if (!snap.exists()) {
      renderError('Circular no encontrada.');
      return;
    }
    renderCircular(snap.data() || {});
  } catch (error) {
    console.error('[DETALLE]', error);
    renderError('No fue posible cargar el detalle.');
  }
};

loadDetail();
