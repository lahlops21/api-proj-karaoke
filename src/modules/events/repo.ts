import { pool } from '../../db/pool';

export const eventsRepo = {
  async insertSearch(termo: string, resultadoEncontrado: boolean, musicaId?: number) {
    const [res] = await pool.query<any>(
      `INSERT INTO Historico (termo_buscado, categoria_clicada, quantidade_termos_buscados, quantidade_categorias_clicadas)
       VALUES (:termo, NULL, :qt, 0)`,
      { termo, qt: resultadoEncontrado ? 1 : 0 }
    );
    const id_historico = res.insertId as number;
    if (musicaId) {
      await pool.query('INSERT INTO HistoricoMusicas (id_historico, id_musica) VALUES (:h, :m)', { h: id_historico, m: musicaId });
    }
  },

  async insertCategoryClick(categoriaId: number) {
    const [rows] = await pool.query<any[]>('SELECT nome_categoria FROM Categorias WHERE id_categoria = :id', { id: categoriaId });
    const nome = rows[0]?.nome_categoria || null;
    await pool.query<any>(
      `INSERT INTO Historico (termo_buscado, categoria_clicada, quantidade_termos_buscados, quantidade_categorias_clicadas)
       VALUES (NULL, :categoria, 0, 1)`,
      { categoria: nome }
    );
  },

  async populares(limit: number) {
    const [rows] = await pool.query<any[]>(
      `SELECT hm.id_musica, COUNT(*) AS score
       FROM HistoricoMusicas hm
       GROUP BY hm.id_musica
       ORDER BY score DESC
       LIMIT :limit`,
      { limit }
    );
    return rows;
  }
};

