"""Task 4 | Step 2: Do Electronics orders have a higher average sales value than Fashion orders?

H0: mean(Electronics) = mean(Fashion)      H1: mean(Electronics) > mean(Fashion)      alpha = 0.05
"""
import json
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats

from confidence_interval import bootstrap_diff_ci, mean_ci, welch_diff_ci

ROOT = Path(__file__).resolve().parents[1]
ALPHA = 0.05


def run() -> dict:
    df = pd.read_csv(ROOT / "data" / "cleaned_sales_data.csv")
    e = df.loc[df.Category == "Electronics", "Total_Sales"].to_numpy()
    f = df.loc[df.Category == "Fashion", "Total_Sales"].to_numpy()

    # assumption checks
    lev = stats.levene(e, f)
    # primary test: Welch t-test (one-sided), robust to unequal variances
    w = stats.ttest_ind(e, f, equal_var=False, alternative="greater")
    # robustness: rank-based and log-scale tests (sales are right-skewed)
    mw = stats.mannwhitneyu(e, f, alternative="greater")
    wl = stats.ttest_ind(np.log(e), np.log(f), equal_var=False, alternative="greater")
    sp = np.sqrt(((len(e) - 1) * e.var(ddof=1) + (len(f) - 1) * f.var(ddof=1)) / (len(e) + len(f) - 2))
    d = (e.mean() - f.mean()) / sp
    n_needed = int(np.ceil(2 * ((stats.norm.ppf(1 - ALPHA) + stats.norm.ppf(0.8)) / d) ** 2))

    ci = welch_diff_ci(e, f)
    boot = bootstrap_diff_ci(e, f)
    # all five categories
    groups = [g.Total_Sales.to_numpy() for _, g in df.groupby("Category")]
    an, kw = stats.f_oneway(*groups), stats.kruskal(*groups)

    res = {
        "alpha": ALPHA, "n_electronics": len(e), "n_fashion": len(f),
        "mean_electronics": e.mean(), "mean_fashion": f.mean(),
        "median_electronics": float(np.median(e)), "median_fashion": float(np.median(f)),
        "mean_ci_electronics": mean_ci(e)[1:], "mean_ci_fashion": mean_ci(f)[1:],
        "skew_electronics": float(stats.skew(e)), "skew_fashion": float(stats.skew(f)),
        "levene_p": lev.pvalue, "welch_t": w.statistic, "welch_df": ci["dof"], "welch_p": w.pvalue,
        "mannwhitney_p": mw.pvalue, "log_welch_p": wl.pvalue, "cohens_d": d,
        "diff": ci["diff"], "diff_pct": ci["diff"] / f.mean(),
        "diff_ci95": [ci["ci_low"], ci["ci_high"]], "diff_lower_one_sided": ci["one_sided_lower"],
        "bootstrap_ci95": [boot["ci_low"], boot["ci_high"]], "bootstrap_prob_gt0": boot["prob_diff_gt_0"],
        "n_per_group_for_80pct_power": n_needed,
        "anova_p": an.pvalue, "anova_F": an.statistic, "kruskal_p": kw.pvalue,
        "decision": "Reject H0" if w.pvalue < ALPHA else "Fail to reject H0",
    }
    res["conclusion"] = (
        "Electronics orders are significantly larger than Fashion orders."
        if w.pvalue < ALPHA else
        "The evidence is not strong enough at the 5% level to say Electronics orders are larger than Fashion orders; "
        "the observed gap is consistent with random variation.")
    return res


if __name__ == "__main__":
    r = run()
    p = ROOT / "data" / "results.json"
    allres = json.loads(p.read_text())
    allres["hypothesis"] = json.loads(json.dumps(r, default=float))
    p.write_text(json.dumps(allres, indent=2, default=str))
    for k, v in r.items():
        print(f"{k:30s} {v}")
