import {expect,it} from 'vitest';
import {renderHook} from '@testing-library/react';
import {ThemeProvider} from '@saleor/macaw-ui-next';
import {useDatagridTheme} from '../src/donor/components/Datagrid/styles';
import useStyles from '../src/donor/components/Datagrid/styles';
const luminance=(hex:string)=>{const rgb=hex.replace('#','').match(/../g)!.map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];};
const contrast=(a:string,b:string)=>{const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
it.each([false,true])('pairs the actual canvas foreground/background tokens at 4.5:1, readonly=%s',readonly=>{const{result}=renderHook(()=>useDatagridTheme(readonly,true),{wrapper:({children})=><ThemeProvider defaultTheme="defaultLight">{children}</ThemeProvider>});const theme=result.current;for(const key of ['textDark','textMedium','textLight','textHeader','textHeaderSelected','textGroupHeader','textBubble'] as const)expect(contrast(theme[key]!,key.includes('Header')?theme.bgHeader!:theme.bgCell!)).toBeGreaterThanOrEqual(4.5);expect(theme.bgCell).toBe('#ffffff');expect(theme.fontFamily).toBe('system-ui, sans-serif');});
it.each([{rowMarkerWidth:48,rowActionWidth:40,headerHeight:40},{rowMarkerWidth:64,rowActionWidth:80,headerHeight:48},{rowMarkerWidth:0,rowActionWidth:40,headerHeight:40}])('bounds the selection overlay with the actual grid marker/action dimensions: %s',dimensions=>{
  const{result}=renderHook(()=>useStyles({actionButtonPosition:'right',...dimensions}));
  const rules=[...document.styleSheets].flatMap(sheet=>[...sheet.cssRules]);
  const names=result.current.actionBtnBar.split(' ');
  const styles=rules.filter(rule=>names.some(name=>(rule as CSSStyleRule).selectorText===`.${name}`)).map(rule=>(rule as CSSStyleRule).style);
  const property=(name:string)=>styles.map(style=>style.getPropertyValue(name)).filter(Boolean).at(-1);
  expect(property('left')).toBe(`${dimensions.rowMarkerWidth}px`);expect(property('right')).toBe(`${dimensions.rowActionWidth}px`);
  expect(property('width')).toBe('auto');expect(parseFloat(property('margin')!)).toBe(0);expect(property('box-sizing')).toBe('border-box');expect(parseFloat(property('border-radius')!)).toBe(0);
  expect(property('height')).toBe(`${dimensions.headerHeight}px`);

});
