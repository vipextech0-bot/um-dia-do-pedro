// Molduras estilo Stardew: caixa de pergaminho com borda laranja em camadas,
// cantos arredondados no pixel e ornamentos nos quatro vertices.

// Retangulo com canto "escadinha" — e assim que se arredonda um canto em
// pixel art: tirando 3, 2 e 1 pixel nas tres primeiras linhas.
export function retRedondo(g, x, y, largura, altura, raio, cor, alpha = 1) {
  g.fillStyle(cor, alpha);
  for (let dy = 0; dy < altura; dy++) {
    const daBorda = Math.min(dy, altura - 1 - dy);
    const recuo = daBorda < raio ? raio - daBorda : 0;
    g.fillRect(x + recuo, y + dy, largura - recuo * 2, 1);
  }
}

export const TEMA_PERGAMINHO = {
  sombra:   0x000000,
  externa:  0x2e1710,
  borda:    0xa8552a,
  brilho:   0xe6a862,
  interna:  0x7a3c1c,
  fundo:    0xf6e0b4,
  fundoBaixo: 0xe8cb9a,
  ornamento: 0x8a4a24,
  texto:    '#3a2418',
  nome:     '#7a2f14',
};

// Caixa de dialogo completa, em cinco camadas concentricas.
export function caixaPergaminho(g, x, y, largura, altura, tema = TEMA_PERGAMINHO) {
  retRedondo(g, x + 2, y + 3, largura, altura, 4, tema.sombra, 0.35);
  retRedondo(g, x, y, largura, altura, 4, tema.externa);
  retRedondo(g, x + 1, y + 1, largura - 2, altura - 2, 4, tema.borda);
  retRedondo(g, x + 2, y + 2, largura - 4, altura - 4, 3, tema.brilho);
  retRedondo(g, x + 4, y + 4, largura - 8, altura - 8, 3, tema.interna);
  retRedondo(g, x + 5, y + 5, largura - 10, altura - 10, 2, tema.fundo);

  // leve sombra no pe do pergaminho, para o fundo nao ficar chapado
  retRedondo(g, x + 5, y + altura - 12, largura - 10, 7, 2, tema.fundoBaixo);

  ornamentos(g, x, y, largura, altura, tema);
}

// Quadradinhos nos quatro cantos: o detalhe que faz a caixa parecer
// entalhada em vez de so um retangulo com borda.
function ornamentos(g, x, y, largura, altura, tema) {
  const pontas = [
    [x + 4, y + 4], [x + largura - 8, y + 4],
    [x + 4, y + altura - 8], [x + largura - 8, y + altura - 8],
  ];
  pontas.forEach(([px, py]) => {
    g.fillStyle(tema.ornamento, 1).fillRect(px, py, 4, 4);
    g.fillStyle(tema.brilho, 1).fillRect(px + 1, py + 1, 2, 2);
  });
}

// Moldura pequena para o retrato do personagem, encaixada dentro da caixa.
export function molduraRetrato(g, x, y, lado, tema = TEMA_PERGAMINHO) {
  retRedondo(g, x, y, lado, lado, 3, tema.externa);
  retRedondo(g, x + 1, y + 1, lado - 2, lado - 2, 3, tema.borda);
  retRedondo(g, x + 2, y + 2, lado - 4, lado - 4, 2, tema.interna);
  retRedondo(g, x + 3, y + 3, lado - 6, lado - 6, 2, 0x4a2a3c);
  // fundo em degrade, para o retrato nao flutuar no vazio
  for (let i = 0; i < 8; i++) {
    g.fillStyle(0x5c3550, 1).fillRect(x + 3, y + lado - 5 - i, lado - 6, 1);
  }
}

// Aba com o nome de quem fala, encaixada em cima da caixa.
export function abaNome(g, x, y, largura, altura, tema = TEMA_PERGAMINHO) {
  retRedondo(g, x, y, largura, altura, 3, tema.externa);
  retRedondo(g, x + 1, y + 1, largura - 2, altura - 2, 3, tema.borda);
  retRedondo(g, x + 2, y + 2, largura - 4, altura - 4, 2, tema.fundo);
}
