"""Gera src/arte/retratos.js e src/arte/personagens.js a partir do pintor."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
import pintor

RAIZ = os.path.join(os.path.dirname(__file__), '..', 'src', 'arte')

LEGENDA = """{
  o: '#2a1a16',
  s: '#e8b98c', S: '#c9946a', h: '#f7d9b4', B: '#e8a08c',
  K: '#3d2517', L: '#5c3a22',
  G: '#5a5560', g: '#8a8694',
  w: '#f7f0e2', W: '#ffffff', I: '#5c3a22', R: '#a8624a',
  c: '#cc6a35', C: '#9c3f26', b: '#ef9a5c',
  N: '#26304a', n: '#39466b', T: '#a83a32',
  d: '#33456a', D: '#1e2b43',
  t: '#241c22', u: '#4a3d4e',
  r: '#d94f45', p: '#ef7a5a', q: '#b03a34',
  A: '#1c1a22', a: '#3a3644', v: '#2f6b3a', V: '#1f4a28', J: '#3a3a44', M: '#4a4a58',
  Q: '#c4b498', Y: '#e0a05c', y: '#b07a3c',
  Z: '#241812', E: '#3d2a24', X: '#b8907a', U: '#2f5a9a', z: '#c8a24a', P: '#c07068',
  e: '#efcdb0', f: '#d4a888', x: '#101014',
}"""

retratos = f"""import {{ texturaDeMapa, conferirMapa }} from './pixel.js';

// ARQUIVO GERADO por ferramentas/gerar.py — edite o pintor, nao este arquivo.
// Retratos de busto 64x64 para a caixa de dialogo.

const LEGENDA = {LEGENDA};

{pintor.retrato_pedro().js('RETRATO_PEDRO')}

{pintor.retrato_victor().js('RETRATO_VICTOR')}

{pintor.retrato_sabrina().js('RETRATO_SABRINA')}

export function carregarRetratos(cena) {{
  texturaDeMapa(cena, 'retratoPedro', conferirMapa('retratoPedro', RETRATO_PEDRO), LEGENDA);
  texturaDeMapa(cena, 'retratoVictor', conferirMapa('retratoVictor', RETRATO_VICTOR), LEGENDA);
  texturaDeMapa(cena, 'retratoSabrina', conferirMapa('retratoSabrina', RETRATO_SABRINA), LEGENDA);
}}

export const RETRATOS = {{ pedro: 'retratoPedro', victor: 'retratoVictor' }};
"""

personagens = f"""import {{ texturaDeMapa, conferirMapa }} from './pixel.js';

// ARQUIVO GERADO por ferramentas/gerar.py — edite o pintor, nao este arquivo.
// Personagens de corpo inteiro (24x48) e variacoes de pose.

const LEGENDA = {LEGENDA};

{pintor.pedro_em_pe().js('PEDRO_EM_PE')}

{pintor.victor_em_pe().js('VICTOR_EM_PE')}

{pintor.pedro_dormindo().js('PEDRO_DORMINDO')}

{pintor.pedro_sentado().js('PEDRO_SENTADO')}

{pintor.pedro_na_cama().js('PEDRO_NA_CAMA')}

{pintor.pedro_banho(0).js('PEDRO_BANHO_0')}

{pintor.pedro_banho(1).js('PEDRO_BANHO_1')}

{pintor.pedro_banho(2).js('PEDRO_BANHO_2')}

{pintor.pedro_banho(3).js('PEDRO_BANHO_FRIO')}

{pintor.pedro_digitando_g(0).js('PEDRO_DIGITANDO_G0')}

{pintor.pedro_digitando_g(1).js('PEDRO_DIGITANDO_G1')}

{pintor.colega_digitando_g(0).js('COLEGA_DIGITANDO_G0')}

{pintor.colega_digitando_g(1).js('COLEGA_DIGITANDO_G1')}

{pintor.pedro_no_banco().js('PEDRO_NO_BANCO')}

{pintor.pedro_adulto().js('PEDRO_ADULTO')}

{pintor.sabrina().js('SABRINA')}

{pintor.professor().js('PROFESSOR')}

{pintor.recepcionista().js('RECEPCIONISTA')}

{pintor.onibus_lateral().js('ONIBUS_LATERAL')}

{pintor.cachorro(('Y', 'p')).js('CACHORRO_DOURADO_0')}

{pintor.cachorro(('Y', 'p'), 1).js('CACHORRO_DOURADO_1')}

{pintor.cachorro(('a', 'M')).js('CACHORRO_ESCURO_0')}

{pintor.cachorro(('a', 'M'), 1).js('CACHORRO_ESCURO_1')}

{pintor.casal_beijo().js('CASAL_BEIJO')}

export function carregarPersonagens(cena) {{
  texturaDeMapa(cena, 'pedroEmPe', conferirMapa('pedroEmPe', PEDRO_EM_PE), LEGENDA);
  texturaDeMapa(cena, 'victorEmPe', conferirMapa('victorEmPe', VICTOR_EM_PE), LEGENDA);
  texturaDeMapa(cena, 'pedroDormindo', conferirMapa('pedroDormindo', PEDRO_DORMINDO), LEGENDA);
  texturaDeMapa(cena, 'pedroSentado', conferirMapa('pedroSentado', PEDRO_SENTADO), LEGENDA);
  texturaDeMapa(cena, 'pedroNaCama', conferirMapa('pedroNaCama', PEDRO_NA_CAMA), LEGENDA);
  texturaDeMapa(cena, 'pedroBanho0', conferirMapa('pedroBanho0', PEDRO_BANHO_0), LEGENDA);
  texturaDeMapa(cena, 'pedroBanho1', conferirMapa('pedroBanho1', PEDRO_BANHO_1), LEGENDA);
  texturaDeMapa(cena, 'pedroBanho2', conferirMapa('pedroBanho2', PEDRO_BANHO_2), LEGENDA);
  texturaDeMapa(cena, 'pedroBanhoFrio', conferirMapa('pedroBanhoFrio', PEDRO_BANHO_FRIO), LEGENDA);
  texturaDeMapa(cena, 'pedroDigitandoG0', conferirMapa('pedroDigitandoG0', PEDRO_DIGITANDO_G0), LEGENDA);
  texturaDeMapa(cena, 'pedroDigitandoG1', conferirMapa('pedroDigitandoG1', PEDRO_DIGITANDO_G1), LEGENDA);
  texturaDeMapa(cena, 'colegaDigitandoG0', conferirMapa('colegaDigitandoG0', COLEGA_DIGITANDO_G0), LEGENDA);
  texturaDeMapa(cena, 'colegaDigitandoG1', conferirMapa('colegaDigitandoG1', COLEGA_DIGITANDO_G1), LEGENDA);
  texturaDeMapa(cena, 'pedroNoBanco', conferirMapa('pedroNoBanco', PEDRO_NO_BANCO), LEGENDA);
  texturaDeMapa(cena, 'pedroAdulto', conferirMapa('pedroAdulto', PEDRO_ADULTO), LEGENDA);
  texturaDeMapa(cena, 'esposa', conferirMapa('esposa', SABRINA), LEGENDA);
  texturaDeMapa(cena, 'professor', conferirMapa('professor', PROFESSOR), LEGENDA);
  texturaDeMapa(cena, 'recepcionista', conferirMapa('recepcionista', RECEPCIONISTA), LEGENDA);
  texturaDeMapa(cena, 'onibusLateral', conferirMapa('onibusLateral', ONIBUS_LATERAL), LEGENDA);
  texturaDeMapa(cena, 'cachorroDourado0', conferirMapa('cachorroDourado0', CACHORRO_DOURADO_0), LEGENDA);
  texturaDeMapa(cena, 'cachorroDourado1', conferirMapa('cachorroDourado1', CACHORRO_DOURADO_1), LEGENDA);
  texturaDeMapa(cena, 'cachorroEscuro0', conferirMapa('cachorroEscuro0', CACHORRO_ESCURO_0), LEGENDA);
  texturaDeMapa(cena, 'cachorroEscuro1', conferirMapa('cachorroEscuro1', CACHORRO_ESCURO_1), LEGENDA);
  texturaDeMapa(cena, 'casalBeijo', conferirMapa('casalBeijo', CASAL_BEIJO), LEGENDA);
}}
"""

open(os.path.join(RAIZ, 'retratos.js'), 'w').write(retratos)
open(os.path.join(RAIZ, 'personagens.js'), 'w').write(personagens)
print('gerados: retratos.js, personagens.js')
