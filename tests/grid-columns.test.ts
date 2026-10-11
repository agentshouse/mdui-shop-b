import {expect,it} from 'vitest';
import {PersistedColumn} from '../src/donor/components/Datagrid/persistance/persistedColumn';
import {selectedWithPersistance,visibleWithPersistance} from '../src/donor/components/Datagrid/ColumnPicker/withPersistance';
import {isLastEnabledColumn,mergeSelectedColumns} from '../src/donor/components/Datagrid/ColumnPicker/utils';
const columns=[{id:'name',title:'Name',width:200},{id:'price',title:'Price',width:100}];
it('restores the selected column order and resized width without mutating source definitions',()=>{const saved=[new PersistedColumn('price',140),new PersistedColumn('name',260)];const selected=selectedWithPersistance(['name','price'],saved);expect(selected).toEqual(['price','name']);const visible=mergeSelectedColumns({staticColumns:columns,dynamicColumns:null,selectedColumns:selected});expect(visibleWithPersistance(visible,saved).map(c=>[c.id,c.width])).toEqual([['price',140],['name',260]]);expect(columns[0].width).toBe(200);});
it('guards the final enabled column while permitting changes with multiple visible columns',()=>{expect(isLastEnabledColumn('name',columns,['name'])).toBe(true);expect(isLastEnabledColumn('price',columns,['name'])).toBe(false);expect(isLastEnabledColumn('name',columns,['name','price'])).toBe(false);});
