window.MonoStatDefaults = window.MonoStatDefaults || {};

/* ==========================================================================
   MonoStat — запечені дані (baked-in defaults)
   Порожньо навмисно: реальні дані тепер живуть у Supabase (таблиця kv_store),
   а не в цьому файлі. Це той самий файл, що йде в публічний GitHub-репозиторій
   разом з index.html/style.css/app.js — тому тут більше не повинно бути
   нічого особистого.

   Якщо колись знову захочеш "запекти" якісь дефолти для швидкого старту на
   новому пристрої без бази — додавай сюди, але подумай двічі, чи це піде
   в публічний репозиторій.
   ========================================================================== */

window.MonoStatDefaults.DEFAULT_OVERRIDES = {};
window.MonoStatDefaults.DEFAULT_CUSTOM_CATS = [];
window.MonoStatDefaults.DEFAULT_NOTES = {};
window.MonoStatDefaults.DEFAULT_NOT_EXPENSE = {};
window.MonoStatDefaults.DEFAULT_DAY_EXCLUDED = {};
window.MonoStatDefaults.DEFAULT_TX_CATEGORY_OVERRIDE = {};
window.MonoStatDefaults.DEFAULT_MANUAL = [];
window.MonoStatDefaults.DEFAULT_TX_CACHE = [];
