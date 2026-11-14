#!/usr/bin/env python3
"""Transcribe the drum pattern of a short beat by onset detection (numpy/scipy/soundfile only).

    python3 tools/transcribe-drums.py beat.wav [--bpm-range 110 140]

Splits the audio into a kick band, a mid band (clap / snare) and a high band (hats / shakers), finds the tempo and
grid phase that line the onsets up with a 16th-note grid, folds every bar onto 16 steps, and prints how often each
band hits on each step. Used to get a pattern from a real recording when no notation is published; the audio
itself is never copied into the repo.
"""
import argparse, sys
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfiltfilt, resample_poly, find_peaks

BANDS = {'kick': (30, 130), 'mid': (1200, 5000), 'high': (7000, 16000)}
HOP = 128


def load(path, sr=32000):
    d, rate = sf.read(path)
    m = d.mean(axis=1) if d.ndim > 1 else d
    g = np.gcd(int(rate), sr)
    return resample_poly(m, sr // g, int(rate) // g), sr


def band_env(x, sr, lo, hi):
    sos = butter(4, [lo, min(hi, sr / 2 - 100)], btype='band', fs=sr, output='sos')
    y = np.abs(sosfiltfilt(sos, x))
    n = len(y) // HOP
    env = y[: n * HOP].reshape(n, HOP).max(axis=1)
    sm = np.convolve(env, np.ones(3) / 3, mode='same')
    onset = np.maximum(0, np.diff(np.log1p(60 * sm), prepend=0))
    return onset / (onset.max() + 1e-9)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('path')
    ap.add_argument('--bpm-range', nargs=2, type=float, default=[110, 140])
    a = ap.parse_args()
    x, sr = load(a.path)
    env = {k: band_env(x, sr, *v) for k, v in BANDS.items()}
    allenv = sum(env.values())
    fps = sr / HOP                                     # envelope frames per second

    # Tempo + phase: maximise onset energy on a 16th grid (interpolated).
    best = (-1, None, None)
    t = np.arange(len(allenv)) / fps
    for bpm in np.arange(a.bpm_range[0], a.bpm_range[1], 0.05):
        step = 60.0 / bpm / 4
        for ph in np.arange(0, step, step / 24):
            idx = np.round((np.arange(ph, t[-1], step)) * fps).astype(int)
            idx = idx[idx < len(allenv)]
            sc = allenv[idx].mean()
            if sc > best[0]:
                best = (sc, bpm, ph)
    _, bpm, phase = best
    step = 60.0 / bpm / 4
    n = int((t[-1] - phase) / step)
    grid = (phase + np.arange(n) * step)
    # per-band strength at each 16th (max within +-30% of a step to allow for lag / swing)
    w = max(1, int(0.3 * step * fps))
    S = {}
    for k, e in env.items():
        S[k] = np.array([e[max(0, int(g * fps) - w): int(g * fps) + w + 1].max() if int(g * fps) < len(e) else 0 for g in grid])
    bars = n // 16
    print(f'{a.path}: tempo {bpm:.2f} bpm, {bars} bars of 16 steps, grid phase {phase:.3f}s')

    # Downbeat: the step (0..15) where the kick is strongest on average.
    prof = {k: S[k][: bars * 16].reshape(bars, 16) for k in S}
    kmean = prof['kick'].mean(axis=0)
    rot = int(np.argmax(kmean))
    print(f'bar start rotated by {rot} steps (strongest kick step becomes step 0)')
    for k in ('kick', 'mid', 'high'):
        p = np.roll(prof[k], -rot, axis=1)
        m = p.mean(axis=0); hits = (p > 0.25).mean(axis=0)
        print(f'\n{k:5s} mean strength per step : ' + ' '.join(f'{v:4.2f}' for v in m))
        print(f'{k:5s} hit rate per step      : ' + ' '.join(f'{v:4.2f}' for v in hits))
        print(f'{k:5s} typical pattern (>=50%) : ' + ''.join('x' if h >= 0.5 else ('o' if h >= 0.25 else '.') for h in hits))
    # Phrase level: fold onto 64 steps (4 bars) and show each band's typical phrase, to find where loops restart.
    ph = n // 64
    if ph >= 3:
        print(f'\n4-bar phrase view ({ph} phrases of 64 steps), start taken at the strongest overall step, bars separated by |')
        tot = sum(S[k][: ph * 64].reshape(ph, 64).mean(axis=0) for k in S)
        r64 = int(np.argmax(tot))
        for k in ('kick', 'mid', 'high'):
            q = np.roll(S[k][: ph * 64].reshape(ph, 64), -r64, axis=1)
            hits = (q > 0.25).mean(axis=0)
            line = ''.join('x' if h >= 0.5 else ('o' if h >= 0.25 else '.') for h in hits)
            print(f'  {k:5s} ' + '|'.join(line[i:i + 16] for i in range(0, 64, 16)))
        print(f'  phrase start = grid step {r64} (rotation {r64 % 16} within a bar)')
    # Most common bar per band (as strings), to see variation
    for k in ('kick', 'mid'):
        p = np.roll(prof[k], -rot, axis=1) > 0.25
        strs = [''.join('x' if v else '.' for v in row) for row in p]
        from collections import Counter
        print(f'\nmost common {k} bars:')
        for s, c in Counter(strs).most_common(6): print(f'  {s}  x{c}')


if __name__ == '__main__':
    main()
