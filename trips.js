/* ==== module: trips.js (auto-generated split) ==== */
import { render } from './panels.js';
import { persistTrips } from './persistence.js';
import { state } from './state.js';

export async function addTrip(name){
  name = name.trim();
  if(!name) return;
  state.trips.push({id:'trip_'+Date.now(), name});
  render();
  await persistTrips();
}

export async function deleteTrip(tripId){
  state.trips = state.trips.filter(t=>t.id!==tripId);
  Object.keys(state.tripOf).forEach(k=>{ if(state.tripOf[k]===tripId) delete state.tripOf[k]; });
  render();
  await persistTrips();
}

export async function renameTrip(tripId, newName){
  newName = (newName||'').trim();
  if(!newName) return;
  const trip = state.trips.find(t=>t.id===tripId);
  if(!trip) return;
  trip.name = newName;
  render();
  await persistTrips();
}

export async function setTripDates(tripId, dateFrom, dateTo){
  const trip = state.trips.find(t=>t.id===tripId);
  if(!trip) return;
  const validFrom = /^\d{4}-\d{2}-\d{2}$/.test(dateFrom||'');
  const validTo = /^\d{4}-\d{2}-\d{2}$/.test(dateTo||'');
  if(!validFrom || !validTo){
    alert('Дата має бути у форматі РРРР-ММ-ДД, наприклад 2026-06-10.');
    return;
  }
  trip.dateFrom = dateFrom;
  trip.dateTo = dateTo;
  render();
  await persistTrips();
}

export async function assignTrip(key, tripId){
  if(!tripId) delete state.tripOf[key];
  else state.tripOf[key] = tripId;
  render();
  await persistTrips();
}
