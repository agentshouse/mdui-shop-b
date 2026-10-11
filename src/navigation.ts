import {createMemoryHistory} from 'history';
import type {HouseBridge} from '@agentshouse/app-bridge';
const routes=/^\/(?:products|customers|orders|categories|invoices)(?:\/[A-Za-z0-9_-]+)?$|^\/about$/;
export const safeRoute=(value:string|null)=>value&&routes.test(value)?value:'/products';
export function createHouseHistory(bridge:HouseBridge,onError:(e:unknown)=>void){const history=createMemoryHistory({initialEntries:[safeRoute(bridge.address())]});let syncing=false;let generation=0;const unlisten=history.listen((location,action)=>{if(syncing)return;const target=safeRoute(location.pathname);const job=++generation;void(action==='REPLACE'?bridge.replace(target):bridge.push(target)).catch(e=>{if(job===generation)onError(e);});});const stop=bridge.onAddress(address=>{const path=safeRoute(address);if(history.location.pathname===path)return;generation++;syncing=true;history.replace(path);syncing=false;});return{history,close:()=>{unlisten();stop();}};}
