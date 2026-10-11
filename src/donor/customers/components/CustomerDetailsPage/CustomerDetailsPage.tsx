/** Saleor customer contact/detail composition, with the original Shop fields. */
import {Root as TopNav} from '@dashboard/components/AppLayout/TopNav/Root';
import {DetailPageLayout} from '@dashboard/components/Layouts/Detail';
import {DetailPageContent} from '@dashboard/components/DetailPageContent/DetailPageContent';
import {DetailSettingsCard} from '@dashboard/components/DetailSettingsCard/DetailSettingsCard';
import {DashboardCard} from '@dashboard/components/Card';
import CustomerInfo from '../CustomerInfo/CustomerInfo';
import {Box,Input,Text,Button} from '@saleor/macaw-ui-next';
import {Users} from 'lucide-react';
import {useParams,useHistory} from 'react-router-dom';
import {useShop} from '../../../../context';
import {useDraft} from '../../../../useDraft';
import {DraftSavebar} from '../../../../DraftSavebar';
import {RoomImage} from '../../../../RoomImage';
import {money,date} from '../../../../list';
export default function CustomerDetailsPage(){const{id}=useParams<{id:string}>();const{db}=useShop();const history=useHistory();const row=id==='new'?undefined:db.customers.find(c=>String(c.id)===id);const draft=useDraft('customers',row,{first_name:'',last_name:'',email:'',address:'',city:'',zipcode:'',stateAbbr:''});if(id!=='new'&&!row)return <p>Customer not found in this Room.</p>;const orders=db.orders.filter(o=>String(o.customer_id)===id);return <><DetailPageLayout><TopNav title={row?`${row.first_name} ${row.last_name}`:'Create customer'} href="/customers" hrefIcon={<Users size={20}/>} hrefTitle="All customers"/>
 <DetailPageLayout.Content><DetailPageContent><CustomerInfo data={draft.values} disabled={draft.disabled} onChange={draft.change}/><DetailSettingsCard title="Address"><Box display="flex" flexDirection="column" gap={4}>{[['address','Street address'],['city','City'],['stateAbbr','State'],['zipcode','Postal code']].map(([key,label])=><Input key={key} label={label} value={draft.values[key]??''} disabled={draft.disabled} onChange={e=>draft.change({[key]:e.target.value})}/>)}</Box></DetailSettingsCard><DetailSettingsCard title="Orders" contentFlush>{orders.length?orders.map(o=><Box key={o.id} padding={4} borderBottomWidth={1} borderBottomStyle="solid" borderColor="default1" display="flex" justifyContent="space-between" alignItems="center"><Text size={3}>{o.reference} · {date(o.date)} · {money(o.total)}</Text><Button variant="secondary" size="small" onClick={()=>history.push('/orders/'+encodeURIComponent(o.id))}>View order</Button></Box>):<Box padding={5}><Text size={3}>No orders stored for this customer.</Text></Box>}</DetailSettingsCard></DetailPageContent></DetailPageLayout.Content>
 <DetailPageLayout.RightSidebar paddingTop={6}><DashboardCard><DashboardCard.Header><DashboardCard.Title>Customer summary</DashboardCard.Title></DashboardCard.Header><DashboardCard.Content>{row?.avatar&&<RoomImage value={row.avatar} alt="Customer portrait" className="customer-portrait"/>}<dl className="summary-list"><div><dt>Orders</dt><dd>{orders.length}</dd></div><div><dt>Recorded spending</dt><dd>{money(row?.total_spent)}</dd></div><div><dt>Joined</dt><dd>{date(row?.first_seen)}</dd></div></dl></DashboardCard.Content></DashboardCard></DetailPageLayout.RightSidebar></DetailPageLayout><DraftSavebar draft={draft} back="/customers"/></>;}
