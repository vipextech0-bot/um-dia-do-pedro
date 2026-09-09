import { texturaDeMapa, conferirMapa } from './pixel.js';
import { carregarPersonagens } from './personagens.js';

// Legendas de cor. Cada personagem tem contorno escuro ('o'), duas ou tres
// tonalidades por material e uma luz. E o que da o volume no pixel art.
const PELE = { s: '#e8b98c', S: '#c9946a', h: '#f7d9b4' };
const CABELO = { K: '#3d2517', k: '#5c3a22', L: '#7a4f2c' };
const MOLETOM = { C: '#9c3f26', c: '#cc6a35', b: '#ef9a5c' };
const JEANS = { D: '#1e2b43', d: '#33456a', e: '#4a6390' };
const TENIS = { t: '#241c22', T: '#4a3d4e' };
const CONTORNO = { o: '#2a1a16' };

const LEGENDA_PEDRO = { ...CONTORNO, ...PELE, ...CABELO, ...MOLETOM, ...JEANS, ...TENIS };

// Placa de ponto de onibus, usada no menu como detalhe de cenario. 11 x 26
const LEGENDA_PLACA = {
  o: '#1c1218', m: '#4a3a44', M: '#6b5560', a: '#ffd66b', A: '#c88a2e', v: '#2f2038',
};
const PLACA_PONTO = [
  'ooooooooooo',
  'oAAAAAAAAAo',
  'oAaaaaaaaAo',
  'oAaAAAAAaAo',
  'oAaAvvvAaAo',
  'oAaAvavAaAo',
  'oAaAvvvAaAo',
  'oAaAAAAAaAo',
  'oAaaaaaaaAo',
  'oAAAAAAAAAo',
  'ooooooooooo',
  '...oMmo....',
  '...oMmo....',
  '...oMmo....',
  '...oMmo....',
  '...oMmo....',
  '...oMmo....',
  '...oMmo....',
  '...oMmo....',
  '...oMmo....',
  '...oMmo....',
  '...oMmo....',
  '...oMmo....',
  '...oMmo....',
  '..oMMmmo...',
  '..ooooooo..',
];

// Mochila largada no chao ao lado do Pedro. 14 x 16
const LEGENDA_PROPS = {
  o: '#1c1016', m: '#3d2a5c', M: '#54397e', n: '#6b4a9c', z: '#c8a24a',
  w: '#2a1a16', W: '#4a3428', a: '#ffd66b', A: '#c88a2e', g: '#8a8f7a', G: '#b9bfa4',
};
const MOCHILA = [
  '....oooooo....',
  '..oommmmmmoo..',
  '.ommMMMMMMmmo.',
  'ommMMMMMMMMmmo',
  'omMMMnnnnMMMmo',
  'omMMnnnnnnMMmo',
  'omMMnnnnnnMMmo',
  'omMMMzzzzMMMmo',
  'omMMMMMMMMMMmo',
  'omMMMMMMMMMMmo',
  'omMMMnnnnMMMmo',
  'omMMMMMMMMMMmo',
  'ommMMMMMMMMmmo',
  '.ommmmmmmmmmo.',
  '..oooooooooo..',
  '..............',
];

// Caneca esquecida no chao. 9 x 9
const CANECA = [
  '.ooooooo...',
  'oWWWWWWWo..',
  'oWaaaaaWo..',
  'oWaaaaaWoo.',
  'oWWWWWWWoWo',
  'oWWWWWWWoWo',
  'oWWWWWWWoo.',
  'oWWWWWWWo..',
  '.ooooooo...',
];


// Despertador em cima do criado-mudo. 16 x 15.
const LEGENDA_RELOGIO = {
  o: '#1c1016', m: '#8a2f2a', M: '#c94a3e', a: '#f2e6cc', A: '#c9b48c',
  p: '#3a2418', z: '#ffd66b',
};
const DESPERTADOR = [
  '.oo..........oo.',
  'ommo........ommo',
  'omMmo......omMmo',
  '.ommoooooooommo.',
  '..ooMMMMMMMMoo..',
  '.omMMmmmmmmMMmo.',
  'omMmaaaaaaaammMo',
  'omMmaAAAAAAammMo',
  'omMmaAzzzzAammMo',
  'omMmaAAAAAAammMo',
  'omMmaaaaaaaammMo',
  '.omMMmmmmmmMMmo.',
  '..oommMMMMmmoo..',
  '...opo....opo...',
  '...ooo....ooo...',
];

// Bolha de sabao: pelicula translucida, brilho no alto a esquerda e um
// reflexo iridescente na borda. 16 x 16 e 12 x 12.
const LEGENDA_BOLHA = {
  o: 'rgba(150,215,245,0.95)', w: 'rgba(205,235,255,0.28)', W: '#ffffff',
  m: 'rgba(240,180,230,0.85)', g: 'rgba(180,245,205,0.85)', y: 'rgba(255,240,180,0.85)',
};
const BOLHA_G = [
  '.....oooooo.....',
  '...oowwwwwwoo...',
  '..owwWWwwwwwwo..',
  '.owwWWWwwwwwwwo.',
  '.owWWwwwwwwwwwo.',
  'owWWwwwwwwwwwwmo',
  'owwwwwwwwwwwwwmo',
  'owwwwwwwwwwwwwmo',
  'owwwwwwwwwwwwwgo',
  'owwwwwwwwwwwwwgo',
  '.owwwwwwwwwwwyo.',
  '.owwwwwwwwwwwyo.',
  '..owwwwwwwwwWo..',
  '...oowwwwwWWoo..',
  '.....oooooo.....',
  '................',
];
const BOLHA_P = [
  '...oooooo...',
  '..owWWwwwmo.',
  '.owWWwwwwwmo',
  '.oWWwwwwwwmo',
  'owwwwwwwwwgo',
  'owwwwwwwwwgo',
  'owwwwwwwwwgo',
  'owwwwwwwwyo.',
  '.owwwwwwwyo.',
  '.owwwwwwWWo.',
  '..oowwwWoo..',
  '...oooooo...',
];

// Gota de agua fria, com brilho e cauda. 8 x 14
const LEGENDA_GOTA = {
  o: '#2a5a8a', B: '#4a9ad8', b: '#6ab8f0', W: '#d8f0ff', c: 'rgba(120,180,240,0.55)',
};
const GOTA = [
  '...cc...',
  '...cc...',
  '...oo...',
  '..oBbo..',
  '..oBbo..',
  '.oBBbbo.',
  '.oBBbWo.',
  'oBBBbbWo',
  'oBBBBbWo',
  'oBBBBBbo',
  '.oBBBBo.',
  '..oBBo..',
  '...oo...',
  '........',
];

// Coracao de vida (para os acertos de agua fria). 9 x 8
const LEGENDA_VIDA = { o: '#5a1a1a', r: '#d94f45', p: '#ef7a5a', W: '#fff0b8', g: '#4a3d4e', G: '#6b5a60' };
const VIDA = [
  '.oo...oo.',
  'orrooorro',
  'orWrrrrro',
  'orrrrrrro',
  '.orrrrro.',
  '..orrro..',
  '...oro...',
  '....o....',
];
const VIDA_VAZIA = VIDA.map((l) => l.replace(/[rpW]/g, 'g'));

// ---- Fase 3: veiculos vistos de tras, buraco e moeda -----------------------
// O onibus e o do Pedro; os carros ganham cor pela legenda escolhida.
const LEGENDA_ONIBUS = {
  o: '#2a1a16', Y: '#f2a04d', y: '#c8582b', g: '#6b96a8', G: '#9cc4d8', w: '#dfe8ee',
  W: '#f2e6cc', R: '#8a1f1a', r: '#ff5a4a', D: '#3a3a44', t: '#1c1c22', u: '#4a3d4e',
};
const LEGENDA_CARRO_BASE = { o: '#1c1218', g: '#6b96a8', G: '#9cc4d8', W: '#f2e6cc', R: '#8a1f1a', r: '#ff5a4a', D: '#3a3a44', t: '#1c1c22' };
const CORES_CARRO = {
  carroVermelho: { C: '#b8342c', c: '#e05a4e' },
  carroAzul: { C: '#2f4a8a', c: '#4a6bb8' },
  carroBranco: { C: '#d8d4c8', c: '#f2efe6' },
  carroVerde: { C: '#2f6b3a', c: '#4a9a58' },
};
const LEGENDA_MOTO = { o: '#1c1218', H: '#d94f45', h: '#ff8a7a', J: '#3a3a44', M: '#6b6b78', R: '#ff5a4a', t: '#1c1c22' };
const LEGENDA_BURACO = { o: '#2a1a14', B: '#1c1210', b: '#0d0a08' };
const LEGENDA_MOEDA = { o: '#1f4a28', G: '#5fbf6a', g: '#a8f0b0' };

const ONIBUS = [
  '..........oooooooooooooooooooooooooo............',
  '........ooYYYYYYYYYYYYYYYYYYYYYYYYYYoo..........',
  '......ooYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYoo........',
  '.....oYYYyyyyyyyyyyyyyyyyyyyyyyyyyyyyYYYo.......',
  '.....oYYoooooooooooooooooooooooooooooYYo........',
  '.....oYYoggggggggggggggggggggggggggggoYYo.......',
  '.....oYYogGGGGGGGGGGGGGGGGGGGGGGGGGGgoYYo.......',
  '.....oYYogGGGGGGGGGGGGGGGGGGGGGGGGGGgoYYo.......',
  '.....oYYogGGGGwwGGGGGGGGGGGGGGGGGGGGgoYYo.......',
  '.....oYYogGGGGwwGGGGGGGGGGGGGGGGGGGGgoYYo.......',
  '.....oYYogGGGGGGGGGGGGGGGGGGGGGGGGGGgoYYo.......',
  '.....oYYogggggggggggggggggggggggggggggoYYo......',
  '.....oYYoooooooooooooooooooooooooooooYYo........',
  '.....oYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYo.......',
  '.....oYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYo.......',
  '.....oYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYo.......',
  '.....oYYYYYYYYYYoooooooooooooooYYYYYYYYYo.......',
  '.....oYYYYYYYYYYoWWWWWWWWWWWWWoYYYYYYYYYo.......',
  '.....oYYYYYYYYYYoWWWWWWWWWWWWWoYYYYYYYYYo.......',
  '.....oYYYYYYYYYYoooooooooooooooYYYYYYYYYo.......',
  '.....oYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYo.......',
  '.....oyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyo.......',
  '.....oRRRRooyyyyyyyyyyyyyyyyyyyyyyooRRRRo.......',
  '.....oRrrRooyyyyyyyyyyyyyyyyyyyyyyooRrrRo.......',
  '.....oRRRRooyyyyyyyyyyyyyyyyyyyyyyooRRRRo.......',
  '.....oooooooooooooooooooooooooooooooooooo.......',
  '......oDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDo.......',
  '......oDDoooDDDDDDDDDDDDDDDDDDDDDDDoooDDo.......',
  '......oDDottoDDDDDDDDDDDDDDDDDDDDDDottoDDo......',
  '.......ooottoooooooooooooooooooooooottooo.......',
  '.......ottttto....................ottttto.......',
  '.......oooooo......................oooooo.......',
];

const CARRO = [
  '.....oooooooooooooo......',
  '....oCCCCCCCCCCCCCCo.....',
  '...oCCooooooooooooCCo....',
  '..oCCoggggggggggggoCCo...',
  '..oCCoGGGGGGGGGGGGoCCo...',
  '..oCCoggggggggggggoCCo...',
  '..oCCooooooooooooooCCo...',
  '.oCCCCCCCCCCCCCCCCCCCCo..',
  '.oCcccccccccccccccccCCo..',
  '.oCCCCCCCCCCCCCCCCCCCCo..',
  '.oRRooCCCCCCCCCCCCooRRo..',
  '.oRrooCCCCoWWWoCCCooRro..',
  '.oRRooCCCCoWWWoCCCooRRo..',
  '.ooooooooooooooooooooooo.',
  '..ottoDDDDDDDDDDDDotto...',
  '..otttooooooooooooottto..',
  '..ooooo..........ooooo...',
];

const MOTO = [
  '....oooo....',
  '...oHHHHo...',
  '...oHhhHo...',
  '...ooHHoo...',
  '..oJJJJJJo..',
  '.oJJJJJJJJo.',
  '.oJJJJJJJJo.',
  '..oJJooJJo..',
  '..oMMooMMo..',
  '...oMMMMo...',
  '...oRRRRo...',
  '...otttto...',
  '..otttttto..',
  '..otttttto..',
  '...oooooo...',
];

const BURACO = [
  '......oooooooooooo......',
  '...oooBBBBBBBBBBBBooo...',
  '.ooBBBbbbbbbbbbbbbBBBoo.',
  'oBBBbbbbbbbbbbbbbbbbBBBo',
  'oBBBbbbbbbbbbbbbbbbbBBBo',
  '.ooBBBbbbbbbbbbbbbBBBoo.',
  '...oooBBBBBBBBBBBBooo...',
  '......oooooooooooo......',
];

const MOEDA = [
  '...oooooo...',
  '..oGGggGGo..',
  '.oGGggggGGo.',
  'oGGgGGGGgGGo',
  'oGgGGGGGGgGo',
  'oGgGGGGGGgGo',
  'oGgGGGGGGgGo',
  'oGGgGGGGgGGo',
  '.oGGggggGGo.',
  '..oGGggGGo..',
  '...oooooo...',
];

// Pato de borracha no chao do banheiro. 12 x 10
const LEGENDA_PATO = { o: '#7a5a10', Y: '#ffd66b', y: '#e0a83a', L: '#e07a3f', W: '#ffffff', k: '#1c1016' };
const PATO = [
  '....oooo....',
  '...oYYYYo...',
  '...oYkYYoo..',
  '...oYYYYoLLo',
  '..ooYYYYoLo.',
  '.oYYYYYYYo..',
  'oYYYYYYYYYo.',
  'oyYYYYYYYyo.',
  '.oyyyyyyyo..',
  '..ooooooo...',
];

export function carregarSprites(cena) {
  texturaDeMapa(cena, 'pato', conferirMapa('pato', PATO), LEGENDA_PATO);
  carregarPersonagens(cena);
  texturaDeMapa(cena, 'placaPonto', conferirMapa('placaPonto', PLACA_PONTO), LEGENDA_PLACA);
  texturaDeMapa(cena, 'mochila', conferirMapa('mochila', MOCHILA), LEGENDA_PROPS);
  texturaDeMapa(cena, 'caneca', conferirMapa('caneca', CANECA), LEGENDA_PROPS);
  texturaDeMapa(cena, 'despertador', conferirMapa('despertador', DESPERTADOR), LEGENDA_RELOGIO);
  texturaDeMapa(cena, 'bolhaG', conferirMapa('bolhaG', BOLHA_G), LEGENDA_BOLHA);
  texturaDeMapa(cena, 'bolhaP', conferirMapa('bolhaP', BOLHA_P), LEGENDA_BOLHA);
  texturaDeMapa(cena, 'gota', conferirMapa('gota', GOTA), LEGENDA_GOTA);
  texturaDeMapa(cena, 'vida', conferirMapa('vida', VIDA), LEGENDA_VIDA);
  texturaDeMapa(cena, 'vidaVazia', conferirMapa('vidaVazia', VIDA_VAZIA), LEGENDA_VIDA);
  texturaDeMapa(cena, 'onibus', conferirMapa('onibus', ONIBUS), LEGENDA_ONIBUS);
  Object.entries(CORES_CARRO).forEach(([chave, cores]) => {
    texturaDeMapa(cena, chave, conferirMapa(chave, CARRO), { ...LEGENDA_CARRO_BASE, ...cores });
  });
  texturaDeMapa(cena, 'moto', conferirMapa('moto', MOTO), LEGENDA_MOTO);
  texturaDeMapa(cena, 'buraco', conferirMapa('buraco', BURACO), LEGENDA_BURACO);
  texturaDeMapa(cena, 'moeda', conferirMapa('moeda', MOEDA), LEGENDA_MOEDA);
}

export const MAPAS = { PLACA_PONTO, MOCHILA, CANECA, DESPERTADOR };
