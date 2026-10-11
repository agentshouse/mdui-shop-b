/** Saleor customer list header/card composition adapted to the current Room. */
import {Root as TopNav} from '@dashboard/components/AppLayout/TopNav/Root';
import {DashboardCard} from '@dashboard/components/Card';
import {ListPageLayout} from '@dashboard/components/Layouts/List/Root';
import {Box,Button} from '@saleor/macaw-ui-next';
import {useMemo} from 'react';
import {useHistory} from 'react-router-dom';
import {useShop} from '../../../../context';
import {useLocalList,Search,DataTable,Pagination,money,date} from '../../../../list';
import {RoomImage} from '../../../../RoomImage';
export function CustomerListPage(){const{db}=useShop();const history=useHistory();const customers=useMemo(()=>db.customers.map(c=>({...c,name:`${c.first_name} ${c.last_name}`})),[db]);const list=useLocalList(customers,['name','email','city'],'name');return <ListPageLayout><TopNav title="Customers" withoutBorder><Button onClick={()=>history.push('/customers/new')}>Create customer</Button></TopNav><Box overflowY="auto"><DashboardCard><Search list={list} label="Search customers"/><DataTable list={list} rows={list.rows} onOpen={r=>history.push('/customers/'+encodeURIComponent(r.id))} columns={[{key:'name',label:'Customer',render:r=><Box display="flex" alignItems="center" gap={3}>{r.avatar?<RoomImage value={r.avatar} alt="" className="row-avatar"/>:<span className="initials">{r.first_name?.[0]}{r.last_name?.[0]}</span>}{r.name}</Box>},{key:'email',label:'Email'},{key:'city',label:'City'},{key:'first_seen',label:'Joined',render:r=>date(r.first_seen)},{key:'nb_orders',label:'Orders',numeric:true},{key:'total_spent',label:'Total spent',numeric:true,render:r=>money(r.total_spent)}]}/><Pagination list={list}/></DashboardCard></Box></ListPageLayout>;}
