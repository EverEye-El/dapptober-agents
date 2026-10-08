import {PublicVerifier} from '@dapptober/ui/src/glass-room';
export default async function Page({params}:{params:Promise<{id:string}>}){return <PublicVerifier id={(await params).id}/>;}
