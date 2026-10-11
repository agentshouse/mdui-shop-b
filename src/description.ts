import DOMPurify from 'dompurify';
import type {OutputData,OutputBlockData} from '@editorjs/editorjs';
const tags=['p','h1','h2','h3','b','strong','i','em','br','s','u','ul','ol','li','blockquote','cite'];
export const cleanDescription=(html:string)=>DOMPurify.sanitize(html,{ALLOWED_TAGS:tags,ALLOWED_ATTR:['start','data-style','data-checked','data-counter-type','data-alignment'],ALLOW_DATA_ATTR:false});
const escape=(s:unknown)=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function listItems(list:Element):any[]{return Array.from(list.children).filter(x=>x.tagName==='LI').map(li=>{const copy=li.cloneNode(true) as Element;const nested=Array.from(copy.children).find(n=>n.tagName==='OL'||n.tagName==='UL');const items=nested?listItems(nested):[];nested?.remove();return{content:copy.innerHTML,meta:li.hasAttribute('data-checked')?{checked:li.getAttribute('data-checked')==='true'}:{},items};});}
export function descriptionBlocks(html:string):OutputData{
 const div=document.createElement('div');div.innerHTML=cleanDescription(html);
 const blocks=Array.from(div.childNodes).flatMap<OutputBlockData>(node=>{
  if(node.nodeType===Node.TEXT_NODE)return node.textContent?.trim()?[{type:'paragraph',data:{text:escape(node.textContent)}}]:[];
  const el=node as HTMLElement;const tag=el.tagName.toLowerCase();
  if(/^h[123]$/.test(tag))return[{type:'header',data:{text:el.innerHTML,level:Number(tag[1])}}];
  if(tag==='ul'||tag==='ol')return[{type:'list',data:{style:el.dataset.style==='checklist'?'checklist':tag==='ol'?'ordered':'unordered',meta:tag==='ol'?{start:Number(el.getAttribute('start')??1),counterType:el.dataset.counterType??'numeric'}:{},items:listItems(el)}}];
  if(tag==='blockquote'){const copy=el.cloneNode(true)as HTMLElement;const cite=copy.querySelector('cite');const caption=cite?.innerHTML??'';cite?.remove();return[{type:'quote',data:{text:copy.innerHTML,caption,alignment:el.dataset.alignment==='center'?'center':'left'}}];}
  return[{type:'paragraph',data:{text:el.innerHTML}}];
 });return{blocks};
}
function renderItems(items:any[],tag:string,checklist:boolean):string{return items.map(i=>{const obj=typeof i==='string'?{content:i,items:[],meta:{}}:i;return`<li${checklist?` data-checked="${Boolean(obj.meta?.checked)}"`:''}>${obj.content??''}${obj.items?.length?`<${tag}>${renderItems(obj.items,tag,checklist)}</${tag}>`:''}</li>`;}).join('');}
export function blocksDescription(data:OutputData):string{
 return cleanDescription(data.blocks.map(b=>{
  if(b.type==='header'){const level=[1,2,3].includes(Number(b.data.level))?b.data.level:2;return`<h${level}>${b.data.text??''}</h${level}>`;}
  if(b.type==='list'){const ordered=b.data.style==='ordered',checklist=b.data.style==='checklist';const tag=ordered?'ol':'ul';const start=Number.isSafeInteger(b.data.meta?.start)&&b.data.meta.start!==1?` start="${b.data.meta.start}"`:'';const counter=ordered&&b.data.meta?.counterType&&b.data.meta.counterType!=='numeric'?` data-counter-type="${escape(b.data.meta.counterType)}"`:'';return`<${tag}${ordered?start+counter:''}${checklist?' data-style="checklist"':''}>${renderItems(b.data.items??[],tag,checklist)}</${tag}>`;}
  if(b.type==='quote')return`<blockquote${b.data.alignment==='center'?' data-alignment="center"':''}>${b.data.text??''}${b.data.caption?`<cite>${b.data.caption}</cite>`:''}</blockquote>`;
  if(b.type==='paragraph')return`<p>${b.data.text??''}</p>`;
  throw new Error(`Unsupported rich-text block ${b.type}. The current draft is kept.`);
 }).join(''));
}
