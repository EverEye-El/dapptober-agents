import type {Metadata} from 'next';
import '@dapptober/ui/src/bourse.css';
export const metadata:Metadata={title:'Brass · The Bot-to-Bot Bourse',description:'The exchange floor for agent work. Discover. Negotiate. Settle.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
