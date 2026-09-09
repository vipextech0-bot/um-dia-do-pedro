import { FaseBase } from './FaseBase.js';
import { salaAula } from '../arte/cenarios.js';
import { carregarSprites } from '../arte/sprites.js';
import { caixaPergaminho, retRedondo, TEMA_PERGAMINHO } from '../ui/moldura.js';
import { COR, FONTE } from '../config/paleta.js';
import { som } from '../audio/som.js';
import { TEM_TOQUE, tecladoToque, vibrar } from '../ui/Toque.js';

// FASE 6 — Faculdade, 19:00 ate 21:40.
// Corrida de digitacao: palavras caem no editor; digite cada uma antes de
// tocar o chao. A barra do Pedro sobe por palavra; a do colega sobe sozinha.
// 5 palavras no chao, ou o colega terminar antes, e perdeu.

const PALAVRAS = ['funcao', 'variavel', 'loop', 'deploy', 'bug', 'commit', 'classe', 'servidor', 'banco', 'logica'];
const EXIBICAO = { funcao: 'função', variavel: 'variável', logica: 'lógica' };
const META = 100;
const POR_PALAVRA = 8;            // % de progresso por palavra digitada
const COLEGA_SEGUNDOS = 46;       // tempo que o colega leva para chegar a 100%
const QUEDAS_MAX = 5;

export class Fase6Faculdade extends FaseBase {
  constructor() { super('Fase6Faculdade'); }

  iniciar() {
    carregarSprites(this);
    this.cenario = salaAula(this);

    this.pedroPct = 0;
    this.colegaPct = 0;
    this.sequencia = 0;
    this.quedas = 0;
    this.palavras = [];
    this.alvo = null;
    this.digitado = '';
    this.ativo = false;
    this.proxima = 0;
    this.tempo = 0;

    this.montarPersonagens();
    this.montarEditor();
    this.montarUI();
    this.input.keyboard.on('keydown', this.aoTeclar, this);
    if (TEM_TOQUE) this.montarTecladoVirtual();

    this.contagem(() => { this.ativo = true; });
  }

  // ---- Cenografia --------------------------------------------------------

  montarPersonagens() {
    const { lugares, mesa } = this.cenario;
    this.pedro = this.add.image(lugares[0], mesa.y + 14, 'pedroDigitandoG0').setOrigin(0.5, 1).setDepth(10);
    this.colega = this.add.image(lugares[1], mesa.y + 14, 'colegaDigitandoG0').setOrigin(0.5, 1).setDepth(10);
    this.quadroPedro = 0;
    this.quadroColega = 0;
    // professor escrevendo no quadro, de costas para a turma de vez em quando
    // professor andando pela sala, na frente da bancada (abaixo do editor)
    this.professor = this.add.image(34, this.cenario.chao + 10, 'professor').setOrigin(0.5, 1).setDepth(5).setScale(0.85);
    const passear = () => {
      if (this.finalizada) return;
      const destino = this.professor.x < 100 ? Phaser.Math.Between(110, 150) : Phaser.Math.Between(24, 44);
      this.professor.setFlipX(destino < this.professor.x);
      this.tweens.add({ targets: this.professor, x: destino, duration: 2600, ease: 'Sine.easeInOut',
        onComplete: () => this.time.delayedCall(Phaser.Math.Between(1500, 3500), passear) });
    };
    this.time.delayedCall(2000, passear);
    // o colega digita furiosamente o tempo todo
    this.time.addEvent({ delay: 110, loop: true, callback: () => {
      if (this.finalizada) return;
      this.quadroColega = 1 - this.quadroColega;
      this.colega.setTexture('colegaDigitandoG' + this.quadroColega);
    } });
  }

  // O editor de codigo flutua no meio da tela: e "a tela do Pedro" ampliada.
  montarEditor() {
    const { width: l } = this.scale;
    this.editor = { x: 28, y: 52, l: l - 56, a: 108 };
    const { x, y, l: el, a: ea } = this.editor;
    const g = this.add.graphics().setDepth(20);
    g.fillStyle(0x0d1428, 0.35).fillRect(x + 3, y + 4, el, ea);
    g.fillStyle(0x2a1a16, 1).fillRect(x - 1, y - 1, el + 2, ea + 2);
    g.fillStyle(0x14203a, 0.96).fillRect(x, y, el, ea);
    g.fillStyle(0x0d1428, 1).fillRect(x, y, el, 12);
    [0xd94f45, 0xffd66b, 0x5fbf6a].forEach((c, i) => g.fillStyle(c, 1).fillRect(x + 6 + i * 9, y + 3, 6, 6));
    this.add.text(x + 40, y + 6, 'main.js — Ciencia da Computacao', { fontFamily: FONTE, fontSize: '8px', color: '#8fa3c8' })
      .setOrigin(0, 0.5).setDepth(21);
    // numeros de linha
    g.fillStyle(0x0d1428, 0.6).fillRect(x, y + 12, 18, ea - 12);
    for (let i = 0; i < 7; i++) {
      this.add.text(x + 4, y + 18 + i * 11, String(i + 1).padStart(2, ' '), { fontFamily: FONTE, fontSize: '8px', color: '#3f5a8a' }).setDepth(21);
    }
    // codigo esmaecido ao fundo
    const codigo = ['function main() {', '  const dia = novoDia(pedro);', '  while (!dia.acabou) {', '    dia.jogar();', '  }', '  return "vale a pena";', '}'];
    codigo.forEach((linha, i) => {
      this.add.text(x + 24, y + 18 + i * 11, linha, { fontFamily: FONTE, fontSize: '8px', color: '#22335c' }).setDepth(21);
    });
    // barra de status: e o "chao" onde as palavras estouram
    g.fillStyle(0x0d1428, 1).fillRect(x, y + ea - 14, el, 14);
    g.fillStyle(0xd94f45, 0.7).fillRect(x + 18, y + ea - 15, el - 18, 1);
    this.chaoEditor = y + ea - 16;
  }

  montarUI() {
    const { width: l, height: a } = this.scale;
    // barras de progresso Pedro x colega, no alto
    const g = this.add.graphics().setDepth(30);
    caixaPergaminho(g, 8, 18, l - 16, 30);
    this.barras = { x: 70, y1: 26, y2: 38, l: l - 150 };
    retRedondo(g, this.barras.x, this.barras.y1, this.barras.l, 7, 2, 0x3a2418);
    retRedondo(g, this.barras.x, this.barras.y2, this.barras.l, 7, 2, 0x3a2418);
    this.add.text(this.barras.x - 6, this.barras.y1 + 3, 'Pedro', { fontFamily: FONTE, fontSize: '8px', color: TEMA_PERGAMINHO.nome }).setOrigin(1, 0.5).setDepth(31);
    this.add.text(this.barras.x - 6, this.barras.y2 + 3, 'colega', { fontFamily: FONTE, fontSize: '8px', color: TEMA_PERGAMINHO.nome }).setOrigin(1, 0.5).setDepth(31);
    this.gBarras = this.add.graphics().setDepth(31);
    this.textoPct = this.add.text(l - 18, this.barras.y1 + 3, '0%', { fontFamily: FONTE, fontSize: '8px', color: TEMA_PERGAMINHO.nome }).setOrigin(1, 0.5).setDepth(31);
    this.textoPctColega = this.add.text(l - 18, this.barras.y2 + 3, '0%', { fontFamily: FONTE, fontSize: '8px', color: TEMA_PERGAMINHO.nome }).setOrigin(1, 0.5).setDepth(31);

    // palavras que cairam (bugs)
    this.gQuedas = this.add.graphics().setDepth(31);
    this.desenharBarras();

    // o que esta sendo digitado, no rodape do editor
    this.textoDigitado = this.add.text(this.editor.x + 6, this.editor.y + this.editor.a - 7, '> _', {
      fontFamily: FONTE, fontSize: '8px', color: '#a8f0b0',
    }).setOrigin(0, 0.5).setDepth(31);
  }

  desenharBarras() {
    const g = this.gBarras;
    g.clear();
    const { x, y1, y2, l } = this.barras;
    const p1 = Math.round((l - 2) * Math.min(1, this.pedroPct / META));
    const p2 = Math.round((l - 2) * Math.min(1, this.colegaPct / META));
    if (p1 > 0) retRedondo(g, x + 1, y1 + 1, p1, 5, 2, 0xef9a5c);
    if (p2 > 0) retRedondo(g, x + 1, y2 + 1, p2, 5, 2, 0x5fbf6a);
    this.textoPct.setText(Math.round(this.pedroPct) + '%');
    this.textoPctColega.setText(Math.round(this.colegaPct) + '%');
    // bugs: um inseto vermelho por palavra que caiu
    const q = this.gQuedas;
    q.clear();
    for (let i = 0; i < QUEDAS_MAX; i++) {
      const bx = this.editor.x + this.editor.l - 12 - i * 12, by = this.editor.y + this.editor.a - 7;
      const cor = i < this.quedas ? 0xd94f45 : 0x3a3644;
      q.fillStyle(cor, 1).fillRect(bx - 3, by - 2, 6, 5);
      q.fillRect(bx - 5, by - 1, 2, 1).fillRect(bx + 3, by - 1, 2, 1).fillRect(bx - 5, by + 2, 2, 1).fillRect(bx + 3, by + 2, 2, 1);
    }
  }

  contagem(depois) {
    const { width: l } = this.scale;
    const dica = this.add.text(l / 2, this.editor.y + 64, 'digite as palavras antes de caírem (sem acento)', { fontFamily: FONTE, fontSize: '8px', color: COR.creme })
      .setOrigin(0.5).setDepth(40).setShadow(0, 1, '#000000', 0);
    ['3', '2', '1', 'CODA!'].forEach((txt, i, arr) => {
      this.time.delayedCall(650 * i, () => {
        const t = this.add.text(l / 2, this.editor.y + 38, txt, { fontFamily: FONTE, fontSize: '18px', color: COR.amarelo })
          .setOrigin(0.5).setDepth(40).setShadow(0, 2, '#2a0f14', 0).setScale(1.6);
        this.tweens.add({ targets: t, scale: 1, alpha: 0.2, duration: 560, onComplete: () => t.destroy() });
        if (i === arr.length - 1) { dica.destroy(); depois(); }
      });
    });
  }

  aviso(texto, cor, duracao, depois) {
    const { width: l } = this.scale;
    const t = this.add.text(l / 2, this.editor.y + 44, texto, { fontFamily: FONTE, fontSize: '14px', color: cor })
      .setOrigin(0.5).setDepth(40).setShadow(0, 2, '#2a0f14', 0);
    this.tweens.add({ targets: t, scale: 1.12, duration: 130, yoyo: true, repeat: 2 });
    this.time.delayedCall(duracao, () => { t.destroy(); depois && depois(); });
  }

  // ---- Mecanica ----------------------------------------------------------

  get progresso() { return Math.min(1, this.tempo / COLEGA_SEGUNDOS); }

  soltarPalavra() {
    const chave = Phaser.Utils.Array.GetRandom(PALAVRAS.filter((p) => !this.palavras.some((w) => w.chave === p)) || PALAVRAS);
    const exibida = EXIBICAO[chave] || chave;
    const largura = exibida.length * 10;
    const x = Phaser.Math.Between(this.editor.x + 24, this.editor.x + this.editor.l - largura - 8);
    const txt = this.add.text(x, this.editor.y + 14, exibida, { fontFamily: FONTE, fontSize: '10px', color: '#dfe8ee' })
      .setDepth(25).setShadow(0, 1, '#000000', 0);
    this.palavras.push({ chave, exibida, txt, vel: Phaser.Math.Between(10, 14) + this.progresso * 9 });
  }

  // No celular, um teclado proprio com so as letras que as palavras usam —
  // o teclado do sistema, em paisagem, cobriria o jogo inteiro.
  montarTecladoVirtual() {
    const letras = [...new Set(PALAVRAS.join(''))].sort();
    this.teclado = tecladoToque(this, letras, (k) => this.processarTecla(k));
  }

  aoTeclar(evento) {
    this.processarTecla(evento.key);
  }

  processarTecla(k) {
    if (!this.ativo || this.finalizada) return;
    if (k === 'Backspace') { this.digitado = this.digitado.slice(0, -1); this.atualizarDigitado(); return; }
    if (k.length !== 1) return;
    const letra = k.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (!/[a-z]/.test(letra)) return;

    // sem alvo: a primeira letra escolhe a palavra mais baixa que comeca com ela
    if (!this.alvo) {
      const candidatas = this.palavras.filter((p) => p.chave[0] === letra).sort((a, b) => b.txt.y - a.txt.y);
      if (!candidatas.length) { this.errou(); return; }
      this.alvo = candidatas[0];
      this.digitado = '';
    }
    const esperado = this.alvo.chave[this.digitado.length];
    if (letra === esperado) {
      som.tocar('letra');
      this.digitado += letra;
      this.pedro.setTexture('pedroDigitandoG' + (this.quadroPedro = 1 - this.quadroPedro));
      if (this.digitado.length === this.alvo.chave.length) this.completou();
    } else {
      this.errou();
    }
    this.atualizarDigitado();
  }

  atualizarDigitado() {
    this.textoDigitado.setText('> ' + this.digitado + '_');
    this.palavras.forEach((p) => {
      if (p === this.alvo) {
        p.txt.setColor('#ffd66b');
      } else {
        p.txt.setColor('#dfe8ee');
      }
    });
    if (this.alvo) {
      // a parte ja digitada fica verde: usa dois textos sobrepostos
      if (!this.alvo.feito) {
        this.alvo.feito = this.add.text(this.alvo.txt.x, this.alvo.txt.y, '', { fontFamily: FONTE, fontSize: '10px', color: '#5fbf6a' }).setDepth(26);
      }
      this.alvo.feito.setText(this.alvo.exibida.slice(0, this.digitado.length));
    }
  }

  errou() {
    som.tocar('erro');
    this.sequencia = 0;
    this.cameras.main.shake(60, 0.003);
    this.textoDigitado.setColor('#ff8a7a');
    this.time.delayedCall(150, () => this.textoDigitado.setColor('#a8f0b0'));
    this.digitado = '';
    if (this.alvo && this.alvo.feito) this.alvo.feito.setText('');
    this.alvo = null;
    this.atualizarDigitado();
  }

  completou() {
    som.tocar('acerto');
    const p = this.alvo;
    this.sequencia++;
    const bonus = Math.min(4, Math.floor(this.sequencia / 2));      // sequencia longa rende mais
    this.pedroPct = Math.min(META, this.pedroPct + POR_PALAVRA + bonus);
    if (this.sequencia >= 3) this.flutuar(`sequencia x${this.sequencia}`, this.editor.x + this.editor.l - 60, this.editor.y + 20, '#ffd66b');
    this.desenharBarras();
    this.flutuar('ok', p.txt.x + p.txt.width / 2, p.txt.y, '#5fbf6a');
    this.removerPalavra(p);
    this.alvo = null;
    this.digitado = '';
    this.textoDigitado.setText('> _');
    if (this.pedroPct >= META) this.terminou();
  }

  removerPalavra(p) {
    p.txt.destroy();
    if (p.feito) p.feito.destroy();
    this.palavras = this.palavras.filter((w) => w !== p);
  }

  caiu(p) {
    som.tocar('gota');
    vibrar(80);
    this.sequencia = 0;
    this.quedas++;
    this.flutuar('bug!', p.txt.x + p.txt.width / 2, p.txt.y, '#ff8a7a');
    this.cameras.main.shake(120, 0.005);
    if (p === this.alvo) { this.alvo = null; this.digitado = ''; this.textoDigitado.setText('> _'); }
    this.removerPalavra(p);
    this.desenharBarras();
    if (this.quedas >= QUEDAS_MAX) this.travouTudo();
  }

  flutuar(texto, x, y, cor) {
    const t = this.add.text(x, y, texto, { fontFamily: FONTE, fontSize: '8px', color: cor }).setOrigin(0.5).setDepth(41).setShadow(0, 1, '#000000', 0);
    this.tweens.add({ targets: t, y: y - 14, alpha: 0, duration: 600, onComplete: () => t.destroy() });
  }

  update(tempo, delta) {
    if (!this.ativo || this.finalizada) return;
    const dt = delta / 1000;
    this.tempo += dt;

    this.colegaPct = Math.min(META, this.colegaPct + (META / COLEGA_SEGUNDOS) * dt);
    if (this.colegaPct >= META) { this.colegaTerminou(); return; }

    this.proxima -= dt;
    if (this.proxima <= 0 && this.palavras.length < 5) {
      this.soltarPalavra();
      this.proxima = Phaser.Math.FloatBetween(1.5, 2.1) - this.progresso * 0.5;
    }

    for (const p of [...this.palavras]) {
      p.txt.y += p.vel * dt;
      if (p.feito) p.feito.y = p.txt.y;
      if (p.txt.y + 10 >= this.chaoEditor) this.caiu(p);
    }
    if (Math.floor(tempo / 400) % 2 === 0) this.desenharBarras();
  }

  // ---- Desfechos ---------------------------------------------------------

  encerrar() {
    this.ativo = false;
    this.palavras.forEach((p) => { p.txt.destroy(); if (p.feito) p.feito.destroy(); });
    this.palavras = [];
  }

  terminou() {
    this.encerrar();
    this.pedro.setTexture('pedroDigitandoG0');
    this.hud.setHorario('21:40');
    this.hud.destacarRelogio();
    this.aviso('COMPILOU!', COR.amarelo, 1300, () => {
      const { width: l, height: a } = this.scale;
      const fundo = this.add.rectangle(0, 0, l, a, 0x000000, 0).setOrigin(0, 0).setDepth(80);
      const t = this.add.text(l / 2, a / 2, 'Fim da aula.', { fontFamily: FONTE, fontSize: '12px', color: COR.creme }).setOrigin(0.5).setDepth(81).setAlpha(0);
      this.tweens.add({ targets: fundo, fillAlpha: 0.85, duration: 700 });
      this.tweens.add({ targets: t, alpha: 1, duration: 600, delay: 400 });
      this.time.delayedCall(2200, () => this.venceu({ legenda: 'Fim da aula.' }));
    });
  }

  colegaTerminou() {
    this.encerrar();
    this.aviso('o colega terminou antes', '#ff8a7a', 1300, () => this.escurecer());
  }

  travouTudo() {
    this.encerrar();
    this.aviso('travou tudo', '#ff8a7a', 1200, () => this.escurecer());
  }

  escurecer() {
    const { width: l, height: a } = this.scale;
    const escuro = this.add.rectangle(0, 0, l, a, 0x000000, 0).setOrigin(0, 0).setDepth(80);
    this.tweens.add({ targets: escuro, fillAlpha: 0.8, duration: 700, onComplete: () => this.perdeu() });
  }
}
