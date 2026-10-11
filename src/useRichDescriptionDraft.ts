import {useCallback,useEffect,useMemo,useRef,useState,type MutableRefObject,type KeyboardEventHandler,type PointerEventHandler} from 'react';
import type {EditorCore} from '@react-editor-js/core';
import type {OutputData} from '@editorjs/editorjs';
import {blocksDescription,descriptionBlocks} from './description';

/** Synchronize a native Draft with EditorJS only after its actual ready event.
 * Rendering incoming content never writes it back or normalizes the stored raw
 * source. New user edits invalidate any older, not-yet-applied hydration. */
type RichDescriptionDraft={editorRef:MutableRefObject<EditorCore|null>;initial:OutputData;onReady:()=>void;onFocus:()=>void;onInputCapture:()=>void;onKeyDownCapture:KeyboardEventHandler<HTMLDivElement>;onPointerDownCapture:PointerEventHandler<HTMLDivElement>;onChange:(data?:OutputData)=>void;captureChange:()=>((data:OutputData)=>boolean)|null;flush:()=>Promise<void>;disabled:boolean;error:string};
export function useRichDescriptionDraft(description:string,onChange:(patch:Record<string,unknown>)=>void):RichDescriptionDraft{
  const editorRef=useRef<EditorCore|null>(null);
  const initial=useMemo(()=>descriptionBlocks(description),[]);
  const incoming=useRef(description);incoming.current=description;
  const emit=useRef(onChange);emit.current=onChange;
  const rawRendered=useRef(description);
  const canonicalRendered=useRef(blocksDescription(initial));
  const baselineReady=useRef(false);
  const pendingLocal=useRef<string>();
  const focused=useRef(false);
  const alive=useRef(true);
  const ready=useRef(false);
  const rendering=useRef(false);
  const generation=useRef(0);
  const readSequence=useRef(0);
  const pendingDomInput=useRef(false);
  const queue=useRef(Promise.resolve());
  const failure=useRef('');
  const[isReady,setReady]=useState(false);
  const[hydrating,setHydrating]=useState(false);
  const[error,setError]=useState('');

  const synchronize=useCallback(()=>{
    const value=incoming.current;
    if(!alive.current||!ready.current||!editorRef.current||pendingDomInput.current||(value===rawRendered.current&&baselineReady.current))return;
    if(pendingLocal.current!==undefined&&value!==pendingLocal.current)return;
    const ticket=++generation.current;
    queue.current=queue.current.catch(()=>undefined).then(async()=>{
      if(!alive.current||ticket!==generation.current||pendingDomInput.current||value!==incoming.current||!editorRef.current)return;
      rendering.current=true;setHydrating(true);
      try{
        const blocks=descriptionBlocks(value);
        if(value!==rawRendered.current)await editorRef.current.render(blocks);
        const actualBaseline=await editorRef.current.save();
        if(alive.current&&ticket===generation.current){
          rawRendered.current=value;canonicalRendered.current=blocksDescription(actualBaseline);baselineReady.current=true;
          failure.current='';setError('');
        }
      }catch(cause){
        failure.current=`Description could not be restored. The native draft is kept: ${cause instanceof Error?cause.message:String(cause)}`;
        if(alive.current)setError(failure.current);
      }finally{
        rendering.current=false;if(alive.current)setHydrating(false);
      }
    });
  },[]);

  useEffect(()=>{
    if(description===pendingLocal.current)pendingLocal.current=undefined;
    synchronize();
  },[description,synchronize]);
  useEffect(()=>{alive.current=true;return()=>{alive.current=false;ready.current=false;generation.current++;};},[]);

  const acceptUserValue=useCallback((data:OutputData)=>{
    if(!alive.current||!focused.current||!pendingDomInput.current||rendering.current||failure.current)return false;
    const value=blocksDescription(data);
    pendingDomInput.current=false;
    if(value===canonicalRendered.current){synchronize();return true;}
    generation.current++;pendingLocal.current=value;
    rawRendered.current=value;canonicalRendered.current=value;
    emit.current({description:value});
    return true;
  },[synchronize]);
  const onInputCapture=useCallback(()=>{
    if(!alive.current||rendering.current||failure.current)return;
    focused.current=true;pendingDomInput.current=true;
    generation.current++;readSequence.current++;
  },[]);
  // Capture before RichTextEditor awaits saver.save(). A stale asynchronous
  // callback must not gain authority again just because render() has finished.
  const captureChange=useCallback(()=>{
    if(!alive.current||!focused.current||!pendingDomInput.current||rendering.current||failure.current)return null;
    const ticket=generation.current;const sequence=++readSequence.current;
    return(data:OutputData)=>{
      if(!alive.current||ticket!==generation.current||sequence!==readSequence.current||rendering.current)return false;
      return acceptUserValue(data);
    };
  },[acceptUserValue]);
  const onReady=useCallback(()=>{
    if(!alive.current)return;
    ready.current=true;setReady(true);synchronize();
  },[synchronize]);
  const flush=useCallback(async()=>{
    await queue.current;
    if(failure.current)throw new Error(failure.current);
    if(!ready.current||!editorRef.current)throw new Error('The description editor is still opening. Its native draft is kept.');
    if(pendingDomInput.current){
      for(;;){
        const ticket=generation.current;const data=await editorRef.current.save();
        if(!alive.current)throw new Error('The editor was closed. Its native draft is kept.');
        if(ticket!==generation.current)continue;
        readSequence.current++;acceptUserValue(data);break;
      }
    }
    // Consuming a no-op user intent can unblock a newer shared Draft snapshot.
    // Drain that render too, including any successor queued while it ran.
    for(;;){const pending=queue.current;await pending;if(pending===queue.current)break;}
    if(failure.current)throw new Error(failure.current);
    if(!alive.current)throw new Error('The editor was closed. Its native draft is kept.');
  },[acceptUserValue]);
  const onKeyDownCapture:KeyboardEventHandler<HTMLDivElement>=event=>{
    if(event.key==='Enter'||event.key==='Backspace'||event.key==='Delete'||(event.key.length===1&&(!event.ctrlKey&&!event.metaKey||/^[biukxv]$/i.test(event.key))))onInputCapture();
  };
  const onPointerDownCapture:PointerEventHandler<HTMLDivElement>=event=>{
    if(event.target instanceof Element&&event.target.closest('button,[role="button"],.ce-toolbar__plus,.ce-toolbar__settings-btn,.ce-popover-item,.ce-inline-tool,.ce-toolbox__button'))onInputCapture();
  };
  return{editorRef,initial,onReady,onFocus:()=>{focused.current=true;},onInputCapture,onKeyDownCapture,onPointerDownCapture,onChange:(data?:OutputData)=>{if(data)acceptUserValue(data);},captureChange,flush,disabled:!isReady||hydrating||Boolean(error),error};
}
