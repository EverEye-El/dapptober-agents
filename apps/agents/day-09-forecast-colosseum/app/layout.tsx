import type {ReactNode} from 'react';
import '../../../../packages/ui/src/styles.css';
import '../../../../packages/ui/src/forecast.css';
export const metadata={title:'Forecast Colosseum · Dapptober 09',description:'Humans versus agents. Put your forecast on the board.'};
export default function Layout({children}:{children:ReactNode}){return <html lang="en"><body>{children}</body></html>;}
