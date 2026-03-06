// Normaliza texto para búsquedas flexibles.
// - minúsculas
// - sin tildes
// - sin espacios, #, guiones ni signos
// - solo letras y números
export const normalizeText = (value = '') =>
  value
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

const safeValue = (value) => (typeof value === 'string' ? value : value?.toString?.() || '');

const matchesTerm = (circular, rawSearchText) => {
  const term = normalizeText(rawSearchText);
  if (!term) return true;

  // Fallback robusto para documentos viejos que no tengan campos normalizados.
  const codigo = safeValue(circular.codigo);
  const numero = safeValue(circular.numero);
  const departamento = safeValue(circular.departamento);
  const descripcion = safeValue(circular.descripcion);

  const codigoNormalizado =
    safeValue(circular.codigoNormalizado) || normalizeText(codigo);
  const numeroNormalizado =
    safeValue(circular.numeroNormalizado) || normalizeText(numero);

  const haystacks = [
    normalizeText(codigo),
    normalizeText(numero),
    normalizeText(departamento),
    normalizeText(descripcion),
    codigoNormalizado,
    numeroNormalizado
  ].filter(Boolean);

  return haystacks.some((value) => value.includes(term));
};

const matchesDepartment = (circular, selectedDepartment) => {
  if (!selectedDepartment || selectedDepartment === 'TODOS') return true;
  return safeValue(circular.departamento) === selectedDepartment;
};

export const filterCirculares = (circulares, searchText, department) =>
  circulares.filter(
    (circular) => matchesTerm(circular, searchText) && matchesDepartment(circular, department)
  );

export const getUniqueDepartments = (circulares) =>
  [...new Set(circulares.map((c) => safeValue(c.departamento).trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'es')
  );
