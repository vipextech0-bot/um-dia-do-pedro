import { COR, PALETA, FONTE } from '../config/paleta.js';
import { criarBotao } from '../ui/Botao.js';
import { carregarRetratos } from '../arte/retratos.js';
import { molduraRetrato } from '../ui/moldura.js';
import { som } from '../audio/som.js';
import { progresso } from '../config/progresso.js';

// Creditos rolando de baixo para cima, com os retratos do elenco.
// Espaco pula direto para a tela final.
const BLOCOS = [
  { tipo: 'titulo', texto: 'UM DIA DO PEDRO' },
  { tipo: 'texto', texto: 'A vida e um jogo.\nAprenda a jogar.' },
  { tipo: 'secao', texto: 'ELENCO' },
  { tipo: 'retrato', chave: 'retratoPedro', nome: 'Pedro', papel: 'ele mesmo' },
  { tipo: 'retrato', chave: 'retratoSabrina', nome: 'Sabrina', papel: 'a inspiracao' },
  { tipo: 'retrato', chave: 'retratoVictor', nome: 'Victor Viana', papel: 'o chefe (e sogro)' },
  { tipo: 'secao', texto: 'FICHA TECNICA' },
  { tipo: 'par', chave: 'Roteiro', valor: 'Pedro Andreoli' },
  { tipo: 'par', chave: 'Codigo', valor: 'Claude' },
  { tipo: 'par', chave: 'Pixel art e musica', valor: 'feitos a mao, em codigo' },
  { tipo: 'par', chave: 'Motor', valor: 'Phaser 3' },
  { tipo: 'secao', texto: 'AGRADECIMENTOS' },
  { tipo: 'texto', texto: 'Aos onibus que chegaram.\nAos processos que encaixaram.\nAos "nao" que viraram "continua".' },
  { tipo: 'texto', texto: 'Inspiracao: ela.' },
];

export class Creditos extends Phaser.Scene {
  constructor() { super('Creditos'); }

  create() {
    this.saindo = false;
    carregarRetratos(this);
    som.musica('epilogo');
    const { width: l, height: a } = this.scale;
    this.cameras.main.setBackgroundColor(0x0d0810);
    this.cameras.main.fadeIn(800, 0, 0, 0);

    // estrelas paradas, so para a tela nao ficar chapada
    const g = this.add.graphics();
    for (let i = 0; i < 60; i++) g.fillStyle(0xffe9c9, Phaser.Math.FloatBetween(0.15, 0.6)).fillRect(Phaser.Math.Between(0, l), Phaser.Math.Between(0, a), 1, 1);

    this.rolo = this.add.container(0, a + 10);
    let y = 0;
    const d = progresso.dados;
    const n = d.recomecos || 0;
    const corte = BLOCOS.findIndex((b) => b.texto === 'AGRADECIMENTOS');
    const blocos = [
      ...BLOCOS.slice(0, corte),
      { tipo: 'secao', texto: 'SEU DIA' },
      { tipo: 'par', chave: 'Recomecos', valor: n === 0 ? 'nenhum. serio?' : `${n} - e chegou mesmo assim` },
      { tipo: 'par', chave: 'Pontualidade', valor: `${d.moedas || 0} moedas` },
      ...BLOCOS.slice(corte),
    ];
    blocos.forEach((b) => { y = this.montarBloco(b, y); });
    const alturaTotal = y;

    // rola ate o ultimo bloco sair; depois entra a tela final
    this.tween = this.tweens.add({
      targets: this.rolo, y: -alturaTotal + 20, duration: 26000, ease: 'Linear',
      onComplete: () => this.telaFinal(),
    });

    this.input.keyboard.once('keydown-SPACE', () => this.pular());
    this.input.once('pointerdown', () => this.pular());
    this.add.text(l - 6, a - 10, 'espaco: pular', { fontFamily: FONTE, fontSize: '8px', color: COR.cinza }).setOrigin(1, 0.5);
  }

  montarBloco(b, y) {
    const { width: l } = this.scale;
    const cx = l / 2;
    const add = (obj) => { this.rolo.add(obj); return obj; };
    if (b.tipo === 'titulo') {
      add(this.add.text(cx, y, b.texto, { fontFamily: FONTE, fontSize: '16px', color: COR.amarelo }).setOrigin(0.5, 0).setShadow(0, 2, '#2a0f14', 0));
      return y + 40;
    }
    if (b.tipo === 'secao') {
      add(this.add.text(cx, y + 10, b.texto, { fontFamily: FONTE, fontSize: '10px', color: COR.laranjaCl }).setOrigin(0.5, 0));
      const linha = add(this.add.rectangle(cx, y + 26, 120, 1, PALETA.laranjaEsc));
      void linha;
      return y + 44;
    }
    if (b.tipo === 'texto') {
      const t = add(this.add.text(cx, y, b.texto, { fontFamily: FONTE, fontSize: '8px', color: COR.creme, align: 'center', lineSpacing: 6 }).setOrigin(0.5, 0));
      return y + t.height + 22;
    }
    if (b.tipo === 'par') {
      add(this.add.text(cx - 8, y, b.chave, { fontFamily: FONTE, fontSize: '8px', color: COR.laranjaCl }).setOrigin(1, 0));
      add(this.add.text(cx + 8, y, b.valor, { fontFamily: FONTE, fontSize: '8px', color: COR.creme }).setOrigin(0, 0));
      return y + 18;
    }
    if (b.tipo === 'retrato') {
      const mg = this.add.graphics();
      molduraRetrato(mg, cx - 100, y, 74);
      add(mg);
      add(this.add.image(cx - 63, y + 37, b.chave));
      add(this.add.text(cx - 14, y + 22, b.nome, { fontFamily: FONTE, fontSize: '10px', color: COR.amarelo }).setOrigin(0, 0));
      add(this.add.text(cx - 14, y + 40, b.papel, { fontFamily: FONTE, fontSize: '8px', color: COR.creme }).setOrigin(0, 0));
      return y + 92;
    }
    return y;
  }

  pular() {
    if (this.tween && this.tween.isPlaying()) { this.tween.stop(); this.telaFinal(); }
  }

  telaFinal() {
    if (this.final) return;
    this.final = true;
    const { width: l, height: a } = this.scale;
    this.tweens.add({ targets: this.rolo, alpha: 0, duration: 500 });

    const frase = this.add.text(l / 2, a / 2 - 36, 'A vida e um jogo.\nObrigado por jogar comigo.', {
      fontFamily: FONTE, fontSize: '12px', color: COR.amarelo, align: 'center', lineSpacing: 10,
    }).setOrigin(0.5).setAlpha(0).setShadow(0, 2, '#2a0f14', 0);
    this.tweens.add({ targets: frase, alpha: 1, duration: 900, delay: 400 });

    const btn = criarBotao(this, l / 2, a / 2 + 26, 'JOGAR DE NOVO', () => this.reiniciar(), {
      corBorda: PALETA.amarelo, corFundo: PALETA.laranjaEsc, corHover: PALETA.laranja, padX: 12, padY: 8,
    }).setAlpha(0);
    this.tweens.add({ targets: btn, alpha: 1, duration: 600, delay: 1400 });
    this.input.keyboard.once('keydown-ENTER', () => this.reiniciar());
  }

  reiniciar() {
    if (this.saindo) return;
    this.saindo = true;
    som.tocar('clique');
    progresso.zerar();
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Menu'));
  }
}
