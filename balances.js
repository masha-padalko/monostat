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

  // Same approximate EUR conversion rates as MonoStat, kept in sync manually.
  // For a rough personal total only — not official/financial-grade rates.
  const CURRENCIES = [
    {code:'UAH', sym:'₴', toEur:1/51},
    {code:'EUR', sym:'€', toEur:1},
    {code:'USD', sym:'$', toEur:1/1.16},
    {code:'PLN', sym:'zł', toEur:1/4.35},
    {code:'RON', sym:'lei', toEur:1/5.22},
    {code:'GEL', sym:'₾', toEur:1/2.9},
  ];
  const CUR_BY_CODE = Object.fromEntries(CURRENCIES.map(c => [c.code, c]));

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

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.value = src.name;
      nameInput.placeholder = 'Назва джерела';
      nameInput.addEventListener('input', e => { sources[i].name = e.target.value; setDirty(true); });

      const amountInput = document.createElement('input');
      amountInput.type = 'number';
      amountInput.step = '0.01';
      amountInput.value = src.amount;
      amountInput.placeholder = '0';
      amountInput.addEventListener('input', e => {
        sources[i].amount = e.target.value;
        setDirty(true);
        updateTotals();
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
      totalEur += eurValue;
      byCurrency[src.currency] = (byCurrency[src.currency] || 0) + amount;

      const row = rows[i];
      if(row){
        const eurLabel = row.querySelector('.ms-source-eur');
        if(eurLabel) eurLabel.textContent = amount ? `≈ € ${fmtNum.format(eurValue)}` : '';
      }
    });

    const totalEl = document.getElementById('totalEur');
    if(totalEl) totalEl.textContent = `€ ${fmtNum.format(totalEur)}`;

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

  document.addEventListener('DOMContentLoaded', () => {
    sources = loadSources();
    renderSources();
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
