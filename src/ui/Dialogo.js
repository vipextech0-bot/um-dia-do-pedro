import { FONTE } from '../config/paleta.js';
import { carregarRetratos } from '../arte/retratos.js';
import { som } from '../audio/som.js';
import { TEM_TOQUE } from '../ui/Toque.js';
import { caixaPergaminho, molduraRetrato, abaNome, retRedondo, TEMA_PERGAMINHO } from './moldura.js';

// Caixa de dialogo no estilo Stardew: pergaminho com borda entalhada,
// retrato do personagem a esquerda, aba com o nome e texto letra por letra.
//
// Uso:
//   const d = new Dialogo(this);
//   d.mostrar([{ quem: 'Victor', retrato: 'victor', texto: '...' }], () => {});
//   d.perguntar([{ rotulo: '...', aoEscolher: () => {} }]);
export class Dialogo {
  constructor(cena, opcoes = {}) {
    this.cena = cena;
    carregarRetratos(cena);

    const { width: l, height: a } = cena.scale;
    this.x = opcoes.x ?? 8;
    this.altura = opcoes.altura ?? 92;
    this.y = opcoes.y ?? a - this.altura - 8;
    this.largura = opcoes.largura ?? l - 16;
    this.velocidade = opcoes.velocidade ?? 26;

    this.fila = [];
    this.digitando = false;
    this.escolhendo = false;
    this.aoTerminar = null;
    // Sem esta trava, o mesmo toque que fecha uma fala ja confirmaria a
    // primeira opcao do menu que acabou de abrir.
    this.travadoAte = 0;

    this.montar();
    this.ligarEntradas();
    this.esconder();
  }

  montar() {
    const { x, y, largura, altura } = this;
    const cena = this.cena;

    this.raiz = cena.add.container(0, 0).setDepth(900);

    const g = cena.add.graphics();
    caixaPergaminho(g, x, y, largura, altura);
    molduraRetrato(g, x + 9, y + 9, 74);
    this.raiz.add(g);

    this.retrato = cena.add.image(x + 46, y + 46, 'retratoPedro').setOrigin(0.5, 0.5);
    this.raiz.add(this.retrato);

    // aba do nome, encavalada na borda de cima da caixa
    this.gNome = cena.add.graphics();
    this.raiz.add(this.gNome);
    this.nome = cena.add.text(x + 98, y - 3, '', {
      fontFamily: FONTE, fontSize: '8px', color: TEMA_PERGAMINHO.nome,
    }).setOrigin(0, 0);
    this.raiz.add(this.nome);

    this.corpo = cena.add.text(x + 92, y + 18, '', {
      fontFamily: FONTE, fontSize: '8px', color: TEMA_PERGAMINHO.texto,
      wordWrap: { width: largura - 108 }, lineSpacing: 7,
    }).setOrigin(0, 0);
    this.raiz.add(this.corpo);

    // seta de "aperte espaco", pulsando no canto
    this.seta = cena.add.text(x + largura - 16, y + altura - 16, '▼', {
      fontFamily: FONTE, fontSize: '8px', color: TEMA_PERGAMINHO.nome,
    }).setOrigin(0.5);
    this.raiz.add(this.seta);
    cena.tweens.add({ targets: this.seta, y: this.seta.y - 2, duration: 460, yoyo: true, repeat: -1 });

    this.grupoEscolhas = cena.add.container(0, 0).setDepth(901);
  }

  ligarEntradas() {
    const teclado = this.cena.input.keyboard;
    this.teclas = {
      espaco: teclado.addKey('SPACE'),
      enter: teclado.addKey('ENTER'),
      cima: teclado.addKey('UP'),
      baixo: teclado.addKey('DOWN'),
    };
    this.teclas.espaco.on('down', () => this.confirmar());
    this.teclas.enter.on('down', () => this.confirmar());
    this.teclas.cima.on('down', () => this.mover(-1));
    this.teclas.baixo.on('down', () => this.mover(1));

    this.aoClicar = (ponteiro, alvos) => {
      // em modo de escolha o clique so vale nas opcoes, tratadas por elas mesmas
      if (this.escolhendo || (alvos && alvos.length)) return;
      this.confirmar();
    };
    this.cena.input.on('pointerdown', this.aoClicar);
  }

  // ---- Falas -------------------------------------------------------------

  mostrar(falas, aoTerminar) {
    this.fila = Array.isArray(falas) ? [...falas] : [falas];
    this.aoTerminar = aoTerminar || null;
    this.raiz.setVisible(true);
    this.aparecer();
    this.proxima();
    return this;
  }

  aparecer() {
    this.raiz.setAlpha(0);
    this.raiz.y = 6;
    this.cena.tweens.add({ targets: this.raiz, alpha: 1, y: 0, duration: 180, ease: 'Quad.easeOut' });
  }

  esconder() {
    this.raiz.setVisible(false);
    this.limparEscolhas();
  }

  proxima() {
    if (this.fila.length === 0) {
      const cb = this.aoTerminar;
      this.aoTerminar = null;
      if (cb) cb(); else this.esconder();
      return;
    }
    const fala = this.fila.shift();
    this.escrever(fala);
  }

  escrever(fala) {
    const texto = typeof fala === 'string' ? fala : fala.texto;
    const quem = typeof fala === 'string' ? '' : (fala.quem || '');
    const retrato = typeof fala === 'string' ? null : fala.retrato;

    this.definirNome(quem);
    if (retrato) {
      this.retrato.setTexture({ victor: 'retratoVictor', sabrina: 'retratoSabrina' }[retrato] || 'retratoPedro').setVisible(true);
      // pequeno pulo do retrato quando o personagem toma a fala
      this.cena.tweens.add({
        targets: this.retrato, y: this.y + 44, duration: 90, yoyo: true, ease: 'Quad.easeOut',
      });
    }

    this.corpo.setText('');
    this.seta.setVisible(false);
    this.digitando = true;
    this.textoAtual = texto;
    this.travar(120);

    if (this.evento) this.evento.remove();
    let i = 0;
    this.evento = this.cena.time.addEvent({
      delay: this.velocidade,
      repeat: texto.length - 1,
      callback: () => {
        this.corpo.setText(texto.substring(0, ++i));
        if (i % 3 === 0) som.tocar('fala');
        if (i >= texto.length) this.terminarLinha();
      },
    });
  }

  definirNome(quem) {
    this.gNome.clear();
    if (!quem) { this.nome.setText(''); return; }
    this.nome.setText(quem);
    const largura = Math.ceil(this.nome.width) + 12;
    abaNome(this.gNome, this.x + 92, this.y - 7, largura, 15);
    this.nome.setPosition(this.x + 98, this.y - 3);
  }

  terminarLinha() {
    this.digitando = false;
    this.seta.setVisible(true);
  }

  // ---- Escolhas ----------------------------------------------------------

  // opcoes: [{ rotulo, aoEscolher }]
  perguntar(opcoes) {
    this.escolhendo = true;
    this.travar(350);
    this.opcoes = opcoes;
    this.indice = 0;
    this.corpo.setText('');
    this.seta.setVisible(false);
    this.limparEscolhas();

    const baseX = this.x + 92;
    const baseY = this.y + 16;
    const passo = TEM_TOQUE ? 21 : 18, alturaLinha = TEM_TOQUE ? 18 : 15;
    this.linhasEscolha = opcoes.map((op, i) => {
      const y = baseY + i * passo;
      const g = this.cena.add.graphics();
      const largura = this.largura - 108;
      retRedondo(g, baseX - 2, y - 4, largura, alturaLinha, 2, 0xe0c495);
      this.grupoEscolhas.add(g);

      const txt = this.cena.add.text(baseX + 10, y, op.rotulo, {
        fontFamily: FONTE, fontSize: '8px', color: TEMA_PERGAMINHO.texto,
      }).setOrigin(0, 0);
      if (txt.width > largura - 16) {
        console.warn('[dialogo] opcao longa demais para uma linha:', op.rotulo);
      }
      this.grupoEscolhas.add(txt);

      const zona = this.cena.add.zone(baseX - 2, y - 4, largura, alturaLinha).setOrigin(0, 0).setInteractive();
      zona.input.cursor = 'pointer';
      zona.on('pointerover', () => this.destacar(i));
      zona.on('pointerdown', () => { this.destacar(i); this.confirmar(); });
      this.grupoEscolhas.add(zona);

      return { g, txt, y, largura, baseX, alturaLinha };
    });

    this.cursor = this.cena.add.text(baseX + 1, baseY, '▶', {
      fontFamily: FONTE, fontSize: '8px', color: TEMA_PERGAMINHO.nome,
    }).setOrigin(0, 0);
    this.grupoEscolhas.add(this.cursor);
    this.cena.tweens.add({ targets: this.cursor, x: baseX + 3, duration: 420, yoyo: true, repeat: -1 });

    this.destacar(0);
  }

  destacar(i) {
    this.indice = i;
    this.linhasEscolha.forEach((linha, j) => {
      linha.g.clear();
      retRedondo(linha.g, linha.baseX - 2, linha.y - 4, linha.largura, linha.alturaLinha, 2,
        j === i ? 0xf7c983 : 0xe0c495);
      linha.txt.setColor(j === i ? '#5c2410' : TEMA_PERGAMINHO.texto);
    });
    this.cursor.setY(this.linhasEscolha[i].y);
  }

  limparEscolhas() {
    this.grupoEscolhas.removeAll(true);
    this.linhasEscolha = null;
    this.cursor = null;
  }

  // ---- Entrada -----------------------------------------------------------

  travar(ms) {
    this.travadoAte = this.cena.time.now + ms;
  }

  confirmar() {
    if (!this.raiz.visible) return;
    if (this.cena.time.now < this.travadoAte) return;

    if (this.escolhendo) {
      const escolhida = this.opcoes[this.indice];
      this.escolhendo = false;
      som.tocar('clique');
      this.limparEscolhas();
      escolhida.aoEscolher && escolhida.aoEscolher();
      return;
    }

    if (this.digitando) {
      if (this.evento) this.evento.remove();
      this.corpo.setText(this.textoAtual);
      this.terminarLinha();
    } else {
      this.proxima();
    }
  }

  mover(passo) {
    if (!this.escolhendo || !this.linhasEscolha) return;
    const total = this.linhasEscolha.length;
    this.destacar((this.indice + passo + total) % total);
  }

  destruir() {
    if (this.evento) this.evento.remove();
    this.cena.input.off('pointerdown', this.aoClicar);
    Object.values(this.teclas).forEach((t) => t.removeAllListeners());
    this.limparEscolhas();
    this.raiz.destroy(true);
    this.grupoEscolhas.destroy(true);
  }
}
