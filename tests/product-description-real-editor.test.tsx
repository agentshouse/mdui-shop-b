import {act,fireEvent,render,waitFor} from '@testing-library/react';
import {ThemeProvider} from '@saleor/macaw-ui-next';
import {expect,it,vi} from 'vitest';
import {ProductDetailsForm} from '../src/donor/products/components/ProductDetailsForm/ProductDetailsForm';
import {draftBoundary} from './support/business-drafts';

const rich='<p>Exact donor paragraph &amp; source.</p><p>QA copy; original MIT donor source retained.</p>';
function form(data:Record<string,unknown>,onChange:(patch:Record<string,unknown>)=>void,flush:{current:(()=>Promise<void>)|undefined}){return <ThemeProvider defaultTheme="defaultLight"><ProductDetailsForm data={data} disabled={false} onChange={onChange} flush={flush}/></ThemeProvider>;}
it('restores and writes using actual EditorJS DOM and asynchronous change delivery',async()=>{
  const {provider,methods}=draftBoundary();
  const first=await provider.openDraft('products',undefined,{reference:'QA donor copy',description:rich});await first.write({description:rich});first.close();
  const reopened=await provider.openDraft('products',undefined,{});
  const onChange=vi.fn((patch:Record<string,unknown>)=>{void reopened.write(patch);});const flush={current:undefined as (()=>Promise<void>)|undefined};
  const view=render(form({description:''},onChange,flush));view.rerender(form(reopened.values(),onChange,flush));
  await waitFor(()=>expect(view.container.querySelectorAll('.ce-paragraph')).toHaveLength(2));
  expect([...view.container.querySelectorAll('.ce-paragraph')].map(node=>node.innerHTML)).toEqual(['Exact donor paragraph &amp; source.','QA copy; original MIT donor source retained.']);
  expect(onChange).not.toHaveBeenCalled();
  const paragraph=view.container.querySelector('.ce-paragraph') as HTMLElement;
  fireEvent.focusIn(paragraph);fireEvent.keyDown(paragraph,{key:'X'});paragraph.innerHTML='Updated donor paragraph.';fireEvent.input(paragraph,{inputType:'insertText',data:'X'});
  await waitFor(()=>expect(onChange).toHaveBeenCalled(),{timeout:4000});
  await act(async()=>{await reopened.prepare();});
  expect(reopened.values().description).toBe('<p>Updated donor paragraph.</p><p>QA copy; original MIT donor source retained.</p>');expect(methods.save).not.toHaveBeenCalled();
  view.unmount();reopened.close();
});
it('records input-only contenteditable fill without keydown or blur',async()=>{
  const {provider}=draftBoundary();const draft=await provider.openDraft('products',undefined,{reference:'QA donor copy',description:''});
  const onChange=vi.fn((patch:Record<string,unknown>)=>{void draft.write(patch);});const flush={current:undefined as (()=>Promise<void>)|undefined};
  const view=render(form(draft.values(),onChange,flush));
  await waitFor(()=>expect(view.container.querySelector('[inert]')).toBeNull());
  const paragraph=view.container.querySelector('.ce-paragraph') as HTMLElement;
  fireEvent.focusIn(paragraph);paragraph.innerHTML='Exact donor paragraph &amp; source.<div><br></div><div>QA copy; original MIT donor source retained.</div>';fireEvent.input(paragraph,{inputType:'insertText',data:'Exact donor paragraph & source.\n\nQA copy; original MIT donor source retained.'});
  await waitFor(()=>expect(onChange).toHaveBeenCalled(),{timeout:4000});
  await act(async()=>{await draft.prepare();});expect(draft.values().description).toContain('QA copy; original MIT donor source retained.');view.unmount();draft.close();
});
it('does not persist unsignaled DOM replacement merely because it is visible',async()=>{
  const onChange=vi.fn();const flush={current:undefined as (()=>Promise<void>)|undefined};
  const view=render(form({description:''},onChange,flush));
  await waitFor(()=>expect(view.container.querySelector('[inert]')).toBeNull());
  const paragraph=view.container.querySelector('.ce-paragraph') as HTMLElement;
  fireEvent.focusIn(paragraph);
  paragraph.innerHTML='Visible DOM text without a browser input event.';
  // The actual EditorJS MutationObserver and debounce run, but a DOM mutation
  // alone has no user-intent authority. This is a deliberate negative control,
  // not evidence about how any hosted automation's fill is implemented.
  await act(async()=>{await new Promise(resolve=>setTimeout(resolve,650));});
  expect(paragraph.textContent).toContain('Visible DOM text');expect(onChange).not.toHaveBeenCalled();
  await act(async()=>flush.current?.());expect(onChange).not.toHaveBeenCalled();
  view.unmount();
});
it('persists multi-paragraph paste handled by EditorJS without keyboard or input events',async()=>{
  const onChange=vi.fn();const flush={current:undefined as (()=>Promise<void>)|undefined};
  const view=render(form({description:''},onChange,flush));
  await waitFor(()=>expect(view.container.querySelector('[inert]')).toBeNull());
  const paragraph=view.container.querySelector('.ce-paragraph') as HTMLElement;
  fireEvent.focusIn(paragraph);
  fireEvent.paste(paragraph,{clipboardData:{types:['text/plain'],getData:(type:string)=>type==='text/plain'?'Exact donor paragraph.\n\nOriginal MIT provenance retained.':''}});
  await waitFor(()=>expect(view.container.querySelectorAll('.ce-paragraph')).toHaveLength(2));
  await waitFor(()=>expect(view.container.textContent).toContain('Original MIT provenance retained.'));
  await waitFor(()=>expect(onChange).toHaveBeenCalledWith({description:'<p>Exact donor paragraph.</p><p>Original MIT provenance retained.</p>'}),{timeout:2000});
});
