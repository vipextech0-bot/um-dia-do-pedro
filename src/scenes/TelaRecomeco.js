import { COR, PALETA, FONTE } from '../config/paleta.js';
import { criarBotao } from '../ui/Botao.js';
import { som } from '../audio/som.js';
import { progresso } from '../config/progresso.js';
import { FRASES_RECOMECO } from '../config/fases.js';
import { carregarSprites } from '../arte/sprites.js';
import { retanguloDither, circuloPixel, haloDither } from '../arte/pixel.js';

// Nunca existe game over definitivo: o jogador sempre volta ao inicio da
// mesma fase. Quarto escuro, uma luz quente entrando pela janela.
export class TelaRecomeco extends Phaser.Scene {
  constructor() { super('TelaRecomeco'); }

  create(dados) {
    // Zerar aqui e obrigatorio: a instancia da cena e reaproveitada pelo
    // Phaser, e uma flag antiga deixava o botao RECOMECAR morto.
    this.saindo = false;
    som.musica('noite');
    progresso.registrarRecomeco();

    this.fase = dados && dados.faseParaReiniciar ? dados.faseParaReiniciar : 'Fase1Acordar';
    const { width: l, height: a } = this.scale;

    carregarSprites(this);
    this.cameras.main.setBackgroundColor(0x0d0810);
    this.cameras.main.fadeIn(500, 0, 0, 0);

    const chao = a - 64;
    this.montarQuarto(l, a, chao);

    // sombra achatada, para o Pedro nao ficar flutuando sobre a tabua
    const sombra = this.add.graphics().setDepth(-10);
    sombra.fillStyle(0x000000, 0.35);
    for (let i = 0; i < 4; i++) sombra.fillRect(l / 2 - 24 + i, chao + i, 48 - i * 2, 1);

    this.add.image(l / 2 + 40, chao + 2, 'mochila').setOrigin(0.5, 1);
    this.add.image(l / 2 - 40, chao + 2, 'caneca').setOrigin(0.5, 1);

    const pedro = this.add.image(l / 2 - 4, chao + 2, 'pedroSentado').setOrigin(0.5, 1);
    this.tweens.add({
      targets: pedro, y: chao + 3, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    this.montarPoeira(l, a);

    const frase = Phaser.Utils.Array.GetRandom(FRASES_RECOMECO);
    const texto = this.add.text(l / 2, 34, frase, {
      fontFamily: FONTE, fontSize: '12px', color: COR.creme, align: 'center', lineSpacing: 10,
    }).setOrigin(0.5, 0).setAlpha(0).setShadow(0, 2, '#000000', 0);
    this.tweens.add({ targets: texto, alpha: 1, duration: 800, delay: 300 });

    const btn = criarBotao(this, l / 2, a - 30, 'RECOMECAR', () => this.recomecar(), {
      corBorda: PALETA.amarelo, corFundo: 0x4a2a18, corHover: 0x6b3f22, padX: 12, padY: 8,
    });
    btn.setAlpha(0);
    this.tweens.add({ targets: btn, alpha: 1, duration: 500, delay: 800 });

    this.input.keyboard.once('keydown-ENTER', () => this.recomecar());
    this.input.keyboard.once('keydown-SPACE', () => this.recomecar());
  }

  // Parede com rodape, assoalho de tabuas, janela com a noite la fora
  // e um poster torto. O quarto conta a historia mesmo com o Pedro parado.
  montarQuarto(l, a, chao) {
    const g = this.add.graphics().setDepth(-50);

    g.fillStyle(0x1a1018, 1).fillRect(0, 0, l, chao);
    retanguloDither(g, 0, chao - 46, l, 46, 0x1a1018, 0x261627, 0.5);

    // rodape
    g.fillStyle(0x2c1a20, 1).fillRect(0, chao - 6, l, 6);
    g.fillStyle(0x3d2630, 1).fillRect(0, chao - 6, l, 1);

    // assoalho de tabuas, com as juntas desencontradas
    g.fillStyle(0x2a1a16, 1).fillRect(0, chao, l, a - chao);
    let junta = 0;
    for (let y = chao; y < a; y += 10) {
      g.fillStyle(0x1d120f, 1).fillRect(0, y, l, 1);
      g.fillStyle(0x33211b, 1).fillRect(0, y + 1, l, 1);
      g.fillStyle(0x1d120f, 1);
      // uma unica junta por tabua, desencontrada da tabua de cima
      g.fillRect((junta % 2 ? 140 : 320), y, 1, 10);
      junta++;
    }

    this.janela(g, 56, 52, chao);

    // facho de luz da janela caindo em diagonal no chao
    const feixe = this.add.graphics().setDepth(-45).setBlendMode(Phaser.BlendModes.ADD);
    feixe.fillStyle(0xffd66b, 0.035);
    feixe.beginPath();
    feixe.moveTo(58, 54); feixe.lineTo(124, 54);
    feixe.lineTo(220, chao + 20); feixe.lineTo(100, chao + 20);
    feixe.closePath(); feixe.fillPath();
    this.tweens.add({ targets: feixe, alpha: 0.35, duration: 4000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // luz quente do poste, em volta do Pedro
    const luz = this.add.graphics().setDepth(-44).setBlendMode(Phaser.BlendModes.ADD);
    haloDither(luz, l / 2 - 2, chao - 22, 26, 70, 0xf2a04d, 3, 0.55);
    this.tweens.add({ targets: luz, alpha: 0.7, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  // Janela de quatro vidracas com a noite e algumas estrelas do lado de fora.
  janela(g, x, y, chao) {
    const larg = 70, alt = 82;
    g.fillStyle(0x120b10, 1).fillRect(x, y, larg, alt);
    g.fillStyle(0x1d2340, 1).fillRect(x + 2, y + 2, larg - 4, alt - 4);
    // estrelas
    g.fillStyle(0xffe9c9, 0.9);
    for (let i = 0; i < 18; i++) {
      g.fillRect(x + Phaser.Math.Between(4, larg - 6), y + Phaser.Math.Between(4, alt - 6), 1, 1);
    }
    // lua
    circuloPixel(g, x + larg - 16, y + 14, 6, 0xf2e3b8);
    circuloPixel(g, x + larg - 19, y + 12, 5, 0x1d2340);
    // caixilho
    g.fillStyle(0x4a3428, 1);
    g.fillRect(x + larg / 2 - 1, y + 2, 2, alt - 4);
    g.fillRect(x + 2, y + alt / 2 - 1, larg - 4, 2);
    // moldura e peitoril
    g.lineStyle(2, 0x5c412f, 1).strokeRect(x + 1, y + 1, larg - 2, alt - 2);
    g.fillStyle(0x5c412f, 1).fillRect(x - 3, y + alt, larg + 6, 3);
    g.fillStyle(0x7a5740, 1).fillRect(x - 3, y + alt, larg + 6, 1);
  }

  // Poster torto na parede: um sol nascendo, o mesmo do menu.
  poster(g, x, y) {
    const larg = 56, alt = 42;
    g.fillStyle(0x0f0910, 1).fillRect(x - 1, y - 1, larg + 2, alt + 2);
    g.fillStyle(0x3a1c2a, 1).fillRect(x, y, larg, alt);
    g.fillStyle(0x6b2f2c, 1).fillRect(x, y + alt - 10, larg, 10);
    g.fillStyle(0xc86a35, 1);
    for (let i = 0; i < 9; i++) g.fillRect(x + 8 + i, y + alt - 14 - Math.floor(Math.sqrt(20 - Math.abs(i - 4) * 4)), 1, 5);
    g.fillStyle(0xffd66b, 1).fillRect(x + 12, y + alt - 16, 10, 6);
    g.fillStyle(0x2a1a16, 0.9).fillRect(x + larg - 3, y, 3, alt);
  }

  // Poeira brilhando na luz. Detalhe barato que da vida a cena parada.
  montarPoeira(l, a) {
    for (let i = 0; i < 22; i++) {
      const p = this.add.rectangle(
        Phaser.Math.Between(l / 2 - 100, l / 2 + 100),
        Phaser.Math.Between(70, a - 60), 1, 1, 0xffd66b
      ).setAlpha(Phaser.Math.FloatBetween(0.15, 0.5));
      this.tweens.add({
        targets: p, y: p.y - Phaser.Math.Between(20, 50),
        x: p.x + Phaser.Math.Between(-8, 8),
        alpha: 0, duration: Phaser.Math.Between(4000, 9000),
        repeat: -1, delay: Phaser.Math.Between(0, 3000),
      });
    }
  }

  recomecar() {
    if (this.saindo) return;
    this.saindo = true;
    som.tocar('clique');
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(this.fase));
  }
}
