import fs from 'node:fs';
import vm from 'node:vm';
import {expect,it,vi} from 'vitest';
import {adaptEditorKeyboardLookup,adaptedLookup,originalLookup} from '../scripts/editorjs-keyboard-fallback.mjs';

function scenario({iframe=false,policy,keyboard=true,method=true,error}:{iframe?:boolean;policy?:any;keyboard?:boolean;method?:boolean;error?:Error}={}){
  const getLayoutMap=vi.fn(async()=>{if(error)throw error;return new Map([['KeyW','Z']]);});
  const window:any={};window.top=iframe?{}:window;
  const log=vi.fn();
  const lookup=vm.runInNewContext(`${adaptedLookup}; Vi`,{window,document:policy??{},navigator:{keyboard:keyboard?(method?{getLayoutMap}:{}):undefined},console:{error:log}});
  return {lookup,getLayoutMap,log};
}
it('changes only the reviewed pinned source function and rejects source drift',()=>{
  const original=fs.readFileSync('node_modules/@editorjs/editorjs/dist/editorjs.mjs','utf8');
  const adapted=adaptEditorKeyboardLookup(original);
  expect(adapted.replace(adaptedLookup,originalLookup)).toBe(original);
  expect(()=>adaptEditorKeyboardLookup(original+'\n')).toThrow('Editor.js source changed');
});
it.each(['permissionsPolicy','featurePolicy'])('uses %s to skip a denied keyboard-map probe without logging or requesting permission',async name=>{
  const allowsFeature=vi.fn(()=>false);
  const s=scenario({policy:{[name]:{features:()=>['keyboard-map'],allowsFeature}}});
  expect(await s.lookup('KeyW','W')).toBe('W');expect(allowsFeature).toHaveBeenCalledWith('keyboard-map');expect(s.getLayoutMap).not.toHaveBeenCalled();expect(s.log).not.toHaveBeenCalled();
});
it('keeps the allowed embedded layout-specific label behavior',async()=>{
  const s=scenario({iframe:true,policy:{featurePolicy:{features:()=>['keyboard-map'],allowsFeature:()=>true}}});
  expect(await s.lookup('KeyW','W')).toBe('Z');expect(s.getLayoutMap).toHaveBeenCalledOnce();
});
it('uses the existing label in an iframe when policy capability cannot be checked',async()=>{
  const s=scenario({iframe:true});expect(await s.lookup('KeyW','W')).toBe('W');expect(s.getLayoutMap).not.toHaveBeenCalled();expect(s.log).not.toHaveBeenCalled();
});
it('keeps supported top-level lookups and their existing unexpected-error reporting',async()=>{
  const supported=scenario();expect(await supported.lookup('KeyW','W')).toBe('Z');
  const error=new Error('Unexpected keyboard service failure');const failed=scenario({error});
  expect(await failed.lookup('KeyW','W')).toBe('W');expect(failed.log).toHaveBeenCalledWith(error);
});
it.each([{keyboard:false},{method:false}])('uses the existing label when the API is absent: %s',async options=>{
  const s=scenario(options);expect(await s.lookup('KeyW','W')).toBe('W');expect(s.getLayoutMap).not.toHaveBeenCalled();expect(s.log).not.toHaveBeenCalled();
});
