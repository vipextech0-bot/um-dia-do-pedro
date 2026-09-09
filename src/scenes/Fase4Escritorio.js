import { FaseBase } from './FaseBase.js';
import { escritorio } from '../arte/cenarios.js';
import { carregarSprites } from '../arte/sprites.js';
import { Dialogo } from '../ui/Dialogo.js';

// FASE 4 — Chegada no escritorio, 08:00.
// Cena narrativa: nao existe derrota, qualquer escolha avanca. O que muda
// e so a resposta do Victor, que e chefe no escritorio e sogro em casa.
export class Fase4Escritorio extends FaseBase {
  constructor() { super('Fase4Escritorio'); }

  iniciar() {
    carregarSprites(this);
    this.cenario = escritorio(this);

    const chao = this.cenario.chao;

    // Victor esperando na porta, de bracos cruzados.
    this.victor = this.add.image(196, chao, 'victorEmPe').setOrigin(0.5, 1).setDepth(10);
    this.sombra(196, chao, 24);

    // Pedro entrando pela esquerda.
    this.pedro = this.add.image(this.cenario.porta.x, chao, 'pedroEmPe').setOrigin(0.5, 1).setDepth(10).setAlpha(0);
    this.sombraPedro = this.sombra(this.cenario.porta.x, chao, 22);
    this.tweens.add({ targets: this.pedro, alpha: 1, duration: 300 });

    // recepcionista atras do balcao, digitando devagar; cafe fumegando
    const { balcao } = this.cenario;
    const recep = this.add.image(balcao.x + 60, balcao.y + 2, 'recepcionista').setOrigin(0.5, 1).setDepth(8);
    this.tweens.add({ targets: recep, y: balcao.y + 3, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.time.addEvent({ delay: 700, loop: true, callback: () => {
      if (this.finalizada) return;
      const v = this.add.graphics().setDepth(9).setBlendMode(Phaser.BlendModes.ADD);
      v.fillStyle(0xffffff, 0.12).fillCircle(0, 0, 2);
      v.setPosition(balcao.x + 20 + Phaser.Math.Between(-2, 2), balcao.y - 8);
      this.tweens.add({ targets: v, y: v.y - 14, x: v.x + 3, alpha: 0, scale: 2, duration: 1400, onComplete: () => v.destroy() });
    } });
    // Victor impaciente: bate o pe de vez em quando
    this.time.addEvent({ delay: 2600, loop: true, callback: () => {
      if (this.finalizada) return;
      this.tweens.add({ targets: this.victor, y: this.victor.y - 1, duration: 70, yoyo: true, repeat: 3 });
    } });

    this.dialogo = new Dialogo(this);

    // entrada do Pedro: anda ate parar na frente do chefe
    this.andar(this.pedro, 244, 1900, () => this.abrirConversa());
  }

  sombra(x, y, largura) {
    const g = this.add.graphics().setDepth(9);
    g.fillStyle(0x000000, 0.3);
    for (let i = 0; i < 3; i++) g.fillRect(x - largura / 2 + i, y - 2 + i, largura - i * 2, 1);
    return g;
  }

  // Caminhada simples: desloca o sprite e faz um sobe-e-desce de 1px,
  // que ja basta para ler como passo em pixel art.
  andar(alvo, destino, duracao, aoChegar) {
    const yBase = alvo.y;
    alvo.setFlipX(destino < alvo.x);
    const passo = this.tweens.add({
      targets: alvo, y: yBase - 1, duration: 130, yoyo: true, repeat: -1,
    });
    this.tweens.add({
      targets: alvo, x: destino, duration: duracao, ease: 'Linear',
      onUpdate: () => {
        if (this.sombraPedro && alvo === this.pedro) {
          this.sombraPedro.setX(alvo.x + 11);
        }
      },
      onComplete: () => { passo.remove(); alvo.setY(yBase); aoChegar && aoChegar(); },
    });
  }

  abrirConversa() {
    this.dialogo.mostrar(
      [{ quem: 'Victor', retrato: 'victor', texto: 'Bom dia, Pedro. Sete e meia era o combinado.' }],
      () => this.oferecerRespostas()
    );
  }

  oferecerRespostas() {
    this.dialogo.perguntar([
      {
        rotulo: 'Bom dia. O onibus atrasou.',
        aoEscolher: () => this.responder(
          [
            { quem: 'Pedro', retrato: 'pedro', texto: 'Bom dia, Victor. O onibus atrasou, mas ja estou na cadeira.' },
            { quem: 'Victor', retrato: 'victor', texto: '(sorri de lado) Vai trabalhar, genro.' },
          ]
        ),
      },
      {
        rotulo: 'Desculpa, sogro.',
        aoEscolher: () => this.responder(
          [
            { quem: 'Pedro', retrato: 'pedro', texto: 'Desculpa, sogro.' },
            { quem: 'Victor', retrato: 'victor', texto: 'No escritorio sou chefe. Em casa sou sogro. Senta.' },
          ]
        ),
      },
      {
        rotulo: '(ficar em silencio)',
        aoEscolher: () => this.responder(
          [
            { quem: 'Pedro', retrato: 'pedro', texto: '...' },
            { quem: 'Victor', retrato: 'victor', texto: '...Senta ai, vai.' },
          ]
        ),
      },
    ]);
  }

  responder(falas) {
    this.dialogo.mostrar(falas, () => this.irParaMesa());
  }

  // Pedro atravessa a recepcao e senta: e a deixa para a fase do trabalho.
  irParaMesa() {
    this.dialogo.esconder();
    this.andar(this.pedro, 60, 2200, () => {
      this.time.delayedCall(400, () => this.venceu({ legenda: 'Pedro abre o notebook.' }));
    });
  }
}
