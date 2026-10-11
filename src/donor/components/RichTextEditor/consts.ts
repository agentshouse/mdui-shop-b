/** Saleor donor text tools only. External image/embed/upload/link tools are excluded. */
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import type {ToolConstructable,ToolSettings} from '@editorjs/editorjs';
export const tools:Record<string,ToolConstructable|ToolSettings>={header:{class:Header as unknown as ToolConstructable,config:{defaultLevel:2,levels:[1,2,3]},inlineToolbar:['bold','italic']},list:{class:List as unknown as ToolConstructable,inlineToolbar:['bold','italic']},quote:{class:Quote as unknown as ToolConstructable,inlineToolbar:['bold','italic']},paragraph:{class:Paragraph as unknown as ToolConstructable,inlineToolbar:['bold','italic']}};
