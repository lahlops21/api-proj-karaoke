import { pool } from '../../db/pool';

export interface Admin {
  id_administrador: number;
  nome_administrador: string;
  email_administrador: string;
  senha_administrador: string;
  endereco_administrador?: string | null;
}

export const adminRepo = {
  async findByEmail(email: string): Promise<Admin | null> {
    const [rows] = await pool.query<Admin[]>(
      'SELECT * FROM Administrador WHERE email_administrador = :email LIMIT 1',
      { email }
    );
    return rows[0] || null;
  },
  async findById(id: number): Promise<Admin | null> {
    const [rows] = await pool.query<Admin[]>(
      'SELECT * FROM Administrador WHERE id_administrador = :id LIMIT 1',
      { id }
    );
    return rows[0] || null;
  },
  async updatePassword(id: number, hash: string) {
    await pool.query(
      'UPDATE Administrador SET senha_administrador = :hash WHERE id_administrador = :id',
      { hash, id }
    );
  },
  async create(data: { nome: string; email: string; senhaHash: string; endereco?: string | null }) {
    const [res] = await pool.query<any>(
      'INSERT INTO Administrador (nome_administrador, email_administrador, senha_administrador, endereco_administrador) VALUES (:nome, :email, :senha, :endereco)',
      { nome: data.nome, email: data.email, senha: data.senhaHash, endereco: data.endereco ?? null }
    );
    return res.insertId as number;
  }
};

