export const componentsSchemas = {
  ErrorResponse: {
    type: 'object',
    properties: {
      message: { type: 'string' }
    },
    required: ['message']
  },
  AdminLoginRequest: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      senha: { type: 'string' }
    },
    required: ['email', 'senha'],
    example: { email: 'admin@exemplo.com', senha: 'senha123' }
  },
  AdminLoginResponse: {
    type: 'object',
    properties: {
      token: { type: 'string' },
      expiresIn: { type: 'integer', example: 1800 }
    },
    required: ['token', 'expiresIn'],
    example: { token: 'eyJhbGciOi...', expiresIn: 1800 }
  },
  ForgotPasswordRequest: {
    type: 'object',
    properties: { email: { type: 'string', format: 'email' } },
    required: ['email']
  },
  ResetPasswordRequest: {
    type: 'object',
    properties: { token: { type: 'string' }, novaSenha: { type: 'string', minLength: 6 } },
    required: ['token', 'novaSenha']
  },
  CreateAdminRequest: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      senha: { type: 'string', minLength: 6 },
      endereco: { type: 'string', nullable: true }
    },
    required: ['name', 'email', 'senha']
  },
  IdResponse: {
    type: 'object',
    properties: { id: { type: 'integer' } },
    required: ['id']
  },
  MusicaBasic: {
    type: 'object',
    properties: {
      id_musica: { type: 'integer' },
      titulo: { type: 'string' },
      codigo_musica: { type: 'string' }
    },
    required: ['id_musica', 'titulo', 'codigo_musica'],
    example: { id_musica: 6, titulo: 'Evidências', codigo_musica: 'K-12345' }
  },
  MusicaDetalhe: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      titulo: { type: 'string' },
      codigo: { type: 'string' },
      letra: { type: 'string', nullable: true },
      interprete: { type: 'string', nullable: true },
      artistas: {
        type: 'array',
        items: {
          type: 'object',
          properties: { id_artista: { type: 'integer' }, nome_artista: { type: 'string' } },
          required: ['id_artista', 'nome_artista']
        }
      },
      categorias: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id_categoria: { type: 'integer' },
            nome_categoria: { type: 'string' },
            descricao_categoria: { type: 'string', nullable: true },
            icone: { type: 'string', nullable: true, description: 'binário/base64 conforme armazenado' }
          },
          required: ['id_categoria', 'nome_categoria']
        }
      }
    },
    required: ['id', 'titulo', 'codigo', 'artistas', 'categorias'],
    example: {
      id: 6,
      titulo: 'Evidências',
      codigo: 'K-12345',
      letra: 'Quando digo que deixei de te amar... (trecho)',
      interprete: 'Chitãozinho & Xororó',
      artistas: [{ id_artista: 1, nome_artista: 'Chitãozinho & Xororó' }],
      categorias: [{ id_categoria: 3, nome_categoria: 'Sertanejo', descricao_categoria: 'Clássicos do sertanejo' }]
    }
  },
  CreateMusicaRequest: {
    type: 'object',
    properties: {
      titulo: { type: 'string' },
      codigo_musica: { type: 'string' },
      letra_musica: { type: 'string', nullable: true },
      interprete_musica: { type: 'string', nullable: true },
      artistaIds: { type: 'array', items: { type: 'integer' } },
      categoriaIds: { type: 'array', items: { type: 'integer' } }
    },
    required: ['titulo', 'codigo_musica']
  },
  UpdateMusicaRequest: {
    type: 'object',
    properties: {
      titulo: { type: 'string' },
      codigo_musica: { type: 'string' },
      letra_musica: { type: 'string', nullable: true },
      interprete_musica: { type: 'string', nullable: true },
      artistaIds: { type: 'array', items: { type: 'integer' } },
      categoriaIds: { type: 'array', items: { type: 'integer' } }
    }
  },
  PaginatedMusicas: {
    type: 'object',
    properties: {
      page: { type: 'integer' },
      limit: { type: 'integer' },
      items: { type: 'array', items: { $ref: '#/components/schemas/MusicaBasic' } }
    },
    required: ['page', 'limit', 'items']
  },
  CategoriaItem: {
    type: 'object',
    properties: {
      id_categoria: { type: 'integer' },
      nome_categoria: { type: 'string' },
      descricao_categoria: { type: 'string', nullable: true },
      icone: { type: 'string', nullable: true }
    },
    required: ['id_categoria', 'nome_categoria']
  },
  EventSearchRequest: {
    type: 'object',
    properties: {
      termo: { type: 'string' },
      resultadoEncontrado: { type: 'boolean' },
      musicaId: { type: 'integer' }
    },
    required: ['termo', 'resultadoEncontrado']
  },
  EventCategoryClickRequest: {
    type: 'object',
    properties: { categoriaId: { type: 'integer' } },
    required: ['categoriaId']
  }
} as const;

export const tags = [
  { name: 'Auth', description: 'Autenticação de administradores' },
  { name: 'Admin - Musicas', description: 'CRUD de músicas para administradores' },
  { name: 'Musicas', description: 'Busca e detalhes de músicas (público)' },
  { name: 'Categorias', description: 'Navegação por categorias' },
  { name: 'Eventos', description: 'Registro de buscas e cliques' }
];
