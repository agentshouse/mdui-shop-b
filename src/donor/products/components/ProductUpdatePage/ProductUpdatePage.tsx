import {parseBusinessNumber} from '../../../../numbers';
/** Retained Saleor detail-page composition. Variant/channel/SEO domains are absent
 * from the current Room; exact catalog fields are edited without inventing them. */
import {Root as TopNav} from '@dashboard/components/AppLayout/TopNav/Root';
import {DetailPageLayout} from '@dashboard/components/Layouts/Detail';
import {DetailPageContent} from '@dashboard/components/DetailPageContent/DetailPageContent';
import {DetailSettingsCard} from '@dashboard/components/DetailSettingsCard/DetailSettingsCard';
import {Box,Input} from '@saleor/macaw-ui-next';
import {Package} from 'lucide-react';
import {useParams} from 'react-router-dom';
import {ProductDetailsForm} from '../ProductDetailsForm/ProductDetailsForm';
import {ProductOrganization} from '../ProductOrganization/ProductOrganization';
import {useShop} from '../../../../context';
import {useDraft} from '../../../../useDraft';
import {RoomImage} from '../../../../RoomImage';
import {DraftSavebar} from '../../../../DraftSavebar';
export default function ProductUpdatePage(){const{id}=useParams<{id:string}>();const{db}=useShop();const row=id==='new'?undefined:db.products.find(p=>String(p.id)===id);const draft=useDraft('products',row,{reference:'',category_id:'',description:'',width:'',height:'',price:'',stock:0,image:'',thumbnail:''});if(id!=='new'&&!row)return <p>Product not found in this Room.</p>;
 return <><DetailPageLayout><TopNav title={row?.reference??'Create product'} href="/products" hrefIcon={<Package size={20}/>} hrefTitle="All products"/>
 <DetailPageLayout.Content><DetailPageContent><ProductDetailsForm data={draft.values} disabled={draft.disabled} onChange={draft.change} flush={draft.flush}/><DetailSettingsCard title="Media"><RoomImage value={draft.values.image} alt={draft.values.reference??''} className="detail-image"/>{!draft.values.image&&<p>No image in this Room.</p>}<p className="muted">Existing Room image. Upload and image reordering are outside this catalog scope.</p></DetailSettingsCard>
 <DetailSettingsCard title="Pricing and inventory"><Box display="grid" __gridTemplateColumns="1fr 1fr" gap={4}><Input label="Price (USD)" type="text" inputMode="decimal" value={String(draft.values.price??'')} disabled={draft.disabled} onChange={e=>draft.change({price:parseBusinessNumber(e.target.value)})}/><Input label="Stock" type="text" inputMode="decimal" value={String(draft.values.stock??'')} disabled={draft.disabled} onChange={e=>draft.change({stock:parseBusinessNumber(e.target.value)})}/></Box></DetailSettingsCard></DetailPageContent></DetailPageLayout.Content>
 <DetailPageLayout.RightSidebar paddingTop={6}><ProductOrganization data={draft.values} categories={db.categories.map(c=>({id:c.id,name:c.name}))} disabled={draft.disabled} onChange={draft.change}/><Box padding={6}><p className="muted">Single-price poster catalog. Saleor variants, channels, collections and warehouses are not present in this Room.</p></Box></DetailPageLayout.RightSidebar></DetailPageLayout><DraftSavebar draft={draft} back="/products"/></>;
}
