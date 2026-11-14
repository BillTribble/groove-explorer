#!/usr/bin/env python3
"""Machine-learning pass over the rhythm library (scikit-learn).

    python3 py/rhythm_ml.py            # writes js/pattern-groups.js and RHYTHM_ML.md
    python3 py/rhythm_ml.py --png map.png   # also draws the 2D map

Three things are learned from js/rhythms.js:
1. Core line. A classifier scores how much a part looks like a timeline (the line a rhythm is
   recognised by). It is trained on weak labels already in the data: parts named as bells / claves /
   sangban and documented single-line rhythms are positives; steady pulses and copies of the kick
   are negatives. For each ensemble rhythm the highest-scoring part becomes its core line.
2. Pattern groups. Each rhythm becomes a vector describing where its onsets fall (core line, kick,
   and the two heard together), comparable across step counts. Hierarchical clustering groups them.
3. Map. The same vectors are projected to 2D (t-SNE) with each rhythm's nearest neighbours, ready
   for a node map.
"""
import argparse, json, math, subprocess, sys
from pathlib import Path
import numpy as np
from sklearn.cluster import AgglomerativeClustering
from sklearn.linear_model import LogisticRegression
from sklearn.manifold import TSNE
from sklearn.metrics import silhouette_score
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

ROOT = Path(__file__).resolve().parent.parent
BINS = 48                      # common circular grid: exact for 12 and 16 steps, close for the rest
LEVEL = {'X': 1.0, 'x': 0.8, 'o': 0.4}
TIMELINE = ('bell', 'gankogui', 'dawuro', 'nono', 'gongu', 'clave', 'agog', 'cowbell', 'palmas', 'sangban')


# Group label overrides, keyed by a member id (a group containing it takes the label).
LABEL_FOR_MEMBER = {'ethio-anchihoye': 'Tresillo-like (12/8)'}


def fit(p, n):
    return (p or '')[:n].ljust(n, '.')


def onsets(p):
    return [i for i, c in enumerate(p) if c != '.']


def gaps(p):
    o = onsets(p)
    return [(o[k + 1] - o[k]) if k + 1 < len(o) else len(p) - o[k] + o[0] for k in range(len(o))]


def skeleton(p):
    """Where a line mixes accents and ghost notes, the accents carry the shape: ghosts drop out."""
    return p.replace('o', '.') if 'X' in p and 'o' in p else p


def is_pulse(p):
    g = gaps(skeleton(p))
    return len(g) < 2 or all(x == g[0] for x in g)


def is_filler(raw, steps):
    """A steady stream on the 16ths or 8ths (same rule as RX.shape.isFiller in js/shape.js)."""
    o = onsets(raw)
    if len(o) < 4 or len({raw[i] for i in o}) > 1:
        return False
    inner = {o[k + 1] - o[k] for k in range(len(o) - 1)}
    if len(inner) != 1:
        return False
    g = inner.pop()
    return g == 1 or (g == 2 and steps != 12)


def unroll(a, b):
    """Two lines of different lengths, repeated until they realign (capped)."""
    n = min(192, math.lcm(len(a), len(b)))
    return (a * (n // len(a) + 1))[:n], (b * (n // len(b) + 1))[:n]


def flat(p):
    return ''.join('.' if c == '.' else 'x' for c in p)


def hist(p):
    """Smoothed circular onset density on the common grid, accent-weighted."""
    h = np.zeros(BINS)
    n = len(p)
    grid = np.arange(BINS)
    for i in onsets(p):
        d = np.abs(grid - i * BINS / n)
        d = np.minimum(d, BINS - d)
        h += LEVEL.get(p[i], 0.8) * np.exp(-0.5 * (d / 1.0) ** 2)
    return h


def spectrum(p, k=8):
    """Fourier magnitudes of the onset set: describes spacing, unchanged by rotation."""
    p = skeleton(p)
    o = np.array(onsets(p), dtype=float)
    if not len(o):
        return np.zeros(k)
    ph = o / len(p)
    return np.array([abs(np.exp(-2j * math.pi * j * ph).sum()) / len(o) for j in range(1, k + 1)])


def scalars(p):
    p = skeleton(p)
    o, n = onsets(p), len(p)
    if not o:
        return np.zeros(5)
    ph = np.array(o) / n
    on_beat = np.mean(np.isclose((ph * 4) % 1, 0))
    on_eighth = np.mean(np.isclose((ph * 8) % 1, 0))
    g = np.array(gaps(p), dtype=float) / n
    pr = g / g.sum()
    entropy = float(-(pr * np.log(pr)).sum() / math.log(len(g))) if len(g) > 1 else 1.0
    return np.array([len(o) / 4.0, on_beat, on_eighth, entropy, len(set(gaps(p))) / max(1, len(o))])


def line_features(p):
    return np.concatenate([spectrum(p), scalars(p), hist(p) / 2.0])


def rhythm_vector(core, kick):
    comp = ''.join('x' if a != '.' or b != '.' else '.' for a, b in zip(*unroll(core, kick)))
    return np.concatenate([hist(core), 0.6 * hist(kick), 2.0 * spectrum(core), 2.0 * spectrum(comp), 0.5 * scalars(core)])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--png')
    args = ap.parse_args()
    rhythms = json.loads(subprocess.check_output(['node', str(ROOT / 'tools' / 'dump-rhythms.js')]))

    # ── 1. Core-line classifier (weak supervision) ──
    X, y, cand = [], [], []      # cand: (rhythm index, line index, features) for unlabelled shaped parts
    for ri, r in enumerate(rhythms):
        n, kick = r['steps'], flat(fit(r['kick'], r['steps']))
        if not r['topLines']:
            top = r['top']
            if not is_pulse(top) and r['src'] in ('std', 'agr', 'audio'):
                X.append(line_features(top)); y.append(1)
            continue
        for li, l in enumerate(r['topLines']):
            p = l['pattern']
            ok_len = len(p) == n or l.get('loop')
            pf = p
            if is_filler(p, n) or is_pulse(pf) or flat(pf) == kick:
                X.append(line_features(pf)); y.append(0)
                continue
            if not ok_len:
                continue                      # wrong-length parts are neither trusted nor candidates
            f = line_features(pf)
            if any(t in l['name'].lower() for t in TIMELINE):
                X.append(f); y.append(1)
            cand.append((ri, li, f))
    X, y = np.array(X), np.array(y)
    model = make_pipeline(StandardScaler(), LogisticRegression(C=0.3, class_weight='balanced', max_iter=2000))
    auc = cross_val_score(model, X, y, cv=5, scoring='roc_auc').mean()
    model.fit(X, y)
    picks = {}
    for ri, li, f in cand:
        pr = float(model.predict_proba([f])[0, 1])
        if ri not in picks or pr > picks[ri][1]:
            picks[ri] = (li, pr)

    # ── 2. One core pattern per rhythm ──
    rows = []
    for ri, r in enumerate(rhythms):
        n = r['steps']
        if r['core']:
            core, src = fit(r['core'], n), 'authored'
        elif ri in picks:
            core, src = r['topLines'][picks[ri][0]]['pattern'], 'ml'
        else:
            core, src = r['top'], 'top'
        # A rhythm has a pattern when its core line has one, or its kick does (a backbeat over a broken kick).
        shaped = src == 'authored' or not is_pulse(core) or not is_pulse(fit(r['kick'], n))
        # Steady pulses say nothing about the kind of pattern, so they are left out of the vector.
        seen = '.' * n if is_filler(core, n) else core
        rows.append({'r': r, 'core': core, 'src': src, 'shaped': shaped, 'vec': rhythm_vector(seen, fit(r['kick'], n))})
    V = np.array([x['vec'] for x in rows])
    D = np.linalg.norm(V[:, None, :] - V[None, :, :], axis=2)

    # ── 3. Pattern groups: cluster the shaped rhythms; the rest have no pattern to group by ──
    # The vectors describe where hits fall in the cycle and are blind to the grid, so a sparse 12/8 line can look like a
    # thinned tresillo. Triplet feel and straight feel do not mix, so each feel class is clustered on its own:
    # 12 steps = 12/8 (triplet), 8 or 16 steps = straight 4/4, anything else = odd meter.
    feel = lambda i: '12/8' if rows[i]['r']['steps'] == 12 else ('4/4' if rows[i]['r']['steps'] in (8, 16) else 'odd')
    idx = [i for i, x in enumerate(rows) if x['shaped']]
    groups, sils = [], {}
    for fe in ('4/4', '12/8', 'odd'):
        part = [i for i in idx if feel(i) == fe]
        if not part:
            continue
        if len(part) < 3:
            clusters = [[i] for i in part]
        else:
            Dp = D[np.ix_(part, part)]
            lo, hi = max(2, round(len(part) / 12)), min(len(part) - 1, max(3, round(len(part) / 5)))
            best = None
            for kk in range(lo, max(lo, hi) + 1):
                lab = AgglomerativeClustering(n_clusters=kk, metric='precomputed', linkage='average').fit_predict(Dp)
                sc = silhouette_score(Dp, lab, metric='precomputed')
                if best is None or sc > best[0]:
                    best = (sc, lab)
            sils[fe] = (round(float(best[0]), 2), len(part))
            clusters = [[part[j] for j in range(len(part)) if best[1][j] == c] for c in range(max(best[1]) + 1)]
        for members in clusters:
            sub = D[np.ix_(members, members)]
            medoid = members[int(sub.sum(axis=1).argmin())]
            members.sort(key=lambda m: D[medoid, m])
            groups.append({'medoid': medoid, 'members': members, 'feel': fe})
    # Biggest groups first; equal sizes follow the first principal axis of the medoids, so similar groups sit together.
    M = np.array([V[g['medoid']] for g in groups])
    axis = np.linalg.svd(M - M.mean(axis=0), full_matrices=False)[2][0]
    groups.sort(key=lambda g: (-len(g['members']), float(V[g['medoid']] @ axis)))
    for gi, g in enumerate(groups):
        base = rows[g['medoid']]['r']['name'].split(' (')[0].split(' / ')[0]
        full = rows[g['medoid']]['r']['name']
        # A group of several is named after its most central member ('Dembow type'); a lone rhythm keeps its full name.
        g['label'] = (base + ' type' if len(g['members']) > 1 else full) + (' (12/8)' if g['feel'] == '12/8' and '12/8' not in full else '')
        # Hand labels, chosen by a member the group is known for: the sparse 12/8 lines that used to be filed under
        # Tresillo because their hits fall where a thinned tresillo's do.
        for member, label in LABEL_FOR_MEMBER.items():
            if rows[next(i for i, x in enumerate(rows) if x['r']['id'] == member)] and any(rows[m]['r']['id'] == member for m in g['members']):
                g['label'] = label
        g['id'] = 'p%02d' % gi
    seen_labels = {}
    for g in groups:           # two groups can share a medoid's short name (Gqom / Gqom unison phrase): use the full name then
        if g['label'] in seen_labels:
            g['label'] = rows[g['medoid']]['r']['name'] + (' (12/8)' if g['feel'] == '12/8' and '12/8' not in rows[g['medoid']]['r']['name'] else '')
        seen_labels[g['label']] = True
    k = len(groups)
    sil = ', '.join(f'{fe} {v[0]:.2f} over {v[1]}' for fe, v in sils.items())
    shapeless = [i for i, x in enumerate(rows) if not x['shaped']]
    # Rhythms with no pattern are not grouped at all; the report lists them so they can be fixed or removed.

    # ── 4. 2D map and neighbours ──
    xy = TSNE(n_components=2, perplexity=12, init='pca', random_state=0, metric='euclidean').fit_transform(V)
    xy = (xy - xy.min(axis=0)) / (xy.max(axis=0) - xy.min(axis=0))
    scale = np.median(D[D > 0])
    near = {}
    for i, x in enumerate(rows):
        order = [j for j in np.argsort(D[i]) if j != i][:4]
        near[x['r']['id']] = [[rows[j]['r']['id'], round(float(math.exp(-D[i, j] / scale)), 3)] for j in order]

    ids = lambda ms: [rows[m]['r']['id'] for m in ms]
    js = ['// Generated by py/rhythm_ml.py (scikit-learn). Do not edit; rerun after changing js/rhythms.js.',
          'window.RX = window.RX || {};',
          '// Pattern groups for the grouped view: [id, label, member ids], members nearest the group\'s centre first.',
          'RX.PATTERN_GROUPS = ' + json.dumps([[g['id'], g['label'], ids(g['members'])] for g in groups], ensure_ascii=False) + ';',
          '// Core line picked by the classifier for ensemble rhythms: rhythm id -> index into topLines.',
          'RX.ML_CORE = ' + json.dumps({rhythms[ri]['id']: li for ri, (li, _) in sorted(picks.items()) if not rhythms[ri]['core']}) + ';',
          '// 2D position of every rhythm in pattern space (0..1), for a node map.',
          'RX.PATTERN_MAP = ' + json.dumps({x['r']['id']: [round(float(a), 4), round(float(b), 4)] for x, (a, b) in zip(rows, xy)}) + ';',
          '// Four nearest rhythms by pattern, with similarity 0..1: the links of the node map.',
          'RX.PATTERN_NEAR = ' + json.dumps(near) + ';', '']
    (ROOT / 'js' / 'pattern-groups.js').write_text('\n'.join(js))

    # ── Report ──
    out = ['# Rhythm ML report', '', 'Generated by `python3 py/rhythm_ml.py`.', '',
           '## Core-line classifier', '',
           f'- Training parts: {int(y.sum())} timeline examples, {int((1 - y).sum())} pulse / kick-copy examples.',
           f'- Cross-validated ROC AUC: {auc:.3f}. The two classes are easy to separate, so this number says the model has learned "not a steady pulse"; it does not prove it ranks two shaped parts correctly.',
           f'- Ensemble rhythms with at least one shaped part to choose from: {len(picks)}.', '',
           '| Rhythm | ML pick | Score | Rules picked |', '|:--|:--|--:|:--|']
    for ri, (li, pr) in sorted(picks.items()):
        r = rhythms[ri]
        if r['core']:
            continue
        l = r['topLines'][li]
        rule = r['ruleCore']
        same = flat(rule['pattern']) == flat(l['pattern'])
        out.append(f"| {r['name']} | {l['name']} `{l['pattern']}` | {pr:.2f} | {'same' if same else (rule['name'] or 'top line') + ' `' + rule['pattern'] + '`'} |")
    out += ['', '## Pattern groups', '', f'{k} groups from {len(idx)} rhythms with a pattern, clustered separately by feel (silhouette: {sil}); {len(shapeless)} rhythms have only even pulses in their data.', '']
    if shapeless:
        out += ['### No pattern (not grouped)', ''] + [f"- {rows[m]['r']['name']}" for m in shapeless] + ['']
    for g in groups:
        out.append(f"### {g['label']} ({len(g['members'])})")
        out.append('')
        for m in g['members']:
            out.append(f"- {rows[m]['r']['name']} — `{rows[m]['core']}` over kick `{fit(rows[m]['r']['kick'], rows[m]['r']['steps'])}`")
        out.append('')
    (ROOT / 'RHYTHM_ML.md').write_text('\n'.join(out))
    print(f'core AUC {auc:.3f}; {k} groups (silhouette {sil}) from {len(idx)} shaped rhythms, {len(shapeless)} shapeless; wrote js/pattern-groups.js, RHYTHM_ML.md')

    if args.png:
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
        fig, ax = plt.subplots(figsize=(15, 11))
        cmap = plt.get_cmap('tab20')
        gi_of = {m: gi for gi, g in enumerate(groups) for m in g['members']}
        for i, x in enumerate(rows):
            for j_id, s in near[x['r']['id']][:2]:
                j = next(q for q, z in enumerate(rows) if z['r']['id'] == j_id)
                ax.plot([xy[i, 0], xy[j, 0]], [xy[i, 1], xy[j, 1]], color='#bbb', lw=0.5, zorder=1)
        for i, x in enumerate(rows):
            c = '#999' if not x['shaped'] else cmap(gi_of[i] % 20)
            ax.scatter(*xy[i], color=c, s=40, zorder=2)
            ax.annotate(x['r']['name'].split(' (')[0], xy[i], fontsize=6, xytext=(3, 3), textcoords='offset points')
        ax.set_axis_off()
        fig.savefig(args.png, dpi=110, bbox_inches='tight')


if __name__ == '__main__':
    main()
