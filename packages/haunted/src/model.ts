export type Move='talk'|'trick'|'bribe';
export interface Room {id:string;name:string;ghost:string;title:string;persona:string;riddle:string;answer:string;hint:string;trick?:string;bribe?:number;symbol:string;}
export interface Message {id:string;room:string;who:'player'|'ghost'|'house';text:string;time:string;move?:Move;source?:string;}
export interface Gate {allow:boolean;confidence:number;source:string;}
export interface Pending {kind:'commit'|'reveal'|'approve'|'claim';wallet:string;to:`0x${string}`;data:`0x${string}`;description:string;hash?:string;}
export interface Run {rooms:Room[];keys:string[];messages:Message[];purse:number;claimed:boolean;reward:number;started:string;wallet?:string;pending?:Pending;sealed?:{room:number;move:number;proof:`0x${string}`;salt:`0x${string}`;commitment:`0x${string}`;block?:string};lastGate?:Gate;calls:number;budgetDay:string;rate:{time:number;count:number};}
export interface House {rooms:Room[];paused:boolean;revision:number;reviews:number;budgetDay:string;}
export const rooms:Room[]=[
{id:'bell',name:'The Bell Tower',ghost:'Sister Static',title:'THE VOICE WITHOUT A BODY',persona:'A cryptic, playful bell-ringer. Speaks in short poetic radio fragments. Offers hints, never claims to mint keys.',riddle:'I speak without a mouth and hear without ears. You call into the dark. I return. What am I?',answer:'echo',hint:'Listen to what comes back when you shout into an empty hall.',symbol:'◈'},
{id:'mirror',name:'The Mirror Gallery',ghost:'Lord Null',title:'THE COUNT THAT NEVER ENDS',persona:'An aristocratic trickster who speaks like a bored casino host. Loves arithmetic loopholes and theatrical insults.',riddle:'I follow you in daylight, vanish in darkness, and have no weight. What am I?',answer:'shadow',hint:'Your silent companion gets longer when the sun falls. Or trick me: what is 8 + 5?',trick:'13',symbol:'◇'},
{id:'crypt',name:'The Copper Crypt',ghost:'Morrow',title:'THE LAST DEBT COLLECTOR',persona:'A dry, sardonic keeper of debts. Never promises profit. Accepts exactly one practice credit, or the correct riddle answer.',riddle:'I have cities but no houses, forests but no trees, and rivers but no water. What am I?',answer:'map',hint:'Fold the world into something you can carry. Or offer exactly 1 credit.',bribe:1,symbol:'⌘'}];
export const normalized=(s:string)=>s.trim().toLowerCase().replace(/^(an?|the)\s+/,'').replace(/[.!?]+$/,'');
export function freshHouse():House{return {rooms:structuredClone(rooms),paused:false,revision:1,reviews:0,budgetDay:''};}
export function freshRun(h:House):Run{return {rooms:structuredClone(h.rooms),keys:[],messages:[],purse:10,claimed:false,reward:5,started:new Date().toISOString(),calls:0,budgetDay:'',rate:{time:Date.now(),count:0}};}
export function eligible(room:Room,move:Move,text:string,amount:number){return move==='talk'?normalized(text)===normalized(room.answer):move==='trick'?!!room.trick&&normalized(text)===normalized(room.trick):!!room.bribe&&amount===room.bribe;}
