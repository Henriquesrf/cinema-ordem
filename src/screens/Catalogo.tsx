import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import FilmeCard from "../components/FilmeCard";
import { excluirFilme } from "../services/filmesFirebase";
import { cores } from "../theme";
import type { Filme } from "../types/Filme";

import { opcoesOrdenacao, type OrdenacaoFilmes } from "../utils/ordenacaoFilmes";

type Props = {
  ordenacao: OrdenacaoFilmes;
  alterarOrdenacao: (valor: OrdenacaoFilmes) => void;
  filmes: Filme[];
  carregando: boolean;
  erro: string | null;
  abrirCadastro: () => void;
};

export default function Catalogo({ filmes, carregando, erro, abrirCadastro, ordenacao, alterarOrdenacao }: Props) {
  const [busca, setBusca] = useState("");
  const [excluindoId, setExcluindoId] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    if (!termo) return filmes;
    return filmes.filter((filme) =>
      `${filme.nome} ${filme.genero} ${filme.diretor} ${filme.anoLancamento}`
        .toLocaleLowerCase("pt-BR")
        .includes(termo)
    );
  }, [busca, filmes]);

  function confirmarExclusao(filme: Filme) {
    Alert.alert("Excluir filme", `Deseja excluir “${filme.nome}” do Firebase?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            setExcluindoId(filme.id);
            await excluirFilme(filme.id);
          } catch (erro) {
            const mensagem = erro instanceof Error ? erro.message : "Falha ao excluir.";
            Alert.alert("Não foi possível excluir", mensagem);
          } finally {
            setExcluindoId(null);
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.area}>
      <Text style={styles.titulo}>Filmes cadastrados</Text>
      <Text style={styles.subtitulo}>Dados sincronizados com o Firebase Firestore</Text>
      <TextInput
        accessibilityLabel="Pesquisar filmes"
        placeholder="Pesquisar nome, gênero ou diretor"
        placeholderTextColor={cores.cinza}
        value={busca}
        onChangeText={setBusca}
        style={styles.pesquisa}
        returnKeyType="search"
      />
      <Text style={styles.ordenarRotulo}>Ordenar por</Text>
      <View style={styles.ordenacao}>
        {opcoesOrdenacao.map((opcao) => (
          <Pressable
            key={opcao.valor}
            accessibilityRole="button"
            accessibilityLabel={opcao.descricao}
            accessibilityState={{ selected: ordenacao === opcao.valor }}
            onPress={() => alterarOrdenacao(opcao.valor)}
            style={[styles.opcaoOrdem, ordenacao === opcao.valor && styles.opcaoOrdemAtiva]}
          >
            <Text style={[styles.textoOrdem, ordenacao === opcao.valor && styles.textoOrdemAtivo]}>
              {opcao.rotulo}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.resumo}>
        <Text style={styles.contagem}>
          {filtrados.length} {filtrados.length === 1 ? "filme" : "filmes"}
        </Text>
        <Pressable onPress={abrirCadastro} accessibilityRole="button">
          <Text style={styles.novo}>+ Novo filme</Text>
        </Pressable>
      </View>
      {carregando ? (
        <View style={styles.centralizado}>
          <ActivityIndicator color={cores.acento} />
          <Text style={styles.mensagem}>Carregando filmes...</Text>
        </View>
      ) : erro ? (
        <View style={styles.centralizado}>
          <Text style={styles.erroTitulo}>Não foi possível consultar o Firebase.</Text>
          <Text style={styles.mensagem}>{erro}</Text>
        </View>
      ) : (
        <FlatList
          keyboardShouldPersistTaps="handled"
          data={filtrados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={filtrados.length ? styles.lista : styles.listaVazia}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <FilmeCard filme={item} aoExcluir={confirmarExclusao} excluindo={excluindoId === item.id} />
          )}
          ListEmptyComponent={
            <View style={styles.centralizado}>
              <Text style={styles.vazioTitulo}>{busca ? "Nenhum resultado" : "Catálogo vazio"}</Text>
              <Text style={styles.mensagem}>
                {busca ? "Tente pesquisar com outro termo." : "Cadastre o primeiro filme para começar."}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  titulo: { fontSize: 24, color: cores.branco, fontWeight: "700" },
  subtitulo: { fontSize: 13, color: cores.cinza, marginTop: 5 },
  pesquisa: {
    marginTop: 18,
    borderColor: cores.borda,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: cores.cartao,
    color: cores.branco,
    fontSize: 15,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  ordenarRotulo: { color: cores.branco, fontSize: 13, fontWeight: "600", marginTop: 16, marginBottom: 8 },
  ordenacao: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  opcaoOrdem: { minHeight: 44, paddingVertical: 11, paddingHorizontal: 12, borderRadius: 9, borderWidth: 1, borderColor: cores.borda, backgroundColor: cores.cartao, justifyContent: "center" },
  opcaoOrdemAtiva: { borderColor: cores.acento, backgroundColor: "#342E24" },
  textoOrdem: { color: cores.cinza, fontSize: 13, fontWeight: "600" },
  textoOrdemAtivo: { color: cores.acento },
  resumo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16 },
  contagem: { color: cores.cinza, fontSize: 13 },
  novo: { color: cores.acento, fontSize: 14, fontWeight: "700" },
  lista: { paddingBottom: 40 },
  listaVazia: { flexGrow: 1, justifyContent: "center", paddingBottom: 80 },
  centralizado: { alignItems: "center", justifyContent: "center", paddingVertical: 26, paddingHorizontal: 16 },
  mensagem: { marginTop: 10, textAlign: "center", color: cores.cinza, lineHeight: 20 },
  vazioTitulo: { fontSize: 18, fontWeight: "700", color: cores.branco },
  erroTitulo: { color: cores.perigo, fontWeight: "700", fontSize: 16, textAlign: "center" },
});
