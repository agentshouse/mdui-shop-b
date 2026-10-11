import '@testing-library/jest-dom/vitest';
import {cleanup} from '@testing-library/react';
import {afterEach} from 'vitest';
afterEach(cleanup);
if (!globalThis.ResizeObserver) globalThis.ResizeObserver=class {observe(){}unobserve(){}disconnect(){}};
if(typeof window!=='undefined'&&!window.matchMedia)window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}} as any);
