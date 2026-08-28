/* ==== module: persistence.js (auto-generated split) ==== */
import { applyCustomCategory } from './categorize.js';
import { render } from './panels.js';
import { state } from './state.js';
import { storageGet, storageSet } from './storage.js';
import { curSym, fmt, todayStr } from './utils.js';

export async function loadPersisted(){
  const ov = await storageGet('ms_overrides'); if(ov) state.overrides = {...state.overrides, ...JSON.parse(ov)};
  // migrate any leftover pre-split "авто/бензин" values (that category no longer exists) —
  // Зелена картка is insurance, not fuel, so it goes to "авто"; everything else falls back to "бензин"
  let migratedOverrides = false;
  Object.keys(state.overrides).forEach(k=>{
    if(state.overrides[k]==='авто/бензин'){
      state.overrides[k] = k.includes('Зелена картка') ? 'авто' : 'бензин';
      migratedOverrides = true;
    }
  });
  if(migratedOverrides) await persistOverrides();
  const man = await storageGet('ms_manual'); if(man) state.manual = JSON.parse(man);
  const tok = await storageGet('ms_token'); if(tok){ state.token = tok; state.rememberToken = true; }
  const d = await storageGet('ms_debts'); if(d) state.debts = JSON.parse(d);
  const lk = await storageGet('ms_loankeys'); if(lk) state.loanKeys = JSON.parse(lk);
  const uk = await storageGet('ms_usedincoming'); if(uk) state.usedIncoming = JSON.parse(uk);
  const nt = await storageGet('ms_notes'); if(nt) state.notes = {...state.notes, ...JSON.parse(nt)};
  const de = await storageGet('ms_dayexcluded'); if(de) state.dayExcluded = {...state.dayExcluded, ...JSON.parse(de)};
  const ne = await storageGet('ms_notexpense'); if(ne) state.notExpense = {...state.notExpense, ...JSON.parse(ne)};
  const ao = await storageGet('ms_amountoverride'); if(ao) state.amountOverride = JSON.parse(ao);
  const tco = await storageGet('ms_txcatoverride'); if(tco) state.txCategoryOverride = {...state.txCategoryOverride, ...JSON.parse(tco)};
  const tc = await storageGet('ms_txcache'); if(tc){ const stored = JSON.parse(tc); const known=new Set(state.txCache.map(x=>x.id)); stored.forEach(it=>{ if(!known.has(it.id)){ state.txCache.push(it); known.add(it.id); } }); }
  const jp = await storageGet('ms_jarpending'); if(jp) state.jarPending = JSON.parse(jp);
  const jld = await storageGet('ms_jarlastdate'); if(jld) state.jarLastDate = jld;
  const jps = await storageGet('ms_jarperiodstart'); if(jps) state.jarPeriodStart = jps;
  const je = await storageGet('ms_jarenabled'); if(je!==null) state.jarEnabled = je==='true';
  const jdb = await storageGet('ms_jardailybudget'); if(jdb) state.jarDailyBudget = JSON.parse(jdb);
  const jsd = await storageGet('ms_jarstartdateactual'); if(jsd) state.jarStartDateActual = jsd;
  const tr = await storageGet('ms_trips'); if(tr) state.trips = JSON.parse(tr);
  const to_ = await storageGet('ms_tripof'); if(to_) state.tripOf = JSON.parse(to_);
  const cc = await storageGet('ms_customcats');
  if(cc){
    const stored = JSON.parse(cc);
    stored.forEach(c=>{ if(!state.customCats.find(x=>x.name===c.name)) applyCustomCategory(c, true); });
  }
}

export async function persistOverrides(){ await storageSet('ms_overrides', JSON.stringify(state.overrides)); }

export async function setOverride(desc, cat){
  state.overrides[desc] = cat;
  render(); // instant UI feedback
  await persistOverrides(); // then make sure it's actually saved before anything else can race it
}

export async function persistTxCategoryOverride(){ await storageSet('ms_txcatoverride', JSON.stringify(state.txCategoryOverride)); }

// Every time a statement is fetched, the raw items get folded into a permanent local
// cache (deduped by id). That way past months stay visible/statisticable without ever
// hitting the API for them again — only genuinely new days need a fresh request.

export async function persistTxCache(){
  // keep this bounded — cheap safety net against unbounded growth over a year of use
  if(state.txCache.length > 20000) state.txCache = state.txCache.slice(-20000);
  await storageSet('ms_txcache', JSON.stringify(state.txCache));
}

export function mergeIntoCache(items){
  const known = new Set(state.txCache.map(x=>x.id));
  let added = 0;
  items.forEach(it=>{
    if(!known.has(it.id)){ state.txCache.push(it); known.add(it.id); added++; }
  });
  if(added>0) persistTxCache();
  return added;
}

export async function clearTxCache(){
  state.txCache = [];
  await storageSet('ms_txcache', '[]');
  render();
}

export async function setTxCategoryOverride(key, cat){
  state.txCategoryOverride[key] = cat;
  render();
  await persistTxCategoryOverride();
}

export async function persistManual(){ await storageSet('ms_manual', JSON.stringify(state.manual)); }

export async function persistNotes(){ await storageSet('ms_notes', JSON.stringify(state.notes)); }

export async function persistDayExcluded(){ await storageSet('ms_dayexcluded', JSON.stringify(state.dayExcluded)); }

export async function persistTrips(){
  await storageSet('ms_trips', JSON.stringify(state.trips));
  await storageSet('ms_tripof', JSON.stringify(state.tripOf));
}

export async function persistNotExpense(){ await storageSet('ms_notexpense', JSON.stringify(state.notExpense)); }

export async function persistAmountOverride(){ await storageSet('ms_amountoverride', JSON.stringify(state.amountOverride)); }

// Monobank's own statistics nets a refund against its original charge (e.g. a Bolt
// ride charged then partially refunded shows as one adjusted trip, not two lines).
// This mirrors that for "Чисті трати": same description, a later opposite-sign
// transaction within 14 days that's no bigger than the original, gets netted in.
// Only affects "Чисті трати" — the raw list and "Загальна картина" stay untouched.

export async function persistDebts(){
  await storageSet('ms_debts', JSON.stringify(state.debts));
  await storageSet('ms_loankeys', JSON.stringify(state.loanKeys));
  await storageSet('ms_usedincoming', JSON.stringify(state.usedIncoming));
}

export function exportData(){
  const payload = {
    overrides: state.overrides, manual: state.manual, debts: state.debts,
    loanKeys: state.loanKeys, usedIncoming: state.usedIncoming, notes: state.notes,
    customCats: state.customCats, notExpense: state.notExpense, dayExcluded: state.dayExcluded,
    amountOverride: state.amountOverride, txCategoryOverride: state.txCategoryOverride,
    txCache: state.txCache, trips: state.trips, tripOf: state.tripOf,
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'monostat-data-'+todayStr()+'.json';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importDataFromFile(file){
  const text = await file.text();
  const payload = JSON.parse(text);
  if(payload.overrides) state.overrides = payload.overrides;
  if(payload.manual) state.manual = payload.manual;
  if(payload.debts) state.debts = payload.debts;
  if(payload.loanKeys) state.loanKeys = payload.loanKeys;
  if(payload.usedIncoming) state.usedIncoming = payload.usedIncoming;
  if(payload.notes) state.notes = payload.notes;
  if(payload.notExpense) state.notExpense = payload.notExpense;
  if(payload.dayExcluded) state.dayExcluded = payload.dayExcluded;
  if(payload.amountOverride) state.amountOverride = payload.amountOverride;
  if(payload.txCategoryOverride) state.txCategoryOverride = payload.txCategoryOverride;
  if(payload.txCache) mergeIntoCache(payload.txCache); // dedup-merge, doesn't wipe what's already cached here
  if(payload.trips){
    const known = new Set(state.trips.map(t=>t.id));
    payload.trips.forEach(t=>{ if(!known.has(t.id)){ state.trips.push(t); known.add(t.id); } });
  }
  if(payload.tripOf) state.tripOf = {...state.tripOf, ...payload.tripOf};
  if(payload.customCats){
    payload.customCats.forEach(c=>{ if(!state.customCats.find(x=>x.name===c.name)) applyCustomCategory(c, true); });
  }
  await persistOverrides(); await persistManual(); await persistDebts(); await persistNotes();
  await persistNotExpense(); await persistDayExcluded(); await persistAmountOverride(); await persistTxCategoryOverride();
  await persistTrips();
  await storageSet('ms_customcats', JSON.stringify(state.customCats));
  render();
}

export async function setNote(key, text){
  if(text===null) return; // user cancelled the prompt
  if(text.trim()==='') delete state.notes[key];
  else state.notes[key] = text.trim();
  render();
  await persistNotes();
}

export function toggleDayExcluded(key, checked){
  if(checked) delete state.dayExcluded[key];
  else state.dayExcluded[key] = true;
  render();
  persistDayExcluded();
}

export function toggleNotExpense(key, flagged){
  if(flagged) state.notExpense[key] = true;
  else delete state.notExpense[key];
  render();
  persistNotExpense();
}

export const SPLIT_CATS = ['продукти спільні','розваги спільні'];

export function noteButtonHandler(t, key, existingNote){
  let prefill = existingNote || '';
  if(!existingNote && SPLIT_CATS.includes(t.cat)){
    const nStr = prompt('На скільки осіб ділиш цю трату? (включно з тобою)', '2');
    const n = parseInt(nStr, 10);
    if(nStr!==null && n>0){
      const share = Math.abs(t.amount)/n;
      prefill = `${fmt(Math.abs(t.amount))} ${curSym()} всього на ${n}, моя частка ${fmt(share)} ${curSym()}, решта в Splitwise`;
    }
  }
  const val = prompt('Нотатка до цієї операції:', prefill);
  setNote(key, val);
}
