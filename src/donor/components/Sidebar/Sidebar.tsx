/** Saleor responsive sidebar and native Macaw drawer. */
import {Box,Drawer,Button} from '@saleor/macaw-ui-next';
import {Menu} from 'lucide-react';
import {SidebarContent} from './Content';

import {useLocation} from 'react-router-dom';
export function Sidebar(){const location=useLocation();return <><Box __width="260px" display={{mobile:'none',tablet:'none',desktop:'block'}} height="100%"><SidebarContent/></Box><Box display={{mobile:'block',tablet:'block',desktop:'none'}} className="mobile-menu"><Drawer key={location.pathname}><Drawer.Trigger><Button variant="secondary" icon={<Menu size={20}/>} aria-label="Open navigation"/></Drawer.Trigger><Drawer.Content backgroundColor="default2" data-test-id="sidebar-drawer-content" paddingTop={0} __width="260px"><SidebarContent/></Drawer.Content></Drawer></Box></>;}
