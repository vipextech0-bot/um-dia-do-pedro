import { COR, PALETA, FONTE } from '../config/paleta.js';
import { criarBotao } from '../ui/Botao.js';
import { som } from '../audio/som.js';
import { progresso } from '../config/progresso.js';
import { infoFase } from '../config/fases.js';
import { TEM_TOQUE } from '../ui/Toque.js';
import { carregarSprites } from '../arte/sprites.js';
import { carregarRetratos } from '../arte/retratos.js';
import { ceuAmanhecer, estrelas, sol, nuvem, cidade, rua, poste } from '../arte/cenario.js';

export class Menu extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    // A flag precisa ser zerada aqui: o Phaser reaproveita a instancia da
    // cena, entao um valor deixado de uma partida anterior travaria o botao.
    this.saindo = false;
    som.musica('menu');

    const { width: l, height: a } = this.scale;
    carregarSprites(this);
    carregarRetratos(this);
    this.cameras.main.fadeIn(600, 0, 0, 0);

    const horizonte = Math.round(a * 0.68);

    ceuAmanhecer(this, l, a, horizonte);
    estrelas(this, l, Math.round(a * 0.42), 44);

    this.sol = sol(this, l * 0.66, horizonte - 38, 22);
    this.tweens.add({
      targets: [this.sol, this.sol.halo], y: horizonte - 52, duration: 7000,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    this.montarNuvens(l, a);
    cidade(this, l, horizonte);
    const calcada = a - 34;
    rua(this, l, calcada, 34);
    poste(this, 56, calcada + 4, 40);

    // ponto de onibus como detalhe de primeiro plano: e onde o dia comeca
    this.add.image(l - 60, calcada + 4, 'placaPonto').setOrigin(0.5, 1).setDepth(-20);
    const pedro = this.add.image(l - 84, calcada + 6, 'pedroEmPe').setOrigin(0.5, 1).setDepth(-19);
    this.tweens.add({ targets: pedro, y: calcada + 7, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.montarTitulo(l);

    // se parou no meio do dia, da para continuar de onde estava
    const salvo = progresso.dados.fase;
    const podeContinuar = salvo && salvo !== 'Fase1Acordar' && infoFase(salvo);
    criarBotao(this, l / 2, podeContinuar ? a - 96 : a - 74, 'COMECAR O DIA', () => this.comecar(), {
      corBorda: PALETA.amarelo, corFundo: 0x8f3a1e, corHover: PALETA.laranjaEsc,
      padX: 14, padY: 9,
    });
    if (podeContinuar) {
      criarBotao(this, l / 2, a - 64, `CONTINUAR (${infoFase(salvo).numero}/7)`, () => this.continuar(salvo), {
        corBorda: PALETA.laranjaCl, corFundo: PALETA.marromEsc, corHover: PALETA.marrom, padX: 10, padY: 7,
      });
    }
    this.montarOnibusPassando(l, calcada);

    const rotuloSom = () => (som.mudo ? 'som: off (M)' : 'som: on (M)');
    const botaoSom = this.add.text(l - 6, 6, rotuloSom(), { fontFamily: FONTE, fontSize: '8px', color: COR.creme })
      .setOrigin(1, 0).setAlpha(0.7).setInteractive({ useHandCursor: true });
    botaoSom.on('pointerdown', () => { som.ligar(); som.alternarMudo(); botaoSom.setText(rotuloSom()); });
    this.input.keyboard.on('keydown-M', () => this.time.delayedCall(0, () => botaoSom.setText(rotuloSom())));

    this.add.text(l / 2, a - 16, 'A vida e um jogo. Aprenda a jogar.', {
      fontFamily: FONTE, fontSize: '8px', color: COR.creme,
    }).setOrigin(0.5).setAlpha(0.9).setShadow(0, 1, '#000000', 0);

    if (TEM_TOQUE && document.fullscreenEnabled) {
      const tc = this.add.text(6, 6, '⛶ tela cheia', { fontFamily: FONTE, fontSize: '8px', color: COR.creme })
        .setOrigin(0, 0).setAlpha(0.7).setInteractive({ useHandCursor: true });
      tc.on('pointerdown', () => { if (!this.scale.isFullscreen) this.scale.startFullscreen(); });
    }

    this.input.keyboard.once('keydown-ENTER', () => this.comecar());
    this.input.keyboard.once('keydown-SPACE', () => this.comecar());
  }

  montarNuvens(l, a) {
    const alturas = [0.28, 0.38, 0.50];
    alturas.forEach((p, i) => {
      const n = nuvem(this, Phaser.Math.Between(0, l), a * p, 1 + i * 0.25);
      n.setDepth(-70).setAlpha(0.9);
      this.tweens.add({
        targets: n, x: n.x + l + 90, duration: 52000 - i * 9000,
        repeat: -1, onRepeat: () => n.setX(-90),
      });
    });
  }

  // Titulo com contorno duplo, do jeito que logotipo de jogo 16 bits e feito:
  // uma copia escura deslocada por tras e outra bem escura embaixo.
  montarTitulo(l) {
    const texto = 'UM DIA DO PEDRO';
    const estilo = { fontFamily: FONTE, fontSize: '22px' };
    const y = 44;

    [[-2, 0], [2, 0], [0, -2], [0, 2], [-2, -2], [2, 2], [-2, 2], [2, -2]].forEach(([dx, dy]) => {
      this.add.text(l / 2 + dx, y + dy, texto, { ...estilo, color: '#2a0f14' }).setOrigin(0.5).setDepth(10);
    });
    this.add.text(l / 2, y + 4, texto, { ...estilo, color: '#8f3a1e' }).setOrigin(0.5).setDepth(11);

    this.titulo = this.add.text(l / 2, y, texto, { ...estilo, color: COR.amarelo })
      .setOrigin(0.5).setDepth(12);

    this.tweens.add({
      targets: this.titulo, alpha: 0.55, duration: 900,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  // Onibus atravessando a rua de vez em quando, atras do ponto.
  montarOnibusPassando(l, calcada) {
    const bus = this.add.image(l + 80, calcada + 4, 'onibusLateral').setOrigin(0.5, 1).setDepth(-22).setScale(1.2);
    const passar = () => {
      bus.setX(l + 80);
      this.tweens.add({ targets: bus, x: -80, duration: 5200, ease: 'Linear', onComplete: () => this.time.delayedCall(Phaser.Math.Between(7000, 12000), passar) });
    };
    this.time.delayedCall(2500, passar);
  }

  continuar(fase) {
    if (this.saindo) return;
    this.saindo = true;
    som.ligar();
    som.tocar('clique');
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('Transicao', { proxima: fase, horario: infoFase(fase).horario });
    });
  }

  comecar() {
    if (this.saindo) return;
    this.saindo = true;
    progresso.zerar();
    som.ligar();
    som.tocar('clique');
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('Transicao', { proxima: 'Fase1Acordar', horario: '07:00' });
    });
  }
}
