export type Mode = 'demo' | 'real';
export type Decision = {allow:boolean;confidence:number;fit:number;abuse:number;route:'small'|'large';source:'jev'|'simulated';reason:string;severity?:number};
export type Receipt = {id:string;time:string;agent:string;action:string;input:unknown;policy:Decision|null;chain:number|null;mode:Mode;status:'success'|'rejected'|'error';result:unknown;txHash?:string;previousHash:string;hash:string};
export type Policy = {dailyCap:string;maxTransaction:string;approvalThreshold:string;expires:string;tokens:string[];recipients:string[];paused:boolean};
export type Preview = {id:string;tool:string;amount:string;recipient:string;token:string;reason:string;decision:Decision;requiresApproval:boolean;expires:string;typedData?:unknown};
export type Passport = {id:string;name:string;endpoint:string;capabilities:string[];owner:string;wallet:string;feedback:{job:string;client:string;score:number;signature?:string;simulated:boolean}[];attestations:{job:string;validator:string;evidence:string;score:number;simulated:boolean;uid?:string}[];jobs:{id:string;client:string}[];trust?:Decision};
export type Quest = {id:string;title:string;brief:string;capability:string;reward:string;creator:string;worker?:string;validator:string;deadline:string;reviewEnd?:string;status:'open'|'claimed'|'submitted'|'disputed'|'paid'|'refunded';submission?:string;workHash?:string;decision?:Decision};
export type FlightPlan={maxAllocationBps:number;minLiquidityBps:number;maxRisk:number;maxMove:string;dailyCap:string;thresholdBps:number;paused:boolean};
export type Vault = {id:string;name:string;kind:'lending'|'savings';assets:string;apy:number|null;risk:number;sample?:{time:string;assetsPerShare:string};maxAllocationBps?:number};
export type Intent = {id:string;request:string;buyAmount:string;maxSellAmount:string;deadline:string;receiver:string;status:'draft'|'signed'|'open'|'filled'|'expired'|'cancelled';decision:Decision;simulation:{solver:string;sellAmount:string;buyAmount:string;eligible:boolean}[];signature?:string;orderUid?:string;order?:Record<string,unknown>;winner?:string;txHash?:string};
export type State = {version:1;day:number;chainId?:number;mode:Mode;owner:string;agent:string;born:boolean;balance:string;policy:Policy;preview?:Preview;receipts:Receipt[];chat:{role:'user'|'agent';text:string}[];revenue:string;tolls:{id:string;time:string;amount:string;mode:Mode;txHash?:string}[];passports:Passport[];quests:Quest[];plan:FlightPlan;vaults:Vault[];treasuryLiquid:string;intentPreview?:Intent;intents:Intent[];inferences?:InferenceCard[];senate?:Senate;forecast?:ForecastArena;sentinel?:SentinelState;rwa?:RwaState;launchpad?:LaunchState;press?:PressState;compute?:ComputeMarket;lastResult?:unknown;rate:{start:number;count:number}};
export type Transaction={expectedSender?:`0x${string}`;to:`0x${string}`;data:`0x${string}`;value?:string;chainId:number;description:string};

export type GlassReceipt={version:1;mode:"demo"|"tdx";nonce:string;model:string;modelDigest:string;input:string;output:string;issuedAt:number;signer:string;signature:string;quote:string};
export type InferenceCheck={valid:boolean;hardware:boolean;status:"verified"|"integrity-only"|"failed";checkedAt:string;checks:{name:string;pass:boolean;detail:string}[]};
export type InferenceCard={id:string;proof:GlassReceipt;verification:InferenceCheck;decision:Decision;shared?:boolean};

export type SenateProfile={member:string;agent:string;name:string;values:string;priorities:{publicGoods:number;security:number;growth:number;reserves:number};paused:boolean;revision:number};
export type SenateProposal={id:string;title:string;description:string;impact:SenateProfile['priorities'];members:SenateProfile[];snapshot:number;agentDeadline:number;deadline:number;status:string;calldata:string;transcript:{member:string;name:string;round:number;text:string;decision:Decision}[];stances:{member:string;support:number;confidence:number;statement:string;needsReview:boolean;decision:Decision}[];summary?:string;summaryDecision?:Decision;ballots:{member:string;support:number;reason:string;txHash?:string}[];overrides:{member:string;support:number;reason:string;txHash?:string}[];chainTally?:string[];chainQuorum?:string};
export type Senate={profiles:SenateProfile[];proposals:SenateProposal[];offset:number;paused:boolean;scannedThrough?:string;chainTimestamp?:number};

export type ForecastPosition={trader:string;lane:'human'|'agent';yes:string;no:string;probability:number;claimed:boolean};
export type ForecastMarket={id:string;question:string;rules:string;close:number;yesPool:string;noPool:string;outcome:number;proposed:number;assertionId?:string;disputed:boolean;assertionEnd?:number;positions:ForecastPosition[];evidence?:string;decision?:Decision};
export type ForecastRisk={trader:string;name:string;registered:boolean;paused:boolean;perTrade:string;perMarket:string;daily:string;spent:Record<string,string>};
export type ForecastArena={markets:ForecastMarket[];risks:ForecastRisk[];offset:number;paused:boolean;chainTimestamp?:number};

export type ComputeProvider={address:string;name:string;model:string;vram:number;slots:number;active:number;price:string;online:boolean;completed:number;failed:number;health:{checks:number;up:number;last:number;available:boolean};approved:boolean;websocket?:string;};
export type ComputeJob={id:string;buyer:string;provider:string;model:string;minutes:number;amount:string;deadline:number;inputHash:string;requestId:string;status:'draft'|'escrowed'|'delivered'|'refunded';prompt?:string;output?:string;outputHash?:string;txHash?:string;decision?:Decision};
export type ComputeMarket={providers:ComputeProvider[];jobs:ComputeJob[];paused:boolean;clock?:number;};

export type PressWork={id:string;creator:string;title:string;uri:string;hash:string;terms:number;price:string;parent:string;depth:number;earned:string;content?:string;draft?:boolean;};
export type PressLicense={id:string;work:string;buyer:string;purpose:number;amount:string;time:number};
export type PressState={works:PressWork[];licenses:PressLicense[];paused:boolean;credit:string;claimed:string;};

export interface LaunchListing {id:string;address:string;creator:string;name:string;symbol:string;description:string;prompt:string;fee:string;launchedAt:number;reserve:string;curveTokens:string;revenue:string;distributed:string;creatorReleased:string;price:string;valuation:string;balance:string;claimable:string;story?:string;risk?:Decision;history:{buy:boolean;amount:string;time:number}[]}
export interface LaunchState {listings:LaunchListing[];jobs:Record<string,{listing:string;request:string;output?:string;paid:boolean;error?:string}>;agentSpent:Record<string,string>;clock:number}

export interface SentinelAgent {removed?:boolean;id:string;name:string;session:string;perTx:string;daily:string;threshold:string;starts:number;ends:number;epoch:string;version:string;paused:boolean;balance:string;spent:string;nonce:string;targets:string[]}
export interface SentinelPermit {id:string;target:string;amount:string;nonce:string;deadline:string;epoch:string;version:string;needsHuman:boolean;requestId:string}
export interface SentinelRequest {id:string;agent:string;target:string;amount:string;purpose:string;status:'blocked'|'pending'|'ready'|'executed'|'cancelled';decision:Decision;severity:number;permit?:SentinelPermit;guardianSignature?:string;txHash?:string;simulation?:string;reason:string;time:number}
export interface SentinelState {demoFleetVersion?:number;sessions?:{name:string;address:string}[];guardian?:string;day?:number;agents:SentinelAgent[];requests:SentinelRequest[];stopped:boolean;epoch:string;clock:number;chat:{text:string;role:'user'|'agent';route?:string}[];alerts:{id:string;agent:string;reason:string;severity:number;time:number;ack:boolean}[]}

export interface RwaPosition {assetId:string;shares:string;value:string;pendingDeposit:string;claimableShares:string;pendingRedeem:string;claimableAssets:string;price:string;priceUpdated:number;shareDecimals:number;permissioned:boolean}
export interface RwaEligibility {assetId:string;status:'eligible'|'review'|'blocked';reason:string;checked:number;decision:Decision;permissioned:boolean}
export type RwaKind='subscribe'|'claim'|'redeem'|'withdraw';
export interface RwaQuote {submittedHash?:string;id:string;assetId:string;kind:RwaKind;amount:string;units:string;estimatedShares:string;created:number;expires:number;catalogHash:string;profileHash:string;owner:string;chain:number;needsReview:boolean;status:'preview'|'confirmed'|'complete';transactions:Transaction[];hashes:string[];oraclePrice:string}
export interface RwaState {profile?:{country:string;professional:boolean;acceptedRisks:boolean};eligibility?:RwaEligibility;positions:RwaPosition[];quotes:RwaQuote[];cash:string;clock:number;answers:{question:string;route:string;source:string;paragraphs:{text:string;sourceIds:string[]}[];assetId:string}[];oracle?:{price:string;updated:number;source:string};demoReady:boolean}
