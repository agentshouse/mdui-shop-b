import {createHouseDataProvider,houseRuntime,readShop,shopQuery,type HouseRuntime,type ShopDataProvider,type ShopFormDraft,type ShopResource} from './house';
export type Row={id:string|number;[key:string]:any};
export type Database=ReturnType<typeof readShop>;
type Draft=NonNullable<Awaited<ReturnType<HouseRuntime['roomDraft']['read']>>>;
export type Snapshot={ready:boolean;error:string;warning:string;db:Database;outcomes:Record<string,string>;drafts:readonly Draft[];version:number};
const blank=():Database=>({products:[],customers:[],orders:[],categories:[],invoices:[],reviews:[]});
const message=(e:unknown)=>e instanceof Error?e.message:String(e);
/** One complete reactive Room projection. Navigation and search never invoke a provider. */
export class ShopStore{
 private value:Snapshot={ready:false,error:'',warning:'',db:blank(),outcomes:{},drafts:[],version:0};private listeners=new Set<()=>void>();private closes:(()=>void)[]=[];
 md?:HouseRuntime;provider?:ShopDataProvider;room='';private synced=false;private guarded=false;private denied='';private lost='';private stopped=false;private querying='';private initial?:Promise<void>;
 private batches=new Map<string,string[]>();private pathBatch=new Map<string,string>();private savingPath='';private activeRooms:readonly {locator:string}[]=[];
 snapshot=()=>this.value;subscribe=(fn:()=>void)=>{this.listeners.add(fn);return()=>{this.listeners.delete(fn);};};
 constructor(private connect=houseRuntime){}
 private emit(patch:Partial<Snapshot>){if(this.stopped)return;this.value={...this.value,...patch,version:this.value.version+1};this.listeners.forEach(fn=>fn());}
 private async watch<T>(p:Promise<{current():T;subscribe(fn:(v:T)=>void):()=>void;close():void}>,fn:(v:T)=>void){const obs=await p;if(this.stopped){obs.close();return;}fn(obs.current());this.closes.push(obs.subscribe(v=>{if(!this.stopped)fn(v);}),()=>obs.close());}
 private refresh(){const room=this.activeRooms.length===1?this.activeRooms[0].locator:'';const changed=Boolean(this.room&&room!==this.room);const ready=this.guarded&&this.synced&&room===this.room&&Boolean(this.provider)&&this.querying===room&&!this.denied&&!this.lost&&!changed;this.emit({ready,error:this.denied||this.lost||(changed?'The Room binding changed. Reopen this App; existing drafts are kept.':this.synced&&!room?'Bind exactly one Shop Room in House.':'')});if(!this.room&&room&&this.synced&&this.guarded){this.room=room;void this.openRoom(room);}}
 start(){return this.initial??=(async()=>{try{this.md=await this.connect();if(this.stopped)return;await Promise.all([
 this.watch(this.md.observe('rooms'),rooms=>{this.activeRooms=rooms;this.refresh();}),
 this.watch(this.md.observe('sync-status'),v=>{this.synced=v.lastCompleted!=null;this.refresh();}),
 this.watch(this.md.observe('connection-refusal'),v=>{this.denied=v?'House connection refused. Open input is preserved.':'';this.refresh();}),
 this.watch(this.md.observe('storage-loss'),v=>{this.lost=v?'House reports lost local changes. Check the Room before editing.':'';this.refresh();}),
 this.watch(this.md.observe('service-mode'),v=>this.emit({warning:v==='write-halted'?'Uploads are paused. Local drafts and Save remain available.':''})),
 this.watch(this.md.observe('room-drafts'),drafts=>{const outcomes={...this.value.outcomes};for(const draft of drafts)if(draft.room===this.room&&draft.returned)outcomes[draft.path]=`Returned by House: ${JSON.stringify(draft.returned)}`;this.emit({drafts,outcomes});}),
 ]);this.guarded=true;this.refresh();}catch(e){this.emit({ready:false,error:message(e)});}})();}
 private async openRoom(room:string){try{
 this.provider=createHouseDataProvider(this.md!,room,{observed:true,isAvailable:()=>this.value.ready,onMutation:e=>{if(e.phase==='idle'&&this.savingPath)this.outcome(this.savingPath,'No changes to save.');if(e.phase==='queued'&&e.identifier&&this.savingPath){this.pathBatch.set(this.savingPath,e.identifier);if(!this.value.outcomes[this.savingPath]?.startsWith('Saved')&&!this.value.outcomes[this.savingPath]?.startsWith('Returned'))this.outcome(this.savingPath,'Queued locally; waiting for House.');}}});
 await this.watch(this.md!.observe('query',{...shopQuery,rooms:[room]}),v=>{this.provider!.setObservedSnapshot(v);this.querying=room;this.emit({db:readShop(v,room)});this.refresh();});
 await this.watch(this.md!.observe('queue',room),entries=>{const previous=this.batches;this.batches=new Map();for(const e of entries){const paths=e.batch.changes.map(c=>c.path);this.batches.set(e.batch.id,paths);for(const path of paths){this.pathBatch.set(path,e.batch.id);this.outcome(path,e.state==='accepted'?'Accepted by House; replica is catching up.':e.state==='submitted'?'Submitted; waiting for House.':e.state==='reset'?'Queued; House scheduled a retry.':'Queued locally; waiting for House.');}}for(const [id,paths]of previous)if(!this.batches.has(id))void this.resolveDeparture(room,id,paths);});
 }catch(e){this.emit({ready:false,error:message(e)});}}
 private outcome(path:string,status:string){this.emit({outcomes:{...this.value.outcomes,[path]:status}});}
 private async resolveDeparture(room:string,id:string,paths:string[]){for(const path of paths){try{const draft=await this.md!.roomDraft.read(room,path);if(this.stopped||room!==this.room||this.batches.has(id)||this.pathBatch.get(path)!==id)continue;this.outcome(path,draft?.returned?`Returned by House: ${JSON.stringify(draft.returned)}`:draft?'Saved; newer local draft not saved.':'Saved.');}catch(e){this.outcome(path,`Could not read save outcome: ${message(e)}`);}}}
 async openDraft(resource:ShopResource,row:Row|undefined,initial:Record<string,unknown>){if(!this.value.ready)throw new Error('The Room is not ready.');return this.provider!.openDraft(resource,row,initial);}
 async stage(session:ShopFormDraft,patch:Record<string,unknown>){if(!this.value.ready)throw new Error('The Room is unavailable. Your input is kept in this form.');if(!await this.md!.persistence())throw new Error('Local storage is not durable. Keep this form open; input has not been stored.');await session.write(patch);}
 async save(resource:ShopResource,session:ShopFormDraft){if(!this.value.ready)throw new Error('The Room is unavailable. Your draft is kept.');const prepared=await session.prepare();this.savingPath=prepared.reference?.path??prepared.previousData?._house?.path??'';const meta={houseDraft:prepared.reference};try{const result=prepared.existing?await this.provider!.update(resource,{id:prepared.data.id,data:prepared.data,previousData:prepared.previousData,meta}):await this.provider!.create(resource,{data:prepared.data,meta});const path=this.savingPath;const id=this.pathBatch.get(path);if(path&&id){const current=await this.md!.observe('queue',this.room);const queued=current.current().some(entry=>entry.batch.id===id);current.close();if(!queued)await this.resolveDeparture(this.room,id,[path]);}return result.data as Row;}finally{this.savingPath='';}}
 stop(){this.stopped=true;this.closes.forEach(fn=>fn());this.closes=[];}
}
