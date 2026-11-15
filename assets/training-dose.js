// Weekly hypertrophy planning reference, separate from sets × reps × load.
// ACSM 2026: https://pubmed.ncbi.nlm.nih.gov/41843416/
// Fractional indirect sets: https://pubmed.ncbi.nlm.nih.gov/41343037/
// The 5/10/20 boundaries are UI planning bands, not validated individual cutoffs.
// This assumes challenging working sets; effort, technique and recovery are not measured.
// Stabilization/grip-only work is not equated to dynamic hypertrophy sets.
(() => {
  'use strict';
  const create = () => ({ primarySets: 0, secondarySets: 0, stabilizingSets: 0 });
  function add(tally, category, sets, stabilizing = false) {
    if (!Number.isFinite(sets) || sets <= 0 || !['primary', 'secondary'].includes(category)) return;
    // Per-muscle set counts do not double for two dumbbells or left/right repetitions.
    tally[stabilizing ? 'stabilizingSets' : `${category}Sets`] += sets;
  }
  function assess(tally) {
    const { primarySets, secondarySets, stabilizingSets } = tally;
    if (![primarySets, secondarySets, stabilizingSets].every(n => Number.isFinite(n) && n >= 0)) {
      return { status: 'unknown', sets: null };
    }
    const sets = primarySets + secondarySets * .5;
    const status = sets === 0 ? (stabilizingSets > 0 ? 'stabilizing' : 'none')
      : sets < 5 ? 'low' : sets < 10 ? 'moderate' : sets <= 20 ? 'adequate' : 'high';
    return { status, sets };
  }
  const api = { create, add, assess };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.fitnessTrainingDose = api;
})();
