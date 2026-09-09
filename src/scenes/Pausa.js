import { COR, PALETA, FONTE } from '../config/paleta.js';
import { caixaPergaminho, TEMA_PERGAMINHO } from '../ui/moldura.js';
import { criarBotao } from '../ui/Botao.js';
import { som } from '../audio/som.js';

// Sobreposicao de pausa. Roda por cima da fase pausada e devolve o controle
// ao fechar. Esc ou Enter continuam; o botao MENU abandona o dia.
export class Pausa extends Phaser.Scene {
  constructor() { super('Pausa'); }

  create(dados) {
    this.de = dados.de;
    const { width: l, height: a } = this.scale;
    this.add.rectangle(0, 0, l, a, 0x000000, 0.55).setOrigin(0, 0);

    const g = this.add.graphics();
    caixaPergaminho(g, l / 2 - 90, a / 2 - 52, 180, 104);
    this.add.text(l / 2, a / 2 - 36, 'PAUSA', { fontFamily: FONTE, fontSize: '12px', color: TEMA_PERGAMINHO.nome }).setOrigin(0.5);
    this.add.text(l / 2, a / 2 - 18, som.mudo ? 'som: desligado (M)' : 'som: ligado (M)', { fontFamily: FONTE, fontSize: '8px', color: TEMA_PERGAMINHO.texto })
      .setOrigin(0.5).setName('som');

    criarBotao(this, l / 2, a / 2 + 6, 'CONTINUAR', () => this.continuar(), {
      corBorda: PALETA.amarelo, corFundo: PALETA.laranjaEsc, corHover: PALETA.laranja, padX: 12, padY: 7,
    });
    criarBotao(this, l / 2, a / 2 + 32, 'MENU', () => this.menu(), {
      corBorda: PALETA.marrom, corFundo: PALETA.marromEsc, corHover: PALETA.marrom, padX: 12, padY: 6,
    });

    // Esc e a tecla que abriu: um pequeno atraso evita fechar no mesmo toque
    this.time.delayedCall(200, () => {
      this.input.keyboard.on('keydown-ESC', () => this.continuar());
      this.input.keyboard.on('keydown-ENTER', () => this.continuar());
      this.input.keyboard.on('keydown-M', () => {
        this.children.getByName('som').setText(som.mudo ? 'som: desligado (M)' : 'som: ligado (M)');
      });
    });
  }

  continuar() {
    som.tocar('clique');
    this.scene.resume(this.de);
    this.scene.stop();
  }

  menu() {
    som.tocar('clique');
    som.musica(null);
    this.scene.stop(this.de);
    this.scene.stop();
    this.scene.start('Menu');
  }
}
