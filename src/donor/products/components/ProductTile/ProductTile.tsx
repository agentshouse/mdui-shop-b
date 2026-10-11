/** Adapted from pinned Saleor ProductTile. Scoped Room images replace URL authority;
 * existing category/stock replace unsupported Saleor product-type/channel status. */
import {Box,Text,vars} from '@saleor/macaw-ui-next';
import {Image} from 'lucide-react';
import {RoomImage} from '../../../../RoomImage';
import type {Row} from '../../../../store';
export function ProductTile({product,onClick}:{product:Row;onClick:()=>void}){return <Box as="button" type="button" display="flex" flexDirection="column" onClick={onClick} cursor="pointer" borderRadius={3} position="relative" data-test-id={`product-tile-${product.id}`} className="product-tile">
 {product.thumbnail?<RoomImage value={product.thumbnail} alt={product.reference} className="product-thumbnail"/>:<Box marginBottom={1.5} borderRadius={3} aspectRatio="1 / 1" display="flex" alignItems="center" justifyContent="center" borderWidth={1} borderStyle="solid" borderColor="default1"><Image size={24}/></Box>}
 <Box display="flex" alignItems="center"><Text ellipsis color="default2" size={2}>{product.categoryName}</Text></Box><Box display="flex" justifyContent="space-between" marginTop={0.5}><Text ellipsis color="default1" size={3} fontWeight="medium">{product.reference}</Text></Box><Text size={2} color="default2">{product.stock} in stock</Text>
 <Box position="absolute" margin="auto" __right={`calc(${vars.spacing[5]} / -2)`} __top={`calc(${vars.spacing[5]} / -2)`} __width={`calc(100% + ${vars.spacing[5]})`} __height={`calc(100% + ${vars.spacing[5]})`} __opacity={0.1} borderRadius={5} backgroundColor={{hover:'default1Hovered'}}/>
 </Box>;}
