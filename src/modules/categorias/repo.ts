import { pool } from '../../db/pool';

export const categoriasRepo = {
  async listAll() {
    const [rows] = await pool.query<any[]>(
      `SELECT c.id_categoria, c.nome_categoria,
              ANY_VALUE(mc.descricao_categoria) AS descricao_categoria,
              ANY_VALUE(mc.icone) AS icone
       FROM Categorias c
       LEFT JOIN MusicaCategoria mc ON mc.id_categoria = c.id_categoria
       GROUP BY c.id_categoria, c.nome_categoria
       ORDER BY c.nome_categoria ASC`
    );
    return rows;
  }
};

