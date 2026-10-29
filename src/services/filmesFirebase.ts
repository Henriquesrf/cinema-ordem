import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore";
import { app, firebaseConfigurado } from "../config/firebaseConfig.js";
import type { Filme, FilmeDados } from "../types/Filme";

import { obterOrdemFirestore, ordenarFilmes, type OrdenacaoFilmes } from "../utils/ordenacaoFilmes";

let banco: Firestore | null = null;

if (firebaseConfigurado) {
  banco = getFirestore(app);
}

function obterBanco(): Firestore {
  if (!banco) {
    throw new Error("Firebase não configurado. Preencha src/config/firebaseConfig.js.");
  }
  return banco;
}

// onSnapshot mantém a listagem sincronizada com alterações no Firestore.
export function acompanharFilmes(
  atualizar: (filmes: Filme[]) => void,
  falhar: (erro: string) => void,
  ordenacao: OrdenacaoFilmes = "nome-asc"
): Unsubscribe {
  const referencia = collection(obterBanco(), "filmes");
  const { campo, direcao } = obterOrdemFirestore(ordenacao);
  // Um único orderBy usa o índice de campo único padrão do Firestore.
  const consulta = query(referencia, orderBy(campo, direcao));
  return onSnapshot(
    consulta,
    (resultado) => {
      const filmes = resultado.docs.map((registro) => {
        const dados = registro.data() as FilmeDados;
        return {
          id: registro.id,
          nome: dados.nome,
          anoLancamento: dados.anoLancamento,
          classificacaoIndicativa: dados.classificacaoIndicativa,
          genero: dados.genero,
          diretor: dados.diretor,
        };
      });
      atualizar(ordenarFilmes(filmes, ordenacao));
    },
    (erro) => falhar(erro.message)
  );
}

export async function cadastrarFilme(dados: FilmeDados): Promise<void> {
  await addDoc(collection(obterBanco(), "filmes"), {
    ...dados,
    criadoEm: serverTimestamp(),
  });
}

export async function excluirFilme(id: string): Promise<void> {
  await deleteDoc(doc(obterBanco(), "filmes", id));
}
