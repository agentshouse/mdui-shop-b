/** Saleor ProductListPage composition adapted to one existing House catalog.
 * Extensions, channels and Saleor limits are absent rather than fabricated. */
import {Root as TopNav} from '@dashboard/components/AppLayout/TopNav/Root';
import {DashboardCard} from '@dashboard/components/Card';
import {ListPageLayout} from '@dashboard/components/Layouts/List/Root';
import {Box,Button,Text} from '@saleor/macaw-ui-next';
import {useState,useMemo} from 'react';
import {useHistory} from 'react-router-dom';
import {ProductListTiles} from '../ProductListTiles/ProductListTiles';
import {ProductListViewSwitch} from '../ProductListViewSwitch/ProductListViewSwitch';
import {useShop} from '../../../../context';
import {useLocalList,Search,DataTable,Pagination,money} from '../../../../list';
import {RoomImage} from '../../../../RoomImage';
export type ProductListViewType='datagrid'|'tile';
export default function ProductListPage(){const{db}=useShop();const history=useHistory();const[view,setView]=useState<ProductListViewType>('datagrid');const[category,setCategory]=useState('');const products=useMemo(()=>db.products.filter(p=>!category||String(p.category_id)===category).map(p=>({...p,categoryName:db.categories.find(c=>String(c.id)===String(p.category_id))?.name??''})),[db,category]);const list=useLocalList(products,['reference','categoryName'],'reference');const open=(id:string)=>history.push('/products/'+encodeURIComponent(id));
 return <ListPageLayout><TopNav title="Products" withoutBorder><Button onClick={()=>history.push('/products/new')}>Create product</Button></TopNav><Box overflowY="auto"><DashboardCard><Search list={list} label="Search products"><Box display="flex" alignItems="center" gap={3}><label className="filter-label"><Text size={2}>Category</Text><select aria-label="Filter product category" value={category} onChange={e=>setCategory(e.target.value)}><option value="">All categories</option>{db.categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><ProductListViewSwitch defaultValue={view} setProductListViewType={setView}/></Box></Search>{view==='tile'?<ProductListTiles products={list.rows} onTileClick={open}/>:<DataTable list={list} rows={list.rows} onOpen={r=>open(String(r.id))} columns={[{key:'reference',label:'Product',render:r=><Box display="flex" alignItems="center" gap={3}><RoomImage value={r.thumbnail} alt="" className="row-thumbnail"/>{r.reference}</Box>},{key:'categoryName',label:'Category'},{key:'price',label:'Price',numeric:true,render:r=>money(r.price)},{key:'stock',label:'Stock',numeric:true},{key:'sales',label:'Sold',numeric:true}]}/>}<Pagination list={list}/></DashboardCard></Box></ListPageLayout>;
}
