export function getPagination(page?: number, limit?: number) {
  const p = !page || page < 1 ? 1 : page;
  const l = !limit || limit < 1 ? 20 : Math.min(limit, 100);
  const offset = (p - 1) * l;
  return { limit: l, offset, page: p };
}

export function parseSort(sort?: string, allowed: string[] = [], order?: string) {
  const dir = (order || 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  if (!sort || !allowed.includes(sort)) return '';
  return `ORDER BY ${sort} ${dir}`;
}

