# Nutrition planning bands

These bands rank the meal plan for this user's fat-loss and resistance-training goals. They are **not diagnoses**, estimates of individual physiological requirements, or universal medical safe/unsafe cutoffs. The middle bands are deliberate planning flexibility, not formally validated clinical categories. “Best” means the preferred planning zone; it does not promise better outcomes than every value outside it. Foods, supplements and micronutrients remain estimates.

## Runtime data and a single denominator

`assets/nutrition-targets.js` consumes the plan's daily calories and nutrients, the authenticated `tracking-records` profile (age, sex), `fitnessBodyMetrics` (latest valid weight/body fat), and `fitnessEnergyBudget` (current expenditure). Nutrition pages enable the existing Worker injection, with the same Access and email checks. Public sources contain no private profile or measurement values. No measurement today is needed: existing latest-valid-record fallback applies. Missing private data leaves dependent evaluations pending, never replaced with the owner's historical values. Age is the database's `ageYears`; without a birthday it does not auto-increment.

Each macro/energy-share pair has one card and one rule. Displayed percentages are `grams × 4/4/9 / current plan kcal × 100`; targets use exactly the same conversion. Protein ranges are rounded to 5 g to limit apparent precision. Carb bounds are the residual calorie budget after protein/fat bounds, so not all upper bounds are meant to be eaten simultaneously. Food labels, fibre and rounding can make energy shares sum to slightly more/less than 100%.

## Policy

- Energy: preferred deficit 300–500 kcal/day; flexible 150–650. This is a practical moderate-deficit target for retaining muscle, not a metabolism measurement. It updates from the same latest-weight/steps model as the overview.
- Protein: preferred 2.3–2.8 g/kg estimated fat-free mass, flexible 2.0–3.1. This is a planning extrapolation, **not a proven personal requirement**: the higher-protein energy-restriction literature principally studied lean, trained adults. Body-fat scale error affects this estimate. If body fat is absent, use 1.6–2.0 g/kg current weight, flexible 1.4–2.2, explicitly labelled; that fallback warrants review at high body fat. Values above the flexible range mean reconsider allocation, not proven toxicity.
- Fat: preferred 25–30% of food calories; flexible 20–35%. Carbs receive remaining energy after the protein and fat ranges, with a 130 g/day planning floor. This prioritizes protein and sufficient fat without imposing the unrelated general 45–65% carbohydrate band.
- Saturated fat: best **<6%**, acceptable **6% to <10%**, adjust **≥10%**. The 6% aim is AHA's stricter cardiovascular target, not a diagnosis or mandatory threshold for everyone.
- Fibre: preferred 30–40 g, flexible 25–50. Tolerance, hydration and food sources matter; 50 g is a planning review point, not an established UL.
- Added sugar: <5%, flexible <10%. Derived as practical added-sugar targets; WHO's source guideline concerns **free sugar**, which additionally includes juice/honey sugars. Current whole-fruit plan uses added-sugar estimates, not a comprehensive free-sugar audit.
- Total sugar: no fabricated independent limit. Display amount, explicitly rate **added sugar only**, and label the relationship. Does not declare total sugar safe/adequate.
- Cholesterol: no fabricated independent numerical limit. Display amount, explicitly rate **saturated fat only**, state that cholesterol needs blood-lipid context. Does not certify high cholesterol intake as safe.
- Sodium: preferred 1500–2000 mg, flexible 1000–2300. Lower than this is a review point, not proof of sodium deficiency or an instruction to add salt.
- Calcium: preferred age/sex RDA to 2000 mg; flexible 80% RDA to age-specific UL (2500 through age 50, 2000 thereafter). RDA 1000 for most adults, 1200 for women over 50 and all adults over 70.
- Iron: preferred RDA to 20 mg; flexible 80% RDA to 45 mg. RDA 18 mg for women 19–50, 8 otherwise. No pregnancy/lactation assumptions.
- Potassium: preferred ≥3400 mg men / ≥2600 women; flexible ≥80% AI. No fabricated food-based UL for healthy adults. Not suitable for kidney disease/potassium-altering medication without clinical guidance.
- Vitamin D: preferred RDA–50 µg; flexible 80% RDA–100 µg. RDA 15 µg through age 70, 20 thereafter. 50 is a planning preference, 100 the adult UL.
- B12: preferred ≥2.4 µg, flexible ≥2; no invented UL.
- Iodine: preferred 150–600 µg, flexible 120–1100. 150 is adult RDA; 1100 adult UL. 600 is a conservative planning preference, not a claim that 601 is harmful. Thyroid disease changes the context.
- ALA: preferred ≥1.6 g men / ≥1.1 women; flexible ≥80% AI; no invented UL.
- EPA+DHA: preferred .25–2 g, flexible .2–3 g including food and supplements. These are planning bounds, **not an RDA, therapeutic prescription or safety threshold**. Higher doses are not assumed to improve skin/brain outcomes.

Age/sex-dependent requirements wait for the private profile instead of silently assuming male/default age. General adult thresholds assume no pregnancy, kidney disease, malabsorption or other special clinical condition. All interval estimates are evaluated conservatively by their full range; lower and upper review points are considered. No “higher is always better” grading for nutrients with an UL.

## Sources checked 2026-11-16

- Health Canada DRI tables (RDA/AI/UL and macro AMDR): https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/dietary-reference-intakes/tables.html
- AHA saturated fat <6%: https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/fats/saturated-fats
- General saturated fat <10%: https://www.dietaryguidelines.gov/sites/default/files/2021-11/DGA_FactSheet_SaturatedFats-07-09_508c_0.pdf
- Helms et al. lean energy-restricted protein review: https://pubmed.ncbi.nlm.nih.gov/24092765/
- Morton et al. resistance-training protein meta-analysis: https://bjsm.bmj.com/content/early/2018/01/18/bjsports-2017-097608
- WHO free sugars <10%, ideally <5%: https://www.who.int/publications/i/item/WHO-NMH-NHD-15.3
- AHA 2026 dietary-pattern guidance / cholesterol context: https://professional.heart.org/en/science-news/2026-dietary-guidance-to-improve-cardiovascular-health/top-things-to-know
- NIH omega-3: https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/
