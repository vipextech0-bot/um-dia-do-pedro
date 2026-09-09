import { HUD } from '../ui/HUD.js';
import { som } from '../audio/som.js';
import { progresso } from '../config/progresso.js';
import { TEM_TOQUE, botaoPausa } from '../ui/Toque.js';
import { infoFase, TOTAL_FASES } from '../config/fases.js';
import { COR, PALETA, FONTE } from '../config/paleta.js';
import { caixaPergaminho, TEMA_PERGAMINHO } from '../ui/moldura.js';

// Contrato comum de todas as fases:
//   iniciar()  -> monta a fase (chamado por create())
//   venceu()   -> transicao para a proxima cena
//   perdeu()   -> TelaRecomeco recebendo a cena atual
export class FaseBase extends Phaser.Scene {
  constructor(chave) {
    super(chave);
    this.chaveFase = chave;
  }

  create(dados = {}) {
    this.dadosEntrada = dados;
    this.finalizada = false;
    this.info = infoFase(this.chaveFase);

    this.cameras.main.setBackgroundColor(PALETA.preto);
    this.cameras.main.fadeIn(320, 0, 0, 0);
    const climas = { Fase3Onibus: 'corrida', Fase5Trabalho: 'foco', Fase6Faculdade: 'foco', Fase7Ligacao: 'noite' };
    som.musica(climas[this.chaveFase] || 'dia');
    progresso.salvarFase(this.chaveFase);

    // Esc (ou o botao II no toque) abre a pausa por cima desta cena
    const pausar = () => {
      if (this.finalizada || this.scene.isPaused()) return;
      this.scene.launch('Pausa', { de: this.chaveFase });
      this.scene.pause();
    };
    this.input.keyboard.on('keydown-ESC', pausar);
    if (TEM_TOQUE && this.chaveFase !== 'Fase4Escritorio' && this.chaveFase !== 'Fase7Ligacao') botaoPausa(this, pausar);

    if (this.info) {
      this.hud = new HUD(this, {
        horario: this.info.horario,
        numero: this.info.numero,
        total: TOTAL_FASES,
      });
    }

    this.iniciar();
  }

  iniciar() { /* sobrescrito por cada fase */ }

  // ---- Fim de fase -------------------------------------------------------

  venceu(opcoes = {}) {
    if (this.finalizada) return;
    this.finalizada = true;
    const proxima = opcoes.proxima || (this.info && this.info.proxima) || 'Menu';
    const info = infoFase(proxima);
    const horario = opcoes.horario || (info ? info.horario : null);
    som.tocar('vitoria');

    this.cameras.main.fadeOut(320, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('Transicao', { proxima, horario, legenda: opcoes.legenda || null });
    });
  }

  perdeu() {
    if (this.finalizada) return;
    this.finalizada = true;
    som.tocar('derrota');
    som.musica(null);
    this.cameras.main.fadeOut(320, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('TelaRecomeco', { faseParaReiniciar: this.chaveFase });
    });
  }

  // ---- Fase ainda nao implementada ---------------------------------------

  // Mostra o cenario com um aviso discreto e segue sozinha para a proxima
  // fase. Nao existe botao de vencer/perder: perder e so na mecanica real.
  montarPlaceholder(titulo) {
    const { width: l, height: a } = this.scale;
    const cx = l / 2 - 110, cy = a / 2 - 22, cl = 220, ca = 44;

    const g = this.add.graphics().setDepth(800);
    caixaPergaminho(g, cx, cy, cl, ca);
    this.add.text(l / 2, cy + 12, titulo, {
      fontFamily: FONTE, fontSize: '8px', color: TEMA_PERGAMINHO.nome,
    }).setOrigin(0.5, 0).setDepth(801);
    this.add.text(l / 2, cy + 26, 'em construcao — espaco para pular', {
      fontFamily: FONTE, fontSize: '8px', color: TEMA_PERGAMINHO.texto,
    }).setOrigin(0.5, 0).setDepth(801);

    this.input.keyboard.once('keydown-SPACE', () => this.venceu());
    this.time.delayedCall(4000, () => this.venceu());
  }
}
