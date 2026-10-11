import {SavebarRoot,Spacer} from './donor/components/Savebar/Savebar';
import {Button,Text} from '@saleor/macaw-ui-next';
import {useHistory} from 'react-router-dom';
import type {useDraft} from './useDraft';
export function DraftSavebar({draft,back}:{draft:ReturnType<typeof useDraft>;back:string}){const history=useHistory();return <SavebarRoot><Button variant="secondary" onClick={()=>history.push(back)}>Close</Button><Text size={2} role={draft.error?'alert':'status'} color={draft.error?'critical1':'default2'}>{draft.error||draft.status}</Text><Spacer/><Button disabled={draft.disabled} onClick={()=>void draft.save()}>{draft.saving?'Queueing…':'Save'}</Button></SavebarRoot>;}
