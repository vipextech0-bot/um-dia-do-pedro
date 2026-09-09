import { COR, PALETA, FONTE } from '../config/paleta.js';
import { criarBotao } from '../ui/Botao.js';
import { carregarSprites } from '../arte/sprites.js';
import { faixaDither, retanguloDither, circuloPixel, haloDither } from '../arte/pixel.js';
import { som } from '../audio/som.js';
import { progresso } from '../config/progresso.js';

// EPILOGO — 2036. Mesma paleta, em dourado. Varanda de uma casa ampla ao
// por do sol, Pedro adulto ao lado da esposa; pela janela, dois monitores
// com o logo da VipexTech e o diploma na parede.
let LINHAS = [
  'Ele acordou cedo por dez anos.',
  'Pegou o onibus ate poder escolher nao pegar.',
  'Encaixou processo, digitou codigo, ouviu "nao" e continuou.',
  'Nunca desistiu na tela de recomeco.',
  '',
  'E deu certo.',
];

export class Epilogo extends Phaser.Scene {
  constructor() { super('Epilogo'); }

  create() {
    this.saindo = false; // a instancia da cena e reaproveitada pelo Phaser
    carregarSprites(this);
    som.musica('epilogo');
    const { width: l, height: a } = this.scale;
    this.cameras.main.setBackgroundColor(0x2a1a10);
    this.cameras.main.fadeIn(1400, 0, 0, 0);

    this.montarVaranda(l, a);

    const chao = a - 52;
    this.pedro = this.add.image(l / 2 - 16, chao, 'pedroAdulto').setOrigin(0.5, 1).setDepth(10);
    this.esposa = this.add.image(l / 2 + 14, chao, 'esposa').setOrigin(0.5, 1).setDepth(10);
    [this.pedro, this.esposa].forEach((s, i) => {
      this.tweens.add({ targets: s, y: chao + 1, duration: 1500 + i * 200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });

    this.montarCachorros(chao);

    // a quarta linha e sobre voce: quantas vezes recomecou hoje
    const n = progresso.dados.recomecos || 0;
    LINHAS[3] = n > 0 ? `Recomecou ${n} ${n === 1 ? 'vez' : 'vezes'}. Nunca desistiu.` : 'Nunca desistiu na tela de recomeco.';

    this.textos = [];
    this.mostrarLinhas(() => this.time.delayedCall(1200, () => this.beijo(() => this.irParaCreditos())));
  }

  // Dois cachorros na varanda: um deitado perto do casal abanando o rabo,
  // outro correndo de um lado para o outro.
  montarCachorros(chao) {
    const { width: l } = this.scale;
    this.dourado = this.add.image(l / 2 + 52, chao, 'cachorroDourado0').setOrigin(0.5, 1).setDepth(9);
    this.escuro = this.add.image(90, chao, 'cachorroEscuro0').setOrigin(0.5, 1).setDepth(9);
    let q = 0;
    this.time.addEvent({ delay: 220, loop: true, callback: () => {
      q = 1 - q;
      this.dourado.setTexture('cachorroDourado' + q);
      this.escuro.setTexture('cachorroEscuro' + q);
    } });
    // o escuro corre entre a coluna e o casal
    const correr = () => {
      const destino = this.escuro.x < 150 ? 200 : 60;
      this.escuro.setFlipX(destino < this.escuro.x);
      this.tweens.add({ targets: this.escuro, x: destino, duration: 2200, ease: 'Sine.easeInOut', onComplete: () => this.time.delayedCall(Phaser.Math.Between(600, 1800), correr) });
    };
    this.time.delayedCall(1500, correr);
  }

  // Pedro se vira para ela e os dois se beijam; os cachorros pulam em volta.
  beijo(depois) {
    const { width: l } = this.scale;
    const chao = this.pedro.y;
    this.tweens.killTweensOf([this.pedro, this.esposa]);
    this.pedro.setFlipX(false);
    this.tweens.add({ targets: this.pedro, x: this.esposa.x - 14, duration: 600, ease: 'Sine.easeInOut', onComplete: () => {
      this.pedro.setVisible(false); this.esposa.setVisible(false);
      const casal = this.add.image(this.esposa.x - 6, chao, 'casalBeijo').setOrigin(0.5, 1).setDepth(10);
      this.tweens.add({ targets: casal, y: chao + 1, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      som.tocar('vida');
      // coracoes subindo
      for (let i = 0; i < 7; i++) {
        this.time.delayedCall(i * 260, () => {
          const c = this.add.text(casal.x + Phaser.Math.Between(-14, 14), chao - 56, '♥', { fontFamily: FONTE, fontSize: '8px', color: '#ff8a7a' }).setOrigin(0.5).setDepth(12);
          this.tweens.add({ targets: c, y: c.y - Phaser.Math.Between(24, 40), alpha: 0, duration: 1400, onComplete: () => c.destroy() });
        });
      }
      // cachorros pulando de alegria
      [this.dourado, this.escuro].forEach((d, i) => {
        this.tweens.killTweensOf(d);
        this.tweens.add({ targets: d, x: casal.x + (i ? -38 : 40), duration: 500, ease: 'Sine.easeInOut' });
        this.tweens.add({ targets: d, y: chao - 8, duration: 220, yoyo: true, repeat: 5, delay: 500 + i * 110, ease: 'Quad.easeOut' });
      });
      this.time.delayedCall(2600, depois);
    } });
  }

  montarVaranda(l, a) {
    const g = this.add.graphics().setDepth(-100);
    const chao = a - 52;
    // ceu dourado do por do sol
    faixaDither(g, 0, 0, l, chao - 30, 0xc86a35, 0xffd66b, 6);
    const halo = this.add.graphics().setDepth(-99).setBlendMode(Phaser.BlendModes.ADD);
    haloDither(halo, 120, chao - 60, 18, 60, 0xffd66b, 6, 1.4);
    circuloPixel(g, 120, chao - 60, 18, 0xffe27a);
    circuloPixel(g, 120, chao - 62, 12, 0xfff0b8);
    // morros ao longe
    [[0x8a4a24, 40], [0x6b3f22, 24]].forEach(([cor, alt], i) => {
      g.fillStyle(cor, 1);
      for (let x = -20; x < l + 20; x += 6) {
        const h = alt + Math.sin(x / (50 + i * 30)) * (alt / 2) + Math.cos(x / 17) * 4;
        g.fillRect(x, chao - 30 - h, 6, h + 30);
      }
    });

    // parede da casa, a direita, com janela para o escritorio
    g.fillStyle(0xd9b98c, 1).fillRect(270, 0, l - 270, chao);
    retanguloDither(g, 270, 0, l - 270, chao, 0xd9b98c, 0xc9a578, 0.35);
    g.fillStyle(0x8f5a2e, 1).fillRect(270, 0, 6, chao);
    const jx = 300, jy = 36, jl = 140, ja = 100;
    g.fillStyle(0x6b4a34, 1).fillRect(jx - 5, jy - 5, jl + 10, ja + 10);
    g.fillStyle(0x2a1f2e, 1).fillRect(jx, jy, jl, ja);
    // dentro: dois monitores com o logo da VipexTech e o diploma na parede
    g.fillStyle(0x3a2a3f, 1).fillRect(jx, jy, jl, ja);
    g.fillStyle(0x6b4526, 1).fillRect(jx, jy + 66, jl, 6);        // mesa
    [jx + 20, jx + 76].forEach((mx) => {
      g.fillStyle(0x1c1c22, 1).fillRect(mx, jy + 34, 44, 32);
      g.fillStyle(0x14203a, 1).fillRect(mx + 2, jy + 36, 40, 26);
      // logo "V" da VipexTech
      g.fillStyle(0x5fbf6a, 1);
      for (let i = 0; i < 8; i++) { g.fillRect(mx + 10 + i, jy + 40 + i * 2, 3, 2); g.fillRect(mx + 30 - i, jy + 40 + i * 2, 3, 2); }
      g.fillStyle(0xffd66b, 1).fillRect(mx + 8, jy + 58, 28, 1);
      g.fillStyle(0x1c1c22, 1).fillRect(mx + 20, jy + 66, 6, 2);
    });
    const luz = this.add.graphics().setDepth(-95).setBlendMode(Phaser.BlendModes.ADD);
    haloDither(luz, jx + 70, jy + 50, 10, 40, 0x7aa8bf, 4, 0.5);
    // diploma
    g.fillStyle(0xa8865c, 1).fillRect(jx + 50, jy + 6, 40, 24);
    g.fillStyle(0xf2e6cc, 1).fillRect(jx + 52, jy + 8, 36, 20);
    g.fillStyle(0x8a7050, 1);
    for (let i = 0; i < 3; i++) g.fillRect(jx + 56, jy + 12 + i * 4, 28, 1);
    g.fillStyle(0xa83a32, 1).fillRect(jx + 78, jy + 20, 6, 6);
    // caixilho
    g.fillStyle(0x6b4a34, 1).fillRect(jx + jl / 2 - 2, jy, 4, ja).fillRect(jx, jy + ja / 2 - 2, jl, 4);
    g.fillStyle(0xffffff, 0.12).fillRect(jx + 6, jy + 4, 8, ja - 8);

    // varanda: piso de madeira, guarda-corpo e colunas
    g.fillStyle(0x6b4526, 1).fillRect(0, chao, l, a - chao);
    for (let y = chao; y < a; y += 8) g.fillStyle(0x40260f, 1).fillRect(0, y, l, 1);
    g.fillStyle(0x8f5a2e, 1).fillRect(0, chao - 2, l, 3);
    // guarda-corpo (atras dos personagens)
    g.fillStyle(0x8f5a2e, 1).fillRect(0, chao - 30, 270, 4);
    for (let x = 6; x < 270; x += 14) g.fillStyle(0x6b4526, 1).fillRect(x, chao - 26, 3, 26);
    g.fillStyle(0xb5763c, 1).fillRect(0, chao - 30, 270, 1);
    // colunas
    [12, 258].forEach((x) => {
      g.fillStyle(0xe8cb9a, 1).fillRect(x, 0, 12, chao);
      g.fillStyle(0xc9a578, 1).fillRect(x + 9, 0, 3, chao);
    });
    // vaso de planta e luminaria de parede
    g.fillStyle(0x8a3a1e, 1).fillRect(40, chao - 14, 16, 14);
    g.fillStyle(0x2f6b3a, 1).fillRect(36, chao - 34, 24, 22);
    g.fillStyle(0x3f8a4a, 1).fillRect(40, chao - 38, 16, 12);
    g.fillStyle(0xffd66b, 1).fillRect(455, 40, 10, 6);
    const luzParede = this.add.graphics().setDepth(-95).setBlendMode(Phaser.BlendModes.ADD);
    haloDither(luzParede, 460, 44, 4, 28, 0xffd66b, 4, 0.9);
  }

  // As linhas aparecem uma por uma, no alto, sobre o ceu.
  mostrarLinhas(depois) {
    const { width: l } = this.scale;
    this.painelLinhas = this.add.graphics().setDepth(20);
    let y = 34;
    LINHAS.forEach((linha, i) => {
      const t = this.add.text(l / 2, y, linha, { fontFamily: FONTE, fontSize: '8px', color: COR.creme, align: 'center', wordWrap: { width: l - 80 }, lineSpacing: 4 })
        .setOrigin(0.5, 0).setDepth(21).setAlpha(0).setShadow(0, 1, '#000000', 0);
      if (i === LINHAS.length - 1) t.setColor(COR.amarelo).setFontSize(10);
      y += (linha ? t.height : 4) + 6;
      this.textos.push(t);
      this.time.delayedCall(1400 + i * 1700, () => {
        this.tweens.add({ targets: t, alpha: 1, duration: 700 });
        if (i === LINHAS.length - 1) this.time.delayedCall(900, depois);
      });
    });
    this.painelLinhas.fillStyle(0x000000, 0.45).fillRect(20, 24, l - 40, y - 24);
  }

  irParaCreditos() {
    if (this.saindo) return;
    this.saindo = true;
    this.tweens.add({ targets: [this.painelLinhas, ...this.textos], alpha: 0, duration: 600 });
    this.time.delayedCall(1800, () => {
      this.cameras.main.fadeOut(1400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Creditos'));
    });
  }

  telaFinal() {
    const { width: l, height: a } = this.scale;
    // Pedro se vira para a camera
    this.tweens.add({ targets: [this.painelLinhas, ...this.textos], alpha: 0, duration: 800 });
    const escuro = this.add.rectangle(0, 0, l, a, 0x000000, 0).setOrigin(0, 0).setDepth(50);
    this.tweens.add({ targets: escuro, fillAlpha: 0.8, duration: 1500 });

    const frase = this.add.text(l / 2, 70, 'A vida e um jogo.\nObrigado por jogar comigo.', {
      fontFamily: FONTE, fontSize: '12px', color: COR.amarelo, align: 'center', lineSpacing: 10,
    }).setOrigin(0.5).setDepth(60).setAlpha(0);
    this.tweens.add({ targets: frase, alpha: 1, duration: 1000, delay: 1400 });

    const btn = criarBotao(this, l / 2, 128, 'JOGAR DE NOVO', () => this.reiniciar(), {
      corBorda: PALETA.amarelo, corFundo: PALETA.laranjaEsc, corHover: PALETA.laranja, padX: 12, padY: 8,
    }).setDepth(60).setAlpha(0);
    this.tweens.add({ targets: btn, alpha: 1, duration: 600, delay: 2600 });
    this.input.keyboard.once('keydown-ENTER', () => this.reiniciar());

    // creditos rolando de baixo para cima
    const creditos = this.add.text(l / 2, a + 10, 'Roteiro: Pedro Andreoli\n\nCodigo: Claude\n\nInspiracao: ela.', {
      fontFamily: FONTE, fontSize: '8px', color: COR.creme, align: 'center', lineSpacing: 8,
    }).setOrigin(0.5, 0).setDepth(60);
    this.tweens.add({ targets: creditos, y: 168, duration: 5000, delay: 3000, ease: 'Linear' });
  }

  reiniciar() {
    if (this.saindo) return;
    this.saindo = true;
    som.tocar('clique');
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Menu'));
  }
}
