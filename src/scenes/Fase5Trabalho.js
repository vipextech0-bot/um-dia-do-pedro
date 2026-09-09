import { FaseBase } from './FaseBase.js';
import { carregarRetratos } from '../arte/retratos.js';
import { caixaPergaminho, retRedondo, molduraRetrato, TEMA_PERGAMINHO } from '../ui/moldura.js';
import { COR, FONTE } from '../config/paleta.js';
import { retanguloDither } from '../arte/pixel.js';
import { som } from '../audio/som.js';
import { TEM_TOQUE, botaoToque } from '../ui/Toque.js';

// FASE 5 — Trabalho, 08:15 ate 17:00.
// A tela do notebook ocupa tudo. Processos chegam como pecas de encaixe:
// cada linha completa e um processo protocolado. 5 linhas vencem; a cada
// 2, o Victor manda mensagem e o ritmo acelera. Se a pilha chegar ao topo,
// a mesa afogou.

const COLUNAS = 10;
const LINHAS = 16;
const CELULA = 12;
const META_LINHAS = 5;
const GRAVIDADE_INICIAL = 780;   // ms por queda
const ACELERACAO = 0.7;          // multiplicador a cada 2 linhas

// Pecas como pastas e documentos. Cada uma tem cor propria.
const PECAS = [
  { nome: 'I', cor: 0xe0a05c, luz: 0xf2c48a, sombra: 0xb07a3c, forma: [[1, 1, 1, 1]] },
  { nome: 'O', cor: 0xd94f45, luz: 0xef7a5a, sombra: 0xa83a32, forma: [[1, 1], [1, 1]] },
  { nome: 'T', cor: 0x4a7ab5, luz: 0x7aa8d8, sombra: 0x2f4a8a, forma: [[0, 1, 0], [1, 1, 1]] },
  { nome: 'S', cor: 0x5fbf6a, luz: 0x8fd99a, sombra: 0x2f6b3a, forma: [[0, 1, 1], [1, 1, 0]] },
  { nome: 'Z', cor: 0x9a5cb8, luz: 0xc08ad8, sombra: 0x6b2f8a, forma: [[1, 1, 0], [0, 1, 1]] },
  { nome: 'J', cor: 0xf2e6cc, luz: 0xfff8ea, sombra: 0xc4b498, forma: [[1, 0, 0], [1, 1, 1]] },
  { nome: 'L', cor: 0xc86a35, luz: 0xef9a5c, sombra: 0x8a4a24, forma: [[0, 0, 1], [1, 1, 1]] },
];

const FALAS_VICTOR = ['Bom trabalho.', 'Mais um.', 'Continua assim.'];

export class Fase5Trabalho extends FaseBase {
  constructor() { super('Fase5Trabalho'); }

  iniciar() {
    carregarRetratos(this);
    const { width: l, height: a } = this.scale;

    this.grade = Array.from({ length: LINHAS }, () => Array(COLUNAS).fill(null));
    this.linhas = 0;
    this.gravidade = GRAVIDADE_INICIAL;
    this.acumulado = 0;
    this.ativo = false;
    this.travaEm = 0;         // tempo acumulado apoiada, antes de fixar
    this.xVisual = 0;         // posicao horizontal suavizada da peca
    this.queda = null;        // animacao das linhas de cima descendo
    this.saco = [];

    // o tabuleiro fica na janela central da tela do notebook
    this.tab = { x: Math.round(l / 2 - (COLUNAS * CELULA) / 2) - 40, y: 40 };

    this.montarTela();
    this.montarPainel();
    this.gPecas = this.add.graphics().setDepth(12);
    this.gProxima = this.add.graphics().setDepth(12);

    this.proxima = this.sortear();
    this.ligarTeclas();

    this.abrirTela(() => { this.ativo = true; this.novaPeca(); });
  }

  // ---- Tela do notebook --------------------------------------------------

  montarTela() {
    const { width: l, height: a } = this.scale;
    const g = this.add.graphics().setDepth(0);
    // papel de parede azul escuro com um degrade em dither
    retanguloDither(g, 0, 16, l, a - 16, 0x14203a, 0x1f3050, 0.5);
    // barra de tarefas
    g.fillStyle(0x0d1428, 1).fillRect(0, a - 14, l, 14);
    g.fillStyle(0x2f4a8a, 1).fillRect(4, a - 12, 18, 10);
    g.fillStyle(0xffd66b, 1).fillRect(8, a - 10, 10, 6);
    for (let i = 0; i < 3; i++) g.fillStyle(0x1f3050, 1).fillRect(30 + i * 26, a - 12, 22, 10);
    // icones da area de trabalho, na faixa livre da esquerda
    const icones = [['Procs.', 0xffd66b], ['E-mail', 0x7aa8bf], ['Peticoes', 0xef9a5c], ['Lixeira', 0x8a8a8a]];
    icones.forEach(([nome, cor], i) => {
      const ix = 36, iy = 34 + i * 44;
      g.fillStyle(0x0d1428, 1).fillRect(ix - 1, iy - 1, 22, 18);
      g.fillStyle(cor, 1).fillRect(ix, iy, 20, 16);
      g.fillStyle(0xffffff, 0.35).fillRect(ix + 2, iy + 2, 16, 3);
      this.add.text(ix + 10, iy + 22, nome, { fontFamily: FONTE, fontSize: '8px', color: COR.creme }).setOrigin(0.5, 0).setDepth(2);
    });

    this.relogioTela = this.add.text(l - 6, a - 7, '08:15', { fontFamily: FONTE, fontSize: '8px', color: COR.creme })
      .setOrigin(1, 0.5).setDepth(2);

    // janela do sistema de processos
    const jx = this.tab.x - 12, jy = this.tab.y - 22, jl = COLUNAS * CELULA + 24 + 150, ja = LINHAS * CELULA + 34;
    g.fillStyle(0x2a1a16, 1).fillRect(jx - 1, jy - 1, jl + 2, ja + 2);
    g.fillStyle(0xf2e6cc, 1).fillRect(jx, jy, jl, ja);
    g.fillStyle(0x8a4a24, 1).fillRect(jx, jy, jl, 14);
    g.fillStyle(0xa8552a, 1).fillRect(jx, jy, jl, 1);
    this.add.text(jx + 6, jy + 7, 'PROTOCOLO — Processos', { fontFamily: FONTE, fontSize: '8px', color: COR.creme })
      .setOrigin(0, 0.5).setDepth(2);
    // botoes da janela
    [0xffd66b, 0x5fbf6a, 0xd94f45].forEach((c, i) => g.fillStyle(c, 1).fillRect(jx + jl - 12 - i * 10, jy + 4, 6, 6));

    // tabuleiro: a "mesa" onde os processos se empilham
    const tx = this.tab.x, ty = this.tab.y;
    g.fillStyle(0x2a1a16, 1).fillRect(tx - 2, ty - 2, COLUNAS * CELULA + 4, LINHAS * CELULA + 4);
    g.fillStyle(0x3a2a24, 1).fillRect(tx, ty, COLUNAS * CELULA, LINHAS * CELULA);
    g.fillStyle(0x44322c, 1);
    for (let c = 0; c < COLUNAS; c++) for (let r = 0; r < LINHAS; r++) {
      if ((c + r) % 2 === 0) g.fillRect(tx + c * CELULA, ty + r * CELULA, CELULA, CELULA);
    }
    // linha de perigo
    g.fillStyle(0xd94f45, 0.5).fillRect(tx, ty + CELULA * 2, COLUNAS * CELULA, 1);
    this.janela = { x: jx, y: jy, l: jl, a: ja };
  }

  montarPainel() {
    const px = this.tab.x + COLUNAS * CELULA + 14, py = this.tab.y;
    const g = this.add.graphics().setDepth(1);
    retRedondo(g, px, py, 136, 54, 3, 0xe0c495);
    this.add.text(px + 6, py + 6, 'PROXIMO', { fontFamily: FONTE, fontSize: '8px', color: TEMA_PERGAMINHO.nome }).setDepth(2);
    this.proximaPos = { x: px + 68, y: py + 34 };

    retRedondo(g, px, py + 62, 136, 44, 3, 0xe0c495);
    this.add.text(px + 6, py + 68, 'PROTOCOLADOS', { fontFamily: FONTE, fontSize: '8px', color: TEMA_PERGAMINHO.nome }).setDepth(2);
    this.textoLinhas = this.add.text(px + 68, py + 90, `0 / ${META_LINHAS}`, { fontFamily: FONTE, fontSize: '10px', color: '#3a2418' })
      .setOrigin(0.5).setDepth(2);

    // dicas de controle (no toque, os botoes falam por si)
    if (!TEM_TOQUE) {
      this.add.text(px + 4, py + 118, '◀ ▶ mover\n▲ girar\n▼ descer\nespaco: soltar', {
        fontFamily: FONTE, fontSize: '8px', color: '#5c4632', lineSpacing: 5,
      }).setDepth(2);
    }

    // area das mensagens do Victor (aparece por cima da janela)
    this.gMensagem = this.add.graphics().setDepth(30).setVisible(false);
    this.retratoVictor = this.add.image(0, 0, 'retratoVictor').setDepth(31).setVisible(false).setScale(0.5);
    this.textoMensagem = this.add.text(0, 0, '', { fontFamily: FONTE, fontSize: '8px', color: TEMA_PERGAMINHO.texto, wordWrap: { width: 120 }, lineSpacing: 5 })
      .setDepth(31).setVisible(false);
  }

  // A tela "liga": um flash e a janela aparece.
  abrirTela(depois) {
    const { width: l, height: a } = this.scale;
    const tampa = this.add.rectangle(0, 0, l, a, 0x000000, 1).setOrigin(0, 0).setDepth(100);
    const t = this.add.text(l / 2, a / 2, 'abrindo o sistema...', { fontFamily: FONTE, fontSize: '8px', color: COR.creme }).setOrigin(0.5).setDepth(101);
    this.time.delayedCall(900, () => {
      t.destroy();
      this.tweens.add({ targets: tampa, fillAlpha: 0, duration: 350, onComplete: () => { tampa.destroy(); depois(); } });
    });
  }

  // ---- Pecas -------------------------------------------------------------

  // Sorteio em saco: todas as sete antes de repetir, como no Tetris moderno.
  sortear() {
    if (this.saco.length === 0) this.saco = Phaser.Utils.Array.Shuffle([...PECAS]);
    const base = this.saco.pop();
    return { ...base, forma: base.forma.map((l) => [...l]) };
  }

  novaPeca() {
    this.peca = this.proxima;
    this.proxima = this.sortear();
    this.px = Math.floor((COLUNAS - this.peca.forma[0].length) / 2);
    this.py = 0;
    this.acumulado = 0;
    this.travaEm = 0;
    this.xVisual = this.px * CELULA;
    this.desenharProxima();
    if (this.colide(this.px, this.py, this.peca.forma)) { this.afogou(); return; }
    this.desenhar();
  }

  colide(px, py, forma) {
    for (let r = 0; r < forma.length; r++) {
      for (let c = 0; c < forma[r].length; c++) {
        if (!forma[r][c]) continue;
        const gx = px + c, gy = py + r;
        if (gx < 0 || gx >= COLUNAS || gy >= LINHAS) return true;
        if (gy >= 0 && this.grade[gy][gx]) return true;
      }
    }
    return false;
  }

  girar() {
    som.tocar('letra');
    const f = this.peca.forma;
    const nova = f[0].map((_, c) => f.map((linha) => linha[c]).reverse());
    // chute de parede: tenta no lugar, depois um passo para cada lado
    for (const dx of [0, -1, 1, -2, 2]) {
      if (!this.colide(this.px + dx, this.py, nova)) {
        this.peca.forma = nova;
        this.px += dx;
        this.desenhar();
        return;
      }
    }
  }

  mover(dx) {
    if (!this.colide(this.px + dx, this.py, this.peca.forma)) { this.px += dx; this.desenhar(); }
  }

  descer() {
    if (!this.colide(this.px, this.py + 1, this.peca.forma)) { this.py++; this.desenhar(); return true; }
    this.fixar();
    return false;
  }

  soltar() {
    while (!this.colide(this.px, this.py + 1, this.peca.forma)) this.py++;
    this.xVisual = this.px * CELULA;
    this.acumulado = 0;
    this.cameras.main.shake(60, 0.003);
    this.fixar();
  }

  fixar() {
    som.tocar('fixar');
    const f = this.peca.forma;
    for (let r = 0; r < f.length; r++) for (let c = 0; c < f[r].length; c++) {
      if (f[r][c] && this.py + r >= 0) this.grade[this.py + r][this.px + c] = this.peca;
    }
    const completas = [];
    for (let r = 0; r < LINHAS; r++) if (this.grade[r].every(Boolean)) completas.push(r);
    if (completas.length) { this.protocolar(completas); return; }
    this.novaPeca();
  }

  // Linha completa: pisca, some, e a pilha desce.
  protocolar(linhasCompletas) {
    som.tocar('linha');
    this.ativo = false;
    this.peca = null;
    this.desenhar();
    const flash = this.add.graphics().setDepth(20);
    linhasCompletas.forEach((r) => {
      flash.fillStyle(0xffffff, 0.9).fillRect(this.tab.x, this.tab.y + r * CELULA, COLUNAS * CELULA, CELULA);
      // folhas de papel voando para fora da mesa
      for (let i = 0; i < 8; i++) {
        const f = this.add.rectangle(this.tab.x + 10 + i * 12, this.tab.y + r * CELULA + 6, 6, 8, 0xf2e6cc).setDepth(22);
        this.tweens.add({ targets: f, x: f.x + Phaser.Math.Between(-40, 40), y: f.y - Phaser.Math.Between(30, 70), angle: Phaser.Math.Between(-120, 120), alpha: 0, duration: Phaser.Math.Between(500, 800), onComplete: () => f.destroy() });
      }
    });
    this.tweens.add({
      targets: flash, alpha: 0, duration: 260, yoyo: true, repeat: 1,
      onComplete: () => {
        flash.destroy();
        // quantas linhas removidas existem abaixo de cada linha que sobrou:
        // e o tanto que ela vai descer na animacao
        const desloc = [];
        for (let r = 0; r < LINHAS; r++) desloc[r] = linhasCompletas.filter((c) => c > r).length;
        const restantes = this.grade.map((linha, r) => ({ linha, desce: desloc[r] })).filter((_, r) => !linhasCompletas.includes(r));
        this.grade = [];
        this.offsets = [];
        for (let i = 0; i < linhasCompletas.length; i++) { this.grade.push(Array(COLUNAS).fill(null)); this.offsets.push(0); }
        restantes.forEach(({ linha, desce }) => { this.grade.push(linha); this.offsets.push(desce); });
        this.queda = { progresso: 0 };
        this.tweens.add({
          targets: this.queda, progresso: 1, duration: 240, ease: 'Bounce.easeOut',
          onUpdate: () => this.desenhar(),
          onComplete: () => { this.queda = null; this.offsets = null; this.cameras.main.shake(70, 0.003); this.desenhar(); },
        });
        const antes = this.linhas;
        this.linhas += linhasCompletas.length;
        this.textoLinhas.setText(`${Math.min(this.linhas, META_LINHAS)} / ${META_LINHAS}`);
        this.atualizarRelogio();
        this.flutuar(linhasCompletas.length > 1 ? `${linhasCompletas.length} processos protocolados!` : 'processo protocolado');
        if (this.linhas >= META_LINHAS) { this.desenhar(); this.fimDoExpediente(); return; }
        // a cada duas linhas o Victor aparece e o ritmo sobe
        if (Math.floor(this.linhas / 2) > Math.floor(antes / 2)) {
          this.gravidade = Math.round(this.gravidade * ACELERACAO);
          this.mensagemVictor(FALAS_VICTOR[Math.floor(this.linhas / 2) - 1] || 'Mais um.');
        }
        // a proxima peca so entra depois que as pastas terminaram de cair
        this.time.delayedCall(260, () => { this.ativo = true; this.novaPeca(); });
      },
    });
  }

  // O relogio da HUD anda das 08:15 ate as 17:00 conforme as linhas.
  atualizarRelogio() {
    const minutos = 8 * 60 + 15 + Math.round((17 * 60 - (8 * 60 + 15)) * Math.min(1, this.linhas / META_LINHAS));
    const txt = `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
    this.hud.setHorario(txt);
    this.relogioTela.setText(txt);
    this.hud.destacarRelogio();
  }

  // ---- Desenho -----------------------------------------------------------

  // Celula como uma pasta: corpo, aba no alto, luz na borda e sombra embaixo.
  celula(g, x, y, peca) {
    g.fillStyle(peca.sombra, 1).fillRect(x, y, CELULA, CELULA);
    g.fillStyle(peca.cor, 1).fillRect(x + 1, y + 1, CELULA - 2, CELULA - 2);
    g.fillStyle(peca.luz, 1).fillRect(x + 1, y + 1, CELULA - 2, 1).fillRect(x + 1, y + 1, 1, CELULA - 2);
    g.fillStyle(peca.sombra, 1).fillRect(x + 2, y + 4, 5, 1);
    g.fillStyle(peca.luz, 1).fillRect(x + 3, y + 7, CELULA - 6, 1).fillRect(x + 3, y + 9, CELULA - 8, 1);
  }

  desenhar() {
    const g = this.gPecas;
    g.clear();
    const { x: tx, y: ty } = this.tab;
    for (let r = 0; r < LINHAS; r++) for (let c = 0; c < COLUNAS; c++) {
      if (!this.grade[r][c]) continue;
      // durante a queda, a linha vem de onde estava (acima) ate o lugar novo
      const sobe = this.queda && this.offsets ? this.offsets[r] * CELULA * (1 - this.queda.progresso) : 0;
      this.celula(g, tx + c * CELULA, ty + r * CELULA - sobe, this.grade[r][c]);
    }
    if (!this.peca) return;
    // sombra de onde a peca vai cair
    let gy = this.py;
    while (!this.colide(this.px, gy + 1, this.peca.forma)) gy++;
    const f = this.peca.forma;
    for (let r = 0; r < f.length; r++) for (let c = 0; c < f[r].length; c++) {
      if (!f[r][c]) continue;
      if (gy + r >= 0 && gy !== this.py) {
        g.fillStyle(this.peca.cor, 0.22).fillRect(tx + (this.px + c) * CELULA + 1, ty + (gy + r) * CELULA + 1, CELULA - 2, CELULA - 2);
      }
    }
    // a peca desenha entre uma linha e outra, na fracao do tempo de queda
    const apoiada = this.colide(this.px, this.py + 1, f);
    const fracao = apoiada ? 0 : Math.min(1, this.acumulado / this.gravidade);
    const dy = fracao * CELULA;
    for (let r = 0; r < f.length; r++) for (let c = 0; c < f[r].length; c++) {
      if (f[r][c] && this.py + r >= 0) this.celula(g, tx + this.xVisual + c * CELULA, ty + (this.py + r) * CELULA + dy, this.peca);
    }
  }

  desenharProxima() {
    const g = this.gProxima;
    g.clear();
    const f = this.proxima.forma;
    const ox = this.proximaPos.x - (f[0].length * CELULA) / 2, oy = this.proximaPos.y - (f.length * CELULA) / 2;
    for (let r = 0; r < f.length; r++) for (let c = 0; c < f[r].length; c++) {
      if (f[r][c]) this.celula(g, Math.round(ox + c * CELULA), Math.round(oy + r * CELULA), this.proxima);
    }
  }

  flutuar(texto) {
    const t = this.add.text(this.tab.x + (COLUNAS * CELULA) / 2, this.tab.y + 60, texto, {
      fontFamily: FONTE, fontSize: '8px', color: COR.amarelo, align: 'center', wordWrap: { width: COLUNAS * CELULA - 8 },
    }).setOrigin(0.5).setDepth(40).setShadow(0, 1, '#000000', 0);
    this.tweens.add({ targets: t, y: t.y - 16, alpha: 0, duration: 1100, onComplete: () => t.destroy() });
  }

  // Notificacao do Victor, com o retrato dele, descendo do alto da tela.
  mensagemVictor(texto) {
    const { width: l } = this.scale;
    const x = 8, y = 22, w = 150, h = 42;
    void l;
    const g = this.gMensagem;
    g.clear();
    caixaPergaminho(g, x, y, w, h);
    molduraRetrato(g, x + 6, y + 6, 30);
    this.retratoVictor.setPosition(x + 21, y + 21).setVisible(true);
    this.textoMensagem.setPosition(x + 42, y + 10).setText('Victor:\n' + texto).setVisible(true);
    this.gMensagem.setVisible(true);
    [g, this.retratoVictor, this.textoMensagem].forEach((o) => o.setAlpha(0));
    this.tweens.add({ targets: [g, this.retratoVictor, this.textoMensagem], alpha: 1, duration: 200 });
    this.time.delayedCall(2600, () => {
      this.tweens.add({ targets: [g, this.retratoVictor, this.textoMensagem], alpha: 0, duration: 300, onComplete: () => {
        g.setVisible(false); this.retratoVictor.setVisible(false); this.textoMensagem.setVisible(false);
      } });
    });
  }

  // ---- Entrada -----------------------------------------------------------

  ligarTeclas() {
    const k = this.input.keyboard;
    const guard = (fn) => () => { if (this.ativo && this.peca && !this.finalizada) fn(); };
    k.on('keydown-LEFT', guard(() => this.mover(-1)));
    k.on('keydown-RIGHT', guard(() => this.mover(1)));
    k.on('keydown-A', guard(() => this.mover(-1)));
    k.on('keydown-D', guard(() => this.mover(1)));
    k.on('keydown-UP', guard(() => this.girar()));
    k.on('keydown-W', guard(() => this.girar()));
    k.on('keydown-SPACE', guard(() => this.soltar()));
    this.teclaBaixo = k.addKey('DOWN');
    this.teclaS = k.addKey('S');
    this.toqueBaixo = false;
    if (TEM_TOQUE) {
      const { width: l, height: a } = this.scale;
      const y = a - 46;
      botaoToque(this, 32, y, '◀', { aoTocar: guard(() => this.mover(-1)) });
      botaoToque(this, 88, y, '▶', { aoTocar: guard(() => this.mover(1)) });
      botaoToque(this, l - 32, y, '⤓', { aoTocar: guard(() => this.soltar()) });
      botaoToque(this, l - 88, y, '↻', { aoTocar: guard(() => this.girar()) });
      botaoToque(this, l - 144, y, '▼', { aoPressionar: () => { this.toqueBaixo = true; }, aoSoltar: () => { this.toqueBaixo = false; } });
    }
  }

  update(tempo, delta) {
    if (!this.ativo || !this.peca || this.finalizada) return;
    const rapido = this.teclaBaixo.isDown || this.teclaS.isDown || this.toqueBaixo;

    // deslize horizontal suave ate a coluna logica
    const alvoX = this.px * CELULA;
    this.xVisual += (alvoX - this.xVisual) * Math.min(1, delta / 40);
    if (Math.abs(alvoX - this.xVisual) < 0.3) this.xVisual = alvoX;

    if (this.colide(this.px, this.py + 1, this.peca.forma)) {
      // apoiada: um instante para deslizar antes de fixar
      this.travaEm += delta * (rapido ? 4 : 1);
      this.acumulado = 0;
      if (this.travaEm >= 260) { this.fixar(); return; }
    } else {
      this.travaEm = 0;
      this.acumulado += delta * (rapido ? 8 : 1);
      if (this.acumulado >= this.gravidade) {
        this.acumulado -= this.gravidade;
        this.py++;
      }
    }
    this.desenhar();
  }

  // ---- Desfechos ---------------------------------------------------------

  fimDoExpediente() {
    this.ativo = false;
    this.peca = null;
    this.hud.setHorario('17:00');
    this.relogioTela.setText('17:00');
    const { width: l, height: a } = this.scale;
    const t = this.add.text(l / 2, a / 2 - 10, 'Fim do expediente', { fontFamily: FONTE, fontSize: '14px', color: COR.amarelo })
      .setOrigin(0.5).setDepth(60).setShadow(0, 2, '#2a0f14', 0).setAlpha(0);
    const fundo = this.add.rectangle(0, 0, l, a, 0x000000, 0).setOrigin(0, 0).setDepth(59);
    this.tweens.add({ targets: fundo, fillAlpha: 0.55, duration: 500 });
    this.tweens.add({ targets: t, alpha: 1, duration: 500, delay: 200 });
    this.time.delayedCall(2200, () => this.venceu({ legenda: 'Expediente cumprido. Agora, a faculdade.' }));
  }

  afogou() {
    this.ativo = false;
    this.peca = null;
    this.desenhar();
    // a pilha treme e a tela fica vermelha
    this.cameras.main.shake(300, 0.01);
    const { width: l, height: a } = this.scale;
    const t = this.add.text(l / 2, a / 2 - 10, 'a mesa afogou em processos', { fontFamily: FONTE, fontSize: '10px', color: '#ff8a7a' })
      .setOrigin(0.5).setDepth(60).setShadow(0, 2, '#2a0f14', 0);
    const fundo = this.add.rectangle(0, 0, l, a, 0x3a0a0a, 0).setOrigin(0, 0).setDepth(59);
    this.tweens.add({ targets: fundo, fillAlpha: 0.7, duration: 900, onComplete: () => this.perdeu() });
    void t;
  }
}
