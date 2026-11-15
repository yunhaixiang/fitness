// Mifflin–St Jeor predicts resting expenditure, not measured metabolic adaptation.
// https://pubmed.ncbi.nlm.nih.gov/2305711/
// Keep the existing 20% sedentary add-on; walking and planned exercise are added net.
// Fixed exercise duration/intensity: scale the established planning budgets by weight.
// The private reference weight anchors those budgets; it never changes on new uploads.
export function metabolicEnergy(records = {}) {
  const p = records.profile || {};
  const weight = Number(records.currentBody?.weight);
  const height = Number(p.heightCm), age = Number(p.ageYears), reference = Number(p.exerciseReferenceWeightKg);
  const validWeight = Number.isFinite(weight) && weight >= 20 && weight <= 350;
  const validProfile = Number.isFinite(height) && height >= 50 && height <= 250 && Number.isFinite(age) && age >= 18 && age <= 120 && ['male', 'female'].includes(p.sex);
  const estimate = validWeight && validProfile ? 10 * weight + 6.25 * height - 5 * age + (p.sex === 'male' ? 5 : -161) : null;
  const dailyResting = estimate > 0 ? estimate : null;
  return {
    dailyResting,
    dailyActivity: dailyResting === null ? null : dailyResting * 0.2,
    exerciseWeightRatio: validWeight && Number.isFinite(reference) && reference >= 20 && reference <= 350 ? weight / reference : null,
    measuredAt: records.currentBody?.measuredAt || null
  };
}
