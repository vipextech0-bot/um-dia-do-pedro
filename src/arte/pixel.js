// Motor de pixel art: converte mapas de texto em texturas do Phaser.
// Cada caractere do mapa vira exatamente 1 pixel da textura, entao o
// desenho fica com aresta dura de verdade (nada de antialias).

// Converte um mapa (array de strings) + legenda ({ caractere: '#rrggbb' })
// em uma textura registrada com o nome `chave`.
export function texturaDeMapa(cena, chave, linhas, legenda) {
  if (cena.textures.exists(chave)) return chave;

  const largura = Math.max(...linhas.map((l) => l.length));
  const altura = linhas.length;

  const tex = cena.textures.createCanvas(chave, largura, altura);
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;

  for (let y = 0; y < altura; y++) {
    const linha = linhas[y];
    for (let x = 0; x < linha.length; x++) {
      const cor = legenda[linha[x]];
      if (!cor) continue; // '.' e espaco = transparente
      ctx.fillStyle = cor;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  tex.refresh();
  return chave;
}

// Valida que todas as linhas do mapa tem o mesmo comprimento.
// Um mapa torto desloca o sprite inteiro e o bug e dificil de enxergar.
export function conferirMapa(nome, linhas) {
  const w = linhas[0].length;
  const erradas = linhas
    .map((l, i) => (l.length !== w ? `${i}(${l.length})` : null))
    .filter(Boolean);
  if (erradas.length) {
    console.warn(`[pixel] mapa "${nome}" com linhas de tamanho diferente de ${w}:`, erradas.join(', '));
  }
  return linhas;
}

// ---- Dithering ----------------------------------------------------------
// A marca registrada do visual 16 bits: em vez de degrade suave, duas cores
// se intercalam em padrao xadrez. Usado no ceu, nas sombras e nos halos.

const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

// Preenche um retangulo misturando corA e corB. `mistura` 0 = so corA,
// 1 = so corB, valores no meio produzem o xadrez.
export function retanguloDither(g, x, y, largura, altura, corA, corB, mistura) {
  const limite = mistura * 16;
  g.fillStyle(corA, 1).fillRect(x, y, largura, altura);
  g.fillStyle(corB, 1);
  for (let py = 0; py < altura; py++) {
    for (let px = 0; px < largura; px++) {
      if (BAYER4[py & 3][px & 3] < limite) g.fillRect(x + px, y + py, 1, 1);
    }
  }
}

// Faixa vertical que vai de corA (topo) ate corB (base) usando dither.
export function faixaDither(g, x, y, largura, altura, corA, corB, passos = 6) {
  const alturaPasso = altura / passos;
  for (let i = 0; i < passos; i++) {
    retanguloDither(
      g, x, Math.round(y + i * alturaPasso), largura, Math.ceil(alturaPasso) + 1,
      corA, corB, i / (passos - 1)
    );
  }
}

// Circulo com borda serrilhada (sem antialias), do jeito que o Phaser
// nao desenha por padrao.
export function circuloPixel(g, cx, cy, raio, cor, alpha = 1) {
  g.fillStyle(cor, alpha);
  for (let y = -raio; y <= raio; y++) {
    const meia = Math.floor(Math.sqrt(raio * raio - y * y));
    g.fillRect(Math.round(cx - meia), Math.round(cy + y), meia * 2 + 1, 1);
  }
}

// Halo de luz: aneis concentricos, cada um mais opaco que o de fora.
// `intensidade` multiplica o brilho — em camada aditiva, passar de 1 estoura
// a imagem, entao o padrao e conservador e o sol pede um valor maior.
export function haloDither(g, cx, cy, raioInterno, raioExterno, cor, passos = 5, intensidade = 1) {
  for (let i = passos; i >= 1; i--) {
    const r = raioInterno + ((raioExterno - raioInterno) * i) / passos;
    const alpha = (0.045 + 0.045 * (passos - i)) * intensidade;
    circuloPixel(g, cx, cy, Math.round(r), cor, alpha);
  }
}
