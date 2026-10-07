"""Task 4 | Step 3: publication-quality charts for the business story."""
import json
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from matplotlib.ticker import FuncFormatter

ROOT = Path(__file__).resolve().parents[1]
CH = ROOT / "charts"
NAVY, TEAL, AMBER, CORAL, GREY = "#1F3A5F", "#2A9D8F", "#E9A23B", "#E76F51", "#8D99AE"
plt.rcParams.update({"font.family": "DejaVu Sans", "axes.spines.top": False, "axes.spines.right": False,
                     "axes.titleweight": "bold", "axes.titlesize": 12, "axes.titlelocation": "left"})
inr_m = FuncFormatter(lambda v, _: f"₹{v / 1e6:g}M")

R = json.loads((ROOT / "data" / "results.json").read_text())
monthly = pd.DataFrame(R["monthly"]).query("Complete_Month")
cat, city, seg = (pd.DataFrame(R[k]) for k in ("category", "city", "segments"))
H = R["hypothesis"]


def trend(ax):
    x = pd.to_datetime(monthly.Month).dt.strftime("%b")
    ax.plot(x, monthly.Revenue, marker="o", color=NAVY, lw=2.2)
    ax.axhline(monthly.Revenue.mean(), color=GREY, ls="--", lw=1)
    hi, lo = monthly.Revenue.idxmax(), monthly.Revenue.idxmin()
    for i, c, dy in ((hi, TEAL, 8), (lo, CORAL, -18)):
        ax.annotate(f"₹{monthly.Revenue[i] / 1e6:.1f}M", (x[i], monthly.Revenue[i]), textcoords="offset points",
                    xytext=(0, dy), ha="center", color=c, fontweight="bold")
    ax.set_ylim(monthly.Revenue.min() * 0.9, monthly.Revenue.max() * 1.1)
    ax.yaxis.set_major_formatter(inr_m)
    ax.set_title("Monthly revenue, 2025 (dashed = average)")


def category_revenue(ax):
    ax.bar(cat.Category, cat.Revenue, color=[NAVY] + [GREY] * 4)
    for i, v in enumerate(cat.Revenue):
        ax.text(i, v, f"₹{v / 1e6:.1f}M", ha="center", va="bottom", fontsize=9)
    ax.set_ylim(0, cat.Revenue.max() * 1.1)
    ax.yaxis.set_major_formatter(inr_m)
    ax.set_title("Revenue by category")


def category_aov(ax):
    c = cat.sort_values("AOV", ascending=False)
    ax.bar(c.Category, c.AOV, color=[AMBER if k in ("Electronics", "Fashion") else GREY for k in c.Category])
    for i, v in enumerate(c.AOV):
        ax.text(i, v, f"₹{v / 1e3:.0f}K", ha="center", va="bottom", fontsize=9)
    ax.yaxis.set_major_formatter(FuncFormatter(lambda v, _: f"₹{v / 1e3:.0f}K"))
    ax.set_title("Average order value (the tested pair in amber)")


def cities(ax):
    c = city.sort_values("Revenue")
    ax.barh(c.City, c.Revenue, color=[TEAL if i >= len(c) - 3 else GREY for i in range(len(c))])
    for i, v in enumerate(c.Revenue):
        ax.text(v, i, f" ₹{v / 1e6:.1f}M", va="center", fontsize=9)
    ax.xaxis.set_major_formatter(inr_m)
    ax.set_xlim(0, c.Revenue.max() * 1.15)
    ax.set_title("Revenue by city")


def segments(ax):
    w, x = 0.38, np.arange(len(seg))
    ax.bar(x - w / 2, seg.Customer_Share * 100, w, label="% of customers", color=GREY)
    ax.bar(x + w / 2, seg.Revenue_Share * 100, w, label="% of revenue", color=NAVY)
    for i in range(len(seg)):
        ax.text(i - w / 2, seg.Customer_Share[i] * 100, f"{seg.Customer_Share[i]:.0%}", ha="center", va="bottom", fontsize=9)
        ax.text(i + w / 2, seg.Revenue_Share[i] * 100, f"{seg.Revenue_Share[i]:.0%}", ha="center", va="bottom", fontsize=9)
    ax.set_xticks(x, seg.Segment)
    ax.set_ylabel("%")
    ax.legend(frameon=False)
    ax.set_title("Customer segments: share of customers vs revenue")


def save(fn, name, size):
    fig, ax = plt.subplots(figsize=size)
    fn(ax)
    fig.tight_layout()
    fig.savefig(CH / name, dpi=180)
    plt.close(fig)


def hypothesis_chart():
    df = pd.read_csv(ROOT / "data" / "cleaned_sales_data.csv")
    fig, (a, b) = plt.subplots(1, 2, figsize=(11, 4.2), gridspec_kw={"width_ratios": [1.3, 1]})
    for c, col in (("Electronics", NAVY), ("Fashion", AMBER)):
        a.hist(df.loc[df.Category == c, "Total_Sales"] / 1e3, bins=25, alpha=0.6, color=col, density=True, label=c)
    a.set_xlabel("Order value (₹ thousands)"); a.set_ylabel("Density"); a.legend(frameon=False)
    a.set_title("Order values are right-skewed")
    for i, (c, col, k) in enumerate((("Electronics", NAVY, "electronics"), ("Fashion", AMBER, "fashion"))):
        lo, hi = H[f"mean_ci_{k}"]; m = H[f"mean_{k}"]
        b.errorbar(i, m / 1e3, yerr=[[(m - lo) / 1e3], [(hi - m) / 1e3]], fmt="o", color=col, capsize=8, ms=9, lw=2)
        b.text(i, hi / 1e3 + 3, f"₹{m / 1e3:.1f}K", ha="center", fontweight="bold")
    b.set_xticks([0, 1], ["Electronics", "Fashion"]); b.set_xlim(-0.6, 1.6); b.set_ylim(90, 175)
    b.set_ylabel("Mean order value (₹ thousands)")
    b.set_title(f"Means with 95% CI overlap (p = {H['welch_p']:.3f})")
    fig.tight_layout(); fig.savefig(CH / "hypothesis_test.png", dpi=180); plt.close(fig)


def dashboard():
    k = R["kpis"]
    fig = plt.figure(figsize=(14, 9))
    gs = fig.add_gridspec(3, 4, height_ratios=[0.5, 2, 2], hspace=0.5, wspace=0.35)
    tiles = [("Total revenue", f"₹{k['Total Revenue'] / 1e6:.1f}M"), ("Orders", f"{k['Total Orders']:,}"),
             ("Avg order value", f"₹{k['Average Order Value'] / 1e3:.0f}K"), ("Customers", f"{k['Unique Customers']:,}")]
    for i, (t, v) in enumerate(tiles):
        ax = fig.add_subplot(gs[0, i]); ax.axis("off")
        ax.add_patch(plt.Rectangle((0, 0), 1, 1, color=NAVY, transform=ax.transAxes))
        ax.text(0.5, 0.62, v, color="white", ha="center", va="center", fontsize=20, fontweight="bold")
        ax.text(0.5, 0.2, t, color="#CBD5E1", ha="center", va="center", fontsize=10)
    trend(fig.add_subplot(gs[1, :2])); category_revenue(fig.add_subplot(gs[1, 2:]))
    cities(fig.add_subplot(gs[2, :2])); segments(fig.add_subplot(gs[2, 2:]))
    fig.suptitle("ApexPlanet Sales Dashboard Summary (2025)", fontsize=16, fontweight="bold", x=0.08, ha="left", y=0.97)
    fig.savefig(CH / "dashboard_summary.png", dpi=150, bbox_inches="tight"); plt.close(fig)


if __name__ == "__main__":
    save(trend, "sales_trend.png", (9, 4.2))
    f, (a, b) = plt.subplots(1, 2, figsize=(12, 4.2)); category_revenue(a); category_aov(b)
    f.tight_layout(); f.savefig(CH / "category_sales.png", dpi=180); plt.close(f)
    save(segments, "customer_segments.png", (8, 4.2))
    save(cities, "city_sales.png", (8, 4.2))
    hypothesis_chart(); dashboard()
    print(sorted(p.name for p in CH.glob("*.png")))
