import { FaseBase } from './FaseBase.js';
import { pontoOnibusNoite } from '../arte/cenarios.js';
import { carregarSprites } from '../arte/sprites.js';
import { Dialogo } from '../ui/Dialogo.js';
import { COR, FONTE } from '../config/paleta.js';
import { som } from '../audio/som.js';

// FASE 7 — A ligacao, 21:50. Cena narrativa, sem derrota.
// Pedro no ponto de onibus, celular na mao, ligando para ela.
const FALAS = [
  'Oi, meu amor. Acabei a aula agora.',
  'Foi um dia longo. Acordei atrasado, o onibus quase nao chegou, o Victor me olhou torto, foram dez processos e uma aula inteira.',
  'Mas sabe o que eu pensei o dia todo? Que tudo isso vale a pena. Vale a pena por causa de voce. Por causa da vida que eu quero construir com voce.',
  'A vida e so um jogo. Dificil, as vezes injusto, cheio de fase que a gente perde. Mas quem aprende a jogar, quem nao desiste na tela de recomeco, esse chega la.',
  'Eu vou chegar la. Por nos.',
];

export class Fase7Ligacao extends FaseBase {
  constructor() { super('Fase7Ligacao'); }

  iniciar() {
    carregarSprites(this);
    this.cenario = pontoOnibusNoite(this);
    const { banco } = this.cenario;

    this.pedro = this.add.image(banco.x, banco.y, 'pedroNoBanco').setOrigin(0.5, 1).setDepth(10);
    this.tweens.add({ targets: this.pedro, y: banco.y + 1, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // luz do celular no rosto
    const luz = this.add.graphics().setDepth(11).setBlendMode(Phaser.BlendModes.ADD);
    luz.fillStyle(0xbfe4ff, 0.10).fillCircle(banco.x + 10, banco.y - 36, 12);
    this.tweens.add({ targets: luz, alpha: 0.6, duration: 900, yoyo: true, repeat: -1 });

    this.vagalumes();

    this.dialogo = new Dialogo(this, { velocidade: 34 });
    this.time.delayedCall(1200, () => {
      const falas = FALAS.map((texto) => ({ quem: 'Pedro', retrato: 'pedro', texto }));
      falas.push({ quem: 'Sabrina', retrato: 'sabrina', texto: 'Eu sei que vai. Vem pra casa. Eu te espero.' });
      this.dialogo.mostrar(falas, () => this.encerrar());
    });
  }

  vagalumes() {
    const { width: l } = this.scale;
    for (let i = 0; i < 8; i++) {
      const v = this.add.rectangle(Phaser.Math.Between(20, l - 20), Phaser.Math.Between(120, 200), 1, 1, 0xffe9a0).setDepth(5).setAlpha(0);
      this.tweens.add({
        targets: v, alpha: { from: 0, to: 0.9 }, y: v.y - Phaser.Math.Between(6, 14), x: v.x + Phaser.Math.Between(-10, 10),
        duration: Phaser.Math.Between(1800, 3200), yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 2500),
      });
    }
  }

  encerrar() {
    this.dialogo.esconder();
    const { width: l, height: a } = this.scale;
    // o onibus chega, para no ponto e o Pedro entra
    const { chao } = this.cenario;
    const bus = this.add.image(l + 80, chao + 30, 'onibusLateral').setOrigin(0.5, 1).setDepth(20).setScale(1.5);
    const farol = this.add.graphics().setDepth(19).setBlendMode(Phaser.BlendModes.ADD);
    farol.fillStyle(0xffd66b, 0.12).fillTriangle(0, 0, -90, -14, -90, 14);
    this.tweens.add({ targets: bus, x: this.pedro.x + 40, duration: 2600, ease: 'Quad.easeOut', onUpdate: () => farol.setPosition(bus.x - 52, bus.y - 12) });
    this.time.delayedCall(2700, () => {
      som.tocar('passo');
      this.tweens.add({ targets: this.pedro, alpha: 0, duration: 500 });
      farol.destroy();
    });
    const escuro = this.add.rectangle(0, 0, l, a, 0x000000, 0).setOrigin(0, 0).setDepth(80);
    const t = this.add.text(l / 2, a / 2, '10 anos depois...', { fontFamily: FONTE, fontSize: '12px', color: COR.creme })
      .setOrigin(0.5).setDepth(81).setAlpha(0);
    this.tweens.add({ targets: escuro, fillAlpha: 1, duration: 2200, delay: 2400 });
    this.tweens.add({ targets: t, alpha: 1, duration: 900, delay: 4800 });
    this.time.delayedCall(7600, () => {
      this.finalizada = true;
      this.scene.start('Epilogo');
    });
  }
}
