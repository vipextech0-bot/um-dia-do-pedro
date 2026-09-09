"""
Pintor de pixel art: compoe sprites por primitivas (elipses, retangulos,
linhas), aplica contorno automatico e exporta o mapa como array JS.
Usado para gerar os retratos 64x64 e os personagens em src/arte/*.js.
Rode: python3 ferramentas/gerar.py

Personagens baseados nas fotos:
- Pedro: cabelo preto volumoso (topete alto), barba rala, sorriso largo,
  sueter preto de gola careca.
- Victor: cabelo raspado com entradas, cavanhaque grisalho, terno preto,
  camisa branca, gravata azul.
- Sabrina: cabelo comprido liso castanho-escuro com risca lateral,
  sobrancelhas marcadas, colar de conchas com estrela-do-mar, top preto
  estampado.
"""
import math


class Tela:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.g = [['.'] * w for _ in range(h)]

    def px(self, x, y, c):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.g[y][x] = c

    def get(self, x, y):
        if 0 <= x < self.w and 0 <= y < self.h:
            return self.g[y][x]
        return '.'

    def rect(self, x, y, w, h, c):
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                self.px(xx, yy, c)

    def elipse(self, cx, cy, rx, ry, c):
        for yy in range(int(cy - ry), int(cy + ry) + 1):
            for xx in range(int(cx - rx), int(cx + rx) + 1):
                if ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 <= 1.0:
                    self.px(xx, yy, c)

    def linha(self, x0, y0, x1, y1, c):
        n = max(abs(x1 - x0), abs(y1 - y0), 1)
        for i in range(n + 1):
            self.px(round(x0 + (x1 - x0) * i / n), round(y0 + (y1 - y0) * i / n), c)

    def hlinha(self, x0, x1, y, c):
        for x in range(min(x0, x1), max(x0, x1) + 1):
            self.px(x, y, c)

    # Troca cor apenas onde ja existe uma das cores dadas (ex.: sombra so na pele).
    def sobre(self, x, y, c, apenas):
        if self.get(x, y) in apenas:
            self.px(x, y, c)

    # Contorno externo: todo pixel vazio encostado (4-vizinhos) em algo pintado.
    def contornar(self, c='o'):
        novos = []
        for y in range(self.h):
            for x in range(self.w):
                if self.g[y][x] != '.':
                    continue
                if any(self.get(x + dx, y + dy) not in ('.', c)
                       for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                    novos.append((x, y))
        for x, y in novos:
            self.g[y][x] = c

    def mapa(self):
        return [''.join(l) for l in self.g]

    def js(self, nome):
        linhas = ',\n'.join("  '%s'" % l for l in self.mapa())
        return "const %s = [\n%s,\n];" % (nome, linhas)


# ---------------------------------------------------------------------------
# Retratos 64x64. Luz de cima a esquerda.
# Legenda (ver gerar.py): s/S/h pele; e/f pele clara; Z/E cabelo preto;
# K/L cabelo castanho; X barba rala; A/a/x preto (roupa); U gravata azul;
# z dourado; P labio; w/W branco.
# ---------------------------------------------------------------------------

PELE_MEDIA = ('s', 'S', 'h')
PELE_CLARA = ('e', 'f', 'h')


def cabeca(t, cy=30, pele=PELE_MEDIA, largura=16.5, queixo=11.5):
    """Cranio, maxilar, sombras, luzes e orelhas. Sem cabelo."""
    s, S, h = pele
    t.elipse(32, cy, largura, 18.5, s)
    t.elipse(32, cy + 8, largura - 2.5, queixo, s)
    for y in range(cy - 14, cy + 20):
        for x in range(40, 50):
            if t.get(x, y) == s and (x - 40) + (y - (cy + 4)) * 0.3 > 6:
                t.px(x, y, S)
    for x in range(22, 43):
        for y in range(cy + 16, cy + 20):
            if t.get(x, y) == s:
                t.px(x, y, S)
    t.elipse(26, cy - 6, 4, 3, h)
    t.elipse(25, cy + 6, 3, 2, h)
    t.elipse(15, cy + 2, 2.5, 4, s); t.px(15, cy + 2, S)
    t.elipse(49, cy + 2, 2.5, 4, S); t.px(49, cy + 2, 'o')


def pescoco(t, cy=30, pele=PELE_MEDIA):
    s, S, _ = pele
    t.rect(26, cy + 12, 12, 12, S)
    t.rect(26, cy + 12, 4, 12, s)


def olhos(t, y, cor_iris='I', sobrancelha='K', grossura=1, inclinacao=0, cilios=False):
    for lado, x in ((0, 22), (1, 36)):
        t.rect(x, y, 6, 4, 'w')
        t.rect(x + 2, y, 3, 4, cor_iris)
        t.rect(x + 3, y + 1, 1, 2, 'o')
        t.px(x + 2, y, 'W')
        t.hlinha(x, x + 5, y - 1, 'o')
        t.px(x - 1, y, 'o'); t.px(x + 6, y, 'o')
        if cilios:
            t.px(x - 1 if lado == 0 else x + 6, y - 1, 'o')
            t.px(x - 2 if lado == 0 else x + 7, y, 'o')
        for i in range(7):
            yy = y - 4 + (i * inclinacao // 6 if lado == 0 else (6 - i) * inclinacao // 6)
            for g in range(grossura):
                t.px(x - 1 + i, yy - g, sobrancelha)


def nariz(t, y, pele=PELE_MEDIA):
    S = pele[1]
    t.linha(33, y, 33, y + 6, S)
    t.hlinha(31, 34, y + 6, S)
    t.px(30, y + 5, S)
    t.px(35, y + 6, 'o')


def boca(t, y, largura=8, sorriso=True, cor='R', pele=PELE_MEDIA):
    S = pele[1]
    x0 = 32 - largura // 2
    t.hlinha(x0, x0 + largura, y, cor)
    if sorriso:
        t.px(x0 - 1, y - 1, cor); t.px(x0 + largura + 1, y - 1, cor)
        t.hlinha(x0 + 1, x0 + largura - 1, y + 1, S)
    else:
        t.hlinha(x0, x0 + largura, y + 1, S)


def sorriso_aberto(t, y, largura=12, pele=PELE_MEDIA):
    """Sorriso largo mostrando os dentes."""
    S = pele[1]
    x0 = 32 - largura // 2
    t.hlinha(x0 + 1, x0 + largura - 1, y, 'o')
    t.px(x0, y - 1, 'o'); t.px(x0 + largura, y - 1, 'o')
    t.hlinha(x0 + 1, x0 + largura - 1, y + 1, 'W')
    t.hlinha(x0 + 2, x0 + largura - 2, y + 2, 'w')
    for x in range(x0 + 3, x0 + largura - 2, 3):
        t.px(x, y + 2, 'Q')                       # separacao dos dentes
    t.hlinha(x0 + 2, x0 + largura - 2, y + 3, 'R')
    t.hlinha(x0 + 3, x0 + largura - 3, y + 4, S)


def barba_rala(t, cy=30, pele=PELE_MEDIA, cor='X', densa=False, grisalho=False):
    """Barba por fazer: pontilhado sobre a pele ao longo do maxilar e do queixo."""
    skin = set(pele)
    for y in range(cy + 9, cy + 20):
        for x in range(14, 51):
            if t.get(x, y) not in skin:
                continue
            no_maxilar = (x <= 19 and y >= cy + 12) or (x >= 45 and y >= cy + 12) or y >= cy + 16
            bigode = y == cy + 9 and 26 <= x <= 38 and x != 32
            if not (no_maxilar or bigode):
                continue
            if densa or (x * 7 + y * 3) % 4 == 0:
                c = cor
                if grisalho and (x * 3 + y) % 5 == 0:
                    c = 'g'
                t.px(x, y, c)


def retrato_pedro():
    t = Tela(64, 64)
    # sueter preto de gola careca
    t.elipse(32, 72, 38, 20, 'A')
    t.rect(0, 62, 64, 2, 'A')
    t.elipse(32, 56, 14, 5, 'a')
    pescoco(t)
    t.elipse(32, 55, 11, 3, 'S')
    t.rect(9, 61, 6, 3, 'x'); t.rect(49, 61, 6, 3, 'x')
    cabeca(t)
    olhos(t, 31, cor_iris='Z', sobrancelha='Z', grossura=2, inclinacao=1)
    nariz(t, 33)
    sorriso_aberto(t, 41, largura=12)
    barba_rala(t)
    t.px(20, 37, 'B'); t.px(21, 37, 'B'); t.px(43, 37, 'B'); t.px(44, 37, 'B')
    # cabelo preto volumoso, topete alto puxado para o lado
    t.elipse(32, 12, 19, 12, 'Z')
    t.elipse(38, 6, 13, 8, 'Z')
    t.elipse(23, 9, 10, 7, 'Z')
    t.rect(13, 14, 38, 8, 'Z')
    t.rect(14, 20, 4, 10, 'Z'); t.rect(46, 20, 4, 9, 'Z')      # costeletas
    for x, w in ((16, 4), (23, 5), (31, 4), (39, 5), (46, 3)):  # franja irregular
        t.rect(x, 22, w, 2, 'Z')
    for x, y, w in ((22, 5, 4), (29, 2, 5), (36, 1, 4), (43, 4, 3), (18, 10, 3)):  # ondas com luz
        t.rect(x, y, w, 2, 'E')
    t.contornar()
    return t


def retrato_victor():
    t = Tela(64, 64)
    pele = PELE_CLARA
    # terno preto, camisa branca, gravata azul de bolinhas
    t.elipse(32, 72, 40, 22, 'A')
    t.rect(0, 62, 64, 2, 'A')
    for y in range(50, 64):
        meia = max(0, 9 - (y - 50) // 2)
        t.hlinha(32 - meia, 32 + meia, y, 'w')
    t.rect(30, 55, 4, 9, 'U'); t.rect(29, 53, 6, 3, 'U')
    t.px(31, 58, 'W'); t.px(32, 61, 'W'); t.px(30, 63, 'W')
    t.linha(21, 51, 25, 63, 'a'); t.linha(43, 51, 39, 63, 'a')
    pescoco(t, pele=pele)
    t.hlinha(27, 37, 51, 'w'); t.hlinha(26, 38, 52, 'w')
    cabeca(t, pele=pele, largura=16, queixo=12)
    olhos(t, 31, cor_iris='K', sobrancelha='Z', grossura=2, inclinacao=-1)
    t.hlinha(20, 24, 36, 'f'); t.hlinha(40, 44, 36, 'f')
    t.hlinha(29, 35, 24, 'f')
    nariz(t, 33, pele=pele)
    boca(t, 43, largura=6, sorriso=False, pele=pele)
    # cavanhaque grisalho: bigode e queixo mais densos
    # bigode fino, continuo, e queixo cheio com alguns fios grisalhos
    for x in range(27, 38):
        t.sobre(x, 40, 'g' if x in (29, 35) else 'Z', pele)
    t.sobre(26, 41, 'Z', pele); t.sobre(38, 41, 'Z', pele)
    for y in range(45, 50):
        meia = 5 - (y - 45) // 2
        for x in range(32 - meia, 33 + meia):
            t.sobre(x, y, 'g' if (x * 3 + y) % 7 == 0 else 'Z', pele)
    # cabelo raspado com entradas: faixa curta, temporas abertas
    t.elipse(32, 12, 16, 7, 'Z')
    t.rect(16, 12, 32, 6, 'Z')
    t.rect(15, 17, 4, 9, 'Z'); t.rect(45, 17, 4, 9, 'Z')
    t.elipse(21, 18, 6, 4, pele[0]); t.elipse(43, 18, 6, 4, pele[0])
    t.hlinha(26, 38, 17, 'Z')
    t.contornar()
    return t


def retrato_sabrina():
    t = Tela(64, 64)
    # cabelo comprido atras, desce alem do quadro
    t.elipse(32, 16, 21, 15, 'K')
    t.rect(11, 16, 42, 48, 'K')
    # ombros a mostra e top preto de alcinha com estampa
    t.elipse(32, 74, 36, 18, 's')
    t.rect(0, 62, 64, 2, 's')
    t.elipse(32, 78, 21, 18, 'A')
    t.linha(25, 53, 22, 63, 'A'); t.linha(39, 53, 42, 63, 'A')
    for i, c in enumerate(('r', 'Y', 'v', 'U', 'Y', 'r', 'v')):
        t.rect(21 + i * 3, 61 + (i % 2), 2, 2, c)
    pescoco(t)
    # colar de conchas com estrela-do-mar
    for x in range(22, 43):
        y = 50 + int(((x - 32) / 10.0) ** 2 * 4)
        t.px(x, y, 'w' if x % 2 == 0 else 'Q')
    t.px(32, 55, 'z'); t.px(31, 56, 'z'); t.px(33, 56, 'z'); t.px(32, 57, 'z'); t.px(30, 57, 'z'); t.px(34, 57, 'z')
    cabeca(t, largura=15.5, queixo=11)
    olhos(t, 31, cor_iris='K', sobrancelha='Z', grossura=2, inclinacao=0, cilios=True)
    nariz(t, 33)
    boca(t, 42, largura=7, sorriso=True, cor='P')
    t.hlinha(30, 34, 43, 'P')
    t.px(20, 37, 'B'); t.px(21, 37, 'B'); t.px(43, 37, 'B'); t.px(44, 37, 'B')
    # cabelo da frente: risca do lado esquerdo, mecha atravessando para a direita
    t.elipse(32, 13, 19, 9, 'K')
    t.rect(13, 13, 38, 7, 'K')
    for i in range(24):
        t.rect(20 + i, 18 + i // 3, 4, 3, 'K')           # mecha cruzando a testa
    t.rect(12, 18, 7, 46, 'K'); t.rect(45, 18, 8, 46, 'K')   # laterais por cima das orelhas
    t.linha(17, 26, 15, 60, 'L'); t.linha(48, 24, 50, 60, 'L'); t.hlinha(24, 34, 10, 'L')
    t.px(19, 34, 'z'); t.px(45, 34, 'z')                    # brincos
    t.contornar()
    return t


# ---------------------------------------------------------------------------
# Personagens de corpo inteiro 24x48, vista frontal.
# ---------------------------------------------------------------------------

SOMBRA_ROUPA = {'c': 'C', 'N': 'n', 'b': 'C', 'A': 'x', 'v': 'V', 'w': 'Q', 'Y': 'y'}


def corpo_base(t, roupa, calca, sapato, cabelo_fn, pele=PELE_MEDIA, barba=None):
    s, S, _ = pele
    t.elipse(12, 10, 6.5, 7, s)
    t.rect(6, 12, 13, 4, s)
    for y in range(4, 18):
        if t.get(17, y) == s: t.px(17, y, S)
        if t.get(18, y) == s: t.px(18, y, S)
    t.px(5, 11, s); t.px(19, 11, S)
    t.rect(9, 10, 2, 2, 'w'); t.rect(14, 10, 2, 2, 'w')
    t.px(10, 10, 'o'); t.px(15, 10, 'o')
    t.hlinha(11, 13, 14, 'R')
    if barba:
        for x in range(7, 18):
            if (x + 15) % 2 == 0: t.sobre(x, 15, barba, pele)
        t.sobre(7, 13, barba, pele); t.sobre(17, 13, barba, pele)
        t.sobre(8, 14, barba, pele); t.sobre(16, 14, barba, pele)
    cabelo_fn(t)
    t.rect(10, 17, 5, 2, S)
    t.rect(6, 19, 13, 14, roupa)
    t.rect(4, 20, 3, 11, roupa); t.rect(18, 20, 3, 11, roupa)
    t.rect(4, 31, 3, 3, s); t.rect(18, 31, 3, 3, S)
    t.rect(17, 19, 2, 14, SOMBRA_ROUPA.get(roupa, roupa))
    t.rect(7, 33, 5, 11, calca); t.rect(13, 33, 5, 11, calca)
    t.rect(11, 33, 1, 8, {'d': 'D', 'N': 'n', 'A': 'x'}.get(calca, calca))
    t.rect(6, 44, 6, 3, sapato); t.rect(13, 44, 6, 3, sapato)
    t.hlinha(6, 11, 44, 'u'); t.hlinha(13, 18, 44, 'u')


def cabelo_pedro(t):
    """Topete preto volumoso, mais alto no meio/direita."""
    t.elipse(12, 5, 7.5, 5, 'Z')
    t.elipse(14, 3, 5, 3.5, 'Z')
    t.rect(5, 5, 15, 4, 'Z')
    t.rect(5, 8, 2, 5, 'Z'); t.rect(18, 8, 2, 4, 'Z')
    for x, h in ((7, 2), (10, 3), (13, 2), (16, 3)):
        t.rect(x, 9, 2, h, 'Z')
    t.hlinha(9, 13, 2, 'E'); t.px(15, 1, 'E')


def cabelo_victor(t):
    """Raspado, curto, com entradas."""
    t.elipse(12, 6, 6, 3.5, 'Z')
    t.rect(7, 6, 11, 2, 'Z')
    t.rect(5, 7, 2, 5, 'Z'); t.rect(18, 7, 2, 5, 'Z')
    t.px(8, 8, 'e'); t.px(16, 8, 'e')                 # entradas


def pedro_em_pe():
    t = Tela(24, 48)
    corpo_base(t, 'A', 'd', 't', cabelo_pedro)
    t.rect(10, 19, 5, 1, 'a')                          # gola careca
    t.contornar()
    return t


def victor_em_pe():
    t = Tela(24, 48)
    corpo_base(t, 'A', 'A', 't', cabelo_victor, pele=PELE_CLARA)
    t.hlinha(10, 14, 13, 'Z'); t.rect(11, 15, 3, 1, 'Z')   # bigode e cavanhaque
    for y in range(19, 30):
        meia = max(0, 3 - (y - 19) // 3)
        t.hlinha(12 - meia, 12 + meia, y, 'w')
    t.rect(12, 21, 1, 9, 'U'); t.rect(11, 21, 3, 2, 'U')
    t.contornar()
    return t


def pedro_dormindo():
    t = Tela(20, 18)
    t.elipse(10, 9, 7.5, 7, 's')
    for y in range(3, 16):
        for x in range(14, 18):
            if t.get(x, y) == 's': t.px(x, y, 'S')
    t.elipse(9, 5, 8, 4.5, 'Z'); t.rect(2, 4, 12, 5, 'Z')
    t.rect(1, 8, 3, 5, 'Z')
    t.hlinha(4, 9, 3, 'E')
    t.hlinha(11, 14, 10, 'o')
    t.px(15, 12, 'S'); t.px(16, 12, 'S')
    t.hlinha(12, 14, 14, 'R')
    t.contornar()
    return t


def pedro_sentado():
    """Sentado no chao, abracando os joelhos, cabeca baixa. 40x52"""
    t = Tela(40, 52)
    t.elipse(26, 36, 9, 10, 'd')
    t.rect(20, 36, 14, 12, 'd')
    t.rect(30, 30, 5, 18, 'D')
    t.rect(24, 46, 12, 5, 't'); t.hlinha(24, 35, 46, 'u')
    t.elipse(16, 34, 11, 13, 'A')
    t.rect(6, 30, 18, 18, 'A')
    t.rect(20, 26, 5, 20, 'x')
    t.rect(6, 44, 20, 4, 'x')
    t.elipse(24, 32, 8, 4, 'A'); t.rect(18, 29, 14, 6, 'A')
    t.rect(30, 31, 4, 4, 's')
    t.hlinha(18, 31, 34, 'x')
    t.hlinha(8, 22, 27, 'a')                           # gola
    t.elipse(19, 17, 9, 9, 's')
    for y in range(9, 27):
        for x in range(24, 29):
            if t.get(x, y) == 's': t.px(x, y, 'S')
    t.hlinha(22, 25, 20, 'o')
    t.px(27, 21, 'S'); t.px(27, 22, 'S')
    t.elipse(17, 11, 10, 7, 'Z')
    t.elipse(20, 8, 7, 5, 'Z')
    t.rect(8, 10, 18, 6, 'Z')
    t.rect(8, 14, 4, 8, 'Z')
    for x, h in ((13, 3), (17, 5), (21, 4), (25, 3)):
        t.rect(x, 16, 3, h, 'Z')
    t.hlinha(11, 19, 7, 'E')
    t.contornar()
    return t


def pedro_na_cama():
    """Pedro deitado de lado, coberto ate o peito, braco por cima do cobertor. 128x48."""
    t = Tela(128, 48)
    t.elipse(62, 22, 20, 9, 'r')
    t.elipse(96, 24, 15, 7, 'r')
    t.rect(36, 20, 90, 24, 'r')
    for x in range(36, 126):
        for y in range(20, 26):
            if t.get(x, y - 1) == '.' and t.get(x, y) == 'r':
                t.px(x, y, 'p')
    t.hlinha(37, 125, 43, 'q'); t.hlinha(37, 125, 42, 'q')
    for x0, y0 in ((70, 30), (84, 36), (104, 32), (52, 38)):
        t.linha(x0, y0, x0 + 8, y0 + 3, 'q')
    t.hlinha(44, 80, 31, 'q'); t.hlinha(82, 110, 32, 'q')
    t.elipse(22, 24, 10, 9, 's')
    for y in range(15, 34):
        for x in range(27, 33):
            if t.get(x, y) == 's': t.px(x, y, 'S')
    t.elipse(19, 30, 3, 2, 'h')
    t.px(30, 25, 'S'); t.px(31, 26, 'S')
    t.hlinha(24, 28, 24, 'o')
    t.px(29, 23, 'o')
    t.hlinha(26, 28, 29, 'R')
    t.px(21, 27, 'B'); t.px(22, 27, 'B')
    t.elipse(13, 26, 2, 3, 'S'); t.px(13, 26, 'o')
    t.elipse(19, 17, 12, 8, 'Z')
    t.elipse(14, 13, 8, 6, 'Z')
    t.rect(8, 18, 16, 6, 'Z')
    t.rect(8, 22, 5, 9, 'Z')
    for x, h in ((14, 3), (18, 5), (22, 4), (26, 3)):
        t.rect(x, 22, 3, h, 'Z')
    t.hlinha(12, 22, 12, 'E'); t.hlinha(10, 18, 15, 'E')
    t.elipse(38, 26, 8, 6, 'A')
    t.rect(38, 22, 20, 9, 'A')
    t.elipse(58, 27, 5, 5, 'A')
    t.rect(46, 28, 12, 3, 'x')
    t.elipse(63, 28, 4, 3, 's'); t.px(66, 29, 'S')
    t.rect(34, 30, 6, 6, 'A')
    t.hlinha(38, 44, 22, 'a')
    t.contornar()
    return t


def pedro_banho(quadro=0):
    """Pedro no chuveiro: sem camisa, bermuda, chinelo, cabelo molhado. 24x48."""
    t = Tela(24, 48)
    frio = quadro == 3
    t.elipse(12, 10, 6.5, 7, 's')
    t.rect(6, 12, 13, 4, 's')
    for y in range(4, 18):
        if t.get(17, y) == 's': t.px(17, y, 'S')
        if t.get(18, y) == 's': t.px(18, y, 'S')
    t.px(5, 11, 's'); t.px(19, 11, 'S')
    if frio:
        t.hlinha(9, 10, 10, 'o'); t.hlinha(14, 15, 10, 'o')
        t.rect(10, 13, 5, 2, 'o'); t.hlinha(10, 14, 14, 'w')
    else:
        t.rect(9, 10, 2, 2, 'w'); t.rect(14, 10, 2, 2, 'w')
        t.px(10, 10, 'o'); t.px(15, 10, 'o')
        t.hlinha(11, 13, 14, 'R')
    t.elipse(12, 6, 7, 4.5, 'Z')
    t.rect(5, 5, 15, 3, 'Z')
    t.rect(6, 8, 3, 3, 'Z'); t.rect(16, 8, 3, 2, 'Z'); t.rect(11, 8, 2, 2, 'Z')
    t.hlinha(7, 11, 3, 'E')
    t.px(4, 9, 'W'); t.px(19, 7, 'W')
    t.rect(10, 17, 5, 2, 'S')
    t.rect(6, 19, 13, 13, 's')
    t.rect(17, 19, 2, 13, 'S')
    t.px(12, 27, 'S')
    t.hlinha(8, 11, 22, 'S'); t.hlinha(13, 16, 22, 'S')
    if frio:
        t.rect(5, 20, 3, 6, 's'); t.rect(17, 20, 3, 6, 'S')
        t.rect(6, 24, 13, 4, 's'); t.rect(6, 24, 13, 1, 'S')
        t.rect(6, 26, 3, 3, 'S'); t.rect(16, 25, 3, 3, 'S')
    else:
        t.rect(4, 20, 3, 11, 's'); t.rect(18, 20, 3, 11, 'S')
        t.rect(4, 31, 3, 3, 's'); t.rect(18, 31, 3, 3, 'S')
    t.rect(6, 32, 13, 7, 'd')
    t.rect(6, 32, 13, 1, 'D'); t.rect(17, 32, 2, 7, 'D')
    t.px(12, 33, 'D'); t.px(12, 34, 'D')
    if quadro == 1:
        pernas = ((6, 39, 5, 6), (14, 38, 5, 7))
    elif quadro == 2:
        pernas = ((7, 38, 5, 7), (13, 39, 5, 6))
    else:
        pernas = ((7, 39, 5, 6), (13, 39, 5, 6))
    for i, (x, y, w, h) in enumerate(pernas):
        t.rect(x, y, w, h, 's' if i == 0 else 'S')
        t.rect(x, y + h, w + 1, 2, 'q')
        t.hlinha(x, x + w, y + h, 'p')
    t.contornar()
    return t


def digitando_grande(cabelo, roupa, quadro=0, fone=False):
    """Pessoa sentada de costas numa cadeira de escritorio, digitando. 40x44."""
    t = Tela(40, 44)
    sombra_roupa = SOMBRA_ROUPA.get(roupa, roupa)
    t.rect(9, 18, 22, 22, 'J'); t.rect(10, 19, 20, 20, 'M')
    t.rect(11, 20, 3, 18, 'J')
    t.rect(10, 16, 20, 20, roupa)
    t.rect(27, 16, 3, 20, sombra_roupa)
    t.rect(10, 34, 20, 2, sombra_roupa)
    if roupa == 'A':
        t.hlinha(14, 26, 16, 'a')                   # gola do sueter
    if quadro == 0:
        t.rect(4, 22, 6, 12, roupa); t.rect(30, 23, 6, 11, roupa)
        t.rect(4, 34, 6, 4, 's'); t.rect(30, 34, 6, 4, 'S')
    else:
        t.rect(4, 23, 6, 11, roupa); t.rect(30, 22, 6, 12, roupa)
        t.rect(4, 34, 6, 4, 'S'); t.rect(30, 34, 6, 4, 's')
    t.rect(8, 24, 2, 8, sombra_roupa); t.rect(30, 24, 2, 8, sombra_roupa)
    t.rect(16, 12, 8, 5, 'S')
    t.elipse(20, 8, 9, 8, cabelo[0])
    t.rect(11, 6, 18, 7, cabelo[0])
    if cabelo[0] == 'Z':
        t.elipse(21, 4, 7, 4, 'Z')                   # topete visto de tras
    t.elipse(17, 4, 5, 2, cabelo[1])
    t.px(10, 9, 's'); t.px(11, 10, 's'); t.px(29, 9, 'S'); t.px(28, 10, 'S')
    if fone:
        t.hlinha(11, 29, 2, 'A'); t.hlinha(11, 29, 3, 'a')
        t.rect(9, 6, 4, 7, 'A'); t.rect(27, 6, 4, 7, 'A')
        t.rect(10, 7, 2, 5, 'a'); t.rect(28, 7, 2, 5, 'a')
    t.contornar()
    return t


def pedro_digitando_g(quadro=0):
    return digitando_grande(('Z', 'E'), 'A', quadro)


def colega_digitando_g(quadro=0):
    return digitando_grande(('K', 'L'), 'v', quadro, fone=True)


def professor():
    """Professor na frente do quadro: oculos, camisa azul, marcador na mao. 24x48."""
    t = Tela(24, 48)

    def cabelo(t):
        t.elipse(12, 6, 6.5, 3.5, 'G'); t.rect(6, 6, 13, 3, 'G')
        t.rect(5, 8, 2, 4, 'G'); t.rect(18, 8, 2, 4, 'G')
    corpo_base(t, 'U', 'A', 't', cabelo, pele=PELE_CLARA)
    t.hlinha(7, 17, 10, 'o'); t.rect(8, 9, 3, 3, 'W'); t.rect(13, 9, 3, 3, 'W')   # oculos
    t.px(9, 10, 'o'); t.px(14, 10, 'o')
    t.rect(10, 19, 5, 2, 'w')                                                       # gola
    t.rect(1, 22, 3, 3, 'r')                                                        # marcador
    t.contornar()
    return t


def recepcionista():
    """Recepcionista atras do balcao, busto de frente com coque. 24x30."""
    t = Tela(24, 30)
    t.rect(4, 19, 16, 11, 'N')
    t.rect(18, 19, 2, 11, 'n')
    t.rect(10, 19, 4, 11, 'w')
    t.rect(10, 15, 5, 4, 'S')
    t.elipse(12, 9, 6.5, 7, 's'); t.rect(6, 11, 13, 4, 's')
    for y in range(3, 17):
        if t.get(17, y) == 's': t.px(17, y, 'S')
    t.rect(9, 9, 2, 2, 'w'); t.rect(14, 9, 2, 2, 'w'); t.px(10, 9, 'o'); t.px(15, 9, 'o')
    t.hlinha(11, 13, 13, 'P')
    t.elipse(12, 5, 7, 4, 'K'); t.rect(5, 5, 15, 3, 'K')
    t.elipse(12, 1, 4, 2.5, 'K')                                                   # coque
    t.px(6, 10, 'z'); t.px(18, 10, 'z')                                            # brincos
    t.contornar()
    return t


def pedro_no_banco():
    """Sentado num banco, celular na mao com a tela acesa. Vista de lado. 36x48."""
    t = Tela(36, 48)
    t.rect(14, 30, 12, 8, 'd'); t.rect(22, 30, 6, 14, 'D')
    t.rect(20, 44, 10, 3, 't'); t.hlinha(20, 29, 44, 'u')
    t.rect(8, 16, 16, 16, 'A'); t.rect(20, 16, 4, 16, 'x')
    t.hlinha(12, 22, 16, 'a')
    t.rect(20, 20, 4, 8, 'A'); t.rect(24, 20, 6, 4, 'A')
    t.rect(29, 16, 4, 6, 's')
    t.rect(30, 8, 5, 10, 'a'); t.rect(31, 9, 3, 7, 'W')
    t.elipse(16, 9, 7, 7, 's')
    for y in range(3, 16):
        if t.get(21, y) == 's': t.px(21, y, 'S')
        if t.get(22, y) == 's': t.px(22, y, 'S')
    t.px(20, 9, 'o'); t.px(20, 10, 'o')
    t.hlinha(20, 22, 13, 'R')
    t.elipse(15, 5, 8, 5, 'Z'); t.elipse(17, 2, 6, 3, 'Z'); t.rect(8, 4, 12, 5, 'Z'); t.rect(8, 8, 4, 6, 'Z')
    t.hlinha(10, 16, 1, 'E')
    t.contornar()
    return t


def pedro_adulto():
    """Pedro dez anos depois: barba cheia, camisa social clara, calca escura. 24x48."""
    t = Tela(24, 48)
    corpo_base(t, 'w', 'A', 't', cabelo_pedro)
    t.rect(7, 13, 11, 4, 'Z'); t.hlinha(11, 13, 14, 'R')       # barba cheia
    t.rect(11, 19, 3, 10, 'Q'); t.px(12, 21, 'A'); t.px(12, 25, 'A')
    t.contornar()
    return t


def sabrina():
    """Sabrina: cabelo comprido liso, top preto estampado, calca jeans. 24x48."""
    t = Tela(24, 48)
    t.rect(4, 6, 16, 24, 'K')                                    # cabelo atras
    t.elipse(12, 10, 6, 7, 's'); t.rect(7, 12, 11, 4, 's')
    for y in range(4, 18):
        if t.get(17, y) == 's': t.px(17, y, 'S')
    t.rect(9, 10, 2, 2, 'w'); t.rect(14, 10, 2, 2, 'w'); t.px(10, 10, 'o'); t.px(15, 10, 'o')
    t.hlinha(8, 10, 8, 'Z'); t.hlinha(14, 16, 8, 'Z')             # sobrancelhas marcadas
    t.hlinha(11, 13, 14, 'P'); t.px(9, 12, 'B'); t.px(15, 12, 'B')
    t.elipse(12, 6, 6.5, 4, 'K'); t.rect(6, 5, 13, 3, 'K')
    t.linha(8, 7, 16, 10, 'K')                                    # mecha lateral
    t.hlinha(9, 13, 3, 'L')
    t.rect(10, 17, 5, 2, 'S')
    t.hlinha(9, 15, 18, 'w'); t.px(12, 19, 'z')                   # colar e estrela
    t.rect(7, 20, 11, 11, 'A'); t.rect(16, 20, 2, 11, 'x')
    for i, c in enumerate(('r', 'Y', 'v', 'U')):
        t.rect(8 + i * 2, 24 + (i % 2), 2, 2, c)
    t.rect(4, 20, 3, 10, 's'); t.rect(18, 20, 3, 10, 'S')
    t.rect(4, 30, 3, 3, 's'); t.rect(18, 30, 3, 3, 'S')
    t.rect(7, 31, 5, 13, 'd'); t.rect(13, 31, 5, 13, 'd'); t.rect(11, 31, 1, 9, 'D')
    t.rect(7, 44, 5, 3, 'Q'); t.rect(13, 44, 5, 3, 'Q')
    t.contornar()
    return t


def cachorro(cor, quadro=0):
    """Cachorro de lado, olhando para a direita. 24x16."""
    t = Tela(24, 16)
    base, luz = cor
    t.elipse(11, 8, 7, 4, base)
    t.rect(6, 5, 11, 7, base)
    t.elipse(18, 6, 4, 3.5, base)
    t.rect(19, 7, 4, 3, base)
    t.px(23, 8, 'o'); t.px(21, 5, 'o')
    t.rect(15, 2, 3, 4, luz)
    t.hlinha(8, 14, 5, luz)
    if quadro == 0:
        t.linha(4, 6, 1, 2, base); t.px(1, 1, luz)
    else:
        t.linha(4, 6, 1, 5, base); t.px(0, 5, luz)
    if quadro == 0:
        t.rect(7, 11, 2, 4, base); t.rect(10, 12, 2, 3, base); t.rect(14, 11, 2, 4, base); t.rect(17, 12, 2, 3, base)
    else:
        t.rect(7, 12, 2, 3, base); t.rect(10, 11, 2, 4, base); t.rect(14, 12, 2, 3, base); t.rect(17, 11, 2, 4, base)
    t.contornar()
    return t


def casal_beijo():
    """Pedro e Sabrina de perfil, rostos encostados; coracao em cima. 44x50."""
    t = Tela(44, 50)
    # ---- ela (direita, olhando para a esquerda) ----
    t.rect(24, 30, 12, 16, 'A'); t.rect(23, 40, 14, 6, 'A'); t.rect(33, 30, 3, 16, 'x')
    for i, c in enumerate(('r', 'Y', 'v', 'U')):
        t.rect(25 + i * 2, 33 + (i % 2), 2, 2, c)
    t.rect(25, 46, 4, 3, 'Q'); t.rect(30, 46, 4, 3, 'Q')
    t.rect(26, 23, 8, 8, 'A'); t.rect(26, 19, 6, 5, 'S')
    t.rect(24, 10, 14, 22, 'K')
    t.elipse(24, 13, 6, 6, 's')
    t.px(21, 12, 'o'); t.px(19, 15, 'P')
    t.elipse(27, 8, 7, 4, 'K'); t.hlinha(24, 30, 5, 'L')
    t.rect(19, 27, 6, 7, 's')
    # ---- Pedro (esquerda, olhando para a direita) ----
    t.rect(6, 46, 5, 3, 't'); t.rect(12, 46, 5, 3, 't')
    t.rect(6, 30, 12, 16, 'A'); t.rect(11, 30, 1, 12, 'x')
    t.rect(4, 18, 14, 13, 'w'); t.rect(15, 18, 3, 13, 'Q')
    t.rect(14, 23, 10, 6, 'w'); t.rect(22, 26, 5, 5, 's')
    t.rect(8, 15, 6, 4, 'S')
    t.elipse(12, 11, 6, 6, 's')
    t.rect(14, 13, 5, 4, 'Z'); t.px(17, 11, 'o'); t.px(18, 14, 'R')
    t.elipse(10, 7, 7, 4, 'Z'); t.elipse(12, 4, 5, 3, 'Z'); t.rect(4, 6, 11, 5, 'Z'); t.rect(4, 9, 3, 6, 'Z')
    t.hlinha(6, 11, 3, 'E')
    for x, y in ((16, 0), (20, 0)):
        t.rect(x, y, 3, 2, 'r')
    t.rect(15, 2, 9, 2, 'r'); t.rect(16, 4, 7, 1, 'r'); t.rect(17, 5, 5, 1, 'r'); t.rect(18, 6, 3, 1, 'r'); t.px(19, 7, 'r')
    t.px(17, 1, 'p')
    t.contornar()
    return t


def onibus_lateral():
    """Onibus visto de lado, indo para a esquerda, 72x30. Para a chegada na Fase 7."""
    t = Tela(72, 30)
    t.rect(2, 4, 68, 20, 'Y')
    t.rect(2, 4, 68, 3, 'p')
    t.rect(2, 18, 68, 6, 'y')
    for i in range(5):
        t.rect(8 + i * 12, 8, 9, 8, 'G'); t.rect(9 + i * 12, 9, 7, 6, 'w')
    t.rect(1, 6, 4, 12, 'G'); t.rect(2, 7, 2, 10, 'w')            # para-brisa
    t.rect(60, 9, 8, 14, 'x')                                       # porta
    t.rect(61, 10, 6, 6, 'G')
    t.rect(0, 20, 3, 3, 'W')                                        # farol
    t.rect(69, 20, 3, 3, 'r')                                       # lanterna
    t.rect(6, 22, 12, 7, 't'); t.rect(52, 22, 12, 7, 't')
    t.rect(9, 24, 6, 3, 'u'); t.rect(55, 24, 6, 3, 'u')
    t.contornar()
    return t


if __name__ == '__main__':
    import sys
    if '--ver' in sys.argv:
        for nome in sys.argv[sys.argv.index('--ver') + 1:]:
            print(nome)
            print('\n'.join(eval(nome)().mapa()))
