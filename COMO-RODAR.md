# Um Dia do Pedro — como rodar

Versão publicada (GitHub Pages): https://vipextech0-bot.github.io/um-dia-do-pedro/
Cada `git push` na branch `main` atualiza o site em 1–2 minutos.

O jogo usa módulos ES, então precisa de um servidor local (abrir o
`index.html` direto pelo Finder não funciona).

```bash
cd /Users/pedronascimentoandreoli/freelance/game
python3 -m http.server 4173
```

Depois abra: http://localhost:4173

## Resolução e arte

O jogo roda numa tela interna de **480x270** e é ampliado com
nearest-neighbour. Retratos têm 64x64 pixels e personagens 24x48.

- [src/arte/pixel.js](src/arte/pixel.js) — motor: mapas de texto viram
  texturas, mais dithering (o xadrez que substitui o degradê).
- [src/arte/sprites.js](src/arte/sprites.js) — sprites desenhados pixel a
  pixel (Pedro, mochila, caneca, placa do ponto).
- [src/arte/cenario.js](src/arte/cenario.js) — céu, sol, nuvens, prédios,
  rua e poste (usados no menu).
- [src/arte/cenarios.js](src/arte/cenarios.js) — os cinco ambientes das
  fases: quarto, banheiro, escritório, sala de aula e ponto de ônibus.
- [ferramentas/pintor.py](ferramentas/pintor.py) — pintor de sprites por
  primitivas (elipses, retângulos, contorno automático, espelhamento).
  `python3 ferramentas/gerar.py` regenera **retratos.js** e
  **personagens.js** — edite o pintor, não os arquivos gerados.
- [src/arte/retratos.js](src/arte/retratos.js) — retratos 64x64 do Pedro e
  do Victor (gerados).
- [src/arte/personagens.js](src/arte/personagens.js) — Pedro em pé, Victor
  em pé, Pedro dormindo, Pedro sentado (gerados).
- [src/ui/moldura.js](src/ui/moldura.js) — moldura de pergaminho estilo
  Stardew (caixa, moldura do retrato, aba de nome).
- [src/ui/Dialogo.js](src/ui/Dialogo.js) — texto letra por letra, retrato,
  aba de nome e menu de escolhas com teclado e mouse.

## Fase 1 — Acordar

Aparece uma tecla grande (setas ou A S D F J K L). Aperte a tecla certa
5 vezes seguidas antes da barra de **SONO** encher. Errar zera a sequência,
vira o Pedro na cama e acelera a barra. Teclas fora do jogo (espaço, shift)
são ignoradas.

## Fase 2 — Banho

Setas ← → (ou A/D) movem o Pedro dentro do box. Bolhas de sabão caem
balançando; pegue **15 em 25 segundos**. Gotas azuis são água fria: cada
uma tira um coração e congela o Pedro por meio segundo (ele pisca imune por
1,4s em seguida). Três gotas, ou o tempo acabar, e acabou. A partir da
metade do tempo tudo cai mais rápido e algumas gotas vêm em dupla, mirando
onde o Pedro está. Três bolhas seguidas (sem deixar cair nem levar gota)
dão +1 de bônus.

## Fase 3 — Ônibus

Setas ← → (ou A/D) trocam de faixa. O ônibus acelera sozinho por 45s até o
ponto do escritório. Carros, motos e buracos aparecem no horizonte; três
batidas e o ônibus quebra. Moedas verdes de pontualidade dão bônus (contado
na chegada). Depois de perder um coração, às vezes aparece um coração na
pista que devolve a vida. Desviar no último instante rende "por pouco! +2".
Placas na beira marcam a distância até o escritório. Quando vêm dois obstáculos juntos, a faixa livre é sempre
alcançável com uma única troca.

## Fase 5 — Trabalho

A tela do notebook ocupa tudo. Processos caem como pastas coloridas num
grid de 10x16: ← → movem, ▲ gira, ▼ acelera, espaço solta. Linha completa =
processo protocolado — as pastas de cima descem para ocupar o espaço;
**5 linhas** encerram o expediente (o relógio da HUD avança das 08:15 até
17:00). A cada 2 linhas o Victor manda mensagem e a queda acelera. Pilha no topo = a mesa afogou.

## Fase 6 — Faculdade (Ciência da Computação)

Corrida de digitação. Palavras (função, variável, loop, deploy, bug,
commit, classe, servidor, banco, lógica) caem no editor; a primeira letra
digitada escolhe a palavra mais baixa que começa com ela, e o resto precisa
vir na ordem — acentos não são necessários. Cada palavra dá 8% para o
Pedro; o colega chega a 100% sozinho em 46s. Errar uma letra solta a
palavra. Cinco palavras no chão ("bugs") ou o colega terminar antes = perdeu.
Palavras seguidas sem erro formam uma **sequência** que rende bônus.

## Celular

Funciona no toque: metades da tela para andar/trocar de faixa (fases 2 e
3), três teclas tocáveis na Fase 1, botões ◀ ▶ ▼ ↻ ⤓ no Tetris, **teclado
próprio na tela** na Fase 6 (só as letras das palavras), **II** na barra de
cima pausa, vibração ao levar dano (Android), botão de tela cheia no menu.
Em celulares largos (19,5:9) a largura lógica cresce de 480 para até 540 px
para não sobrar tarja preta; o *notch* é respeitado (safe-area). Em pé, a
tela pede para virar o aparelho.

## Progresso e "seu dia"

O jogo lembra em que fase você parou (botão **CONTINUAR** no menu), quantas
vezes recomeçou e quantas moedas de pontualidade juntou. O epílogo diz
"Recomeçou N vezes. Nunca desistiu." e os créditos mostram o bloco SEU DIA.
COMEÇAR O DIA zera tudo.

## Som

Tudo sintetizado na hora ([src/audio/som.js](src/audio/som.js)), sem
arquivos de áudio: efeitos por fase (acerto, erro, bolha, gota, moeda,
batida, linha, tecla…), bateria leve (bumbo, caixa e chimbal de ruído) e
uma música chiptune por clima (menu, dia, corrida no ônibus, foco no
trabalho e na faculdade, noite, epílogo). O navegador só libera o áudio depois do primeiro clique/tecla.
**M** (ou o botão "som" no menu) liga e desliga (a escolha fica salva).
Melodia, baixo e bateria de cada trilha têm o mesmo número de batidas —
`conferirTrilhas()` em som.js confere — senão as vozes se desencontram. **Esc** pausa qualquer fase
(CONTINUAR ou voltar ao MENU).

## Fase 7 — A ligação e Epílogo

Cena narrativa no ponto de ônibus: as cinco falas do Pedro aparecem letra
por letra (espaço acelera) e a Sabrina responde no fim — a fala dela está em
[Fase7Ligacao.js](src/scenes/Fase7Ligacao.js), fácil de trocar. Fade para "10 anos depois..." e o Epílogo: a
varanda ao pôr do sol, Pedro adulto e a esposa, os monitores da VipexTech e
o diploma pela janela, dois cachorros na varanda (um deitado abanando o
rabo, outro correndo); as linhas aparecem uma a uma, Pedro vai até ela e
os dois se beijam (corações, cachorros pulando), depois a cena de
**créditos** rolando com os retratos do elenco (Pedro, Sabrina, Victor),
ficha técnica e agradecimentos; espaço pula para a tela final com
**JOGAR DE NOVO**.

## Personagens

Retratos e sprites são baseados nas fotos reais: Pedro (cabelo preto
volumoso, barba rala, suéter preto), Victor (cabelo raspado com entradas,
cavanhaque grisalho, terno preto e gravata azul) e Sabrina (cabelo longo
liso castanho-escuro, colar de conchas com estrela-do-mar, top preto
estampado). Tudo em [ferramentas/pintor.py](ferramentas/pintor.py).

## Diálogos

Espaço ou Enter completa a linha; de novo, avança. Nas escolhas, as setas
↑ ↓ movem o cursor e Enter confirma (o mouse também funciona). A **Fase 4 —
Escritório** já está inteira: dá para jogar do começo ao fim.

## Atalhos de desenvolvimento

- No console do navegador: `ir('Fase5Trabalho')` pula direto para qualquer cena.
- Chaves de cena: `Menu`, `Fase1Acordar`, `Fase2Banho`, `Fase3Onibus`,
  `Fase4Escritorio`, `Fase5Trabalho`, `Fase6Faculdade`, `Fase7Ligacao`,
  `Epilogo`, `TelaRecomeco`.
- Fases ainda não implementadas mostram "em construção" e seguem sozinhas
  (espaço pula). Não existem botões de vencer/perder: perder é só na
  mecânica real.
- `ir('Galeria')` mostra todos os sprites ampliados lado a lado.

## Status das etapas

- [x] Etapa 1 — estrutura, Menu, HUD, Transição, Tela de Recomeço, stubs das fases
- [x] Etapa 1.1 — correção do botão RECOMEÇAR + arte pixel art detalhada
- [x] Etapa 1.2 — diálogos estilo Stardew + cenários das fases
- [x] Etapa 2 — **Fase 4: Escritório** (completa, cena de diálogo)
- [x] Etapa 3 — **Fase 1: Acordar** (completa, quick-time event)
- [x] Etapa 3.1 — resolução 480x270, retratos 64x64, correção do clique
  (hover que engolia o clique) e do scroll da página; Fase 1, Menu,
  Transição e Tela de Recomeço refeitos na nova resolução
- [x] Etapa 4 — **Fase 2: Banho** (completa, minigame de bolhas)
- [x] Etapa 5 — **Fase 3: Ônibus** (completa, runner em perspectiva)
- [x] Etapa 6 — **Fase 5: Trabalho** (completa, Tetris de processos)
- [x] Etapa 7 — **Fase 6: Faculdade** (completa, corrida de digitação)
- [x] Etapa 8 — **Fase 7: A ligação + Epílogo** (completos — o jogo fecha o ciclo)
