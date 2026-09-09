import { PALETA } from './config/paleta.js';
import { Menu } from './scenes/Menu.js';
import { Transicao } from './scenes/Transicao.js';
import { TelaRecomeco } from './scenes/TelaRecomeco.js';
import { Fase1Acordar } from './scenes/Fase1Acordar.js';
import { Fase2Banho } from './scenes/Fase2Banho.js';
import { Fase3Onibus } from './scenes/Fase3Onibus.js';
import { Fase4Escritorio } from './scenes/Fase4Escritorio.js';
import { Fase5Trabalho } from './scenes/Fase5Trabalho.js';
import { Fase6Faculdade } from './scenes/Fase6Faculdade.js';
import { Fase7Ligacao } from './scenes/Fase7Ligacao.js';
import { Epilogo } from './scenes/Epilogo.js';
import { Galeria } from './scenes/Galeria.js';
import { Pausa } from './scenes/Pausa.js';
import { Creditos } from './scenes/Creditos.js';

// Resolucao interna baixa e propositalmente fixa: o Phaser escala com
// nearest-neighbour, entao o jogo mantem o look 16-bits em qualquer tela.
// 480x270 da espaco para retratos de 64x64 e personagens de 48px de altura,
// ainda com o pixel bem visivel na tela. Em celulares largos (19,5:9) a
// largura logica cresce ate 540 para nao sobrar tarja preta dos lados.
export const ALTURA = 270;
const aspecto = Math.max(window.innerWidth, window.innerHeight) / Math.max(1, Math.min(window.innerWidth, window.innerHeight));
export const LARGURA = Math.round(Phaser.Math.Clamp(ALTURA * aspecto, 480, 540));

const config = {
  type: Phaser.AUTO,
  parent: 'jogo',
  width: LARGURA,
  height: ALTURA,
  backgroundColor: '#' + PALETA.preto.toString(16).padStart(6, '0'),
  pixelArt: true,
  // sem arredondar posicoes: o movimento fica continuo em vez de pular pixel a pixel
  roundPixels: false,
  fps: { target: 60, min: 30, smoothStep: true },
  render: { antialias: false, powerPreference: 'high-performance' },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    expandParent: false,
  },
  input: {
    activePointers: 3,
    mouse: { preventDefaultWheel: true, preventDefaultDown: true },
    touch: { capture: true },
  },
  disableContextMenu: true,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false },
  },
  scene: [
    Menu,
    Transicao,
    TelaRecomeco,
    Fase1Acordar,
    Fase2Banho,
    Fase3Onibus,
    Fase4Escritorio,
    Fase5Trabalho,
    Fase6Faculdade,
    Fase7Ligacao,
    Epilogo,
    Galeria,
    Pausa,
    Creditos,
  ],
};

export const jogo = new Phaser.Game(config);

// ---- Celular em pe: o jogo gira 90 graus e ocupa a tela toda ----------------
// O #jogo recebe largura = altura da tela e altura = largura da tela, e e
// girado por CSS. O Phaser continua achando que o pai esta em paisagem
// (getParentBounds trocado) e o toque e remapeado para a rotacao.
const TEM_TOQUE = ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0;
const ehRetrato = () => TEM_TOQUE && window.innerHeight > window.innerWidth && !document.fullscreenElement;

function aplicarOrientacao() {
  const el = document.getElementById('jogo');
  const retrato = ehRetrato();
  document.documentElement.classList.toggle('retrato', retrato);
  if (retrato) {
    el.style.width = window.innerHeight + 'px';
    el.style.height = window.innerWidth + 'px';
    el.style.left = window.innerWidth + 'px';
    el.style.top = '0px';
  } else {
    el.style.width = ''; el.style.height = ''; el.style.left = ''; el.style.top = '';
  }
  jogo.scale.refresh();
}

// O pai girado tem largura e altura trocadas na tela; desfaz a troca para o FIT.
jogo.scale.getParentBounds = function () {
  if (!this.parent) return false;
  const r = this.parent.getBoundingClientRect();
  let w = r.width, h = r.height;
  if (document.documentElement.classList.contains('retrato')) { const t = w; w = h; h = t; }
  if (this.parentSize.width !== w || this.parentSize.height !== h) { this.parentSize.setSize(w, h); return true; }
  return false;
};

// A centralizacao do Phaser mede o canvas ja girado; no retrato, centraliza
// pelo tamanho logico (antes da rotacao).
const centralizarOriginal = jogo.scale.updateCenter.bind(jogo.scale);
jogo.scale.updateCenter = function () {
  if (!document.documentElement.classList.contains('retrato')) return centralizarOriginal();
  const style = this.canvas.style;
  style.marginLeft = Math.floor((this.parentSize.width - this.displaySize.width) / 2) + 'px';
  style.marginTop = Math.floor((this.parentSize.height - this.displaySize.height) / 2) + 'px';
};

// Toque: na tela girada, o eixo x do jogo desce a tela e o eixo y vai da
// direita para a esquerda.
const transformarOriginal = jogo.input.transformPointer.bind(jogo.input);
jogo.input.transformPointer = function (pointer, pageX, pageY, wasMove) {
  if (!document.documentElement.classList.contains('retrato')) return transformarOriginal(pointer, pageX, pageY, wasMove);
  const b = this.scaleManager.canvasBounds;
  const s = this.scaleManager.displayScale.x;
  const x = (pageY - b.top) * s;
  const y = (b.left + b.width - pageX) * s;
  const p0 = pointer.position, p1 = pointer.prevPosition;
  p1.x = p0.x; p1.y = p0.y;
  const a = pointer.smoothFactor;
  if (!wasMove || a === 0) { p0.x = x; p0.y = y; } else { p0.x = x * a + p1.x * (1 - a); p0.y = y * a + p1.y * (1 - a); }
};

// Diagnostico na tela (abra com ?debug): mostra toque, tamanhos e audio.
if (location.search.includes('debug')) {
  const painel = document.createElement('pre');
  painel.style.cssText = 'position:fixed;left:0;top:0;z-index:99;background:rgba(0,0,0,.75);color:#0f0;font:11px monospace;padding:6px;margin:0;pointer-events:none;max-width:60vw;white-space:pre-wrap;';
  document.body.appendChild(painel);
  let ultimo = '-';
  const atualizar = () => {
    const c = jogo.canvas.getBoundingClientRect();
    const pt = jogo.input.activePointer;
    painel.textContent = [
      'ua: ' + navigator.userAgent.slice(0, 60),
      'inner: ' + innerWidth + 'x' + innerHeight + ' dpr ' + devicePixelRatio,
      'retrato: ' + document.documentElement.classList.contains('retrato') + ' toque: ' + TEM_TOQUE,
      'jogo: ' + jogo.scale.width + 'x' + jogo.scale.height + ' pai: ' + jogo.scale.parentSize.width + 'x' + jogo.scale.parentSize.height,
      'canvas: ' + [c.left, c.top, c.width, c.height].map(Math.round).join(','),
      'ultimo toque: ' + ultimo + ' -> jogo ' + Math.round(pt.x) + ',' + Math.round(pt.y),
      'cena: ' + jogo.scene.scenes.filter((s) => s.scene.isActive()).map((s) => s.scene.key).join(','),
    ].join('\n');
  };
  window.addEventListener('touchstart', (e) => { const t = e.touches[0]; ultimo = Math.round(t.pageX) + ',' + Math.round(t.pageY); }, { passive: true });
  window.addEventListener('pointerdown', (e) => { ultimo = Math.round(e.pageX) + ',' + Math.round(e.pageY); }, { passive: true });
  setInterval(atualizar, 250);
  import('./audio/som.js').then((m) => setInterval(() => { painel.textContent += '\naudio: ' + (m.som.ctx ? m.som.ctx.state : 'sem contexto') + ' mudo=' + m.som.mudo + ' trilha=' + m.som.trilha; }, 260));
}

// Rotacao e barra de endereco mudam o tamanho aos poucos: reaplica algumas vezes.
const reaplicar = () => { aplicarOrientacao(); [150, 500, 1200].forEach((ms) => setTimeout(aplicarOrientacao, ms)); };
window.addEventListener('load', reaplicar);
window.addEventListener('resize', reaplicar);
window.addEventListener('orientationchange', reaplicar);
document.addEventListener('fullscreenchange', reaplicar);
aplicarOrientacao();

// Atalho de desenvolvimento: no console, pule para qualquer cena com
//   ir('Fase5Trabalho')
window.jogo = jogo;

// Icone da aba: o retrato do Pedro, assim que a textura existir.
jogo.events.once('ready', () => {
  const tentar = () => {
    const tex = jogo.textures.get('retratoPedro');
    if (!tex || tex.key === '__MISSING') { setTimeout(tentar, 500); return; }
    const c = document.createElement('canvas');
    c.width = 64; c.height = 64;
    c.getContext('2d').drawImage(tex.getSourceImage(), 0, 0);
    let link = document.querySelector('link[rel="icon"]');
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
    link.href = c.toDataURL('image/png');
  };
  setTimeout(tentar, 800);
});

window.ir = (chave) => {
  jogo.scene.scenes.forEach((s) => s.scene.isActive() && s.scene.stop());
  jogo.scene.start(chave);
};
