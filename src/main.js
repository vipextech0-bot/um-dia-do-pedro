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

// Recalcula o tamanho e a posicao do canvas depois que a pagina assenta;
// sem isso o mapeamento do mouse pode ficar com o offset da primeira medicao.
window.addEventListener('load', () => jogo.scale.refresh());
window.addEventListener('resize', () => jogo.scale.refresh());

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
