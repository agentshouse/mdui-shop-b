import {parseBusinessNumber} from '../../../../numbers';
/** Adapted Saleor ProductDetailsForm: the real Shop reference is its product label.
 * Original source and exact pin are retained in vendor/saleor. */
import {DetailSettingsCard} from '@dashboard/components/DetailSettingsCard/DetailSettingsCard';
import RichTextEditor from '@dashboard/components/RichTextEditor/RichTextEditor';
import {Box,Input} from '@saleor/macaw-ui-next';
import {useEffect,type MutableRefObject} from 'react';
import {useRichDescriptionDraft} from '../../../../useRichDescriptionDraft';
export function ProductDetailsForm({data,disabled,onChange,flush}:{data:Record<string,any>;disabled:boolean;flush:MutableRefObject<(()=>Promise<void>)|undefined>;onChange:(patch:Record<string,unknown>)=>void}){
 const description=useRichDescriptionDraft(data.description??'',onChange);
 useEffect(()=>{flush.current=description.flush;return()=>{flush.current=undefined;};},[flush,description.flush]);
 return <DetailSettingsCard title="General information" data-test-id="product-general-settings"><Box display="flex" flexDirection="column" gap={5}>
 <Input label="Product reference" size="small" value={data.reference??''} name="reference" disabled={disabled} onChange={e=>onChange({reference:e.target.value})}/>
 <RichTextEditor editorRef={description.editorRef} defaultValue={description.initial} onReady={description.onReady} onFocus={description.onFocus} onInputCapture={description.onInputCapture} onPasteCapture={description.onPasteCapture} onKeyDownCapture={description.onKeyDownCapture} onPointerDownCapture={description.onPointerDownCapture} onChange={description.onChange} captureChange={description.captureChange} disabled={disabled||description.disabled} error={Boolean(description.error)} helperText={description.error} label="Description" name="description"/>
 <Box display="grid" __gridTemplateColumns="1fr 1fr" gap={4}><Input label="Width (cm)" value={String(data.width??'')} onChange={e=>onChange({width:parseBusinessNumber(e.target.value)})} type="text" inputMode="decimal" disabled={disabled}/><Input label="Height (cm)" value={String(data.height??'')} onChange={e=>onChange({height:parseBusinessNumber(e.target.value)})} type="text" inputMode="decimal" disabled={disabled}/></Box>
 </Box></DetailSettingsCard>;
}
