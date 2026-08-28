/* ==== module: panels.js (auto-generated split) ==== */
import { authUserId, rememberLogin, requestPasswordReset, signIn, signOutAuth, signUp } from './auth.js';
import { COLORS, ICONS, TRIP_GROUP_ICONS, TRIP_GROUP_ORDER, addCustomCategory, categoryFor, handleCategoryChange, sortedCats, tripGroupFor } from './categorize.js';
import { addManualDebt, closeDebtManually, closeDebtWithIncoming } from './debts.js';
import { INCOMING_SELF_KEYWORDS, getActiveRawTxs, getAllHistoricalExpenses, getPrevMonthRange, handleConnect, handleFetchStatement, handleFetchTodayYesterday, parseManualJson } from './monobank-api.js';
import { clearTxCache, exportData, importDataFromFile, loadPersisted, noteButtonHandler, persistManual, toggleDayExcluded, toggleNotExpense } from './persistence.js';
import { CATS, state } from './state.js';
import { storageSet } from './storage.js';
import { addTrip, assignTrip, deleteTrip, renameTrip, setTripDates } from './trips.js';
import { buildConicGradient, curCode, curSym, daysAgoStr, daysUntilPeriodEnd, defaultPeriodStart, escapeHtml, fmt, fmtEur, reconstructBalanceAtStartOfDay, todayStr, txKey } from './utils.js';

export function render(){
  const app = document.getElementById('app');
  app.innerHTML = '';
  if(!authUserId){
    app.appendChild(authPanel());
  }else{
    if(state.step==='connect') app.appendChild(connectPanel());
    if(state.step==='accounts') app.appendChild(accountsPanel());
    if(state.step==='results'){
      app.appendChild(resultsPanel());
    }
  }
  updateSignOutSlot();
}

export function authPanel(){
  const p = document.createElement('div');
  p.className = 'ms-panel';
  p.innerHTML = `
    <h2>Вхід</h2>
    <p class="ms-hint">Дані тепер прив'язані до твого акаунту — без входу їх ніхто (навіть ти з іншого пристрою без входу) не побачить.</p>
    <div class="ms-row">
      <div class="ms-field"><label>Email</label><input type="email" id="authEmail" placeholder="you@example.com"></div>
      <div class="ms-field"><label>Пароль</label><input type="password" id="authPassword" placeholder="••••••••"></div>
    </div>
    <label class="ms-checkline" style="margin-top:8px">
      <input type="checkbox" id="rememberLoginChk" ${rememberLogin?'checked':''}>
      <span>Запам'ятати мене на цьому пристрої (інакше вийдеш автоматично, коли закриєш вкладку)</span>
    </label>
    <div class="ms-row" style="margin-top:10px">
      <button class="ms-btn" id="authSignInBtn">Увійти</button>
      <button class="ms-btn secondary" id="authSignUpBtn">Створити акаунт (перший раз)</button>
    </div>
    <button class="ms-icon-btn" id="forgotPasswordBtn" style="margin-top:8px;opacity:.8;text-decoration:underline">Забула пароль?</button>
    ${state.authError ? `<div class="ms-error">${escapeHtml(state.authError)}</div>` : ''}
    ${state.authNotice ? `<p class="ms-hint" style="color:var(--teal)">${escapeHtml(state.authNotice)}</p>` : ''}
  `;
  const doAuth = async (fn)=>{
    const email = p.querySelector('#authEmail').value.trim();
    const password = p.querySelector('#authPassword').value;
    const remember = p.querySelector('#rememberLoginChk').checked;
    if(!email || !password){ state.authError = 'Впиши email і пароль.'; render(); return; }
    state.authNotice = null;
    const { error } = await fn(email, password, remember);
    if(error){ state.authError = error.message; render(); return; }
    state.authError = null;
    await loadPersisted();
    if(!state.from) state.from = defaultPeriodStart(); // was missing — caused NaN/NaN in the statement URL
    if(!state.to) state.to = todayStr();
    render();
  };
  p.querySelector('#authSignInBtn').addEventListener('click', ()=>doAuth(signIn));
  p.querySelector('#authSignUpBtn').addEventListener('click', ()=>doAuth(signUp));
  p.querySelector('#forgotPasswordBtn').addEventListener('click', async ()=>{
    const email = p.querySelector('#authEmail').value.trim();
    if(!email){ state.authError = 'Впиши email вище, потім тисни «Забула пароль?».'; render(); return; }
    const { error } = await requestPasswordReset(email);
    state.authError = error ? error.message : null;
    state.authNotice = error ? null : `Лист для скидання пароля надіслано на ${email} — перевір пошту (і теку «Спам»).`;
    render();
  });
  return p;
}

// Header text and footer note are static — they live directly in index.html now and
// are never rebuilt. Only the sign-out button is dynamic, so it gets its own tiny
// targeted update instead of the whole header being torn down and rebuilt every render().
export function updateSignOutSlot(){
  const slot = document.getElementById('ms-signout-slot');
  if(!slot) return;
  slot.innerHTML = authUserId ? `<button class="ms-btn secondary" id="signOutBtn" style="margin-top:8px">Вийти з акаунту</button>` : '';
  const signOutBtn = slot.querySelector('#signOutBtn');
  if(signOutBtn) signOutBtn.addEventListener('click', async ()=>{ await signOutAuth(); render(); });
}

export function connectPanel(){
  const p = document.createElement('div');
  p.className='ms-panel';
  p.innerHTML = `
    <h2>Крок 1 · Підключення</h2>
    ${state.initialLoading ? `<p class="ms-hint"><span class="ms-spin"></span> Завантажую збережені дані…</p>` : ''}
    <p class="ms-hint">Токен отримується на <span style="color:var(--gold)">api.monobank.ua</span> (вхід через QR у застосунку). Він діє доти, доки ти його не відкличеш там само.</p>
    <div class="ms-row">
      <div class="ms-field" style="flex:2">
        <label>Особистий токен</label>
        <input type="password" id="tokenInput" placeholder="u3AulkpZFI1lIu..." value="${escapeHtml(state.token)}" ${state.initialLoading?'disabled':''}>
      </div>
      <button class="ms-btn" id="connectBtn" ${state.loading||state.initialLoading?'disabled':''}>${state.loading?'<span class="ms-spin"></span>Підключення…':'Підключити'}</button>
    </div>
    <label class="ms-checkline">
      <input type="checkbox" id="rememberChk" ${state.rememberToken?'checked':''}>
      <span>Запам'ятати токен на цьому пристрої, щоб не вводити щоразу. Він збережеться у сховищі цієї розмови — вимикай, якщо не хочеш цього.</span>
    </label>
    ${state.error==='connect' ? `<div class="ms-error">Не вдалося підключитися. Або токен невірний, або (найімовірніше) браузер заблокував запит через CORS — Monobank API не завжди дозволяє звертання напряму з чужих сторінок.<br><br>Запасний варіант: відкрий у новій вкладці <code>https://api.monobank.ua/personal/client-info</code> з заголовком <code>X-Token</code> (наприклад через розширення на кшталт "Requestly" чи через термінал: <code>curl -H "X-Token: ТВІЙ_ТОКЕН" https://api.monobank.ua/personal/statement/0/UNIX_FROM/UNIX_TO</code>), скопіюй відповідь і встав нижче.</div>
    <button class="ms-btn secondary" id="jsonModeBtn" style="margin-top:10px">Вставити дані вручну (JSON)</button>` : ''}
    ${state.manualJsonMode ? manualJsonBlock() : ''}
  `;
  p.querySelector('#tokenInput').addEventListener('input', e=>state.token=e.target.value);
  p.querySelector('#rememberChk').addEventListener('change', async e=>{
    state.rememberToken = e.target.checked;
    if(state.rememberToken && state.token.trim()){
      await storageSet('ms_token', state.token.trim());
    }else if(!state.rememberToken){
      await storageSet('ms_token', '');
    }
  });
  p.querySelector('#connectBtn').addEventListener('click', handleConnect);
  const jbtn = p.querySelector('#jsonModeBtn');
  if(jbtn) jbtn.addEventListener('click', ()=>{state.manualJsonMode=true; render();});
  const jarea = p.querySelector('#manualJsonArea');
  if(jarea) jarea.addEventListener('input', e=>state.manualJsonText=e.target.value);
  const jsub = p.querySelector('#manualJsonSubmit');
  if(jsub) jsub.addEventListener('click', parseManualJson);
  return p;
}

export function manualJsonBlock(){
  return `
    <div style="margin-top:14px">
      <div class="ms-field">
        <label>Вставлений JSON виписки (масив об'єктів із полями description, mcc, amount, time)</label>
        <textarea id="manualJsonArea" rows="6" style="background:var(--bg);border:1px solid var(--line);color:var(--text);border-radius:8px;padding:10px;font-family:var(--font-mono);font-size:12px;">${escapeHtml(state.manualJsonText)}</textarea>
      </div>
      ${state.error==='json' ? '<div class="ms-error">Не вдалося розпізнати JSON — перевір, що це саме масив операцій, скопійований повністю.</div>':''}
      <button class="ms-btn" id="manualJsonSubmit" style="margin-top:10px">Показати статистику</button>
    </div>
  `;
}

export function accountsPanel(){
  const p = document.createElement('div');
  p.className='ms-panel';
  const currNames = {980:'UAH',978:'EUR',840:'USD',985:'PLN',946:'RON'};
  p.innerHTML = `
    <h2>Крок 2 · Обери картку та період</h2>
    <p class="ms-hint">Знайдено ${state.accounts.length} рахунків/карток.</p>
    <div class="ms-accounts" id="accList"></div>
    <div class="ms-row" style="margin-top:16px">
      <div class="ms-field"><label>З дати</label><input type="date" id="fromInput" value="${state.from||defaultPeriodStart()}"></div>
      <div class="ms-field"><label>По дату</label><input type="date" id="toInput" value="${state.to||todayStr()}"></div>
      <button class="ms-btn" id="loadBtn" ${state.loading?'disabled':''}>${state.loading?'<span class="ms-spin"></span>Завантаження…':'Завантажити виписку'}</button>
    </div>
    <p class="ms-hint" style="margin-top:8px">Максимум — 31 доба за раз (обмеження API).</p>
    <p class="ms-hint">У кеші зараз ${state.txCache.length} операцій з минулих завантажень — після завантаження нового періоду попередній місяць можна буде глянути окремою вкладкою «Попередній місяць», без нового запиту.</p>
    ${state.txCache.length ? `<button class="ms-btn secondary" id="clearCacheBtn" style="margin-top:10px">Очистити кеш (${state.txCache.length} оп.)</button>` : ''}
    ${state.error==='statement' ? '<div class="ms-error">Не вдалося отримати виписку. Перевір період (не більше 31 дня) і що з моменту підключення пройшло хоч трохи часу — API дозволяє один запит на 60 секунд.</div>':''}
  `;
  const list = p.querySelector('#accList');
  state.accounts.forEach(a=>{
    const row = document.createElement('div');
    row.className = 'ms-account'+(a.id===state.selectedAccount?' selected':'');
    row.innerHTML = `<span>${a.type} · ${currNames[a.currency]||a.currency}</span><span class="pan">${a.pan}</span>`;
    row.addEventListener('click', ()=>{state.selectedAccount=a.id; render();});
    list.appendChild(row);
  });
  p.querySelector('#fromInput').addEventListener('input', e=>state.from=e.target.value);
  p.querySelector('#toInput').addEventListener('input', e=>state.to=e.target.value);
  p.querySelector('#loadBtn').addEventListener('click', handleFetchStatement);
  const clearBtn = p.querySelector('#clearCacheBtn');
  if(clearBtn) clearBtn.addEventListener('click', ()=>{
    if(confirm('Очистити весь локальний кеш минулих періодів? Дію не можна скасувати (але сама виписка на сервері Monobank нікуди не дінеться — можна буде завантажити знову).')) clearTxCache();
  });
  return p;
}

export function rangePanel(){
  const p = document.createElement('div');
  p.className='ms-panel';
  const {start, end} = getPrevMonthRange();
  const prevLabel = `${start.toLocaleDateString('uk-UA',{day:'2-digit',month:'2-digit'})} – ${end.toLocaleDateString('uk-UA',{day:'2-digit',month:'2-digit'})}`;
  const prevCount = state.txCache.filter(it=>{const d=it.time*1000; return d>=start.getTime() && d<=end.setHours(23,59,59,999);}).length;
  p.innerHTML = `
    <div class="ms-row" style="align-items:center;flex-wrap:wrap">
      <div style="flex:1;font-size:13px;color:var(--muted)">Період: <b style="color:var(--text)">${state.from} → ${state.to}</b></div>
      <button class="ms-btn secondary" id="backBtn">Змінити період</button>
    </div>
    <div class="ms-row" style="margin-top:10px;gap:8px">
      <button class="ms-btn${state.viewTab==='current'?'':' secondary'}" id="tabCurrent" style="flex:1">Поточний період</button>
      <button class="ms-btn${state.viewTab==='previous'?'':' secondary'}" id="tabPrevious" style="flex:1">Попередній місяць (${prevLabel})${prevCount?' · '+prevCount+' оп. в кеші':' · немає в кеші'}</button>
    </div>
  `;
  p.querySelector('#backBtn').addEventListener('click', ()=>{state.step='accounts'; render();});
  p.querySelector('#tabCurrent').addEventListener('click', ()=>{state.viewTab='current'; render();});
  p.querySelector('#tabPrevious').addEventListener('click', ()=>{state.viewTab='previous'; render();});
  return p;
}

export function buildTodayPanel(all){
  const p = document.createElement('div');
  p.className='ms-panel';

  const todayKey = todayStr();
  const yestKey = daysAgoStr(1);

  const inRange = (key)=> state.from && state.to && key>=state.from && key<=state.to;
  const haveFresh = inRange(todayKey) || inRange(yestKey) || state.todayTxs;

  let source;
  if(inRange(todayKey) || inRange(yestKey)){
    source = all;
  }else{
    source = (state.todayTxs || [])
      .filter(t=>t.amount<0 && !state.loanKeys[txKey(t)])
      .map(t=>({...t, cat: categoryFor(t)}));
  }

  const forDay = (key)=> source.filter(t=>{
    const k = t.date instanceof Date ? todayStr(t.date) : String(t.date).slice(0,10);
    return k===key;
  }).sort((a,b)=>b.date-a.date);

  const todayList = forDay(todayKey);
  const yestList = forDay(yestKey);
  const todayAmt = todayList.filter(t=>!state.dayExcluded[txKey(t)]).reduce((s,t)=>s+Math.abs(t.amount),0);
  const yestAmt = yestList.filter(t=>!state.dayExcluded[txKey(t)]).reduce((s,t)=>s+Math.abs(t.amount),0);

  const cardHtml = (label, amt)=>{
    if(!haveFresh){
      return `<div class="ms-today-card"><div class="ms-today-lbl">${label}</div><div class="ms-today-empty">${state.todayLoading?'завантаження…':'дані не завантажені'}</div></div>`;
    }
    return `<div class="ms-today-card highlight"><div class="ms-today-lbl">${label}</div><div class="ms-today-amt">${fmt(amt)} ${curSym()}</div></div>`;
  };

  p.innerHTML = `<h2>Зараз</h2><p class="ms-hint">Оновлюється щоразу, як заходиш — без потреби гортати графік. Категорію тут теж можна поправити — зміна застосується і у загальній виписці, і надалі.</p>
    <div class="ms-today-row">
      ${cardHtml('Сьогодні', todayAmt)}
      ${cardHtml('Вчора', yestAmt)}
    </div>
    ${!haveFresh && !state.todayLoading ? '<button class="ms-btn secondary" id="loadTodayBtn" style="margin-top:12px;width:100%">Підвантажити сьогодні і вчора окремо</button>' : ''}
  `;
  const btn = p.querySelector('#loadTodayBtn');
  if(btn) btn.addEventListener('click', handleFetchTodayYesterday);

  if(haveFresh){
    if(todayList.length) p.appendChild(buildDayTxList('Сьогодні — операції', todayList));
    if(yestList.length) p.appendChild(buildDayTxList('Вчора — операції', yestList));
  }
  return p;
}

export function buildDayTxList(label, list){
  const wrap = document.createElement('div');
  wrap.className = 'ms-today-breakdown';
  const lbl = document.createElement('div');
  lbl.className = 'ms-today-breakdown-lbl';
  lbl.textContent = label;
  wrap.appendChild(lbl);
  list.forEach(t=>{
    const key = txKey(t);
    const excluded = !!state.dayExcluded[key];
    const row = document.createElement('div');
    row.className = 'ms-today-cat-row';
    if(excluded) row.style.opacity = '.45';
    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.checked = !excluded;
    chk.title = 'Прибрати з підрахунку суми за день (наприклад, переказ, який не є тратою)';
    chk.addEventListener('change', e=>toggleDayExcluded(key, e.target.checked));
    const icon = document.createElement('span');
    icon.className = 'ms-legend-icon';
    icon.textContent = ICONS[t.cat] || '❓';
    const name = document.createElement('span');
    name.className = 'ms-today-cat-name';
    name.textContent = t.desc;
    const amt = document.createElement('span');
    amt.className = 'ms-today-cat-amt';
    amt.textContent = fmt(Math.abs(t.amount)) + ' ' + curSym();
    const sel = document.createElement('select');
    sel.className = 'ms-cat-select';
    sortedCats().forEach(c=>{
      const opt = document.createElement('option');
      opt.value = c; opt.textContent = c;
      if(c===t.cat) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', e=>{ handleCategoryChange(t, e.target.value); });
    row.appendChild(chk);
    row.appendChild(icon);
    row.appendChild(name);
    row.appendChild(amt);
    row.appendChild(sel);
    wrap.appendChild(row);
  });
  return wrap;
}

export function resultsPanel(){
  const p = document.createElement('div');

  const activeTxs = getActiveRawTxs();
  const isPrevTab = state.viewTab === 'previous';

  const expenses = activeTxs.filter(t=>t.amount<0 && !state.loanKeys[txKey(t)]).map(t=>({
    ...t, cat: categoryFor(t)
  }));
  const manualExpenses = state.manual.filter(m=>{
    if(m.amount>=0) return false;
    const d = new Date(m.date).getTime();
    if(isPrevTab){
      const {start,end} = getPrevMonthRange();
      end.setHours(23,59,59,999);
      return d>=start.getTime() && d<=end.getTime();
    }
    // current tab — only manual entries dated within the actually-selected period
    const periodStart = new Date(state.from+'T00:00:00').getTime();
    const periodEnd = new Date(state.to+'T23:59:59').getTime();
    return d>=periodStart && d<=periodEnd;
  });
  const all = expenses.concat(manualExpenses.map(m=>({date:new Date(m.date),desc:m.desc,amount:m.amount,cat:m.cat,manual:true})));

  const total = all.reduce((s,t)=>s+t.amount,0);
  const byCat = {};
  all.forEach(t=>{ byCat[t.cat] = (byCat[t.cat]||0) + t.amount; });
  const catList = Object.entries(byCat).sort((a,b)=>a[1]-b[1]);

  const panelToday = buildTodayPanel(all);

  // days in the active period, for "середня трата в день"
  let periodDays;
  if(isPrevTab){
    const {start,end} = getPrevMonthRange();
    periodDays = Math.round((end.getTime()-start.getTime())/(24*60*60*1000))+1;
  }else{
    const f = new Date(state.from+'T00:00:00'), t = new Date(state.to+'T00:00:00');
    periodDays = Math.max(1, Math.round((t.getTime()-f.getTime())/(24*60*60*1000))+1);
  }
  const avgPerDay = Math.abs(total)/periodDays;

  const panel1 = document.createElement('div');
  panel1.className='ms-panel';
  const donutGradient = buildConicGradient(catList, total);

  // trip spend for THIS period only (not all-time) — she can already see full-trip
  // totals in "Подорожі", this is specifically "how much of THIS period was travel"
  const tripSpendByTrip = {};
  all.forEach(t=>{
    const tid = state.tripOf[txKey(t)];
    if(tid) tripSpendByTrip[tid] = (tripSpendByTrip[tid]||0) + Math.abs(t.amount);
  });
  const tripEntries = Object.entries(tripSpendByTrip)
    .map(([tid,sum])=>({name: state.trips.find(t=>t.id===tid)?.name || '?', sum}))
    .sort((a,b)=>b.sum-a.sum);
  const tripPeriodTotal = tripEntries.reduce((s,e)=>s+e.sum,0);

  panel1.innerHTML = `
    <h2>Загальна картина</h2>
    ${tripPeriodTotal>0 ? `<div class="ms-hint" style="margin-bottom:8px">🧳 Поїздки за цей період: <b style="color:var(--text)">${fmt(tripPeriodTotal)} ${curSym()}</b>${fmtEur(tripPeriodTotal, curCode())}${tripEntries.length>1 ? ' — '+tripEntries.map(e=>`${escapeHtml(e.name)}: ${fmt(e.sum)} ${curSym()}`).join(', ') : ''}</div>` : ''}
    <div class="ms-hero">
      <div class="ms-donut-wrap">
        <div class="ms-donut" style="background:conic-gradient(${donutGradient})"></div>
        <div class="ms-donut-center">
          <div class="amt">${fmt(total)}</div>
          <div class="lbl">${curSym()} витрачено</div>
          <div class="lbl" style="margin-top:2px;opacity:.75">${fmtEur(total, curCode()).trim()}</div>
        </div>
      </div>
      <div class="ms-legend" id="legendWrap"></div>
    </div>
    <div class="ms-hint" style="margin-top:6px;text-align:center">Середня трата в день: <b style="color:var(--text)">${fmt(avgPerDay)} ${curSym()}</b> ${fmtEur(avgPerDay, curCode())} · за ${periodDays} дн.</div>
  `;
  const legend = panel1.querySelector('#legendWrap');
  const byCatTx = {};
  all.forEach(t=>{ (byCatTx[t.cat] = byCatTx[t.cat]||[]).push(t); });

  catList.forEach(([cat,sum])=>{
    const row = document.createElement('div');
    row.className='ms-legend-row ms-legend-row-clickable';
    const pct = ((Math.abs(sum)/Math.abs(total))*100).toFixed(1);
    const expanded = !!state.expandedCats[cat];
    row.innerHTML = `<span class="ms-legend-chevron">${expanded?'▾':'▸'}</span>
      <span class="ms-dot" style="background:${COLORS[cat]||'#666'}"></span>
      <span class="ms-legend-icon">${ICONS[cat]||'❓'}</span>
      <span class="ms-legend-cat">${cat}</span>
      <span class="ms-legend-amt">${fmt(sum)} ${curSym()}</span>
      <span class="ms-legend-pct">${pct}%</span>`;
    row.addEventListener('click', ()=>{
      state.expandedCats[cat] = !state.expandedCats[cat];
      render();
    });
    legend.appendChild(row);

    if(expanded){
      const detail = document.createElement('div');
      detail.className = 'ms-legend-detail';
      (byCatTx[cat]||[]).sort((a,b)=>b.date-a.date).forEach(t=>{
        const key = txKey(t);
        const note = state.notes[key];
        const dRow = document.createElement('div');
        dRow.className = 'ms-legend-detail-row';
        const dateStr = t.date.toLocaleDateString('uk-UA',{day:'2-digit',month:'2-digit'});
        dRow.innerHTML = `<span style="min-width:40px;color:var(--muted)">${dateStr}</span><span style="flex:1">${escapeHtml(t.desc)}</span><span class="ms-amt-neg">−${fmt(t.amount)} ${curSym()}</span>`;
        const noteBtn = document.createElement('button');
        noteBtn.className = 'ms-note-btn'+(note?' has-note':'');
        noteBtn.textContent = '📝';
        noteBtn.title = note ? 'Редагувати нотатку' : 'Додати нотатку (наприклад, доля у спільній тратi)';
        noteBtn.addEventListener('click', ()=>noteButtonHandler(t, key, note));
        dRow.appendChild(noteBtn);
        detail.appendChild(dRow);
        if(note){
          const noteP = document.createElement('div');
          noteP.className = 'ms-note-preview';
          noteP.style.marginLeft = '48px';
          noteP.textContent = '📝 '+note;
          detail.appendChild(noteP);
        }
      });
      legend.appendChild(detail);
    }
  });



  const panel2 = document.createElement('div');
  panel2.className='ms-panel';
  panel2.innerHTML = `<h2>Всі операції</h2><p class="ms-hint">Категорію можна змінити прямо тут — вибір запам'ятається для цього мерчанта надалі. Іконкою 📝 можна додати нотатку до конкретної покупки — що це було насправді. У колонці «Поїздка» можна прив'язати трату до конкретної подорожі (створюються нижче, в «Подорожі»). Галочка «чисто» — познач, якщо це насправді не витрата (повернули гроші, поповнення фонду тощо) — вплине на «Чисті трати» нижче.</p>
    <div class="ms-field" style="margin-bottom:10px">
      <input type="text" id="txSearchInput" placeholder="Пошук за описом або власною нотаткою…" value="${escapeHtml(state.txSearchQuery||'')}">
    </div>
    <div style="font-size:13px;color:var(--muted);margin-bottom:12px" id="txSearchSummary">Разом витрачено: <b style="color:var(--gold);font-family:var(--font-mono)">${fmt(total)} ${curSym()}</b>${fmtEur(total, curCode())} · ${all.length} операцій</div>
    <div class="ms-table-wrap"><table class="ms-tx"><thead><tr><th>Дата</th><th>Опис</th><th>Категорія</th><th>Поїздка</th><th title="Не витрата">Чисто</th><th style="text-align:right">Сума</th></tr></thead><tbody id="txBody"></tbody></table></div>`;
  const tbody = panel2.querySelector('#txBody');
  all.sort((a,b)=>b.date-a.date).forEach(t=>{
    const tr = document.createElement('tr');
    const dateStr = t.date.toLocaleDateString('uk-UA',{day:'2-digit',month:'2-digit'});
    const key = txKey(t);
    const existingNote = state.notes[key];
    tr.dataset.search = (t.desc+' '+(existingNote||'')).toLowerCase();
    const isNotExpense = !!state.notExpense[key];
    if(isNotExpense) tr.style.opacity = '.45';

    const sel = document.createElement('select');
    sel.className='ms-cat-select';
    sortedCats().forEach(c=>{
      const opt = document.createElement('option');
      opt.value=c; opt.textContent=c;
      if(c===t.cat) opt.selected=true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', e=>{
      handleCategoryChange(t, e.target.value);
    });

    tr.innerHTML = `<td>${dateStr}${t.manual?' <span class="ms-tag">ручне</span>':''}</td><td></td><td></td><td></td><td style="text-align:center"></td><td style="text-align:right" class="ms-amt-neg">−${fmt(t.amount)}</td>`;

    const descCell = tr.children[1];
    const descLine = document.createElement('div');
    descLine.className = 'ms-desc-line';
    const descText = document.createElement('span');
    descText.textContent = t.desc;
    const noteBtn = document.createElement('button');
    noteBtn.className = 'ms-note-btn'+(existingNote?' has-note':'');
    noteBtn.textContent = '📝';
    noteBtn.title = existingNote ? 'Редагувати нотатку' : 'Додати нотатку';
    noteBtn.addEventListener('click', ()=>noteButtonHandler(t, key, existingNote));
    descLine.appendChild(descText);
    descLine.appendChild(noteBtn);
    descCell.appendChild(descLine);
    if(existingNote){
      const noteP = document.createElement('div');
      noteP.className = 'ms-note-preview';
      noteP.textContent = existingNote;
      descCell.appendChild(noteP);
    }

    const catCell = tr.children[2];
    catCell.style.display = 'flex';
    catCell.style.alignItems = 'center';
    catCell.appendChild(sel);

    const tripCell = tr.children[3];
    if(state.trips.length===0){
      tripCell.innerHTML = '<span style="color:var(--muted);font-size:11px">—</span>';
    }else{
      const tripSel = document.createElement('select');
      tripSel.className = 'ms-cat-select';
      const noneOpt = document.createElement('option');
      noneOpt.value = ''; noneOpt.textContent = '—';
      tripSel.appendChild(noneOpt);
      state.trips.forEach(tr2=>{
        const opt = document.createElement('option');
        opt.value = tr2.id; opt.textContent = tr2.name;
        if(state.tripOf[key]===tr2.id) opt.selected = true;
        tripSel.appendChild(opt);
      });
      tripSel.addEventListener('change', e=>{ assignTrip(key, e.target.value); });
      tripCell.appendChild(tripSel);
    }

    const cleanCell = tr.children[4];
    const cleanChk = document.createElement('input');
    cleanChk.type = 'checkbox';
    cleanChk.checked = isNotExpense;
    cleanChk.title = 'Позначити як "не витрата" (повернули гроші, поповнення фонду тощо)';
    cleanChk.addEventListener('change', e=>toggleNotExpense(key, e.target.checked));
    cleanCell.appendChild(cleanChk);

    tbody.appendChild(tr);
  });

  const TX_PREVIEW_COUNT = 8;
  const txRows = [...tbody.children];
  let txToggleBtn = null;
  if(txRows.length > TX_PREVIEW_COUNT && !state.expandedBlocks.transactions){
    txRows.slice(TX_PREVIEW_COUNT).forEach(r=>r.style.display='none');
    const moreBtn = document.createElement('button');
    moreBtn.className = 'ms-btn secondary';
    moreBtn.style.width = '100%';
    moreBtn.style.marginTop = '10px';
    moreBtn.textContent = `Показати ще ${txRows.length - TX_PREVIEW_COUNT} ▾`;
    moreBtn.addEventListener('click', ()=>{ state.expandedBlocks.transactions = true; render(); });
    panel2.appendChild(moreBtn);
    txToggleBtn = moreBtn;
  }else if(txRows.length > TX_PREVIEW_COUNT){
    const lessBtn = document.createElement('button');
    lessBtn.className = 'ms-btn secondary';
    lessBtn.style.width = '100%';
    lessBtn.style.marginTop = '10px';
    lessBtn.textContent = 'Згорнути ▴';
    lessBtn.addEventListener('click', ()=>{ state.expandedBlocks.transactions = false; render(); });
    panel2.appendChild(lessBtn);
    txToggleBtn = lessBtn;
  }

  // Search filters rows directly in the DOM (no render()) so the input never loses
  // focus mid-typing — it also searches her own notes, not just the merchant text.
  const txSearchInput = panel2.querySelector('#txSearchInput');
  const txSearchSummary = panel2.querySelector('#txSearchSummary');
  txSearchInput.addEventListener('input', e=>{
    const q = e.target.value.trim().toLowerCase();
    state.txSearchQuery = e.target.value; // remembered for display only, doesn't trigger render
    if(!q){
      txRows.forEach((r,i)=>{ r.style.display = (i<TX_PREVIEW_COUNT || state.expandedBlocks.transactions) ? '' : 'none'; });
      if(txToggleBtn) txToggleBtn.style.display = '';
      txSearchSummary.innerHTML = `Разом витрачено: <b style="color:var(--gold);font-family:var(--font-mono)">${fmt(total)} ${curSym()}</b>${fmtEur(total, curCode())} · ${all.length} операцій`;
      return;
    }
    let matchCount = 0;
    txRows.forEach(r=>{
      const match = r.dataset.search.includes(q);
      r.style.display = match ? '' : 'none';
      if(match) matchCount++;
    });
    if(txToggleBtn) txToggleBtn.style.display = 'none';
    txSearchSummary.innerHTML = `Знайдено: <b style="color:var(--gold);font-family:var(--font-mono)">${matchCount}</b> з ${all.length} операцій`;
  });

  const panel3 = document.createElement('div');
  panel3.className='ms-panel';
  panel3.innerHTML = `
    <h2>Додати готівкову витрату вручну</h2>
    <div class="ms-manual-form">
      <div class="ms-field" style="max-width:140px"><label>Дата</label><input type="date" id="mDate" value="${todayStr()}"></div>
      <div class="ms-field" style="flex:2"><label>Опис</label><input type="text" id="mDesc" placeholder="Наприклад: канцтовари"></div>
      <div class="ms-field" style="max-width:120px"><label>Сума</label><input type="text" id="mAmount" placeholder="250"></div>
      <div class="ms-field" style="max-width:180px"><label>Категорія</label>
        <select id="mCat">${CATS.map(c=>`<option value="${c}">${c}</option>`).join('')}</select>
      </div>
      <button class="ms-btn" id="mAdd" style="align-self:flex-end">Додати</button>
    </div>
  `;
  panel3.querySelector('#mAdd').addEventListener('click', ()=>{
    const d = panel3.querySelector('#mDate').value;
    const desc = panel3.querySelector('#mDesc').value.trim();
    const amtRaw = panel3.querySelector('#mAmount').value;
    const amt = parseFloat(amtRaw.replace(',','.'));
    const cat = panel3.querySelector('#mCat').value;
    if(!desc || isNaN(amt)){
      alert(!desc ? 'Впиши опис витрати — без нього не зберігається.' : `Не розпізнала суму «${amtRaw}» — впиши число, наприклад 250 або 250.50.`);
      return;
    }
    state.manual.push({date:d, desc, amount:-Math.abs(amt), cat});
    persistManual();
    panel3.querySelector('#mDesc').value = '';
    panel3.querySelector('#mAmount').value = '';
    render();
  });

  const panelBalance = buildBalancePanel();
  const panelIncoming = buildIncomingPanel();
  const panelTransfer = buildDataTransferPanel();
  const panelCustomCat = buildCustomCategoryPanel();
  const panelTrips = buildTripsPanel(getAllHistoricalExpenses());
  const panelRange = rangePanel();
  const panelClean = buildCleanExpensesPanel(all, total, periodDays);
  if(state.jarEnabled && !state.jarAutoCheckedThisLoad && (state.jarPeriodStart !== defaultPeriodStart() || !state.jarLastDate || state.jarLastDate < todayStr())){
    state.jarAutoCheckedThisLoad = true;
    updateJarAccumulation().then(()=>render());
  }
  const panelDailyBudget = buildDailyBudgetPanel(all);

  const wrap = document.createElement('div');

  // row 1: period selector, full width on its own
  panelRange.style.marginBottom = '14px';
  wrap.appendChild(panelRange);

  // row 1b: balance next to the daily-budget breakdown
  const balanceRow = document.createElement('div');
  balanceRow.className = 'ms-grid';
  balanceRow.style.marginBottom = '14px';
  balanceRow.appendChild(panelBalance);
  balanceRow.appendChild(panelDailyBudget);
  wrap.appendChild(balanceRow);

  // чисті трати — right under period/balance
  panelClean.style.marginBottom = '14px';
  wrap.appendChild(panelClean);

  // row 2: overview (where balance used to be) next to today/yesterday
  const topRow = document.createElement('div');
  topRow.className = 'ms-grid';
  topRow.style.marginBottom = '14px';
  topRow.appendChild(panel1);
  topRow.appendChild(panelToday);
  wrap.appendChild(topRow);

  // two-column row: all transactions / incoming — each can expand downward in place
  const threeCol = document.createElement('div');
  threeCol.className = 'ms-grid';
  threeCol.style.marginBottom = '14px';
  threeCol.appendChild(panel2);
  threeCol.appendChild(panelIncoming);
  wrap.appendChild(threeCol);

  // small settings-style panels side by side
  const bottomRow = document.createElement('div');
  bottomRow.className = 'ms-grid';
  bottomRow.style.marginBottom = '14px';
  bottomRow.appendChild(panelCustomCat);
  bottomRow.appendChild(panelTransfer);
  wrap.appendChild(bottomRow);

  // manual cash entry — moved down, its own full-width row near the bottom
  panel3.style.marginBottom = '14px';
  wrap.appendChild(panel3);

  // big standalone section at the very bottom, separate from everything above — trips
  const divider = document.createElement('div');
  divider.className = 'ms-section-divider';
  wrap.appendChild(divider);
  wrap.appendChild(panelTrips);

  p.appendChild(wrap);
  return p;
}

export function buildCleanExpensesPanel(all, grossTotal, periodDays){
  const p = document.createElement('div');
  p.className = 'ms-panel';

  const excluded = all.filter(t=>state.notExpense[txKey(t)]);
  const excludedSum = excluded.reduce((s,t)=>s+Math.abs(t.amount),0);
  const netted = all.filter(t=>!state.notExpense[txKey(t)]);
  const cleanSum = Math.abs(netted.reduce((s,t)=>{
    const key = txKey(t);
    const amt = state.amountOverride[key] !== undefined ? state.amountOverride[key] : t.amount;
    return s + amt;
  },0));
  const nettedCount = all.filter(t=>state.amountOverride[txKey(t)]!==undefined).length;
  const grossSum = Math.abs(grossTotal);
  const avgCleanPerDay = cleanSum / Math.max(1, periodDays||1);

  p.innerHTML = `
    <h2>Чисті трати</h2>
    <p class="ms-hint">Тут враховані лише операції, не позначені як «не витрата» в таблиці «Всі операції» нижче (галочка в колонці «Чисто») — зручно для випадків на кшталт повернення й повторного списання за таксі чи квитки, або поповнення власної банки на щось (на кшталт «Фонд на машину»), яке не є реальною тратою.</p>
    <div class="ms-row" style="gap:20px;flex-wrap:wrap">
      <div>
        <div class="ms-hint" style="margin:0">Валовий підсумок (як у «Загальна картина»)</div>
        <div class="ms-today-amt" style="font-size:20px">${fmt(grossSum)} ${curSym()}</div>
      </div>
      <div>
        <div class="ms-hint" style="margin:0">Чисті трати</div>
        <div class="ms-today-amt" style="font-size:20px;color:var(--teal)">${fmt(cleanSum)} ${curSym()}</div>
        <div class="ms-hint" style="margin:0;opacity:.8">${fmtEur(cleanSum, curCode()).trim()}</div>
      </div>
      <div>
        <div class="ms-hint" style="margin:0">Середня чиста трата в день</div>
        <div class="ms-today-amt" style="font-size:20px;color:var(--gold)">${fmt(avgCleanPerDay)} ${curSym()}</div>
        <div class="ms-hint" style="margin:0;opacity:.8">${fmtEur(avgCleanPerDay, curCode()).trim()} · за ${periodDays||1} дн.</div>
      </div>
      <div>
        <div class="ms-hint" style="margin:0">Виключено</div>
        <div class="ms-today-amt" style="font-size:20px;color:var(--muted)">${excluded.length} оп. · ${fmt(excludedSum)} ${curSym()}</div>
      </div>
    </div>
  `;
  return p;
}

export function buildBalancePanel(){
  const p = document.createElement('div');
  p.className='ms-panel';
  const acc = state.accounts.find(a=>a.id===state.selectedAccount);
  const currNames = {980:'UAH',978:'EUR',840:'USD',985:'PLN',946:'RON'};
  if(!acc){ p.innerHTML = ''; return p; }
  p.innerHTML = `
    <h2>Баланс картки</h2>
    <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap">
      <span class="ms-today-amt" style="font-size:26px">${fmt(acc.balance/100)} ${currNames[acc.currency]||acc.currency}</span>
      <span class="ms-hint" style="margin:0">${acc.type} · ${acc.pan}</span>
    </div>
  `;
  return p;
}

// How much she can spend per day for the rest of this budgeting period (balance split
// evenly across the days left until the 10th), plus a day-by-day look back at whether
// she stayed under that line — days she did are highlighted, so she knows what's left
// to send to the savings jar.

export function effectiveAmountGlobal(t){
  const key = txKey(t);
  if(state.notExpense[key]) return 0;
  return Math.abs(state.amountOverride[key] !== undefined ? state.amountOverride[key] : t.amount);
}

export async function setJarEnabled(enabled, startDate){
  state.jarEnabled = enabled;
  state.jarDraftStartDate = null; // committed now — stop overriding the input with a stale draft
  await storageSet('ms_jarenabled', String(enabled));
  if(enabled){
    const chosenStart = startDate || todayStr();
    const acc = state.accounts.find(a=>a.id===state.selectedAccount);
    // if she picked a past date, reconstruct that day's opening balance from the cache
    // (Monobank gives a `balance` field per transaction); fall back to live balance
    // if that's today, or if we simply don't have cache reaching back that far
    let baseBalance;
    if(chosenStart === todayStr()){
      baseBalance = acc ? acc.balance/100 : 0;
    }else{
      baseBalance = reconstructBalanceAtStartOfDay(chosenStart);
      if(baseBalance===null) baseBalance = acc ? acc.balance/100 : 0; // best available fallback
    }
    state.jarDailyBudget = baseBalance / daysUntilPeriodEnd(chosenStart);
    state.jarPending = 0;
    state.jarLastDate = chosenStart;
    state.jarStartDateActual = chosenStart;
    state.jarPeriodStart = defaultPeriodStart();
    await storageSet('ms_jardailybudget', JSON.stringify(state.jarDailyBudget));
    await storageSet('ms_jarstartdateactual', state.jarStartDateActual);
    await storageSet('ms_jarpending', JSON.stringify(state.jarPending));
    await storageSet('ms_jarlastdate', state.jarLastDate);
    await storageSet('ms_jarperiodstart', state.jarPeriodStart);
    await updateJarAccumulation(); // immediately backfill from chosenStart to today using real cached spend
  }
  render();
}

// Folds each fully-completed day's under/over-spend into a persisted running total,
// exactly once per day, always measured against the SAME frozen daily budget (set once
// when tracking was turned on) — not a number that's recalculated from today's balance.
// Resets only when a new 10th-to-10th cycle starts.

export async function updateJarAccumulation(){
  if(!state.jarEnabled) return;
  const acc = state.accounts.find(a=>a.id===state.selectedAccount);
  if(!acc) return;
  const cycleStart = defaultPeriodStart();
  const today = todayStr();
  if(state.jarPeriodStart !== cycleStart || !state.jarLastDate || state.jarDailyBudget===null){
    // new cycle (or first time tracking starts) — freeze a fresh daily budget, begin
    // clean from today, no backfilling past days she wasn't tracking for
    state.jarDailyBudget = (acc.balance/100) / daysUntilPeriodEnd();
    state.jarPending = 0;
    state.jarLastDate = today;
    state.jarStartDateActual = today;
    state.jarPeriodStart = cycleStart;
    await storageSet('ms_jardailybudget', JSON.stringify(state.jarDailyBudget));
    await storageSet('ms_jarstartdateactual', state.jarStartDateActual);
    await storageSet('ms_jarpending', JSON.stringify(state.jarPending));
    await storageSet('ms_jarlastdate', state.jarLastDate);
    await storageSet('ms_jarperiodstart', state.jarPeriodStart);
    return;
  }
  if(state.jarLastDate >= today) return; // already caught up, nothing to close out yet

  const frozenBudget = state.jarDailyBudget;
  const history = getAllHistoricalExpenses();
  let cursor = state.jarLastDate;
  while(cursor < today){
    const spentThatDay = history
      .filter(t=>todayStr(t.date)===cursor)
      .reduce((s,t)=>s+effectiveAmountGlobal(t),0);
    state.jarPending += (frozenBudget - spentThatDay);
    const d = new Date(cursor+'T00:00:00'); d.setDate(d.getDate()+1);
    cursor = todayStr(d);
  }
  state.jarLastDate = today;
  await storageSet('ms_jarpending', JSON.stringify(state.jarPending));
  await storageSet('ms_jarlastdate', state.jarLastDate);
}

// The frozen daily budget applies every day of the period, unchanged. Today's live
// remaining (budget minus what's spent so far today) is shown flowing into the jar
// total in real time, and gets permanently locked in once the day rolls over.

export function buildDailyBudgetPanel(all){
  const p = document.createElement('div');
  p.className = 'ms-panel';
  const acc = state.accounts.find(a=>a.id===state.selectedAccount);
  if(!acc){ p.innerHTML = ''; return p; }

  const days = daysUntilPeriodEnd(); // today to the 10th, inclusive
  const dailyBudget = (acc.balance/100) / days;

  p.innerHTML = `
    <h2>Скільки можна витрачати на день</h2>
    <label class="ms-checkline">
      <input type="checkbox" id="jarEnabledChk" ${state.jarEnabled?'checked':''}>
      <span>Показувати цей блок</span>
    </label>
    ${state.jarEnabled ? `
    <div style="margin-top:14px">
      <div class="ms-hint" style="margin:0">Баланс ${fmt(acc.balance/100)} ${curSym()} ÷ ${days} дн. (до 10 числа, включно)</div>
      <div class="ms-today-amt" style="font-size:24px;color:var(--gold)">${fmt(dailyBudget)} ${curSym()}</div>
      <div class="ms-hint" style="margin:0;opacity:.8">${fmtEur(dailyBudget, curCode()).trim()}</div>
    </div>
    ` : ''}
  `;
  p.querySelector('#jarEnabledChk').addEventListener('change', async e=>{
    state.jarEnabled = e.target.checked;
    await storageSet('ms_jarenabled', String(state.jarEnabled));
    render();
  });
  return p;
}

export function buildIncomingPanel(){
  const p = document.createElement('div');
  p.className='ms-panel';

  const incoming = getActiveRawTxs().filter(t=>t.amount>0);
  const external = incoming.filter(t=>!INCOMING_SELF_KEYWORDS.some(k=>t.desc.includes(k)));
  const internal = incoming.filter(t=>INCOMING_SELF_KEYWORDS.some(k=>t.desc.includes(k)));
  const totalExternal = external.reduce((s,t)=>s+t.amount,0);

  p.innerHTML = `<h2>Надходження</h2><p class="ms-hint">Гроші, які прийшли на картку за обраний період.</p>
    <div style="font-size:13px;color:var(--muted);margin-bottom:12px">Разом надійшло: <b style="color:var(--teal);font-family:var(--font-mono)">${fmt(totalExternal)} ${curSym()}</b> · ${external.length} надходжень</div>
    <div id="incExtList"></div>
    ${internal.length ? `<div class="ms-today-breakdown-lbl" style="margin-top:14px">Внутрішні перекази (не рахуються надходженням)</div><div id="incIntList"></div>` : ''}
  `;
  const extList = p.querySelector('#incExtList');
  if(external.length===0) extList.innerHTML = '<p class="ms-hint" style="margin:0">За цей період надходжень не було.</p>';
  const sortedExternal = external.sort((a,b)=>b.date-a.date);
  const INC_PREVIEW_COUNT = 6;
  const visibleExternal = state.expandedBlocks.incoming ? sortedExternal : sortedExternal.slice(0, INC_PREVIEW_COUNT);
  visibleExternal.forEach(t=>{
    const row = document.createElement('div');
    row.className='ms-inc-row';
    const dateStr = t.date.toLocaleDateString('uk-UA',{day:'2-digit',month:'2-digit'});
    row.innerHTML = `<span style="min-width:44px">${dateStr}</span><span style="flex:1">${escapeHtml(t.desc)}</span><span class="ms-amt-pos">+${fmt(t.amount)} ${curSym()}</span>`;
    extList.appendChild(row);
  });
  if(sortedExternal.length > INC_PREVIEW_COUNT){
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'ms-btn secondary';
    toggleBtn.style.width = '100%';
    toggleBtn.style.marginTop = '10px';
    toggleBtn.textContent = state.expandedBlocks.incoming ? 'Згорнути ▴' : `Показати ще ${sortedExternal.length - INC_PREVIEW_COUNT} ▾`;
    toggleBtn.addEventListener('click', ()=>{ state.expandedBlocks.incoming = !state.expandedBlocks.incoming; render(); });
    extList.insertAdjacentElement('afterend', toggleBtn);
  }
  const intList = p.querySelector('#incIntList');
  if(intList){
    internal.sort((a,b)=>b.date-a.date).forEach(t=>{
      const row = document.createElement('div');
      row.className='ms-inc-row';
      row.style.opacity='.6';
      const dateStr = t.date.toLocaleDateString('uk-UA',{day:'2-digit',month:'2-digit'});
      row.innerHTML = `<span style="min-width:44px">${dateStr}</span><span style="flex:1">${escapeHtml(t.desc)}</span><span class="ms-amt-pos">+${fmt(t.amount)} ${curSym()}</span>`;
      intList.appendChild(row);
    });
  }
  return p;
}

export function buildDataTransferPanel(){
  const p = document.createElement('div');
  p.className='ms-panel';
  p.innerHTML = `
    <h2>Перенести дані на інший пристрій</h2>
    <p class="ms-hint">Виправлені категорії, ручні записи і борги зберігаються локально на цьому пристрої/браузері. Щоб перенести їх на телефон чи інший комп'ютер — вивантаж файл тут і заватаж його там.</p>
    <div class="ms-row">
      <button class="ms-btn secondary" id="exportBtn">Вивантажити дані (.json)</button>
      <label class="ms-btn secondary" style="cursor:pointer" for="importInput">Завантажити дані з файлу</label>
      <input type="file" id="importInput" accept="application/json" style="display:none">
    </div>
  `;
  p.querySelector('#exportBtn').addEventListener('click', exportData);
  p.querySelector('#importInput').addEventListener('change', async (e)=>{
    if(e.target.files[0]) await importDataFromFile(e.target.files[0]);
  });
  return p;
}

export function buildTripsPanel(all){
  const p = document.createElement('div');
  p.className = 'ms-panel ms-trips-panel';
  p.innerHTML = `
    <h2>🧳 Подорожі — окремий облік витрат по поїздках</h2>
    <p class="ms-hint">Створи поїздку тут, а сам зв'язок з операціями роби у колонці «Поїздка» в таблиці «Всі операції» вище — обери там потрібну поїздку у випадаючому списку конкретної покупки. Тут — тільки підсумок по кожній поїздці.</p>
    <div class="ms-manual-form">
      <div class="ms-field" style="flex:2"><label>Назва поїздки</label><input type="text" id="tripName" placeholder="Наприклад: Польща, липень"></div>
      <button class="ms-btn" id="tripAdd" style="align-self:flex-end">Створити поїздку</button>
    </div>
    <div id="tripsList" style="margin-top:16px"></div>
  `;
  const list = p.querySelector('#tripsList');
  if(state.trips.length===0){
    list.innerHTML = '<p class="ms-hint" style="margin:0">Поїздок ще немає — створи першу вище.</p>';
  }
  state.trips.forEach(trip=>{
    const txs = all.filter(t=>state.tripOf[txKey(t)]===trip.id);
    const sum = txs.reduce((s,t)=>s+Math.abs(t.amount),0);
    const expanded = !!state.expandedTrips?.[trip.id];

    let dateRangeStr = '';
    let dayCount = 0;
    const fmtD = d=>d.toLocaleDateString('uk-UA',{day:'2-digit',month:'2-digit'});
    if(trip.dateFrom && trip.dateTo){
      // manually set — takes priority over any automatic guess
      const minD = new Date(trip.dateFrom+'T00:00:00');
      const maxD = new Date(trip.dateTo+'T00:00:00');
      dateRangeStr = trip.dateFrom===trip.dateTo ? fmtD(minD) : `${fmtD(minD)} – ${fmtD(maxD)}`;
      dayCount = Math.round((maxD.getTime() - minD.getTime())/(24*60*60*1000)) + 1;
    }else{
      // tickets/hotels booked ahead of time are often charged in UAH from home,
      // which skews the date range if we just use every tagged transaction. Prefer
      // foreign-currency transactions (actual spend while abroad) for the real dates;
      // fall back to everything if the trip has no foreign-currency spend at all.
      const abroadTxs = txs.filter(t=>t.currency && t.currency!==980);
      const dateSourceTxs = abroadTxs.length ? abroadTxs : txs;
      if(dateSourceTxs.length){
        const dates = dateSourceTxs.map(t=>t.date.getTime());
        const minD = new Date(Math.min(...dates));
        const maxD = new Date(Math.max(...dates));
        dateRangeStr = minD.toDateString()===maxD.toDateString() ? fmtD(minD) : `${fmtD(minD)} – ${fmtD(maxD)}`;
        dayCount = Math.round((new Date(maxD.toDateString()).getTime() - new Date(minD.toDateString()).getTime())/(24*60*60*1000)) + 1;
      }
    }

    const card = document.createElement('div');
    card.className = 'ms-trip-card';

    const head = document.createElement('div');
    head.className = 'ms-trip-head';
    head.innerHTML = `
      <span class="ms-trip-chevron">${expanded?'▾':'▸'}</span>
      <span class="ms-trip-name">${escapeHtml(trip.name)}</span>
      ${dateRangeStr ? `<span class="ms-trip-meta">${dateRangeStr}${dayCount>1?' · <b style="color:var(--text)">'+dayCount+' дн.</b>':''}</span>` : ''}
      <span class="ms-trip-meta">${txs.length} оп.</span>
      <span class="ms-trip-sum">${fmt(sum)} ${curSym()}</span>
    `;
    head.addEventListener('click', (e)=>{
      if(e.target.closest('.ms-btn')) return;
      state.expandedTrips = state.expandedTrips || {};
      state.expandedTrips[trip.id] = !expanded;
      render();
    });
    const renameBtn = document.createElement('button');
    renameBtn.className = 'ms-icon-btn';
    renameBtn.textContent = '✏️';
    renameBtn.title = 'Перейменувати поїздку';
    renameBtn.addEventListener('click', ()=>{
      const newName = prompt('Нова назва поїздки:', trip.name);
      renameTrip(trip.id, newName);
    });
    head.appendChild(renameBtn);
    const datesBtn = document.createElement('button');
    datesBtn.className = 'ms-icon-btn';
    datesBtn.textContent = '📅';
    datesBtn.title = 'Задати дати поїздки вручну';
    datesBtn.addEventListener('click', ()=>{
      state.editingTripDates = state.editingTripDates===trip.id ? null : trip.id;
      render();
    });
    head.appendChild(datesBtn);
    const delBtn = document.createElement('button');
    delBtn.className = 'ms-icon-btn';
    delBtn.textContent = '🗑️';
    delBtn.title = 'Видалити поїздку';
    delBtn.addEventListener('click', ()=>{
      if(confirm(`Видалити поїздку «${trip.name}»? Прив'язки трат до неї теж знімуться (самі трати нікуди не дінуться).`)) deleteTrip(trip.id);
    });
    head.appendChild(delBtn);
    card.appendChild(head);

    if(state.editingTripDates===trip.id){
      const dateForm = document.createElement('div');
      dateForm.className = 'ms-row';
      dateForm.style.cssText = 'margin:10px 0;align-items:flex-end;gap:10px;flex-wrap:wrap';
      dateForm.innerHTML = `
        <div class="ms-field" style="max-width:170px">
          <label>Початок поїздки</label>
          <input type="date" id="tripDateFromInput" value="${trip.dateFrom || todayStr()}">
        </div>
        <div class="ms-field" style="max-width:170px">
          <label>Кінець поїздки</label>
          <input type="date" id="tripDateToInput" value="${trip.dateTo || todayStr()}">
        </div>
        <button class="ms-btn" id="tripDateSaveBtn">Зберегти</button>
        <button class="ms-btn secondary" id="tripDateCancelBtn">Скасувати</button>
      `;
      dateForm.querySelector('#tripDateSaveBtn').addEventListener('click', ()=>{
        const from = dateForm.querySelector('#tripDateFromInput').value;
        const to = dateForm.querySelector('#tripDateToInput').value;
        state.editingTripDates = null;
        setTripDates(trip.id, from, to);
      });
      dateForm.querySelector('#tripDateCancelBtn').addEventListener('click', ()=>{
        state.editingTripDates = null;
        render();
      });
      card.appendChild(dateForm);
    }

    if(expanded){
      const detailWrap = document.createElement('div');
      detailWrap.className = 'ms-trip-pick';
      if(txs.length===0){
        detailWrap.innerHTML = '<p class="ms-hint" style="margin:10px 0">Ще нічого не прив\'язано — познач операції в «Всі операції» вище.</p>';
      }else{
        detailWrap.innerHTML = `<p class="ms-hint" style="margin:10px 0">Згруповано за типом витрати (щоб прибрати операцію — онови її поїздку на «—» в «Всі операції»):</p>`;
        const byGroup = {};
        txs.forEach(t=>{
          const g = tripGroupFor(t.cat);
          (byGroup[g] = byGroup[g]||[]).push(t);
        });
        const scrollBox = document.createElement('div');
        scrollBox.className = 'ms-trip-scroll';
        TRIP_GROUP_ORDER.filter(g=>byGroup[g]).forEach(g=>{
          const groupTxs = byGroup[g].sort((a,b)=>b.date-a.date);
          const groupSum = groupTxs.reduce((s,t)=>s+Math.abs(t.amount),0);
          const groupHead = document.createElement('div');
          groupHead.className = 'ms-trip-pick-row';
          groupHead.style.fontWeight = '600';
          groupHead.style.background = 'var(--panel-hi)';
          groupHead.innerHTML = `<span class="ms-trip-pick-desc">${TRIP_GROUP_ICONS[g]} ${g}</span><span class="ms-trip-pick-amt">${fmt(groupSum)} ${curSym()}</span>`;
          scrollBox.appendChild(groupHead);
          groupTxs.forEach(t=>{
            const dateStr = t.date.toLocaleDateString('uk-UA',{day:'2-digit',month:'2-digit'});
            const row = document.createElement('div');
            row.className = 'ms-trip-pick-row';
            row.style.paddingLeft = '20px';
            row.innerHTML = `<span class="ms-trip-pick-desc">${dateStr} · ${escapeHtml(t.desc)}</span><span class="ms-trip-pick-amt">${fmt(Math.abs(t.amount))} ${curSym()}</span>`;
            scrollBox.appendChild(row);
          });
        });
        detailWrap.appendChild(scrollBox);
      }
      card.appendChild(detailWrap);
    }

    list.appendChild(card);
  });
  p.querySelector('#tripAdd').addEventListener('click', ()=>{
    const input = p.querySelector('#tripName');
    addTrip(input.value);
    input.value = '';
  });
  return p;
}

export function buildCustomCategoryPanel(){
  const p = document.createElement('div');
  p.className='ms-panel';
  p.innerHTML = `
    <h2>Додати свою категорію</h2>
    <p class="ms-hint">Впиши назву і будь-яку емодзі-іконку — категорія одразу зʼявиться у всіх списках вибору.</p>
    <div class="ms-manual-form">
      <div class="ms-field" style="max-width:70px"><label>Іконка</label><input type="text" id="ccIcon" placeholder="🏷️" maxlength="4"></div>
      <div class="ms-field" style="flex:2"><label>Назва категорії</label><input type="text" id="ccName" placeholder="Наприклад: хобі"></div>
      <button class="ms-btn" id="ccAdd" style="align-self:flex-end">Додати</button>
    </div>
    <div id="ccList" style="margin-top:12px"></div>
  `;
  const list = p.querySelector('#ccList');
  if(state.customCats.length){
    state.customCats.forEach(c=>{
      const row = document.createElement('div');
      row.className = 'ms-today-cat-row';
      row.innerHTML = `<span class="ms-legend-icon">${c.icon||'🏷️'}</span><span class="ms-today-cat-name">${escapeHtml(c.name)}</span>`;
      list.appendChild(row);
    });
  }
  p.querySelector('#ccAdd').addEventListener('click', async ()=>{
    const name = p.querySelector('#ccName').value;
    const icon = p.querySelector('#ccIcon').value || '🏷️';
    const ok = await addCustomCategory(name, icon);
    if(!ok) alert('Категорія з такою назвою вже є, або назва порожня.');
  });
  return p;
}

export function buildDailyPanel(all, from, to){
  const p = document.createElement('div');
  p.className='ms-panel';

  const byDay = {};
  all.forEach(t=>{
    const key = t.date instanceof Date ? todayStr(t.date) : String(t.date).slice(0,10);
    byDay[key] = (byDay[key]||0) + Math.abs(t.amount);
  });

  const days = [];
  if(from && to){
    let cur = new Date(from+'T00:00:00');
    const end = new Date(to+'T00:00:00');
    while(cur <= end){
      const key = todayStr(cur);
      days.push({key, amount: byDay[key]||0, day: cur.getDate()});
      cur.setDate(cur.getDate()+1);
    }
  }
  const max = Math.max(1, ...days.map(d=>d.amount));
  const avg = days.length ? days.reduce((s,d)=>s+d.amount,0)/days.length : 0;
  const lastDay = days[days.length-1];

  p.innerHTML = `<h2>Витрати по днях</h2><p class="ms-hint">Торкнись або наведи курсор на стовпчик, щоб побачити суму за день.</p><div class="ms-daily-readout" id="dailyReadout"></div><div class="ms-daily-wrap"><div class="ms-daily-chart" id="dailyChart"></div></div><div class="ms-daily-avg">У середньому ${fmt(avg)} ₴/день</div>`;
  const readout = p.querySelector('#dailyReadout');
  const setReadout = (d)=>{
    const dt = new Date(d.key+'T00:00:00');
    const dstr = dt.toLocaleDateString('uk-UA',{day:'2-digit',month:'long'});
    readout.innerHTML = d.amount>0 ? `${dstr}: <b>${fmt(d.amount)} ₴</b>` : `${dstr}: витрат не було`;
  };
  const chart = p.querySelector('#dailyChart');
  let selectedCol = null;
  days.forEach(d=>{
    const col = document.createElement('div');
    col.className='ms-daily-col';
    const h = Math.round((d.amount/max)*100);
    col.innerHTML = `<div class="ms-daily-bar${d.amount===0?' empty':''}" style="height:${Math.max(h,2)}px"></div><div class="ms-daily-lbl">${String(d.day).padStart(2,'0')}</div>`;
    col.addEventListener('mouseenter', ()=>setReadout(d));
    col.addEventListener('click', ()=>{
      if(selectedCol) selectedCol.classList.remove('selected');
      col.classList.add('selected');
      selectedCol = col;
      setReadout(d);
    });
    chart.appendChild(col);
  });
  if(lastDay){ setReadout(lastDay); }
  return p;
}

export function buildDebtsPanel(){
  const p = document.createElement('div');
  p.className='ms-panel';

  const openDebts = state.debts.filter(d=>d.status==='open');
  const closedDebts = state.debts.filter(d=>d.status==='closed');
  const totalOwed = openDebts.reduce((s,d)=>s+d.remaining,0);

  const incoming = state.txs.filter(t=>t.amount>0
    && !INCOMING_SELF_KEYWORDS.some(k=>t.desc.includes(k))
    && !state.usedIncoming[txKey(t)]);

  p.innerHTML = `
    <h2>Борги — хто мені винен</h2>
    <p class="ms-hint">Це окремо від трат: позначені позики (кнопка «позика ⤴» в таблиці операцій) сюди перенеслись і не рахуються у витратах. Коли бачиш надходження, яким гасять борг — закрий ним потрібний борг нижче.</p>
    <div style="margin-bottom:14px;font-size:13px;color:var(--muted)">Разом винні тобі: <b style="color:var(--gold);font-family:var(--font-mono)">${fmt(totalOwed)} ₴</b></div>
    <div id="openDebtsList"></div>
    ${incoming.length ? `<h2 style="margin-top:18px;font-size:14px">Надходження за період, які можна закрити боргом</h2><div id="incomingList"></div>` : ''}
    ${closedDebts.length ? `<h2 style="margin-top:18px;font-size:14px">Повернуто</h2><div id="closedDebtsList"></div>` : ''}
    <h2 style="margin-top:18px;font-size:14px">Додати позику вручну (готівкою або заднім числом)</h2>
    <div class="ms-manual-form">
      <div class="ms-field" style="max-width:140px"><label>Дата</label><input type="date" id="dDate" value="${todayStr()}"></div>
      <div class="ms-field"><label>Кому</label><input type="text" id="dPerson" placeholder="Ім'я"></div>
      <div class="ms-field" style="max-width:120px"><label>Сума</label><input type="text" id="dAmount" placeholder="1000"></div>
      <button class="ms-btn" id="dAdd" style="align-self:flex-end">Додати борг</button>
    </div>
  `;

  const openList = p.querySelector('#openDebtsList');
  if(openDebts.length===0){
    openList.innerHTML = '<p class="ms-hint" style="margin:0">Відкритих боргів немає.</p>';
  }
  openDebts.forEach(d=>{
    const row = document.createElement('div');
    row.className='ms-debt-row';
    row.innerHTML = `<span class="ms-debt-person">${escapeHtml(d.person)}</span>
      <span class="ms-debt-meta">дав(ла) ${fmt(d.amount)} ₴ · ${d.dateGiven}</span>
      <span class="ms-debt-remain">${fmt(d.remaining)} ₴</span>`;
    const closeBtn = document.createElement('button');
    closeBtn.className='ms-btn secondary';
    closeBtn.textContent='Повернули повністю';
    closeBtn.addEventListener('click', ()=>closeDebtManually(d.id));
    row.appendChild(closeBtn);
    openList.appendChild(row);
  });

  const incList = p.querySelector('#incomingList');
  if(incList){
    incoming.forEach(t=>{
      const row = document.createElement('div');
      row.className='ms-inc-row';
      const dateStr = t.date instanceof Date ? t.date.toLocaleDateString('uk-UA',{day:'2-digit',month:'2-digit'}) : t.date;
      row.innerHTML = `<span style="min-width:60px">${dateStr}</span><span style="flex:1">${escapeHtml(t.desc)}</span><span class="ms-amt-pos">+${fmt(t.amount)} ₴</span>`;
      if(openDebts.length){
        const sel = document.createElement('select');
        sel.className='ms-cat-select';
        openDebts.forEach(d=>{
          const opt = document.createElement('option');
          opt.value=d.id; opt.textContent=`${d.person} (${fmt(d.remaining)} ₴)`;
          sel.appendChild(opt);
        });
        const btn = document.createElement('button');
        btn.className='ms-loan-btn';
        btn.textContent='Закрити цим борг';
        btn.addEventListener('click', ()=>closeDebtWithIncoming(sel.value, t));
        row.appendChild(sel);
        row.appendChild(btn);
      }
      incList.appendChild(row);
    });
  }

  const closedList = p.querySelector('#closedDebtsList');
  if(closedList){
    closedDebts.forEach(d=>{
      const row = document.createElement('div');
      row.className='ms-debt-row ms-debt-closed';
      row.innerHTML = `<span class="ms-debt-person">${escapeHtml(d.person)}</span>
        <span class="ms-debt-meta">${fmt(d.amount)} ₴ · дано ${d.dateGiven}</span>
        <span class="ms-debt-remain">повернуто</span>`;
      closedList.appendChild(row);
    });
  }

  p.querySelector('#dAdd').addEventListener('click', ()=>{
    const date = p.querySelector('#dDate').value;
    const person = p.querySelector('#dPerson').value.trim();
    const amt = parseFloat(p.querySelector('#dAmount').value.replace(',','.'));
    if(!person || isNaN(amt)) return;
    addManualDebt(person, amt, date);
  });

  return p;
}
