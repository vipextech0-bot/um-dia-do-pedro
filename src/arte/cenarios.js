import { retanguloDither, faixaDither, circuloPixel, haloDither } from './pixel.js';

// Cenarios completos das fases. Tudo desenhado em pixel, com a mesma regra:
// contorno escuro, uma face iluminada, uma face em sombra e dither nas
// transicoes. Cada funcao devolve os dados que a fase precisa (linha do
// chao, posicao de objetos) para posicionar os sprites por cima.

// ---- Peliculas reutilizaveis -------------------------------------------

function tabuas(g, x, y, largura, altura, corA, corB, corJunta, passo = 10) {
  g.fillStyle(corA, 1).fillRect(x, y, largura, altura);
  let i = 0;
  for (let ly = y; ly < y + altura; ly += passo) {
    g.fillStyle(corJunta, 1).fillRect(x, ly, largura, 1);
    g.fillStyle(corB, 1).fillRect(x, ly + 1, largura, 1);
    g.fillStyle(corJunta, 1).fillRect(x + (i % 2 ? 84 : 196), ly, 1, passo);
    i++;
  }
}

function azulejos(g, x, y, largura, altura, corA, corB, corJunta, lado = 12) {
  for (let ty = 0; ty * lado < altura; ty++) {
    for (let tx = 0; tx * lado < largura; tx++) {
      const cor = (tx + ty) % 2 === 0 ? corA : corB;
      g.fillStyle(cor, 1).fillRect(x + tx * lado, y + ty * lado, lado, lado);
      g.fillStyle(corJunta, 1);
      g.fillRect(x + tx * lado, y + ty * lado, lado, 1);
      g.fillRect(x + tx * lado, y + ty * lado, 1, lado);
    }
  }
}

// Quadro/porta-retrato generico, com moldura de tres camadas.
function quadro(g, x, y, largura, altura, corMoldura, corFundo, desenhar) {
  g.fillStyle(0x14090e, 1).fillRect(x - 2, y - 2, largura + 4, altura + 4);
  g.fillStyle(corMoldura, 1).fillRect(x - 1, y - 1, largura + 2, altura + 2);
  g.fillStyle(corFundo, 1).fillRect(x, y, largura, altura);
  if (desenhar) desenhar(g, x, y, largura, altura);
  // sombra projetada do lado direito
  g.fillStyle(0x000000, 0.25).fillRect(x + largura + 2, y, 2, altura + 3);
}

function planta(g, x, base) {
  g.fillStyle(0x3a2418, 1).fillRect(x - 7, base - 11, 14, 11);
  g.fillStyle(0x6b3f22, 1).fillRect(x - 6, base - 10, 12, 9);
  g.fillStyle(0x8f5a2e, 1).fillRect(x - 6, base - 10, 12, 2);
  const folhas = [[-8, -26, 4, 16], [-3, -32, 4, 22], [2, -28, 4, 18], [6, -22, 4, 12], [-11, -20, 4, 10]];
  folhas.forEach(([fx, fy, fw, fh], i) => {
    g.fillStyle(i % 2 ? 0x2f6b3a : 0x3f8a4a, 1).fillRect(x + fx, base + fy, fw, fh);
    g.fillStyle(0x5fbf6a, 1).fillRect(x + fx, base + fy, 1, fh);
  });
}

// ---- FASE 1: quarto do Pedro, 07:00 ------------------------------------

export function quarto(cena) {
  const { width: l, height: a } = cena.scale;
  const g = cena.add.graphics().setDepth(-100);
  const chao = a - 70;

  // parede com papel listrado, mais escura perto do chao
  g.fillStyle(0x3a2a3f, 1).fillRect(0, 0, l, chao);
  for (let x = 0; x < l; x += 12) g.fillStyle(0x453350, 1).fillRect(x, 0, 5, chao);
  retanguloDither(g, 0, chao - 60, l, 60, 0x3a2a3f, 0x2c1f33, 0.5);
  retanguloDither(g, 0, 0, l, 22, 0x2c1f33, 0x3a2a3f, 0.5);

  // janela grande com o amanhecer batendo
  const jx = 300, jy = 34, jl = 112, ja = 84;
  g.fillStyle(0x2a1a16, 1).fillRect(jx - 5, jy - 5, jl + 10, ja + 12);
  const terco = Math.round(ja / 3);
  faixaDither(g, jx, jy, jl, terco + 1, 0x4a1f3c, 0x94382f, 4);
  faixaDither(g, jx, jy + terco, jl, terco + 1, 0x94382f, 0xdc7130, 4);
  faixaDither(g, jx, jy + terco * 2, jl, ja - terco * 2, 0xdc7130, 0xf7bc57, 4);
  // sol nascendo la fora
  circuloPixel(g, jx + 40, jy + ja - 16, 12, 0xffd97a);
  circuloPixel(g, jx + 40, jy + ja - 18, 7, 0xfff0b8);
  // predinhos vistos pela janela
  let bx = jx;
  while (bx < jx + jl) {
    const bw = Phaser.Math.Between(10, 20), bh = Phaser.Math.Between(12, 34);
    g.fillStyle(0x3a1b34, 1).fillRect(bx, jy + ja - bh, Math.min(bw, jx + jl - bx), bh);
    g.fillStyle(0xffd66b, 1);
    for (let wy = jy + ja - bh + 3; wy < jy + ja - 3; wy += 6) {
      for (let wx = bx + 2; wx < Math.min(bx + bw, jx + jl) - 2; wx += 5) {
        if (Math.random() < 0.35) g.fillRect(wx, wy, 2, 2);
      }
    }
    bx += bw + 2;
  }
  // caixilho, moldura e peitoril
  g.fillStyle(0x5c412f, 1);
  g.fillRect(jx + jl / 2 - 1, jy, 3, ja);
  g.fillRect(jx, jy + ja / 2 - 1, jl, 3);
  g.lineStyle(2, 0x6b4a34, 1).strokeRect(jx, jy, jl, ja);
  g.fillStyle(0x8f5a2e, 1).fillRect(jx - 8, jy + ja, jl + 16, 5);
  g.fillStyle(0xb5763c, 1).fillRect(jx - 8, jy + ja, jl + 16, 1);
  // cortinas nas laterais
  [[jx - 22, 0], [jx + jl + 2, 1]].forEach(([cx, lado]) => {
    g.fillStyle(0x6b2f4a, 1).fillRect(cx, jy - 8, 20, ja + 14);
    g.fillStyle(0x8a3f5c, 1);
    for (let i = 0; i < 4; i++) g.fillRect(cx + 2 + i * 5, jy - 8, 2, ja + 14);
    g.fillStyle(0x2a1a16, 1).fillRect(cx, jy - 10, 20, 2);
  });
  g.fillStyle(0x5c412f, 1).fillRect(jx - 26, jy - 12, jl + 52, 3);   // varao

  // luz da janela caindo no chao
  const feixe = cena.add.graphics().setDepth(-90).setBlendMode(Phaser.BlendModes.ADD);
  feixe.fillStyle(0xffd66b, 0.045);
  feixe.beginPath();
  feixe.moveTo(jx, jy + ja); feixe.lineTo(jx + jl, jy + ja);
  feixe.lineTo(jx + jl + 40, a); feixe.lineTo(jx - 60, a);
  feixe.closePath(); feixe.fillPath();

  // rodape e assoalho
  g.fillStyle(0x2c1a20, 1).fillRect(0, chao - 8, l, 8);
  g.fillStyle(0x3d2630, 1).fillRect(0, chao - 8, l, 1);
  tabuas(g, 0, chao, l, a - chao, 0x6b4526, 0x7d5430, 0x40260f, 12);

  // tapete redondo de trapos
  const tx = 250, ty = chao + 30;
  [[52, 22, 0x8a3550], [44, 18, 0xb04a68], [34, 13, 0xd97a5a], [22, 8, 0xb04a68], [10, 4, 0x8a3550]].forEach(([rx, ry, cor]) => {
    for (let y = -ry; y <= ry; y++) {
      const meia = Math.floor(rx * Math.sqrt(1 - (y / ry) ** 2));
      g.fillStyle(cor, 1).fillRect(tx - meia, ty + y, meia * 2 + 1, 1);
    }
  });

  // cama encostada na parede esquerda
  const cama = { x: 18, y: chao - 40, l: 160, a: 44 };
  g.fillStyle(0x2a1a16, 1).fillRect(cama.x - 4, cama.y - 40, 12, 84);       // cabeceira
  g.fillStyle(0x6b3f22, 1).fillRect(cama.x - 3, cama.y - 39, 10, 82);
  g.fillStyle(0x8f5a2e, 1).fillRect(cama.x - 3, cama.y - 39, 10, 3);
  g.fillStyle(0x8f5a2e, 1).fillRect(cama.x - 3, cama.y - 30, 10, 2);
  g.fillStyle(0x2a1a16, 1).fillRect(cama.x, cama.y, cama.l, cama.a);
  g.fillStyle(0x3f6b8a, 1).fillRect(cama.x + 1, cama.y + 1, cama.l - 2, cama.a - 2);
  g.fillStyle(0x568cb0, 1).fillRect(cama.x + 1, cama.y + 1, cama.l - 2, 4);
  g.fillStyle(0x2f5270, 1).fillRect(cama.x + 1, cama.y + cama.a - 8, cama.l - 2, 7); // sombra do estrado
  // lencol dobrado
  g.fillStyle(0xe8dcc0, 1).fillRect(cama.x + 1, cama.y + 12, cama.l - 2, 7);
  g.fillStyle(0xc4b498, 1).fillRect(cama.x + 1, cama.y + 18, cama.l - 2, 1);
  // travesseiro
  g.fillStyle(0x2a1a16, 1).fillRect(cama.x + 6, cama.y - 12, 46, 16);
  g.fillStyle(0xf2e6cc, 1).fillRect(cama.x + 7, cama.y - 11, 44, 14);
  g.fillStyle(0xd4c4a6, 1).fillRect(cama.x + 7, cama.y - 3, 44, 3);
  g.fillStyle(0xfff8ea, 1).fillRect(cama.x + 9, cama.y - 10, 30, 2);
  // pes da cama
  g.fillStyle(0x3a2418, 1).fillRect(cama.x + 2, cama.y + cama.a, 6, 8);
  g.fillStyle(0x3a2418, 1).fillRect(cama.x + cama.l - 8, cama.y + cama.a, 6, 8);

  // criado-mudo com gaveta e abajur
  const cmx = 190, cmy = chao - 30;
  g.fillStyle(0x2a1a16, 1).fillRect(cmx, cmy, 40, 38);
  g.fillStyle(0x6b3f22, 1).fillRect(cmx + 1, cmy + 1, 38, 36);
  g.fillStyle(0x8f5a2e, 1).fillRect(cmx + 1, cmy + 1, 38, 4);
  g.fillStyle(0x3a2418, 1).fillRect(cmx + 5, cmy + 12, 30, 9);
  g.fillStyle(0xffd66b, 1).fillRect(cmx + 18, cmy + 16, 4, 2);
  g.fillStyle(0x4a2f1c, 1).fillRect(cmx + 5, cmy + 26, 30, 7);
  g.fillStyle(0x3a2418, 1).fillRect(cmx + 3, cmy + 38, 5, 6).fillRect(cmx + 32, cmy + 38, 5, 6);

  // escrivaninha com notebook e caneca, do lado direito
  const ex = 380, ey = chao - 34;
  g.fillStyle(0x2a1a16, 1).fillRect(ex - 2, ey - 2, 92, 8);
  g.fillStyle(0x8f5a2e, 1).fillRect(ex, ey, 88, 4);
  g.fillStyle(0xb5763c, 1).fillRect(ex, ey, 88, 1);
  g.fillStyle(0x2a1a16, 1).fillRect(ex + 2, ey + 6, 5, 40).fillRect(ex + 81, ey + 6, 5, 40);
  g.fillStyle(0x6b3f22, 1).fillRect(ex + 3, ey + 6, 3, 40).fillRect(ex + 82, ey + 6, 3, 40);
  // notebook fechado com um adesivo
  g.fillStyle(0x1c1c22, 1).fillRect(ex + 14, ey - 6, 40, 6);
  g.fillStyle(0x3a3a48, 1).fillRect(ex + 15, ey - 5, 38, 3);
  g.fillStyle(0x5fbf6a, 1).fillRect(ex + 30, ey - 4, 6, 2);
  // monitor com codigo na tela, ainda ligado da noite anterior
  g.fillStyle(0x1c1c22, 1).fillRect(ex + 56, ey - 34, 34, 26);
  g.fillStyle(0x14203a, 1).fillRect(ex + 58, ey - 32, 30, 21);
  g.fillStyle(0x5fbf6a, 1).fillRect(ex + 60, ey - 29, 12, 1).fillRect(ex + 60, ey - 21, 18, 1);
  g.fillStyle(0xffd66b, 1).fillRect(ex + 62, ey - 25, 16, 1).fillRect(ex + 62, ey - 17, 8, 1);
  g.fillStyle(0x7aa8bf, 1).fillRect(ex + 60, ey - 13, 14, 1);
  g.fillStyle(0x1c1c22, 1).fillRect(ex + 70, ey - 8, 6, 6).fillRect(ex + 64, ey - 3, 18, 3);
  const luzMonitor = cena.add.graphics().setDepth(-95).setBlendMode(Phaser.BlendModes.ADD);
  haloDither(luzMonitor, ex + 73, ey - 22, 6, 24, 0x7aa8bf, 4, 0.5);
  // cadeira de rodinhas na frente da mesa
  g.fillStyle(0x1c1c22, 1).fillRect(ex + 20, ey + 8, 26, 5);
  g.fillStyle(0x2f2f3a, 1).fillRect(ex + 22, ey - 12, 22, 20);
  g.fillStyle(0x3f3f4c, 1).fillRect(ex + 24, ey - 10, 18, 16);
  g.fillStyle(0x1c1c22, 1).fillRect(ex + 31, ey + 13, 4, 18).fillRect(ex + 20, ey + 30, 26, 3);

  // estante flutuante com livros e um trofeu
  const px = 60, py = 40;
  g.fillStyle(0x2a1a16, 1).fillRect(px - 2, py + 22, 116, 5);
  g.fillStyle(0x8f5a2e, 1).fillRect(px - 1, py + 23, 114, 3);
  const cores = [0x8a2f2a, 0x2f4a8a, 0x2f6b3a, 0x7a5c1e, 0x6b2f5c, 0xc86a35];
  let lx = px;
  for (let i = 0; i < 12; i++) {
    const bw = Phaser.Math.Between(4, 7), bh = Phaser.Math.Between(14, 21);
    g.fillStyle(0x1c1008, 1).fillRect(lx, py + 22 - bh, bw, bh);
    g.fillStyle(cores[i % cores.length], 1).fillRect(lx, py + 22 - bh, bw - 1, bh);
    g.fillStyle(0xd9c07a, 1).fillRect(lx, py + 22 - bh + 3, bw - 1, 1);
    lx += bw;
  }
  g.fillStyle(0xffd66b, 1).fillRect(lx + 8, py + 8, 10, 10);
  g.fillStyle(0xc88a2e, 1).fillRect(lx + 10, py + 18, 6, 4);
  g.fillStyle(0xfff0b8, 1).fillRect(lx + 10, py + 9, 3, 3);

  // calendario na parede, com o dia de hoje marcado
  quadro(g, 246, 46, 30, 36, 0x8f5a2e, 0xf2e6cc, (gg, x, y, w, h) => {
    gg.fillStyle(0xd94f45, 1).fillRect(x, y, w, 8);
    gg.fillStyle(0x3a2418, 1);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) gg.fillRect(x + 3 + c * 5, y + 12 + r * 6, 3, 3);
    gg.fillStyle(0xd94f45, 1).fillRect(x + 12, y + 17, 5, 5);
  });

  // varal de roupa na cadeira / mochila no chao
  g.fillStyle(0x3d2a5c, 1).fillRect(ex + 60, chao + 6, 16, 18);
  g.fillStyle(0x54397e, 1).fillRect(ex + 62, chao + 8, 12, 14);
  g.fillStyle(0xc8a24a, 1).fillRect(ex + 65, chao + 12, 6, 2);

  planta(g, l - 20, chao + 14);

  return { chao, despertador: { x: cmx + 20, y: cmy + 1 }, cama, feixe };
}

// ---- FASE 2: banheiro, 07:10 -------------------------------------------

// Banheiro em 480x270: pia e espelho a esquerda, box de vidro ocupando o
// resto. Devolve a area em que o Pedro pode andar e onde as coisas caem.
export function banheiro(cena) {
  const { width: l, height: a } = cena.scale;
  const g = cena.add.graphics().setDepth(-100);
  const chao = a - 44;
  const boxX = 104;                       // parede de vidro do box

  // azulejos quentes com rejunte, faixa decorativa e barra de meia parede
  azulejos(g, 0, 0, l, chao, 0xd9b98c, 0xc9a578, 0x9c7a52, 12);
  retanguloDither(g, 0, 0, l, 30, 0xa8845c, 0xd9b98c, 0.5);
  g.fillStyle(0x7a4a24, 1).fillRect(0, 88, l, 12);
  g.fillStyle(0xc86a35, 1).fillRect(0, 89, l, 10);
  for (let x = 4; x < l; x += 12) {
    g.fillStyle(0x8a3a1e, 1).fillRect(x, 92, 4, 4);
    g.fillStyle(0xf2a04d, 1).fillRect(x + 6, 92, 2, 4);
  }
  // sombra da parede perto do chao
  retanguloDither(g, 0, chao - 22, l, 22, 0xd9b98c, 0xb59168, 0.5);

  // piso de ladrilhos escuros, com o ralo no meio do box
  azulejos(g, 0, chao, l, a - chao, 0x9c7a52, 0x8d6d48, 0x6b5238, 10);
  g.fillStyle(0x6b5238, 1).fillRect(0, chao, l, 2);
  const ralo = { x: boxX + 176, y: chao + 22 };
  g.fillStyle(0x3a2a20, 1).fillRect(ralo.x - 9, ralo.y - 5, 18, 10);
  g.fillStyle(0x5a4a3a, 1).fillRect(ralo.x - 8, ralo.y - 4, 16, 8);
  g.fillStyle(0x2a1a14, 1);
  for (let i = 0; i < 3; i++) g.fillRect(ralo.x - 6, ralo.y - 3 + i * 3, 12, 1);

  // ---- pia, espelho e toalha (fora do box) ----
  quadro(g, 22, 28, 60, 48, 0x8f9aa8, 0xbfd9e6, (gg, x, y, w, h) => {
    // o espelho reflete os azulejos da parede oposta, esmaecidos
    azulejos(gg, x, y, w, h, 0xcfe0e8, 0xc2d6e0, 0xa8bfcc, 12);
    gg.fillStyle(0xd9a86a, 0.5).fillRect(x, y + 30, w, 6);
    // vapor condensado no alto e um risco de dedo
    gg.fillStyle(0xffffff, 0.45).fillRect(x, y, w, 14);
    gg.fillStyle(0xffffff, 0.25).fillRect(x, y + 14, w, 8);
    gg.fillStyle(0x9fc4d6, 0.6).fillRect(x + 8, y + 6, 22, 3);
    gg.fillStyle(0xffffff, 0.6).fillRect(x + 2, y + 2, 2, h - 4);
  });
  const px = 18, py = chao - 34;
  g.fillStyle(0x8f9aa8, 1).fillRect(px - 2, py - 2, 68, 26);
  g.fillStyle(0xf2f6f8, 1).fillRect(px, py, 64, 22);
  g.fillStyle(0xd0dde6, 1).fillRect(px, py + 18, 64, 4);
  g.fillStyle(0xb8c6d0, 1).fillRect(px + 10, py + 5, 44, 11);
  g.fillStyle(0x8f9aa8, 1).fillRect(px + 30, py - 10, 4, 11);
  g.fillStyle(0xc0ccd8, 1).fillRect(px + 30, py - 12, 12, 4);
  g.fillStyle(0xdfe8ee, 1).fillRect(px + 30, py - 12, 12, 1);
  g.fillStyle(0x8f9aa8, 1).fillRect(px + 28, py + 22, 8, chao - py - 22);   // coluna da pia
  // copo com escova de dente e sabonete
  g.fillStyle(0x7aa8bf, 1).fillRect(px + 4, py - 8, 7, 9);
  g.fillStyle(0xd94f45, 1).fillRect(px + 6, py - 14, 2, 7);
  g.fillStyle(0xef9a5c, 1).fillRect(px + 50, py - 4, 10, 4);
  // toalha pendurada
  g.fillStyle(0x2a3a44, 1).fillRect(12, 104, 30, 3);
  g.fillStyle(0xd97a5a, 1).fillRect(14, 107, 26, 40);
  g.fillStyle(0xef9a72, 1).fillRect(14, 107, 26, 4);
  g.fillStyle(0xb85c44, 1).fillRect(14, 136, 26, 2).fillRect(14, 120, 26, 1);

  // ---- box de vidro ----
  // trilho no teto e parede de vidro com brilho
  g.fillStyle(0x8f9aa8, 1).fillRect(boxX - 6, 16, l - boxX + 6, 4);
  g.fillStyle(0xc0ccd8, 1).fillRect(boxX - 6, 16, l - boxX + 6, 1);
  g.fillStyle(0x6b96a8, 1).fillRect(boxX - 3, 20, 5, chao - 20);
  g.fillStyle(0x9cc4d8, 1).fillRect(boxX - 2, 20, 1, chao - 20);
  const vidro = cena.add.graphics().setDepth(-95);
  vidro.fillStyle(0xbfe0f0, 0.10).fillRect(boxX + 2, 20, 26, chao - 20);
  vidro.fillStyle(0xffffff, 0.18).fillRect(boxX + 6, 26, 3, chao - 40);
  vidro.fillStyle(0xffffff, 0.10).fillRect(boxX + 12, 34, 1, chao - 60);

  // chuveiro: cano na parede, braco e ducha larga
  const chuveiro = { x: boxX + 176, y: 48 };          // centro do box de 480 de largura
  g.fillStyle(0x8f9aa8, 1).fillRect(chuveiro.x - 2, 20, 4, 16);
  g.fillStyle(0xc0ccd8, 1).fillRect(chuveiro.x - 2, 20, 1, 16);
  g.fillStyle(0x2a3a44, 1).fillRect(chuveiro.x - 22, chuveiro.y - 12, 44, 9);
  g.fillStyle(0xc0ccd8, 1).fillRect(chuveiro.x - 21, chuveiro.y - 11, 42, 5);
  g.fillStyle(0xdfe8ee, 1).fillRect(chuveiro.x - 21, chuveiro.y - 11, 42, 1);
  g.fillStyle(0x8f9aa8, 1);
  for (let x = chuveiro.x - 19; x < chuveiro.x + 20; x += 4) g.fillRect(x, chuveiro.y - 3, 2, 2);
  // registro com pinguinho vermelho/azul
  g.fillStyle(0x8f9aa8, 1).fillRect(chuveiro.x + 60, 110, 14, 14);
  g.fillStyle(0xc0ccd8, 1).fillRect(chuveiro.x + 62, 112, 10, 10);
  g.fillStyle(0xd94f45, 1).fillRect(chuveiro.x + 63, 113, 3, 3);
  g.fillStyle(0x4a9ad8, 1).fillRect(chuveiro.x + 68, 113, 3, 3);

  // saboneteira e frascos numa prateleira de canto
  g.fillStyle(0x8f9aa8, 1).fillRect(l - 56, 126, 50, 3);
  g.fillStyle(0x5fbf6a, 1).fillRect(l - 50, 108, 10, 18);
  g.fillStyle(0x8fd99a, 1).fillRect(l - 50, 108, 3, 18);
  g.fillStyle(0xd94f45, 1).fillRect(l - 36, 112, 8, 14);
  g.fillStyle(0xf2a04d, 1).fillRect(l - 24, 116, 12, 10);
  g.fillStyle(0xfff0b8, 1).fillRect(l - 22, 118, 8, 4);

  // janelinha alta com luz da manha
  g.fillStyle(0x6b4a34, 1).fillRect(l - 100, 30, 44, 30);
  faixaDither(g, l - 98, 32, 40, 26, 0xf2ab4f, 0xffe9c9, 3);
  g.fillStyle(0x6b4a34, 1).fillRect(l - 79, 32, 2, 26);
  const luzJanela = cena.add.graphics().setDepth(-96).setBlendMode(Phaser.BlendModes.ADD);
  haloDither(luzJanela, l - 78, 46, 10, 40, 0xffe9c9, 4, 0.5);

  // tapete de banho na saida do box
  g.fillStyle(0x8a3a1e, 1).fillRect(boxX - 60, chao + 8, 50, 20);
  g.fillStyle(0xc86a35, 1).fillRect(boxX - 58, chao + 10, 46, 16);
  g.fillStyle(0xef9a5c, 1).fillRect(boxX - 54, chao + 13, 38, 10);

  return {
    chao, chuveiro, ralo,
    area: { esquerda: boxX + 30, direita: boxX + 352 },
  };
}

// ---- FASE 4: recepcao do escritorio de advocacia, 08:00 ----------------

export function escritorio(cena) {
  const { width: l, height: a } = cena.scale;
  const g = cena.add.graphics().setDepth(-100);
  // O chao fica alto de proposito: assim os personagens ficam acima da
  // caixa de dialogo, que ocupa a faixa de baixo da tela.
  const chao = a - 104;

  // parede: pintura clara em cima, boiserie de madeira embaixo
  g.fillStyle(0x7a5f45, 1).fillRect(0, 0, l, chao);
  retanguloDither(g, 0, 0, l, chao - 44, 0x7a5f45, 0x8d7255, 0.5);
  g.fillStyle(0x4a3728, 1).fillRect(0, chao - 46, l, 46);
  g.fillStyle(0x5c4632, 1).fillRect(0, chao - 44, l, 42);
  for (let x = 0; x < l; x += 24) {
    g.fillStyle(0x3a2a1c, 1).fillRect(x, chao - 44, 1, 42);
    g.fillStyle(0x6b5238, 1).fillRect(x + 1, chao - 44, 1, 42);
    g.fillStyle(0x3a2a1c, 1).fillRect(x + 6, chao - 36, 12, 26);
    g.fillStyle(0x5c4632, 1).fillRect(x + 7, chao - 35, 10, 24);
  }
  g.fillStyle(0x8f6f4a, 1).fillRect(0, chao - 48, l, 3);
  g.fillStyle(0xa8865c, 1).fillRect(0, chao - 48, l, 1);

  // carpete
  g.fillStyle(0x5c3040, 1).fillRect(0, chao, l, a - chao);
  retanguloDither(g, 0, chao, l, a - chao, 0x5c3040, 0x6b3a4a, 0.5);
  g.fillStyle(0x8a4a5c, 1).fillRect(0, chao, l, 2);

  // estante de livros de direito, grande, a esquerda
  const ex = 14, ey = 12, el = 118, ea = 112;
  g.fillStyle(0x2e1c12, 1).fillRect(ex - 3, ey - 3, el + 6, ea + 6);
  g.fillStyle(0x6b4526, 1).fillRect(ex - 2, ey - 2, el + 4, ea + 4);
  g.fillStyle(0x3a2418, 1).fillRect(ex, ey, el, ea);
  const cores = [0x8a2f2a, 0x2f4a8a, 0x2f6b3a, 0x7a5c1e, 0x6b2f5c, 0x8a4a24];
  for (let prat = 0; prat < 4; prat++) {
    const py = ey + 4 + prat * 27;
    let bx = ex + 3;
    while (bx < ex + el - 5) {
      const bw = Phaser.Math.Between(3, 7);
      const bh = Phaser.Math.Between(16, 22);
      const cor = Phaser.Utils.Array.GetRandom(cores);
      g.fillStyle(0x1c1008, 1).fillRect(bx, py + (22 - bh), bw, bh);
      g.fillStyle(cor, 1).fillRect(bx, py + (22 - bh), bw - 1, bh);
      g.fillStyle(0xd9c07a, 1).fillRect(bx, py + (22 - bh) + 3, bw - 1, 1);
      bx += bw;
    }
    g.fillStyle(0x6b4526, 1).fillRect(ex, py + 22, el, 3);
    g.fillStyle(0x8f5a2e, 1).fillRect(ex, py + 22, el, 1);
  }

  // diplomas e a placa do escritorio
  quadro(g, 160, 22, 40, 30, 0xa8865c, 0xf2e6cc, (gg, x, y, w, h) => {
    gg.fillStyle(0x8a7050, 1);
    for (let i = 0; i < 5; i++) gg.fillRect(x + 5, y + 6 + i * 4, w - 10, 1);
    gg.fillStyle(0xa83a32, 1).fillRect(x + w - 12, y + h - 9, 7, 7);
  });
  quadro(g, 212, 28, 30, 24, 0xa8865c, 0xf2e6cc, (gg, x, y, w, h) => {
    gg.fillStyle(0x8a7050, 1);
    for (let i = 0; i < 3; i++) gg.fillRect(x + 4, y + 5 + i * 4, w - 8, 1);
  });
  // placa dourada "Viana Advocacia"
  g.fillStyle(0x2e1c12, 1).fillRect(158, 66, 86, 18);
  g.fillStyle(0xc88a2e, 1).fillRect(159, 67, 84, 16);
  g.fillStyle(0xffd66b, 1).fillRect(160, 68, 82, 2);
  g.fillStyle(0x6b3f22, 1);
  for (let i = 0; i < 6; i++) g.fillRect(166 + i * 12, 74, 8, 3);

  // relogio de parede marcando a hora do atraso
  const rx = 290, ry = 40;
  circuloPixel(g, rx, ry, 16, 0x2e1c12);
  circuloPixel(g, rx, ry, 14, 0x8f6f4a);
  circuloPixel(g, rx, ry, 12, 0xf2e6cc);
  g.fillStyle(0x3a2418, 1);
  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * Math.PI * 2;
    g.fillRect(Math.round(rx + Math.cos(ang) * 9) , Math.round(ry + Math.sin(ang) * 9), 1, 1);
  }
  g.fillRect(rx - 1, ry - 8, 2, 9);
  g.fillRect(rx - 1, ry - 1, 9, 2);
  g.fillStyle(0x8a2f2a, 1).fillRect(rx - 1, ry - 1, 2, 2);

  // porta de entrada, a direita, por onde o Pedro chega
  const px = 396, py = chao - 96;
  g.fillStyle(0x2e1c12, 1).fillRect(px - 4, py - 4, 60, 100);
  g.fillStyle(0x6b4526, 1).fillRect(px - 2, py - 2, 56, 98);
  g.fillStyle(0x8f5a2e, 1).fillRect(px, py, 52, 96);
  g.fillStyle(0x6b4526, 1).fillRect(px + 6, py + 8, 40, 34).fillRect(px + 6, py + 50, 40, 40);
  g.fillStyle(0x9cc4d8, 1).fillRect(px + 8, py + 10, 36, 30);
  g.fillStyle(0xdfe8ee, 0.6).fillRect(px + 10, py + 12, 6, 26);
  g.fillStyle(0xffd66b, 1).fillRect(px + 42, py + 56, 4, 6);

  // balcao da recepcao com luminaria acesa
  const bx = 274, by = chao - 40;
  g.fillStyle(0x2e1c12, 1).fillRect(bx - 2, by - 2, 108, 46);
  g.fillStyle(0x6b4526, 1).fillRect(bx, by, 104, 42);
  g.fillStyle(0x8f5a2e, 1).fillRect(bx, by, 104, 5);
  g.fillStyle(0xa8865c, 1).fillRect(bx, by, 104, 1);
  g.fillStyle(0x4a3018, 1).fillRect(bx + 4, by + 12, 96, 26);
  for (let x = bx + 8; x < bx + 98; x += 14) g.fillStyle(0x6b4526, 1).fillRect(x, by + 14, 10, 22);
  // luminaria, papeis e telefone
  g.fillStyle(0x2e1c12, 1).fillRect(bx + 84, by - 16, 3, 16);
  g.fillStyle(0x2f4a3a, 1).fillRect(bx + 74, by - 23, 24, 8);
  g.fillStyle(0x4a6b52, 1).fillRect(bx + 75, by - 22, 22, 3);
  g.fillStyle(0xf2e6cc, 1).fillRect(bx + 10, by - 4, 18, 4);
  g.fillStyle(0xd9c9a8, 1).fillRect(bx + 12, by - 6, 16, 2);
  g.fillStyle(0x1c1c22, 1).fillRect(bx + 40, by - 6, 16, 6);
  g.fillStyle(0x3a3a48, 1).fillRect(bx + 42, by - 8, 12, 3);
  const luz = cena.add.graphics().setDepth(-95).setBlendMode(Phaser.BlendModes.ADD);
  haloDither(luz, bx + 86, by - 12, 3, 18, 0xffd66b, 4);

  // bebedouro e plantas
  g.fillStyle(0x2e2e3a, 1).fillRect(150, chao - 44, 16, 44);
  g.fillStyle(0x7aa8bf, 1).fillRect(148, chao - 62, 20, 20);
  g.fillStyle(0xbfe4ff, 1).fillRect(150, chao - 60, 6, 16);
  planta(g, 388, chao + 4);
  planta(g, 464, chao + 4);

  return { chao, balcao: { x: bx, y: by }, relogio: { x: rx, y: ry }, porta: { x: px + 26 } };
}

// ---- FASE 6: sala de aula da PUC, 19:00 --------------------------------

export function salaAula(cena) {
  const { width: l, height: a } = cena.scale;
  const g = cena.add.graphics().setDepth(-100);
  const chao = a - 60;

  // parede quente com meia parede de madeira
  g.fillStyle(0x5c4c50, 1).fillRect(0, 0, l, chao);
  retanguloDither(g, 0, 0, l, 34, 0x463a40, 0x5c4c50, 0.5);
  g.fillStyle(0x6b5a5c, 1).fillRect(0, 118, l, chao - 118);
  for (let x = 0; x < l; x += 26) g.fillStyle(0x5c4c50, 1).fillRect(x, 120, 1, chao - 122);
  g.fillStyle(0x8f5a2e, 1).fillRect(0, 116, l, 3);
  g.fillStyle(0xb5763c, 1).fillRect(0, 116, l, 1);

  // luminarias do teto
  for (let i = 0; i < 4; i++) {
    const x = 60 + i * 120;
    g.fillStyle(0x22262e, 1).fillRect(x - 24, 0, 48, 7);
    g.fillStyle(0xfff3c4, 1).fillRect(x - 22, 5, 44, 3);
    const brilho = cena.add.graphics().setDepth(-96).setBlendMode(Phaser.BlendModes.ADD);
    haloDither(brilho, x, 9, 4, 16, 0xffe9c9, 4, 0.8);
  }

  // quadro branco com a materia da noite
  const qx = 22, qy = 22, ql = 200, qa = 72;
  g.fillStyle(0x8f9aa8, 1).fillRect(qx - 3, qy - 3, ql + 6, qa + 6);
  g.fillStyle(0xdfe8ee, 1).fillRect(qx, qy, ql, qa);
  g.fillStyle(0xc4cdd6, 1).fillRect(qx, qy + qa - 4, ql, 4);
  cena.add.text(qx + 8, qy + 8, 'Ciencia da Computacao', { fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#2f4a8a' }).setDepth(-99);
  cena.add.text(qx + 8, qy + 22, 'Estruturas de Dados', { fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#8a2f2a' }).setDepth(-99);
  g.fillStyle(0x2f4a8a, 1).fillRect(qx + 8, qy + 38, 80, 2).fillRect(qx + 8, qy + 46, 56, 2).fillRect(qx + 8, qy + 54, 70, 2);
  // arvore binaria desenhada no canto do quadro
  const ax = qx + 150, ay = qy + 38;
  g.fillStyle(0x2f6b3a, 1);
  [[0, 0], [-16, 12], [16, 12], [-24, 24], [-8, 24], [8, 24], [24, 24]].forEach(([dx, dy]) => g.fillRect(ax + dx - 3, ay + dy - 3, 6, 6));
  g.fillRect(ax - 8, ay + 4, 1, 6).fillRect(ax + 8, ay + 4, 1, 6);
  g.fillRect(ax - 20, ay + 16, 1, 6).fillRect(ax - 12, ay + 16, 1, 6).fillRect(ax + 12, ay + 16, 1, 6).fillRect(ax + 20, ay + 16, 1, 6);
  g.fillStyle(0x2a3a44, 1).fillRect(qx + 8, qy + qa - 6, 14, 3);
  g.fillStyle(0x2f4a8a, 1).fillRect(qx + 30, qy + qa - 5, 10, 2);
  g.fillStyle(0x8a2f2a, 1).fillRect(qx + 44, qy + qa - 5, 10, 2);

  // janela com a noite e a cidade
  const jx = 262, jy = 20, jl = 130, ja = 72;
  g.fillStyle(0x22262e, 1).fillRect(jx - 4, jy - 4, jl + 8, ja + 8);
  g.fillStyle(0x141a2e, 1).fillRect(jx, jy, jl, ja);
  g.fillStyle(0xffe9c9, 0.9);
  for (let i = 0; i < 24; i++) g.fillRect(jx + Phaser.Math.Between(2, jl - 3), jy + Phaser.Math.Between(2, ja - 20), 1, 1);
  circuloPixel(g, jx + jl - 24, jy + 18, 8, 0xf2e6cc);
  circuloPixel(g, jx + jl - 27, jy + 15, 7, 0x141a2e);
  g.fillStyle(0x2a1a30, 1);
  let bx = jx;
  while (bx < jx + jl) {
    const bw = Phaser.Math.Between(10, 18), bh = Phaser.Math.Between(10, 28);
    g.fillRect(bx, jy + ja - bh, Math.min(bw, jx + jl - bx), bh);
    g.fillStyle(0xffd66b, 1);
    for (let k = 0; k < 3; k++) if (Math.random() < 0.7) g.fillRect(bx + 2 + k * 4, jy + ja - bh + 3, 2, 2);
    g.fillStyle(0x2a1a30, 1);
    bx += bw + 2;
  }
  g.fillStyle(0x4a5060, 1).fillRect(jx + jl / 2 - 1, jy, 2, ja).fillRect(jx, jy + ja / 2 - 1, jl, 2);

  // relogio, mural e faixa da PUC
  circuloPixel(g, 440, 44, 12, 0x2e1c12);
  circuloPixel(g, 440, 44, 10, 0xf2e6cc);
  g.fillStyle(0x3a2418, 1).fillRect(439, 36, 2, 9).fillRect(439, 43, 6, 2);
  g.fillStyle(0x14203a, 1).fillRect(24, 100, 120, 14);
  g.fillStyle(0x24365c, 1).fillRect(26, 102, 116, 10);
  cena.add.text(84, 107, 'PUC GOIAS', { fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#ffd66b' }).setOrigin(0.5).setDepth(-99);
  quadro(g, 400, 96, 60, 20, 0x8f5a2e, 0xd9c9a8, (gg, x, y, w, h) => {
    const cores = [0xd94f45, 0x5fbf6a, 0x4a7ab5];
    for (let i = 0; i < 3; i++) gg.fillStyle(cores[i], 1).fillRect(x + 4 + i * 19, y + 4, 14, 12);
  });

  // piso
  azulejos(g, 0, chao, l, a - chao, 0x7d6650, 0x6b5642, 0x54402f, 16);

  // bancada comprida com dois lugares
  const mx = 60, my = chao + 2, ml = 360;
  g.fillStyle(0x2e2a24, 1).fillRect(mx - 2, my - 2, ml + 4, 24);
  g.fillStyle(0x6b5a48, 1).fillRect(mx, my, ml, 20);
  g.fillStyle(0x8a7a62, 1).fillRect(mx, my, ml, 4);
  g.fillStyle(0x2e2a24, 1).fillRect(mx + 6, my + 20, 6, 22).fillRect(mx + ml - 12, my + 20, 6, 22).fillRect(mx + ml / 2 - 3, my + 20, 6, 22);
  const lugares = [mx + 90, mx + ml - 90];
  lugares.forEach((cx) => {
    // monitor pequeno (a tela grande no meio e a mesma tela ampliada)
    g.fillStyle(0x1c1c22, 1).fillRect(cx - 26, my - 38, 52, 36);
    g.fillStyle(0x14203a, 1).fillRect(cx - 24, my - 36, 48, 30);
    g.fillStyle(0x5fbf6a, 1).fillRect(cx - 21, my - 32, 18, 1).fillRect(cx - 21, my - 20, 26, 1);
    g.fillStyle(0xffd66b, 1).fillRect(cx - 18, my - 28, 22, 1).fillRect(cx - 18, my - 16, 10, 1);
    g.fillStyle(0x7aa8bf, 1).fillRect(cx - 21, my - 24, 30, 1).fillRect(cx - 21, my - 12, 14, 1);
    g.fillStyle(0x1c1c22, 1).fillRect(cx - 4, my - 2, 8, 3).fillRect(cx - 12, my, 24, 2);
    g.fillStyle(0x2e2a24, 1).fillRect(cx - 18, my + 6, 36, 8);
    g.fillStyle(0x4a4a58, 1).fillRect(cx - 17, my + 7, 34, 6);
    const luz = cena.add.graphics().setDepth(-95).setBlendMode(Phaser.BlendModes.ADD);
    haloDither(luz, cx, my - 22, 6, 28, 0x7aa8bf, 4, 0.5);
  });
  // mochila e caneca de cafe na bancada
  g.fillStyle(0x3d2a5c, 1).fillRect(mx + ml - 30, my - 16, 14, 16);
  g.fillStyle(0x54397e, 1).fillRect(mx + ml - 28, my - 14, 10, 12);
  g.fillStyle(0xf2e6cc, 1).fillRect(mx + 30, my - 8, 8, 8);
  g.fillStyle(0x8a4a24, 1).fillRect(mx + 32, my - 6, 4, 2);

  return { chao, mesa: { x: mx, y: my, l: ml }, lugares };
}

// ---- FASE 7: ponto de onibus a noite, 21:50 ----------------------------

export function pontoOnibusNoite(cena) {
  const { width: l, height: a } = cena.scale;
  const g = cena.add.graphics().setDepth(-100);
  // chao alto: a caixa de dialogo ocupa a faixa de baixo
  const chao = a - 100;

  // ceu noturno com estrelas de brilhos diferentes
  faixaDither(g, 0, 0, l, chao, 0x0d1024, 0x2a1f3f, 6);
  const ge = cena.add.graphics().setDepth(-99);
  for (let i = 0; i < 110; i++) {
    const x = Phaser.Math.Between(0, l), y = Phaser.Math.Between(2, chao - 60);
    ge.fillStyle(0xffe9c9, Phaser.Math.FloatBetween(0.35, 1)).fillRect(x, y, 1, 1);
    if (Math.random() < 0.08) { ge.fillRect(x - 1, y, 3, 1); ge.fillRect(x, y - 1, 1, 3); }
  }
  cena.tweens.add({ targets: ge, alpha: 0.55, duration: 2600, yoyo: true, repeat: -1 });

  // lua com halo
  const halo = cena.add.graphics().setDepth(-98).setBlendMode(Phaser.BlendModes.ADD);
  haloDither(halo, 400, 60, 16, 34, 0xdfe8ee, 4, 0.7);
  circuloPixel(g, 400, 60, 16, 0xf2e6cc);
  circuloPixel(g, 395, 55, 4, 0xd8ccb0);
  circuloPixel(g, 406, 66, 3, 0xd8ccb0);

  // cidade dormindo, duas camadas
  [[0x1c1630, 0x342a4c, 40, 90, chao - 16, 0.18], [0x120e1e, 0x2a2240, 20, 56, chao - 4, 0.28]].forEach(([cor, borda, hmin, hmax, base, chance]) => {
    let bx = -6;
    while (bx < l + 6) {
      const bw = Phaser.Math.Between(18, 40), bh = Phaser.Math.Between(hmin, hmax);
      g.fillStyle(borda, 1).fillRect(bx - 1, base - bh - 1, bw + 2, bh + 2);
      g.fillStyle(cor, 1).fillRect(bx, base - bh, bw, bh + 10);
      g.fillStyle(0xffd66b, 1);
      for (let jy = base - bh + 4; jy < base - 6; jy += 8) {
        for (let jx = bx + 3; jx < bx + bw - 3; jx += 6) if (Math.random() < chance) g.fillRect(jx, jy, 2, 3);
      }
      bx += bw + Phaser.Math.Between(2, 6);
    }
  });

  // calcada e asfalto
  g.fillStyle(0x241a26, 1).fillRect(0, chao, l, a - chao);
  g.fillStyle(0x3a2a34, 1).fillRect(0, chao, l, 3);
  g.fillStyle(0x50404a, 1).fillRect(0, chao, l, 1);
  for (let x = 0; x < l; x += 14) g.fillStyle(0x1a1220, 1).fillRect(x, chao + 4, 1, a - chao - 4);
  g.fillStyle(0x1a1220, 1).fillRect(0, chao + 26, l, 2);
  g.fillStyle(0xd9c07a, 0.5).fillRect(0, chao + 30, l, 1);

  // abrigo do ponto
  const px = 70, pl = 200, py = chao - 90;
  g.fillStyle(0x1a1a26, 1).fillRect(px + 4, py + 10, pl - 8, chao - py - 10);
  g.fillStyle(0x24243a, 1).fillRect(px + 6, py + 12, pl - 12, chao - py - 14);
  for (let x = px + 12; x < px + pl - 12; x += 20) g.fillStyle(0x2e2e48, 1).fillRect(x, py + 14, 2, chao - py - 18);
  // cartaz iluminado
  g.fillStyle(0x0f0f18, 1).fillRect(px + 14, py + 20, 44, 56);
  g.fillStyle(0xf2c46b, 1).fillRect(px + 16, py + 22, 40, 52);
  g.fillStyle(0xc86a35, 1).fillRect(px + 20, py + 30, 32, 14);
  g.fillStyle(0x8a4a24, 1).fillRect(px + 20, py + 50, 32, 4).fillRect(px + 20, py + 58, 22, 4).fillRect(px + 20, py + 66, 26, 3);
  // cobertura
  g.fillStyle(0x14141c, 1).fillRect(px - 10, py, pl + 20, 11);
  g.fillStyle(0x3a3a52, 1).fillRect(px - 10, py, pl + 20, 4);
  g.fillStyle(0x54547a, 1).fillRect(px - 10, py, pl + 20, 1);
  [px, px + pl - 6].forEach((cx) => {
    g.fillStyle(0x14141c, 1).fillRect(cx, py + 11, 6, chao - py - 11);
    g.fillStyle(0x3a3a52, 1).fillRect(cx + 1, py + 11, 2, chao - py - 11);
  });
  // banco de madeira com encosto
  const by = chao - 30;
  g.fillStyle(0x2e1c12, 1).fillRect(px + 70, by - 16, pl - 90, 5);
  g.fillStyle(0x6b4526, 1).fillRect(px + 71, by - 15, pl - 92, 3);
  g.fillStyle(0x2e1c12, 1).fillRect(px + 70, by, pl - 90, 7);
  g.fillStyle(0x8f5a2e, 1).fillRect(px + 71, by + 1, pl - 92, 5);
  g.fillStyle(0xb5763c, 1).fillRect(px + 71, by + 1, pl - 92, 1);
  g.fillStyle(0x2e1c12, 1).fillRect(px + 78, by + 7, 6, 23).fillRect(px + pl - 34, by + 7, 6, 23);
  // placa do ponto e lixeira
  g.fillStyle(0x14141c, 1).fillRect(px + pl + 14, chao - 24, 16, 24);
  g.fillStyle(0x3a3a52, 1).fillRect(px + pl + 15, chao - 23, 14, 22);
  g.fillStyle(0x54547a, 1).fillRect(px + pl + 15, chao - 23, 14, 3);

  // poste de luz alto com poca de luz
  const lx = 400;
  g.fillStyle(0x14141c, 1).fillRect(lx - 3, chao - 2, 8, 3);
  g.fillStyle(0x3a2a30, 1).fillRect(lx - 1, chao - 100, 4, 100);
  g.fillStyle(0x55404a, 1).fillRect(lx - 1, chao - 100, 1, 100);
  g.fillStyle(0x3a2a30, 1).fillRect(lx - 14, chao - 102, 16, 3);
  g.fillStyle(0x14141c, 1).fillRect(lx - 20, chao - 100, 10, 5);
  g.fillStyle(0xffd66b, 1).fillRect(lx - 19, chao - 99, 8, 3);
  const luzPoste = cena.add.graphics().setDepth(-94).setBlendMode(Phaser.BlendModes.ADD);
  haloDither(luzPoste, lx - 15, chao - 96, 4, 26, 0xffd66b, 4, 0.6);
  for (let i = 0; i < 6; i++) luzPoste.fillStyle(0xffd66b, 0.04 + i * 0.01).fillRect(lx - 15 - (40 - i * 6), chao - 1 - i, (40 - i * 6) * 2, 1);

  // luz do abrigo
  const luzAbrigo = cena.add.graphics().setDepth(-94).setBlendMode(Phaser.BlendModes.ADD);
  haloDither(luzAbrigo, px + pl / 2, py + 14, 5, 34, 0xffd66b, 4, 0.7);
  cena.tweens.add({ targets: luzAbrigo, alpha: 0.8, duration: 3400, yoyo: true, repeat: -1 });

  return { chao, banco: { x: px + pl / 2 + 10, y: by + 1 } };
}
