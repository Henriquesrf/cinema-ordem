import type { Filme } from "../types/Filme";

export type OrdenacaoFilmes = "nome-asc" | "nome-desc" | "ano-asc" | "ano-desc";

export const opcoesOrdenacao: {
  valor: OrdenacaoFilmes;
  rotulo: string;
  descricao: string;
}[] = [
  { valor: "nome-asc", rotulo: "Nome A–Z", descricao: "Nome em ordem alfabética, de A a Z" },
  { valor: "nome-desc", rotulo: "Nome Z–A", descricao: "Nome em ordem alfabética, de Z a A" },
  { valor: "ano-asc", rotulo: "Ano crescente", descricao: "Ano: dos mais antigos aos mais recentes" },
  { valor: "ano-desc", rotulo: "Ano decrescente", descricao: "Ano: dos mais recentes aos mais antigos" },
];

export function obterOrdemFirestore(ordenacao: OrdenacaoFilmes): {
  campo: "nome" | "anoLancamento";
  direcao: "asc" | "desc";
} {
  switch (ordenacao) {
    case "nome-asc": return { campo: "nome", direcao: "asc" };
    case "nome-desc": return { campo: "nome", direcao: "desc" };
    case "ano-asc": return { campo: "anoLancamento", direcao: "asc" };
    case "ano-desc": return { campo: "anoLancamento", direcao: "desc" };
  }
}

// Firestore ordena strings por bytes, sem colação em português.
// Após a consulta, ajustamos maiúsculas/acentos para a exibição em pt-BR.
// Para anos iguais, o nome A–Z e o ID desempatam de maneira estável.
export function ordenarFilmes(filmes: Filme[], ordenacao: OrdenacaoFilmes): Filme[] {
  const { campo, direcao } = obterOrdemFirestore(ordenacao);
  const sentido = direcao === "asc" ? 1 : -1;
  return [...filmes].sort((a, b) => {
    const nomes = a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" });
    if (campo === "anoLancamento") {
      return (a.anoLancamento - b.anoLancamento) * sentido || nomes || a.id.localeCompare(b.id);
    }
    return nomes * sentido || a.id.localeCompare(b.id);
  });
}
