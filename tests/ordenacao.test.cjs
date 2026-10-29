const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Carrega TypeScript com dependências substituídas, sem acessar o banco real.
function carregar(arquivo, dependencias = {}) {
  const fonte = fs.readFileSync(path.join(__dirname, '..', arquivo), 'utf8');
  const codigo = ts.transpileModule(fonte, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
  } }).outputText;
  const modulo = { exports: {} };
  new Function('require', 'module', 'exports', codigo)(nome => {
    if (nome in dependencias) return dependencias[nome];
    throw new Error(`Dependência não simulada: ${nome}`);
  }, modulo, modulo.exports);
  return modulo.exports;
}
const ordenacao = carregar('src/utils/ordenacaoFilmes.ts');
const filme = (id, nome, anoLancamento) => ({ id, nome, anoLancamento, classificacaoIndicativa: 'Livre', genero: 'Drama', diretor: 'Diretor' });
const filmes = [filme('z', 'zebra', 2024), filme('a', 'Árvore', 2000), filme('b', 'banana', 1995), filme('c', 'Casa', 2000)];
const ids = lista => lista.map(f => f.id);

test('nome A–Z considera acentos e maiúsculas em português', () => {
  assert.deepEqual(ids(ordenacao.ordenarFilmes(filmes, 'nome-asc')), ['a', 'b', 'c', 'z']);
});
test('nome Z–A inverte a ordem alfabética', () => {
  assert.deepEqual(ids(ordenacao.ordenarFilmes(filmes, 'nome-desc')), ['z', 'c', 'b', 'a']);
});
test('ano crescente é numérico e desempata por nome', () => {
  assert.deepEqual(ids(ordenacao.ordenarFilmes(filmes, 'ano-asc')), ['b', 'a', 'c', 'z']);
});
test('ano decrescente coloca mais recentes primeiro', () => {
  assert.deepEqual(ids(ordenacao.ordenarFilmes(filmes, 'ano-desc')), ['z', 'a', 'c', 'b']);
});
test('não altera a lista recebida e suporta catálogo vazio', () => {
  const antes = JSON.stringify(filmes);
  ordenacao.ordenarFilmes(filmes, 'nome-asc');
  assert.equal(JSON.stringify(filmes), antes);
  assert.deepEqual(ordenacao.ordenarFilmes([], 'ano-asc'), []);
});
test('nomes equivalentes desempatarão pelo ID', () => {
  assert.deepEqual(ids(ordenacao.ordenarFilmes([filme('2', 'ARVORE', 2000), filme('1', 'árvore', 2000)], 'nome-asc')), ['1', '2']);
});
test('serviço consulta Firestore com campo/direção corretos em todos os modos', () => {
  const esperados = { 'nome-asc': ['nome', 'asc'], 'nome-desc': ['nome', 'desc'], 'ano-asc': ['anoLancamento', 'asc'], 'ano-desc': ['anoLancamento', 'desc'] };
  let chamada;
  let sucesso;
  let falha;
  let cancelado = false;
  const firestore = {
    getFirestore: () => ({}),
    collection: (_, caminho) => ({ caminho }),
    orderBy: (campo, direcao) => ({ campo, direcao }),
    query: (referencia, ordem) => ({ referencia, ordem }),
    onSnapshot: (consulta, receber, erro) => {
      chamada = consulta; sucesso = receber; falha = erro;
      return () => { cancelado = true; };
    },
  };
  const servico = carregar('src/services/filmesFirebase.ts', {
    'firebase/app': { getApps: () => [], initializeApp: () => ({}) },
    'firebase/firestore': firestore,
    '../config/firebaseConfig.js': { firebaseConfigurado: true, app: {} },
    '../utils/ordenacaoFilmes': ordenacao,
  });
  for (const [modo, [campo, direcao]] of Object.entries(esperados)) {
    let recebidos; let erro;
    const cancelar = servico.acompanharFilmes(dados => { recebidos = dados; }, e => { erro = e; }, modo);
    assert.equal(chamada.referencia.caminho, 'filmes');
    assert.deepEqual(chamada.ordem, { campo, direcao });
    sucesso({ docs: filmes.map(f => ({ id: f.id, data: () => f })) });
    assert.deepEqual(recebidos, ordenacao.ordenarFilmes(filmes, modo));
    // Simula um cadastro novo recebido em tempo real.
    const novos = [...filmes, filme('novo', 'Abelha', 2026)];
    sucesso({ docs: novos.map(f => ({ id: f.id, data: () => f })) });
    assert.deepEqual(recebidos, ordenacao.ordenarFilmes(novos, modo));
    falha(new Error('permission-denied'));
    assert.equal(erro, 'permission-denied');
    cancelar(); assert.equal(cancelado, true); cancelado = false;
  }
});
