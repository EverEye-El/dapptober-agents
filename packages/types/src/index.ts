export type Mode = 'demo' | 'real';
export type Decision = {allow:boolean;confidence:number;fit:number;abuse:number;route:'small'|'large';source:'jev'|'simulated';reason:string};
export type Receipt = {id:string;time:string;agent:string;action:string;input:unknown;policy:Decision|null;chain:number|null;mode:Mode;status:'success'|'rejected'|'error';result:unknown;txHash?:string;previousHash:string;hash:string};
export type Policy = {dailyCap:string;maxTransaction:string;approvalThreshold:string;expires:string;tokens:string[];recipients:string[];paused:boolean};
export type Preview = {id:string;tool:string;amount:string;recipient:string;token:string;reason:string;decision:Decision;requiresApproval:boolean;expires:string;typedData?:unknown};
export type Passport = {id:string;name:string;endpoint:string;capabilities:string[];owner:string;wallet:string;feedback:{job:string;client:string;score:number;signature?:string;simulated:boolean}[];attestations:{job:string;validator:string;evidence:string;score:number;simulated:boolean;uid?:string}[];jobs:{id:string;client:string}[];trust?:Decision};
export type Quest = {id:string;title:string;brief:string;capability:string;reward:string;creator:string;worker?:string;validator:string;deadline:string;reviewEnd?:string;status:'open'|'claimed'|'submitted'|'disputed'|'paid'|'refunded';submission?:string;workHash?:string;decision?:Decision};
export type FlightPlan={maxAllocationBps:number;minLiquidityBps:number;maxRisk:number;maxMove:string;dailyCap:string;thresholdBps:number;paused:boolean};
export type Vault = {id:string;name:string;kind:'lending'|'savings';assets:string;apy:number|null;risk:number;sample?:{time:string;assetsPerShare:string};maxAllocationBps?:number};
export type Intent = {id:string;request:string;buyAmount:string;maxSellAmount:string;deadline:string;receiver:string;status:'draft'|'signed'|'open'|'filled'|'expired'|'cancelled';decision:Decision;simulation:{solver:string;sellAmount:string;buyAmount:string;eligible:boolean}[];signature?:string;orderUid?:string;order?:Record<string,unknown>;winner?:string;txHash?:string};
export type State = {version:1;day:number;chainId?:number;mode:Mode;owner:string;agent:string;born:boolean;balance:string;policy:Policy;preview?:Preview;receipts:Receipt[];chat:{role:'user'|'agent';text:string}[];revenue:string;tolls:{id:string;time:string;amount:string;mode:Mode;txHash?:string}[];passports:Passport[];quests:Quest[];plan:FlightPlan;vaults:Vault[];treasuryLiquid:string;intentPreview?:Intent;intents:Intent[];inferences?:InferenceCard[];senate?:Senate;forecast?:ForecastArena;lastResult?:unknown;rate:{start:number;count:number}};
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
