import { FaseBase } from './FaseBase.js';
import { carregarSprites } from '../arte/sprites.js';
import { caixaPergaminho, retRedondo, TEMA_PERGAMINHO } from '../ui/moldura.js';
import { COR, FONTE } from '../config/paleta.js';
import { faixaDither, retanguloDither, circuloPixel, haloDither } from '../arte/pixel.js';
import { som } from '../audio/som.js';
import { progresso } from '../config/progresso.js';
import { TEM_TOQUE, zonasLaterais, vibrar } from '../ui/Toque.js';

// FASE 3 — Onibus, 07:30.
// Runner de tres faixas visto de tras do onibus, com perspectiva: as coisas
// nascem no horizonte e crescem conforme se aproximam. 45 segundos ate o
// ponto do escritorio. Tres batidas e o onibus quebra.

const DURACAO = 45;               // segundos ate o ponto
const VIDAS = 3;
const FAIXAS = [-1, 0, 1];
const LARGURA_FAIXA_BASE = 118;   // distancia entre faixas no pe da tela
const VEL_INICIAL = 0.42;         // fracao do caminho (z) por segundo
const VEL_FINAL = 1.0;

export class Fase3Onibus extends FaseBase {
  constructor() { super('Fase3Onibus'); }

  iniciar() {
    carregarSprites(this);
    const { width: l, height: a } = this.scale;

    this.horizonte = 108;
    this.pe = a + 10;              // onde a estrada "sai" da tela
    this.cx = l / 2;

    this.tempo = 0;
    this.vidas = VIDAS;
    this.moedas = 0;
    this.faixa = 0;
    this.objetos = [];
    this.postes = [];
    this.rolagem = 0;
    this.proximoSpawn = 0;
    this.ativo = false;
    this.imuneAte = 0;
    this.chegando = false;
    this.freio = 1;
    this.placasPostas = 0;
    this.ultimaTroca = -9999;

    this.montarCeu();
    this.estrada = this.add.graphics().setDepth(0);
    this.montarOnibus();
    this.montarUI();

    this.cursores = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-LEFT', () => this.mudarFaixa(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this.mudarFaixa(1));
    this.input.keyboard.on('keydown-A', () => this.mudarFaixa(-1));
    this.input.keyboard.on('keydown-D', () => this.mudarFaixa(1));
    if (TEM_TOQUE) {
      // toque na metade esquerda/direita troca de faixa
      let antes = { esquerda: false, direita: false };
      zonasLaterais(this, (e) => {
        if (e.esquerda && !antes.esquerda) this.mudarFaixa(-1);
        if (e.direita && !antes.direita) this.mudarFaixa(1);
        antes = { ...e };
      });
    }

    this.contagem(() => { this.ativo = true; });
  }

  // ---- Perspectiva -------------------------------------------------------

  // z vai de 0 (horizonte) a 1 (pe da tela). O quadrado deixa as coisas
  // demorarem longe e passarem rapido perto, como numa estrada de verdade.
  projetar(faixa, z) {
    const p = z * z;
    return {
      x: this.cx + faixa * LARGURA_FAIXA_BASE * p,
      y: this.horizonte + (this.pe - this.horizonte) * p,
      escala: 0.12 + 0.88 * p,
    };
  }

  meiaLarguraEstrada(z) {
    const p = z * z;
    return 18 + (LARGURA_FAIXA_BASE * 1.5 + 24 - 18) * p;
  }

  // ---- Cenografia --------------------------------------------------------

  montarCeu() {
    const { width: l } = this.scale;
    const g = this.add.graphics().setDepth(-100);
    faixaDither(g, 0, 0, l, this.horizonte, 0x6e2a3c, 0xf2ab4f, 6);
    // sol baixo, a direita
    const halo = this.add.graphics().setDepth(-99).setBlendMode(Phaser.BlendModes.ADD);
    haloDither(halo, 380, 70, 14, 46, 0xffcf6b, 5, 1.2);
    circuloPixel(g, 380, 70, 14, 0xffd97a);
    circuloPixel(g, 380, 68, 9, 0xfff0b8);

    // skyline distante em duas camadas, que desliza devagar (parallax)
    this.skylines = [];
    [[0x4a2440, 0.45, 18, 42, -80], [0x2f1a2e, 0.9, 14, 30, -70]].forEach(([cor, vel, hmin, hmax, depth]) => {
      const sg = this.add.graphics().setDepth(depth);
      let x = -20;
      while (x < l * 2 + 40) {
        const w = Phaser.Math.Between(14, 30), h = Phaser.Math.Between(hmin, hmax);
        sg.fillStyle(cor, 1).fillRect(x, this.horizonte - h, w, h + 2);
        sg.fillStyle(0xffd66b, 1);
        for (let wy = this.horizonte - h + 4; wy < this.horizonte - 3; wy += 6) {
          for (let wx = x + 3; wx < x + w - 3; wx += 5) if (Math.random() < 0.25) sg.fillRect(wx, wy, 2, 2);
        }
        x += w + Phaser.Math.Between(2, 6);
      }
      this.skylines.push({ g: sg, vel, largura: l });
    });

    // nuvens deslizando devagar
    this.nuvens = [];
    for (let i = 0; i < 4; i++) {
      const n = this.add.graphics().setDepth(-95);
      const w = Phaser.Math.Between(26, 48);
      n.fillStyle(0xb0553f, 1).fillRect(-w / 2, 2, w, 4);
      n.fillStyle(0xe6885a, 1).fillRect(-w / 2, 0, w, 4).fillRect(-w / 4, -3, w / 2, 4);
      n.fillStyle(0xffc796, 1).fillRect(-w / 2 + 1, 0, w - 2, 1).fillRect(-w / 4 + 1, -3, w / 2 - 2, 1);
      n.setPosition(Phaser.Math.Between(0, l), Phaser.Math.Between(18, 60));
      this.nuvens.push({ g: n, vel: Phaser.Math.FloatBetween(3, 7) });
    }

  }

  desenharEstrada(dt) {
    const { width: l, height: a } = this.scale;
    const g = this.estrada;
    g.clear();

    // grama/calcada dos lados
    g.fillStyle(0x6b5a48, 1).fillRect(0, this.horizonte, l, a - this.horizonte);
    retanguloDither(g, 0, this.horizonte, l, 26, 0x8a7a62, 0x6b5a48, 0.5);
    retanguloDither(g, 0, this.horizonte + 26, l, a - this.horizonte - 26, 0x6b5a48, 0x5c4a3a, 0.35);
    // arbustos passando na beira, com a mesma rolagem dos postes
    for (let i = 0; i < 6; i++) {
      const z = ((i + 0.5 + this.rolagem * 0.5) % 6) / 6;
      [-2.4, 2.4].forEach((lado) => {
        const pr = this.projetar(lado, z);
        const r = Math.max(1, Math.round(9 * pr.escala));
        circuloPixel(g, Math.round(pr.x), Math.round(pr.y) - r, r, 0x2f6b3a);
        circuloPixel(g, Math.round(pr.x) - Math.round(r * 0.4), Math.round(pr.y) - r - Math.round(r * 0.3), Math.round(r * 0.6), 0x3f8a4a);
      });
    }

    // asfalto: fatias horizontais, cada uma com a largura da sua profundidade
    for (let y = this.horizonte; y < a; y++) {
      const p = (y - this.horizonte) / (this.pe - this.horizonte);
      const z = Math.sqrt(Math.max(0, p));
      const meia = this.meiaLarguraEstrada(z);
      // faixas claras/escuras alternadas rolando para dar sensacao de velocidade
      const banda = Math.floor((z * 10 + this.rolagem) % 2);
      g.fillStyle(banda ? 0x3a2f38 : 0x342a32, 1).fillRect(this.cx - meia, y, meia * 2, 1);
      g.fillStyle(0xd9c07a, 1).fillRect(this.cx - meia, y, Math.max(1, Math.round(2 * z)), 1);
      g.fillRect(this.cx + meia - Math.max(1, Math.round(2 * z)), y, Math.max(1, Math.round(2 * z)), 1);
    }

    // tracejado entre as faixas, rolando em direcao a camera
    for (let i = 0; i < 12; i++) {
      const z0 = ((i + this.rolagem) % 12) / 12;
      const z1 = z0 + 0.035;
      [-0.5, 0.5].forEach((f) => {
        const a0 = this.projetar(f, z0), a1 = this.projetar(f, Math.min(1, z1));
        const w0 = Math.max(1, Math.round(3 * z0 * z0)), w1 = Math.max(1, Math.round(3 * z1 * z1));
        g.fillStyle(0xf2e6cc, 0.9);
        g.beginPath();
        g.moveTo(a0.x - w0, a0.y); g.lineTo(a0.x + w0, a0.y);
        g.lineTo(a1.x + w1, a1.y); g.lineTo(a1.x - w1, a1.y);
        g.closePath(); g.fillPath();
      });
    }

    // postes passando dos dois lados
    for (let i = 0; i < 6; i++) {
      const z = ((i + this.rolagem * 0.5) % 6) / 6;
      [-1.9, 1.9].forEach((lado) => {
        const pr = this.projetar(lado, z);
        const h = Math.round(46 * pr.escala), w = Math.max(1, Math.round(3 * pr.escala));
        g.fillStyle(0x2a1a20, 1).fillRect(Math.round(pr.x) - w, Math.round(pr.y) - h, w * 2, h);
        g.fillStyle(0xffd66b, 1).fillRect(Math.round(pr.x) - w * 2, Math.round(pr.y) - h, w * 4, Math.max(1, w));
      });
    }
  }

  montarOnibus() {
    const base = this.projetar(0, 0.93);
    this.onibus = this.add.image(base.x, base.y, 'onibus').setOrigin(0.5, 1).setDepth(50).setScale(1.6);
    this.baseOnibus = base;
    // sombra e rodas "balancando"
    this.sombraOnibus = this.add.graphics().setDepth(49);
    this.tweens.add({ targets: this.onibus, y: base.y + 1.5, duration: 260, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    // fumaca do escapamento
    this.time.addEvent({
      delay: 220, loop: true,
      callback: () => {
        if (this.finalizada) return;
        const f = this.add.graphics().setDepth(48);
        circuloPixel(f, 0, 0, Phaser.Math.Between(2, 4), 0x8a8a8a, 0.5);
        f.setPosition(this.onibus.x - 28, this.onibus.y - 4);
        this.tweens.add({ targets: f, y: f.y + 14, x: f.x - 6, alpha: 0, scale: 2, duration: 700, onComplete: () => f.destroy() });
      },
    });
  }

  desenharSombraOnibus() {
    const g = this.sombraOnibus;
    g.clear();
    g.fillStyle(0x000000, 0.35);
    for (let i = 0; i < 4; i++) g.fillRect(this.onibus.x - 36 + i * 2, this.onibus.y - 2 + i, 72 - i * 4, 1);
  }

  // ---- Interface ---------------------------------------------------------

  montarUI() {
    const { width: l } = this.scale;
    // caminho casa -> escritorio, com o onibus andando na barra
    const g = this.add.graphics().setDepth(20);
    caixaPergaminho(g, l / 2 - 112, 20, 224, 22);
    this.trilho = { x: l / 2 - 62, y: 31, l: 124 };
    retRedondo(g, this.trilho.x, this.trilho.y - 2, this.trilho.l, 5, 2, 0x3a2418);
    this.add.text(this.trilho.x - 6, this.trilho.y, 'casa', { fontFamily: FONTE, fontSize: '8px', color: TEMA_PERGAMINHO.nome }).setOrigin(1, 0.5).setDepth(21);
    this.add.text(this.trilho.x + this.trilho.l + 6, this.trilho.y, 'trab.', { fontFamily: FONTE, fontSize: '8px', color: TEMA_PERGAMINHO.nome }).setOrigin(0, 0.5).setDepth(21);
    this.marcador = this.add.image(this.trilho.x, this.trilho.y, 'onibus').setScale(0.3).setDepth(22);

    this.coracoes = [];
    for (let i = 0; i < VIDAS; i++) this.coracoes.push(this.add.image(l - 16 - i * 13, 30, 'vida').setDepth(21));

    // velocimetro no canto de baixo, a esquerda
    const vg = this.add.graphics().setDepth(20);
    caixaPergaminho(vg, 8, this.scale.height - 30, 92, 22);
    this.textoVel = this.add.text(54, this.scale.height - 19, '40 km/h', { fontFamily: FONTE, fontSize: '8px', color: TEMA_PERGAMINHO.nome })
      .setOrigin(0.5).setDepth(21);
    this.linhasVel = this.add.graphics().setDepth(45);

    // moedas de pontualidade
    this.add.image(14, 30, 'moeda').setDepth(21);
    this.textoMoedas = this.add.text(24, 30, 'x0', { fontFamily: FONTE, fontSize: '8px', color: COR.amarelo })
      .setOrigin(0, 0.5).setDepth(21).setShadow(0, 1, '#000000', 0);
  }

  contagem(depois) {
    const { width: l } = this.scale;
    const dica = this.add.text(l / 2, 150, '◀ ▶  trocar de faixa', { fontFamily: FONTE, fontSize: '8px', color: COR.creme })
      .setOrigin(0.5).setDepth(30).setShadow(0, 1, '#000000', 0);
    ['3', '2', '1', 'VAI!'].forEach((txt, i, arr) => {
      this.time.delayedCall(650 * i, () => {
        const t = this.add.text(l / 2, 118, txt, { fontFamily: FONTE, fontSize: '18px', color: COR.amarelo })
          .setOrigin(0.5).setDepth(30).setShadow(0, 2, '#2a0f14', 0).setScale(1.6);
        this.tweens.add({ targets: t, scale: 1, alpha: 0.2, duration: 560, onComplete: () => t.destroy() });
        if (i === arr.length - 1) { dica.destroy(); depois(); }
      });
    });
  }

  aviso(texto, cor, duracao, depois) {
    const { width: l } = this.scale;
    const t = this.add.text(l / 2, 118, texto, { fontFamily: FONTE, fontSize: '14px', color: cor })
      .setOrigin(0.5).setDepth(30).setShadow(0, 2, '#2a0f14', 0);
    this.tweens.add({ targets: t, scale: 1.12, duration: 130, yoyo: true, repeat: 2 });
    this.time.delayedCall(duracao, () => { t.destroy(); depois && depois(); });
  }

  flutuar(texto, x, y, cor) {
    const t = this.add.text(x, y, texto, { fontFamily: FONTE, fontSize: '8px', color: cor })
      .setOrigin(0.5).setDepth(70).setShadow(0, 1, '#000000', 0);
    this.tweens.add({ targets: t, y: y - 18, alpha: 0, duration: 700, onComplete: () => t.destroy() });
  }

  // ---- Mecanica ----------------------------------------------------------

  get progresso() { return Math.min(1, this.tempo / DURACAO); }
  get velocidade() { return (VEL_INICIAL + (VEL_FINAL - VEL_INICIAL) * this.progresso) * (this.freio ?? 1); }

  mudarFaixa(dir) {
    if (!this.ativo || this.chegando) return;
    const nova = Phaser.Math.Clamp(this.faixa + dir, -1, 1);
    if (nova === this.faixa) return;
    this.faixa = nova;
    this.ultimaTroca = this.time.now;
    som.tocar('passo');
    const alvo = this.projetar(nova, 0.93);
    this.tweens.killTweensOf(this.onibus, 'x');
    this.tweens.add({ targets: this.onibus, x: alvo.x, duration: 160, ease: 'Quad.easeOut' });
    this.tweens.add({ targets: this.onibus, angle: dir * 5, duration: 90, yoyo: true });
  }

  // Cada "linha" de spawn deixa pelo menos uma faixa livre — e, quando vem
  // dois obstaculos, a faixa livre e alcancavel com uma unica troca.
  spawn() {
    const quantos = this.progresso > 0.35 && Math.random() < 0.55 ? 2 : 1;
    let faixaLivre;
    if (quantos === 2) {
      faixaLivre = Math.random() < 0.5 ? 0 : this.faixa;
    } else {
      faixaLivre = Phaser.Utils.Array.GetRandom(FAIXAS);
    }
    const bloqueadas = Phaser.Utils.Array.Shuffle(FAIXAS.filter((f) => f !== faixaLivre)).slice(0, quantos);
    bloqueadas.forEach((f) => this.criarObstaculo(f));
    // coracao de vida: so existe quando ja perdeu alguma, e e raro
    if (this.vidas < VIDAS && Math.random() < 0.22) {
      this.criarObjeto('vida', faixaLivre, 0, 'vida');
      return;
    }
    // moeda na faixa livre, as vezes em fileira de tres
    if (Math.random() < 0.6) {
      const n = Math.random() < 0.4 ? 3 : 1;
      for (let k = 0; k < n; k++) this.criarObjeto('moeda', faixaLivre, -k * 0.09, 'moeda');
    }
  }

  criarObstaculo(faixa) {
    const r = Math.random();
    if (r < 0.5) this.criarObjeto(Phaser.Utils.Array.GetRandom(['carroVermelho', 'carroAzul', 'carroBranco', 'carroVerde']), faixa, 0, 'carro');
    else if (r < 0.75) this.criarObjeto('moto', faixa, 0, 'moto');
    else this.criarObjeto('buraco', faixa, 0, 'buraco');
  }

  // Placa de transito na beira direita: "ESCRITORIO 3 km".
  criarPlaca(distancia) {
    const cont = this.add.container(0, 0).setDepth(8);
    const g = this.add.graphics();
    g.fillStyle(0x3a3a48, 1).fillRect(-1, -8, 3, 30);
    g.fillStyle(0x1c1c22, 1).fillRect(-32, -30, 64, 22);
    g.fillStyle(0x2f6b3a, 1).fillRect(-31, -29, 62, 20);
    g.fillStyle(0xf2e6cc, 1).fillRect(-31, -29, 62, 1);
    cont.add(g);
    cont.add(this.add.text(0, -26, 'ESCRIT.', { fontFamily: FONTE, fontSize: '8px', color: '#f2e6cc' }).setOrigin(0.5, 0));
    cont.add(this.add.text(0, -16, distancia, { fontFamily: FONTE, fontSize: '8px', color: '#ffd66b' }).setOrigin(0.5, 0));
    this.objetos.push({ img: cont, sombra: null, faixa: 2.2, z: 0, tipo: 'placa', tocado: true, giro: 0, oscila: 0 });
  }

  criarObjeto(textura, faixa, zInicial, tipo) {
    const img = this.add.image(0, 0, textura).setOrigin(0.5, 1).setDepth(10);
    const sombra = (tipo === 'buraco') ? null : this.add.graphics().setDepth(9);
    this.objetos.push({ img, sombra, faixa, z: zInicial, tipo, tocado: false, giro: tipo === 'moeda' || tipo === 'vida' ? Math.random() * Math.PI : 0, oscila: Math.random() * 6 });
  }

  desenharSombraObjeto(o, pr) {
    if (!o.sombra) return;
    const g = o.sombra;
    g.clear();
    const w = Math.round(o.img.displayWidth * 0.55), h = Math.max(1, Math.round(4 * pr.escala));
    g.fillStyle(0x000000, 0.3);
    for (let i = 0; i < h; i++) g.fillRect(o.img.x - w + i, o.img.y - h + i, w * 2 - i * 2, 1);
  }

  update(tempo, delta) {
    if (this.finalizada) return;
    const dt = delta / 1000;
    this.rolagem = (this.rolagem + this.velocidade * dt * 10) % 12;
    this.desenharEstrada(dt);
    this.desenharSombraOnibus();
    this.skylines.forEach((s) => { s.g.x = -((tempo / 1000) * s.vel * 6) % s.largura; });
    this.nuvens.forEach((n) => { n.g.x += n.vel * dt; if (n.g.x > this.scale.width + 30) n.g.x = -30; });
    this.desenharVelocidade(dt);

    if (!this.ativo) { if (this.chegando) this.moverObjetos(dt, tempo); return; }
    this.tempo += dt;

    if (!this.chegando) {
      this.marcador.setX(this.trilho.x + this.trilho.l * this.progresso);
      this.proximoSpawn -= dt;
      if (this.proximoSpawn <= 0) {
        this.spawn();
        this.proximoSpawn = Phaser.Math.FloatBetween(0.85, 1.1) - this.progresso * 0.4;
      }
      const marcos = [0.25, 0.5, 0.75];
      if (this.placasPostas < marcos.length && this.progresso >= marcos[this.placasPostas]) {
        this.placasPostas++;
        this.criarPlaca(`${4 - this.placasPostas} km`);
      }
      if (this.progresso >= 1) this.chegar();
    }

    this.moverObjetos(dt, tempo);
  }

  // Velocimetro e riscos de velocidade nas bordas quando esta rapido.
  desenharVelocidade(dt) {
    const kmh = Math.round(40 + (this.velocidade - VEL_INICIAL) / (VEL_FINAL - VEL_INICIAL) * 50);
    if (this.ativo) this.textoVel.setText(kmh + ' km/h');
    const g = this.linhasVel;
    g.clear();
    const forca = Phaser.Math.Clamp((this.velocidade - 0.6) / (VEL_FINAL - 0.6), 0, 1);
    if (forca <= 0) return;
    const { width: l, height: a } = this.scale;
    const n = Math.round(6 * forca);
    for (let i = 0; i < n; i++) {
      const y = Phaser.Math.Between(this.horizonte + 20, a);
      const comp = Phaser.Math.Between(10, 30);
      g.fillStyle(0xffffff, 0.25 * forca);
      g.fillRect(Phaser.Math.Between(0, 40), y, comp, 1);
      g.fillRect(l - Phaser.Math.Between(10, 40) - comp, y, comp, 1);
    }
  }

  moverObjetos(dt, tempo) {
    const restantes = [];
    for (const o of this.objetos) {
      o.z += this.velocidade * dt;
      if (o.z < 0) { restantes.push(o); o.img.setVisible(false); continue; }
      o.img.setVisible(true);
      const pr = this.projetar(o.faixa, Math.min(1, o.z));
      o.img.setPosition(pr.x, pr.y);
      const escala = pr.escala * (o.tipo === 'buraco' ? 1.7 : o.tipo === 'placa' ? 1.2 : 1.5);
      if (o.tipo === 'moeda' || o.tipo === 'vida') {
        o.giro += dt * 5;
        o.img.setScale(escala * Math.abs(Math.cos(o.giro)) + 0.05, escala);
        o.img.setY(o.img.y - (6 + Math.sin(o.giro) * 2) * pr.escala);
      } else if (o.tipo === 'moto') {
        o.oscila += dt * 4;
        o.img.setScale(escala).setX(o.img.x + Math.sin(o.oscila) * 6 * pr.escala);
      } else if (o.tipo === 'placa') {
        o.img.setScale(escala);
      } else if (o.tipo === 'carro') {
        o.img.setScale(escala).setTint(Math.floor(tempo / 250) % 2 ? 0xffffff : 0xffd0c8);
      } else {
        o.img.setScale(escala);
      }
      this.desenharSombraObjeto(o, pr);
      // profundidade: quem esta mais perto desenha por cima; o onibus fica em 50
      o.img.setDepth(10 + Math.round(o.z * 30));

      // colisao: mesma faixa, na altura do onibus
      if (!o.tocado && o.faixa === this.faixa && o.z > 0.86 && o.z < 0.98) {
        o.tocado = true;
        if (o.tipo === 'moeda') { this.pegouMoeda(o); this.destruirObjeto(o); continue; }
        if (o.tipo === 'vida') { this.pegouVida(o); this.destruirObjeto(o); continue; }
        if (tempo >= this.imuneAte) this.bateu(o);
      }
      if (!o.avisou && o.z >= 0.98 && ['carro', 'moto', 'buraco'].includes(o.tipo) && Math.abs(o.faixa - this.faixa) === 1
          && tempo - this.ultimaTroca < 380) {
        o.avisou = true;
        this.moedas += 2;
        this.textoMoedas.setText('x' + this.moedas);
        this.flutuar('por pouco! +2', this.onibus.x, this.onibus.y - 80, '#ffd66b');
        som.tocar('moeda');
      }
      if (o.z >= 1.06) { this.destruirObjeto(o); continue; }
      restantes.push(o);
    }
    this.objetos = restantes;
  }

  destruirObjeto(o) {
    o.img.destroy();
    if (o.sombra) o.sombra.destroy();
  }

  pegouVida(o) {
    som.tocar('vida');
    if (this.vidas < VIDAS) {
      this.coracoes[this.vidas].setTexture('vida');
      this.tweens.add({ targets: this.coracoes[this.vidas], scale: 1.6, duration: 160, yoyo: true });
      this.vidas++;
    }
    this.flutuar('+1 vida', o.img.x, o.img.y - 20, '#ff8a7a');
    for (let i = 0; i < 8; i++) {
      const pt = this.add.rectangle(o.img.x, o.img.y - 10, 2, 2, 0xff8a7a).setDepth(60);
      const ang = (i / 8) * Math.PI * 2;
      this.tweens.add({ targets: pt, x: pt.x + Math.cos(ang) * 16, y: pt.y + Math.sin(ang) * 16, alpha: 0, duration: 400, onComplete: () => pt.destroy() });
    }
  }

  pegouMoeda(o) {
    som.tocar('moeda');
    this.moedas++;
    this.textoMoedas.setText('x' + this.moedas);
    this.flutuar('+pontualidade', o.img.x, o.img.y - 20, '#a8f0b0');
    this.tweens.add({ targets: this.textoMoedas, scale: 1.4, duration: 100, yoyo: true });
  }

  bateu(o) {
    som.tocar('batida');
    vibrar(120);
    this.vidas--;
    this.coracoes[this.vidas].setTexture('vidaVazia');
    this.tweens.add({ targets: this.coracoes[this.vidas], scale: 1.5, duration: 120, yoyo: true });
    this.cameras.main.shake(220, 0.012);
    this.cameras.main.flash(120, 255, 120, 90);
    this.imuneAte = this.time.now + 1200;
    this.tweens.add({ targets: this.onibus, alpha: 0.4, duration: 90, yoyo: true, repeat: 6, onComplete: () => this.onibus.setAlpha(1) });
    this.tweens.add({ targets: this.onibus, angle: o.tipo === 'buraco' ? 0 : (o.faixa < 0 ? -8 : 8), y: this.baseOnibus.y + (o.tipo === 'buraco' ? 6 : 0), duration: 110, yoyo: true, repeat: 1 });
    // faiscas
    for (let i = 0; i < 8; i++) {
      const p = this.add.rectangle(this.onibus.x + Phaser.Math.Between(-20, 20), this.onibus.y - 20, 2, 2, 0xffd66b).setDepth(60);
      this.tweens.add({ targets: p, y: p.y - Phaser.Math.Between(10, 30), x: p.x + Phaser.Math.Between(-24, 24), alpha: 0, duration: 400, onComplete: () => p.destroy() });
    }
    this.flutuar(o.tipo === 'buraco' ? 'BURACO!' : 'BATEU!', this.onibus.x, this.onibus.y - 70, '#ff8a7a');
    if (this.vidas <= 0) this.quebrou();
  }

  // ---- Desfechos ---------------------------------------------------------

  chegar() {
    this.chegando = true;
    // o ponto do escritorio surge no lado direito e o onibus encosta
    this.criarObjeto('placaPonto', 1.9, 0, 'ponto');
    this.objetos[this.objetos.length - 1].img.setDepth(40);
    // freia suavemente ate parar no ponto
    this.freio = 1;
    this.tweens.add({ targets: this, freio: 0.05, duration: 2400, ease: 'Quad.easeOut' });
    this.time.delayedCall(1400, () => {
      this.ativo = false;
      this.tweens.add({ targets: this.onibus, x: this.projetar(0.6, 0.93).x, duration: 700, ease: 'Quad.easeOut' });
      progresso.somarMoedas(this.moedas);
      const extra = this.moedas > 0 ? `  +${this.moedas} pontualidade` : '';
      this.aviso('CHEGOU!' + extra, COR.amarelo, 1400, () => this.venceu({ legenda: 'Sete e meia era o combinado.' }));
    });
  }

  quebrou() {
    this.ativo = false;
    this.objetos.forEach((o) => this.destruirObjeto(o));
    this.objetos = [];
    this.onibus.setAngle(4);
    // fumaca preta saindo do motor
    this.time.addEvent({
      delay: 90, repeat: 10,
      callback: () => {
        const f = this.add.graphics().setDepth(60);
        circuloPixel(f, 0, 0, Phaser.Math.Between(3, 6), 0x222222, 0.8);
        f.setPosition(this.onibus.x + Phaser.Math.Between(-10, 10), this.onibus.y - 40);
        this.tweens.add({ targets: f, y: f.y - 30, alpha: 0, scale: 2, duration: 900, onComplete: () => f.destroy() });
      },
    });
    this.aviso('o onibus quebrou', '#ff8a7a', 1300, () => {
      const { width: l, height: a } = this.scale;
      const escuro = this.add.rectangle(0, 0, l, a, 0x000000, 0).setOrigin(0, 0).setDepth(90);
      this.tweens.add({ targets: escuro, fillAlpha: 0.8, duration: 700, onComplete: () => this.perdeu() });
    });
  }
}
