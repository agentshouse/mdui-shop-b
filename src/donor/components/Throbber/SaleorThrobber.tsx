import {LoaderCircle} from 'lucide-react';
export function SaleorThrobber({size=40,className,...props}:{size?:number;className?:string;'data-test-id'?:string}){return <LoaderCircle {...props} size={size} className={'room-spinner '+(className??'')} aria-label="Loading" role="progressbar"/>;}
