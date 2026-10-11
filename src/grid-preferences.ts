import {houseRuntime} from './house';
export type GridPreference={id:string;w:number};
type Presentation=Record<string,unknown>;
const cache=new Map<string,GridPreference[]>();const listeners=new Set<()=>void>();let started:Promise<void>|undefined;let value:Presentation={};let writes=Promise.resolve();let error='';
const emit=()=>listeners.forEach(fn=>fn());
const valid=(v:unknown):v is GridPreference[]=>Array.isArray(v)&&v.every(c=>c&&typeof c.id==='string'&&Number.isFinite(c.w)&&c.w>=40&&c.w<=2000);
export const gridPreferences={
 subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};},
 read(name:string){return cache.get(name);},
 error(){return error;},
 start(){return started??=(async()=>{try{const md=await houseRuntime();const v=await md.presentation.read();if(v&&typeof v==='object'&&!Array.isArray(v))value=v as Presentation;const grids=value.shopBGrids;if(grids&&typeof grids==='object'&&!Array.isArray(grids))for(const[name,cols]of Object.entries(grids))if(valid(cols)&&!cache.has(name))cache.set(name,cols);emit();}catch(e){error='Column preferences could not be restored: '+String(e);emit();throw e;}})();},
 update(name:string,columns:GridPreference[]){if(!valid(columns))return;cache.set(name,columns);emit();writes=writes.catch(()=>{}).then(async()=>{await this.start();const md=await houseRuntime();const existing=value.shopBGrids&&typeof value.shopBGrids==='object'?value.shopBGrids:{};value={...value,shopBGrids:{...existing,[name]:cache.get(name)}};await md.presentation.write(value as never);error='';emit();}).catch(e=>{error='Column preferences are temporary: '+String(e);emit();});}
};
