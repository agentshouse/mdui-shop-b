/** Native House presentation state replaces donor GraphQL user metadata. */
import {useEffect,useMemo,useSyncExternalStore} from 'react';
import {gridPreferences} from '../../../../grid-preferences';
import {PersistedColumn} from './persistedColumn';
const empty:PersistedColumn[]=[];
export const usePersistance=(gridName='')=>{const raw=useSyncExternalStore(gridPreferences.subscribe,()=>gridPreferences.read(gridName));useEffect(()=>{void gridPreferences.start().catch(()=>{});},[]);const columns=useMemo(()=>raw?.map(PersistedColumn.fromRaw)??empty,[raw]);return{columns,update:(next:PersistedColumn[])=>{if(gridName)gridPreferences.update(gridName,next.map(c=>c.asRaw()));}};};
