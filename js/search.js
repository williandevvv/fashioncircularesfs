const normalize = (value = '') =>
  value
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();

const matchesTerm = (circular, term) => {
  if (!term) return true;

  const haystack = [circular.codigo, circular.numero, circular.departamento]
    .map(normalize)
    .join(' ');

  return haystack.includes(term);
};

const matchesDepartment = (circular, selectedDepartment) => {
  if (!selectedDepartment || selectedDepartment === 'TODOS') return true;
  return normalize(circular.departamento) === normalize(selectedDepartment);
};

export const filterCirculares = (circulares, searchText, department) => {
  const term = normalize(searchText);
  return circulares.filter(
    (circular) => matchesTerm(circular, term) && matchesDepartment(circular, department)
  );
};

export const getUniqueDepartments = (circulares) =>
  [...new Set(circulares.map((c) => c.departamento).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'es')
  );
