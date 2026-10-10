import {it,expect} from 'vitest';
import {generateKeyPairSync,randomBytes,createHash,sign} from 'node:crypto';
import {isoCBOR} from '@simplewebauthn/server/helpers';
import {checkpointAction,emptyDB,type Client} from '@dapptober/checkpoint';
import {config} from '@dapptober/config';
// A software authenticator fixture signs real P-256 WebAuthn data; no human uniqueness is inferred from it.
it('validates real WebAuthn registration and returning signatures; rejects altered origin, missing UV and replays',async()=>{
 const c=config({AGENT_MODE:'real',PUBLIC_ORIGIN:'https://checkpoint.example'}),db=emptyDB(),cl:Client={expires:Date.now(),lane:'human',person:'a'.repeat(64),rate:{start:Date.now(),count:0},receipts:[]};
 db.people[cl.person!]={id:cl.person!,wallet:'0x1111111111111111111111111111111111111111',verifiedAt:0,credentialExpires:Math.floor(Date.now()/1000)+86400,passkeys:[],claimed:false};
 const {privateKey,publicKey}=generateKeyPairSync('ec',{namedCurve:'prime256v1'}),jwk=publicKey.export({format:'jwk'}),credential=randomBytes(32),id=credential.toString('base64url');const sha=(s:string|Buffer)=>createHash('sha256').update(s).digest();
 const cose=isoCBOR.encode(new Map<number,number|Uint8Array>([[1,2],[3,-7],[-1,1],[-2,new Uint8Array(Buffer.from(jwk.x!,'base64url'))],[-3,new Uint8Array(Buffer.from(jwk.y!,'base64url'))]]));
 const rpHash=sha('checkpoint.example'),length=Buffer.alloc(2);length.writeUInt16BE(credential.length);const authData=Buffer.concat([rpHash,Buffer.from([69]),Buffer.alloc(4),Buffer.alloc(16),length,credential,Buffer.from(cose)]);
 const begin=await checkpointAction(db,cl,c,'passkey.begin',{});const challenge=(begin.options as {challenge:string}).challenge;const clientJSON=Buffer.from(JSON.stringify({type:'webauthn.create',challenge,origin:'https://checkpoint.example',crossOrigin:false}));
 const attestation=isoCBOR.encode(new Map<string,string|Map<string,never>|Uint8Array>([['fmt','none'],['attStmt',new Map<string,never>()],['authData',new Uint8Array(authData)]]));
 const registration={id,rawId:id,type:'public-key',response:{clientDataJSON:clientJSON.toString('base64url'),attestationObject:Buffer.from(attestation).toString('base64url'),transports:['internal']},clientExtensionResults:{}};
 expect(await checkpointAction(db,cl,c,'passkey.register',{response:registration})).toMatchObject({registered:true});expect(db.people[cl.person!].passkeys[0].publicKey).not.toBe('AA==');
 await checkpointAction(db,cl,c,'checkpoint.leave',{});
 async function assertion(origin='https://checkpoint.example',flags=5){const b=await checkpointAction(db,cl,c,'passkey.login.begin',{});const ch=(b.options as {challenge:string}).challenge;const data=Buffer.from(JSON.stringify({type:'webauthn.get',challenge:ch,origin,crossOrigin:false})),counter=Buffer.alloc(4);counter.writeUInt32BE(1);const authenticator=Buffer.concat([rpHash,Buffer.from([flags]),counter]);return {id,rawId:id,type:'public-key',response:{clientDataJSON:data.toString('base64url'),authenticatorData:authenticator.toString('base64url'),signature:sign('sha256',Buffer.concat([authenticator,sha(data)]),privateKey).toString('base64url'),userHandle:null},clientExtensionResults:{}};}
 await expect(checkpointAction(db,cl,c,'passkey.login',{response:await assertion('https://evil.example')})).rejects.toThrow();await expect(checkpointAction(db,cl,c,'passkey.login',{response:await assertion('https://checkpoint.example',1)})).rejects.toThrow();const response=await assertion();expect(await checkpointAction(db,cl,c,'passkey.login',{response})).toMatchObject({lane:'human',returned:true});await checkpointAction(db,cl,c,'checkpoint.leave',{});await expect(checkpointAction(db,cl,c,'passkey.login',{response})).rejects.toThrow('Challenge');
});
