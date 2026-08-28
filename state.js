/* ==== module: state.js (auto-generated split) ==== */
import { defaultRules } from './categorize.js';
import { txKey } from './utils.js';

export let CATS = ['продукти','продукти спільні','такси','транспорт','Путешествия транспорт: самолёт','Путешествия транспорт: кава в літаку','Путешествия транспорт: поезд',
  'Путешествия транспорт: автобус','Путешествия транспорт: інше','авто','бензин','обеды','дц','бьюти',
  'лекарства','анализи','йожа','подарунки','розваги','розваги спільні','Internet','одежда','готівка (зняття)','послуги (ФОП)',
  'перекази людям','квартплата','інше'];

export let state = {
  token: '',
  rememberToken: false,
  initialLoading: true,
  accounts: [],
  selectedAccount: null,
  from: '',
  to: '',
  loading: false,
  error: null,
  txs: [],          // {id,date,desc,mcc,amount,currency}
  overrides: {...window.MonoStatDefaults.DEFAULT_OVERRIDES},     // desc -> category (learned)
  manual: [...window.MonoStatDefaults.DEFAULT_MANUAL],         // manual entries {date,desc,amount,cat}
  rules: defaultRules(),
  debts: [],          // {id,person,amount,remaining,dateGiven,status,note}
  loanKeys: {},        // txKey -> debtId (marks an expense tx as "this was a loan, not spend")
  usedIncoming: {},     // txKey -> debtId (marks an incoming tx as "already used to close a debt")
  todayTxs: null,        // independent last-48h fetch, used when main range doesn't cover today/yesterday
  todayLoading: false,
  expandedCats: {},
  expandedBlocks: {transactions:false, incoming:false}, // accordion-style "show more" for the 3-col panels
  notes: {...window.MonoStatDefaults.DEFAULT_NOTES},         // txKey -> free-text note about that specific transaction
  dayExcluded: {...window.MonoStatDefaults.DEFAULT_DAY_EXCLUDED},     // txKey -> true if unchecked in "Зараз" (excluded from today/yesterday total)
  notExpense: {...window.MonoStatDefaults.DEFAULT_NOT_EXPENSE},       // txKey -> true — flagged as "not a real expense" (refunded/recharged, fund contribution, etc.) for "Чисті трати"
  amountOverride: {},    // txKey -> net amount after auto-detected partial refund (e.g. Bolt charge minus a same-merchant refund), used only in "Чисті трати"
  txCategoryOverride: {...window.MonoStatDefaults.DEFAULT_TX_CATEGORY_OVERRIDE}, // txKey -> category — overrides just THIS transaction, without affecting every other purchase from the same merchant
  txCache: [...window.MonoStatDefaults.DEFAULT_TX_CACHE],  // every raw transaction ever successfully fetched, deduped by id — lets old periods stay visible without re-querying the API
  jarPending: 0,       // running total of unsent daily savings, accumulates day over day instead of resetting
  jarLastDate: null,    // last date whose savings were already folded into jarPending
  jarPeriodStart: null, // which 10th-to-10th cycle jarPending belongs to (resets on a new cycle)
  jarEnabled: true,      // optional — on by default for now, since she needs it this period
  jarDailyBudget: null,  // FROZEN at enable time — deliberately does not shrink/grow as balance changes day to day
  jarDraftStartDate: null, // transient — whatever she's currently picked in the date field, before clicking (Re)start
  jarStartDateActual: null, // when THIS tracking run actually began — fixed, unlike jarLastDate which advances to today once caught up
  jarAutoCheckedThisLoad: false, // ensures the background jar catch-up only runs once per page load, never re-fires mid-interaction
  useCache: true, // whether to merge cached historical periods in alongside the freshly fetched range
  viewTab: 'current', // 'current' | 'previous' — which period tab is showing in the results view
  trips: [],          // [{id, name}] — named trips she can tag transactions with
  tripOf: {},          // txKey -> tripId
  expandedTrips: {},    // tripId -> bool, which trip cards are open
  customCats: [],     // user-added categories: [{name, icon}] — window.MonoStatDefaults.DEFAULT_CUSTOM_CATS applied below
  step: 'connect',   // connect -> accounts -> results
  manualJsonMode: false,
  manualJsonText: ''
};

// ---------- Supabase (реальна база даних, спільна для всіх пристроїв) ----------
