import {MessageChannel} from 'node:worker_threads';
import {readFileSync} from 'node:fs';
import {act,fireEvent,render,waitFor} from '@testing-library/react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {IDBFactory,IDBKeyRange} from 'fake-indexeddb';
import {createMemoryHistory} from 'history';
import {serveMdRuntime} from '@agentshouse/mdruntime/host';
import {connectMdRuntime} from '@agentshouse/mdruntime/client';
import {createMemoryAdapter} from '@agentshouse/mdruntime/memory';
import {ShopApp} from '../src/App';
import {ShopStore} from '../src/store';
import type {HouseRuntime} from '../src/house';

// Actual SDK host/client, MessagePorts, ShopApp, useDraft and EditorJS. Only
// IndexedDB and the provider's remote data are replaced with test implementations.
// This exercises native Draft persistence/reopening, not hosted-browser acceptance.
const schema=readFileSync('schema.yaml','utf8');
const category=readFileSync('starter/shop/categories/first.md','utf8');
const product=readFileSync('starter/shop/products/first.md','utf8');
const room='native-shop-description';
const paragraphs=[
  'Utrimque video defetiscor circumvenio. Adinventitias auctor vivo harum arcesso culpo. Patria praesentium tego adimpleo.',
  'QA acceptance copy of fictional Aerial Coast (shop/products/donor-126.md), not a live product. Original donor data: React Admin retail data-generator, MIT, https://github.com/marmelab/react-admin/tree/f1213e048d60d83df74900b2fc8415fd3287610c/examples/demo . Original source record and bundled MIT notice remain unchanged.',
];
let generation:string|null=null;
beforeEach(()=>{
  generation=null;
  vi.stubGlobal('indexedDB',new IDBFactory());vi.stubGlobal('IDBKeyRange',IDBKeyRange);
  vi.stubGlobal('IntersectionObserver',class{observe(){}unobserve(){}disconnect(){}});
});
afterEach(()=>vi.unstubAllGlobals());
function native(){
  const adapter=createMemoryAdapter({rooms:[{
    locator:room,handle:'native-shop-description',name:'Native fixture',roomVersion:'1',
    operations:{read:[''],sync:[''],write:[''],delete:['']},
    replica:{selection:'all',admission:'admitted'},providerOwnedPaths:[],
    model:{kind:'model',snapshot:{identity:'fixture-model',version:'1',revision:'fixture-schema-1',schema}},
    documents:{'shop/categories/first.md':category,'shop/products/first.md':product},
  }]});
  const host=serveMdRuntime({adapter,shell:{
    persistentStorage:true,generation,
    keepGeneration:value=>{generation=value;},dropGeneration:()=>{generation=null;},
  }});
  const channel=new MessageChannel();
  host.attach(channel.port1 as any,'shop-b-description-fixture');
  const client=connectMdRuntime(channel.port2 as any);
  const writes=vi.spyOn(client.roomDraft,'write');const save=vi.spyOn(client,'save');
  return{client,writes,save,async close(){channel.port1.close();channel.port2.close();await host.stop();}};
}
it.each([['new','input'],['reopened','input'],['new','paste'],['reopened','paste']])('keeps actual EditorJS %s-form %s through native Runtime restart',async(state,method)=>{
  let backend=native();let store=new ShopStore(async()=>backend.client as HouseRuntime);
  let view:ReturnType<typeof render>|undefined;
  const mount=()=>render(<ShopApp store={store} history={createMemoryHistory({initialEntries:['/products/new']})}/>);
  try{
    if(state==='reopened'){
      await store.start();await waitFor(()=>expect(store.snapshot().ready).toBe(true));
      const seed=await store.openDraft('products',undefined,{
        reference:'QA real runtime draft',category_id:'first',description:'',
        width:29.01,height:27.38,price:46.55,stock:0,image:'',thumbnail:'',
      });
      await store.stage(seed,{reference:'QA real runtime draft'});seed.close();store.stop();
      await backend.close();backend=native();store=new ShopStore(async()=>backend.client as HouseRuntime);
    }
    view=mount();
    await waitFor(()=>expect(view!.container.querySelector('input[name="reference"]')).not.toBeDisabled(),{timeout:10000});
    if(state==='new'){
      fireEvent.change(view.container.querySelector('input[name="reference"]')!,{target:{value:'QA real runtime draft'}});
      await waitFor(()=>expect(view!.container.textContent).toContain('Draft kept on this device.'));
    }else expect(view.container.querySelector('input[name="reference"]')).toHaveValue('QA real runtime draft');
    await waitFor(()=>{
      expect(view!.container.querySelector('.ce-paragraph')).not.toBeNull();
      expect(view!.container.querySelector('[data-test-id="rich-text-editor-description"][inert]')).toBeNull();
    });
    const priorWrites=backend.writes.mock.calls.length;
    const paragraph=view.container.querySelector('.ce-paragraph') as HTMLElement;
    fireEvent.focusIn(paragraph);
    // No keydown, blur or Save. EditorJS handles multi-block paste itself and
    // prevents native input; both paths must carry user intent to the Draft.
    if(method==='paste'){
      const input=vi.fn();paragraph.addEventListener('input',input);
      fireEvent.paste(paragraph,{clipboardData:{types:['text/plain'],getData:(type:string)=>type==='text/plain'?paragraphs.join('\n\n'):''}});
      expect(input).not.toHaveBeenCalled();
    }else{
      paragraph.innerHTML=paragraphs[0]+'<div><br></div><div>'+paragraphs[1]+'</div>';
      fireEvent.input(paragraph,{inputType:'insertText',data:paragraphs.join('\n\n')});
    }
    await waitFor(()=>expect(backend.writes).toHaveBeenCalledTimes(priorWrites+1),{timeout:5000});
    await waitFor(()=>expect(view!.container.textContent).toContain('Draft kept on this device.'));
    const drafted=await backend.client.roomDraft.list();expect(drafted).toHaveLength(1);
    const exact=(drafted[0].parts.creation as any).fields.description;
    for(const text of paragraphs)expect(exact).toContain(text);
    expect(backend.save).not.toHaveBeenCalled();
    view.unmount();view=undefined;await backend.close();
    backend=native();store=new ShopStore(async()=>backend.client as HouseRuntime);view=mount();
    await waitFor(()=>expect(view!.container.querySelector('[data-rich-text-field]')?.textContent).toContain(paragraphs[1]),{timeout:10000});
    expect(view.container.querySelector('input[name="reference"]')).toHaveValue('QA real runtime draft');
    expect(((await backend.client.roomDraft.list())[0].parts.creation as any).fields.description).toBe(exact);
    expect(backend.writes).not.toHaveBeenCalled();expect(backend.save).not.toHaveBeenCalled();
  }finally{view?.unmount();store.stop();await act(async()=>backend.close());}
},30000);
