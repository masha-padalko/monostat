/* ==== module: debts.js (auto-generated split) ==== */
import { guessPersonName } from './monobank-api.js';
import { render } from './panels.js';
import { persistDebts } from './persistence.js';
import { state } from './state.js';
import { todayStr, txKey } from './utils.js';

export function markAsLoan(t){
  const person = prompt('Кому позика? (ім\'я для трекера боргів)', guessPersonName(t.desc));
  if(person===null) return;
  const debt = {
    id: 'd_'+Date.now(),
    person: person.trim() || guessPersonName(t.desc),
    amount: Math.abs(t.amount),
    remaining: Math.abs(t.amount),
    dateGiven: t.date instanceof Date ? todayStr(t.date) : t.date,
    status: 'open'
  };
  state.debts.push(debt);
  state.loanKeys[txKey(t)] = debt.id;
  persistDebts();
  render();
}

export function closeDebtWithIncoming(debtId, incomingTx){
  const debt = state.debts.find(d=>d.id===debtId);
  if(!debt) return;
  const applyAmt = Math.min(debt.remaining, incomingTx.amount);
  debt.remaining = Math.round((debt.remaining - applyAmt)*100)/100;
  if(debt.remaining <= 0.5) debt.status = 'closed';
  state.usedIncoming[txKey(incomingTx)] = debtId;
  persistDebts();
  render();
}

export function closeDebtManually(debtId){
  const debt = state.debts.find(d=>d.id===debtId);
  if(!debt) return;
  debt.remaining = 0;
  debt.status = 'closed';
  persistDebts();
  render();
}

export function addManualDebt(person, amount, date){
  const debt = {id:'d_'+Date.now(), person, amount:Math.abs(amount), remaining:Math.abs(amount), dateGiven:date, status:'open', manual:true};
  state.debts.push(debt);
  persistDebts();
  render();
}
