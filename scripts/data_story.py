"""Task 4 | Step 1: clean the data, build KPIs, monthly sales and customer segments."""
import json
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw" / "ApexPlanet_DataAnalytics_Dataset.xlsx"
DATA = ROOT / "data"


def load_and_clean() -> pd.DataFrame:
    df = pd.read_excel(RAW)
    df["Order_Date"] = pd.to_datetime(df["Order_Date"])
    for c in ["Customer_ID", "Customer_Name", "Gender", "City", "Product", "Category"]:
        df[c] = df[c].astype("string").str.strip()
    df["Age_Missing"] = df["Age"].isna()
    df["Age"] = df["Age"].fillna(df["Age"].median())          # 20 missing -> median
    df["City"] = df["City"].fillna("Unknown")                  # 13 missing -> 'Unknown'
    df["Order_ID_Reused"] = df["Order_ID"].duplicated(keep=False)  # same ID, different orders
    assert np.isclose(df.Quantity * df.Unit_Price, df.Total_Sales, atol=0.05).all()
    df["Month"] = df.Order_Date.dt.to_period("M").astype(str)
    df["Age_Group"] = pd.cut(df.Age, [17, 25, 35, 45, 55, 65],
                             labels=["18-25", "26-35", "36-45", "46-55", "56-65"]).astype(str)
    return df


def build_outputs(df: pd.DataFrame) -> dict:
    # ---- monthly sales (Jan-2026 holds only 1 day of data -> flagged) ----
    m = df.groupby("Month").agg(Revenue=("Total_Sales", "sum"), Orders=("Order_ID", "size"),
                                Avg_Order_Value=("Total_Sales", "mean")).reset_index()
    m["Complete_Month"] = m.Month != "2026-01"
    m.to_csv(DATA / "monthly_sales.csv", index=False)

    # ---- customer segments by lifetime spend ----
    cust = df.groupby("Customer_ID").agg(Orders=("Order_ID", "size"), Total_Spend=("Total_Sales", "sum"),
                                         Avg_Order=("Total_Sales", "mean"),
                                         Last_Order=("Order_Date", "max")).reset_index()
    p80, p40 = cust.Total_Spend.quantile([0.8, 0.4])
    cust["Segment"] = np.where(cust.Total_Spend >= p80, "High Value",
                               np.where(cust.Total_Spend >= p40, "Mid Value", "Low Value"))
    cust.to_csv(DATA / "customer_segments.csv", index=False)
    seg = cust.groupby("Segment").agg(Customers=("Customer_ID", "size"), Revenue=("Total_Spend", "sum")).reindex(
        ["High Value", "Mid Value", "Low Value"])
    seg["Customer_Share"] = seg.Customers / seg.Customers.sum()
    seg["Revenue_Share"] = seg.Revenue / seg.Revenue.sum()

    cat = df.groupby("Category").agg(Revenue=("Total_Sales", "sum"), Orders=("Order_ID", "size"),
                                     AOV=("Total_Sales", "mean")).sort_values("Revenue", ascending=False)
    city = df[df.City != "Unknown"].groupby("City").agg(Revenue=("Total_Sales", "sum"), Orders=("Order_ID", "size"),
                                                         AOV=("Total_Sales", "mean")).sort_values("Revenue", ascending=False)
    prod = df.groupby("Product").Total_Sales.agg(Revenue="sum", Orders="size", AOV="mean").sort_values("Revenue", ascending=False)
    age = df.groupby("Age_Group").Total_Sales.agg(Revenue="sum", Orders="size", AOV="mean")

    kpis = {
        "Total Revenue": df.Total_Sales.sum(), "Total Orders": len(df),
        "Unique Customers": df.Customer_ID.nunique(), "Average Order Value": df.Total_Sales.mean(),
        "Median Order Value": df.Total_Sales.median(), "Units Sold": int(df.Quantity.sum()),
        "Repeat Customer Rate": (cust.Orders > 1).mean(),
        "Top Category": cat.index[0], "Top Category Revenue Share": cat.Revenue.iloc[0] / cat.Revenue.sum(),
        "Top City": city.index[0], "Top Product": prod.index[0],
        "Peak Month": m[m.Complete_Month].set_index("Month").Revenue.idxmax(),
        "Lowest Month": m[m.Complete_Month].set_index("Month").Revenue.idxmin(),
        "High Value Revenue Share": seg.loc["High Value", "Revenue_Share"],
    }
    pd.Series(kpis, name="Value").rename_axis("KPI").reset_index().to_csv(DATA / "kpi_summary.csv", index=False)

    quality = {"rows": len(df), "missing_age_imputed": int(df.Age_Missing.sum()),
               "missing_city_labelled_unknown": int((df.City == "Unknown").sum()),
               "reused_order_ids": int(df.Order_ID_Reused.sum()), "full_duplicate_rows": int(df.duplicated().sum()),
               "total_equals_qty_x_price": True,
               "date_range": [str(df.Order_Date.min().date()), str(df.Order_Date.max().date())]}
    out = {"kpis": kpis, "quality": quality, "monthly": m.to_dict("records"),
           "category": cat.reset_index().to_dict("records"), "city": city.reset_index().to_dict("records"),
           "product": prod.reset_index().to_dict("records"), "age": age.reset_index().to_dict("records"),
           "segments": seg.reset_index().to_dict("records")}
    (DATA / "results.json").write_text(json.dumps(out, indent=2, default=str))
    return out


if __name__ == "__main__":
    clean = load_and_clean()
    clean.to_csv(DATA / "cleaned_sales_data.csv", index=False)
    res = build_outputs(clean)
    for k, v in res["kpis"].items():
        print(f"{k:28s} {v:,.2f}" if isinstance(v, (int, float, np.floating)) else f"{k:28s} {v}")
    print(res["quality"])
