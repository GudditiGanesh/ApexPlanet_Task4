// Builds presentation/Task4_Business_Story.pptx from data/results.json  (run: node scripts/build_deck.js)
const path = require("path");
const fs = require("fs");
const pptxgen = require("pptxgenjs");

const applyTheme = async (pptxFilePath, theme) => {
  // The original helper lived at a Linux-only path that does not exist on Windows.
  // This deck already sets its theme directly with pres.theme and slide masters,
  // so a no-op fallback keeps the script cross-platform without breaking generation.
  return pptxFilePath;
};

const ROOT = path.join(__dirname, "..");
const R = JSON.parse(fs.readFileSync(path.join(ROOT, "data/results.json")));
const K = R.kpis, H = R.hypothesis;
const M = (v, d = 1) => "₹" + (v / 1e6).toFixed(d) + "M";
const Kf = (v) => (v < 0 ? "−" : "") + "₹" + (Math.abs(v) / 1e3).toFixed(1) + "K";
const pct = (v, d = 0) => (v * 100).toFixed(d) + "%";

const THEME = {
  name: "ApexPlanet Story", headFontFace: "Georgia", bodyFontFace: "Calibri",
  colors: { dk1: "1B2430", lt1: "FFFFFF", dk2: "1F3A5F", lt2: "F3F5F8", accent1: "1F3A5F", accent2: "2A9D8F",
    accent3: "E9A23B", accent4: "E76F51", accent5: "8D99AE", accent6: "5B7DB1", hlink: "2A9D8F", folHlink: "8D99AE" },
};
const HEX = { navy: "1F3A5F", teal: "2A9D8F", amber: "E9A23B", coral: "E76F51", grey: "8D99AE" };

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "ApexPlanet Task 4 - Data Storytelling & Statistical Validation";
const C = pres.SchemeColor;

pres.defineSlideMaster({
  title: "DARK", background: { color: "1F3A5F" },
  objects: [{ rect: { x: 0.7, y: 3.0, w: 1.2, h: 0.06, fill: { color: C.accent3 } } }],
  slideNumber: undefined,
  placeholders: [
    { placeholder: { options: { name: "title", type: "title", x: 0.7, y: 1.3, w: 8.6, h: 1.5, fontSize: 36, bold: true, color: C.background1, valign: "bottom", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: 0.7, y: 3.25, w: 8.6, h: 1.2, fontSize: 16, color: C.background2, margin: 0 }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "CONTENT", background: { color: "FFFFFF" },
  objects: [{ text: { text: "ApexPlanet Internship  |  Task 4: Data Storytelling & Statistical Validation", options: { x: 0.5, y: 5.2, w: 6, h: 0.25, fontSize: 9, color: "8D99AE", margin: 0 } } }],
  slideNumber: { x: 9.0, y: 5.2, w: 0.5, h: 0.25, fontSize: 9, color: "8D99AE" },
  placeholders: [{ placeholder: { options: { name: "title", type: "title", x: 0.5, y: 0.3, w: 9, h: 0.7, fontSize: 26, bold: true, color: C.text2, valign: "middle", margin: 0 }, text: "" } }],
});

const card = (s, x, y, w, h, big, label, color, name) => {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: name + " card" });
  s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.08, h, fill: { color }, line: { color }, objectName: name + " accent" });
  s.addText(big, { x: x + 0.25, y: y + 0.08, w: w - 0.35, h: h * 0.55, fontSize: 24, bold: true, color: C.text2, valign: "middle", margin: 0, isTextBox: true, objectName: name + " value" });
  s.addText(label, { x: x + 0.25, y: y + h * 0.6, w: w - 0.35, h: h * 0.35, fontSize: 12, color: C.text1, valign: "top", margin: 0, isTextBox: true, objectName: name + " label" });
};
const bullets = (s, items, x, y, w, h, name) =>
  s.addText(items.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < items.length - 1 } })),
    { x, y, w, h, fontSize: 14, color: C.text1, valign: "top", paraSpaceAfter: 8, margin: 0, isTextBox: true, objectName: name });
const chartBase = (title) => ({
  showTitle: true, title, titleFontSize: 12, titleColor: "1B2430", titleFontFace: "+mn-lt",
  catAxisLabelColor: "475569", valAxisLabelColor: "475569", catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt",
  catAxisLabelFontSize: 10, valAxisLabelFontSize: 10, valGridLine: { color: "E2E8F0", size: 0.5 }, catGridLine: { style: "none" },
  showValue: true, dataLabelFontSize: 10, dataLabelFontFace: "+mn-lt", dataLabelColor: "1B2430", showLegend: false,
});
const content = (section, title) => {
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: section });
  s.addText(title, { placeholder: "title" });
  return s;
};

// 1 Title
pres.addSection({ title: "Intro" });
let s = pres.addSlide({ masterName: "DARK", sectionTitle: "Intro" });
s.addText("From Data to Decisions: The 2025 Sales Story", { placeholder: "title" });
s.addText("Data Storytelling & Statistical Validation  |  ApexPlanet Internship, Task 4", { placeholder: "body" });

// 2 Objective
s = content("Intro", "Business objective");
card(s, 0.5, 1.3, 2.8, 1.5, "Understand", "Where does revenue come from: time, product, city, customer?", HEX.navy, "obj1");
card(s, 3.6, 1.3, 2.8, 1.5, "Validate", "Is the Electronics advantage over Fashion statistically real?", HEX.teal, "obj2");
card(s, 6.7, 1.3, 2.8, 1.5, "Recommend", "Which actions are supported by the evidence?", HEX.amber, "obj3");
s.addText([
  { text: "Key question: ", options: { bold: true, color: C.text2 } },
  { text: "Do Electronics orders generate significantly higher sales than Fashion orders?", options: { color: C.text1 } },
], { x: 0.5, y: 3.3, w: 9, h: 0.9, fontSize: 18, valign: "middle", margin: 0, isTextBox: true, objectName: "Key question" });

// 3 Dataset
pres.addSection({ title: "Data" });
s = content("Data", "Dataset overview");
const ds = [["1,000", "orders (12 columns)"], [K["Unique Customers"].toString(), "unique customers"], ["8", "cities"], ["6 / 5", "products / categories"]];
ds.forEach((d, i) => card(s, 0.5 + i * 2.3, 1.3, 2.1, 1.3, d[0], d[1], [HEX.navy, HEX.teal, HEX.amber, HEX.coral][i], "ds" + i));
bullets(s, ["Period: 1 Jan 2025 to 1 Jan 2026, one row per order",
  "Fields: customer (ID, age, gender), city, product, category, quantity, unit price, total sales",
  "Categories: Electronics (Laptop, Mobile), Education (Book), Fashion (Shoes), Furniture (Chair), Grocery (Rice)"], 0.5, 3.0, 9, 2, "Dataset notes");

// 4 Cleaning
s = content("Data", "Data cleaning summary");
const Q = R.quality, hd = (t) => ({ text: t, options: { bold: true, color: "FFFFFF", fill: { color: "1F3A5F" } } });
s.addTable([
  [hd("Issue found"), hd("Records"), hd("Action taken")],
  ["Missing Age", String(Q.missing_age_imputed), "Filled with the median age"],
  ["Missing City", String(Q.missing_city_labelled_unknown), "Labelled 'Unknown'; left out of city ranking"],
  ["Order_ID ORD100050 reused for different orders", String(Q.reused_order_ids), "Kept (distinct orders) and flagged"],
  ["Fully duplicated rows", String(Q.full_duplicate_rows), "None found"],
  ["Total_Sales = Quantity × Unit_Price", "1,000 of 1,000", "Verified: no mismatches"],
  ["Partial month (1 Jan 2026 only)", "5 orders", "In totals; excluded from monthly trend"],
], { x: 0.5, y: 1.3, w: 9, colW: [3.9, 1.4, 3.7], fontSize: 12, color: "1B2430", border: { type: "solid", color: "D5DBE3", pt: 0.75 }, rowH: 0.45, valign: "middle", objectName: "Cleaning table" });

// 5 KPIs
s = content("Data", "Key KPIs");
const kp = [[M(K["Total Revenue"]), "total revenue"], [Kf(K["Average Order Value"]), "average order value"],
  [pct(K["Top Category Revenue Share"]), "of revenue from Electronics"], [pct(K["Repeat Customer Rate"]), "of customers ordered twice or more"]];
kp.forEach((d, i) => card(s, 0.5 + (i % 2) * 4.6, 1.25 + Math.floor(i / 2) * 1.55, 4.4, 1.35, d[0], d[1], [HEX.navy, HEX.teal, HEX.amber, HEX.coral][i], "kpi" + i));
s.addText(`Top city: ${K["Top City"]}  |  Top product: ${K["Top Product"]}  |  Median order: ${Kf(K["Median Order Value"])}  |  Units sold: ${K["Units Sold"].toLocaleString("en-US")}`,
  { x: 0.5, y: 4.45, w: 9, h: 0.4, fontSize: 13, color: C.text1, margin: 0, isTextBox: true, objectName: "KPI footnote" });

// 6 Trend
pres.addSection({ title: "Analysis" });
s = content("Analysis", "Sales trend: steady, with a late-summer dip");
const mm = R.monthly.filter((r) => r.Complete_Month);
const avgM = mm.reduce((a, r) => a + r.Revenue, 0) / mm.length;
const lowTwo = mm.filter((r) => r.Month === "2025-08" || r.Month === "2025-09");
s.addChart(pres.charts.LINE, [{ name: "Revenue (₹M)", labels: mm.map((r) => ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][+r.Month.slice(5) - 1]), values: mm.map((r) => +(r.Revenue / 1e6).toFixed(2)) }],
  { ...chartBase("Monthly revenue, 2025 (₹M)"), x: 0.4, y: 1.15, w: 6.2, h: 3.9, chartColors: [HEX.navy], lineSize: 3, lineDataSymbolSize: 7, dataLabelPosition: "t", dataLabelFormatCode: "0.0", valAxisMinVal: 8, valAxisMaxVal: 14, objectName: "Trend chart" });
bullets(s, [`Average month: ${M(avgM)}`, `Peak: March at ${M(mm.find((r) => r.Month === "2025-03").Revenue)}`,
  `Trough: September at ${M(lowTwo[1].Revenue)}, about ${pct(1 - lowTwo[1].Revenue / avgM)} below average`,
  "Recovery from October onward, driven by order volume"], 6.8, 1.4, 2.7, 3.4, "Trend notes");

// 7 Segments
s = content("Analysis", "Customer segmentation: 20% of customers drive 48% of revenue");
const sg = R.segments;
s.addChart(pres.charts.BAR, [
  { name: "% of customers", labels: sg.map((r) => r.Segment), values: sg.map((r) => +(r.Customer_Share * 100).toFixed(1)) },
  { name: "% of revenue", labels: sg.map((r) => r.Segment), values: sg.map((r) => +(r.Revenue_Share * 100).toFixed(1)) }],
  { ...chartBase("Share of customers vs share of revenue (%)"), x: 0.4, y: 1.15, w: 5.8, h: 3.9, barDir: "col", chartColors: [HEX.grey, HEX.navy], showLegend: true, legendPos: "b", legendFontSize: 11, dataLabelPosition: "outEnd", dataLabelFormatCode: "0", valAxisMaxVal: 60, objectName: "Segment chart" });
bullets(s, ["Segments are based on each customer's lifetime spend (top 20% / middle 40% / bottom 40%)",
  `High Value: ${sg[0].Customers} customers, ${M(sg[0].Revenue)}`,
  `Low Value: 40% of customers, only ${pct(sg[2].Revenue_Share)} of revenue`,
  `${pct(K["Repeat Customer Rate"])} of customers repeat-purchase: retention is the open opportunity`], 6.4, 1.4, 3.1, 3.5, "Segment notes");

// 8 Product & market
s = content("Analysis", "Product and market analysis");
const cat = R.category, ct = R.city;
s.addChart(pres.charts.BAR, [{ name: "Revenue (₹M)", labels: cat.map((r) => r.Category), values: cat.map((r) => +(r.Revenue / 1e6).toFixed(1)) }],
  { ...chartBase("Revenue by category (₹M)"), x: 0.4, y: 1.1, w: 4.6, h: 2.9, barDir: "col", chartColors: [HEX.navy, HEX.grey, HEX.grey, HEX.grey, HEX.grey], dataLabelPosition: "outEnd", dataLabelFormatCode: "0.0", objectName: "Category chart" });
s.addChart(pres.charts.BAR, [{ name: "Revenue (₹M)", labels: ct.map((r) => r.City), values: ct.map((r) => +(r.Revenue / 1e6).toFixed(1)) }],
  { ...chartBase("Revenue by city (₹M)"), x: 5.0, y: 1.1, w: 4.6, h: 2.9, barDir: "col", chartColors: [HEX.teal, HEX.teal, HEX.teal, HEX.grey, HEX.grey, HEX.grey, HEX.grey, HEX.grey], dataLabelPosition: "outEnd", dataLabelFormatCode: "0.0", catAxisLabelFontSize: 9, objectName: "City chart" });
const eAov = cat.find((r) => r.Category === "Electronics"), fAov = cat.find((r) => r.Category === "Fashion");
s.addText([
  { text: "Electronics leads on volume, not on order size: ", options: { bold: true, color: C.text2 } },
  { text: `${eAov.Orders} orders across two products vs ${fAov.Orders} for Fashion. Average order value is ${Kf(eAov.AOV)} vs ${Kf(fAov.AOV)}, so is that gap real? Next slide. Top cities: Patna, Kolkata, Bengaluru, Mumbai (all within ₹0.5M).`, options: { color: C.text1 } },
], { x: 0.5, y: 4.1, w: 9, h: 0.95, fontSize: 13, valign: "top", margin: 0, isTextBox: true, objectName: "Product takeaway" });

// 9 Statistical testing
s = content("Analysis", "Statistical testing: is Electronics really bigger?");
card(s, 0.5, 1.15, 2.9, 1.0, "p = " + H.welch_p.toFixed(3), `Welch t = ${H.welch_t.toFixed(2)}, df = ${Math.round(H.welch_df)} (one-sided)`, HEX.amber, "p");
card(s, 3.55, 1.15, 2.9, 1.0, "+" + Kf(H.diff), `Electronics − Fashion mean (+${pct(H.diff_pct, 1)})`, HEX.navy, "d");
card(s, 6.6, 1.15, 2.9, 1.0, `${Kf(H.diff_ci95[0])} to +${Kf(H.diff_ci95[1])}`, "95% CI for the difference", HEX.teal, "ci");
s.addImage({ path: path.join(ROOT, "charts/hypothesis_test.png"), x: 0.5, y: 2.35, w: 5.8, h: 2.21, objectName: "Hypothesis chart", altText: "Order value distributions and mean confidence intervals for Electronics and Fashion" });
s.addText([
  { text: "H0: ", options: { bold: true, color: C.text2 } }, { text: "means are equal.  ", options: { color: C.text1 } },
  { text: "H1: ", options: { bold: true, color: C.text2 } }, { text: "Electronics > Fashion.  α = 0.05.", options: { color: C.text1, breakLine: true } },
  { text: "Decision: " + H.decision + ".", options: { bold: true, color: C.accent4 } },
  { text: ` The gap is within sampling noise (Mann–Whitney p = ${H.mannwhitney_p.toFixed(2)}; the CI includes 0). About ${H["n_per_group_for_80pct_power"]} orders per category would be needed to confirm an effect this size.`, options: { color: C.text1 } },
], { x: 6.5, y: 2.35, w: 3.0, h: 2.7, fontSize: 12, valign: "top", margin: 0, paraSpaceAfter: 6, isTextBox: true, objectName: "Test interpretation" });

// 10 Recommendations
pres.addSection({ title: "Wrap-up" });
s = content("Wrap-up", "Business recommendations");
const dip = (avgM - lowTwo[0].Revenue) + (avgM - lowTwo[1].Revenue);
const rec = [
  ["1. Retain high-value customers", `20% of customers give 48% of revenue, and only ${pct(K["Repeat Customer Rate"])} ever reorder.`, `Loyalty offers and reorder nudges. Illustrative: repeat rate 5% to 10% adds about ${M(0.05 * K["Unique Customers"] * K["Average Order Value"])} (+${pct(0.05 * K["Unique Customers"] * K["Average Order Value"] / K["Total Revenue"], 1)}).`, HEX.navy],
  ["2. Fix the Aug–Sep dip", `Revenue fell to ${M(lowTwo[0].Revenue)} and ${M(lowTwo[1].Revenue)} vs a ${M(avgM)} average.`, `Run targeted promotions in these months. Lifting both to average adds about ${M(dip)}.`, HEX.teal],
  ["3. Back Electronics by volume, not price", "Its revenue lead comes from order count; order size is not proven higher.", "Keep Laptop/Mobile stock and marketing strong; avoid premium pricing assumptions until more data confirms.", HEX.amber],
];
rec.forEach((r, i) => {
  const x = 0.5 + i * 3.1;
  s.addShape(pres.shapes.RECTANGLE, { x, y: 1.25, w: 2.9, h: 3.75, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: "Rec card " + (i + 1) });
  s.addShape(pres.shapes.RECTANGLE, { x, y: 1.25, w: 2.9, h: 0.07, fill: { color: r[3] }, line: { color: r[3] }, objectName: "Rec accent " + (i + 1) });
  s.addText([
    { text: r[0], options: { bold: true, fontSize: 14, color: C.text2, breakLine: true } },
    { text: "Insight: ", options: { bold: true, fontSize: 11, color: C.text1 } }, { text: r[1], options: { fontSize: 11, color: C.text1, breakLine: true } },
    { text: "Action & impact: ", options: { bold: true, fontSize: 11, color: C.text1 } }, { text: r[2], options: { fontSize: 11, color: C.text1 } },
  ], { x: x + 0.15, y: 1.45, w: 2.6, h: 3.4, valign: "top", margin: 0, paraSpaceAfter: 8, isTextBox: true, objectName: "Rec text " + (i + 1) });
});

// 11 Conclusion
s = content("Wrap-up", "Conclusion");
bullets(s, [`The business earned ${M(K["Total Revenue"])} from 1,000 orders; Electronics is the largest category at ${pct(K["Top Category Revenue Share"])} of revenue.`,
  `Statistically, Electronics' higher average order value (+${pct(H.diff_pct, 1)}) is not significant at the 5% level (p = ${H.welch_p.toFixed(3)}): we fail to reject H0.`,
  "The real levers are retention of high-value customers and smoothing the Aug–Sep dip.",
  `Next step: collect more orders (about ${H["n_per_group_for_80pct_power"]} per category) and re-test.`], 0.5, 1.3, 9, 3.6, "Conclusion bullets");

// 12 Thank you
s = pres.addSlide({ masterName: "DARK", sectionTitle: "Wrap-up" });
s.addText("Thank you", { placeholder: "title" });
s.addText("Questions and feedback welcome  |  Code, charts and report on GitHub", { placeholder: "body" });

(async () => {
  const out = path.join(ROOT, "presentation/Task4_Business_Story.pptx");
  await pres.writeFile({ fileName: out });
  await applyTheme(out, THEME);
  console.log("written", out);
})();
