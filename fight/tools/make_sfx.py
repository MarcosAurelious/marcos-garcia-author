"""Synthesize Roman Arena's sound effects into fight/sfx/*.mp3 (44.1 kHz mono; needs ffmpeg).
Every clip is built from layers: a sharp attack transient, a body (pitched thump, ring or roar),
texture (filtered noise, crackle, sizzle) and a short room tail, then loudness-matched.
Usage (from the repo root):  python fight/tools/make_sfx.py  [name ...]"""
import os, sys
import numpy as np
from scipy import signal
import wave

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), '..', 'sfx')
rng = np.random.default_rng(7)

# ---------------- building blocks ----------------
def T(d): return np.arange(int(SR * d)) / SR
def silence(d): return np.zeros(int(SR * d))
def noise(d): return rng.uniform(-1, 1, int(SR * d))
def env_exp(d, tau, attack=0.002):
    t = T(d); a = np.clip(t / max(attack, 1e-4), 0, 1); return a * np.exp(-t / tau)
def env_bell(d, peak=0.4, sharp=2.0):
    t = T(d) / d; return np.where(t < peak, (t / peak) ** sharp, ((1 - t) / (1 - peak)) ** sharp)
def sweep(f0, f1, d, wave='sine', curve='exp'):
    t = T(d); x = t / d
    f = f0 * (f1 / f0) ** x if curve == 'exp' else f0 + (f1 - f0) * x
    ph = 2 * np.pi * np.cumsum(f) / SR
    if wave == 'sine': return np.sin(ph)
    if wave == 'saw': return 2 * ((ph / (2 * np.pi)) % 1) - 1
    if wave == 'square': return np.sign(np.sin(ph))
    if wave == 'tri': return 2 * np.abs(2 * ((ph / (2 * np.pi)) % 1) - 1) - 1
def filt(x, kind, f, order=2):
    if kind == 'band': sos = signal.butter(order, [max(20, f[0]), min(SR / 2 - 100, f[1])], 'bandpass', fs=SR, output='sos')
    else: sos = signal.butter(order, min(SR / 2 - 100, f), kind, fs=SR, output='sos')
    return signal.sosfilt(sos, x)
def moving_band(x, centers, q=1.5, chunk=256):
    """band-pass whose centre glides along `centers` (sampled per chunk): whooshes, sweeps"""
    out = np.zeros_like(x); n = len(x); zi = None; c = np.interp(np.arange(0, n, chunk), np.linspace(0, n, len(centers)), centers)
    for k, i in enumerate(range(0, n, chunk)):
        fc = c[k]; bw = fc / q; sos = signal.butter(2, [max(30, fc - bw / 2), min(SR / 2 - 200, fc + bw / 2)], 'bandpass', fs=SR, output='sos')
        if zi is None: zi = np.zeros((sos.shape[0], 2))
        out[i:i + chunk], zi = signal.sosfilt(sos, x[i:i + chunk], zi=zi)
    return out
def ring(base, ratios, d, decays, amps=None):
    """struck metal: inharmonic partials, each with its own decay"""
    t = T(d); amps = amps or [1 / (1 + i * 0.6) for i in range(len(ratios))]; y = np.zeros_like(t)
    for r, dec, a in zip(ratios, decays, amps): y += a * np.sin(2 * np.pi * base * r * t + rng.uniform(0, 6.28)) * np.exp(-t / dec)
    return y
def pluck(f, d, damp=0.996):
    """Karplus-Strong string (bowstring twang)"""
    n = int(SR / f); buf = rng.uniform(-1, 1, n); out = np.zeros(int(SR * d))
    for i in range(len(out)):
        out[i] = buf[i % n]; buf[i % n] = damp * 0.5 * (buf[i % n] + buf[(i + 1) % n])
    return out
def crackle(d, rate, dur=0.004, hp=2500):
    """random sparks / snaps / debris"""
    y = silence(d); k = int(rate * d)
    for _ in range(k):
        p = rng.integers(0, max(1, len(y) - int(SR * dur * 3))); L = int(SR * dur * rng.uniform(0.5, 2))
        y[p:p + L] += rng.uniform(0.3, 1) * rng.uniform(-1, 1, L) * np.exp(-np.arange(L) / (L / 4))
    return filt(y, 'high', hp)
def drive(x, k=2.0): return np.tanh(k * x) / np.tanh(k)
def reverb(x, size=1.2, mix=0.25, damp=3000):
    ir = noise(size) * np.exp(-T(size) / (size / 5)); ir = filt(ir, 'low', damp); ir /= np.sqrt((ir ** 2).sum())
    wet = signal.fftconvolve(x, ir)[:len(x) + int(SR * size * 0.6)]
    dry = np.concatenate([x, np.zeros(len(wet) - len(x))])
    return dry + mix * wet * 3
def at(total, *parts):
    """mix (start_time, clip, gain) parts into one buffer"""
    y = silence(total)
    for t0, clip, g in parts:
        i = int(SR * t0); L = min(len(clip), len(y) - i)
        if L > 0: y[i:i + L] += g * clip[:L]
    return y
def finish(x, rms=0.2, fade=0.01):
    x = x - np.mean(x); x = x / (np.sqrt(np.mean(x[np.abs(x) > 1e-4] ** 2)) + 1e-9) * rms
    x = drive(x * 1.1, 1.3); pk = np.abs(x).max()
    if pk > 0.97: x *= 0.97 / pk
    sm = np.sqrt(signal.convolve(x ** 2, np.ones(441) / 441, 'same'))     # trim the reverb tail once it drops ~40 dB below the peak
    nz = np.where(sm > 0.01)[0]; x = x[:nz[-1] + int(SR * 0.05)] if len(nz) else x
    n = min(len(x) // 3, int(SR * 0.08)); x[-n:] *= np.linspace(1, 0, n) ** 2; return x

# ---------------- reusable layers ----------------
def click(d=0.006, hp=3000): return filt(noise(d), 'high', hp) * env_exp(d, d / 3, 0.0003)
def thump(f0, f1, d, tau): return sweep(f0, f1, d) * env_exp(d, tau, 0.001)
def whoosh(d, f0, fpk, f1, peak=0.45, q=1.4): return moving_band(noise(d), [f0, fpk, f1], q) * env_bell(d, peak, 1.6)
def roar(d, lo=200, hi=1500, rate=14, depth=0.5):
    t = T(d); am = 1 - depth + depth * (0.5 + 0.5 * np.sin(2 * np.pi * rate * t + 3 * np.sin(2 * np.pi * 3.1 * t)))
    return filt(noise(d), 'band', (lo, hi)) * am
def growl(f, d, rough=30):
    t = T(d); fm = f * (1 + 0.04 * np.sin(2 * np.pi * 5 * t)); ph = 2 * np.pi * np.cumsum(fm) / SR
    raw = sum(np.sin(k * ph) / k for k in range(1, 14)) * (0.6 + 0.4 * np.sin(2 * np.pi * rough * t))
    return filt(filt(drive(raw, 2.5), 'band', (300, 900), 1) * 1.5 + filt(raw, 'low', 400), 'low', 2400)
def thunder(d, dist=0.0):
    crack = filt(noise(0.06), 'high', 900) * env_exp(0.06, 0.015, 0.0005)
    t = T(d); rum = filt(noise(d), 'low', 260) * (0.4 + 0.6 * np.abs(filt(noise(d), 'low', 6)) * 8).clip(0, 1.5) * np.exp(-t / (d / 3.5))
    return at(d + dist, (0, crack, 1.0), (dist + 0.02, rum, 2.2), (dist, thump(70, 30, 0.7, 0.25), 0.6))
def sizzle(d, hp=4000): return filt(noise(d), 'high', hp) * (0.3 + 0.7 * (rng.random(int(SR * d)) > 0.7)) * env_bell(d, 0.2, 1)
def electric(d, f=110):
    t = T(d); s = sweep(f, f * 0.9, d, 'saw') * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 37 * t)))
    return filt(drive(s, 3), 'band', (300, 5000)) * env_exp(d, d / 2.5, 0.005)
def shimmer(root, d, ratios=(1, 1.5, 2, 2.5, 3, 4), stagger=0.05):
    t = T(d); y = np.zeros_like(t)
    for i, r in enumerate(ratios):
        e = np.clip((t - i * stagger) / 0.03, 0, 1) * np.exp(-np.clip(t - i * stagger, 0, None) / (d / 2.5))
        y += e * (np.sin(2 * np.pi * root * r * t) + 0.5 * np.sin(2 * np.pi * root * r * 1.004 * t)) / (1 + i * 0.3)
    return y
def splash(d, lo=500, hi=7000):
    return filt(noise(d), 'band', (lo, hi)) * env_exp(d, d / 3, 0.01) * (0.6 + 0.4 * rng.random(int(SR * d)))
def debris(d, rate=40): return filt(crackle(d, rate, 0.006, 300), 'low', 3500)

# ---------------- the sounds ----------------
S = {}
def snd(name):
    def deco(fn): S[name] = fn; return fn
    return deco

@snd('light_punch')
def _(): return finish(at(0.2, (0, click(0.005, 2500), 0.9), (0, thump(190, 75, 0.12, 0.035), 1.1),
                            (0.002, filt(noise(0.05), 'band', (900, 3200)) * env_exp(0.05, 0.012), 0.8)), 0.2)
@snd('heavy_punch')
def _(): return finish(reverb(at(0.4, (0, click(0.007, 2000), 1), (0, drive(thump(140, 42, 0.32, 0.09), 1.8), 1.4), (0, thump(60, 35, 0.3, 0.12), 0.7),
                                  (0.003, filt(noise(0.12), 'band', (500, 2200)) * env_exp(0.12, 0.03), 0.9)), 0.6, 0.12), 0.21)
@snd('armor_hit')
def _(): return finish(reverb(at(0.6, (0, click(0.004, 4000), 0.8), (0, thump(160, 70, 0.15, 0.04), 0.7),
                                  (0, ring(420, [1, 2.76, 5.4, 8.93, 11.3], 0.55, [0.25, 0.18, 0.12, 0.07, 0.05]), 0.6)), 0.7, 0.2), 0.18)
@snd('sword_swish')
def _(): return finish(at(0.3, (0, whoosh(0.26, 500, 4200, 1400, 0.5, 2.2), 1), (0.05, whoosh(0.18, 2000, 7000, 3000, 0.4, 3), 0.4)), 0.2)
@snd('sword_clash')
def _(): return finish(reverb(at(0.8, (0, click(0.003, 5000), 1), (0, ring(1150, [1, 1.47, 2.09, 2.81, 3.91], 0.75, [0.4, 0.3, 0.2, 0.12, 0.08]), 0.7),
                                  (0, ring(1173, [1, 2.09], 0.6, [0.35, 0.2]), 0.4), (0.002, filt(noise(0.14), 'high', 4000) * env_exp(0.14, 0.03), 0.6)), 0.9, 0.25, 6000), 0.15)
@snd('shield_block')
def _(): return finish(reverb(at(0.5, (0, click(0.005, 1500), 1), (0, thump(170, 90, 0.18, 0.05), 1.2), (0, ring(640, [1, 1.71, 2.53], 0.4, [0.12, 0.09, 0.06]), 0.5),
                                  (0, filt(noise(0.08), 'band', (400, 1800)) * env_exp(0.08, 0.02), 0.8)), 0.6, 0.15), 0.2)
@snd('ground_slam')
def _(): return finish(reverb(at(1.0, (0, click(0.01, 800), 1), (0, drive(thump(110, 28, 0.9, 0.3), 2), 1.6),
                                  (0, filt(noise(0.9), 'low', 500) * env_exp(0.9, 0.25, 0.005), 1.3), (0.03, debris(0.6, 60), 0.7)), 1.4, 0.25, 1800), 0.22)
@snd('jump')
def _(): return finish(at(0.22, (0, whoosh(0.2, 300, 1800, 2600, 0.3, 1.6), 1), (0, filt(noise(0.03), 'band', (150, 700)) * env_exp(0.03, 0.01), 0.6)), 0.17)
@snd('flip_whoosh')
def _(): return finish(at(0.45, (0, whoosh(0.22, 400, 2600, 900, 0.5, 1.8), 1), (0.17, whoosh(0.26, 350, 2200, 700, 0.45, 1.8), 0.85)), 0.19)
@snd('dash')
def _(): return finish(at(0.3, (0, whoosh(0.24, 2500, 1200, 300, 0.25, 1.4), 1), (0, filt(noise(0.04), 'band', (100, 500)) * env_exp(0.04, 0.012), 0.6)), 0.2)
@snd('landing')
def _(): return finish(at(0.3, (0, thump(110, 50, 0.16, 0.04), 1.2), (0, filt(noise(0.2), 'band', (200, 2500)) * env_exp(0.2, 0.04), 0.7), (0.01, debris(0.18, 50), 0.4)), 0.18)
@snd('menu_select')
def _():   # a bronze coin dropped on stone: two quick clinks
    c = lambda f: at(0.35, (0, click(0.002, 6000), 0.5), (0, ring(f, [1, 2.4, 3.9], 0.35, [0.12, 0.07, 0.04]), 1))
    return finish(reverb(at(0.4, (0, c(1980), 1), (0.07, c(2640), 0.8)), 0.5, 0.2, 7000), 0.16)
def brass(f, d, vib=5.5, bright=2800, att=0.04):
    t = T(d); fm = f * (1 + 0.006 * np.sin(2 * np.pi * vib * t) * np.clip(t / 0.2, 0, 1)) * (1 - 0.03 * np.exp(-t / 0.03))
    ph = 2 * np.pi * np.cumsum(fm) / SR; raw = sum(np.sin(k * ph) / k ** 0.9 for k in range(1, 16))
    e = np.clip(t / att, 0, 1) * np.clip((d - t) / 0.08, 0, 1)
    return filt(drive(raw, 1.5), 'low', bright) * e
@snd('round_start')
def _():   # a Roman cornu: a short rising horn call over a war drum
    horn = at(0.95, (0, brass(147, 0.22, bright=1600), 0.8), (0.2, brass(220, 0.7, bright=2600), 1))
    drum = at(0.5, (0, thump(90, 45, 0.5, 0.15), 1.4), (0, filt(noise(0.3), 'low', 900) * env_exp(0.3, 0.06), 1))
    return finish(reverb(at(1.0, (0, horn, 1), (0, drum, 0.9), (0.2, drum, 0.7)), 1.6, 0.3, 4000), 0.2)
@snd('victory_stinger')
def _():   # a fanfare in D: three pickup notes into a held major chord, with a cymbal swell
    n = lambda f, d: brass(f, d, bright=3200)
    chord = n(293.7, 0.8) + 0.8 * n(370, 0.8) + 0.7 * n(440, 0.8) + 0.5 * n(587.3, 0.8)
    cym = filt(noise(0.9), 'high', 5000) * env_exp(0.9, 0.35, 0.02)
    return finish(reverb(at(1.4, (0, n(293.7, 0.14), 1), (0.14, n(370, 0.14), 1), (0.28, n(440, 0.14), 1), (0.42, chord, 0.8), (0.42, cym, 0.25),
                             (0.42, thump(100, 50, 0.3, 0.1), 0.8)), 1.8, 0.3, 4500), 0.2)

# --- each legend's special ---
@snd('marcus_lightning_wave')
def _(): return finish(reverb(at(1.0, (0, electric(0.35, 95), 0.7), (0.25, filt(noise(0.05), 'high', 1500) * env_exp(0.05, 0.01, 0.0003), 1.4),
                                  (0.25, crackle(0.5, 90), 1), (0.27, thunder(0.7), 0.9), (0.25, whoosh(0.4, 3000, 1500, 500, 0.15, 1.5), 0.6)), 1.4, 0.25), 0.21)
@snd('mars_crimson_cleave')
def _(): return finish(reverb(at(0.9, (0, whoosh(0.3, 300, 2400, 600, 0.75, 1.6), 1), (0.22, roar(0.55, 150, 1400, 18), 0.9), (0.25, ring(700, [1, 2.2, 3.4], 0.5, [0.3, 0.2, 0.1]), 0.4),
                                  (0.25, drive(thump(120, 40, 0.4, 0.12), 2), 1.2), (0.26, crackle(0.5, 40, 0.01, 1000), 0.5)), 1.2, 0.2), 0.22)
@snd('colossus_thunder_fist')
def _(): return finish(reverb(at(1.2, (0, electric(0.25, 80), 0.5), (0.2, thunder(0.9), 1.3), (0.2, drive(thump(100, 30, 0.6, 0.2), 2.5), 1.5), (0.22, debris(0.5, 40), 0.5)), 1.8, 0.25, 2200), 0.23)
@snd('medusa_hex_sigil')
def _():
    hiss = filt(noise(0.5), 'band', (3000, 9000)) * env_bell(0.5, 0.3, 1.5)   # the snakes
    rise = sweep(220, 880, 0.6, 'tri') * env_bell(0.6, 0.85, 1.5)
    stone = at(0.4, (0, filt(crackle(0.4, 70, 0.012, 200), 'low', 2500), 1), (0, thump(90, 50, 0.3, 0.08), 1))
    return finish(reverb(at(1.1, (0, hiss, 0.6), (0, rise, 0.4), (0.15, shimmer(311, 0.8, (1, 1.19, 1.5, 1.78, 2.38)), 0.6), (0.65, stone, 0.9)), 1.6, 0.35, 5000), 0.2)
@snd('minotaur_gore_charge')
def _():
    hoof = at(0.08, (0, thump(130, 60, 0.08, 0.025), 1), (0, filt(noise(0.04), 'band', (300, 1500)) * env_exp(0.04, 0.01), 0.4))
    hooves = at(0.6, *[(i * 0.11, hoof, 1) for i in range(5)])
    return finish(reverb(at(1.1, (0, growl(85, 0.6), 1), (0.15, hooves, 0.8), (0.7, drive(thump(120, 35, 0.35, 0.1), 2.5), 1.4), (0.7, debris(0.35, 50), 0.6)), 1.2, 0.2, 2500), 0.22)
@snd('vulcan_magma_hammer')
def _():
    bubbles = at(0.5, *[(rng.uniform(0, 0.45), sweep(rng.uniform(250, 500), rng.uniform(600, 1100), 0.03) * env_exp(0.03, 0.01), 0.4) for _ in range(14)])
    return finish(reverb(at(1.1, (0, whoosh(0.2, 300, 1500, 500, 0.8, 1.5), 0.6), (0.18, ring(330, [1, 2.76, 5.4, 8.93], 0.8, [0.6, 0.35, 0.2, 0.1]), 0.7),
                             (0.18, drive(thump(110, 32, 0.6, 0.2), 2.5), 1.4), (0.2, roar(0.7, 100, 900, 10, 0.4), 0.8), (0.3, bubbles, 0.6), (0.3, sizzle(0.6, 5000), 0.3)), 1.4, 0.2, 2500), 0.22)
@snd('chiron_star_arrow')
def _():
    twang = filt(pluck(140, 0.4, 0.993), 'band', (100, 3000)) * env_exp(0.4, 0.12)
    return finish(reverb(at(0.9, (0, twang, 1), (0.02, whoosh(0.3, 3500, 1800, 900, 0.15, 2), 0.7), (0.05, shimmer(1046, 0.6, (1, 1.25, 1.5, 2)), 0.35)), 1.4, 0.3, 7000), 0.2)
@snd('diana_emerald_arrow')
def _():
    twang = filt(pluck(165, 0.35, 0.992), 'band', (100, 3500)) * env_exp(0.35, 0.1)
    leaves = filt(crackle(0.4, 80, 0.008, 1500), 'band', (1500, 6000))
    return finish(reverb(at(0.8, (0, twang, 1), (0.02, whoosh(0.28, 900, 4000, 2200, 0.35, 2.2), 0.8), (0.1, leaves, 0.5), (0.3, thump(120, 60, 0.15, 0.04), 0.7)), 1.0, 0.25, 6000), 0.21)
@snd('cerberus_hellfire_pounce')
def _():
    snarl = sum(growl(f, 0.55, r) for f, r in [(110, 27), (131, 33), (98, 23)]) / 2
    return finish(reverb(at(1.1, (0, snarl, 1), (0.35, roar(0.7, 180, 2200, 16), 1), (0.35, whoosh(0.5, 300, 2000, 400, 0.3, 1.3), 0.6),
                             (0.8, drive(thump(110, 40, 0.3, 0.09), 2), 1.1), (0.8, debris(0.3, 50), 0.5)), 1.2, 0.2, 3000), 0.22)
@snd('pegasus_heavenfall_strike')
def _():
    flap = lambda: filt(noise(0.12), 'band', (150, 1200)) * env_bell(0.12, 0.3, 1.5)
    return finish(reverb(at(1.1, (0, flap(), 1), (0.16, flap(), 1), (0.3, sweep(400, 3200, 0.3, 'saw') * env_bell(0.3, 0.8), 0.25), (0.3, whoosh(0.35, 600, 3500, 1200, 0.7, 1.5), 0.8),
                             (0.62, electric(0.25, 160), 0.6), (0.62, drive(thump(130, 40, 0.4, 0.12), 2), 1.3), (0.63, crackle(0.35, 80), 0.6), (0.64, debris(0.3, 40), 0.5)), 1.4, 0.25), 0.22)
@snd('helios_supernova_beam')
def _():
    t = T(0.9); charge = sweep(150, 1400, 0.5) * env_bell(0.5, 0.95, 2)
    beam = (sweep(110, 105, 0.9, 'saw') + sweep(110.8, 106, 0.9, 'saw') + 0.5 * sweep(220.5, 211, 0.9, 'saw')) * (0.75 + 0.25 * np.sin(2 * np.pi * 9 * t))
    beam = filt(beam, 'band', (200, 4000)) * np.clip(t / 0.02, 0, 1) * np.clip((0.9 - t) / 0.3, 0, 1)
    return finish(reverb(at(1.5, (0, charge, 0.5), (0, shimmer(880, 0.5, (1, 1.5, 2)), 0.2), (0.48, filt(noise(0.05), 'high', 2000) * env_exp(0.05, 0.012), 1.2),
                             (0.5, beam, 0.9), (0.5, sizzle(0.9, 6000), 0.35), (0.5, thump(90, 45, 0.4, 0.15), 0.8)), 1.2, 0.2), 0.21)
@snd('neptune_tsunami_surge')
def _():
    t = T(1.3); swell = filt(noise(1.3), 'low', 700) * np.clip(t / 0.5, 0, 1) ** 2 * np.exp(-np.clip(t - 0.5, 0, None) / 0.35)
    crash = filt(noise(0.9), 'band', (300, 6000)) * env_exp(0.9, 0.3, 0.02) * (0.7 + 0.3 * rng.random(int(SR * 0.9)))
    return finish(reverb(at(1.5, (0, swell, 1.2), (0, thump(55, 35, 1.0, 0.4), 0.6), (0.45, crash, 1), (0.47, splash(0.6, 2000, 9000), 0.5), (0.5, thump(90, 40, 0.4, 0.15), 0.8)), 1.6, 0.3, 3500), 0.21)
@snd('hades_void_seal')
def _():
    t = T(1.2); drone = sum(sweep(f, f * 0.94, 1.2, 'saw') for f in (55, 55.6, 82.5)) * np.clip(t / 0.4, 0, 1) * np.clip((1.2 - t) / 0.4, 0, 1)
    drone = filt(drone, 'low', 700)
    voice = filt(sweep(196, 185, 1.0, 'saw'), 'band', (500, 900), 2) * env_bell(1.0, 0.5, 1.5)   # a low ghostly 'oh'
    rev = (filt(noise(0.5), 'band', (400, 4000)) * np.linspace(0, 1, int(SR * 0.5)) ** 3)          # reversed swell into the slam
    return finish(reverb(at(1.4, (0, drone, 0.8), (0.1, voice, 0.4), (0.15, rev, 0.8), (0.65, drive(thump(110, 35, 0.45, 0.14), 2), 1.3),
                             (0.65, splash(0.55, 800, 7000), 0.7), (0.66, shimmer(147, 0.6, (1, 1.19, 1.41)), 0.25)), 1.8, 0.35, 3000), 0.21)

def write(name, x):
    os.makedirs(OUT, exist_ok=True); tmp = os.path.join(OUT, name + '.tmp.wav')
    with wave.open(tmp, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())
    import subprocess
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-c:a', 'libmp3lame', '-b:a', '112k', os.path.join(OUT, name + '.mp3')], check=True)
    os.remove(tmp)

if __name__ == '__main__':
    for name in (sys.argv[1:] or S):
        x = S[name](); write(name, x); print(f'{name:28s} {len(x) / SR:.2f}s')
