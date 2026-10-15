import '../../../../packages/ui/src/styles.css';
import '../../../../packages/ui/src/concierge.css';
import type {ReactNode} from 'react';
export const metadata={title:'Aurel · Real-World Asset Concierge',description:'Know what you own. Decide what comes next.'};
export default function Layout({children}:{children:ReactNode}){return <html lang="en"><body>{children}</body></html>;}
