#!/usr/bin/env python3
"""CEL — parametric 45°-cut display typeface for the CELESNICA site.

Glyphs are built from the same construction as the CELESNICA wordmark
(8-unit cap height, 1.7 stroke, 45° chamfers, inner chamfers that keep the
diagonal band at full stroke weight). Pieces are unioned by rasterising at
high resolution and tracing the outline, so the exported font has clean,
overlap-free contours (text-stroke / outline styles stay clean).

usage: python3 celfont.py <outdir>
"""
import math, sys, os, json
import numpy as np
import cv2
from PIL import Image, ImageDraw
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.feaLib.builder import addOpenTypeFeaturesFromString

R2 = math.sqrt(2)
T225 = math.tan(math.radians(22.5))


class G:
    def __init__(self, W, P):
        self.W = W; self.P = P
        self.H = P['H']; self.S = P['S']; self.c = P['c']
        self.h = self.S / 2
        self.ci = max(0.0, self.c + self.S * R2 - 2 * self.S)
        self.ops = []
        self.box = [0.0, 0.0, W, self.H]
        self.m0 = self.H / 2 - self.S / 2
        self.m1 = self.H / 2 + self.S / 2

    # --- primitives -------------------------------------------------------
    def add(self, pts):
        self.ops.append(('add', [tuple(map(float, p)) for p in pts])); return self

    def erase(self, pts):
        self.ops.append(('erase', [tuple(map(float, p)) for p in pts])); return self

    def rect(self, x0, y0, x1, y1):
        return self.add([(x0, y0), (x1, y0), (x1, y1), (x0, y1)])

    def erect(self, x0, y0, x1, y1):
        return self.erase([(x0, y0), (x1, y0), (x1, y1), (x0, y1)])

    def cut(self, kind, X, Y, c=None, m=0.06):
        """erase the 45° corner triangle with legs c at corner (X, Y)"""
        c = self.c if c is None else c
        if kind == 'TL': t = [(X - m, Y + c + m), (X - m, Y - m), (X + c + m, Y - m)]
        elif kind == 'TR': t = [(X - c - m, Y - m), (X + m, Y - m), (X + m, Y + c + m)]
        elif kind == 'BL': t = [(X - m, Y - c - m), (X - m, Y + m), (X + c + m, Y + m)]
        else: t = [(X + m, Y - c - m), (X + m, Y + m), (X - c - m, Y + m)]
        return self.erase(t)

    def fillc(self, kind, X, Y, ci=None):
        """fill the inner corner of a counter so a chamfered corner keeps full weight"""
        ci = self.ci if ci is None else ci
        if ci <= 0: return self
        if kind == 'TL': t = [(X, Y), (X + ci, Y), (X, Y + ci)]
        elif kind == 'TR': t = [(X, Y), (X - ci, Y), (X, Y + ci)]
        elif kind == 'BL': t = [(X, Y), (X + ci, Y), (X, Y - ci)]
        else: t = [(X, Y), (X - ci, Y), (X, Y - ci)]
        return self.add(t)

    def corner(self, kind, X, Y, IX, IY):
        self.cut(kind, X, Y); self.fillc(kind, IX, IY); return self

    def stroke(self, pts, S=None, e0=0.0, e1=0.0):
        """mitred polyline of width S (union of extended segment bands)"""
        S = self.S if S is None else S
        h = S / 2; n = len(pts)
        dirs = []
        for i in range(n - 1):
            dx, dy = pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]
            L = math.hypot(dx, dy); dirs.append((dx / L, dy / L))
        def ext(i):  # mitre extension at joint i (between seg i-1 and seg i)
            a, b = dirs[i - 1], dirs[i]
            d = max(-1.0, min(1.0, a[0] * b[0] + a[1] * b[1]))
            th = math.acos(d)
            return h * math.tan(th / 2)
        for i in range(n - 1):
            (x0, y0), (x1, y1) = pts[i], pts[i + 1]
            ux, uy = dirs[i]; nx, ny = -uy, ux
            a0 = e0 if i == 0 else ext(i)
            a1 = e1 if i == n - 2 else ext(i + 1)
            ax, ay = x0 - ux * a0, y0 - uy * a0
            bx, by = x1 + ux * a1, y1 + uy * a1
            self.add([(ax + nx * h, ay + ny * h), (bx + nx * h, by + ny * h),
                      (bx - nx * h, by - ny * h), (ax - nx * h, ay - ny * h)])
        return self

    def mirror(self):
        """mirror horizontally inside [0, W]"""
        W = self.W
        self.ops = [(op, [(W - x, y) for x, y in pts][::-1]) for op, pts in self.ops]
        x0, y0, x1, y1 = self.box
        self.box = [W - x1, y0, W - x0, y1]
        return self

    def rot180(self):
        W, H = self.W, self.H
        self.ops = [(op, [(W - x, H - y) for x, y in pts]) for op, pts in self.ops]
        x0, y0, x1, y1 = self.box
        self.box = [W - x1, H - y1, W - x0, H - y0]
        return self


def WW(P, base, minc=0.95):
    return max(base * P['wf'], 2 * P['S'] + minc)


# ---------------------------------------------------------------------------
# glyph definitions — y grows downward, cap height H, baseline at y = H
# ---------------------------------------------------------------------------
GL = {}

def glyph(chars, name=None):
    def deco(fn):
        GL[name or fn.__name__[2:]] = (chars, fn)
        return fn
    return deco


@glyph('A')
def g_A(P):
    g = G(WW(P, 6.0), P); S, H, W = g.S, g.H, g.W
    a0 = H * 0.51875 - S / 2
    g.rect(0, 0, S, H).rect(W - S, 0, W, H).rect(0, 0, W, S).rect(0, a0, W, a0 + S)
    g.corner('TL', 0, 0, S, S).corner('TR', W, 0, W - S, S)
    return g

@glyph('B')
def g_B(P):
    g = G(WW(P, 6.0), P); S, H, W = g.S, g.H, g.W
    st = 0.45 * min(1.0, W / 6.0)
    W1 = W - st; m0, m1 = g.m0, g.m1
    g.rect(0, 0, S, H).rect(0, 0, W1, S).rect(W1 - S, 0, W1, m1).rect(0, m0, W, m1)
    g.rect(W - S, m0, W, H).rect(0, H - S, W, H)
    g.corner('TR', W1, 0, W1 - S, S).corner('BR', W, H, W - S, H - S)
    g.erase([(W1, m0), (W + 2, m0), (W + 2, m0 + W + 2 - W1)])
    return g

@glyph('C')
def g_C(P):
    g = G(WW(P, 6.0), P); S, H, W = g.S, g.H, g.W
    g.rect(0, 0, S, H).rect(0, 0, W, S).rect(0, H - S, W, H)
    g.corner('TL', 0, 0, S, S).corner('BL', 0, H, S, H - S)
    return g

@glyph('D')
def g_D(P):
    g = G(WW(P, 6.0), P); S, H, W = g.S, g.H, g.W
    g.rect(0, 0, S, H).rect(0, 0, W, S).rect(0, H - S, W, H).rect(W - S, 0, W, H)
    g.corner('TR', W, 0, W - S, S).corner('BR', W, H, W - S, H - S)
    return g

@glyph('E')
def g_E(P):
    g = G(WW(P, 5.6), P); S, H, W = g.S, g.H, g.W
    g.rect(0, 0, S, H).rect(0, 0, W, S).rect(0, g.m0, W * 0.875, g.m1).rect(0, H - S, W, H)
    g.cut('TL', 0, 0)
    return g

@glyph('F')
def g_F(P):
    g = G(WW(P, 5.4), P); S, H, W = g.S, g.H, g.W
    g.rect(0, 0, S, H).rect(0, 0, W, S).rect(0, g.m0, W * 0.86, g.m1)
    g.cut('TL', 0, 0)
    return g

@glyph('G')
def g_G(P):
    g = G(WW(P, 6.0), P); S, H, W = g.S, g.H, g.W
    y0 = H * 0.5 - S * 0.35
    g.rect(0, 0, S, H).rect(0, 0, W, S).rect(0, H - S, W, H)
    g.rect(W - S, y0, W, H).rect(W * 0.5, y0, W, y0 + S)
    g.corner('TL', 0, 0, S, S).corner('BL', 0, H, S, H - S).corner('BR', W, H, W - S, H - S)
    return g

@glyph('H')
def g_H(P):
    g = G(WW(P, 6.0), P); S, H, W = g.S, g.H, g.W
    g.rect(0, 0, S, H).rect(W - S, 0, W, H).rect(0, g.m0, W, g.m1)
    return g

@glyph('I')
def g_I(P):
    S = P['S']; g = G(S, P)
    g.rect(0, 0, S, g.H).cut('TL', 0, 0, c=S)
    return g

@glyph('J')
def g_J(P):
    g = G(WW(P, 5.2), P); S, H, W = g.S, g.H, g.W
    g.rect(W - S, 0, W, H).rect(0, H - S, W, H).rect(0, H * 0.56, S, H)
    g.corner('BR', W, H, W - S, H - S).corner('BL', 0, H, S, H - S)
    g.cut('TL', W - S, 0, c=S)
    return g

@glyph('K')
def g_K(P):
    g = G(WW(P, 6.0), P); S, H, W, h = g.S, g.H, g.W, g.h
    yc = H / 2
    # upper arm: band x+y in [W-S√2, W]; lower arm: x-y in [W-H-S√2, W-H]
    g.rect(0, 0, S, H)
    cu = W - S * R2 / 2            # centerline x+y = cu
    g.stroke([(h, cu - h), (cu + 2, -2)])
    cl = W - H - S * R2 / 2        # centerline x-y = cl
    g.stroke([(h, h - cl), (W + 2, W + 2 - cl)])
    return g

@glyph('L')
def g_L(P):
    g = G(WW(P, 5.4), P); S, H, W = g.S, g.H, g.W
    g.rect(0, 0, S, H).rect(0, H - S, W, H).cut('BL', 0, H)
    return g

def n_diag(P, W):
    """vertical thickness of the N/M diagonal, solved so its perpendicular
    weight stays at the wordmark ratio (t = 2.9 for S = 1.7, W = 6)"""
    S, H = P['S'], P['H']
    target = 0.7747 * S
    span = max(0.3, W - 2 * S)
    lo, hi = 0.2, H * 0.9
    for _ in range(60):
        t = (lo + hi) / 2
        th = math.atan2(H - t, span)
        if t * math.cos(th) < target: lo = t
        else: hi = t
    return (lo + hi) / 2

@glyph('M')
def g_M(P):
    g = G(WW(P, 7.6, 2.2), P); S, H, W = g.S, g.H, g.W
    t = n_diag(P, W)
    WN = WW(P, 6.0)
    slope = (H - t) / max(0.5, WN - 2 * S)
    xc = W / 2; yv = (xc - S) * slope
    g.rect(0, 0, S, H).rect(W - S, 0, W, H)
    g.add([(S, 0), (xc, yv), (xc, yv + t), (S, t)])
    g.add([(W - S, 0), (W - S, t), (xc, yv + t), (xc, yv)])
    return g

@glyph('N')
def g_N(P):
    g = G(WW(P, 6.0), P); S, H, W = g.S, g.H, g.W
    t = n_diag(P, W)
    g.rect(0, 0, S, H).rect(W - S, 0, W, H)
    g.add([(S, 0), (W - S, H - t), (W - S, H), (S, t)])
    return g

@glyph('O')
def g_O(P):
    g = G(WW(P, 6.0), P); S, H, W = g.S, g.H, g.W
    g.rect(0, 0, W, S).rect(0, H - S, W, H).rect(0, 0, S, H).rect(W - S, 0, W, H)
    g.corner('TL', 0, 0, S, S).corner('BR', W, H, W - S, H - S)
    return g

@glyph('P')
def g_P(P):
    g = G(WW(P, 5.8), P); S, H, W = g.S, g.H, g.W
    b0 = H * 0.55 - S / 2; b1 = b0 + S
    g.rect(0, 0, S, H).rect(0, 0, W, S).rect(W - S, 0, W, b1).rect(0, b0, W, b1)
    g.corner('TR', W, 0, W - S, S).corner('BR', W, b1, W - S, b0)
    return g

@glyph('Q')
def g_Q(P):
    g = G(WW(P, 6.0), P); S, H, W, h, c = g.S, g.H, g.W, g.h, g.c
    g.rect(0, 0, W, S).rect(0, H - S, W, H).rect(0, 0, S, H).rect(W - S, 0, W, H)
    g.corner('TL', 0, 0, S, S).corner('BR', W, H, W - S, H - S)
    mx, my = W - c / 2, H - c / 2
    d = S * R2 / 2 + g.ci * 0.2
    L = S * 0.95
    g.stroke([(mx - d / R2, my - d / R2), (mx + L / R2, my + L / R2)], S=S * 0.9)
    g.box = [0, 0, W + 1.2, H + 1.2]
    return g

def g_Q(P):
    g = G(WW(P, 6.0), P); S, H, W, h = g.S, g.H, g.W, g.h
    g.rect(0, 0, W, S).rect(0, H - S, W, H).rect(0, 0, S, H).rect(W - S, 0, W, H)
    g.corner('TL', 0, 0, S, S).corner('BR', W, H, W - S, H - S)
    # tail crossing the BR chamfer
    a = W - S - 0.55 * min(1, W / 6)
    g.stroke([(a - 0.6, H - S - 0.6 - (W - S - a)), (W + 0.5, H + 0.5)], S=S * 0.92)
    g.box = [0, 0, W + 0.35, H + 0.35]
    return g

@glyph('R')
def g_R(P):
    g = G(WW(P, 6.0), P); S, H, W, h = g.S, g.H, g.W, g.h
    b0 = H * 0.55 - S / 2; b1 = b0 + S
    g.rect(0, 0, S, H).rect(0, 0, W, S).rect(W - S, 0, W, b1).rect(0, b0, W, b1)
    g.corner('TR', W, 0, W - S, S).corner('BR', W, b1, W - S, b0)
    cl = W - H - S * R2 / 2   # leg centerline x - y = cl, ends at bottom-right
    ys = b0 + h
    g.stroke([(ys + cl, ys), (W + 2, W + 2 - cl)])
    return g

@glyph('S')
def g_S(P):
    g = G(WW(P, 6.0), P); S, H, W = g.S, g.H, g.W; m0, m1 = g.m0, g.m1
    g.rect(0, 0, W, S).rect(0, 0, S, m1).rect(0, m0, W, m1).rect(W - S, m0, W, H).rect(0, H - S, W, H)
    g.corner('TL', 0, 0, S, S)
    g.cut('BL', 0, m1); g.fillc('BL', S, m0)
    g.cut('TR', W, m0); g.fillc('TR', W - S, m1)
    g.corner('BR', W, H, W - S, H - S)
    return g

@glyph('T')
def g_T(P):
    g = G(WW(P, 6.0), P); S, H, W = g.S, g.H, g.W
    g.rect(0, 0, W, S).rect(W / 2 - S / 2, 0, W / 2 + S / 2, H)
    g.cut('TL', 0, 0, c=S).cut('BR', W, S, c=S)
    return g

@glyph('U')
def g_U(P):
    g = G(WW(P, 6.0), P); S, H, W = g.S, g.H, g.W
    g.rect(0, 0, S, H).rect(W - S, 0, W, H).rect(0, H - S, W, H)
    g.corner('BL', 0, H, S, H - S).corner('BR', W, H, W - S, H - S)
    return g

def v_shape(g, x0, x1, f, yo=None):
    """V spanning x0..x1: vertical stems to yo, steep diagonals, flat bottom f"""
    S, H = g.S, g.H
    yo = H * 0.30 if yo is None else yo
    xm = (x0 + x1) / 2
    ax, ay = (xm - f / 2) - x0, H - yo
    L = math.hypot(ax, ay); ux, uy = ax / L, ay / L
    nx, ny = uy, -ux
    px, py = x0 + S * nx, yo + S * ny
    yi = py + (x0 + S - px) / ux * uy
    yv = py + (xm - px) / ux * uy
    left = [(x0, -0.5), (x0 + S, -0.5), (x0 + S, yi), (xm, yv), (xm, H), (xm - f / 2, H), (x0, yo)]
    g.add(left)
    g.add([(2 * xm - x, y) for x, y in left][::-1])
    return yo, yv

@glyph('V')
def g_V(P):
    g = G(WW(P, 6.0), P)
    v_shape(g, 0, g.W, g.S * 0.9)
    return g

def g_V(P):
    g = G(WW(P, 6.0), P)
    v_shape(g, 0, g.W, g.S * 0.72)
    return g

@glyph('W')
def g_W(P):
    g = G(WW(P, 9.4, 4.0), P); S, W = g.S, g.W
    xm = W / 2
    v_shape(g, 0, xm + S / 2, S * 0.7, yo=g.H * 0.22)
    v_shape(g, xm - S / 2, W, S * 0.7, yo=g.H * 0.22)
    return g

def g_W(P):
    g = G(WW(P, 9.2, 4.0), P); S, W = g.S, g.W
    xm = W / 2
    v_shape(g, 0, xm + S / 2, S * 0.62)
    v_shape(g, xm - S / 2, W, S * 0.62)
    return g

@glyph('X')
def g_X(P):
    g = G(WW(P, 6.0), P); S, H, W, h = g.S, g.H, g.W, g.h
    a = (H - W + 2 * h) / 2
    g.stroke([(h, -2), (h, a), (W - h, H - a), (W - h, H + 2)])
    g.stroke([(W - h, -2), (W - h, a), (h, H - a), (h, H + 2)])
    return g

@glyph('Y')
def g_Y(P):
    g = G(WW(P, 6.0), P); S, H, W, h = g.S, g.H, g.W, g.h
    xm = W / 2
    yJ = H * 0.56
    ya = yJ - (xm - h)
    g.stroke([(h, -2), (h, ya), (xm, yJ), (W - h, ya), (W - h, -2)])
    g.rect(xm - h, yJ - h, xm + h, H)
    return g

@glyph('Z')
def g_Z(P):
    g = G(WW(P, 5.8), P); S, H, W = g.S, g.H, g.W
    tz = S * 1.55
    g.rect(0, 0, W, S).rect(0, H - S, W, H)
    g.add([(W - tz, S - 0.01), (W, S - 0.01), (tz, H - S + 0.01), (0, H - S + 0.01)])
    g.cut('TL', 0, 0, c=S * 0.9).cut('BR', W, H, c=S * 0.9)
    return g

# --- digits -----------------------------------------------------------------
@glyph('0', 'zero')
def g_zero(P):
    g = G(WW(P, 5.5), P); S, H, W = g.S, g.H, g.W
    g.rect(0, 0, W, S).rect(0, H - S, W, H).rect(0, 0, S, H).rect(W - S, 0, W, H)
    g.corner('TR', W, 0, W - S, S).corner('BL', 0, H, S, H - S)
    return g

def g_zero(P):
    g = G(WW(P, 5.6), P); S, H, W = g.S, g.H, g.W
    g.rect(0, 0, W, S).rect(0, H - S, W, H).rect(0, 0, S, H).rect(W - S, 0, W, H)
    g.corner('TR', W, 0, W - S, S).corner('BL', 0, H, S, H - S)
    # slash inside the counter
    ins = S * 1.0
    tz = S * 0.62
    cx0, cy0, cx1, cy1 = S + 0.0, S + 0.0, W - S, H - S
    g.add([(cx1 - tz, cy0 + ins * 0.2), (cx1, cy0 + ins * 0.2), (cx0 + tz, cy1 - ins * 0.2), (cx0, cy1 - ins * 0.2)])
    return g

@glyph('1', 'one')
def g_one(P):
    S = P['S']; W = max(3.5 * P['wf'] + S * 0.2, S * 2.1); g = G(W, P); H = g.H
    g.rect(W - S, 0, W, H)
    q = S * R2
    g.add([(0, S * 1.25), (W - S - 0.0, 0), (W - S + 0.01, 0), (W - S + 0.01, q * 0.9), (0, S * 1.25 + q * 0.9)])
    g.add([(W - S, 0), (W, 0), (W, S), (W - S, S)])
    return g

@glyph('2', 'two')
def g_two(P):
    g = G(WW(P, 5.6), P); S, H, W = g.S, g.H, g.W; m0, m1 = g.m0, g.m1
    g.rect(0, 0, W, S).rect(W - S, 0, W, m1).rect(0, m0, W, m1).rect(0, m0, S, H).rect(0, H - S, W, H)
    g.corner('TR', W, 0, W - S, S)
    g.cut('BR', W, m1); g.fillc('BR', W - S, m0)
    g.cut('TL', 0, m0); g.fillc('TL', S, m1)
    g.cut('TL', 0, 0, c=S * 0.9)
    return g

@glyph('3', 'three')
def g_three(P):
    g = G(WW(P, 5.6), P); S, H, W = g.S, g.H, g.W
    g.rect(0, 0, W, S).rect(W - S, 0, W, H).rect(W * 0.28, g.m0, W, g.m1).rect(0, H - S, W, H)
    g.corner('TR', W, 0, W - S, S).corner('BR', W, H, W - S, H - S)
    g.cut('TL', 0, 0, c=S * 0.9).cut('BL', 0, H, c=S * 0.9)
    return g

@glyph('4', 'four')
def g_four(P):
    g = G(WW(P, 6.0), P); S, H, W = g.S, g.H, g.W
    y0 = H * 0.6 - S / 2; y1 = y0 + S
    xr = W - S * 0.55
    g.rect(0, 0, S, y1).rect(0, y0, W, y1).rect(xr - S, 0, xr, H)
    g.cut('TL', 0, 0, c=S)
    g.cut('BL', 0, y1, c=S * 0.9)
    return g

@glyph('5', 'five')
def g_five(P):
    g = G(WW(P, 5.6), P); S, H, W = g.S, g.H, g.W; m0, m1 = g.m0, g.m1
    g.rect(0, 0, W, S).rect(0, 0, S, m1).rect(0, m0, W, m1).rect(W - S, m0, W, H).rect(0, H - S, W, H)
    g.cut('TR', W, S, c=0)  # no-op placeholder
    g.cut('BR', W, S, c=S)  # slanted end of the top bar
    g.corner('TR', W, m0, W - S, m1)
    g.corner('BR', W, H, W - S, H - S)
    g.cut('BL', 0, H, c=S * 0.9)
    return g

@glyph('6', 'six')
def g_six(P):
    g = G(WW(P, 5.6), P); S, H, W = g.S, g.H, g.W; m0, m1 = g.m0, g.m1
    g.rect(0, 0, W, S).rect(0, 0, S, H).rect(0, m0, W, m1).rect(W - S, m0, W, H).rect(0, H - S, W, H)
    g.corner('TL', 0, 0, S, S).corner('BL', 0, H, S, H - S).corner('BR', W, H, W - S, H - S)
    g.corner('TR', W, m0, W - S, m1)
    g.cut('BR', W, S, c=S)
    return g

@glyph('7', 'seven')
def g_seven(P):
    g = G(WW(P, 5.4), P); S, H, W, h = g.S, g.H, g.W, g.h
    g.rect(0, 0, W, S)
    x7 = max(h + 0.2, W * 0.36)
    dx = W - h - x7
    y7 = max(S + 0.2, H * 0.62 - dx)
    g.stroke([(W - h, -2), (W - h, y7), (x7, y7 + dx), (x7, H + 2)])
    g.cut('TL', 0, 0, c=S * 0.9)
    g.cut('TR', W, 0)
    g.fillc('TR', W - g.S, g.S)
    return g

@glyph('8', 'eight')
def g_eight(P):
    g = G(WW(P, 5.8), P); S, H, W = g.S, g.H, g.W; m0, m1 = g.m0, g.m1
    st = 0.35 * min(1.0, W / 5.8)
    a, b = st, W - st
    g.rect(a, 0, b, S).rect(a, 0, a + S, m1).rect(b - S, 0, b, m1).rect(0, m0, W, m1)
    g.rect(0, m0, S, H).rect(W - S, m0, W, H).rect(0, H - S, W, H)
    g.corner('TL', a, 0, a + S, S).corner('TR', b, 0, b - S, S)
    g.corner('BL', 0, H, S, H - S).corner('BR', W, H, W - S, H - S)
    g.erase([(a, m0), (-2, m0), (-2, m0 + a + 2)])
    g.erase([(b, m0), (W + 2, m0), (W + 2, m0 + W + 2 - b)])
    return g

@glyph('9', 'nine')
def g_nine(P):
    g = g_six(P); g.rot180(); return g

# --- punctuation ------------------------------------------------------------
@glyph('  ', 'space')
def g_space(P):
    g = G(P['space'], P); g.empty = True; return g

@glyph('.', 'period')
def g_period(P):
    S = P['S']; g = G(S, P); H = g.H
    g.rect(0, H - S, S, H).cut('TL', 0, H - S, c=S * 0.45)
    return g

@glyph(',', 'comma')
def g_comma(P):
    S = P['S']; W = S + S * 0.55; g = G(W, P); H = g.H
    g.rect(W - S, H - S, W, H).cut('TL', W - S, H - S, c=S * 0.45)
    g.add([(W - S, H - 0.01), (W, H - 0.01), (W - S * 0.55, H + S * 1.0), (0, H + S * 1.0)])
    g.box = [0, 0, W, H + S * 1.05]
    return g

@glyph(':', 'colon')
def g_colon(P):
    S = P['S']; g = G(S, P); H = g.H
    y = H * 0.36 - S / 2
    g.rect(0, H - S, S, H).rect(0, y, S, y + S)
    g.cut('TL', 0, H - S, c=S * 0.45).cut('TL', 0, y, c=S * 0.45)
    return g

@glyph(';', 'semicolon')
def g_semicolon(P):
    g = g_comma(P); S = g.S; H = g.H; W = g.W
    y = H * 0.36 - S / 2
    g.rect(W - S, y, W, y + S).cut('TL', W - S, y, c=S * 0.45)
    return g

def dash(P, w):
    g = G(w, P); S, H = g.S, g.H
    t = S * 0.92
    y0 = H * 0.52 - t / 2
    g.rect(0, y0, w, y0 + t).cut('TL', 0, y0, c=t).cut('BR', w, y0 + t, c=t)
    return g

@glyph('-‐‑', 'hyphen')
def g_hyphen(P): return dash(P, max(3.0, 3.4 * P['wf']))

@glyph('–', 'endash')
def g_endash(P): return dash(P, max(4.4, 5.0 * P['wf']))

@glyph('—', 'emdash')
def g_emdash(P): return dash(P, max(6.0, 7.6 * P['wf']))

@glyph('/', 'slash')
def g_slash(P):
    S = P['S']; W = max(3.2, 4.2 * P['wf']); g = G(W, P); H = g.H
    tz = S * 1.3
    g.add([(0, H), (tz, H), (W, 0), (W - tz, 0)])
    return g

@glyph('\\', 'backslash')
def g_backslash(P):
    g = g_slash(P); g.mirror(); return g

@glyph('|', 'bar')
def g_bar(P):
    S = P['S'] * 0.8; g = G(S, P); g.rect(0, -0.8, S, g.H + 0.8); g.box = [0, -0.8, S, g.H + 0.8]; return g

@glyph('_', 'underscore')
def g_underscore(P):
    g = G(WW(P, 5.0), P); S = g.S
    g.rect(0, g.H + 0.5, g.W, g.H + 0.5 + S * 0.8); g.box = [0, 0, g.W, g.H + 0.6 + S]; return g

@glyph('\'’‘ʼ', 'quotesingle')
def g_quote(P):
    S = P['S']; w = S * 0.9; W = w + S * 0.5; g = G(W, P)
    g.add([(S * 0.5, 0), (W, 0), (w, S * 1.6), (0, S * 1.6)])
    return g

@glyph('"“”', 'quotedbl')
def g_quotedbl(P):
    S = P['S']; w = S * 0.9; o = w + S * 0.5; gap = S * 0.55; W = 2 * o + gap; g = G(W, P)
    for x in (0, o + gap):
        g.add([(x + S * 0.5, 0), (x + o, 0), (x + w, S * 1.6), (x, S * 1.6)])
    return g

@glyph('!', 'exclam')
def g_exclam(P):
    S = P['S']; g = G(S, P); H = g.H
    g.rect(0, 0, S, H - S * 2.0).cut('TL', 0, 0, c=S)
    g.rect(0, H - S, S, H).cut('TL', 0, H - S, c=S * 0.45)
    return g

@glyph('?', 'question')
def g_question(P):
    g = G(WW(P, 5.4), P); S, H, W = g.S, g.H, g.W
    xs = W * 0.42
    yb = H * 0.5
    g.rect(0, 0, W, S).rect(W - S, 0, W, yb).rect(xs, yb - S, W, yb).rect(xs, yb - S, xs + S, H - S * 2.0)
    g.corner('TR', W, 0, W - S, S).corner('BR', W, yb, W - S, yb - S)
    g.cut('TL', 0, 0, c=S)
    g.rect(xs, H - S, xs + S, H).cut('TL', xs, H - S, c=S * 0.45)
    return g

@glyph('(', 'parenleft')
def g_parenleft(P):
    S = P['S']; W = S + 1.4; g = G(W, P); H = g.H; h = S / 2
    g.stroke([(W + 1.0, -1.0 - 0.6), (h, W - h - 0.6 + 0.2), (h, H - (W - h) + 0.4), (W + 1.0, H + 1.6)])
    g.box = [0, -0.6, W, H + 0.6]
    return g

@glyph(')', 'parenright')
def g_parenright(P):
    g = g_parenleft(P); g.mirror(); return g

@glyph('[', 'bracketleft')
def g_bracketleft(P):
    S = P['S']; W = S + 1.3; g = G(W, P); H = g.H
    g.rect(0, -0.6, S, H + 0.6).rect(0, -0.6, W, -0.6 + S * 0.9).rect(0, H + 0.6 - S * 0.9, W, H + 0.6)
    g.box = [0, -0.6, W, H + 0.6]
    return g

@glyph(']', 'bracketright')
def g_bracketright(P):
    g = g_bracketleft(P); g.mirror(); return g

@glyph('+', 'plus')
def g_plus(P):
    W = 5.4; g = G(W, P); S, H = g.S * 0.92, g.H
    c = H * 0.52
    g.rect(W / 2 - S / 2, c - W / 2, W / 2 + S / 2, c + W / 2).rect(0, c - S / 2, W, c + S / 2)
    return g

@glyph('×', 'multiply')
def g_multiply(P):
    W = 4.8; g = G(W, P); S, H = g.S * 0.9, g.H
    c = H * 0.52; r = W / 2
    g.stroke([(0, c - r), (W, c + r)], S=S).stroke([(W, c - r), (0, c + r)], S=S)
    g.box = [0, c - r, W, c + r]
    return g

@glyph('=', 'equal')
def g_equal(P):
    W = 5.0; g = G(W, P); S, H = g.S * 0.85, g.H
    c = H * 0.52
    g.rect(0, c - S * 1.35, W, c - S * 0.35).rect(0, c + S * 0.35, W, c + S * 1.35)
    return g

@glyph('#', 'numbersign')
def g_numbersign(P):
    W = WW(P, 6.4); g = G(W, P); S, H = g.S * 0.85, g.H
    xa = W * 0.22; xb = W * 0.62
    g.rect(xa, 0.4, xa + S, H - 0.4).rect(xb, 0.4, xb + S, H - 0.4)
    g.rect(0, H * 0.3, W, H * 0.3 + S).rect(0, H * 0.7 - S, W, H * 0.7)
    return g

@glyph('%', 'percent')
def g_percent(P):
    W = WW(P, 6.6); g = G(W, P); S, H = g.S, g.H
    b = S * 1.45
    g.rect(0, 0, b, b).cut('TL', 0, 0, c=b * 0.45).cut('BR', b, b, c=b * 0.3)
    g.rect(W - b, H - b, W, H).cut('TL', W - b, H - b, c=b * 0.3).cut('BR', W, H, c=b * 0.45)
    tz = S * 1.25
    g.add([(W * 0.12, H), (W * 0.12 + tz, H), (W * 0.88, 0), (W * 0.88 - tz, 0)])
    return g

def g_percent(P):
    W = WW(P, 7.0); g = G(W, P); S, H = g.S * 0.8, g.H
    b = 2.6
    for (x, y) in ((0, 0), (W - b, H - b)):
        g.rect(x, y, x + b, y + S).rect(x, y + b - S, x + b, y + b).rect(x, y, x + S, y + b).rect(x + b - S, y, x + b, y + b)
    tz = S * 1.3
    g.add([(W * 0.18, H), (W * 0.18 + tz, H), (W * 0.82, 0), (W * 0.82 - tz, 0)])
    return g

@glyph('°', 'degree')
def g_degree(P):
    W = 3.2; g = G(W, P); S = g.S * 0.62
    g.rect(0, 0, W, S).rect(0, W - S, W, W).rect(0, 0, S, W).rect(W - S, 0, W, W)
    g.cut('TL', 0, 0, c=S).cut('BR', W, W, c=S)
    return g

@glyph('·•∙', 'periodcentered')
def g_periodcentered(P):
    S = P['S']; g = G(S, P); H = g.H
    y = H * 0.52 - S / 2
    g.rect(0, y, S, y + S).cut('TL', 0, y, c=S * 0.45)
    return g

@glyph('…', 'ellipsis')
def g_ellipsis(P):
    S = P['S']; gap = S * 0.9; W = 3 * S + 2 * gap; g = G(W, P); H = g.H
    for i in range(3):
        x = i * (S + gap); g.rect(x, H - S, x + S, H).cut('TL', x, H - S, c=S * 0.45)
    return g

@glyph('<', 'less')
def g_less(P):
    W = 4.4; g = G(W, P); S, H, h = g.S * 0.9, g.H, g.S * 0.45
    c = H * 0.52
    g.stroke([(W, c - W + h * R2), (h * R2, c), (W, c + W - h * R2)], S=S, e0=1, e1=1)
    g.box = [0, c - W, W, c + W]
    return g

@glyph('>', 'greater')
def g_greater(P):
    g = g_less(P); g.mirror(); return g

@glyph('&', 'ampersand')
def g_ampersand(P):
    g = G(WW(P, 6.8, 3.0), P); S, H, W, h = g.S, g.H, g.W, g.h
    a = W * 0.085
    xL = a + h; xR = W * 0.63 - h; yR = H * 0.28
    yA = H - h - (W - h - xL)
    g.stroke([(W - h + 2, H - h + 2), (xL, yA), (xL, h), (xR, h), (xR, yR),
              (h, yR + (xR - h)), (h, H - h), (W - h - 1.2, H - h)])
    g.cut('TL', a, 0); g.fillc('TL', a + S, S)
    g.cut('TR', xR + h, 0); g.fillc('TR', xR - h, S)
    g.cut('BL', 0, H); g.fillc('BL', S, H - S)
    if P.get('amp_tick', True):
        yt = H * 0.56
        g.rect(yt - 0.2, yt, W, yt + S * 0.85)
        g.cut('BR', W, yt + S * 0.85, c=S * 0.6)
    return g

def arrow_h(P):
    W = 6.6; g = G(W, P); S, H = g.S * 0.92, g.H; h = S / 2
    c = H * 0.52; r = 2.9
    tip = W
    j = tip - h * R2
    g.stroke([(0, c), (j - 0.2, c)], S=S, e1=0)
    g.stroke([(j - r, c - r), (j, c), (j - r, c + r)], S=S)
    g.box = [0, c - r - S, W, c + r + S]
    return g

@glyph('→', 'arrowright')
def g_arrowright(P): return arrow_h(P)

@glyph('←', 'arrowleft')
def g_arrowleft(P):
    g = arrow_h(P); g.mirror(); return g

def arrow_v(P, down=True):
    W = 6.2; g = G(W, P); S, H = g.S * 0.92, g.H; h = S / 2
    cx = W / 2; r = 2.75
    tip = H
    j = tip - h * R2
    g.stroke([(cx, 0), (cx, j - 0.2)], S=S)
    g.stroke([(cx - r, j - r), (cx, j), (cx + r, j - r)], S=S)
    if not down:
        g.ops = [(op, [(x, H - y) for x, y in pts]) for op, pts in g.ops]
    return g

@glyph('↓', 'arrowdown')
def g_arrowdown(P): return arrow_v(P, True)

@glyph('↑', 'arrowup')
def g_arrowup(P): return arrow_v(P, False)

@glyph('↗', 'arrowupright')
def g_arrowupright(P):
    W = 6.0; g = G(W, P); S = g.S * 0.92; H = g.H; h = S / 2
    y0 = (H - W) / 2 + 0.2
    L = W * 0.68
    g.rect(W - L, y0, W, y0 + S).rect(W - S, y0, W, y0 + L)
    g.stroke([(0.0 + h * 0.7, y0 + W - h * 0.7), (W - S * 1.15, y0 + S * 1.15)], S=S, e0=h, e1=h * 1.2)
    g.box = [0, y0, W, y0 + W]
    return g

@glyph('↘', 'arrowdownright')
def g_arrowdownright(P):
    g = g_arrowupright(P); H = g.H
    g.ops = [(op, [(x, H - y) for x, y in pts]) for op, pts in g.ops]
    x0, y0, x1, y1 = g.box; g.box = [x0, H - y1, x1, H - y0]
    return g

@glyph('▶►', 'triangleright')
def g_triangleright(P):
    W = 5.0; g = G(W, P); H = g.H
    c = H * 0.52; r = 3.0
    g.add([(0, c - r), (W, c), (0, c + r)])
    return g

@glyph('*', 'asterisk')
def g_asterisk(P):
    W = 4.6; g = G(W, P); S = g.S * 0.62; c = 2.4
    g.rect(W / 2 - S / 2, 0, W / 2 + S / 2, 2 * c)
    g.stroke([(W / 2 - 2.0, c - 1.15), (W / 2 + 2.0, c + 1.15)], S=S)
    g.stroke([(W / 2 + 2.0, c - 1.15), (W / 2 - 2.0, c + 1.15)], S=S)
    g.box = [0, 0, W, 2 * c]
    return g

@glyph('@', 'at')
def g_at(P):
    W = WW(P, 7.4); g = G(W, P); S, H = g.S * 0.8, g.H
    g.rect(0, 0, W, S).rect(0, 0, S, H).rect(0, H - S, W * 0.8, H).rect(W - S, 0, W, H * 0.72)
    x0 = W * 0.3; y0 = H * 0.3; x1 = W - S; y1 = H * 0.72
    g.rect(x0, y0, x1, y0 + S).rect(x0, y0, x0 + S, y1).rect(x0, y1 - S, W, y1)
    g.cut('TL', 0, 0, c=S).cut('BL', 0, H, c=S)
    return g

@glyph('$', 'dollar')
def g_dollar(P):
    g = g_S(P); W, H, S = g.W, g.H, g.S
    g.rect(W / 2 - S * 0.35, -0.7, W / 2 + S * 0.35, H + 0.7)
    g.box = [0, -0.7, W, H + 0.7]
    return g

@glyph('~', 'asciitilde')
def g_tilde(P):
    W = 5.6; g = G(W, P); S = g.S * 0.8; H = g.H; c = H * 0.52
    g.stroke([(0, c + 0.9), (1.4, c - 0.5), (W - 1.4, c + 0.5), (W, c - 0.9)], S=S, e0=0.3, e1=0.3)
    g.box = [0, c - 2, W, c + 2]
    return g

@glyph('≈', 'approxequal')
def g_approx(P):
    W = 5.6; g = G(W, P); S = g.S * 0.75; H = g.H; c = H * 0.52
    for dy in (-1.15, 1.15):
        g.stroke([(0, c + dy + 0.8), (1.3, c + dy - 0.5), (W - 1.3, c + dy + 0.5), (W, c + dy - 0.8)], S=S, e0=0.3, e1=0.3)
    g.box = [0, c - 3, W, c + 3]
    return g


# ---------------------------------------------------------------------------
# raster union + trace
# ---------------------------------------------------------------------------
SC = 160  # px per unit

def trace(g):
    x0, y0, x1, y1 = g.box
    pad = 0.6
    ox, oy = x0 - pad, y0 - pad
    Wpx = int(math.ceil((x1 - x0 + 2 * pad) * SC)); Hpx = int(math.ceil((y1 - y0 + 2 * pad) * SC))
    im = Image.new('L', (Wpx, Hpx), 0); d = ImageDraw.Draw(im)
    for op, pts in g.ops:
        pp = [((x - ox) * SC, (y - oy) * SC) for x, y in pts]
        if len(pp) >= 3:
            d.polygon(pp, fill=255 if op == 'add' else 0)
    arr = np.array(im)
    bx0 = int(round((x0 - ox) * SC)); bx1 = int(round((x1 - ox) * SC))
    by0 = int(round((y0 - oy) * SC)); by1 = int(round((y1 - oy) * SC))
    arr[:, :bx0] = 0; arr[:, bx1:] = 0; arr[:by0, :] = 0; arr[by1:, :] = 0
    arr = (arr > 127).astype(np.uint8) * 255
    cnts, hier = cv2.findContours(arr, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
    out = []
    if hier is None: return out, arr
    for i, cnt in enumerate(cnts):
        if cv2.contourArea(cnt) < 6: continue
        ap = cv2.approxPolyDP(cnt, 1.0, True)[:, 0, :]
        if len(ap) < 3: continue
        pts = [(p[0] / SC + ox, p[1] / SC + oy) for p in ap]
        out.append((pts, hier[0][i][3] >= 0))
    return out, arr


def area(pts):
    a = 0
    for i in range(len(pts)):
        x0, y0 = pts[i]; x1, y1 = pts[(i + 1) % len(pts)]
        a += x0 * y1 - x1 * y0
    return a / 2


def build(P, name, outdir, family):
    U = P['cap'] / P['H']          # font units per design unit
    sb = P['sb']
    order = ['.notdef']; cmap = {}; glyphs = {}; metrics = {}; polys = {}
    for gname, (chars, fn) in GL.items():
        g = fn(P)
        order.append(gname)
        for ch in chars:
            cmap[ord(ch)] = gname
            if 'A' <= ch <= 'Z': cmap[ord(ch.lower())] = gname
        adv = int(round((g.W + 2 * sb) * U))
        pen = TTGlyphPen(None)
        contours = []
        if not getattr(g, 'empty', False):
            cs, _ = trace(g)
            for pts, hole in cs:
                fp = [(int(round((x + sb) * U)), int(round((P['H'] - y) * U))) for x, y in pts]
                # dedupe consecutive
                q = [fp[0]]
                for p in fp[1:]:
                    if p != q[-1]: q.append(p)
                if len(q) > 1 and q[0] == q[-1]: q.pop()
                if len(q) < 3: continue
                A = area(q)
                if (not hole and A > 0) or (hole and A < 0): q = q[::-1]
                contours.append(q)
                pen.moveTo(q[0])
                for p in q[1:]: pen.lineTo(p)
                pen.closePath()
        glyph = pen.glyph()
        glyphs[gname] = glyph
        polys[gname] = contours
        xmin = min((p[0] for c in contours for p in c), default=0)
        metrics[gname] = (adv, xmin)
    # notdef
    pen = TTGlyphPen(None)
    w = int(5 * U)
    for pts in ([(50, 0), (50, P['cap']), (w - 50, P['cap']), (w - 50, 0)], [(110, 60), (w - 110, 60), (w - 110, P['cap'] - 60), (110, P['cap'] - 60)]):
        pen.moveTo(pts[0]); [pen.lineTo(p) for p in pts[1:]]; pen.closePath()
    glyphs['.notdef'] = pen.glyph(); metrics['.notdef'] = (w, 50); polys['.notdef'] = []

    fb = FontBuilder(1000, isTTF=True)
    fb.setupGlyphOrder(order)
    fb.setupCharacterMap(cmap)
    fb.setupGlyf(glyphs)
    # overlap flag not needed (contours are unioned) — compute bounds
    fb.setupHorizontalMetrics(metrics)
    asc, desc = 850, -150
    fb.setupHorizontalHeader(ascent=asc, descent=desc)
    fb.setupNameTable({
        'familyName': family, 'styleName': 'Regular',
        'uniqueFontIdentifier': family.replace(' ', '') + '-Regular;celesnica',
        'fullName': family, 'psName': family.replace(' ', '') + '-Regular',
        'version': 'Version 1.000',
        'copyright': 'CEL display type, drawn for the CELESNICA website (2026).',
        'licenseDescription': 'Made for celesnica website use.',
    })
    fb.setupOS2(sTypoAscender=asc, sTypoDescender=desc, sTypoLineGap=0,
                usWinAscent=980, usWinDescent=260, sCapHeight=int(P['cap']), sxHeight=int(P['cap']),
                fsSelection=0x40 | 0x80, usWeightClass=400, achVendID='CELS')
    fb.setupPost()
    # kerning
    kern = autokern(polys, metrics, P, U)
    if kern:
        fea = 'languagesystem DFLT dflt;\nlanguagesystem latn dflt;\nfeature kern {\n' + \
              '\n'.join(f'  pos {a} {b} {v};' for (a, b), v in kern.items()) + '\n} kern;\n'
        addOpenTypeFeaturesFromString(fb.font, fea)
    path = os.path.join(outdir, name + '.ttf')
    fb.save(path)
    fb.font.flavor = 'woff'
    fb.font.save(os.path.join(outdir, name + '.woff'))
    return path, polys, metrics, kern


# ---------------------------------------------------------------------------
# simple optical kerning (negative only) from horizontal profiles
# ---------------------------------------------------------------------------
KERN_SET = list('ABCDEFGHIJKLMNOPQRSTUVWXYZ') + ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'period', 'comma', 'hyphen', 'quotesingle', 'quotedbl', 'slash']

def profiles(contours, adv, U, H):
    rows = 40
    capu = H * U
    L = np.full(rows, np.inf); R = np.full(rows, -np.inf)
    if not contours: return None
    for i in range(rows):
        y = capu * (i + 0.5) / rows
        xs = []
        for c in contours:
            n = len(c)
            for k in range(n):
                (x0, y0), (x1, y1) = c[k], c[(k + 1) % n]
                if (y0 <= y < y1) or (y1 <= y < y0):
                    xs.append(x0 + (y - y0) * (x1 - x0) / (y1 - y0))
        if xs:
            L[i] = min(xs); R[i] = adv - max(xs)
    return L, R

def autokern(polys, metrics, P, U):
    H = P['H']
    prof = {}
    for n in KERN_SET:
        if n in polys and polys[n]:
            pr = profiles(polys[n], metrics[n][0], U, H)
            if pr: prof[n] = pr
    if 'H' not in prof: return {}
    cap = P['kcap'] * U
    def gap(a, b):
        Ra = prof[a][1]; Lb = prof[b][0]
        g = np.where(np.isfinite(Ra) & np.isfinite(Lb), Ra + Lb, np.inf)
        g = np.minimum(g, cap)
        return g
    base = float(np.mean(gap('H', 'H')))
    out = {}
    for a in prof:
        for b in prof:
            g = gap(a, b)
            mn = float(np.min(g)); avg = float(np.mean(g))
            k = -(avg - base) * P['kf']
            k = max(k, -(mn - base * 0.55))   # never collide
            k = max(k, -P['kmax'] * U)
            k = min(k, 0)
            if k < -0.12 * U:
                out[(a, b)] = int(round(k))
    return out


# ---------------------------------------------------------------------------
INSTANCES = {
    'CEL-Black': dict(family='CEL Black', H=8.0, S=1.7, c=1.7, wf=1.0, sb=0.5, cap=700, space=3.0, kcap=3.4, kf=0.42, kmax=1.6),
    'CEL-Cond':  dict(family='CEL Cond', H=8.0, S=1.42, c=1.3, wf=0.64, sb=0.34, cap=700, space=2.2, kcap=2.6, kf=0.4, kmax=1.1),
    'CEL-Line':  dict(family='CEL Line', H=8.0, S=0.92, c=1.25, wf=1.08, sb=0.62, cap=700, space=3.2, kcap=3.6, kf=0.38, kmax=1.6),
}


def specimen(polys, metrics, path, text_rows, scale=0.11):
    # draw text rows using polygons; scale = px per font unit
    lh = int(1000 * scale)
    Wimg = 2400; Himg = lh * len(text_rows) + 40
    im = Image.new('RGB', (Wimg, Himg), (31, 43, 255)); d = ImageDraw.Draw(im)
    for r, txt in enumerate(text_rows):
        x = 20; base = 20 + r * lh + int(850 * scale)
        for ch in txt:
            gname = None
            for n, (chars, fn) in GL.items():
                if ch in chars or ch.upper() in chars: gname = n; break
            if gname is None: x += int(300 * scale); continue
            for c in polys.get(gname, []):
                A = area(c)
                pts = [(x + p[0] * scale, base - p[1] * scale) for p in c]
                d.polygon(pts, fill=(247, 248, 255) if A < 0 else (31, 43, 255))
            x += int(metrics[gname][0] * scale)
    im.save(path)


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else '.'
    os.makedirs(out, exist_ok=True)
    summary = {}
    for name, P in INSTANCES.items():
        path, polys, metrics, kern = build(P, name, out, P['family'])
        summary[name] = {'glyphs': len(polys), 'kern_pairs': len(kern), 'ttf': os.path.getsize(path), 'woff': os.path.getsize(path.replace('.ttf', '.woff'))}
        rows = ['ABCDEFGHIJKLM', 'NOPQRSTUVWXYZ', '0123456789 .,:;-/!?', '()[]+=#%*&@$~<>', 'CELESNICA FEATURED', 'RELEASES 2026 100K+', 'LISTEN & FOLLOW →↗↓←↑▶', 'WAVE KAHTIR MOON VOX']
        specimen(polys, metrics, os.path.join(out, name + '-spec.png'), rows, scale=0.16 if 'Cond' in name else 0.13)
    print(json.dumps(summary, indent=1))
