/** Saleor organization card adapted to the existing typed category relationship. */
import {DashboardCard} from '@dashboard/components/Card';
import {Box,DynamicCombobox} from '@saleor/macaw-ui-next';
import {useMemo,useState} from 'react';
export function ProductOrganization({data,categories,disabled,onChange}:{data:Record<string,any>;categories:{id:string|number;name:any}[];disabled:boolean;onChange:(patch:Record<string,unknown>)=>void}){
 const [search,setSearch]=useState('');const options=useMemo(()=>categories.filter(c=>String(c.name).toLowerCase().includes(search.toLowerCase())).map(c=>({value:String(c.id),label:String(c.name)})),[categories,search]);const category=categories.find(c=>String(c.id)===String(data.category_id));const value=useMemo(()=>category?{value:String(category.id),label:String(category.name)}:null,[category]);
 return <DashboardCard><DashboardCard.Header><DashboardCard.Title>Organize product</DashboardCard.Title></DashboardCard.Header><DashboardCard.Content><Box><DynamicCombobox label="Category" name="category_id" options={options} value={value} onInputValueChange={setSearch} onChange={o=>onChange({category_id:o?.value??''})} disabled={disabled}/></Box></DashboardCard.Content></DashboardCard>;
}
