# UM DIA DO PEDRO
### Game design document (roteiro para o Claude Code)

**Gênero:** coletânea de mini-games em pixel art, narrativa linear
**Duração:** 5 a 8 minutos por partida
**Plataforma:** navegador (HTML5 + Phaser.js)
**Tema:** um dia comum de quem está construindo o futuro. A vida é um jogo, e quem sabe jogar chega lá.

---

## Regras globais

- **Visual:** pixel art 16 bits, paleta quente (laranja, amarelo, marrom), fonte "Press Start 2P".
- **Progressão:** as fases são jogadas em ordem fixa. Vencer uma fase avança para a próxima.
- **Derrota:** nunca existe game over definitivo. Ao perder, aparece a **Tela de Recomeço** e o jogador volta ao início da mesma fase.
- **Transições:** corte seco com fade preto e um relógio pixelado mostrando o horário da próxima cena.
- **HUD:** canto superior esquerdo mostra o horário do dia; canto superior direito mostra a fase atual (ex.: 3/7).

### Tela de Recomeço (aparece toda vez que o jogador perde)
Fundo escuro, personagem sentado no chão, e uma frase entre estas, escolhida aleatoriamente:

- "Não desista. Não procrastine. Apenas continue."
- "Perder faz parte. Parar não."
- "Quem continua sempre chega."
- "Cada tentativa é um passo. Levanta."
- "No final vai dar certo. Continua."

Botão único: **[ RECOMEÇAR ]**

---

## FASE 0 — Menu
- Título "UM DIA DO PEDRO" piscando, cidade pixelada ao fundo, sol nascendo.
- Botão **[ COMEÇAR O DIA ]**.
- Rodapé: "A vida é um jogo. Aprenda a jogar."

---

## FASE 1 — Acordar (07:00)
**Cena:** quarto pixelado, Pedro dormindo, despertador tocando. Já está atrasado.

**Mecânica:** quick-time event.
- Uma barra de "sono" enche sozinha. O jogador precisa apertar a tecla que aparece na tela (setas ou letras aleatórias) antes que a barra complete.
- 5 teclas certas seguidas = Pedro levanta.
- Errar uma tecla = Pedro vira na cama, a barra acelera.

**Vitória:** Pedro sai da cama.
**Derrota:** barra de sono completa (Pedro dorme de novo e perde o ônibus).

---

## FASE 2 — Banho (07:10)
**Cena:** banheiro, Pedro embaixo do chuveiro, relógio correndo.

**Mecânica:** ritmo e reflexo.
- Bolhas de sabão caem do topo da tela. O jogador move Pedro para a esquerda e direita para pegar as bolhas e evitar as gotas de água fria (azuis).
- Precisa pegar 15 bolhas em 25 segundos.

**Vitória:** barra de "limpeza" cheia antes do tempo.
**Derrota:** o tempo acaba ou Pedro leva 3 gotas de água fria.

---

## FASE 3 — Ônibus (07:30)
**Cena:** rua da cidade vista de trás, estilo Subway Surfers, mas o jogador controla o ônibus.

**Mecânica:** endless runner com 3 faixas.
- O ônibus avança sozinho e acelera com o tempo.
- Carros, motos e buracos aparecem nas faixas. O jogador troca de faixa (esquerda/direita) para desviar.
- Coletar moedas verdes de "pontualidade" dá bônus.
- A fase dura 45 segundos e termina quando o ônibus chega ao ponto do escritório.

**Vitória:** chegar ao ponto final.
**Derrota:** bater em 3 obstáculos.

---

## FASE 4 — Chegada no escritório (08:00)
**Cena:** recepção do escritório de advocacia. Victor Viana (chefe e sogro do Pedro) está na porta, de braços cruzados, olhando o relógio.

**Mecânica:** diálogo com escolha (sem derrota, cena narrativa).
Victor: "Bom dia, Pedro. Sete e meia era o combinado."
Opções:
1. "Bom dia, Victor. O ônibus atrasou, mas já estou na cadeira." → Victor sorri de lado: "Vai trabalhar, genro."
2. "Desculpa, sogro." → Victor: "No escritório sou chefe. Em casa sou sogro. Senta."
3. (ficar em silêncio) → Victor: "...Senta aí, vai."

Qualquer escolha avança. Pedro caminha até a mesa e abre o notebook.

---

## FASE 5 — Trabalho (08:15 até 17:00)
**Cena:** a tela do notebook do Pedro ocupa a tela toda. Aparecem "processos" chegando como peças de um jogo de encaixe.

**Mecânica:** estilo Tetris simplificado.
- Peças em formato de pastas e documentos caem no grid.
- O jogador gira e encaixa as peças. Cada linha completa é "um processo protocolado".
- Objetivo: completar 10 linhas.
- A cada 3 linhas, aparece uma mensagem pop-up do Victor ("Bom trabalho." / "Mais um.") e a velocidade aumenta.

**Vitória:** 10 linhas completas. O relógio da HUD pula para 17:00 e aparece "Fim do expediente".
**Derrota:** a pilha de peças chega ao topo (a mesa "afogou" em processos).

---

## FASE 6 — Faculdade PUC Goiás (19:00 até 21:40)
**Cena:** sala de aula da PUC Goiás. Pedro no computador, aula de Análise e Desenvolvimento de Sistemas. Ao lado, um colega digitando furiosamente.

**Mecânica:** corrida de digitação (representa "programar", mas não é código de verdade).
- Palavras curtas caem na tela: **função, variável, loop, deploy, bug, commit, classe, servidor, banco, lógica**.
- O jogador digita cada palavra antes que ela toque o chão.
- Barra de progresso do Pedro versus barra do colega. O colega avança sozinho em velocidade constante.
- A fase termina quando a barra do Pedro chega a 100%.

**Vitória:** Pedro termina antes do colega.
**Derrota:** 5 palavras caem sem serem digitadas ou o colega termina primeiro.

Ao vencer: fade para preto, relógio marca **21:40**, texto na tela: "Fim da aula."

---

## FASE 7 — A ligação (21:50)
**Cena:** Pedro no ponto de ônibus, céu noturno com estrelas pixeladas, celular na mão. Cena narrativa, sem derrota. Música calma.

Texto aparece letra por letra, com opção de apertar espaço para acelerar:

> **Pedro:** "Oi, meu amor. Acabei a aula agora."
>
> **Pedro:** "Foi um dia longo. Acordei atrasado, o ônibus quase não chegou, o Victor me olhou torto, foram dez processos e uma aula inteira."
>
> **Pedro:** "Mas sabe o que eu pensei o dia todo? Que tudo isso vale a pena. Vale a pena por causa de você. Por causa da vida que eu quero construir com você."
>
> **Pedro:** "A vida é só um jogo. Difícil, às vezes injusto, cheio de fase que a gente perde. Mas quem aprende a jogar, quem não desiste na tela de recomeço, esse chega lá."
>
> **Pedro:** "Eu vou chegar lá. Por nós."

Fade lento para preto. Texto centralizado: **"10 anos depois..."**

---

## EPÍLOGO — 10 anos depois (2036)
**Cena:** mesma paleta, mas agora em tons de dourado. Pedro adulto, na varanda de uma casa ampla ao pôr do sol, ao lado da esposa. Ao fundo, dois monitores acesos com o logo da VipexTech e um quadro na parede com o diploma.

Texto aparece linha por linha:

> "Ele acordou cedo por dez anos."
> "Pegou o ônibus até poder escolher não pegar."
> "Encaixou processo, digitou código, ouviu 'não' e continuou."
> "Nunca desistiu na tela de recomeço."
>
> "E deu certo."

Pausa. Pedro se vira para a câmera. Última tela:

> **"A vida é um jogo. Obrigado por jogar comigo."**
> **[ JOGAR DE NOVO ]**

Créditos rolando: "Roteiro: Pedro Andreoli. Código: Claude. Inspiração: ela."

---

## Estrutura técnica sugerida

```
/um-dia-do-pedro
  index.html
  /src
    main.js            (config Phaser, registro de cenas)
    /scenes
      Menu.js
      Fase1Acordar.js
      Fase2Banho.js
      Fase3Onibus.js
      Fase4Escritorio.js
      Fase5Trabalho.js
      Fase6Faculdade.js
      Fase7Ligacao.js
      Epilogo.js
      TelaRecomeco.js  (recebe qual fase reiniciar)
    /ui
      HUD.js           (relógio e contador de fase)
      Dialogo.js       (caixa de texto letra por letra)
  /assets
    /sprites  /audio  /fonts
```

Cada cena expõe o mesmo contrato: `iniciar()`, `venceu()` chama a próxima cena, `perdeu()` chama `TelaRecomeco` passando o nome da cena atual.

---

## Prompt inicial para o Claude Code

> Crie um jogo em Phaser 3 chamado "Um Dia do Pedro", em pixel art, seguindo o arquivo `roteiro-um-dia-do-pedro.md` que está na raiz do projeto. Comece criando a estrutura de pastas descrita no documento, o `index.html`, o `main.js` com todas as cenas registradas, a cena `Menu`, a `TelaRecomeco` com as frases motivacionais e a `HUD`. Deixe cada fase como uma cena vazia com um botão "Vencer (debug)" para testar a transição. Use placeholders coloridos no lugar dos sprites por enquanto. Depois vamos implementar as fases uma a uma, começando pela Fase 1.
