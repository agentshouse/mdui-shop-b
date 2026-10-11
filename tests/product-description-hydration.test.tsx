import {act,render} from '@testing-library/react';
import {ThemeProvider} from '@saleor/macaw-ui-next';
import {beforeEach,expect,it,vi} from 'vitest';
import type {OutputData} from '@editorjs/editorjs';
import {draftBoundary} from './support/business-drafts';
import {descriptionBlocks} from '../src/description';
const host=vi.hoisted(()=>({props:null as any}));
vi.mock('../src/donor/components/RichTextEditor/RichTextEditor',()=>({default:(props:any)=>{host.props=props;return <div data-testid="rich-editor"/>;}}));
vi.mock('../src/donor/components/DetailSettingsCard/DetailSettingsCard',()=>({DetailSettingsCard:({children}:any)=><section>{children}</section>}));
const{ProductDetailsForm}=await import('../src/donor/products/components/ProductDetailsForm/ProductDetailsForm');
const rich='<p>Exact donor paragraph &amp; source.</p><p>QA copy; original MIT donor source retained.</p>';
beforeEach(()=>{host.props=null;});
function editor(){let current=descriptionBlocks('');return{clear:vi.fn(),save:vi.fn(async()=>current),destroy:vi.fn(),render:vi.fn(async(data:OutputData)=>{current=data;}),dangerouslyLowLevelInstance:null,initialize(data:OutputData){current=data;}};}
function initialize(core:ReturnType<typeof editor>){core.initialize(host.props.defaultValue);host.props.onInitialize?.(core);host.props.editorRef.current=core;host.props.onReady?.();}
function form(data:Record<string,unknown>,onChange:(patch:Record<string,unknown>)=>void,flush:{current:(()=>Promise<void>)|undefined}){return <ThemeProvider defaultTheme="defaultLight"><ProductDetailsForm data={data} disabled={false} onChange={onChange} flush={flush}/></ThemeProvider>;}
it.each(['draft-first','editor-first'])('hydrates exact native creation Draft content in %s order without writing on open',async order=>{
  const{provider,methods}=draftBoundary();const first=await provider.openDraft('products',undefined,{reference:'QA donor copy',category_id:'category',width:29.01,height:27.38,price:46.55,stock:0,image:'',thumbnail:''});
  await first.write({description:rich});first.close();const reopened=await provider.openDraft('products',undefined,{});expect(reopened.values().description).toBe(rich);
  const writes=methods.roomDraft.write.mock.calls.length;const onChange=vi.fn();const flush={current:undefined as (()=>Promise<void>)|undefined};const core=editor();
  const view=render(form({description:''},onChange,flush));
  if(order==='editor-first')await act(async()=>initialize(core));
  view.rerender(form(reopened.values(),onChange,flush));
  if(order==='draft-first')await act(async()=>initialize(core));
  await act(async()=>{});
  expect(core.render).toHaveBeenCalledWith(descriptionBlocks(rich));expect(onChange).not.toHaveBeenCalled();expect(methods.roomDraft.write).toHaveBeenCalledTimes(writes);
  expect(reopened.values().description).toBe(rich);view.unmount();reopened.close();
});
it('does not replace newer user text when editor readiness follows an older pending hydration',async()=>{
  const onChange=vi.fn();const flush={current:undefined as (()=>Promise<void>)|undefined};const core=editor();
  const view=render(form({description:''},onChange,flush));view.rerender(form({description:rich},onChange,flush));
  const newer='<p>Newer user text, still linked to the MIT donor.</p>';
  await act(async()=>{host.props.onFocus();host.props.onInputCapture();host.props.onChange(descriptionBlocks(newer));initialize(core);});
  expect(onChange).toHaveBeenLastCalledWith({description:newer});expect(core.render).not.toHaveBeenCalledWith(descriptionBlocks(rich));
});
it('does not persist an empty programmatic initial render as a native field edit',async()=>{
  const onChange=vi.fn();const flush={current:undefined as (()=>Promise<void>)|undefined};const core=editor();
  const view=render(form({description:''},onChange,flush));view.rerender(form({description:rich},onChange,flush));
  await act(async()=>{initialize(core);host.props.onChange({blocks:[]});});
  expect(onChange).not.toHaveBeenCalled();
});
it('invalidates queued hydration when a newer user edit arrives before it runs',async()=>{
  const onChange=vi.fn();const flush={current:undefined as (()=>Promise<void>)|undefined};const core=editor();
  const view=render(form({description:''},onChange,flush));await act(async()=>initialize(core));
  const newer='<p>Latest typing wins over the queued old snapshot.</p>';
  act(()=>{view.rerender(form({description:rich},onChange,flush));host.props.onFocus();host.props.onInputCapture();host.props.onChange(descriptionBlocks(newer));});
  await act(async()=>{});expect(core.render).not.toHaveBeenCalledWith(descriptionBlocks(rich));expect(onChange).toHaveBeenLastCalledWith({description:newer});
});
it('ignores empty programmatic render callbacks even after the editor has been focused',async()=>{
  const onChange=vi.fn();const flush={current:undefined as (()=>Promise<void>)|undefined};const core=editor();
  vi.mocked(core.render).mockImplementation(async data=>{core.initialize(data);host.props.onChange({blocks:[]});});
  const view=render(form({description:''},onChange,flush));await act(async()=>{initialize(core);host.props.onFocus();});
  view.rerender(form({description:rich},onChange,flush));await act(async()=>{});
  expect(core.render).toHaveBeenCalledWith(descriptionBlocks(rich));expect(onChange).not.toHaveBeenCalled();
});
it.each(['Plain donor & source.\nOriginal second line.',rich])('preserves exact untouched raw/rich source after focus and Save flush: %s',async original=>{
  const onChange=vi.fn();const flush={current:undefined as (()=>Promise<void>)|undefined};const core=editor();vi.mocked(core.save).mockResolvedValue(descriptionBlocks(original));
  render(form({description:original},onChange,flush));await act(async()=>{initialize(core);host.props.onFocus();});
  await act(async()=>flush.current?.());expect(onChange).not.toHaveBeenCalled();
});
it('preserves native rich content and exact original CAS base across unmount/reopen',async()=>{
  const{provider,drafts,methods}=draftBoundary();const{data}=await provider.getOne('products',{id:'product'});const original=data._house.fields.description;
  const session=await provider.openDraft('products',data,data);const flush={current:undefined as (()=>Promise<void>)|undefined};const core=editor();
  let pending=Promise.resolve();const onChange=vi.fn((patch:Record<string,unknown>)=>{pending=session.write(patch);});
  const view=render(form(session.values(),onChange,flush));await act(async()=>{initialize(core);host.props.onFocus();host.props.onInputCapture();host.props.onChange(descriptionBlocks(rich));});await pending;
  expect(drafts.get(data._house.path)?.parts.fields?.description).toEqual({value:rich,base:{value:original}});view.unmount();session.close();
  const reopened=await provider.openDraft('products',data,data);expect(reopened.values().description).toBe(rich);expect((await reopened.prepare()).previousData?._house.fields.description).toBe(original);
  expect(methods.save).not.toHaveBeenCalled();reopened.close();
});
it('blocks Save flush after failed hydration while leaving incoming native content unchanged',async()=>{
  const onChange=vi.fn();const flush={current:undefined as (()=>Promise<void>)|undefined};const core=editor();vi.mocked(core.render).mockRejectedValue(new Error('Test renderer failure'));
  const view=render(form({description:''},onChange,flush));view.rerender(form({description:rich},onChange,flush));await act(async()=>initialize(core));
  await expect(flush.current?.()).rejects.toThrow('native draft is kept');expect(onChange).not.toHaveBeenCalled();expect(host.props.helperText).toContain('Test renderer failure');expect(host.props.disabled).toBe(true);host.props.onInputCapture();host.props.onChange(descriptionBlocks('<p>Partial renderer content</p>'));expect(onChange).not.toHaveBeenCalled();
});
it('rejects an old asynchronous empty read delivered after hydration has completed',async()=>{
  const onChange=vi.fn();const flush={current:undefined as (()=>Promise<void>)|undefined};const core=editor();
  const view=render(form({description:''},onChange,flush));await act(async()=>{initialize(core);host.props.onFocus();});
  host.props.onInputCapture();const deliver=host.props.captureChange();host.props.onChange(descriptionBlocks('<p>Local edit acknowledged.</p>'));view.rerender(form({description:'<p>Local edit acknowledged.</p>'},onChange,flush));view.rerender(form({description:rich},onChange,flush));await act(async()=>{});
  expect(core.render).toHaveBeenCalledWith(descriptionBlocks(rich));expect(deliver({blocks:[]})).toBe(false);expect(onChange).toHaveBeenCalledTimes(1);
});
it('records input intent before the debounced read and accepts only the newest asynchronous result',async()=>{
  const onChange=vi.fn();const flush={current:undefined as (()=>Promise<void>)|undefined};const core=editor();
  const view=render(form({description:''},onChange,flush));await act(async()=>initialize(core));
  host.props.onInputCapture();const old=host.props.captureChange();
  view.rerender(form({description:rich},onChange,flush));await act(async()=>{});expect(core.render).not.toHaveBeenCalled();
  host.props.onInputCapture();const newest=host.props.captureChange();const value='<p>Newest actual input.</p>';
  expect(newest(descriptionBlocks(value))).toBe(true);expect(old({blocks:[]})).toBe(false);expect(onChange).toHaveBeenCalledExactlyOnceWith({description:value});
  view.unmount();expect(newest(descriptionBlocks(rich))).toBe(false);
});

it('retains untouched empty paragraphs despite actual saver normalization and a no-op toolbar gesture',async()=>{
  const original='<p>Donor text.</p><p></p>';const onChange=vi.fn();const flush={current:undefined as (()=>Promise<void>)|undefined};const core=editor();core.save.mockResolvedValue(descriptionBlocks('<p>Donor text.</p>'));
  render(form({description:original},onChange,flush));await act(async()=>initialize(core));host.props.onFocus();await act(async()=>flush.current?.());expect(onChange).not.toHaveBeenCalled();
  const button=document.createElement('button');host.props.onPointerDownCapture({target:button});await act(async()=>flush.current?.());expect(onChange).not.toHaveBeenCalled();
});
it('keeps genuine toolbar and block edits on the native Draft path without a text input event',async()=>{
  const onChange=vi.fn();const flush={current:undefined as (()=>Promise<void>)|undefined};const core=editor();render(form({description:rich},onChange,flush));await act(async()=>initialize(core));
  const button=document.createElement('div');button.className='ce-popover-item';host.props.onPointerDownCapture({target:button});const deliver=host.props.captureChange();const changed={blocks:[{type:'header',data:{text:'Donor heading',level:2}}]};
  expect(deliver(changed)).toBe(true);expect(onChange).toHaveBeenCalledExactlyOnceWith({description:'<h2>Donor heading</h2>'});
});

it.each(['callback','flush'])('applies a waiting shared Draft after a no-op toolbar intent is consumed by %s',async path=>{
  const onChange=vi.fn();const flush={current:undefined as (()=>Promise<void>)|undefined};const core=editor();
  const view=render(form({description:'<p>Initial donor source.</p>'},onChange,flush));await act(async()=>initialize(core));
  host.props.onPointerDownCapture({target:document.createElement('button')});const deliver=host.props.captureChange();
  view.rerender(form({description:rich},onChange,flush));await act(async()=>{});expect(core.render).not.toHaveBeenCalled();
  if(path==='callback')await act(async()=>{expect(deliver(descriptionBlocks('<p>Initial donor source.</p>'))).toBe(true);});
  else await act(async()=>flush.current?.());
  expect(core.render).toHaveBeenCalledExactlyOnceWith(descriptionBlocks(rich));expect(onChange).not.toHaveBeenCalled();
});
it('reports failed shared Draft hydration unblocked by no-op Save without writing stale editor content',async()=>{
  const onChange=vi.fn();const flush={current:undefined as (()=>Promise<void>)|undefined};const core=editor();
  const view=render(form({description:'<p>Initial donor source.</p>'},onChange,flush));await act(async()=>initialize(core));
  host.props.onPointerDownCapture({target:document.createElement('button')});view.rerender(form({description:rich},onChange,flush));
  core.render.mockRejectedValue(new Error('Shared update cannot render'));
  await act(async()=>{await expect(flush.current?.()).rejects.toThrow('Shared update cannot render');});expect(onChange).not.toHaveBeenCalled();expect(host.props.disabled).toBe(true);
});
