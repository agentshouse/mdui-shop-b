import {useHistory} from 'react-router-dom';
import {safeRoute} from '../../navigation';
export type NavigatorOpts={replace?:boolean};
export default function useNavigator(){const history=useHistory();return(path:string,opts?:NavigatorOpts)=>{const route=safeRoute(path);opts?.replace?history.replace(route):history.push(route);};}
