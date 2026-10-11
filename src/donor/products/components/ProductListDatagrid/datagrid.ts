/** Original getCellAction, detached from GraphQL product-column construction. */
import type {AvailableColumn} from '../../../components/Datagrid/types';
export const getCellAction=(availableColumns:readonly AvailableColumn[]|undefined,column:number)=>availableColumns?.[column]?.action;
