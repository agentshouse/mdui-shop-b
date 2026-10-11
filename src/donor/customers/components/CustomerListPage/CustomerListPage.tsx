/** Saleor customer list header/card composition adapted to the current Room. */
import {Root as TopNav} from '@dashboard/components/AppLayout/TopNav/Root';
import {DashboardCard} from '@dashboard/components/Card';
import {ListPageLayout} from '@dashboard/components/Layouts/List/Root';
import {Box,Button} from '@saleor/macaw-ui-next';
import {useMemo} from 'react';
import {useHistory} from 'react-router-dom';
import {useShop} from '../../../../context';
import {useLocalList,Search,Pagination,date} from '../../../../list';
import {RoomDatagrid} from '../../../../RoomDatagrid';
export function CustomerListPage(){const{db}=useShop();const history=useHistory();const customers=useMemo(()=>db.customers.map(c=>({...c,name:`${c.first_name} ${c.last_name}`})),[db]);const list=useLocalList(customers,['name','email','city'],'name');return <ListPageLayout><TopNav title="Customers" withoutBorder><Button onClick={()=>history.push('/customers/new')}>Create customer</Button></TopNav><Box overflowY="auto"><DashboardCard><Search list={list} label="Search customers"/><RoomDatagrid name="customers" list={list} rows={list.rows} onOpen={r=>history.push('/customers/'+encodeURIComponent(r.id))} columns={[{key:'name',label:'Customer',kind:'thumbnail',imageKey:'avatar',width:240},{key:'email',label:'Email',width:250},{key:'city',label:'City'},{key:'first_seen',label:'Joined',display:r=>date(r.first_seen)},{key:'nb_orders',label:'Orders',kind:'number',width:110},{key:'total_spent',label:'Total spent',kind:'money'}]}/><Pagination list={list}/></DashboardCard></Box></ListPageLayout>;}
