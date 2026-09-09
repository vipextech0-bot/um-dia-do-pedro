// Ordem fixa das fases. Cada entrada define o que a HUD mostra e qual
// cena vem depois. Fase 0 (Menu) e o Epilogo ficam fora da contagem.
export const FASES = [
  { chave: 'Fase1Acordar',    numero: 1, horario: '07:00', titulo: 'Acordar',    proxima: 'Fase2Banho' },
  { chave: 'Fase2Banho',      numero: 2, horario: '07:10', titulo: 'Banho',      proxima: 'Fase3Onibus' },
  { chave: 'Fase3Onibus',     numero: 3, horario: '07:30', titulo: 'Onibus',     proxima: 'Fase4Escritorio' },
  { chave: 'Fase4Escritorio', numero: 4, horario: '08:00', titulo: 'Escritorio', proxima: 'Fase5Trabalho' },
  { chave: 'Fase5Trabalho',   numero: 5, horario: '08:15', titulo: 'Trabalho',   proxima: 'Fase6Faculdade' },
  { chave: 'Fase6Faculdade',  numero: 6, horario: '19:00', titulo: 'Faculdade',  proxima: 'Fase7Ligacao' },
  { chave: 'Fase7Ligacao',    numero: 7, horario: '21:50', titulo: 'A ligacao',  proxima: 'Epilogo' },
];

export const TOTAL_FASES = FASES.length;

export function infoFase(chave) {
  return FASES.find((f) => f.chave === chave) || null;
}

// Frases da Tela de Recomeco (roteiro, secao "Tela de Recomeco").
export const FRASES_RECOMECO = [
  'Nao desista. Nao procrastine.\nApenas continue.',
  'Perder faz parte.\nParar nao.',
  'Quem continua\nsempre chega.',
  'Cada tentativa e um passo.\nLevanta.',
  'No final vai dar certo.\nContinua.',
];
