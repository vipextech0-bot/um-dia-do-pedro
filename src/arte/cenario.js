import { retanguloDither, faixaDither, circuloPixel, haloDither } from './pixel.js';

// ---- Ceu ---------------------------------------------------------------

// Amanhecer: faixas de cor com dithering entre elas, do roxo da noite
// ate o laranja do sol. Sem gradiente suave — a transicao e xadrez.
export function ceuAmanhecer(cena, largura, altura, horizonte) {
  const g = cena.add.graphics().setDepth(-100);
  const paradas = [
    0x1b1230, 0x2e1838, 0x4a1f3c, 0x6e2a3c, 0x94382f, 0xbc4f2a,
    0xdc7130, 0xf09a3f, 0xf7bc57,
  ];
  const alturaFaixa = horizonte / (paradas.length - 1);
  for (let i = 0; i < paradas.length - 1; i++) {
    faixaDither(
      g, 0, Math.round(i * alturaFaixa), largura, Math.ceil(alturaFaixa) + 1,
      paradas[i], paradas[i + 1], 4
    );
  }
  g.fillStyle(paradas[paradas.length - 1], 1).fillRect(0, horizonte - 1, largura, 4);
  return g;
}

// Estrelas que ainda resistem na parte alta do ceu.
export function estrelas(cena, largura, alturaMax, quantidade = 40) {
  const g = cena.add.graphics().setDepth(-99);
  const lista = [];
  for (let i = 0; i < quantidade; i++) {
    const x = Phaser.Math.Between(0, largura);
    const y = Phaser.Math.Between(2, alturaMax);
    // quanto mais baixa a estrela, mais o amanhecer ja a apagou
    const forca = 1 - y / alturaMax;
    lista.push({ x, y, forca });
    g.fillStyle(0xffe9c9, 0.25 + 0.65 * forca).fillRect(x, y, 1, 1);
  }
  cena.tweens.add({ targets: g, alpha: 0.45, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  return g;
}

// Sol nascendo: nucleo solido, dois aneis de dither e um halo largo.
export function sol(cena, x, y, raio) {
  // O halo vai numa camada aditiva: assim ele so clareia o que esta atras,
  // em vez de desenhar um disco cinza por cima do ceu.
  const halo = cena.add.graphics().setDepth(-99).setBlendMode(Phaser.BlendModes.ADD);
  haloDither(halo, 0, 0, raio, raio + 30, 0xffcf6b, 6);
  halo.setPosition(x, y);

  const g = cena.add.graphics().setDepth(-98);
  g.halo = halo;
  circuloPixel(g, 0, 0, raio + 3, 0xf7a94a, 0.85);
  circuloPixel(g, 0, 0, raio, 0xffd97a, 1);
  circuloPixel(g, 0, -2, raio - 4, 0xfff0b8, 1);
  g.setPosition(x, y);
  return g;
}

// ---- Nuvens ------------------------------------------------------------

// Nuvem em blocos, com topo iluminado pelo sol e base em sombra.
export function nuvem(cena, x, y, escala = 1) {
  const g = cena.add.graphics();
  const blocos = [
    [-22, 0, 44, 5], [-16, -4, 32, 5], [-8, -8, 20, 5], [4, -6, 12, 4],
  ];
  // sombra por baixo
  g.fillStyle(0xb0553f, 1);
  blocos.forEach(([bx, by, bw, bh]) => g.fillRect(bx, by + 2, bw, bh));
  // corpo
  g.fillStyle(0xe6885a, 1);
  blocos.forEach(([bx, by, bw, bh]) => g.fillRect(bx, by, bw, bh));
  // luz no topo
  g.fillStyle(0xffc796, 1);
  blocos.forEach(([bx, by, bw]) => g.fillRect(bx + 1, by, bw - 2, 2));
  g.setPosition(x, y).setScale(escala);
  return g;
}

// ---- Cidade ------------------------------------------------------------

// Um predio com contorno, luz de borda do lado do sol, cornija e janelas.
function predio(g, x, base, largura, altura, tema) {
  const topo = base - altura;

  g.fillStyle(tema.contorno, 1).fillRect(x - 1, topo - 1, largura + 2, altura + 2);
  g.fillStyle(tema.corpo, 1).fillRect(x, topo, largura, altura);

  // luz rasante do amanhecer bate na face direita
  g.fillStyle(tema.luz, 1).fillRect(x + largura - 2, topo, 2, altura);
  g.fillStyle(tema.sombra, 1).fillRect(x, topo, 2, altura);

  // cornija: sobra 1px de cada lado, como um chapeuzinho
  g.fillStyle(tema.contorno, 1).fillRect(x - 2, topo - 3, largura + 4, 3);
  g.fillStyle(tema.luz, 1).fillRect(x - 1, topo - 2, largura + 2, 1);

  if (!tema.janelas) return;

  // janelas 2x3 com moldura, algumas acesas
  const passoX = 6, passoY = 8;
  for (let jy = topo + 6; jy < base - 4; jy += passoY) {
    for (let jx = x + 3; jx < x + largura - 4; jx += passoX) {
      const acesa = Math.random() < tema.chanceAcesa;
      g.fillStyle(tema.moldura, 1).fillRect(jx - 1, jy - 1, 4, 5);
      g.fillStyle(acesa ? 0xffd66b : tema.vidro, 1).fillRect(jx, jy, 2, 3);
      if (acesa) g.fillStyle(0xfff3c4, 1).fillRect(jx, jy, 2, 1);
    }
  }
}

// Detalhes de telhado que quebram a silhueta reta.
function telhado(g, x, topo, largura, tema) {
  const tipo = Phaser.Math.Between(0, 3);
  if (tipo === 0) {
    // caixa d'agua
    const w = 8, bx = x + Math.floor(largura / 2) - 4;
    g.fillStyle(tema.contorno, 1).fillRect(bx - 1, topo - 12, w + 2, 12);
    g.fillStyle(tema.corpo, 1).fillRect(bx, topo - 11, w, 10);
    g.fillStyle(tema.luz, 1).fillRect(bx + w - 2, topo - 11, 2, 10);
  } else if (tipo === 1) {
    // antena com luz vermelha piscando fica a cargo da cena; aqui so o mastro
    const bx = x + Math.floor(largura / 2);
    g.fillStyle(tema.contorno, 1).fillRect(bx, topo - 16, 2, 16);
    g.fillStyle(0xd94f45, 1).fillRect(bx, topo - 18, 2, 2);
  } else if (tipo === 2) {
    // condensadores de ar condicionado
    for (let i = 0; i < 2; i++) {
      const bx = x + 4 + i * 10;
      if (bx + 7 > x + largura) break;
      g.fillStyle(tema.contorno, 1).fillRect(bx - 1, topo - 6, 8, 6);
      g.fillStyle(tema.luz, 1).fillRect(bx, topo - 5, 6, 4);
    }
  }
}

// Skyline completo em tres camadas de profundidade.
export function cidade(cena, largura, base) {
  const camadas = [
    { corpo: 0x4a2440, sombra: 0x3a1b34, luz: 0x6b3550, contorno: 0x3a1b34,
      janelas: false, alturaMin: 20, alturaMax: 44, larguraMin: 16, larguraMax: 28,
      deslocamento: -12, depth: -60 },
    { corpo: 0x35192a, sombra: 0x2a1222, luz: 0x8a4030, contorno: 0x1f0e1a,
      janelas: true, chanceAcesa: 0.30, vidro: 0x24101f, moldura: 0x1a0a14,
      alturaMin: 26, alturaMax: 62, larguraMin: 20, larguraMax: 34,
      deslocamento: -2, depth: -50 },
    { corpo: 0x20101a, sombra: 0x160a12, luz: 0x6b2f2c, contorno: 0x0f070c,
      janelas: true, chanceAcesa: 0.45, vidro: 0x180a14, moldura: 0x0f060b,
      alturaMin: 18, alturaMax: 48, larguraMin: 24, larguraMax: 40,
      deslocamento: 10, depth: -40 },
  ];

  camadas.forEach((tema) => {
    const g = cena.add.graphics().setDepth(tema.depth);
    const linhaBase = base + tema.deslocamento;
    let x = -10;
    while (x < largura + 10) {
      const w = Phaser.Math.Between(tema.larguraMin, tema.larguraMax);
      const h = Phaser.Math.Between(tema.alturaMin, tema.alturaMax);
      predio(g, x, linhaBase, w, h, tema);
      if (tema.janelas && Math.random() < 0.5) telhado(g, x, linhaBase - h - 3, w, tema);
      x += w + Phaser.Math.Between(1, 5);
    }
    // preenche o pe da camada
    g.fillStyle(tema.corpo, 1).fillRect(0, linhaBase, largura, 60);
  });
}

// Rua com asfalto, meio-fio e calcada texturizada.
export function rua(cena, largura, y, altura) {
  const g = cena.add.graphics().setDepth(-30);
  g.fillStyle(0x1a1018, 1).fillRect(0, y, largura, altura);
  retanguloDither(g, 0, y, largura, 6, 0x241620, 0x1a1018, 0.5);
  // meio-fio
  g.fillStyle(0x3a2a30, 1).fillRect(0, y, largura, 2);
  g.fillStyle(0x55404a, 1).fillRect(0, y, largura, 1);
  // juntas da calcada
  g.fillStyle(0x241620, 1);
  for (let x = 0; x < largura; x += 10) g.fillRect(x, y + 4, 1, altura - 4);

  // sujeira do asfalto: pontinhos mais claros espalhados
  for (let i = 0; i < 60; i++) {
    g.fillStyle(0x2e1d28, 1).fillRect(
      Phaser.Math.Between(0, largura), Phaser.Math.Between(y + 5, y + altura - 2), 1, 1
    );
  }

  // bueiro
  const bx = Math.round(largura * 0.33);
  g.fillStyle(0x0f0810, 1).fillRect(bx, y + 12, 14, 8);
  g.fillStyle(0x33232c, 1).fillRect(bx + 1, y + 13, 12, 6);
  g.fillStyle(0x0f0810, 1);
  for (let i = 0; i < 3; i++) g.fillRect(bx + 2, y + 14 + i * 2, 10, 1);
  return g;
}

// Poste de luz da calcada, com lampada acesa e poca de luz no chao.
export function poste(cena, x, base, altura = 40) {
  const g = cena.add.graphics().setDepth(-25);

  g.fillStyle(0x0f070c, 1).fillRect(x - 3, base - 2, 7, 3);   // sapata
  g.fillStyle(0x3a2a30, 1).fillRect(x - 1, base - altura, 3, altura);
  g.fillStyle(0x55404a, 1).fillRect(x - 1, base - altura, 1, altura);
  g.fillStyle(0x3a2a30, 1).fillRect(x, base - altura - 1, 8, 2); // braco
  g.fillStyle(0x0f070c, 1).fillRect(x + 6, base - altura + 1, 6, 4);
  g.fillStyle(0xffd66b, 1).fillRect(x + 7, base - altura + 2, 4, 2); // lampada

  const brilho = cena.add.graphics().setDepth(-26).setBlendMode(Phaser.BlendModes.ADD);
  // queda de luz em dither, para o brilho nao virar um disco chapado
  haloDither(brilho, x + 9, base - altura + 3, 3, 14, 0xffd66b, 5);
  // poca de luz no asfalto
  for (let i = 0; i < 5; i++) {
    brilho.fillStyle(0xffd66b, 0.05 + i * 0.012)
      .fillRect(x + 9 - (22 - i * 4), base - 1 - i, (22 - i * 4) * 2, 1);
  }
  cena.tweens.add({
    targets: brilho, alpha: 0.72, duration: 3200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
  });
  return g;
}
