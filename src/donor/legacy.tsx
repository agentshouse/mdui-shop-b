/** Styling seam for original Saleor MUI-era grid helpers.
 * Avoid the old Macaw provider's browser storage/extensions; keep actual MUI JSS and transitions. */
import {forwardRef,type ButtonHTMLAttributes} from 'react';
import {Button} from '@saleor/macaw-ui-next';
import {makeStyles as muiMakeStyles,type Theme} from '@material-ui/core/styles';
import type {Styles,WithStylesOptions} from '@material-ui/styles/withStyles';
export {useTheme} from '@material-ui/core/styles';
export function makeStyles<Props extends object = {}>(styles:Styles<Theme,Props,string>,options?:WithStylesOptions<Theme>){return muiMakeStyles<Theme,Props,string>(styles,options);}
export type IconButtonProps=Omit<ButtonHTMLAttributes<HTMLButtonElement>,'color'> & {variant?:'ghost'|'primary'|'secondary';state?:string;hoverOutline?:boolean};
export const IconButton=forwardRef<HTMLButtonElement,IconButtonProps>(function IconButton({variant='ghost',state:_state,hoverOutline:_outline,...props},ref){return <Button {...props} ref={ref} variant={variant==='ghost'?'tertiary':variant} size="small"/>;});
