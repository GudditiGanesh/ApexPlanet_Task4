# ApexPlanet Task 4: Data Storytelling & Statistical Validation

Business story and hypothesis test built on `data/raw/ApexPlanet_DataAnalytics_Dataset.xlsx` (1,000 orders, 2025).

## Headline findings
- **₹139.4M** revenue, 1,000 orders, 947 customers; Electronics is 36% of revenue.
- **Hypothesis test** (Electronics vs Fashion order value, Welch t-test, one-sided): p = **0.061**, difference +₹16.3K (95% CI −₹4.3K to +₹36.9K). **Fail to reject H0** at α = 0.05: Electronics' lead comes from order volume, not larger orders.
- Opportunities: retention (5% repeat rate; top 20% of customers = 48% of revenue), the Aug–Sep dip, and Pune.

## Run it
```bash
pip install -r requirements.txt
python scripts/data_story.py        # cleaning, KPIs, monthly sales, segments -> data/
python scripts/hypothesis_test.py   # test + confidence intervals -> data/results.json
python scripts/visualization.py     # charts -> charts/
python scripts/build_reports.py     # report/*.pdf and Business_Insights.docx
node scripts/build_deck.js          # presentation (needs pptxgenjs)
```

## Structure
`data/` cleaned data, KPIs, monthly sales, segments, `results.json` · `scripts/` pipeline · `notebooks/` executed analysis · `charts/` PNGs · `report/` PDFs and DOCX · `presentation/` deck and LinkedIn video script.

## Assumptions and notes
- Currency assumed to be INR. Segments use lifetime spend (top 20% / middle 40% / bottom 40%).
- Missing Age filled with median; missing City labelled "Unknown"; reused Order_ID `ORD100050` kept (distinct orders) and flagged; 1 Jan 2026 (5 orders) excluded from monthly trend.
- Average unit price is nearly identical across products (even Rice vs Laptop), which is unusual; confirm the price data source.
- Impact estimates in the recommendations are illustrative scenarios, not forecasts.
