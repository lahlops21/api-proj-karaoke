import { musicaRepo } from './repo';

export async function createMusica(input: {
  titulo: string;
  codigo_musica: string;
  letra_musica?: string | null;
  interprete_musica?: string | null;
  artistaIds?: number[];
  categoriaIds?: number[];
}) {
  const id = await musicaRepo.create(input);
  if (input.artistaIds && input.artistaIds.length) {
    await musicaRepo.linkArtists(id, input.artistaIds);
  }
  if (input.categoriaIds && input.categoriaIds.length) {
    await musicaRepo.linkCategories(id, input.categoriaIds);
  }
  return id;
}

export async function updateMusica(
  id: number,
  input: Partial<{
    titulo: string;
    codigo_musica: string;
    letra_musica?: string | null;
    interprete_musica?: string | null;
    artistaIds?: number[];
    categoriaIds?: number[];
  }>
) {
  const { artistaIds, categoriaIds, ...data } = input;
  await musicaRepo.update(id, data as any);
  if (artistaIds) {
    await musicaRepo.clearArtists(id);
    await musicaRepo.linkArtists(id, artistaIds);
  }
  if (categoriaIds) {
    await musicaRepo.clearCategories(id);
    await musicaRepo.linkCategories(id, categoriaIds);
  }
}

export async function getMusicaDetalhe(id: number) {
  const m = await musicaRepo.getById(id);
  if (!m) return null;
  const artistas = await musicaRepo.getArtists(id);
  const categorias = await musicaRepo.getCategories(id);
  return {
    id: m.id_musica,
    titulo: m.titulo,
    codigo: m.codigo_musica,
    letra: m.letra_musica,
    interprete: m.interprete_musica,
    artistas,
    categorias
  };
}

