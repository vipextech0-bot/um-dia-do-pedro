import { COR, PALETA, FONTE } from '../config/paleta.js';

// Botao pixelado com moldura dupla. Devolve um Container para facilitar
// posicionamento e tween.
//
// A area clicavel fica no retangulo da borda, e nao no Container: o teste de
// acerto do Phaser em Containers falha quando o container esta escalado, o
// que fazia o botao piscar entre hover/sem hover e engolir o clique.
export function criarBotao(cena, x, y, rotulo, aoClicar, opcoes = {}) {
  const {
    corTexto = COR.creme,
    corFundo = PALETA.marromEsc,
    corBorda = PALETA.laranja,
    corHover = PALETA.marrom,
    tamanho = '8px',
    padX = 10,
    padY = 7,
  } = opcoes;

  const texto = cena.add.text(0, 0, rotulo, {
    fontFamily: FONTE, fontSize: tamanho, color: corTexto,
  }).setOrigin(0.5);

  const l = Math.ceil(texto.width) + padX * 2;
  const a = Math.ceil(texto.height) + padY * 2;

  const borda = cena.add.rectangle(0, 0, l, a, corBorda);
  const fundo = cena.add.rectangle(0, 0, l - 2, a - 2, corFundo);

  const cont = cena.add.container(x, y, [borda, fundo, texto]);
  cont.setSize(l, a);

  borda.setInteractive({ useHandCursor: true });
  borda.on('pointerover', () => { fundo.setFillStyle(corHover); cont.setScale(1.04); });
  borda.on('pointerout',  () => { fundo.setFillStyle(corFundo); cont.setScale(1); });
  // Dispara no pointerdown: no trackpad, um "pointerup" facilmente cai fora
  // do botao e o clique se perdia.
  borda.on('pointerdown', () => {
    cont.setScale(0.96);
    cena.time.delayedCall(70, () => cont.active && cont.setScale(1.04));
    aoClicar && aoClicar();
  });

  cont.aoClicar = aoClicar;
  return cont;
}
