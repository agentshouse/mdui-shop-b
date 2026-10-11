/** Saleor order overview composition. The current typed order statuses are retained verbatim. */
import {Root as TopNav} from '@dashboard/components/AppLayout/TopNav/Root';
import {DashboardCard} from '@dashboard/components/Card';
import {ListPageLayout} from '@dashboard/components/Layouts/List/Root';
import {Box,Text} from '@saleor/macaw-ui-next';
import {useMemo,useState} from 'react';
import {useHistory} from 'react-router-dom';
import {useShop} from '../../../../context';
import {useLocalList,Search,DataTable,Pagination,money,date} from '../../../../list';
export default function OrderListPage(){const{db}=useShop();const history=useHistory();const[status,setStatus]=useState('');const orders=useMemo(()=>db.orders.filter(o=>!status||o.status===status).map(o=>{const c=db.customers.find(c=>String(c.id)===String(o.customer_id));return{...o,customerName:c?`${c.first_name} ${c.last_name}`:'Customer unavailable'};}),[db,status]);const list=useLocalList(orders,['reference','customerName','status'],'date');return <ListPageLayout><TopNav title="Orders" withoutBorder/><Box overflowY="auto"><DashboardCard><Search list={list} label="Search orders"><label className="filter-label"><Text size={2}>Status</Text><select aria-label="Filter order status" value={status} onChange={e=>setStatus(e.target.value)}><option value="">All statuses</option>{['ordered','delivered','cancelled'].map(s=><option key={s}>{s}</option>)}</select></label></Search><DataTable list={list} rows={list.rows} onOpen={r=>history.push('/orders/'+encodeURIComponent(r.id))} columns={[{key:'reference',label:'Order'},{key:'date',label:'Date',render:r=>date(r.date)},{key:'customerName',label:'Customer'},{key:'status',label:'Status',render:r=><span className={`status-pill status-${r.status}`}>{r.status}</span>},{key:'total',label:'Total',numeric:true,render:r=>money(r.total)}]}/><Pagination list={list}/></DashboardCard></Box></ListPageLayout>;}
