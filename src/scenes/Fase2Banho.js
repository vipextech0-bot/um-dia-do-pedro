import { FaseBase } from './FaseBase.js';
import { banheiro } from '../arte/cenarios.js';
import { carregarSprites } from '../arte/sprites.js';
import { caixaPergaminho, retRedondo, TEMA_PERGAMINHO } from '../ui/moldura.js';
import { COR, FONTE } from '../config/paleta.js';
import { circuloPixel } from '../arte/pixel.js';
import { som } from '../audio/som.js';
import { TEM_TOQUE, zonasLaterais, vibrar } from '../ui/Toque.js';

// FASE 2 — Banho, 07:10.
// Bolhas de sabao caem do chuveiro; o Pedro anda para os lados para pegar
// 15 delas em 25 segundos e desviar das gotas de agua fria. Tres gotas
// frias, ou o tempo acabar, e a fase termina na Tela de Recomeco.

const META_BOLHAS = 15;
const TEMPO_TOTAL = 25;         // segundos
const VIDAS = 3;
const VELOCIDADE_PEDRO = 165;   // px/s

export class Fase2Banho extends FaseBase {
  constructor() { super('Fase2Banho'); }

  iniciar() {
    carregarSprites(this);
    this.cenario = banheiro(this);

    this.bolhas = 0;
    this.vidas = VIDAS;
    this.tempo = TEMPO_TOTAL;
    this.ativo = false;
    this.itens = [];              // bolhas e gotas em queda
    this.proximaBolha = 0;
    this.proximaGota = 2.0;       // as bolhas aparecem antes da primeira gota
    this.congeladoAte = 0;
    this.invulneravelAte = 0;
    this.sequencia = 0;        // bolhas seguidas sem deixar cair

    this.montarAgua();
    this.montarDetalhes();
    this.montarPedro();
    this.montarUI();
    this.montarVapor();

    this.cursores = this.input.keyboard.createCursorKeys();
    this.teclasAD = this.input.keyboard.addKeys({ a: 'A', d: 'D' });
    this.toque = TEM_TOQUE ? zonasLaterais(this) : { esquerda: false, direita: false };
    this.respingoEm = 0;

    this.contagemRegressiva(() => { this.ativo = true; });
  }

  // ---- Cenografia animada ------------------------------------------------

  // Agua do chuveiro: colunas de tracinhos que descem sem parar.
  montarAgua() {
    const { chuveiro, chao } = this.cenario;
    this.agua = this.add.graphics().setDepth(2);
    this.fiosAgua = [];
    for (let i = 0; i < 14; i++) {
      this.fiosAgua.push({
        x: chuveiro.x - 19 + i * 3 + Phaser.Math.Between(0, 1),
        fase: Math.random() * 40,
        vel: Phaser.Math.Between(150, 210),
      });
    }
    this.topoAgua = chuveiro.y;
    this.fundoAgua = chao + 6;
    // poca brilhando no chao, embaixo do chuveiro
    const poca = this.add.graphics().setDepth(1);
    for (let i = 0; i < 3; i++) {
      poca.fillStyle(0x9cc4d8, 0.25 - i * 0.06);
      poca.fillRect(chuveiro.x - 40 - i * 14, chao + 10 + i * 4, 80 + i * 28, 4);
    }
  }

  desenharAgua(delta) {
    const g = this.agua;
    g.clear();
    const altura = this.fundoAgua - this.topoAgua;
    this.fiosAgua.forEach((f) => {
      f.fase = (f.fase + (f.vel * delta) / 1000) % 26;
      for (let y = this.topoAgua + f.fase; y < this.fundoAgua; y += 26) {
        const comp = Math.min(12, this.fundoAgua - y);
        g.fillStyle(0xbfe4ff, 0.75).fillRect(f.x, Math.round(y), 1, comp);
        g.fillStyle(0xffffff, 0.5).fillRect(f.x, Math.round(y), 1, 3);
      }
    });
    // respingos no chao
    for (let i = 0; i < 4; i++) {
      const x = this.cenario.chuveiro.x - 22 + Phaser.Math.Between(0, 44);
      g.fillStyle(0xdff2ff, 0.7).fillRect(x, this.fundoAgua - Phaser.Math.Between(1, 6), 1, 1);
    }
    void altura;
  }

  // Pato de borracha, gotas escorrendo no vidro do box e o espelho embacando.
  montarDetalhes() {
    const { chao } = this.cenario;
    this.add.image(84, chao + 6, 'pato').setOrigin(0.5, 1).setDepth(4);
    // gotas no vidro
    this.gotasVidro = this.add.graphics().setDepth(-94);
    this.pingosVidro = Array.from({ length: 6 }, () => ({ x: 108 + Phaser.Math.Between(0, 20), y: Phaser.Math.Between(24, 200), v: Phaser.Math.Between(6, 14) }));
    // vapor no espelho: vai ficando opaco com o tempo
    this.embacado = this.add.rectangle(22, 28, 60, 48, 0xe8f2f8, 0).setOrigin(0, 0).setDepth(-98);
  }

  atualizarDetalhes(dt) {
    const g = this.gotasVidro;
    g.clear();
    this.pingosVidro.forEach((p) => {
      p.y += p.v * dt;
      if (p.y > this.cenario.chao - 4) { p.y = 24; p.x = 108 + Phaser.Math.Between(0, 20); }
      g.fillStyle(0xdff2ff, 0.7).fillRect(p.x, p.y, 1, 3);
      g.fillStyle(0xffffff, 0.9).fillRect(p.x, p.y, 1, 1);
    });
    if (this.embacado) this.embacado.setFillStyle(0xe8f2f8, Math.min(0.55, 0.55 * this.progresso));
  }

  montarVapor() {
    const { chuveiro, chao } = this.cenario;
    this.time.addEvent({
      delay: 260, loop: true,
      callback: () => {
        if (this.finalizada) return;
        const v = this.add.graphics().setDepth(3).setBlendMode(Phaser.BlendModes.ADD);
        circuloPixel(v, 0, 0, Phaser.Math.Between(6, 12), 0xffffff, 0.06);
        circuloPixel(v, 0, 0, Phaser.Math.Between(3, 6), 0xffffff, 0.07);
        v.setPosition(chuveiro.x + Phaser.Math.Between(-50, 50), chao - Phaser.Math.Between(0, 30));
        this.tweens.add({
          targets: v, y: v.y - Phaser.Math.Between(60, 110), x: v.x + Phaser.Math.Between(-20, 20),
          alpha: 0, scale: 1.8, duration: Phaser.Math.Between(2200, 3400), onComplete: () => v.destroy(),
        });
      },
    });
  }

  montarPedro() {
    const { chao, chuveiro } = this.cenario;
    this.pedro = this.add.image(chuveiro.x, chao + 6, 'pedroBanho0').setOrigin(0.5, 1).setDepth(10);
    this.quadroPasso = 0;
    this.tempoPasso = 0;
    this.sombraPedro = this.add.graphics().setDepth(9);
  }

  desenharSombra() {
    const g = this.sombraPedro;
    g.clear();
    g.fillStyle(0x000000, 0.28);
    for (let i = 0; i < 3; i++) g.fillRect(this.pedro.x - 11 + i, this.pedro.y - 2 + i, 22 - i * 2, 1);
  }

  // ---- Interface ---------------------------------------------------------

  montarUI() {
    const { width: l, height: a } = this.scale;

    // cronometro no alto, no centro
    const cg = this.add.graphics().setDepth(20);
    caixaPergaminho(cg, l / 2 - 40, 22, 80, 26);
    this.textoTempo = this.add.text(l / 2, 35, TEMPO_TOTAL.toFixed(1), {
      fontFamily: FONTE, fontSize: '10px', color: TEMA_PERGAMINHO.nome,
    }).setOrigin(0.5).setDepth(21);

    // vidas (coracoes) no alto a direita
    this.coracoes = [];
    for (let i = 0; i < VIDAS; i++) {
      this.coracoes.push(this.add.image(l - 16 - i * 13, 30, 'vida').setDepth(21));
    }

    // barra de limpeza no rodape
    const bx = 30, by = a - 24, bl = l - 60, ba = 12;
    this.barra = { x: bx, y: by, l: bl, a: ba };
    const g = this.add.graphics().setDepth(20);
    caixaPergaminho(g, bx - 6, by - 11, bl + 12, ba + 10);
    this.preenchimento = this.add.graphics().setDepth(21);
    this.add.text(bx + 6, by - 1, 'LIMPEZA', {
      fontFamily: FONTE, fontSize: '8px', color: TEMA_PERGAMINHO.nome,
    }).setOrigin(0, 0.5).setDepth(22);
    this.contador = this.add.text(l - 34, by - 1, `0/${META_BOLHAS}`, {
      fontFamily: FONTE, fontSize: '8px', color: TEMA_PERGAMINHO.nome,
    }).setOrigin(1, 0.5).setDepth(22);
    this.desenharBarra();
  }

  desenharBarra() {
    const { x, y, l, a } = this.barra;
    const g = this.preenchimento;
    g.clear();
    const inicio = x + 72, largura = l - 128;
    retRedondo(g, inicio, y - 5, largura, a - 2, 2, 0x3a2418);
    const cheio = Math.round((largura - 2) * Math.min(1, this.bolhas / META_BOLHAS));
    if (cheio > 0) {
      retRedondo(g, inicio + 1, y - 4, cheio, a - 4, 2, 0x7ad0f0);
      g.fillStyle(0xffffff, 0.45).fillRect(inicio + 2, y - 4, Math.max(0, cheio - 2), 1);
    }
  }

  // "3, 2, 1, JA!" antes de liberar o controle, com a dica das setas.
  contagemRegressiva(depois) {
    const { width: l } = this.scale;
    const dica = this.add.text(l / 2, 150, '◀ ▶  para andar', {
      fontFamily: FONTE, fontSize: '8px', color: COR.creme,
    }).setOrigin(0.5).setDepth(30).setShadow(0, 1, '#000000', 0);
    const passos = ['3', '2', '1', 'JA!'];
    passos.forEach((txt, i) => {
      this.time.delayedCall(700 * i, () => {
        const t = this.add.text(l / 2, 118, txt, {
          fontFamily: FONTE, fontSize: '18px', color: COR.amarelo,
        }).setOrigin(0.5).setDepth(30).setShadow(0, 2, '#2a0f14', 0).setScale(1.6);
        this.tweens.add({ targets: t, scale: 1, alpha: 0.2, duration: 600, onComplete: () => t.destroy() });
        if (i === passos.length - 1) { dica.destroy(); depois(); }
      });
    });
  }

  aviso(texto, cor = COR.amarelo, duracao = 1100, depois = null) {
    const { width: l } = this.scale;
    const t = this.add.text(l / 2, 118, texto, {
      fontFamily: FONTE, fontSize: '14px', color: cor,
    }).setOrigin(0.5).setDepth(30).setShadow(0, 2, '#2a0f14', 0);
    this.tweens.add({ targets: t, scale: 1.12, duration: 130, yoyo: true, repeat: 2 });
    this.time.delayedCall(duracao, () => { t.destroy(); depois && depois(); });
  }

  // ---- Mecanica ----------------------------------------------------------

  // A dificuldade cresce com o tempo: intervalos menores e queda mais rapida.
  get progresso() { return 1 - this.tempo / TEMPO_TOTAL; }

  soltarBolha() {
    const { area } = this.cenario;
    const grande = Math.random() < 0.6;
    const img = this.add.image(Phaser.Math.Between(area.esquerda, area.direita), -12, grande ? 'bolhaG' : 'bolhaP')
      .setDepth(12);
    this.itens.push({
      tipo: 'bolha', img, raio: grande ? 7 : 5,
      vel: Phaser.Math.Between(55, 75) + this.progresso * 45,
      // as bolhas balancam de um lado para o outro enquanto caem
      amp: Phaser.Math.Between(10, 26), freq: Phaser.Math.FloatBetween(1.2, 2.4),
      x0: img.x, t: 0, rot: Phaser.Math.FloatBetween(-0.4, 0.4),
    });
  }

  soltarGota(x) {
    const { area } = this.cenario;
    const img = this.add.image(x ?? Phaser.Math.Between(area.esquerda, area.direita), -14, 'gota').setDepth(12);
    this.itens.push({
      tipo: 'gota', img, raio: 4,
      vel: Phaser.Math.Between(110, 140) + this.progresso * 55,
      amp: 0, freq: 0, x0: img.x, t: 0,
    });
  }

  update(tempo, delta) {
    this.desenharAgua(delta);
    if (!this.ativo || this.finalizada) return;
    const dt = delta / 1000;
    this.atualizarDetalhes(dt);

    // cronometro
    this.tempo -= dt;
    this.textoTempo.setText(Math.max(0, this.tempo).toFixed(1));
    if (this.tempo <= 5) this.textoTempo.setColor('#c8302a');
    if (this.tempo <= 0) { this.tempoAcabou(); return; }

    // movimento do Pedro
    const esquerda = this.cursores.left.isDown || this.teclasAD.a.isDown || this.toque.esquerda;
    const direita = this.cursores.right.isDown || this.teclasAD.d.isDown || this.toque.direita;
    const congelado = tempo < this.congeladoAte;
    let andou = false;
    if (!congelado && esquerda !== direita) {
      const dir = direita ? 1 : -1;
      this.pedro.x = Phaser.Math.Clamp(this.pedro.x + dir * VELOCIDADE_PEDRO * dt,
        this.cenario.area.esquerda, this.cenario.area.direita);
      this.pedro.setFlipX(dir < 0);
      andou = true;
    }
    this.animarPasso(delta, andou, congelado);
    this.desenharSombra();

    // debaixo da ducha, a agua respinga na cabeca
    this.respingoEm -= delta;
    if (Math.abs(this.pedro.x - this.cenario.chuveiro.x) < 26 && this.respingoEm <= 0) {
      this.respingoEm = 110;
      for (let i = 0; i < 2; i++) {
        const r = this.add.rectangle(this.pedro.x + Phaser.Math.Between(-6, 6), this.pedro.y - 46, 1, 2, 0xdff2ff).setDepth(11);
        this.tweens.add({ targets: r, x: r.x + Phaser.Math.Between(-10, 10), y: r.y - Phaser.Math.Between(4, 10), alpha: 0, duration: 260, onComplete: () => r.destroy() });
      }
    }

    // geracao de itens, com ritmo crescente
    this.proximaBolha -= dt;
    if (this.proximaBolha <= 0) {
      this.soltarBolha();
      this.proximaBolha = Phaser.Math.FloatBetween(0.55, 0.85) - this.progresso * 0.25;
    }
    this.proximaGota -= dt;
    if (this.proximaGota <= 0) {
      this.soltarGota();
      // na segunda metade, as gotas as vezes vem em dupla, uma em cima do Pedro
      if (this.progresso > 0.55 && Math.random() < 0.3) this.soltarGota(this.pedro.x + Phaser.Math.Between(-28, 28));
      this.proximaGota = Phaser.Math.FloatBetween(1.25, 1.8) - this.progresso * 0.4;
    }

    this.moverItens(dt);
  }

  animarPasso(delta, andou, congelado) {
    if (congelado) { this.pedro.setTexture('pedroBanhoFrio'); return; }
    if (!andou) { this.pedro.setTexture('pedroBanho0'); this.tempoPasso = 0; return; }
    this.tempoPasso += delta;
    if (this.tempoPasso > 110) {
      this.tempoPasso = 0;
      this.quadroPasso = (this.quadroPasso + 1) % 4;
      this.pedro.setTexture(['pedroBanho1', 'pedroBanho0', 'pedroBanho2', 'pedroBanho0'][this.quadroPasso]);
    }
  }

  moverItens(dt) {
    const { chao } = this.cenario;
    // caixa do corpo do Pedro (ombros ate os pes)
    const px = this.pedro.x, pyTopo = this.pedro.y - 44, pyBase = this.pedro.y - 4;
    const restantes = [];
    for (const it of this.itens) {
      it.t += dt;
      it.img.y += it.vel * dt;
      if (it.amp) it.img.x = it.x0 + Math.sin(it.t * it.freq * Math.PI) * it.amp;
      if (it.rot) it.img.rotation += it.rot * dt;

      const folga = it.tipo === 'bolha' ? 12 : 7;
      const dentro = Math.abs(it.img.x - px) < folga + it.raio && it.img.y + it.raio > pyTopo && it.img.y - it.raio < pyBase;
      if (dentro) {
        if (it.tipo === 'gota' && this.time.now < this.invulneravelAte) { restantes.push(it); continue; }
        if (it.tipo === 'bolha') this.pegouBolha(it); else this.levouGotaFria(it);
        it.img.destroy();
        continue;
      }
      if (it.img.y > chao + 4) {
        // estourou no chao sem ninguem pegar
        if (it.tipo === 'bolha') { this.estourar(it.img.x, chao + 2, 0xbfe4ff, 4); this.sequencia = 0; }
        else this.estourar(it.img.x, chao + 2, 0x6ab8f0, 3);
        it.img.destroy();
        continue;
      }
      restantes.push(it);
    }
    this.itens = restantes;
  }

  pegouBolha(it) {
    som.tocar('pop');
    this.bolhas++;
    this.sequencia++;
    if (this.sequencia % 3 === 0 && this.bolhas < META_BOLHAS) {
      this.bolhas++;
      this.flutuar(`sequencia x${this.sequencia}  +1`, it.img.x, it.img.y - 20, '#ffd66b');
      som.tocar('moeda');
    }
    this.contador.setText(`${this.bolhas}/${META_BOLHAS}`);
    this.desenharBarra();
    this.estourar(it.img.x, it.img.y, 0xffffff, 6);
    this.flutuar('+1', it.img.x, it.img.y - 8, '#bfe4ff');
    this.tweens.add({ targets: this.pedro, scaleY: 1.06, duration: 70, yoyo: true });
    if (this.bolhas >= META_BOLHAS) this.limpo();
  }

  levouGotaFria(it) {
    som.tocar('gota');
    vibrar(80);
    this.sequencia = 0;
    this.vidas--;
    this.coracoes[this.vidas].setTexture('vidaVazia');
    this.tweens.add({ targets: this.coracoes[this.vidas], scale: 1.5, duration: 120, yoyo: true });
    this.estourar(it.img.x, it.img.y, 0x6ab8f0, 8);
    this.flutuar('BRR!', this.pedro.x, this.pedro.y - 52, '#6ab8f0');
    this.cameras.main.shake(160, 0.006);
    this.cameras.main.flash(180, 120, 180, 240);
    // congela o Pedro por um instante, tremendo, e ele fica imune enquanto pisca
    this.congeladoAte = this.time.now + 500;
    this.invulneravelAte = this.time.now + 1400;
    this.tweens.add({ targets: this.pedro, alpha: 0.35, duration: 90, yoyo: true, repeat: 7, onComplete: () => this.pedro.setAlpha(1) });
    this.tweens.add({ targets: this.pedro, x: this.pedro.x + 2, duration: 40, yoyo: true, repeat: 12 });
    this.pedro.setTint(0xa8c8ff);
    this.time.delayedCall(500, () => this.pedro.clearTint());
    if (this.vidas <= 0) this.congelou();
  }

  // Particulas em cruz, saindo do ponto e sumindo.
  estourar(x, y, cor, quantidade) {
    for (let i = 0; i < quantidade; i++) {
      const p = this.add.rectangle(x, y, 2, 2, cor).setDepth(13);
      const ang = (i / quantidade) * Math.PI * 2 + Math.random() * 0.5;
      this.tweens.add({
        targets: p, x: x + Math.cos(ang) * Phaser.Math.Between(8, 18), y: y + Math.sin(ang) * Phaser.Math.Between(8, 18) + 6,
        alpha: 0, duration: Phaser.Math.Between(260, 420), onComplete: () => p.destroy(),
      });
    }
  }

  flutuar(texto, x, y, cor) {
    const t = this.add.text(x, y, texto, { fontFamily: FONTE, fontSize: '8px', color: cor })
      .setOrigin(0.5).setDepth(31).setShadow(0, 1, '#000000', 0);
    this.tweens.add({ targets: t, y: y - 18, alpha: 0, duration: 700, onComplete: () => t.destroy() });
  }

  // ---- Desfechos ---------------------------------------------------------

  encerrar() {
    this.ativo = false;
    this.itens.forEach((it) => it.img.destroy());
    this.itens = [];
    this.pedro.clearTint();
  }

  limpo() {
    this.encerrar();
    this.pedro.setTexture('pedroBanho0');
    this.tweens.add({ targets: this.pedro, y: this.pedro.y - 8, duration: 160, yoyo: true, repeat: 1, ease: 'Quad.easeOut' });
    // bolhinhas de comemoracao
    for (let i = 0; i < 10; i++) {
      this.time.delayedCall(i * 60, () => {
        const b = this.add.image(this.pedro.x + Phaser.Math.Between(-30, 30), this.pedro.y - 20, 'bolhaP').setDepth(12);
        this.tweens.add({ targets: b, y: b.y - Phaser.Math.Between(40, 80), alpha: 0, duration: 1200, onComplete: () => b.destroy() });
      });
    }
    this.aviso('LIMPO!', COR.amarelo, 1300, () => this.venceu({ legenda: 'Cheiroso. E atrasado.' }));
  }

  tempoAcabou() {
    this.encerrar();
    this.textoTempo.setText('0.0');
    this.aviso('acabou o tempo', '#c8302a', 1100, () => this.escurecer());
  }

  congelou() {
    this.encerrar();
    this.pedro.setTexture('pedroBanhoFrio').setTint(0xa8c8ff);
    this.aviso('agua fria demais', '#6ab8f0', 1100, () => this.escurecer());
  }

  escurecer() {
    const { width: l, height: a } = this.scale;
    const escuro = this.add.rectangle(0, 0, l, a, 0x000000, 0).setOrigin(0, 0).setDepth(50);
    this.tweens.add({ targets: escuro, fillAlpha: 0.8, duration: 700, onComplete: () => this.perdeu() });
  }
}
