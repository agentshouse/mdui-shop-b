/** Actual Saleor contact form composition, bound to existing Shop field names. */
import {DetailSettingsCard} from '@dashboard/components/DetailSettingsCard/DetailSettingsCard';
import {Box,Input} from '@saleor/macaw-ui-next';
export default function CustomerInfo({data,disabled,onChange}:{data:Record<string,any>;disabled:boolean;onChange:(patch:Record<string,unknown>)=>void}){
 return <DetailSettingsCard data-test-id="customer-details" title="Contact"><Box display="flex" flexDirection="column" gap={5}>
 <Input data-test-id="customer-first-name" disabled={disabled} name="first_name" label="First name" value={data.first_name??''} onChange={e=>onChange({first_name:e.target.value})}/>
 <Input data-test-id="customer-last-name" disabled={disabled} name="last_name" label="Last name" value={data.last_name??''} onChange={e=>onChange({last_name:e.target.value})}/>
 <Input data-test-id="customer-email" disabled={disabled} name="email" label="Email" type="email" value={data.email??''} onChange={e=>onChange({email:e.target.value})}/>
 </Box></DetailSettingsCard>;
}
