"""Task 4 | Confidence-interval helpers (analytic Welch and bootstrap)."""
import numpy as np
from scipy import stats


def mean_ci(x, conf=0.95):
    x = np.asarray(x, float)
    se = x.std(ddof=1) / np.sqrt(len(x))
    h = stats.t.ppf(1 - (1 - conf) / 2, len(x) - 1) * se
    return x.mean(), x.mean() - h, x.mean() + h


def welch_diff_ci(a, b, conf=0.95):
    """CI for mean(a) - mean(b) without assuming equal variances."""
    a, b = np.asarray(a, float), np.asarray(b, float)
    va, vb = a.var(ddof=1) / len(a), b.var(ddof=1) / len(b)
    se, dof = np.sqrt(va + vb), (va + vb) ** 2 / (va**2 / (len(a) - 1) + vb**2 / (len(b) - 1))
    d = a.mean() - b.mean()
    t2, t1 = stats.t.ppf(1 - (1 - conf) / 2, dof), stats.t.ppf(conf, dof)
    return {"diff": d, "se": se, "dof": dof, "ci_low": d - t2 * se, "ci_high": d + t2 * se,
            "one_sided_lower": d - t1 * se}


def bootstrap_diff_ci(a, b, n=10_000, conf=0.95, seed=42):
    rng = np.random.default_rng(seed)
    a, b = np.asarray(a, float), np.asarray(b, float)
    diffs = rng.choice(a, (n, len(a))).mean(1) - rng.choice(b, (n, len(b))).mean(1)
    lo, hi = np.percentile(diffs, [(1 - conf) / 2 * 100, (1 + conf) / 2 * 100])
    return {"ci_low": lo, "ci_high": hi, "prob_diff_gt_0": float((diffs > 0).mean())}
