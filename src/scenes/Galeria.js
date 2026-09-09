import { carregarSprites } from '../arte/sprites.js';
import { carregarRetratos } from '../arte/retratos.js';
import { COR, FONTE } from '../config/paleta.js';

// Cena de desenvolvimento: mostra todos os sprites ampliados, lado a lado.
// Abra com ir('Galeria') no console.
export class Galeria extends Phaser.Scene {
  constructor() { super('Galeria'); }

  create() {
    carregarSprites(this);
    carregarRetratos(this);
    this.cameras.main.setBackgroundColor(0x2a2230);

    const itens = [
      ['retratoPedro', 2], ['retratoVictor', 2], ['retratoSabrina', 2],
      ['pedroEmPe', 2], ['victorEmPe', 2], ['esposa', 2], ['professor', 2], ['recepcionista', 2],
      ['pedroSentado', 2], ['pedroNoBanco', 2], ['casalBeijo', 2], ['onibusLateral', 2],
    ];
    // duas fileiras: retratos e personagens em cima, objetos embaixo
    let x = 12, y = 24, alturaFileira = 0;
    itens.forEach(([chave, escala]) => {
      const img = this.add.image(0, 0, chave).setOrigin(0, 0).setScale(escala);
      if (x + img.displayWidth > this.scale.width - 12) { x = 12; y += alturaFileira + 22; alturaFileira = 0; }
      img.setPosition(x, y);
      this.add.text(x, y + img.displayHeight + 4, chave, {
        fontFamily: FONTE, fontSize: '8px', color: COR.creme,
      });
      alturaFileira = Math.max(alturaFileira, img.displayHeight);
      x += img.displayWidth + 16;
    });
    this.add.text(this.scale.width / 2, 8, 'GALERIA DE SPRITES (dev)', {
      fontFamily: FONTE, fontSize: '8px', color: COR.amarelo,
    }).setOrigin(0.5, 0);
  }
}
