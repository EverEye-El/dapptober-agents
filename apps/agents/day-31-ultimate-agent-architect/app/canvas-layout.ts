export function movePosition(origin:{x:number;y:number},dx:number,dy:number,width:number,height:number,maxX=510,maxY=290){return {x:Math.max(8,Math.min(maxX,origin.x+dx/width*700)),y:Math.max(40,Math.min(maxY,origin.y+dy/height*450))};}
export function autoPositions(ids:readonly string[]){return Object.fromEntries(ids.map((id,i)=>[id,{x:35+(i%3)*220,y:60+Math.floor(i/3)*150}]));}
