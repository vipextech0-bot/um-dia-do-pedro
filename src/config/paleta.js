// Paleta quente 16-bits usada no jogo inteiro.
export const PALETA = {
  preto:       0x120a0e,
  escuro:      0x1f1218,
  marromEsc:   0x3a2218,
  marrom:      0x6b3f22,
  marromClaro: 0x8f5a2e,
  laranjaEsc:  0xc8582b,
  laranja:     0xe07a3f,
  laranjaCl:   0xf2a04d,
  amarelo:     0xffd66b,
  creme:       0xffe9c9,
  branco:      0xfff6e6,
  azul:        0x4a7ab5,
  azulEsc:     0x27406b,
  verde:       0x5fbf6a,
  vermelho:    0xd94f45,
  cinza:       0x5a4a4a,
};

// Versoes em string, para uso em objetos de texto do Phaser.
export const COR = Object.fromEntries(
  Object.entries(PALETA).map(([k, v]) => [k, '#' + v.toString(16).padStart(6, '0')])
);

export const FONTE = '"Press Start 2P"';
