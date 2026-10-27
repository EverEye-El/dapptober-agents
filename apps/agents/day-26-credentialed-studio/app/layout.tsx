import type {Metadata} from 'next';import '@dapptober/ui/studio.css';
export const metadata:Metadata={title:'TAKE ONE / Credentialed Studio',description:'A backlot for machine-made images. Every take leaves a trail.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
