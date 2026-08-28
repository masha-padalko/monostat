/* ==== module: utils.js (auto-generated split) ==== */
import { COLORS } from './categorize.js';
import { state } from './state.js';

export function fmt(n){
  return new Intl.NumberFormat('uk-UA',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Math.abs(n));
}

export const CURRENCY_SYMBOLS = {980:'₴', 978:'€', 840:'$', 985:'zł', 946:'lei', 975:'лв', 826:'£', 203:'Kč', 348:'Ft', 949:'₺', 498:'MDL', 756:'CHF', 578:'kr', 752:'kr', 208:'kr'};
// Approximate rates to EUR, as of July 2026 (NBU-ish) — for a rough "how much is this in
// euros" reference only, not for anything financial/official. Update manually if it drifts a lot.

export const TO_EUR_RATE = {980:1/51, 978:1, 840:1/1.16, 985:1/4.35, 946:1/5.22, 975:1/1.956, 826:1.17, 203:1/25.1, 348:1/408, 949:1/40.6, 498:1/20.1, 756:1.07, 578:1/11.9, 752:1/11.2, 208:1/7.46, 981:1/2.9};

export function toEur(amount, currencyCode){
  const rate = TO_EUR_RATE[currencyCode];
  if(!rate) return null;
  return Math.abs(amount) * rate;
}

export function fmtEur(amount, currencyCode){
  const eur = toEur(amount, currencyCode);
  return eur===null ? '' : ` (~${eur.toLocaleString('uk-UA',{minimumFractionDigits:2,maximumFractionDigits:2})} €)`;
}

export function curSym(){
  const acc = state.accounts.find(a=>a.id===state.selectedAccount);
  return CURRENCY_SYMBOLS[acc ? acc.currency : 980] || '₴';
}

export function curCode(){
  const acc = state.accounts.find(a=>a.id===state.selectedAccount);
  return acc ? acc.currency : 980;
}

export function todayStr(d){
  const dt = d || new Date();
  // local date components, not toISOString() (which converts to UTC and quietly
  // shifts the date back a day for anyone east of UTC, like Kyiv/Bucharest)
  const y = dt.getFullYear();
  const m = String(dt.getMonth()+1).padStart(2,'0');
  const day = String(dt.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

export function daysAgoStr(n){
  const dt = new Date(); dt.setDate(dt.getDate()-n);
  return todayStr(dt);
}

// Her budgeting month runs 10th-to-10th (payday). If today is already past the 10th,
// the current period started this month; otherwise it started the 10th of last month.

export function defaultPeriodStart(){
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getDate() >= 10 ? now.getMonth() : now.getMonth()-1;
  const dt = new Date(year, month, 10);
  return todayStr(dt);
}

// The next 10th (payday) — her period always ends the day before this.

export function nextPeriodBoundary(fromDateStr){
  const now = fromDateStr ? new Date(fromDateStr+'T00:00:00') : new Date();
  const year = now.getFullYear();
  const month = now.getDate() >= 10 ? now.getMonth()+1 : now.getMonth();
  return new Date(year, month, 10);
}

export function daysUntilPeriodEnd(fromDateStr){
  const now = fromDateStr ? new Date(fromDateStr+'T00:00:00') : new Date();
  now.setHours(0,0,0,0);
  const boundary = nextPeriodBoundary(fromDateStr); boundary.setHours(0,0,0,0);
  // +1 because both endpoints count as full days (today AND the 10th itself),
  // not just the number of nights between them
  return Math.max(1, Math.round((boundary.getTime()-now.getTime())/(24*60*60*1000)) + 1);
}

// Monobank gives a `balance` field on every transaction — the balance AFTER that
// operation. That means the balance at the START of any past day can be reconstructed
// from the cache, instead of only ever knowing "right now". Best-effort: find the
// earliest cached transaction on/after that date and back out its own amount.

export function txKey(t){
  const d = t.date instanceof Date ? t.date.toISOString().slice(0,16) : String(t.date);
  return `${d}|${t.desc}|${t.amount}`;
}

export function escapeHtml(s){
  const d = document.createElement('div'); d.textContent = s||''; return d.innerHTML;
}

export function buildConicGradient(catList, total){
  let acc = 0;
  const stops = [];
  catList.forEach(([cat,sum])=>{
    const frac = Math.abs(sum)/Math.abs(total);
    const start = acc*360;
    acc += frac;
    const end = acc*360;
    stops.push(`${COLORS[cat]||'#666'} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`);
  });
  return stops.join(', ');
}

export function reconstructBalanceAtStartOfDay(dateStr){
  const sorted = [...state.txCache].sort((a,b)=>a.time-b.time);
  const dayStartUnix = Math.floor(new Date(dateStr+'T00:00:00').getTime()/1000);
  const firstOnOrAfter = sorted.find(it=>it.time >= dayStartUnix && it.balance!==undefined);
  if(firstOnOrAfter) return (firstOnOrAfter.balance - firstOnOrAfter.amount)/100;
  const lastBefore = [...sorted].reverse().find(it=>it.time < dayStartUnix && it.balance!==undefined);
  if(lastBefore) return lastBefore.balance/100;
  return null; // no data that far back — caller should fall back to live balance
}

// ---------- API ----------
