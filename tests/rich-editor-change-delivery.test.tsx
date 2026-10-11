import {act,render} from '@testing-library/react';
import {ThemeProvider} from '@saleor/macaw-ui-next';
import {expect,it,vi} from 'vitest';
import type {OutputData} from '@editorjs/editorjs';
const host=vi.hoisted(()=>({props:null as any}));
vi.mock('../src/donor/components/RichTextEditor/ReactEditorJS',()=>({ReactEditorJS:(props:any)=>{host.props=props;return props.children;}}));
vi.mock('../src/donor/components/RichTextEditor/consts',()=>({tools:{}}));
const{default:RichTextEditor}=await import('../src/donor/components/RichTextEditor/RichTextEditor');
const data={blocks:[{type:'paragraph',data:{text:'Original native text'}}]};
it('captures the native delivery guard before awaiting the real change handler saver',async()=>{
  let allowed=true;let resolve!:(value:OutputData)=>void;const save=vi.fn(()=>new Promise<OutputData>(done=>{resolve=done;}));
  const deliver=vi.fn(()=>allowed);const capture=vi.fn(()=>deliver);const onChange=vi.fn();
  render(<ThemeProvider defaultTheme="defaultLight"><RichTextEditor editorRef={{current:null}} defaultValue={data} disabled={false} error={false} name="description" label="Description" captureChange={capture} onChange={onChange}/></ThemeProvider>);
  const pending=host.props.onChange({saver:{save}});expect(capture).toHaveBeenCalledOnce();expect(save).toHaveBeenCalledOnce();allowed=false;
  await act(async()=>{resolve({blocks:[]});await pending;});expect(deliver).toHaveBeenCalledWith({blocks:[]});expect(onChange).not.toHaveBeenCalled();
});
it('does not read programmatic changes when the native guard refuses capture',async()=>{
  const save=vi.fn();const onChange=vi.fn();
  render(<ThemeProvider defaultTheme="defaultLight"><RichTextEditor editorRef={{current:null}} defaultValue={data} disabled={false} error={false} name="description" label="Description" captureChange={()=>null} onChange={onChange}/></ThemeProvider>);
  await host.props.onChange({saver:{save}});expect(save).not.toHaveBeenCalled();expect(onChange).not.toHaveBeenCalled();
});
it('preserves the ordinary donor callback when no native guard is supplied',async()=>{
  const onChange=vi.fn();render(<ThemeProvider defaultTheme="defaultLight"><RichTextEditor editorRef={{current:null}} defaultValue={data} disabled={false} error={false} name="description" label="Description" onChange={onChange}/></ThemeProvider>);
  await act(async()=>host.props.onChange({saver:{save:async()=>data}}));expect(onChange).toHaveBeenCalledWith(data);
});
