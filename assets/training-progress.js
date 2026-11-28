(function(root){
  'use strict';
  const complete = entry => entry?.sets?.length === 3 && entry.sets.every(s=>s.state==='done'&&Number.isInteger(s.reps));
  function defaults(exercise, previous) {
    const done=previous?.sets?.filter(s=>s.state==='done') || [];
    const weight=done.at(-1)?.weight??exercise.weight;
    return Array.from({length:3},()=>({weight,reps:exercise.min,state:'pending'}));
  }
  function advice(exercise, entry) {
    if(!complete(entry)) return 'incomplete';
    if(entry.sets.every(s=>s.reps>=exercise.max)) {
      return exercise.kind==='bodyweight'||exercise.support?'harder':'increase';
    }
    return 'reps';
  }
  function comparison(entry, previous) {
    if(!complete(entry)||!complete(previous)||entry.sets.some((s,i)=>s.weight!==previous.sets[i].weight))return null;
    return entry.sets.reduce((a,s)=>a+s.reps,0)-previous.sets.reduce((a,s)=>a+s.reps,0);
  }
  const api={complete,defaults,advice,comparison};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.fitnessTrainingProgress=api;
})(typeof window==='undefined'?globalThis:window);
