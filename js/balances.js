(function () {
  'use strict';

  // ---------- простий PIN-замок ----------
  // Це НЕ справжній захист — PIN видно у коді сторінки будь-кому, хто відкриє
  // інструменти розробника. Це просто екран-затвор від випадкового відкриття
  // (наприклад, якщо хтось узяв телефон і випадково перейшов за посиланням).
  const REQUIRED_PIN = '6142';
  const pin = prompt('Введи PIN-код:');
  if(pin !== REQUIRED_PIN){
    document.addEventListener('DOMContentLoaded', () => {
      document.body.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;color:#4A3623;background:#F7F1E4">
          <div style="text-align:center">
            <p style="font-size:18px;margin-bottom:8px">🔒 Невірний PIN</p>
            <a href="javascript:location.reload()" style="color:#B8863F">Спробувати ще раз</a>
          </div>
        </div>`;
    });
    return; // stop here — nothing else in this file runs
  }

  // Fallback rates are used if Monobank's public currency endpoint is unavailable
  // or does not provide a currency pair. These are approximate, not official rates.
  const CURRENCIES = [
    {code:'UAH', sym:'₴', toEur:1/51},
    {code:'EUR', sym:'€', toEur:1},
    {code:'USD', sym:'$', toEur:1/1.16},
    {code:'PLN', sym:'zł', toEur:1/4.35},
    {code:'RON', sym:'lei', toEur:1/5.22},
    {code:'GEL', sym:'₾', toEur:1/2.9},
  ];
  const CUR_BY_CODE = Object.fromEntries(CURRENCIES.map(c => [c.code, c]));
  const MONO_CURRENCY_CODES = {UAH:980, EUR:978, USD:840, PLN:985, RON:946, GEL:981};
  const RATE_CACHE_KEY = 'ms_balances_mono_rates';
  const RATE_CACHE_MAX_AGE = 60 * 1000; // Monobank limits requests to about one per minute.
  let rateSource = 'fallback';
  let rateAsOf = null;

  const STORAGE_KEY = 'ms_balances_sources';

  const DEFAULT_SOURCES = [
    {name:'Готівка', amount:'', currency:'UAH'},
    {name:'Картка', amount:'', currency:'UAH'},
    {name:'Доларовий рахунок', amount:'', currency:'USD'},
    {name:'Євровий рахунок', amount:'', currency:'EUR'},
  ];

  let sources = [];
  let dirty = false;

  const fmtNum = new Intl.NumberFormat('uk-UA', {minimumFractionDigits:2, maximumFractionDigits:2});

  function loadSources(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(raw){
        const parsed = JSON.parse(raw);
        if(Array.isArray(parsed) && parsed.length) return parsed;
      }
    }catch(e){
      console.warn('loadSources error', e);
    }
    return DEFAULT_SOURCES.map(s => ({...s}));
  }

  function parseAmount(v){
    const s = (v || '').toString().trim();
    if(!s) return 0;
    const n = parseFloat(s.replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  }

  function applyMonobankRates(items){
    if(!Array.isArray(items)) throw new Error('Unexpected rates response');
    const graph = new Map();
    let latestDate = 0;
    items.forEach(item => {
      const codeA = Number(item.currencyCodeA);
      const codeB = Number(item.currencyCodeB);
      const buy = Number(item.rateBuy);
      const sell = Number(item.rateSell);
      const cross = Number(item.rateCross);
      const rate = Number.isFinite(buy) && buy > 0 && Number.isFinite(sell) && sell > 0
        ? (buy + sell) / 2
        : (Number.isFinite(cross) && cross > 0 ? cross : null);
      if(!rate) return;
      if(!graph.has(codeA)) graph.set(codeA, []);
      if(!graph.has(codeB)) graph.set(codeB, []);
      graph.get(codeA).push([codeB, rate]);
      graph.get(codeB).push([codeA, 1 / rate]);
      if(Number(item.date) > latestDate) latestDate = Number(item.date);
    });

    function conversionRate(from, to){
      const queue = [[from, 1]];
      const visited = new Set([from]);
      while(queue.length){
        const [code, rate] = queue.shift();
        if(code === to) return rate;
        (graph.get(code) || []).forEach(([nextCode, nextRate]) => {
          if(!visited.has(nextCode)){
            visited.add(nextCode);
            queue.push([nextCode, rate * nextRate]);
          }
        });
      }
      return null;
    }

    if(!conversionRate(980, 978)) throw new Error('EUR/UAH rate missing');
    CURRENCIES.forEach(currency => {
      const currencyCode = MONO_CURRENCY_CODES[currency.code];
      const rate = currencyCode ? conversionRate(currencyCode, 978) : null;
      if(rate) currency.toEur = rate;
    });
    rateAsOf = latestDate ? new Date(latestDate * 1000) : new Date();
    rateSource = 'Monobank';
  }

  async function loadMonobankRates(){
    let cached = null;
    try{
      cached = JSON.parse(localStorage.getItem(RATE_CACHE_KEY) || 'null');
    }catch(e){ /* ignore invalid cache */ }

    if(cached && Array.isArray(cached.items) && Date.now() - cached.fetchedAt < RATE_CACHE_MAX_AGE){
      try{
        applyMonobankRates(cached.items);
        return;
      }catch(e){ /* refresh invalid cached rates below */ }
    }

    try{
      const response = await fetch('https://api.monobank.ua/bank/currency', {cache:'no-store'});
      if(!response.ok) throw new Error(`Monobank returned HTTP ${response.status}`);
      const items = await response.json();
      applyMonobankRates(items);
      try{
        localStorage.setItem(RATE_CACHE_KEY, JSON.stringify({items, fetchedAt:Date.now()}));
      }catch(e){ /* rate calculation still works when storage is unavailable */ }
    }catch(error){
      console.warn('Could not refresh Monobank currency rates:', error);
      if(cached && Array.isArray(cached.items)){
        try{
          applyMonobankRates(cached.items);
          rateSource = 'збережений курс Monobank';
        }catch(e){ /* retain fallback rates */ }
      }
    }
  }

  function renderRateStatus(){
    const status = document.getElementById('exchangeRateStatus');
    if(!status) return;
    const dateText = rateAsOf
      ? ` · дані від ${rateAsOf.toLocaleString('uk-UA', {dateStyle:'short', timeStyle:'short'})}`
      : '';
    status.textContent = `Курс для перерахунку: ${rateSource}${dateText}. Підсумок приблизний.`;
  }

  function setDirty(val){
    dirty = !!val;
    const saveBtn = document.getElementById('save');
    if(!saveBtn) return;
    saveBtn.disabled = !dirty;
    saveBtn.textContent = dirty ? 'Зберегти *' : 'Зберегти';
  }

  function renderSources(){
    const list = document.getElementById('sourcesList');
    list.innerHTML = '';
    sources.forEach((src, i) => {
      const row = document.createElement('div');
      row.className = 'ms-source-row';

      const enabledChk = document.createElement('input');
      enabledChk.type = 'checkbox';
      enabledChk.className = 'ms-source-enabled';
      enabledChk.checked = src.enabled !== false; // undefined/missing (old saved sources) defaults to enabled
      enabledChk.title = 'Враховувати в загальній сумі';
      enabledChk.addEventListener('change', e => {
        sources[i].enabled = e.target.checked;
        setDirty(true);
        renderSources(); // re-render so the row's dimmed/active look updates too
        autoSave();
      });

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.value = src.name;
      nameInput.placeholder = 'Назва джерела';
      nameInput.addEventListener('input', e => { sources[i].name = e.target.value; setDirty(true); autoSave(); });

      const amountInput = document.createElement('input');
      amountInput.type = 'number';
      amountInput.step = '0.01';
      amountInput.value = src.amount;
      amountInput.placeholder = '0';
      amountInput.addEventListener('input', e => {
        sources[i].amount = e.target.value;
        setDirty(true);
        updateTotals();
        autoSave();
      });
      amountInput.addEventListener('keydown', e => {
        if(['e','E','+'].includes(e.key)) e.preventDefault(); // no exponent notation in a money field
      });

      const curSelect = document.createElement('select');
      CURRENCIES.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.code;
        opt.textContent = c.code;
        if(c.code === src.currency) opt.selected = true;
        curSelect.appendChild(opt);
      });
      curSelect.addEventListener('change', e => {
        sources[i].currency = e.target.value;
        setDirty(true);
        updateTotals();
        autoSave();
      });

      const eurLabel = document.createElement('span');
      eurLabel.className = 'ms-source-eur';

      const delBtn = document.createElement('button');
      delBtn.className = 'ms-del-source';
      delBtn.textContent = '✕';
      delBtn.title = 'Видалити джерело';
      delBtn.addEventListener('click', () => {
        sources.splice(i, 1);
        setDirty(true);
        renderSources();
        updateTotals();
      });

      if(src.enabled===false) row.style.opacity = '.45';
      row.appendChild(enabledChk);
      row.appendChild(nameInput);
      row.appendChild(amountInput);
      row.appendChild(curSelect);
      row.appendChild(eurLabel);
      row.appendChild(delBtn);
      list.appendChild(row);
    });
    updateTotals();
  }

  function updateTotals(){
    const rows = document.querySelectorAll('#sourcesList .ms-source-row');
    let totalEur = 0;
    const byCurrency = {};

    sources.forEach((src, i) => {
      const amount = parseAmount(src.amount);
      const cur = CUR_BY_CODE[src.currency] || CUR_BY_CODE.UAH;
      const eurValue = amount * cur.toEur;
      const isEnabled = src.enabled !== false;
      if(isEnabled){
        totalEur += eurValue;
        byCurrency[src.currency] = (byCurrency[src.currency] || 0) + amount;
      }

      const row = rows[i];
      if(row){
        const eurLabel = row.querySelector('.ms-source-eur');
        if(eurLabel) eurLabel.textContent = amount ? `${isEnabled?'':'(вимкнено) '}≈ € ${fmtNum.format(eurValue)}` : '';
      }
    });

    const totalEl = document.getElementById('totalEur');
    if(totalEl) totalEl.textContent = `€ ${fmtNum.format(totalEur)}`;
    renderRateStatus();

    const byCurList = document.getElementById('byCurrencyList');
    if(byCurList){
      byCurList.innerHTML = '';
      Object.entries(byCurrency).forEach(([code, sum]) => {
        if(!sum) return;
        const cur = CUR_BY_CODE[code];
        const row = document.createElement('div');
        row.className = 'ms-total-row';
        row.innerHTML = `<span>${code}</span><span>${cur ? cur.sym : ''} ${fmtNum.format(sum)}</span>`;
        byCurList.appendChild(row);
      });
    }
  }

  function saveToStorage(){
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
      setDirty(false);
      const statusEl = document.getElementById('saveStatus');
      if(statusEl){
        statusEl.textContent = 'Збережено ' + new Date().toLocaleTimeString('uk-UA', {hour:'2-digit', minute:'2-digit'});
        setTimeout(() => { if(statusEl) statusEl.textContent = ''; }, 2000);
      }
    }catch(e){
      console.error('saveToStorage error', e);
    }
  }

  // Writes to localStorage automatically as she types, debounced so it's not on every
  // single keystroke — so nothing gets lost just because the Save button wasn't clicked.
  let autoSaveTimer = null;
  function autoSave(){
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      try{
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
        setDirty(false);
      }catch(e){
        console.error('autoSave error', e);
      }
    }, 500);
  }

  document.addEventListener('DOMContentLoaded', () => {
    sources = loadSources();
    renderSources();
    loadMonobankRates().then(() => {
      updateTotals();
      renderRateStatus();
    });
    setDirty(false);

    document.getElementById('addSourceBtn').addEventListener('click', () => {
      sources.push({name:'', amount:'', currency:'UAH'});
      setDirty(true);
      renderSources();
    });

    document.getElementById('save').addEventListener('click', saveToStorage);

    document.getElementById('reset').addEventListener('click', () => {
      if(!confirm('Скинути всі джерела до порожніх значень (назви залишаться)?')) return;
      sources = sources.map(s => ({...s, amount:''}));
      localStorage.removeItem(STORAGE_KEY);
      setDirty(false);
      renderSources();
    });

    document.getElementById('copy').addEventListener('click', async () => {
      const lines = sources
        .filter(s => parseAmount(s.amount))
        .map(s => `${s.name || 'Без назви'}: ${s.amount} ${s.currency}`);
      const totalEl = document.getElementById('totalEur');
      lines.push('', `Разом: ${totalEl ? totalEl.textContent : ''}`);
      const text = lines.join('\n');
      try{
        await navigator.clipboard.writeText(text);
        const btn = document.getElementById('copy');
        const prev = btn.textContent;
        btn.textContent = 'Скопійовано!';
        setTimeout(() => { btn.textContent = prev; }, 1200);
      }catch(e){
        console.warn('copy error', e);
      }
    });
  });
})();
