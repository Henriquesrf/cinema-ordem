import React, { useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { cartazDoFilme } from "../data_cartazes";
import { cores } from "../theme";
import type { Filme } from "../types/Filme";

type Props = {
  filme: Filme;
  aoExcluir: (filme: Filme) => void;
  excluindo: boolean;
};

export default function FilmeCard({ filme, aoExcluir, excluindo }: Props) {
  const [imagemFalhou, setImagemFalhou] = useState(false);
  const cartaz = cartazDoFilme(filme.nome);
  const foto = cartaz && !imagemFalhou;

  return (
    <View style={styles.cartao}>
      <View style={styles.linha}>
        <View style={styles.cartaz}>
          {foto ? (
            <Image source={{ uri: cartaz }} style={styles.imagem} resizeMode="cover" onError={() => setImagemFalhou(true)} />
          ) : (
            <Text style={styles.inicial}>{filme.nome.slice(0, 1).toUpperCase()}</Text>
          )}
        </View>
        <View style={styles.conteudo}>
          <Text style={styles.titulo}>{filme.nome}</Text>
          <Text style={styles.detalhe}>Ano: {filme.anoLancamento}</Text>
          <Text style={styles.detalhe}>Gênero: {filme.genero}</Text>
          <Text style={styles.detalhe}>Diretor: {filme.diretor}</Text>
          <Text style={styles.detalhe}>
            Classificação: {filme.classificacaoIndicativa === "Livre" ? "Livre" : `${filme.classificacaoIndicativa} anos`}
          </Text>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Excluir filme ${filme.nome}`}
        disabled={excluindo}
        onPress={() => aoExcluir(filme)}
        style={({ pressed }) => [styles.excluir, (pressed || excluindo) && styles.pressionado]}
      >
        {excluindo ? (
          <ActivityIndicator size="small" color={cores.perigo} />
        ) : (
          <Text style={styles.excluirTexto}>Excluir filme</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    backgroundColor: cores.cartao,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 14,
  },
  linha: { flexDirection: "row", gap: 14 },
  cartaz: {
    width: 88,
    height: 128,
    flexShrink: 0,
    backgroundColor: cores.cartaoDestaque,
    borderRadius: 9,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  imagem: { width: "100%", height: "100%" },
  inicial: { color: cores.cinza, fontSize: 40, fontWeight: "700" },
  conteudo: { flex: 1, justifyContent: "center" },
  titulo: { color: cores.branco, fontSize: 17, fontWeight: "700", marginBottom: 8 },
  detalhe: { color: cores.cinza, fontSize: 13, lineHeight: 20 },
  excluir: {
    alignSelf: "flex-end",
    borderWidth: 1,
    borderColor: cores.perigo,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    minWidth: 108,
    alignItems: "center",
    marginTop: 14,
  },
  excluirTexto: { color: cores.perigo, fontSize: 13, fontWeight: "600" },
  pressionado: { opacity: 0.65 },
});
