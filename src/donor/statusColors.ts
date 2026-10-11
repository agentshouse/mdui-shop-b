import type {DotStatus} from './components/StatusDot/StatusDot';
import type {ThemeTokensValues} from '@saleor/macaw-ui-next';
/** Original Saleor dot status palette; text always comes from paired canvas theme. */
export const getDotColor=(status:DotStatus,themeValues:ThemeTokensValues)=>{switch(status){case 'success':return 'hsla(173, 100%, 26%, 1)';case 'scheduled':return '#6b52ae';case 'error':return themeValues.colors.background.critical2;case 'warning':return themeValues.colors.background.warning1;case 'neutral':return themeValues.colors.text.defaultDisabled;}};
