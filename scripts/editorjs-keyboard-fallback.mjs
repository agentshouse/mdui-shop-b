import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

// Editor.js 2.30.7, Apache-2.0. Only the optional shortcut-label lookup is
// modified. Existing fallback labels and real key handlers remain unchanged.
export const originalHash='27e05459a10d03fb48af4a791376305edc5a92dbf4195e2d90ae03ce14931370';
export const originalLookup=`async function Vi(n, e) {
  const t = navigator.keyboard;
  if (!t)
    return e;
  try {
    return (await t.getLayoutMap()).get(n) || e;
  } catch (o) {
    return console.error(o), e;
  }
}`;
export const adaptedLookup=`async function Vi(n, e) {
  const t = navigator.keyboard;
  if (!t || typeof t.getLayoutMap !== "function")
    return e;
  const policy = document.permissionsPolicy || document.featurePolicy;
  const hasPolicy = policy && typeof policy.features === "function" &&
    policy.features().includes("keyboard-map") && typeof policy.allowsFeature === "function";
  if (hasPolicy ? !policy.allowsFeature("keyboard-map") : window.top !== window)
    return e;
  try {
    return (await t.getLayoutMap()).get(n) || e;
  } catch (o) {
    return console.error(o), e;
  }
}`;

export function adaptEditorKeyboardLookup(code){
  assert.equal(createHash('sha256').update(code).digest('hex'),originalHash,'Editor.js source changed; review the narrow keyboard-label adaptation');
  assert.equal(code.split(originalLookup).length,2,'Expected exactly one original keyboard-label lookup');
  return code.replace(originalLookup,adaptedLookup);
}

export const editorKeyboardFallback={
  name:'editorjs-keyboard-label-capability-fallback',
  enforce:'pre',
  transform(code,id){
    if(!id.replaceAll('\\','/').endsWith('/@editorjs/editorjs/dist/editorjs.mjs'))return null;
    return {code:adaptEditorKeyboardLookup(code),map:null};
  },
};
