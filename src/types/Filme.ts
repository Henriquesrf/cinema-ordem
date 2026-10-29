export type Classificacao = "Livre" | "10" | "12" | "14" | "16" | "18";

export type FilmeDados = {
  nome: string;
  anoLancamento: number;
  classificacaoIndicativa: Classificacao;
  genero: string;
  diretor: string;
};

export type Filme = FilmeDados & {
  id: string;
};
