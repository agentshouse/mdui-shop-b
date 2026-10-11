import {useMemo} from 'react';
import {useTheme} from '@saleor/macaw-ui-next';
import {thumbnailCellRenderer} from './ThumbnailCell';
import {statusCellRenderer} from './StatusCell';
import {moneyCellRenderer} from './Money/MoneyCell';
import {numberCellRenderer} from './NumberCell';
export function useCustomCellRenderers(){const{themeValues}=useTheme();return useMemo(()=>[thumbnailCellRenderer,statusCellRenderer(themeValues),moneyCellRenderer('en-US'),numberCellRenderer('en-US')],[themeValues]);}
