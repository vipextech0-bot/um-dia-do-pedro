// Progresso do dia, guardado no navegador: em que fase parou, quantas vezes
// recomecou e quantas moedas de pontualidade juntou. Some ao jogar de novo.
const CHAVE = 'pedro.progresso';

function ler() {
  try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch (e) { return {}; }
}
function gravar(d) {
  try { localStorage.setItem(CHAVE, JSON.stringify(d)); } catch (e) { /* sem storage */ }
}

export const progresso = {
  get dados() { return ler(); },
  salvarFase(chave) { const d = ler(); d.fase = chave; gravar(d); },
  registrarRecomeco() { const d = ler(); d.recomecos = (d.recomecos || 0) + 1; gravar(d); },
  somarMoedas(n) { const d = ler(); d.moedas = (d.moedas || 0) + n; gravar(d); },
  zerar() { gravar({}); },
};
