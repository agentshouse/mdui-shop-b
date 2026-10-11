import {createContext,useContext,useSyncExternalStore} from 'react';
import {ShopStore} from './store';
export const ShopContext=createContext<ShopStore|null>(null);
export function useShop(){const store=useContext(ShopContext);if(!store)throw new Error('Shop context missing');const snapshot=useSyncExternalStore(store.subscribe,store.snapshot);return{store,...snapshot};}
