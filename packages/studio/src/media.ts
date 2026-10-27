import sharp from 'sharp';import type {Config} from '@dapptober/config';
export async function generate(c:Config,prompt:string){
 if(c.AGENT_MODE==='demo'){
  // Procedural pixels, deliberately labeled a practice render; no pretend AI call.
  const svg=`<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="g"><stop stop-color="#e89a4d"/><stop offset="1" stop-color="#160e0b"/></radialGradient><linearGradient id="l"><stop stop-color="#d88034"/><stop offset="1" stop-color="#271810"/></linearGradient></defs><rect width="1024" height="1024" fill="#100e0b"/><circle cx="512" cy="460" r="390" fill="url(#g)" opacity=".35"/><path d="M90 800 L512 80 934 800Z" fill="none" stroke="#e9a05a" stroke-width="3"/><circle cx="512" cy="460" r="230" fill="none" stroke="#e1a673" stroke-width="3"/><rect x="352" y="300" width="320" height="320" fill="url(#l)" transform="rotate(25 512 460)"/><circle cx="512" cy="460" r="75" fill="#120f0b" stroke="#ffc98b" stroke-width="4"/><path d="M0 850H1024M0 900H1024M0 950H1024" stroke="#53361e"/><text x="70" y="100" font-family="monospace" font-size="24" fill="#dfac78">TAKE ONE / PROCEDURAL PRACTICE RENDER</text><text x="70" y="970" font-family="monospace" font-size="18" fill="#dfac78">NO AI PROVIDER CALL / ${Buffer.from(prompt).toString('hex').slice(0,24)}</text></svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
 }
 if(!c.OPENAI_API_KEY)throw new Error('OPENAI_API_KEY required for image generation');
 const r=await fetch('https://api.openai.com/v1/images/generations',{method:'POST',headers:{Authorization:'Bearer '+c.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_IMAGE_MODEL??'gpt-image-1',prompt,n:1,size:'1024x1024',quality:'low',output_format:'png'}),signal:AbortSignal.timeout(180000),redirect:'error'});
 if(!r.ok)throw new Error(`OpenAI image generation failed (${r.status}); check account access/billing`);
 const b=await r.json();const data=b.data?.[0]?.b64_json;if(typeof data!=='string'||data.length>14000000)throw new Error('Image API did not return bounded PNG bytes');
 const png=Buffer.from(data,'base64');if(!png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw new Error('Image API returned a non-PNG payload');await sharp(png,{limitInputPixels:16777216}).metadata();return png;
}
export async function edit(bytes:Buffer,operation:'monochrome'|'warm'|'crop'){
 const image=sharp(bytes,{limitInputPixels:16777216});
 if(operation==='monochrome')image.grayscale();else if(operation==='warm')image.tint('#c58a58');else{const m=await image.metadata(),side=Math.min(m.width??0,m.height??0);image.extract({left:Math.floor(((m.width??0)-side)/2),top:Math.floor(((m.height??0)-side)/2),width:side,height:side}).resize(768,768);}
 return image.png().toBuffer();
}
