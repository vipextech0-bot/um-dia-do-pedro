import { COR, PALETA, FONTE } from '../config/paleta.js';
import { infoFase } from '../config/fases.js';

// Corte seco: fundo preto + relogio pixelado com o horario da proxima cena.
export class Transicao extends Phaser.Scene {
  constructor() { super('Transicao'); }

  create(dados) {
    this.proxima = dados.proxima;
    const { width: l, height: a } = this.scale;
    const cx = l / 2;
    const cy = a / 2 - 6;

    this.cameras.main.setBackgroundColor(PALETA.preto);

    if (dados.horario) this.desenharRelogio(cx, cy, dados.horario);
    const info = infoFase(this.proxima);
    if (info) {
      this.add.text(cx, cy + 46, info.titulo.toUpperCase(), {
        fontFamily: FONTE, fontSize: '10px', color: COR.creme,
      }).setOrigin(0.5, 0).setAlpha(0.85);
    }
    if (dados.legenda) {
      this.add.text(cx, cy + 66, dados.legenda, {
        fontFamily: FONTE, fontSize: '8px', color: COR.laranjaCl, align: 'center', lineSpacing: 6,
      }).setOrigin(0.5, 0).setAlpha(0).setName('legenda');
      this.tweens.add({ targets: this.children.getByName('legenda'), alpha: 1, duration: 300, delay: 300 });
    }

    this.cameras.main.fadeIn(260, 0, 0, 0);
    this.time.delayedCall(dados.horario ? 1500 : 700, () => {
      this.cameras.main.fadeOut(260, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(this.proxima));
    });
  }

  // Relogio quadrado, estilo despertador de pixel art.
  desenharRelogio(cx, cy, horario) {
    const g = this.add.graphics();
    const lg = 128, al = 60;
    const x = cx - lg / 2, y = cy - al / 2;

    g.fillStyle(PALETA.marromEsc, 1).fillRect(x - 4, y - 4, lg + 8, al + 8);
    g.fillStyle(PALETA.laranja, 1).fillRect(x - 2, y - 2, lg + 4, al + 4);
    g.fillStyle(0x0d0a12, 1).fillRect(x, y, lg, al);

    // pezinhos e "orelhas" de despertador
    g.fillStyle(PALETA.marrom, 1);
    g.fillRect(x + 8, y + al + 4, 12, 7);
    g.fillRect(x + lg - 20, y + al + 4, 12, 7);
    g.fillRect(x + 6, y - 12, 16, 8);
    g.fillRect(x + lg - 22, y - 12, 16, 8);
    // sininhos do despertador
    g.fillStyle(PALETA.laranjaCl, 1);
    g.fillRect(x + 8, y - 14, 12, 4);
    g.fillRect(x + lg - 20, y - 14, 12, 4);

    const texto = this.add.text(cx, cy, horario, {
      fontFamily: FONTE, fontSize: '22px', color: COR.amarelo,
    }).setOrigin(0.5);

    // dois-pontos piscando
    this.time.addEvent({
      delay: 500, loop: true,
      callback: () => texto.setText(texto.text.includes(':') ? horario.replace(':', ' ') : horario),
    });
  }
}
