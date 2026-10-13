// @vitest-environment node
import {expect,it} from 'vitest';
import {draftBoundary} from './support/business-drafts';
const productInput={category_id:'category',reference:'NEW',width:20,height:30,price:15,stock:1,image:'',thumbnail:''};
it('retains incomplete actual product fields locally across reopen, then consumes exactly the validated draft on Save',async()=>{
  const {provider,drafts,methods}=draftBoundary();const first=await provider.openDraft('products',undefined,productInput);
  await first.write({reference:'Typed title',width:'-'});expect(methods.save).not.toHaveBeenCalled();expect(methods.query).not.toHaveBeenCalled();first.close();
  const second=await provider.openDraft('products',undefined,{});expect(second.values()).toMatchObject({reference:'Typed title',width:'-'});
  let prepared=await second.prepare();await expect(provider.create('products',{data:prepared.data,meta:{houseDraft:prepared.reference}})).rejects.toThrow('width');expect(drafts.size).toBe(1);
  await second.write({width:22});prepared=await second.prepare();const writes=methods.roomDraft.write.mock.calls.length;
  const result=await provider.create('products',{data:{...prepared.data,reference:'Stale submit value'},meta:{houseDraft:prepared.reference}});
  expect(result.data.reference).toBe('Typed title');expect(methods.roomDraft.write).toHaveBeenCalledTimes(writes);expect(methods.save).toHaveBeenCalledWith('r',[prepared.reference]);expect(drafts.size).toBe(0);second.close();
});
it('merges disjoint fields and same-field stale typing while preserving first opened bases and redrawing other tabs',async()=>{
  const {provider,drafts,methods,remote,race}=draftBoundary();const {data}=await provider.getOne('products',{id:'product'});
  const first=await provider.openDraft('products',data,data);await first.write({description:'First edit'});const second=await provider.openDraft('products',data,data);
  await second.write({price:29});race(()=>remote(data._house.path,{description:{value:'Other tab',base:{value:'Original description'}}}));
  await first.write({description:'Latest typing'});expect(second.values()).toMatchObject({price:29,description:'Latest typing'});
  expect(drafts.get(data._house.path)?.parts.fields?.description.base).toEqual({value:'Original description'});
  const prepared=await first.prepare();await provider.update('products',{id:data.id,previousData:data,data:{...data,price:99},meta:{houseDraft:prepared.reference}});
  expect(methods.save).toHaveBeenCalledWith('r',[prepared.reference]);expect((await provider.getOne('products',{id:'product'})).data).toMatchObject({price:29,description:'Latest typing',stock:8});first.close();second.close();
});
it('preserves a draft changed after preparation and a provider-refused Save without overwriting or discarding either',async()=>{
  const {provider,drafts,methods,remote,refuse}=draftBoundary();const {data}=await provider.getOne('categories',{id:'category'});
  const session=await provider.openDraft('categories',data,data);await session.write({name:'Local'});const prepared=await session.prepare();remote(data._house.path,{name:{value:'Other tab',base:{value:'Original'}}});
  await expect(provider.update('categories',{id:data.id,previousData:data,data:prepared.data,meta:{houseDraft:prepared.reference}})).rejects.toThrow('shared draft changed');expect(methods.save).not.toHaveBeenCalled();
  const latest=await session.prepare();refuse('changed-underneath');await expect(provider.update('categories',{id:data.id,previousData:data,data:latest.data,meta:{houseDraft:latest.reference}})).rejects.toThrow('kept');
  expect(drafts.get(data._house.path)?.parts.fields?.name.value).toBe('Other tab');expect(methods.roomDraft.discard).not.toHaveBeenCalled();session.close();
});
it('keeps later edits at an old creation pointer intact and transitions an already open creation after another tab saves',async()=>{
  const {provider,drafts,methods}=draftBoundary();const first=await provider.openDraft('products',undefined,productInput);await first.write({reference:'Shared creation'});
  const second=await provider.openDraft('products',undefined,{});const prepared=await first.prepare();const {data}=await provider.create('products',{data:prepared.data,meta:{houseDraft:prepared.reference}});
  await second.write({reference:'After peer Save'});const editing=await second.prepare();expect(editing.existing).toBe(true);expect(drafts.get(data._house.path)?.parts.creation).toBeUndefined();
  expect(drafts.get(data._house.path)?.parts.fields?.reference.base).toEqual({value:'Shared creation'});
  const held=structuredClone(drafts.get(data._house.path));const next=await provider.openDraft('products',undefined,productInput);await next.write({reference:'Distinct next product'});expect(drafts.size).toBe(2);expect(drafts.get(data._house.path)).toEqual(held);
  await provider.update('products',{id:data.id,data:editing.data,previousData:editing.previousData,meta:{houseDraft:editing.reference}});expect(methods.save).toHaveBeenCalledTimes(2);first.close();second.close();next.close();
});
it('allows local draft typing and Save during provider halt but preserves lost-reach and other draft guards',async()=>{
  const {provider,methods,drafts,available}=draftBoundary();const {data}=await provider.getOne('categories',{id:'category'});const session=await provider.openDraft('categories',data,data);
  await session.write({name:'While halted'});const prepared=await session.prepare();available(false);await expect(provider.update('categories',{id:data.id,data:prepared.data,previousData:data,meta:{houseDraft:prepared.reference}})).rejects.toThrow('binding');expect(drafts.size).toBe(1);expect(methods.save).not.toHaveBeenCalled();available(true);
  await provider.update('categories',{id:data.id,data:prepared.data,previousData:data,meta:{houseDraft:prepared.reference}});expect(methods.save).toHaveBeenCalledOnce();session.close();
});

it('validates image references against local Room metadata without a Provider Action, including while write-halted',async()=>{
  const {provider,methods,drafts,attachments}=draftBoundary();
  const first=await provider.openDraft('products',undefined,productInput);
  await first.write({image:'images/declared.jpg',thumbnail:'images/declared.jpg'});
  const prepared=await first.prepare();
  await expect(provider.create('products',{data:prepared.data,meta:{houseDraft:prepared.reference}})).rejects.toThrow('not declared in the selected Room');
  expect(drafts.size).toBe(1);expect(methods.save).not.toHaveBeenCalled();expect(methods.call).not.toHaveBeenCalled();
  attachments.push({reference:'images/declared.jpg',name:'poster.jpg',byteLength:128,mediaType:'image/jpeg',entry:{}});
  const result=await provider.create('products',{data:prepared.data,meta:{houseDraft:prepared.reference}});
  expect(result.data.image).toBe('images/declared.jpg');expect(methods.save).toHaveBeenCalledWith('r',[prepared.reference]);
  expect(methods.query).toHaveBeenCalledWith({rooms:['r'],pathPrefix:'images',select:'all'});expect(methods.call).not.toHaveBeenCalled();expect(drafts.size).toBe(0);first.close();
});

it('does not submit an older draft when the latest local typing write failed',async()=>{
  const {provider,methods,drafts}=draftBoundary();const {data}=await provider.getOne('categories',{id:'category'});
  const session=await provider.openDraft('categories',data,data);await session.write({name:'Earlier local value'});
  methods.roomDraft.write.mockRejectedValueOnce(new Error('Local draft unavailable'));
  await expect(session.write({name:'Newest input'})).rejects.toThrow('Local draft unavailable');
  await expect(session.prepare()).rejects.toThrow('latest input has not reached its local Room Draft');
  expect(methods.save).not.toHaveBeenCalled();expect(session.values().name).toBe('Newest input');
  expect(drafts.get(data._house.path)?.parts.fields?.name.value).toBe('Earlier local value');
  await session.write({name:'Newest input'});const prepared=await session.prepare();
  await provider.update('categories',{id:data.id,previousData:data,data:prepared.data,meta:{houseDraft:prepared.reference}});
  expect((await provider.getOne('categories',{id:'category'})).data.name).toBe('Newest input');session.close();
});

it.each(['products','customers','categories'] as const)('opens a native fields-all %s row, preserves the discriminator in its CAS snapshot, and never edits it',async resource=>{
 const{provider,documents,drafts}=draftBoundary();const doc=documents.find(d=>d.path.includes('/'+resource+'/'))!;const original=structuredClone(doc.fields);const{data}=await provider.getOne(resource,{id:doc.fields.id});
 expect(data._house.fields.type).toBe(doc.type);const session=await provider.openDraft(resource,data,data);expect(session.values()).not.toHaveProperty('type');expect(session.values().id).toBe(doc.fields.id);
 const key=resource==='products'?'reference':resource==='customers'?'first_name':'name';await session.write({[key]:'Native row edit'});const prepared=await session.prepare();expect(prepared.previousData?._house.fields).toEqual(original);expect(drafts.get(doc.path)?.parts.fields).not.toHaveProperty('type');expect(drafts.get(doc.path)?.parts.fields?.[key].base).toEqual({value:original[key]});
 await provider.update(resource,{id:data.id,previousData:data,data:prepared.data,meta:{houseDraft:prepared.reference}});expect(doc.fields.type).toBe(original.type);expect(doc.fields[key]).toBe('Native row edit');session.close();
});
it('rejects an inconsistent discriminator instead of silently stripping it',async()=>{const{provider,documents}=draftBoundary();documents[1].fields.type='shop_customer';await expect(provider.getOne('products',{id:'product'})).rejects.toThrow('Mismatched products document type');});

it('opens all six real donor resource shapes with native fields-all discriminators without changing data',async()=>{
 const{definitions,readShop}=await import('../src/house');const {binaryRecords:records}=await import('./support/binary-records');const{provider,documents,methods}=draftBoundary();
 const fullRows=Object.entries(records).flatMap(([resource,rows])=>(rows as Record<string,unknown>[]).map(row=>({room:'r',path:`shop/${resource}/${row.id}.md`,type:definitions[resource as keyof typeof definitions].type,fields:{type:definitions[resource as keyof typeof definitions].type,...Object.fromEntries(Object.entries(row).map(([key,value])=>[key,typeof value==='boolean'?String(value):value!=null&&typeof value==='object'?JSON.stringify(value):value]))},markdown:''})));
 documents.splice(0,documents.length,...fullRows);const original=structuredClone(documents);const db=readShop({documents},'r');
 for(const resource of Object.keys(definitions) as (keyof typeof definitions)[]){const row=db[resource][0];const session=await provider.openDraft(resource,row,row);expect(session.values().id).toBe(row.id);expect(session.values()).not.toHaveProperty('type');expect((await session.prepare()).previousData?._house.fields).toEqual(row._house.fields);session.close();}
 expect(documents).toEqual(original);expect(methods.roomDraft.write).not.toHaveBeenCalled();expect(methods.save).not.toHaveBeenCalled();
});
