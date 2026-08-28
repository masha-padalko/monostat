/* ==== app.js — точка входу, тільки ініціалізація ==== */
import { applyCustomCategory } from './categorize.js';
import { state } from './state.js';
import { initAuth, authUserId } from './auth.js';
import { loadPersisted } from './persistence.js';
import { render } from './panels.js';
import { defaultPeriodStart, todayStr } from './utils.js';

// ---------- init ----------
window.MonoStatDefaults.DEFAULT_CUSTOM_CATS.forEach(c=>applyCustomCategory(c, true));
initAuth().then(()=>{
  if(!authUserId){ state.initialLoading = false; render(); return; }
  return loadPersisted().then(()=>{
    state.from = defaultPeriodStart(); // her budgeting month runs from the 10th (payday) to the 10th
    state.to = todayStr();
    state.initialLoading = false;
    render();
  });
}).catch(err=>{
  document.getElementById('app').innerHTML = '<div style="color:#E3AA9C;font-family:monospace;padding:20px;white-space:pre-wrap">Помилка ініціалізації: '+(err&&err.message)+'</div>';
});
render();
