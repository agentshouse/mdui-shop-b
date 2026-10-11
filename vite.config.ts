import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import {editorKeyboardFallback} from './scripts/editorjs-keyboard-fallback.mjs';
const closure={name:'contributing-modules',generateBundle(_:unknown,bundle:Record<string,any>){const modules=[...new Set(Object.values(bundle).flatMap(x=>x.type==='chunk'?Object.keys(x.modules):[]))];fs.writeFileSync('reports/bundle-modules.json',JSON.stringify(modules.map(m=>m.replace(process.cwd()+'/','')),null,2));}};
export default defineConfig({base:'./',resolve:{alias:{'@dashboard':path.resolve('src/donor')}},plugins:[editorKeyboardFallback,react(),closure],test:{maxWorkers:2,environment:'jsdom',include:['tests/**/*.test.{ts,tsx}'],setupFiles:['tests/setup.ts']},build:{modulePreload:{polyfill:false},rollupOptions:{output:{inlineDynamicImports:true}}}});
