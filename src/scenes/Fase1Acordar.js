import { FaseBase } from './FaseBase.js';
import { quarto } from '../arte/cenarios.js';
import { carregarSprites } from '../arte/sprites.js';
import { retRedondo, caixaPergaminho, TEMA_PERGAMINHO } from '../ui/moldura.js';
import { COR, PALETA, FONTE } from '../config/paleta.js';
import { circuloPixel } from '../arte/pixel.js';
import { som } from '../audio/som.js';
import { TEM_TOQUE, botaoToque, vibrar } from '../ui/Toque.js';

// FASE 1 — Acordar, 07:00.
// Quick-time event: a barra de sono enche sozinha; o jogador aperta a tecla
// mostrada. 5 acertos seguidos = Pedro levanta. Errar vira o Pedro na cama
// e acelera a barra. Barra cheia = dormiu de novo e perdeu o onibus.

const TECLAS = [
  { codigo: 'ArrowUp',    rotulo: '▲' },
  { codigo: 'ArrowDown',  rotulo: '▼' },
  { codigo: 'ArrowLeft',  rotulo: '◀' },
  { codigo: 'ArrowRight', rotulo: '▶' },
  ...'ASDFJKL'.split('').map((l) => ({ codigo: 'Key' + l, rotulo: l })),
];

const ACERTOS_PARA_VENCER = 5;
const SEGUNDOS_BASE = 9;        // tempo para a barra encher sem nenhum erro
const ACELERACAO_ERRO = 1.4;    // multiplicador da velocidade a cada erro
const ALIVIO_ACERTO = 0.07;     // quanto da barra cada acerto devolve

export class Fase1Acordar extends FaseBase {
  constructor() { super('Fase1Acordar'); }

  iniciar() {
    carregarSprites(this);
    this.cenario = quarto(this);

    this.sono = 0;
    this.velocidade = 1 / SEGUNDOS_BASE;
    this.acertos = 0;
    this.ativo = false;
    this.teclaAtual = null;

    this.montarCama();
    this.montarDespertador();
    this.montarUI();

    // o despertador toca sozinho por um instante antes de o jogo comecar
    this.aviso('ACORDA!', 900, () => this.comecar());

    this.input.keyboard.on('keydown', this.aoTeclar, this);
  }

  // ---- Cenografia --------------------------------------------------------

  montarCama() {
    const { cama } = this.cenario;
    // Um unico sprite com cabeca, braco e cobertor, para nada ficar solto.
    this.pedro = this.add.image(cama.x + 2, cama.y - 20, 'pedroNaCama').setOrigin(0, 0).setDepth(5);
    this.respiracao = this.tweens.add({
      targets: this.pedro, y: this.pedro.y + 1, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    this.zzz = [];
    this.time.addEvent({ delay: 800, loop: true, callback: () => this.soltarZ() });
  }

  soltarZ() {
    if (!this.pedro || this.finalizada) return;
    const z = this.add.text(this.pedro.x + 16, this.pedro.y + 2, 'z', {
      fontFamily: FONTE, fontSize: '8px', color: COR.creme,
    }).setDepth(6).setAlpha(0.9);
    this.zzz.push(z);
    this.tweens.add({
      targets: z, y: z.y - 20, x: z.x - 8, alpha: 0, duration: 1400,
      onComplete: () => z.destroy(),
    });
  }

  montarDespertador() {
    const d = this.cenario.despertador;
    this.relogio = this.add.image(d.x, d.y, 'despertador').setOrigin(0.5, 1).setDepth(5);
    this.tremor = this.tweens.add({
      targets: this.relogio, x: d.x + 1, angle: 4, duration: 60, yoyo: true, repeat: -1,
    });
    // ondinhas de som saindo do despertador
    this.time.addEvent({
      delay: 380, loop: true,
      callback: () => {
        if (this.finalizada) return;
        if (this.ativo) som.tocar('despertador');
        const onda = this.add.graphics().setDepth(5);
        onda.lineStyle(1, 0xffd66b, 0.9);
        onda.strokeCircle(0, 0, 4);
        onda.setPosition(d.x, d.y - 10);
        this.tweens.add({ targets: onda, scale: 4, alpha: 0, duration: 600, onComplete: () => onda.destroy() });
      },
    });
  }

  // ---- Interface do QTE --------------------------------------------------

  montarUI() {
    const { width: l, height: a } = this.scale;

    // tecla dentro de um balao de pensamento, saindo da cabeca do Pedro
    const { cama } = this.cenario;
    this.balao = { x: cama.x + 78, y: cama.y - 92, lado: 48 };
    this.tampa = this.add.graphics().setDepth(20);
    this.rotuloTecla = this.add.text(this.balao.x + this.balao.lado / 2, this.balao.y + this.balao.lado / 2, '', {
      fontFamily: FONTE, fontSize: '20px', color: TEMA_PERGAMINHO.texto,
    }).setOrigin(0.5).setDepth(21);
    this.desenharTecla(0xf6e0b4);
    this.tampa.setVisible(false);
    this.rotuloTecla.setVisible(false);

    this.dica = this.add.text(this.balao.x + this.balao.lado + 10, this.balao.y + this.balao.lado / 2, 'aperte a tecla', {
      fontFamily: FONTE, fontSize: '8px', color: COR.creme,
    }).setOrigin(0, 0.5).setDepth(21).setShadow(0, 1, '#000000', 0).setVisible(false);

    // barra de sono no rodape
    const bx = 30, by = a - 24, bl = l - 60, ba = 12;
    this.barra = { x: bx, y: by, l: bl, a: ba };
    const g = this.add.graphics().setDepth(20);
    caixaPergaminho(g, bx - 6, by - 11, bl + 12, ba + 10);
    this.preenchimento = this.add.graphics().setDepth(21);
    this.add.text(bx, by - 1, 'SONO', {
      fontFamily: FONTE, fontSize: '8px', color: TEMA_PERGAMINHO.nome,
    }).setOrigin(0, 0.5).setDepth(22).setX(bx + 6);

    this.contador = this.add.text(l - 34, by - 1, `0/${ACERTOS_PARA_VENCER}`, {
      fontFamily: FONTE, fontSize: '8px', color: TEMA_PERGAMINHO.nome,
    }).setOrigin(1, 0.5).setDepth(22);

    this.desenharBarra();

    // no celular nao ha teclado: tres teclas na tela, so uma e a certa
    if (TEM_TOQUE) {
      // na parede livre acima da cama, abaixo do balao e longe da janela
      this.capsToque = [0, 1, 2].map((i) => botaoToque(this, this.balao.x + 54 + i * 46, this.balao.y + this.balao.lado + 22, '?', {
        raio: 20, tamanho: '14px', aoTocar: () => this.responder(this.capsToque[i].codigo),
      }));
      this.capsToque.forEach((c) => c.setVisible(false));
      this.dica.setText('toque na tecla certa');
    }
  }

  desenharTecla(corFundo) {
    const { width: l } = this.scale;
    const g = this.tampa;
    g.clear();
    const { x, y, lado } = this.balao;
    // bolinhas do balao de pensamento, descendo ate a cabeca
    [[x - 6, y + lado + 8, 3], [x - 14, y + lado + 18, 2]].forEach(([bx, by, r]) => {
      circuloPixel(g, bx, by, r + 1, 0x2e1710);
      circuloPixel(g, bx, by, r, 0xf6e0b4);
    });
    retRedondo(g, x + 2, y + 4, lado, lado, 4, 0x000000, 0.35);
    retRedondo(g, x, y, lado, lado, 4, 0x2e1710);
    retRedondo(g, x + 1, y + 1, lado - 2, lado - 2, 4, 0xa8552a);
    retRedondo(g, x + 2, y + 2, lado - 4, lado - 4, 3, 0xe6a862);
    retRedondo(g, x + 4, y + 4, lado - 8, lado - 8, 3, 0x7a3c1c);
    retRedondo(g, x + 5, y + 5, lado - 10, lado - 10, 2, corFundo);
    // sombra de tecla fisica: a base e mais escura
    g.fillStyle(0x7a3c1c, 1).fillRect(x + 7, y + lado - 9, lado - 14, 3);
  }

  desenharBarra() {
    const { x, y, l, a } = this.barra;
    const g = this.preenchimento;
    g.clear();
    const inicio = x + 48, largura = l - 104;
    retRedondo(g, inicio, y - 5, largura, a - 2, 2, 0x3a2418);
    const cheio = Math.round((largura - 2) * Phaser.Math.Clamp(this.sono, 0, 1));
    if (cheio > 0) {
      const cor = this.sono > 0.75 ? 0xd94f45 : this.sono > 0.45 ? 0xe07a3f : 0x5c6bd9;
      retRedondo(g, inicio + 1, y - 4, cheio, a - 4, 2, cor);
      g.fillStyle(0xffffff, 0.35).fillRect(inicio + 2, y - 4, Math.max(0, cheio - 2), 1);
    }
  }

  // Texto grande e rapido no meio da tela ("ACORDA!", "ERROU").
  aviso(texto, duracao, depois) {
    const { width: l } = this.scale;
    const t = this.add.text(l / 2, 140, texto, {
      fontFamily: FONTE, fontSize: '14px', color: COR.amarelo,
    }).setOrigin(0.5).setDepth(30).setShadow(0, 2, '#2a0f14', 0);
    this.tweens.add({ targets: t, scale: 1.15, duration: 120, yoyo: true, repeat: 2 });
    this.time.delayedCall(duracao, () => { t.destroy(); depois && depois(); });
  }

  // ---- Mecanica ----------------------------------------------------------

  comecar() {
    this.ativo = true;
    this.tampa.setVisible(true);
    this.rotuloTecla.setVisible(true);
    this.dica.setVisible(true);
    this.sortearTecla();
  }

  sortearTecla() {
    let nova;
    do { nova = Phaser.Utils.Array.GetRandom(TECLAS); } while (this.teclaAtual && nova.codigo === this.teclaAtual.codigo);
    this.teclaAtual = nova;
    this.rotuloTecla.setText(nova.rotulo);
    this.desenharTecla(0xf6e0b4);
    this.tampa.setScale(1);
    this.tweens.add({ targets: [this.rotuloTecla], scale: { from: 1.4, to: 1 }, duration: 140, ease: 'Back.easeOut' });
    if (this.capsToque) {
      const outras = Phaser.Utils.Array.Shuffle(TECLAS.filter((t) => t.codigo !== nova.codigo)).slice(0, 2);
      const opcoes = Phaser.Utils.Array.Shuffle([nova, ...outras]);
      this.capsToque.forEach((cap, i) => { cap.codigo = opcoes[i].codigo; cap.setRotulo(opcoes[i].rotulo); cap.setVisible(true); });
    }
  }

  aoTeclar(evento) {
    this.responder(evento.code);
  }

  responder(codigo) {
    if (!this.ativo || this.finalizada) return;
    // so reage as teclas do jogo, para espaco ou shift nao contarem como erro
    if (!TECLAS.some((t) => t.codigo === codigo)) return;
    if (codigo === this.teclaAtual.codigo) this.acertou(); else this.errou();
  }

  acertou() {
    som.tocar('acerto');
    this.acertos++;
    this.dica.setVisible(false);
    this.sono = Math.max(0, this.sono - ALIVIO_ACERTO);
    this.contador.setText(`${this.acertos}/${ACERTOS_PARA_VENCER}`);
    this.desenharTecla(0x9fe0a4);
    this.cameras.main.shake(60, 0.002);

    // o Pedro se mexe um pouco a cada acerto
    this.tweens.add({ targets: this.pedro, y: this.pedro.y - 2, duration: 80, yoyo: true });

    if (this.acertos >= ACERTOS_PARA_VENCER) { this.levantar(); return; }
    this.ativo = false;
    this.time.delayedCall(220, () => { this.ativo = true; this.sortearTecla(); });
  }

  errou() {
    som.tocar('erro');
    vibrar(60);
    this.acertos = 0;
    this.contador.setText(`0/${ACERTOS_PARA_VENCER}`);
    this.velocidade *= ACELERACAO_ERRO;
    this.desenharTecla(0xe88a80);
    this.cameras.main.shake(120, 0.006);

    // Pedro se revira na cama: sobe e desce com uma sacudida
    this.tweens.add({ targets: this.pedro, y: this.pedro.y - 3, duration: 70, yoyo: true, repeat: 2 });
    this.tweens.add({ targets: this.pedro, x: this.pedro.x + 3, duration: 60, yoyo: true, repeat: 3 });
    this.dica.setVisible(false);

    this.ativo = false;
    this.time.delayedCall(320, () => { this.ativo = true; this.sortearTecla(); });
  }

  update(tempo, delta) {
    if (!this.ativo || this.finalizada) return;
    this.sono += (delta / 1000) * this.velocidade;
    this.desenharBarra();
    if (this.sono >= 1) this.dormiuDeNovo();
  }

  // ---- Desfechos ---------------------------------------------------------

  levantar() {
    this.ativo = false;
    this.finalizada = true;                 // trava a barra; venceu() e chamado no fim da animacao
    this.tampa.setVisible(false);
    this.rotuloTecla.setVisible(false);
    this.dica.setVisible(false);
    if (this.capsToque) this.capsToque.forEach((c) => c.setVisible(false));
    this.tremor.stop();
    this.relogio.setAngle(0);
    this.respiracao.stop();

    const { cama, chao } = this.cenario;
    this.pedro.destroy();
    this.pedro = null;                      // o "z" para de sair da cama vazia
    this.zzz.forEach((z) => z.destroy());
    this.zzz = [];

    // cobertor aberto para o pe da cama, com a ponta virada mostrando o avesso
    const g = this.add.graphics().setDepth(4);
    const bx = cama.x + 74, by = cama.y + 3, bl = cama.l - 78, ba = cama.a - 8;
    g.fillStyle(0x2e1c12, 1).fillRect(bx - 1, by - 1, bl + 2, ba + 2);
    g.fillStyle(0xd94f45, 1).fillRect(bx, by, bl, ba);
    g.fillStyle(0xef7a5a, 1).fillRect(bx, by, bl, 3);
    g.fillStyle(0xb03a34, 1);
    g.fillRect(bx + 16, by + 14, 34, 2).fillRect(bx + 60, by + 22, 26, 2).fillRect(bx, by + ba - 2, bl, 2);
    // ponta dobrada: triangulo claro no canto superior esquerdo
    for (let i = 0; i < 22; i++) {
      g.fillStyle(0xf2b8a0, 1).fillRect(bx, by + i, 22 - i, 1);
      g.fillStyle(0x2e1c12, 1).fillRect(bx + 22 - i, by + i, 1, 1);
    }

    // Pedro aparece em pe ao lado da cama, com um pulinho de quem acordou de susto
    const emPe = this.add.image(cama.x + cama.l - 26, chao + 16, 'pedroEmPe').setOrigin(0.5, 1).setDepth(6);
    emPe.setScale(1, 0.6);
    this.tweens.add({ targets: emPe, scaleY: 1, duration: 260, ease: 'Back.easeOut' });

    this.aviso('LEVANTOU!', 1100, () => {
      this.finalizada = false;
      this.venceu({ legenda: 'Atrasado. Mas de pe.' });
    });
  }

  dormiuDeNovo() {
    this.ativo = false;
    this.tremor.stop();
    this.tampa.setVisible(false);
    this.rotuloTecla.setVisible(false);
    this.dica.setVisible(false);
    if (this.capsToque) this.capsToque.forEach((c) => c.setVisible(false));
    this.respiracao.stop();
    // o quarto escurece devagar: dormiu de novo
    const { width: l, height: a } = this.scale;
    const escuro = this.add.rectangle(0, 0, l, a, 0x000000, 0).setOrigin(0, 0).setDepth(50);
    this.tweens.add({ targets: escuro, fillAlpha: 0.8, duration: 900, onComplete: () => this.perdeu() });
  }
}
