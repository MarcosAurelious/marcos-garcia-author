/* Roman Arena v51 — procedurally generated transparent special-effect sprites.
   Each sprite is rendered once in a small offscreen canvas and reused in-game.
   No changes to existing fighter character sheets. */
(() => {
'use strict';
const cache = new Map();
const PAINTED_IDS = ['marcus','mars','colossus','medusa','minotaur','vulcan','chiron','diana','cerberus','pegasus','helios','neptune','hades'];
const painted = new Map();
function authoredSprite(id) {
  if(!PAINTED_IDS.includes(id))return null;
  if(!painted.has(id)){
    const im = new Image();
    const item = {image:im,ready:false,failed:false};
    painted.set(id,item);
    im.onload=()=>{item.ready=im.naturalWidth===1536&&im.naturalHeight===192;};
    im.onerror=()=>{item.failed=true;};
    im.src='specials/'+id+'.svg';
  }
  const item=painted.get(id);
  return item.ready?item.image:null;
}
// Load attack art during character selection rather than waiting for first impact.
PAINTED_IDS.forEach(authoredSprite);
const TAU = Math.PI * 2;
const colors = {
  marcus:['#e8ffff','#5de1ff','#2876ff'],
  mars:['#fff0ec','#ff263e','#a00020'],
  colossus:['#ffffff','#8deaff','#437cff'],
  medusa:['#e5c9ff','#a677ff','#62606c'],
  minotaur:['#fff2d0','#ed8e3c','#b72a1f'],
  vulcan:['#fff9b9','#ff9a23','#e12e0d'],
  chiron:['#ffffff','#f5d5a0','#b18bff'],
  diana:['#ffffff','#acff3b','#20df75'],
  cerberus:['#ffe4a4','#ff6822','#b21b0f'],
  pegasus:['#f6ffff','#80d9ff','#5e7cff'],
  helios:['#ffffff','#fffae5','#f9c84a'],
  neptune:['#e6ffff','#33dafa','#176ade'],
  hades:['#ffffff','#b28aff','#251041']
};
function make(id, frame) {
  const size=128, c=document.createElement('canvas');c.width=c.height=size;
  const x=c.getContext('2d');x.translate(64,64);
  const palette=colors[id]||colors.marcus, t=frame/8, r=18+Math.sin(t*TAU)*3;
  const line=(points,w,color,blur=0)=>{
    x.save();x.lineCap='round';x.lineJoin='round';x.strokeStyle=color;x.lineWidth=w;
    x.shadowColor=color;x.shadowBlur=blur;x.beginPath();points.forEach((p,i)=>i?x.lineTo(...p):x.moveTo(...p));x.stroke();x.restore();
  };
  const orb=(radius,white=false)=>{
    const g=x.createRadialGradient(0,0,2,0,0,radius);
    g.addColorStop(0,white?'#ffffff':palette[0]);g.addColorStop(.4,palette[1]);g.addColorStop(1,'#00000000');
    x.fillStyle=g;x.beginPath();x.arc(0,0,radius,0,TAU);x.fill();
  };
  if(id==='marcus'||id==='colossus') {
    for(let b=-2;b<=2;b++){let points=[];for(let j=0;j<=6;j++)points.push([-54+j*18,-5+b*7+Math.sin(j*2.8+frame+b)*9]);line(points,id==='colossus'?4:2.8,b%2?palette[1]:palette[0],7);}
    orb(16,true);
  } else if(id==='mars'){
    line([[-53,0],[52,0]],20,palette[2],16);line([[-56,0],[54,0]],10,palette[1],18);line([[-59,0],[58,0]],3,palette[0],11);
    line([[28,-12],[57,0],[28,12]],3,palette[0]);
  } else if(id==='medusa'){
    orb(40);x.strokeStyle=palette[0];x.lineWidth=3;for(let i=0;i<7;i++){x.beginPath();x.arc(0,0,24+i*3,t+i*.8,t+2.8+i*.8);x.stroke();}
    x.fillStyle=palette[0];x.beginPath();x.ellipse(0,0,22,10,0,0,TAU);x.fill();x.fillStyle=palette[2];x.beginPath();x.arc(0,0,7,0,TAU);x.fill();
  } else if(id==='minotaur'||id==='cerberus'){
    orb(35);for(let i=0;i<5;i++){const a=i*TAU/5+t*2;line([[0,0],[Math.cos(a)*57,Math.sin(a)*57]],8,palette[1],9);}
  } else if(id==='vulcan'){
    for(let i=0;i<8;i++){const a=i*TAU/8+t;const dist=18+8*Math.sin(t*TAU+i);orb(4);
      x.fillStyle=i%2?palette[1]:palette[2];x.beginPath();x.ellipse(Math.cos(a)*dist,Math.sin(a)*dist,8+3*i%5,16, a,0,TAU);x.fill();}
    orb(24,true);
  } else if(id==='chiron'||id==='diana'){
    const c=id==='diana'?palette[1]:palette[2];line([[-55,0],[50,0]],5,c,9);line([[38,-10],[56,0],[38,10]],5,palette[0]);line([[-35,-9],[-20,0],[-35,9]],3,palette[1]);
    if(id==='chiron')for(let k=0;k<4;k++)line([[-38+k*15,-18],[30+k*6,-18]],2,palette[1]);
  } else if(id==='pegasus'){
    orb(22);line([[-24,-21],[14,0],[-24,21]],7,palette[0],9);line([[-45,-36],[-4,0],[-45,36]],6,palette[1],10);
  } else if(id==='helios'){
    orb(53,true);for(let i=0;i<10;i++){let a=i*TAU/10+t*1.8;line([[Math.cos(a)*27,Math.sin(a)*27],[Math.cos(a)*58,Math.sin(a)*58]],5,palette[0],12);}
  } else if(id==='neptune'){
    for(let i=0;i<5;i++){let y=(i-2)*11;line([[-58,y],[ -27,y-13*Math.sin(t*TAU+i)],[5,y+13*Math.sin(t*TAU+i)],[34,y-6],[58,y]],8,i%2?palette[1]:palette[0],9);}
  } else if(id==='hades'){
    orb(53);let g=x.createRadialGradient(0,0,2,0,0,39);g.addColorStop(0,'#08020e');g.addColorStop(.60,'#100723');g.addColorStop(.76,palette[2]);g.addColorStop(.89,palette[1]);g.addColorStop(1,'#00000000');x.fillStyle=g;x.beginPath();x.arc(0,0,39,0,TAU);x.fill();
    for(let i=0;i<9;i++){let a=i*TAU/9+t*TAU;line([[Math.cos(a)*50,Math.sin(a)*50],[Math.cos(a+.7)*26,Math.sin(a+.7)*26]],2,palette[0],6);}
  }
  return c;
}
function sprite(id,frame){const key=id+':'+(frame%8);if(!cache.has(key))cache.set(key,make(id,frame%8));return cache.get(key);}
function draw(ctx,id,x,y,w,h,now,face=1){
 const f=((Math.floor(now*17)%8)+8)%8;
 const hand=authoredSprite(id);
 ctx.save();ctx.translate(x,y);ctx.scale(face,1);
 if(hand)ctx.drawImage(hand,192*f,0,192,192,-w/2,-h/2,w,h);
 else {const c=sprite(id,f);ctx.drawImage(c,-w/2,-h/2,w,h);}
 ctx.restore();
}
function drawProjectile(ctx,shot,now){
 const id=shot.kind||shot.a||'marcus',d=shot.face||1;
 ctx.save();ctx.globalCompositeOperation='lighter';
 if(id==='diana'){ctx.strokeStyle='#b8ff5e';ctx.shadowColor='#67ff00';ctx.shadowBlur=19;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(shot.x-d*115,shot.y);ctx.lineTo(shot.x+d*20,shot.y);ctx.stroke();}
 if(id==='hades'){ctx.globalCompositeOperation='source-over';}
 draw(ctx,id,shot.x,shot.y,id==='marcus'?140:105,id==='neptune'?95:80,now,d);
 ctx.restore();
}
function drawBeam(ctx,b,now){
 ctx.save();ctx.translate(b.x,b.y);ctx.scale(b.face||1,1);
 const isSun=b.kind==='helios',len=b.len,k=Math.max(.15,1-b.t/b.dur);
 ctx.globalCompositeOperation='lighter';
 ctx.strokeStyle=isSun?'#fff9d6':b.col[1];ctx.shadowColor=b.col[0];ctx.shadowBlur=32;
 for(let i=0;i<3;i++){ctx.lineWidth=(isSun?32:20)*k/(i+1);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(len,Math.sin(now*40+i)*2);ctx.stroke();}
 for(let j=0;j<12;j++)draw(ctx,b.kind||'helios',len*j/12,Math.sin(j+now*12)*3,70,64,now,1);
 ctx.restore();
}
function drawWave(ctx,w,now,floor){
 if(w.delay>0)return;
 const id=w.kind||'vulcan';ctx.save();ctx.globalCompositeOperation='lighter';
 for(let i=0;i<3;i++)draw(ctx,id,w.x-i*Math.sign(w.vx)*34,floor-(id==='neptune'?75:30),95,id==='neptune'?135:80,now+i*.07,Math.sign(w.vx));
 ctx.restore();
}
function drawCharge(ctx,f,now){
 const id=f.ch.id;const valid=['mars','colossus','minotaur','cerberus','pegasus'];if(!valid.includes(id))return;
 if(f.move!=='special'||f.state!=='attack')return;
 ctx.save();ctx.globalCompositeOperation='lighter';
 if(id==='pegasus'){draw(ctx,id,f.x+f.face*55,f.y-140,140,145,now,f.face);}
 else if(id==='mars'){draw(ctx,id,f.x+f.face*110,f.y-95,185,46,now,f.face);}
 else if(id==='colossus'){draw(ctx,id,f.x+f.face*92,f.y-100,130,95,now,f.face);}
 else draw(ctx,id,f.x+f.face*58,f.y-95,110,115,now,f.face);
 ctx.restore();
}
function stone(ctx,f,time){if(!f.petrified||f.petrified<=0)return;
 ctx.save();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.45;ctx.fillStyle='#aeb2b7';
 const h=190*f.ch.size;ctx.fillRect(f.x-36*f.ch.size,f.y-h,72*f.ch.size,h);
 ctx.strokeStyle='#e5e2e0';ctx.lineWidth=3;ctx.strokeRect(f.x-36*f.ch.size,f.y-h,72*f.ch.size,h);ctx.restore();
}
window.ArenaSpecialFX={drawProjectile,drawBeam,drawWave,drawCharge,stone,draw,authoredSprite,PAINTED_IDS};
})();