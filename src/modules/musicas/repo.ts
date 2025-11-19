import { pool } from '../../db/pool';
import { RowDataPacket } from 'mysql2';

export interface MusicaBasic {
  id_musica: number;
  titulo: string;
  codigo_musica: string;
  letra_musica?: string | null;
  interprete_musica?: string | null;
}

export const musicaRepo = {
  async create(data: { titulo: string; codigo_musica: string; letra_musica?: string | null; interprete_musica?: string | null }) {
    const [res] = await pool.query<any>(
      'INSERT INTO Musica (titulo, codigo_musica, letra_musica, interprete_musica) VALUES (:titulo, :codigo, :letra, :interprete)',
      { titulo: data.titulo, codigo: data.codigo_musica, letra: data.letra_musica ?? null, interprete: data.interprete_musica ?? null }
    );
    return res.insertId as number;
  },

  async update(id: number, data: Partial<MusicaBasic>) {
    const fields: string[] = [];
    const params: any = { id };
    if (data.titulo !== undefined) { fields.push('titulo = :titulo'); params.titulo = data.titulo; }
    if (data.codigo_musica !== undefined) { fields.push('codigo_musica = :codigo'); params.codigo = data.codigo_musica; }
    if (data.letra_musica !== undefined) { fields.push('letra_musica = :letra'); params.letra = data.letra_musica; }
    if (data.interprete_musica !== undefined) { fields.push('interprete_musica = :interprete'); params.interprete = data.interprete_musica; }
    if (!fields.length) return;
    await pool.query(`UPDATE Musica SET ${fields.join(', ')} WHERE id_musica = :id`, params);
  },

  async remove(id: number) {
    await pool.query('DELETE FROM Musica WHERE id_musica = :id', { id });
  },

  async listAdmin(opts: { limit: number; offset: number; sortSql: string }) {
    const order = opts.sortSql || 'ORDER BY titulo ASC';
    const [rows] = await pool.query<MusicaBasic[] & RowDataPacket[]>(
      `SELECT id_musica, titulo, codigo_musica, letra_musica, interprete_musica
       FROM Musica ${order} LIMIT :limit OFFSET :offset`,
      { limit: opts.limit, offset: opts.offset }
    );
    return rows;
  },

  async getById(id: number) {
    const [rows] = await pool.query<MusicaBasic[] & RowDataPacket[]>(
      'SELECT * FROM Musica WHERE id_musica = :id',
      { id }
    );
    return rows[0] || null;
  },

  async getArtists(id_musica: number) {
    const [rows] = await pool.query<any[]>(
      `SELECT a.id_artista, a.nome_artista
       FROM MusicaArtista ma JOIN Artista a ON a.id_artista = ma.id_artista
       WHERE ma.id_musica = :id`,
      { id: id_musica }
    );
    return rows;
  },

  async getCategories(id_musica: number) {
    const [rows] = await pool.query<any[]>(
      `SELECT c.id_categoria, c.nome_categoria, mc.descricao_categoria, mc.icone
       FROM MusicaCategoria mc JOIN Categorias c ON c.id_categoria = mc.id_categoria
       WHERE mc.id_musica = :id`,
      { id: id_musica }
    );
    return rows;
  },

  async linkArtists(id_musica: number, artistaIds: number[]) {
    if (!artistaIds.length) return;
    const values = artistaIds.map((id) => `(${id_musica}, ${id})`).join(',');
    await pool.query(`INSERT IGNORE INTO MusicaArtista (id_musica, id_artista) VALUES ${values}`);
  },

  async linkCategories(id_musica: number, categoriaIds: number[]) {
    if (!categoriaIds.length) return;
    const values = categoriaIds.map((id) => `(${id_musica}, ${id}, NULL, NULL)`).join(',');
    await pool.query(`INSERT IGNORE INTO MusicaCategoria (id_musica, id_categoria, icone, descricao_categoria) VALUES ${values}`);
  },

  async clearArtists(id_musica: number) {
    await pool.query('DELETE FROM MusicaArtista WHERE id_musica = :id', { id: id_musica });
  },

  async clearCategories(id_musica: number) {
    await pool.query('DELETE FROM MusicaCategoria WHERE id_musica = :id', { id: id_musica });
  },

  async searchByTitle(q: string, limit: number, offset: number) {
    const [rows] = await pool.query<any[]>(
      `SELECT id_musica, titulo, codigo_musica
       FROM Musica
       WHERE titulo COLLATE utf8mb4_unicode_ci LIKE CONCAT('%', :q, '%')
       ORDER BY titulo ASC
       LIMIT :limit OFFSET :offset`,
      { q, limit, offset }
    );
    return rows;
  },

  async searchByLyric(q: string, limit: number, offset: number) {
    const [rows] = await pool.query<any[]>(
      `SELECT id_musica, titulo, codigo_musica
       FROM Musica
       WHERE letra_musica COLLATE utf8mb4_unicode_ci LIKE CONCAT('%', :q, '%')
       ORDER BY titulo ASC
       LIMIT :limit OFFSET :offset`,
      { q, limit, offset }
    );
    return rows;
  },

  async searchByArtist(q: string, limit: number, offset: number) {
    const [rows] = await pool.query<any[]>(
      `SELECT DISTINCT m.id_musica, m.titulo, m.codigo_musica
       FROM Musica m
       JOIN MusicaArtista ma ON ma.id_musica = m.id_musica
       JOIN Artista a ON a.id_artista = ma.id_artista
       WHERE a.nome_artista COLLATE utf8mb4_unicode_ci LIKE CONCAT('%', :q, '%')
       ORDER BY m.titulo ASC
       LIMIT :limit OFFSET :offset`,
      { q, limit, offset }
    );
    return rows;
  },

  async listByCategory(id_categoria: number, limit: number, offset: number) {
    const [rows] = await pool.query<any[]>(
      `SELECT m.id_musica, m.titulo, m.codigo_musica
       FROM MusicaCategoria mc
       JOIN Musica m ON m.id_musica = mc.id_musica
       WHERE mc.id_categoria = :id
       ORDER BY m.titulo ASC
       LIMIT :limit OFFSET :offset`,
      { id: id_categoria, limit, offset }
    );
    return rows;
  }
};
