# LinkedIn Video Script (target 8 to 9 minutes)

| Time | Slide | What to say |
|---|---|---|
| 0:00 | 1 | Introduce yourself, ApexPlanet internship, Task 4: turning analysis into a story and validating it statistically. |
| 0:40 | 2 | Business question: where does revenue come from, and is Electronics' advantage over Fashion statistically real? |
| 1:20 | 3-4 | 1,000 orders, 947 customers, 8 cities. Cleaning: 20 missing ages (median), 13 missing cities ("Unknown"), one Order_ID reused 9 times (kept, flagged), totals verified. |
| 2:20 | 5 | KPIs: ₹139.4M revenue, ₹139K average order, Electronics 36% of revenue, only 5% of customers reorder. |
| 3:00 | 6 | Trend: steady around ₹11.5M a month; peak March, dip in Aug-Sep (₹9.2M in September). |
| 3:45 | 7 | Top 20% of customers give 48% of revenue; the bottom 40% give 11%. Retention is the opportunity. |
| 4:30 | 8 | Electronics leads on volume (354 orders, two products). Cities are close; Gaya and Pune trail. |
| 5:15 | 9 | Hypothesis test: H0 equal means, H1 Electronics higher. Welch t = 1.55, p = 0.061, difference +₹16.3K, 95% CI -₹4.3K to +₹36.9K. Fail to reject H0. Explain p-value and CI in plain words; robustness checks agree. |
| 7:00 | 10 | Recommendations: retention programme, Aug-Sep promotions, back Electronics by volume, grow Pune. Impacts are illustrative. |
| 8:00 | 11-12 | Conclusion, limitations (need ~606 orders per category; check price data), thank you, GitHub link. |

**Tip:** Show the notebook `notebooks/hypothesis_testing.ipynb` for about 60 seconds during slide 9 to "demonstrate" the test.
