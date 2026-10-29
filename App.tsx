import React, { useEffect, useState } from "react";
import { Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { firebaseConfigurado } from "./src/config/firebaseConfig.js";
import Catalogo from "./src/screens/Catalogo";
import Cadastro from "./src/screens/Cadastro";
import { acompanharFilmes } from "./src/services/filmesFirebase";
import { cores } from "./src/theme";
import type { Filme } from "./src/types/Filme";

import type { OrdenacaoFilmes } from "./src/utils/ordenacaoFilmes";

type Tela = "catalogo" | "cadastro";

export default function App() {
  const [tela, setTela] = useState<Tela>("catalogo");
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [carregando, setCarregando] = useState(firebaseConfigurado);
  const [erro, setErro] = useState<string | null>(null);

  const [ordenacao, setOrdenacao] = useState<OrdenacaoFilmes>("nome-asc");

  useEffect(() => {
    if (!firebaseConfigurado) return;
    setCarregando(true);
    setErro(null);
    try {
      return acompanharFilmes(
        (dados) => {
          setFilmes(dados);
          setErro(null);
          setCarregando(false);
        },
        (mensagem) => {
          setErro(mensagem);
          setCarregando(false);
        },
        ordenacao
      );
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não foi possível conectar ao Firebase.");
      setCarregando(false);
    }
  }, [ordenacao]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.app} edges={["top", "left", "right", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={cores.fundo} />
      <View style={styles.topo}>
        <Text style={styles.marca}>Cinema Paradiso</Text>
        <Text style={styles.slogan}>Catálogo de filmes</Text>
        <View style={styles.abas}>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: tela === "catalogo" }}
            onPress={() => setTela("catalogo")}
            style={[styles.aba, tela === "catalogo" && styles.abaAtiva]}
          >
            <Text style={[styles.abaTexto, tela === "catalogo" && styles.abaTextoAtivo]}>Consultar</Text>
          </Pressable>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: tela === "cadastro" }}
            onPress={() => setTela("cadastro")}
            style={[styles.aba, tela === "cadastro" && styles.abaAtiva]}
          >
            <Text style={[styles.abaTexto, tela === "cadastro" && styles.abaTextoAtivo]}>Cadastrar</Text>
          </Pressable>
        </View>
      </View>

      {!firebaseConfigurado && (
        <View style={styles.configuracao}>
          <Text style={styles.configuracaoTitulo}>Conecte seu Firebase</Text>
          <Text style={styles.configuracaoDescricao}>
            Preencha src/config/firebaseConfig.js com as credenciais do seu projeto e crie o Firestore.
          </Text>
        </View>
      )}

      {tela === "catalogo" ? (
        <Catalogo
          ordenacao={ordenacao}
          alterarOrdenacao={setOrdenacao}
          filmes={filmes}
          carregando={carregando}
          erro={erro}
          abrirCadastro={() => setTela("cadastro")}
        />
      ) : (
        <Cadastro cadastrado={() => setTela("catalogo")} firebasePronto={firebaseConfigurado} />
      )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: cores.fundo },
  topo: {
    paddingTop: 19,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomColor: cores.borda,
    borderBottomWidth: 1,
  },
  marca: { fontSize: 29, fontWeight: "700", color: cores.branco },
  slogan: { color: cores.cinza, fontSize: 13, marginTop: 3 },
  abas: { flexDirection: "row", backgroundColor: cores.cartao, borderRadius: 10, padding: 4, marginTop: 18 },
  aba: { flex: 1, borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  abaAtiva: { backgroundColor: cores.cartaoDestaque, borderColor: cores.borda, borderWidth: 1 },
  abaTexto: { color: cores.cinza, fontSize: 14, fontWeight: "600" },
  abaTextoAtivo: { color: cores.branco },
  configuracao: {
    backgroundColor: "#302722",
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 10,
    padding: 13,
    borderWidth: 1,
    borderColor: "#73543B",
  },
  configuracaoTitulo: { color: cores.acento, fontSize: 14, fontWeight: "700" },
  configuracaoDescricao: { color: cores.branco, fontSize: 12, lineHeight: 18, marginTop: 4 },
});
