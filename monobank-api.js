/* ==== module: monobank-api.js (auto-generated split) ==== */
import { categoryFor } from './categorize.js';
import { render, updateJarAccumulation } from './panels.js';
import { mergeIntoCache, persistAmountOverride } from './persistence.js';
import { state } from './state.js';
import { storageSet } from './storage.js';
import { txKey } from './utils.js';

export async function fetchClientInfo(token){
  const res = await fetch('https://api.monobank.ua/personal/client-info', {headers:{'X-Token':token}});
  if(!res.ok) throw new Error('HTTP '+res.status);
  return res.json();
}

export async function fetchStatement(token, account, fromUnix, toUnix){
  const url = `https://api.monobank.ua/personal/statement/${account}/${fromUnix}/${toUnix}`;
  const res = await fetch(url, {headers:{'X-Token':token}});
  if(!res.ok) throw new Error('HTTP '+res.status);
  return res.json();
}

export function mapRawItem(it){
  return {
    id: it.id, date: new Date(it.time*1000), desc: (it.description||'(без опису)').trim(),
    mcc: it.mcc, amount: it.amount/100, currency: it.currencyCode
  };
}

export function ingestTransactions(items){
  state.txs = items.map(mapRawItem);
}

// Full-history expenses (across every period ever cached, not just what's currently
// loaded/shown) — used for "Подорожі", since a trip's purchases can span months and
// she shouldn't have to keep the exact right period loaded just to tag them.

export function getAllHistoricalExpenses(){
  const fromCache = state.txCache
    .map(mapRawItem)
    .filter(t=>t.amount<0 && !state.loanKeys[txKey(t)])
    .map(t=>({...t, cat: categoryFor(t)}));
  const fromManual = state.manual
    .filter(m=>m.amount<0)
    .map(m=>({date:new Date(m.date), desc:m.desc, amount:m.amount, cat:m.cat, manual:true}));
  return fromCache.concat(fromManual);
}

// Previous-month tab reads straight from the local cache — no API call. If that month
// was never fetched before, the cache simply won't have it (shown as an empty state).

export function getPrevMonthRange(){
  // aligned to her actual budgeting cycle — ends ON the 10th itself (state.from), starts
  // exactly one month earlier
  const base = state.from ? new Date(state.from+'T00:00:00') : new Date();
  const prevEnd = new Date(base);
  const prevStart = new Date(base.getFullYear(), base.getMonth()-1, base.getDate());
  return {start: prevStart, end: prevEnd};
}

export function getActiveRawTxs(){
  if(state.viewTab !== 'previous') return state.txs;
  const {start, end} = getPrevMonthRange();
  end.setHours(23,59,59,999);
  return state.txCache
    .filter(it=>{ const d = it.time*1000; return d >= start.getTime() && d <= end.getTime(); })
    .map(mapRawItem);
}

export function autoNetRefunds(rawTxs){
  const byDesc = {};
  rawTxs.forEach(t=>{ (byDesc[t.desc] = byDesc[t.desc]||[]).push(t); });
  let changed = false;
  const GAP_MS = 14*24*60*60*1000;
  Object.values(byDesc).forEach(group=>{
    group.sort((a,b)=>a.date-b.date);
    const usedRefunds = new Set();
    group.forEach(expense=>{
      if(expense.amount >= 0) return; // only look for refunds against actual charges
      const key = txKey(expense);
      if(state.amountOverride[key] !== undefined) return; // already netted earlier
      const refund = group.find(r=>
        !usedRefunds.has(r) && r.amount > 0 &&
        r.date > expense.date && (r.date - expense.date) <= GAP_MS &&
        r.amount <= Math.abs(expense.amount) + 0.5
      );
      if(refund){
        usedRefunds.add(refund);
        state.amountOverride[key] = expense.amount + refund.amount; // still negative, just smaller
        changed = true;
      }
    });
  });
  if(changed) persistAmountOverride();
}

export async function handleConnect(){
  state.error = null;
  state.loading = true; render();
  try{
    const info = await fetchClientInfo(state.token.trim());
    state.accounts = info.accounts.map(a=>({
      id:a.id, pan: (a.maskedPan&&a.maskedPan[0])||a.iban.slice(-6), type:a.type,
      currency:a.currencyCode, balance:a.balance
    }));
    // default to her main card by mask; falls back to the first account if it's not found
    const DEFAULT_PAN = '444111******0137';
    const preferred = state.accounts.find(a=>a.pan===DEFAULT_PAN);
    state.selectedAccount = (preferred || state.accounts[0])?.id || null;
    state.step = 'accounts';
    if(state.rememberToken) await storageSet('ms_token', state.token.trim());
  }catch(e){
    state.error = 'connect';
  }
  state.loading = false; render();
}

export async function handleFetchStatement(){
  state.error = null;
  state.loading = true; render();
  try{
    const fromUnix = Math.floor(new Date(state.from+'T00:00:00').getTime()/1000);
    const toUnix = Math.floor(new Date(state.to+'T23:59:59').getTime()/1000);
    const items = await fetchStatement(state.token.trim(), state.selectedAccount, fromUnix, toUnix);
    mergeIntoCache(items);
    ingestTransactions(items);
    state.viewTab = 'current';
    state.step = 'results';
    await updateJarAccumulation(); // finish this BEFORE the first render of results, no stale flash
  }catch(e){
    state.error = 'statement';
  }
  state.loading = false; render();
}

export async function handleFetchTodayYesterday(){
  state.todayLoading = true; render();
  try{
    const from = new Date(); from.setDate(from.getDate()-1); from.setHours(0,0,0,0);
    const to = new Date();
    const items = await fetchStatement(state.token.trim(), state.selectedAccount,
      Math.floor(from.getTime()/1000), Math.floor(to.getTime()/1000));
    state.todayTxs = items.map(it=>({date:new Date(it.time*1000), amount:it.amount/100, desc: (it.description||'(без опису)').trim(), mcc: it.mcc, currency: it.currencyCode}));
  }catch(e){
    state.todayTxs = null;
  }
  state.todayLoading = false; render();
}

export function parseManualJson(){
  try{
    const items = JSON.parse(state.manualJsonText);
    ingestTransactions(items);
    state.step = 'results';
    state.error = null;
  }catch(e){
    state.error = 'json';
  }
  render();
}

// ---------- rendering ----------

export const INCOMING_SELF_KEYWORDS = ['From UAH account','Cancellation','Cashback withdrawal','Partial cash out','Top up'];

export function guessPersonName(desc){
  let d = desc.trim();
  if(d.startsWith('From:')) d = d.slice(5).trim();
  return d;
}
