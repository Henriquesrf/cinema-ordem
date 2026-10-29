import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { cadastrarFilme } from "../services/filmesFirebase";
import { cores } from "../theme";
import type { Classificacao, FilmeDados } from "../types/Filme";

const classificacoes: Classificacao[] = ["Livre", "10", "12", "14", "16", "18"];

type Props = {
  cadastrado: () => void;
  firebasePronto: boolean;
};

export default function Cadastro({ cadastrado, firebasePronto }: Props) {
  const [nome, setNome] = useState("");
  const [ano, setAno] = useState("");
  const [classificacao, setClassificacao] = useState<Classificacao>("Livre");
  const [genero, setGenero] = useState("");
  const [diretor, setDiretor] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (salvando) return;
    const anoNumero = Number(ano);
    const maximo = new Date().getFullYear() + 10;
    if (!nome.trim() || !genero.trim() || !diretor.trim() || !ano.trim()) {
      Alert.alert("Campos obrigatórios", "Preencha nome, ano, classificação, gênero e diretor.");
      return;
    }
    if (!/^\d{4}$/.test(ano) || !Number.isInteger(anoNumero) || anoNumero < 1888 || anoNumero > maximo) {
      Alert.alert("Ano inválido", `Informe um ano entre 1888 e ${maximo}.`);
      return;
    }
    if (!firebasePronto) {
      Alert.alert("Firebase não configurado", "Preencha src/config/firebaseConfig.js com os dados do Firebase.");
      return;
    }

    const dados: FilmeDados = {
      nome: nome.trim(),
      anoLancamento: anoNumero,
      classificacaoIndicativa: classificacao,
      genero: genero.trim(),
      diretor: diretor.trim(),
    };

    try {
      setSalvando(true);
      await cadastrarFilme(dados);
      setNome("");
      setAno("");
      setClassificacao("Livre");
      setGenero("");
      setDiretor("");
      Alert.alert("Filme cadastrado", `“${dados.nome}” foi salvo no Firebase.`, [
        { text: "Ver catálogo", onPress: cadastrado },
      ]);
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : "Erro desconhecido.";
      Alert.alert("Erro ao cadastrar", mensagem);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.raiz}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.conteudo}>
        <Text style={styles.titulo}>Cadastrar filme</Text>
        <Text style={styles.subtitulo}>Preencha os dados para adicionar ao Firestore.</Text>

        <Text style={styles.rotulo}>Nome do filme</Text>
        <TextInput
          accessibilityLabel="Nome do filme"
          placeholder="Ex.: Jogos Vorazes"
          placeholderTextColor={cores.cinza}
          value={nome}
          maxLength={120}
          onChangeText={setNome}
          style={styles.campo}
        />

        <Text style={styles.rotulo}>Ano de lançamento</Text>
        <TextInput
          accessibilityLabel="Ano de lançamento"
          placeholder="Ex.: 2012"
          placeholderTextColor={cores.cinza}
          value={ano}
          maxLength={4}
          onChangeText={(valor) => setAno(valor.replace(/\D/g, ""))}
          keyboardType="number-pad"
          style={styles.campo}
        />

        <Text style={styles.rotulo}>Classificação indicativa</Text>
        <View style={styles.opcoes}>
          {classificacoes.map((valor) => (
            <Pressable
              key={valor}
              accessibilityRole="button"
              accessibilityLabel={`Classificação ${valor}`}
              accessibilityState={{ selected: classificacao === valor }}
              onPress={() => setClassificacao(valor)}
              style={[styles.opcao, classificacao === valor && styles.opcaoSelecionada]}
            >
              <Text style={[styles.textoOpcao, classificacao === valor && styles.textoSelecionado]}>
                {valor === "Livre" ? "Livre" : `${valor}+`}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.rotulo}>Gênero</Text>
        <TextInput
          accessibilityLabel="Gênero"
          placeholder="Ex.: Aventura"
          placeholderTextColor={cores.cinza}
          value={genero}
          maxLength={60}
          onChangeText={setGenero}
          style={styles.campo}
        />

        <Text style={styles.rotulo}>Diretor</Text>
        <TextInput
          accessibilityLabel="Diretor"
          placeholder="Ex.: Gary Ross"
          placeholderTextColor={cores.cinza}
          value={diretor}
          maxLength={100}
          onChangeText={setDiretor}
          style={styles.campo}
        />

        <Pressable
          accessibilityRole="button"
          disabled={salvando || !firebasePronto}
          onPress={salvar}
          style={({ pressed }) => [styles.salvar, (pressed || salvando || !firebasePronto) && styles.opaco]}
        >
          {salvando ? <ActivityIndicator color={cores.fundo} /> : <Text style={styles.salvarTexto}>Salvar no Firebase</Text>}
        </Pressable>
        {!firebasePronto && (
          <Text style={styles.aviso}>Configure o Firebase para liberar o cadastro.</Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1 },
  conteudo: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 48 },
  titulo: { fontSize: 24, color: cores.branco, fontWeight: "700" },
  subtitulo: { fontSize: 13, color: cores.cinza, marginTop: 5, marginBottom: 15 },
  rotulo: { marginTop: 16, color: cores.branco, fontSize: 14, fontWeight: "600", marginBottom: 8 },
  campo: {
    color: cores.branco,
    backgroundColor: cores.cartao,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderColor: cores.borda,
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 15,
  },
  opcoes: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  opcao: {
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 9,
    paddingVertical: 11,
    paddingHorizontal: 13,
    minWidth: 48,
    alignItems: "center",
    backgroundColor: cores.cartao,
  },
  opcaoSelecionada: { borderColor: cores.acento, backgroundColor: "#342E24" },
  textoOpcao: { color: cores.cinza, fontSize: 13, fontWeight: "600" },
  textoSelecionado: { color: cores.acento },
  salvar: {
    backgroundColor: cores.acento,
    paddingVertical: 16,
    borderRadius: 11,
    marginTop: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  salvarTexto: { color: cores.fundo, fontWeight: "700", fontSize: 16 },
  opaco: { opacity: 0.5 },
  aviso: { color: cores.perigo, marginTop: 12, textAlign: "center" },
});
