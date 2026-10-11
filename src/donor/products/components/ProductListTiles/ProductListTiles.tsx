/** Saleor product tile-grid renderer; pagination is projected locally by its page. */
import {Box,Text,vars} from '@saleor/macaw-ui-next';
import {ProductTile} from '../ProductTile/ProductTile';
import type {Row} from '../../../../store';
export function ProductListTiles({products,onTileClick}:{products:Row[];onTileClick:(id:string)=>void}){return products.length?<Box display="grid" gap={6} paddingX={6} __paddingTop={`calc(${vars.spacing[9]} - ${vars.spacing[5]})`} className="product-grid" data-test-id="tile-view">{products.map(product=><ProductTile key={product.id} product={product} onClick={()=>onTileClick(String(product.id))}/>)}</Box>:<Box paddingX={6} paddingBottom={6}><Text>No products found</Text></Box>;}
