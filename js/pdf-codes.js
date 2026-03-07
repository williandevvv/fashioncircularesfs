const CODE_REGEX = /\b[A-Z0-9]{3,}(?:-[A-Z0-9]+)*\b/g;

const STOP_WORDS = new Set([
  'CIRCULAR',
  'CODIGO',
  'CODIGO',
  'DEPARTAMENTO',
  'FECHA',
  'DESCRIPCION',
  'ADMINISTRACION',
  'JUGUETERIA',
  'HOGAR',
  'FASHION',
  'INVENTARIO',
  'PRECIO',
  'UNIDAD',
  'CANTIDAD',
  'PAGINA'
]);

const normalizeWord = (value = '') =>
  value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();

const isCodeCandidate = (value) => {
  const normalized = normalizeWord(value);
  if (!normalized) return false;
  if (STOP_WORDS.has(normalized)) return false;
  // Evita ruido numérico puro (p. ej. 2024 o números de página).
  return /[A-Z]/.test(normalized);
};

export const extractCodesFromText = (text = '') => {
  const normalizedText = normalizeWord(text);
  const matches = normalizedText.match(CODE_REGEX) || [];
  const uniqueCodes = [...new Set(matches.filter(isCodeCandidate))];
  return uniqueCodes.sort((a, b) => a.localeCompare(b, 'es'));
};

export const extractPdfTextAndCodes = async (file) => {
  if (!window.pdfjsLib) {
    throw new Error('PDF.js no está disponible en la página.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';

  // Recorre todas las páginas del PDF para extraer texto con getTextContent().
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(' ');
    fullText += `${pageText}\n`;
  }

  return {
    textoExtraido: fullText.trim(),
    codigos: extractCodesFromText(fullText)
  };
};
