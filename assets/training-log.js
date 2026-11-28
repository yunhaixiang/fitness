(() => {
  'use strict';
  const root=document.querySelector('#strength-root'), source=document.querySelector('#strength-exercise-catalog');
  if(!root||!source)return;
  const catalog=JSON.parse(source.textContent), logic=window.fitnessTrainingProgress;
  const en=window.fitnessI18n?.language==='en', tr=(zh,english)=>en?english:zh;
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Toronto',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  let selected=today(), serverToday=today(), writable=false, loading=true, generation=0, changingTab=false;
  let states=new Map(), history=[];
  const cards=[...root.querySelectorAll('[data-exercise-id]')].filter(c=>catalog[c.dataset.exerciseId]);
  const tabs=[...root.querySelectorAll('.strength-day-tabs button')];
  const bar=el('section','training-log-toolbar'), label=el('label','',tr('训练日期','Training date'));
  const date=el('input');date.type='date';date.value=selected;date.min='2020-01-01';date.max=serverToday;
  label.append(date);const reload=el('button','',tr('刷新记录','Reload records'));reload.type='button';
  const status=el('span','training-log-status',tr('正在读取私人记录…','Loading private records…'));status.setAttribute('role','status');
  bar.id='training-records';
  bar.append(label,reload,status);root.querySelector('.strength-switch').after(bar);
  const jump=el('a','training-jump',tr('记录训练 ↓','Log workout ↓'));jump.href='#training-records';root.querySelector('.strength-switch').append(jump);
  const units=x=>x.kind==='bodyweight'?tr('自重','Bodyweight'):x.support?tr('支撑用重量 · lb','Support weight · lb'):x.kind==='each'?tr('每只哑铃 · lb','Per dumbbell · lb'):x.kind==='plates'?tr('加片总重 · lb','Total added plates · lb'):tr('重量 · lb','Weight · lb');
  const historyLine=e=>e.sets.map(s=>s.state==='skip'?tr('跳过','Skipped'):s.state==='done'?`${s.weight} lb × ${s.reps}`:tr('未完成','Pending')).join(' / ');
  const dirty=()=>[...states.values()].some(s=>s.dirty||s.saving||s.error);
  const views=new Map();
  function message(s){return (s.invalid?tr('请输入有效的重量与整数次数。','Enter a valid weight and whole-number reps.'):'')||s.error|| (s.saving?tr('保存中…','Saving…'):s.dirty?tr('待保存','Not saved yet'):s.saved?tr('已保存','Saved'):tr('尚未记录','Not recorded'));}
  function feedback(s){
    const x=catalog[s.entry.exercise], entries=history.filter(h=>h.exercise===x.id), prev=entries.find(h=>h.sets.some(set=>set.state==='done'));
    const advice={incomplete:tr('填写实际次数并勾选完成，再判断下次进度。','Enter reps and complete the sets to assess progress.'),increase:['each','dumbbell'].includes(x.kind)?tr('三组达到次数上限：动作稳定时，下次可考虑增加5 lb。','All three sets reached the upper target: if technique is controlled, consider adding 5 lb next time.'):tr('三组达到次数上限：动作稳定时，下次可考虑增加最小一档重量。','All three sets reached the upper target: if technique is controlled, consider the smallest weight increase next time.'),harder:tr('三组达到次数上限：可考虑更难的动作版本，支撑重量不作为加重目标。','All three sets reached the upper target: consider a harder variation; support weight is not a progression target.'),reps:tr('下次保持重量，争取在动作稳定的前提下多完成一次。','Keep this weight next time and aim for one more controlled rep.')};
    for(const v of views.get(x.id)||[]){
      v.set.disabled=loading||!writable||selected>serverToday||s.conflict;
      v.save.textContent=message(s);v.save.classList.toggle('is-error',!!s.error);v.retry.hidden=!s.error||s.conflict||s.invalid;
      v.last.textContent=prev?tr('上次：','Last: ')+prev.date+' · '+historyLine(prev):tr('暂无此前记录，先建立基线。','No previous record. Start with a baseline.');
      v.next.textContent=advice[logic.advice(x,s.entry)];
      const diff=logic.comparison(s.entry,prev);v.compare.textContent=diff===null?'':diff>0?tr(`同重量，比上次多${diff}次。`,`${diff} more reps than last time at the same weights.`):diff<0?tr(`同重量，比上次少${-diff}次。`,`${-diff} fewer reps than last time at the same weights.`):tr('同重量，次数与上次相同。','Same weights and repetitions as last time.');
      v.oldBoxes.forEach((box,i)=>{box.checked=s.entry.sets[i].state==='done';});
    }
    refreshProgress();
  }
  function refreshProgress(){
    for(const day of root.querySelectorAll('.visual-training-day')){
      const cs=[...day.querySelectorAll('[data-exercise-id]')];if(!cs.length)continue;
      let done=0,skip=0;for(const c of cs){const e=states.get(c.dataset.exerciseId)?.entry;done+=e?.sets.filter(s=>s.state==='done').length||0;skip+=e?.sets.filter(s=>s.state==='skip').length||0;}
      day.querySelector('.visual-training-progress').textContent=tr(`${done}/${cs.length*3}组完成${skip?` · ${skip}组跳过`:''}`,`${done}/${cs.length*3} sets done${skip?` · ${skip} skipped`:''}`);
    }
  }
  async function save(s){
    if(s.saving||!s.dirty||s.conflict||s.invalid)return;
    s.saving=true;s.dirty=false;s.error='';const snapshot=JSON.parse(JSON.stringify(s.entry));feedback(s);
    try{
      const response=await fetch('/api/training',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-Fitness-Action':'save-training'},body:JSON.stringify(snapshot)});
      if(!response.ok){s.conflict=response.status===409;throw Error(s.conflict?tr('另一设备已修改此记录。请先刷新，未保存的改动不会覆盖它。','Another device changed this record. Reload before editing; your unsaved changes have not overwritten it.'):tr('保存失败；记录仍在本页，请重试或重新登录。','Save failed. Your edits remain on this page; retry or sign in again.'));}
      const result=await response.json();if(!result.ok||!result.entry)throw Error(tr('未确认保存成功，请重试。','Save was not confirmed. Please retry.'));
      s.entry.version=result.entry.version;s.saved=true;
    }catch(error){s.error=error.message;s.dirty=true;}
    finally{s.saving=false;feedback(s);if(s.dirty&&!s.error)save(s);}
  }
  function change(s){s.dirty=true;s.saved=false;clearTimeout(s.timer);s.timer=setTimeout(()=>save(s),450);feedback(s);}
  function mount(card){
    const x=catalog[card.dataset.exerciseId], old=card.querySelector('.visual-set-list'), oldBoxes=[...old.querySelectorAll('input')];old.hidden=true;
    const controls=el('div','training-entry'), last=el('p','training-last'), set=el('fieldset','training-inputs');set.disabled=true;
    const legend=el('legend','',tr('实际表现','Actual performance'));set.append(legend);
    set.append(el('small','training-weight-unit',units(x)));
    const grid=el('div','training-set-grid');for(const title of [tr('组','Set'),x.kind==='bodyweight'?tr('自重','Bodyweight'):'lb',tr('次数','Reps'),tr('完成','Done'),tr('跳过','Skip')])grid.append(el('span','training-set-heading',title));
    const inputs=[];
    for(let i=0;i<3;i++){
      const dumbbell=['each','dumbbell'].includes(x.kind), w=el(dumbbell?'select':'input'),r=el('select'),done=el('input'),skip=el('input');
      w.className='training-weight';r.className='training-reps';
      const option=(parent,value,text=String(value))=>{const o=el('option','',text);o.value=String(value);parent.append(o);};
      if(dumbbell){for(let value=0;value<=150;value+=5)option(w,value);const more=el('optgroup');more.label=tr('更高重量','Higher weights');for(let value=155;value<=2000;value+=5)option(more,value);w.append(more);}
      else{w.type='number';w.min=0;w.max=2000;w.step=.5;w.disabled=x.kind==='bodyweight';}
      option(r,'','—');for(let value=1;value<=30;value++)option(r,value);const higherReps=el('optgroup');higherReps.label=tr('31次以上','31+ reps');for(let value=31;value<=200;value++)option(higherReps,value);r.append(higherReps);
      const repsControl=el('div','training-reps-control'),minus=el('button','','−'),plus=el('button','','+');minus.type=plus.type='button';
      minus.setAttribute('aria-label',tr(`第${i+1}组减少一次`,`Set ${i+1} one fewer rep`));plus.setAttribute('aria-label',tr(`第${i+1}组增加一次`,`Set ${i+1} one more rep`));repsControl.append(minus,r,plus);
      done.type='checkbox';skip.type='checkbox';
      for(const [n,what]of [[w,units(x)],[r,tr('次数','Reps')],[done,tr('完成','Done')],[skip,tr('跳过','Skip')]])n.setAttribute('aria-label',tr(`第${i+1}组 ${what}`,`Set ${i+1} ${what}`));
      grid.append(el('span','training-set-number',String(i+1)),w,repsControl,done,skip);inputs.push({w,r,done,skip});
      function commit(){const s=states.get(x.id);if(!s)return;
        s.invalid=inputs.some(n=>!n.w.checkValidity()||!n.r.checkValidity()||n.w.value==='');
        if(s.invalid){s.dirty=true;clearTimeout(s.timer);feedback(s);return;}
        s.entry.sets=inputs.map(n=>{const reps=n.r.value===''?null:Number(n.r.value);if(reps===null)n.done.checked=false;return {weight:Number(n.w.value),reps,state:n.skip.checked?'skip':n.done.checked?'done':'pending'};});
        change(s);
      }
      w.addEventListener(dumbbell?'change':'input',commit);r.addEventListener('change',commit);
      for(const [button,step]of [[minus,-1],[plus,1]])button.addEventListener('click',()=>{const next=r.value===''?x.min:Number(r.value)+step;r.value=next<1?'':String(Math.min(200,next));commit();});
      done.addEventListener('change',()=>{if(done.checked&&!r.value){done.checked=false;r.focus();r.reportValidity();return;}if(done.checked)skip.checked=false;commit();});
      skip.addEventListener('change',()=>{if(skip.checked)done.checked=false;commit();});
    }
    set.append(grid);
    if(x.unilateral)set.append(el('small','training-hint',tr('次数按每侧填写，两侧做完后勾选。','Enter reps per side; check done after both sides.')));
    const saveStatus=el('span','training-save-status'),retry=el('button','',tr('重试保存','Retry save'));retry.type='button';retry.hidden=true;retry.addEventListener('click',()=>save(states.get(x.id)));
    const next=el('p','training-advice'),compare=el('p','training-comparison'),details=el('details','training-history'),summary=el('summary','',tr('最近8次记录','Last 8 recorded sessions')),historyList=el('div');details.append(summary,historyList);
    controls.append(last,set,saveStatus,retry,compare,next,details);card.append(controls);card.classList.add('has-training-log');
    const plannedWeight=card.querySelector('.visual-exercise-weight');plannedWeight.textContent=tr('计划参考：','Plan reference: ')+plannedWeight.textContent;
    card.querySelector('.visual-exercise-dose').textContent=tr(`目标：3组 × ${x.min}–${x.max}次`,`Target: 3 sets × ${x.min}–${x.max} reps`)+(x.unilateral?tr('／侧',' / side'):'');
    const v={card,set,last,inputs,save:saveStatus,retry,next,compare,historyList,oldBoxes};if(!views.has(x.id))views.set(x.id,[]);views.get(x.id).push(v);
  }
  cards.forEach(mount);
  function hydrate(){
    for(const [id,vs]of views){const s=states.get(id);if(!s)continue;
      for(const v of vs){v.set.disabled=loading||!writable||selected>serverToday;
        v.inputs.forEach((n,i)=>{const a=s.entry.sets[i];if(n.w.tagName==='SELECT'&&![...n.w.options].some(o=>Number(o.value)===a.weight)){const legacy=el('option','',`${a.weight} · ${tr('旧记录','Previous')}`);legacy.value=a.weight;n.w.append(legacy);}n.w.value=a.weight;n.r.value=a.reps??'';n.done.checked=a.state==='done';n.skip.checked=a.state==='skip';});
        v.historyList.replaceChildren();const records=history.filter(h=>h.exercise===id);
        if(!records.length)v.historyList.append(el('p','',tr('暂无历史记录。','No history yet.')));
        for(const entry of records){const line=el('p','');line.append(el('strong','',entry.date),el('span','',historyLine(entry)));v.historyList.append(line);}
      }feedback(s);
    }
  }
  async function load(){
    const token=++generation;loading=true;status.textContent=tr('正在读取私人记录…','Loading private records…');for(const vs of views.values())for(const v of vs)v.set.disabled=true;
    try{const r=await fetch('/api/training?date='+encodeURIComponent(selected),{credentials:'same-origin',cache:'no-store'});if(!r.ok)throw Error();const result=await r.json();if(!Array.isArray(result.entries)||!Array.isArray(result.history))throw Error();if(token!==generation)return;
      history=result.history;writable=result.canWrite===true;serverToday=result.today;date.max=serverToday;states=new Map();
      for(const id of views.keys()){const found=result.entries.find(e=>e.exercise===id),prev=history.find(h=>h.exercise===id&&h.sets.some(s=>s.state==='done'));
        states.set(id,{entry:found||{date:selected,exercise:id,plan:catalog[id].plan,version:0,sets:logic.defaults(catalog[id],prev),effort:null},saved:!!found,dirty:false,saving:false,error:'',conflict:false});}
      loading=false;hydrate();status.textContent=selected>serverToday?tr('未来日期仅供查看。','Future date — view only.'):writable?tr('私人记录 · 修改后自动保存','Private records · Changes save automatically'):tr('只读查看','Read-only');
    }catch(_){if(token!==generation)return;loading=false;status.textContent=tr('未能读取记录。请刷新或重新登录后再记录。','Could not load records. Reload or sign in before recording.');}
  }
  function showDate(value){selected=value;date.value=value;changingTab=true;tabs[new Date(value+'T12:00:00Z').getUTCDay()].click();changingTab=false;load();}
  date.addEventListener('change',()=>{if(!date.value||!date.checkValidity()){date.value=selected;return;}if(dirty()){date.value=selected;status.textContent=tr('请先等待保存完成，或重试保存。','Wait for saving to finish, or retry the failed save.');return;}showDate(date.value);});
  tabs.forEach((tab,index)=>tab.addEventListener('click',event=>{if(changingTab)return;if(dirty()){event.stopImmediatePropagation();status.textContent=tr('请先等待保存完成，或重试保存。','Wait for saving to finish, or retry the failed save.');return;}
    const d=new Date(selected+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-d.getUTCDay()+index);selected=d.toISOString().slice(0,10);date.value=selected;load();},true));
  reload.addEventListener('click',()=>{if([...states.values()].some(s=>s.saving))return;if(dirty()&&!window.confirm(tr('刷新会丢弃本页未保存的改动，读取数据库中的最新记录。继续？','Reloading discards unsaved changes on this page and loads the latest saved records. Continue?')))return;for(const s of states.values())clearTimeout(s.timer);load();});
  window.addEventListener('beforeunload',event=>{if(dirty()){event.preventDefault();event.returnValue='';}});
  // Re-read on focus only when there are no unsaved edits; never discard a draft.
  let observedToday=today();
  window.addEventListener('focus',()=>{const now=today();if(dirty())return;if(now!==observedToday&&selected===observedToday){observedToday=now;showDate(now);}else{observedToday=now;load();}});
  showDate(selected);
})();
