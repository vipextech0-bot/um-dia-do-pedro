import { COR, PALETA, FONTE } from '../config/paleta.js';

// HUD fixa: relogio do dia na esquerda, fase atual na direita.
// Nao e uma cena separada; e criada dentro de cada fase para viver e morrer junto dela.
export class HUD {
  constructor(cena, { horario, numero, total }) {
    this.cena = cena;
    const l = cena.scale.width;

    this.fundo = cena.add.rectangle(0, 0, l, 16, PALETA.preto, 0.72).setOrigin(0, 0);
    this.linha = cena.add.rectangle(0, 16, l, 1, PALETA.marrom).setOrigin(0, 0);

    this.relogio = cena.add.text(6, 5, horario, {
      fontFamily: FONTE, fontSize: '8px', color: COR.amarelo,
    });

    this.contador = cena.add.text(l - 6, 5, `${numero}/${total}`, {
      fontFamily: FONTE, fontSize: '8px', color: COR.laranjaCl,
    }).setOrigin(1, 0);

    this.elementos = [this.fundo, this.linha, this.relogio, this.contador];
    this.elementos.forEach((e) => e.setScrollFactor(0).setDepth(1000));
  }

  setHorario(texto) {
    this.relogio.setText(texto);
  }

  // Pisca o relogio, usado quando o horario pula (ex.: fim do expediente).
  destacarRelogio() {
    this.cena.tweens.add({
      targets: this.relogio, alpha: 0.15, duration: 120, yoyo: true, repeat: 4,
    });
  }

  destruir() {
    this.elementos.forEach((e) => e.destroy());
  }
}
