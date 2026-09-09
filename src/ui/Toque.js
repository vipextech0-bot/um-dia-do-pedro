import { FONTE } from '../config/paleta.js';
import { circuloPixel } from '../arte/pixel.js';

// Controles na tela para celular/tablet. So aparecem quando ha toque.
export const TEM_TOQUE = typeof window !== 'undefined'
  && (('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0);

// Botao redondo semitransparente. `aoPressionar`/`aoSoltar` servem para
// segurar (andar); `aoTocar` para um toque unico (trocar de faixa, girar).
// Vibracao curta (Android); no iPhone simplesmente nao acontece nada.
export function vibrar(ms = 40) {
  try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* sem vibracao */ }
}

export function botaoToque(cena, x, y, rotulo, { aoPressionar, aoSoltar, aoTocar, raio = 24, tamanho = '12px' } = {}) {
  const g = cena.add.graphics().setDepth(600).setScrollFactor(0);
  circuloPixel(g, 0, 0, raio, 0x2e1710, 0.8);
  circuloPixel(g, 0, 0, raio - 2, 0xf6e0b4, 0.8);
  g.setPosition(x, y);
  const t = cena.add.text(x, y, rotulo, { fontFamily: FONTE, fontSize: tamanho, color: '#7a2f14' })
    .setOrigin(0.5).setDepth(601).setScrollFactor(0);
  const zona = cena.add.zone(x, y, raio * 2 + 10, raio * 2 + 10).setInteractive().setDepth(602).setScrollFactor(0);
  zona.on('pointerdown', () => { g.setAlpha(0.55); aoPressionar && aoPressionar(); aoTocar && aoTocar(); });
  zona.on('pointerup', () => { g.setAlpha(1); aoSoltar && aoSoltar(); });
  zona.on('pointerout', () => { g.setAlpha(1); aoSoltar && aoSoltar(); });
  return {
    g, t, zona,
    setRotulo(r) { t.setText(r); },
    setVisible(v) { g.setVisible(v); t.setVisible(v); zona.setVisible(v); zona.input.enabled = v; },
    destruir() { g.destroy(); t.destroy(); zona.destroy(); },
  };
}

// Duas zonas invisiveis (metade esquerda/direita da tela) para andar segurando.
export function zonasLaterais(cena, aoMudar) {
  const { width: l, height: a } = cena.scale;
  const estado = { esquerda: false, direita: false };
  [['esquerda', 0], ['direita', l / 2]].forEach(([lado, x]) => {
    const z = cena.add.zone(x, 20, l / 2, a - 20).setOrigin(0, 0).setInteractive().setDepth(590);
    z.on('pointerdown', () => { estado[lado] = true; aoMudar && aoMudar(estado); });
    z.on('pointerup', () => { estado[lado] = false; aoMudar && aoMudar(estado); });
    z.on('pointerout', () => { estado[lado] = false; aoMudar && aoMudar(estado); });
  });
  // setas grandes pulsando nas bordas; somem depois do primeiro toque
  const setas = [[28, '◀'], [l - 28, '▶']].map(([x, r]) => cena.add.text(x, a / 2, r, { fontFamily: FONTE, fontSize: '22px', color: '#f6e0b4' })
    .setOrigin(0.5).setDepth(591).setAlpha(0.7).setShadow(0, 2, '#000000', 0));
  cena.tweens.add({ targets: setas, alpha: 0.25, duration: 500, yoyo: true, repeat: -1 });
  cena.input.once('pointerdown', () => cena.tweens.add({ targets: setas, alpha: 0, duration: 600, delay: 1200 }));
  return estado;
}

// Botao de pausa dentro da barra da HUD, so no toque.
export function botaoPausa(cena, aoPausar) {
  const { width: l } = cena.scale;
  const t = cena.add.text(l / 2, 8, 'II', { fontFamily: FONTE, fontSize: '8px', color: '#ffd66b' })
    .setOrigin(0.5).setDepth(1001).setScrollFactor(0);
  const z = cena.add.zone(l / 2, 8, 40, 16).setInteractive().setDepth(1002).setScrollFactor(0);
  z.on('pointerdown', aoPausar);
  return t;
}


// Teclado proprio na tela, com so as letras necessarias. Evita o teclado do
// sistema, que em paisagem cobre o jogo inteiro.
export function tecladoToque(cena, letras, aoTeclar, { y = null, largura = 26, altura = 22, passo = 30 } = {}) {
  const { width: l, height: a } = cena.scale;
  const linhas = [letras.slice(0, Math.ceil(letras.length / 2)), [...letras.slice(Math.ceil(letras.length / 2)), '⌫']];
  const yBase = y ?? a - 58;
  const objetos = [];
  linhas.forEach((linha, li) => {
    const x0 = l / 2 - ((linha.length - 1) * passo) / 2;
    linha.forEach((letra, i) => {
      const x = x0 + i * passo, yy = yBase + li * (altura + 6);
      const g = cena.add.graphics().setDepth(600);
      g.fillStyle(0x2e1710, 0.9).fillRect(x - largura / 2 - 1, yy - altura / 2 - 1, largura + 2, altura + 2);
      g.fillStyle(0xf6e0b4, 0.92).fillRect(x - largura / 2, yy - altura / 2, largura, altura);
      g.fillStyle(0xe0c495, 1).fillRect(x - largura / 2, yy + altura / 2 - 3, largura, 3);
      const t = cena.add.text(x, yy - 1, letra, { fontFamily: FONTE, fontSize: '10px', color: '#7a2f14' }).setOrigin(0.5).setDepth(601);
      const z = cena.add.zone(x, yy, passo, altura + 6).setInteractive().setDepth(602);
      z.on('pointerdown', () => {
        g.setAlpha(0.5); cena.time.delayedCall(90, () => g.setAlpha(1));
        aoTeclar(letra === '⌫' ? 'Backspace' : letra);
      });
      objetos.push(g, t, z);
    });
  });
  return { destruir() { objetos.forEach((o) => o.destroy()); } };
}
