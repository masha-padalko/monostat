/* ==== module: categorize.js (auto-generated split) ==== */
import { render } from './panels.js';
import { setOverride, setTxCategoryOverride } from './persistence.js';
import { CATS, state } from './state.js';
import { storageSet } from './storage.js';
import { curSym, fmt, txKey } from './utils.js';

export function sortedCats(){
  return [...CATS].sort((a,b)=>a.localeCompare(b,'uk'));
}

export const COLORS = {
  'продукти':'#C9A24B','продукти спільні':'#C4A24B','такси':'#4FA98C','транспорт':'#7FB7A3',
  'Путешествия транспорт: самолёт':'#B7734F','Путешествия транспорт: кава в літаку':'#D9A374','Путешествия транспорт: поезд':'#D4956E',
  'Путешествия транспорт: автобус':'#E3B084','Путешествия транспорт: інше':'#8C6A4E',
  'авто':'#8C6A5C','бензин':'#C15B4A','обеды':'#E0C468','дц':'#6E8FA8','бьюти':'#A87FA8',
  'лекарства':'#7FA8A0','анализи':'#5C8C8C','йожа':'#8FA85C','подарунки':'#D48FAA',
  'розваги':'#B88AC4','розваги спільні':'#C4A0CE',
  'Internet':'#5C7A8C','одежда':'#A8955C','готівка (зняття)':'#6B6459',
  'послуги (ФОП)':'#8C7A5C','перекази людям':'#5C6B8C',
  'квартплата':'#6E7F5C','інше':'#4A443A'
};

export const ICONS = {
  'продукти':'🧺','продукти спільні':'🧺🤝','такси':'🚕','транспорт':'🚌',
  'Путешествия транспорт: самолёт':'✈️','Путешествия транспорт: кава в літаку':'☕','Путешествия транспорт: поезд':'🚆',
  'Путешествия транспорт: автобус':'🚌','Путешествия транспорт: інше':'🧳',
  'авто':'🚗','бензин':'⛽','обеды':'🍽️','дц':'🏬','бьюти':'💅',
  'лекарства':'💊','анализи':'💉','йожа':'🧘','подарунки':'🎁',
  'розваги':'🎉','розваги спільні':'🎉🤝',
  'Internet':'📶','одежда':'👗','готівка (зняття)':'💵',
  'послуги (ФОП)':'🧾','перекази людям':'🤝',
  'квартплата':'🏠','інше':'❓'
};

export function defaultRules(){
  return [
    {kw:['фора','сільпо','атб','novus','lidl','carrefour','велмарт','megaimage','gatedo','mini mart','kollmarket','ovochi','лоток','moldretail','коло','маркетопт','ашан','екомаркет','stambo'],cat:'продукти'},
    {kw:['bolt','uklon','uber'],cat:'такси'},
    {kw:['wizz','ryanair','turkish air','lufthansa','kiwi.com','flyone','aelia'],cat:'Путешествия транспорт: самолёт'},
    {kw:['укрзалізниця','залізни','cfr','societatea nationala'],cat:'Путешествия транспорт: поезд'},
    {kw:['flixbus','bus station','автовокзал'],cat:'Путешествия транспорт: автобус'},
    {kw:['omio','busfor'],cat:'Путешествия транспорт: інше'},
    {kw:['окко','wog','азс','avias','socar','glusco','azs'],cat:'бензин'},
    {kw:['kaviarnia','dnata catering','zhniva','santandreea','imbarcadero','vypichka','the coffee','кав\'ярня','кафе'],cat:'обеды'},
    {kw:['prostor','brocard','eva '],cat:'дц'},
    {kw:['salon','medcity','салон крас'],cat:'бьюти'},
    {kw:['аптека','apteka','аптечка'],cat:'лекарства'},
    {kw:['діла','synevo','сінево','медична лаборатор'],cat:'анализи'},
    {kw:['йога','yoga','sport life','спортлайф'],cat:'йожа'},
    {kw:['rozetka','tezenis','media galaxy','wayforpay','нова пошта','mo sviato'],cat:'подарунки'},
    {kw:['vodafone','kyivstar','київстар','lifecell','terms','google'],cat:'Internet'},
    {kw:['humana'],cat:'одежда'},
    {kw:['atm '],cat:'готівка (зняття)'},
    {kw:['фоп '],cat:'послуги (ФОП)'}
  ];
}

export function mccFallback(mcc){
  const m = {4111:'транспорт',4112:'Путешествия транспорт: поезд',4121:'такси',4131:'Путешествия транспорт: інше',
    4722:'Путешествия транспорт: самолёт',3000:'Путешествия транспорт: самолёт',5411:'продукти',5499:'продукти',
    5541:'бензин',5814:'обеды',5812:'обеды',5977:'бьюти',5912:'лекарства',8071:'анализи',8099:'анализи',
    7997:'йожа',5691:'одежда',6011:'готівка (зняття)',4900:'Internet',4814:'Internet',7299:'Путешествия транспорт: інше'};
  return m[mcc] || null;
}

export function isPersonTransfer(desc){
  return /^[А-ЯЇЄІҐ][а-яїєіґ']+\s[А-ЯЇЄІҐ]\.?$/.test(desc.trim()) || desc.startsWith('From:') || /^\d{6}\*{4,}\d+$/.test(desc.trim());
}

export function categorize(desc, mcc, amount, overrides, rules){
  const d = desc.toLowerCase();
  if(overrides[desc]) return overrides[desc];
  // small Wizz Air charges (under 600) are onboard snacks/coffee/seat fees, not the ticket itself
  if(d.includes('wizz') && amount < 0 && Math.abs(amount) < 600) return 'Путешествия транспорт: кава в літаку';
  for(const r of rules){
    for(const kw of r.kw){ if(d.includes(kw)) return r.cat; }
  }
  if(isPersonTransfer(desc) && amount < 0) return 'перекази людям';
  const fb = mccFallback(mcc);
  if(fb) return fb;
  return 'інше';
}
// Category for one specific transaction: a per-transaction override (set when she picks
// "тільки цю покупку") always wins over the merchant-wide rule, so recategorizing one
// odd purchase (e.g. a supermarket run that was actually entertainment) doesn't drag
// every other purchase from that same store along with it.

export function categoryFor(t){
  const override = state.txCategoryOverride[txKey(t)];
  if(override) return override;
  return categorize(t.desc, t.mcc, t.amount, state.overrides, state.rules);
}

// Groups her fine-grained categories into the 4 buckets that actually matter when
// looking back at a trip: where did the money go — housing, getting around, food, or
// everything else (souvenirs, beauty, entertainment, etc.)

export function tripGroupFor(cat){
  const housing = ['Путешествия - жилье'];
  const transport = ['такси','транспорт','Путешествия транспорт: самолёт','Путешествия транспорт: кава в літаку',
    'Путешествия транспорт: поезд','Путешествия транспорт: автобус','Путешествия транспорт: інше','авто','бензин'];
  const food = ['продукти','продукти спільні','обеды'];
  if(housing.includes(cat)) return 'Житло';
  if(transport.includes(cat)) return 'Транспорт';
  if(food.includes(cat)) return 'Їжа';
  return 'Інше';
}

export const TRIP_GROUP_ORDER = ['Житло','Транспорт','Їжа','Інше'];

export const TRIP_GROUP_ICONS = {'Житло':'🏠','Транспорт':'🚌','Їжа':'🍽️','Інше':'🛍️'};

// Shared handler for the category <select> wherever it appears. Asks whether the change
// should apply only to this one purchase or to every purchase from that merchant — because
// by default a category change is merchant-wide, which surprised her when one supermarket
// trip she wanted as "розваги" quietly recategorized every other supermarket run too.

export function handleCategoryChange(t, newCat){
  const onlyThis = confirm(`Застосувати «${newCat}» тільки до цієї покупки (${t.desc}, ${fmt(Math.abs(t.amount))} ${curSym()})?\n\nOK — тільки ця операція.\nСкасувати — до всіх покупок у «${t.desc}» (як завжди).`);
  if(onlyThis) setTxCategoryOverride(txKey(t), newCat);
  else setOverride(t.desc, newCat);
}



// ---------- state ----------

export const CUSTOM_CAT_PALETTE = ['#8C6FA8','#5C8C6E','#B88A4E','#4E7FA8','#A85C6E','#7F8C4E','#6E5CA8'];

export function applyCustomCategory(c, addToList){
  if(!CATS.includes(c.name)) CATS.push(c.name);
  ICONS[c.name] = c.icon || '🏷️';
  if(!COLORS[c.name]) COLORS[c.name] = CUSTOM_CAT_PALETTE[state.customCats.length % CUSTOM_CAT_PALETTE.length];
  if(addToList) state.customCats.push(c);
}

export async function addCustomCategory(name, icon){
  name = name.trim();
  if(!name || CATS.includes(name)) return false;
  applyCustomCategory({name, icon: icon.trim()}, true);
  await storageSet('ms_customcats', JSON.stringify(state.customCats));
  render();
  return true;
}
