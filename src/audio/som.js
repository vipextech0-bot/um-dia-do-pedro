// Som do jogo inteiro sem nenhum arquivo de audio: osciladores do Web Audio.
// Efeitos curtos (tocar) e uma musica chiptune por clima (musica), com
// sequenciador que agenda notas um pouco a frente do tempo atual.

const NOTAS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function freq(nome) {
  const m = /^([A-G])(#?)(\d)$/.exec(nome);
  if (!m) return 0;
  const semi = NOTAS[m[1]] + (m[2] ? 1 : 0) + (parseInt(m[3], 10) - 4) * 12;
  return 440 * Math.pow(2, (semi - 9) / 12);
}

// Trilhas: [nota|null, duracao em batidas]. Melodia em pulso, baixo em
// triangulo, bateria em passos de meia batida ('k' bumbo, 'h' chimbal,
// 's' caixa, '.' nada). Melodia, baixo e bateria devem ter o MESMO total de
// batidas, senao as vozes se desencontram a cada volta (conferido em
// conferirTrilhas).
export const TRILHAS = {
  menu: {
    bpm: 96,
    melodia: [['E4', 1], ['G4', 1], ['A4', 2], ['G4', 1], ['E4', 1], ['D4', 2], ['C4', 1], ['D4', 1], ['E4', 2], ['G4', 1], ['E4', 1], ['D4', 2]],
    baixo: [['C3', 2], ['G2', 2], ['A2', 2], ['E2', 2], ['F2', 2], ['C3', 2], ['G2', 2], ['G2', 2]],
    bateria: null,
  },
  dia: {
    bpm: 132,
    melodia: [['C5', 0.5], ['E5', 0.5], ['G5', 1], ['E5', 0.5], ['D5', 0.5], ['C5', 1], ['A4', 0.5], ['C5', 0.5], ['D5', 1], ['E5', 0.5], ['D5', 0.5], ['C5', 1],
      ['G4', 0.5], ['A4', 0.5], ['C5', 1], ['D5', 0.5], ['E5', 0.5], ['G5', 1], ['E5', 0.5], ['D5', 0.5], ['C5', 2], [null, 1]],
    baixo: [['C3', 1], ['C3', 1], ['G2', 1], ['G2', 1], ['A2', 1], ['A2', 1], ['F2', 1], ['G2', 1], ['C3', 1], ['C3', 1], ['G2', 1], ['G2', 1], ['F2', 1], ['F2', 1], ['G2', 1], ['G2', 1]],
    bateria: 'k.h.s.h.k.h.s.hh',
  },
  corrida: {
    bpm: 152,
    melodia: [['E5', 0.5], ['E5', 0.5], ['G5', 0.5], ['E5', 0.5], ['D5', 0.5], ['C5', 0.5], ['D5', 1], ['C5', 0.5], ['C5', 0.5], ['E5', 0.5], ['C5', 0.5], ['B4', 0.5], ['A4', 0.5], ['B4', 1],
      ['A4', 0.5], ['C5', 0.5], ['E5', 0.5], ['A5', 0.5], ['G5', 0.5], ['E5', 0.5], ['D5', 1], ['E5', 0.5], ['D5', 0.5], ['C5', 0.5], ['B4', 0.5], ['C5', 2]],
    baixo: [['A2', 0.5], ['A2', 0.5], ['A3', 0.5], ['A2', 0.5], ['F2', 0.5], ['F2', 0.5], ['F3', 0.5], ['F2', 0.5], ['C3', 0.5], ['C3', 0.5], ['C4', 0.5], ['C3', 0.5], ['G2', 0.5], ['G2', 0.5], ['G3', 0.5], ['G2', 0.5],
      ['A2', 0.5], ['A2', 0.5], ['A3', 0.5], ['A2', 0.5], ['F2', 0.5], ['F2', 0.5], ['F3', 0.5], ['F2', 0.5], ['C3', 0.5], ['C3', 0.5], ['C4', 0.5], ['C3', 0.5], ['G2', 0.5], ['G2', 0.5], ['G3', 0.5], ['G2', 0.5]],
    bateria: 'khhhshhhkhhhshhh',
  },
  foco: {
    bpm: 104,
    melodia: [['C5', 0.5], ['G4', 0.5], ['E5', 0.5], ['G4', 0.5], ['D5', 0.5], ['G4', 0.5], ['E5', 0.5], ['G4', 0.5], ['A4', 0.5], ['E4', 0.5], ['C5', 0.5], ['E4', 0.5], ['B4', 0.5], ['E4', 0.5], ['C5', 0.5], ['E4', 0.5],
      ['F4', 0.5], ['C5', 0.5], ['A4', 0.5], ['C5', 0.5], ['G4', 0.5], ['D5', 0.5], ['B4', 0.5], ['D5', 0.5], ['C5', 2], [null, 2]],
    baixo: [['C3', 2], ['C3', 2], ['A2', 2], ['A2', 2], ['F2', 2], ['G2', 2], ['C3', 4]],
    bateria: '..h...h...h...h.',
  },
  noite: {
    bpm: 72,
    melodia: [['A4', 2], ['C5', 1], ['B4', 1], ['G4', 2], ['E4', 2], ['F4', 2], ['G4', 1], ['A4', 1], ['E4', 4]],
    baixo: [['A2', 4], ['E2', 4], ['F2', 4], ['E2', 4]],
    bateria: null,
  },
  epilogo: {
    bpm: 84,
    melodia: [['G4', 1], ['C5', 1], ['E5', 2], ['D5', 1], ['C5', 1], ['G4', 2], ['A4', 1], ['C5', 1], ['D5', 2], ['C5', 2], ['E5', 1], ['G5', 1], ['C6', 2], ['G5', 2]],
    baixo: [['C3', 2], ['G2', 2], ['A2', 2], ['E2', 2], ['F2', 2], ['G2', 2], ['C3', 2], ['C3', 2], ['G2', 2], ['C3', 2]],
    bateria: null,
  },
};

// Soma das batidas de cada voz; usado nos testes e no console.
export function conferirTrilhas() {
  const soma = (v) => v.reduce((t, [, d]) => t + d, 0);
  return Object.fromEntries(Object.entries(TRILHAS).map(([nome, t]) => [nome, {
    melodia: soma(t.melodia), baixo: soma(t.baixo), bateria: t.bateria ? t.bateria.length / 2 : null,
  }]));
}

class Som {
  constructor() {
    this.ctx = null;
    this.mudo = false;
    try { this.mudo = localStorage.getItem('pedro.mudo') === '1'; } catch (e) { /* sem storage */ }
    this.trilha = null;
    this.timer = null;
    this.canalTrilha = null;     // ganho da trilha atual (para o crossfade)
  }

  // Precisa de um gesto do usuario para o navegador liberar o audio.
  ligar() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.mudo ? 0 : 0.5;
      this.master.connect(this.ctx.destination);
      this.canalMusica = this.ctx.createGain();
      this.canalMusica.gain.value = 0.35;
      this.canalMusica.connect(this.master);
      // ruido branco para a bateria
      const tam = this.ctx.sampleRate * 0.3;
      this.ruido = this.ctx.createBuffer(1, tam, this.ctx.sampleRate);
      const dados = this.ruido.getChannelData(0);
      for (let i = 0; i < tam; i++) dados[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    if (this.trilha && !this.timer) this.iniciarSequenciador();
  }

  alternarMudo() {
    this.mudo = !this.mudo;
    if (this.master) this.master.gain.value = this.mudo ? 0 : 0.5;
    try { localStorage.setItem('pedro.mudo', this.mudo ? '1' : '0'); } catch (e) { /* sem storage */ }
    return this.mudo;
  }

  nota(f, dur, { tipo = 'square', vol = 0.15, quando = 0, desliza = 0, destino = null } = {}) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + quando;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = tipo;
    osc.frequency.setValueAtTime(f, t);
    if (desliza) osc.frequency.exponentialRampToValueAtTime(Math.max(20, f * desliza), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(destino || this.master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  // Bateria: bumbo (seno descendo), caixa (ruido curto), chimbal (ruido agudo).
  percussao(tipo, quando, destino) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + quando;
    if (tipo === 'k') {
      const osc = this.ctx.createOscillator(); const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, t); osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);
      g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      osc.connect(g); g.connect(destino); osc.start(t); osc.stop(t + 0.16);
      return;
    }
    const fonte = this.ctx.createBufferSource();
    fonte.buffer = this.ruido;
    const filtro = this.ctx.createBiquadFilter();
    filtro.type = tipo === 'h' ? 'highpass' : 'bandpass';
    filtro.frequency.value = tipo === 'h' ? 7000 : 1800;
    const g = this.ctx.createGain();
    const dur = tipo === 'h' ? 0.03 : 0.09;
    g.gain.setValueAtTime(tipo === 'h' ? 0.06 : 0.12, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    fonte.connect(filtro); filtro.connect(g); g.connect(destino);
    fonte.start(t); fonte.stop(t + dur + 0.01);
  }

  // Efeitos curtos, por nome.
  tocar(nome) {
    if (!this.ctx) return;
    switch (nome) {
      case 'clique': this.nota(880, 0.06, { vol: 0.1 }); break;
      case 'letra': this.nota(1200, 0.03, { tipo: 'square', vol: 0.05 }); break;
      case 'acerto': this.nota(660, 0.08, { vol: 0.12 }); this.nota(990, 0.12, { quando: 0.07, vol: 0.12 }); break;
      case 'erro': this.nota(220, 0.18, { tipo: 'sawtooth', vol: 0.12, desliza: 0.6 }); break;
      case 'pop': this.nota(900, 0.07, { tipo: 'triangle', vol: 0.12, desliza: 1.6 }); break;
      case 'gota': this.nota(300, 0.25, { tipo: 'sawtooth', vol: 0.12, desliza: 0.5 }); this.nota(150, 0.3, { tipo: 'square', vol: 0.06, quando: 0.05 }); break;
      case 'moeda': this.nota(1046, 0.06, { vol: 0.1 }); this.nota(1568, 0.14, { quando: 0.06, vol: 0.1 }); break;
      case 'batida': this.nota(90, 0.3, { tipo: 'sawtooth', vol: 0.2, desliza: 0.4 }); this.nota(60, 0.35, { tipo: 'square', vol: 0.12, quando: 0.02 }); break;
      case 'vida': [523, 659, 784, 1046].forEach((f, i) => this.nota(f, 0.12, { quando: i * 0.07, vol: 0.1 })); break;
      case 'fixar': this.nota(180, 0.06, { tipo: 'triangle', vol: 0.12 }); break;
      case 'linha': [523, 659, 784].forEach((f, i) => this.nota(f, 0.1, { quando: i * 0.06, vol: 0.12 })); break;
      case 'vitoria': [523, 659, 784, 1046, 784, 1046].forEach((f, i) => this.nota(f, 0.16, { quando: i * 0.11, vol: 0.12 })); break;
      case 'derrota': [392, 349, 311, 262].forEach((f, i) => this.nota(f, 0.28, { tipo: 'triangle', quando: i * 0.22, vol: 0.14 })); break;
      case 'despertador': for (let i = 0; i < 4; i++) this.nota(i % 2 ? 1760 : 1480, 0.05, { quando: i * 0.06, vol: 0.06 }); break;
      case 'passo': this.nota(140, 0.04, { tipo: 'triangle', vol: 0.06 }); break;
      case 'fala': this.nota(440, 0.05, { tipo: 'triangle', vol: 0.04 }); break;
      default: break;
    }
  }

  // Troca a trilha de fundo (ou para, com null). A trilha antiga some num
  // crossfade curto em vez de cortar no meio de uma nota.
  musica(nome) {
    if (this.trilha === nome) return;
    this.trilha = nome;
    this.pararSequenciador();
    if (nome && this.ctx) this.iniciarSequenciador();
  }

  iniciarSequenciador() {
    const trilha = TRILHAS[this.trilha];
    if (!trilha || !this.ctx) return;
    const batida = 60 / trilha.bpm;

    // canal proprio desta trilha, com entrada suave
    const canal = this.ctx.createGain();
    canal.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    canal.gain.exponentialRampToValueAtTime(1, this.ctx.currentTime + 0.4);
    canal.connect(this.canalMusica);
    this.canalTrilha = canal;

    const inicio = this.ctx.currentTime + 0.1;
    const vozes = [
      { notas: trilha.melodia, tipo: 'square', vol: 0.05, i: 0, proximo: inicio },
      { notas: trilha.baixo, tipo: 'triangle', vol: 0.09, i: 0, proximo: inicio },
    ];
    const bateria = trilha.bateria ? { passos: trilha.bateria, i: 0, proximo: inicio } : null;

    this.timer = setInterval(() => {
      if (!this.ctx) return;
      const agora = this.ctx.currentTime;
      const horizonte = agora + 1.0;
      vozes.forEach((v) => {
        // se a aba ficou escondida, pula as notas perdidas em vez de dispara-las juntas
        if (v.proximo < agora - 0.2) v.proximo = agora + 0.05;
        while (v.proximo < horizonte) {
          const [nome, dur] = v.notas[v.i % v.notas.length];
          const seg = dur * batida;
          if (nome) this.nota(freq(nome), seg * 0.9, { tipo: v.tipo, vol: v.vol, quando: v.proximo - agora, destino: canal });
          v.proximo += seg;
          v.i++;
        }
      });
      if (bateria) {
        if (bateria.proximo < agora - 0.2) bateria.proximo = agora + 0.05;
        while (bateria.proximo < horizonte) {
          const p = bateria.passos[bateria.i % bateria.passos.length];
          if (p !== '.') this.percussao(p, bateria.proximo - agora, canal);
          bateria.proximo += batida / 2;
          bateria.i++;
        }
      }
    }, 150);
  }

  pararSequenciador() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    if (this.canalTrilha && this.ctx) {
      // as notas ja agendadas somem num fade de 0,3s
      const canal = this.canalTrilha;
      const t = this.ctx.currentTime;
      canal.gain.cancelScheduledValues(t);
      canal.gain.setValueAtTime(Math.max(0.0001, canal.gain.value), t);
      canal.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      setTimeout(() => { try { canal.disconnect(); } catch (e) { /* ja desconectado */ } }, 1500);
      this.canalTrilha = null;
    }
  }
}

export const som = new Som();

// Primeiro gesto do usuario liga o audio; M silencia.
// No iPhone, o Web Audio fica mudo com a chave lateral no silencioso, a
// menos que a pagina esteja "tocando midia": um <audio> silencioso em loop
// muda a categoria da sessao e destrava o som (o truque do unmute.js).
// O WAV abaixo tem 0,1 s de silencio absoluto.
const WAV_SILENCIO = 'data:audio/wav;base64,UklGRmQGAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YUAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
let midiaSilenciosa = null;
function destravarMidia() {
  if (midiaSilenciosa) return;
  try {
    const el = document.createElement('audio');
    el.setAttribute('playsinline', ''); el.setAttribute('loop', '');
    el.src = WAV_SILENCIO;
    el.volume = 0.01;
    el.play().catch(() => {});
    midiaSilenciosa = el;
  } catch (e) { /* sem audio */ }
}

if (typeof window !== 'undefined') {
  const ligar = () => { som.ligar(); destravarMidia(); };
  // varios eventos: o iOS antigo so aceita touchend/click como gesto valido
  ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'click'].forEach((ev) => window.addEventListener(ev, ligar, { passive: true }));
  window.addEventListener('keydown', (e) => {
    ligar();
    if (e.key === 'm' || e.key === 'M') som.alternarMudo();
  });
  // ao voltar para a aba, o contexto pode ter sido suspenso pelo sistema
  document.addEventListener('visibilitychange', () => { if (!document.hidden && som.ctx) som.ctx.resume().catch(() => {}); });
}
