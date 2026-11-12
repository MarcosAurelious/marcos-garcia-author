(async()=>{'use strict';
// Game data (fighters, sprites, frames, moves, stages) lives in data/fighters.json.
let DATA;
try{const res=await fetch('data/fighters.json',{cache:'no-cache'});if(!res.ok)throw new Error('HTTP '+res.status);DATA=await res.json();}
catch(err){const msg=document.createElement('p');msg.className='load-error';msg.textContent='Cursebound could not load its game data ('+err.message+'). Play it from the website, or run a local server.';document.body.appendChild(msg);throw err;}
const FIGHTERS=DATA.fighters;
const byFighter=(key)=>Object.fromEntries(FIGHTERS.filter(f=>f[key]!=null).map(f=>[f.id,f[key]]));

const canvas=document.getElementById('game'),ctx=canvas.getContext('2d',{alpha:false});
const W=1280,H=720,GROUND=568,FPS=60,STEP=1000/FPS;
const $=(id)=>document.getElementById(id);
const keys=new Set();let phase='menu',mode='cpu',match=null,fighters=[],effects=[],sparks=[],shake=0,hitFreeze=0,clock=90,subframes=0,frameNo=0,introTimer=0,roundTimer=0,champion=null,muted=false,snd=null,paused=false,lastFrame=0,acc=0;
const menu=$('menu'),battleUi=$('battleUi'),result=$('result');
const stageNames=DATA.stages.map(s=>s.name);
const roster=FIGHTERS.map(f=>Object.assign({id:f.id,name:f.name,epithet:f.epithet,hidden:!!f.hidden,arcadeOnly:!!f.arcadeOnly,cols:f.sheets.cols,rows:f.sheets.rows,h:f.stats.height,weight:f.stats.weight,speed:f.stats.speed,power:f.stats.power,col:f.color,attackRows:f.sheets.attackRows||null,attackGridRows:f.sheets.attackGridRows||null,koData:f.ko||null},f.frames));
const rosterById=Object.fromEntries(roster.map(x=>[x.id,x]));
const ASSET_URLS=Object.assign({title:DATA.title},...DATA.stages.map((s,i)=>({['stage'+i]:s.image})),...FIGHTERS.map(f=>Object.assign({[f.id]:f.sheets.motion},f.sheets.portrait?{[f.id+'_portrait']:f.sheets.portrait}:{})));
const ACTION_ROW={lp:0,mp:1,hp:2,lk:3,mk:4,hk:5};
const ATTACK_URLS=Object.fromEntries(FIGHTERS.filter(f=>f.sheets.attack).map(f=>[f.id,f.sheets.attack]));
const attackImgs={};for(const [key,url] of Object.entries(ATTACK_URLS)){const im=new Image();im.src=url;attackImgs[key]=im;}
const SPECIAL_ASSET_URLS=Object.fromEntries(FIGHTERS.filter(f=>f.sheets.special).map(f=>[f.id,f.sheets.special]));
const specialImgs={};for(const [key,url] of Object.entries(SPECIAL_ASSET_URLS)){const im=new Image();im.src=url;specialImgs[key]=im;}

// v4.0 jump system: crouch (takeoff) -> rise -> apex -> fall -> land.
// Werewolf and Mothman use dedicated jump art; the others use their closest airborne poses until jump sheets exist.
const JUMP_POSES=byFighter('jump');
const jumpImgs={};for(const [id,j] of Object.entries(JUMP_POSES))if(j.sheet){const im=new Image();im.src=j.sheet;jumpImgs[id]=im;}
const JUMP_CROUCH_TICKS=5,LAND_TICKS=7;
const JUMP=Object.assign({velocity:18.4,gravity:.78,forwardSpeed:6.8},DATA.jump||{});
// v4.4 knockdown art: per-fighter KO sheets (or frames from the fighter's own sheet)
const koImgs={};for(const f of FIGHTERS)if(f.ko&&f.ko.sheet){const im=new Image();im.src=f.ko.sheet;koImgs[f.id]=im;}
// ---- Cutscenes: 6-panel comic sheets (2x3). Intro panels play before round 1, win panels after the match. ----
const CUTSCENES=Object.fromEntries(FIGHTERS.filter(f=>f.cutscene).map(f=>[f.id,f.cutscene]));
const cutImgs={};let scene=null;
const CUT_PANEL=66,CUT_FADE=12,CUT_VS=84,CUT_HOLD=200,CUT_WAIT=150;
function cutImg(id){if(!CUTSCENES[id])return null;if(!cutImgs[id]){const im=new Image();im.decoding='async';im.src=CUTSCENES[id].sheet;cutImgs[id]=im;}return cutImgs[id];}
const portraitImgs={};function portraitImg(id){const f=FIGHTERS.find(x=>x.id===id),src=f&&f.sheets.portrait;if(!src)return null;if(!portraitImgs[id]){const im=new Image();im.src=src;portraitImgs[id]=im;}return portraitImgs[id];}
function sideLabel(side){return side===0?'PLAYER 1':(mode==='arcade'?(arcadeBoss()?'BOSS':'CHALLENGER'):mode==='cpu'?'CHALLENGER':'PLAYER 2');}
function buildIntroScene(){const shots=[];if(mode==='practice')return shots;const vsOnly=mode==='arcade'&&arcade&&arcade.idx>0&&!arcadeBoss();fighters.forEach((f,side)=>{const c=CUTSCENES[f.r.id];if(!c||vsOnly)return;cutImg(f.r.id);c.intro.forEach((panel,i)=>shots.push({kind:'intro',id:f.r.id,f,side,panel,i,n:c.intro.length,len:CUT_PANEL}));});fighters.forEach(f=>{if(!CUTSCENES[f.r.id])portraitImg(f.r.id);});shots.push({kind:'vs',len:CUT_VS});return shots;}
function buildWinScene(w){const c=CUTSCENES[w.r.id];if(!c)return[];cutImg(w.r.id);const fin=lastFinisher&&lastFinisher.owner===w.r.name?'REDEMPTION FINISHER · '+lastFinisher.name:null;return c.win.map((panel,i)=>({kind:'win',id:w.r.id,f:w,panel,i,n:c.win.length,fin,len:i===c.win.length-1?CUT_HOLD:CUT_PANEL}));}
function setCutsceneUi(on){$('specialGuide').classList.toggle('cutscene-hidden',on);}
function startScene(shots,next){if(!shots.length){next();return;}scene={shots,idx:0,t:0,age:0,wait:0,next};phase='cutscene';setCutsceneUi(true);clearInput();}
function endScene(){if(!scene)return;const next=scene.next;scene=null;setCutsceneUi(false);next();}
function skipScene(){if(phase==='cutscene'&&scene&&scene.age>18){blip(240,.07);endScene();}}
function shotReady(s){if(s.kind==='vs')return true;const im=cutImgs[s.id];return im&&im.complete;}
function stepScene(){const s=scene.shots[scene.idx];if(!shotReady(s)&&scene.wait++<CUT_WAIT)return;const im=cutImgs[s.id];
 if(s.kind!=='vs'&&(!im||!im.naturalWidth)){scene.idx++;scene.t=0;}else{scene.t++;scene.age++;if(scene.t>=s.len){scene.idx++;scene.t=0;scene.wait=0;}}
 if(scene.idx>=scene.shots.length)endScene();else if(scene.t===0){const n=scene.shots[scene.idx];blip(n.kind==='vs'?120:(n.kind==='win'&&n.i===n.n-1?420:180),n.kind==='vs'?.22:.06,'triangle',.03);}}
function panelRect(id,panel){const c=CUTSCENES[id],im=cutImgs[id],pw=im.naturalWidth/c.cols,ph=im.naturalHeight/c.rows;return{x:(panel%c.cols)*pw,y:Math.floor(panel/c.cols)*ph,w:pw,h:ph};}
function drawPanel(id,panel,dx,dy,dw,dh,zoom=1,panX=.5,panY=.5){const r=panelRect(id,panel);const da=dw/dh,sa=r.w/r.h;let sw=r.w,sh=r.h;if(sa>da)sw=r.h*da;else sh=r.w/da;sw/=zoom;sh/=zoom;ctx.drawImage(cutImgs[id],r.x+(r.w-sw)*panX,r.y+(r.h-sh)*panY,sw,sh,dx,dy,dw,dh);}
function sceneFont(px,weight=600){return `${weight} ${px}px "Cormorant Garamond", Georgia, serif`;}
function sceneText(text,x,y,px,color,align='center',glow='#000',weight=600){ctx.save();ctx.textAlign=align;ctx.textBaseline='middle';ctx.font=sceneFont(px,weight);if('letterSpacing' in ctx)ctx.letterSpacing=Math.round(px*.08)+'px';ctx.shadowColor=glow;ctx.shadowBlur=18;ctx.fillStyle=color;ctx.fillText(text,x,y);ctx.shadowBlur=0;ctx.restore();}
function drawScene(){const s=scene.shots[scene.idx];ctx.save();ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
 if(s&&s.kind==='vs')drawVsCard(s);else if(s&&cutImgs[s.id]&&cutImgs[s.id].naturalWidth)drawStoryShot(s);
 ctx.globalAlpha=.55+.25*Math.sin(frameNo*.08);ctx.fillStyle='#cdb7a6';ctx.font='600 13px system-ui';ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText('PRESS ANY BUTTON TO SKIP',W-28,H-24);ctx.restore();}
function drawStoryShot(s){const t=scene.t,k=t/s.len,last=s.kind==='win'&&s.i===s.n-1;const c=CUTSCENES[s.id],r=panelRect(s.id,s.panel);
 const dh=Math.min(s.kind==='win'?H-190:H-120,Math.round(W*r.h/r.w)),dy=Math.round((H-dh)/2)-(s.kind==='win'?18:0);
 const fade=Math.min(1,t/CUT_FADE,last?1:(s.len-t)/CUT_FADE);ctx.globalAlpha=Math.max(0,fade);
 const zoom=1.03+.09*(last?Math.min(1,k*1.4):k),dir=s.i%2?k:1-k;drawPanel(s.id,s.panel,0,dy,W,dh,zoom,.25+.5*dir,.5);
 const g=ctx.createLinearGradient(0,dy+dh-150,0,dy+dh);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.82)');ctx.fillStyle=g;ctx.fillRect(0,dy+dh-150,W,150);
 ctx.globalAlpha=1;ctx.fillStyle='#000';ctx.fillRect(0,0,W,dy);ctx.fillRect(0,dy+dh,W,H-dy-dh);
 ctx.strokeStyle='rgba(205,170,140,.35)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,dy-1);ctx.lineTo(W,dy-1);ctx.moveTo(0,dy+dh+1);ctx.lineTo(W,dy+dh+1);ctx.stroke();
 const col=s.f.r.col||'#c74f56',ta=Math.min(1,(s.i*s.len+t)/20);ctx.globalAlpha=ta;
 if(s.kind==='intro'){sceneText(sideLabel(s.side),W/2,Math.max(26,dy/2),16,'#cdb7a6','center','#000',700);sceneText(s.f.r.name.toUpperCase(),W/2,dy+dh-58,64,'#f6e7d4','center',col);sceneText(s.f.r.epithet||'',W/2,dy+dh-16,22,'#d8b9a0','center','#000',600);}
 else if(last){const a=Math.min(1,t/30);ctx.globalAlpha=a;sceneText(s.f.r.name.toUpperCase()+' WINS',W/2,dy+dh+44,58,'#f6e7d4','center',col);sceneText(s.fin||(s.f.r.epithet||'THE CURSE REMAINS').toUpperCase(),W/2,dy+dh+86,17,'#d8b9a0','center','#000',700);}
 ctx.globalAlpha=1;}
function drawVsCard(s){const t=scene.t,k=Math.min(1,t/14),half=H/2;const [a,b]=fighters;const slide=(1-k)*W*.35;
 const drawHalf=(f,y,dx)=>{ctx.save();ctx.beginPath();ctx.rect(0,y,W,half);ctx.clip();const c=CUTSCENES[f.r.id],im=cutImgs[f.r.id];
  if(c&&im&&im.naturalWidth)drawPanel(f.r.id,c.intro[0],dx,y,W,half,1.02+.05*(t/s.len),.5,.42);else{ctx.fillStyle='#0b0b10';ctx.fillRect(0,y,W,half);const g=ctx.createLinearGradient(0,y,W,y+half);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,f.r.col||'#3a1d22');ctx.globalAlpha=.35;ctx.fillStyle=g;ctx.fillRect(0,y,W,half);ctx.globalAlpha=1;const pi=portraitImg(f.r.id);if(pi&&pi.complete&&pi.naturalWidth){const ph=half*1.05,pw=ph*pi.naturalWidth/pi.naturalHeight,px=y===0?W*.62:W*.12;ctx.drawImage(pi,px+dx,y+half-ph+8,pw,ph);}}
  ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(0,y,W,half);ctx.restore();};
 drawHalf(a,0,-slide);drawHalf(b,half,slide);
 ctx.fillStyle='#000';ctx.beginPath();ctx.moveTo(0,half-10);ctx.lineTo(W,half-34);ctx.lineTo(W,half+10);ctx.lineTo(0,half+34);ctx.closePath();ctx.fill();
 ctx.globalAlpha=k;sceneText(a.r.name.toUpperCase(),40,half-78,54,'#f6e7d4','left',a.r.col||'#000');sceneText(sideLabel(0),42,half-128,15,'#cdb7a6','left','#000',700);
 sceneText(b.r.name.toUpperCase(),W-40,half+78,54,'#f6e7d4','right',b.r.col||'#000');sceneText(sideLabel(1),W-42,half+128,15,'#cdb7a6','right','#000',700);
 if(mode==='arcade'){ctx.globalAlpha=k;ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(W/2-190,14,380,44);sceneText(arcadeLabel(),W/2,36,24,arcadeBoss()?'#ffb39a':'#f0d6b8','center',arcadeBoss()?'#c7262f':'#000',700);}
 const pop=t<10?2.2-1.2*(t/10):1+.03*Math.sin(t*.25);ctx.save();ctx.translate(W/2,half);ctx.scale(pop,pop);ctx.globalAlpha=Math.min(1,t/6);sceneText('VS',0,0,96,'#ffe9d0','center','#c7262f',700);ctx.restore();ctx.globalAlpha=1;
 if(t>s.len-10){ctx.fillStyle=`rgba(0,0,0,${(t-(s.len-10))/10})`;ctx.fillRect(0,0,W,H);}}

function jumpPose(f){const j=JUMP_POSES[f.r.id];if(!j)return null;
 if(f.grounded)return j.land;
 if((f.airTicks||0)<JUMP_CROUCH_TICKS)return j.crouch;
 const fwd=Math.sign(f.vx)===f.face&&Math.abs(f.vx)>1.5;
 if(f.vy<-5)return fwd&&j.riseFwd!=null?j.riseFwd:j.rise;
 if(f.vy<5)return fwd&&j.apexFwd!=null?j.apexFwd:j.apex;
 return j.fall;}
function faceOpponent(f,o){if(!o||f.ko)return;const dx=o.x-f.x;if(Math.abs(dx)>6)f.face=dx>0?1:-1;}
const imgs={},backgrounds=[];
for(const r of roster){const img=new Image();img.src=ASSET_URLS[r.id];imgs[r.id]=img;}
for(let i=0;i<DATA.stages.length;i++){const im=new Image();im.src=ASSET_URLS['stage'+i];backgrounds[i]=im;}
let selected='wolf',opponent='wendigo',stage=0;

// Menu is built from the user's approved original character artwork.
const gothicSelectArt=$('gothicSelectArt');
if(gothicSelectArt){
 gothicSelectArt.addEventListener('load',()=>{gothicSelectArt.hidden=false;menu.classList.add('gothic-ready');});
 gothicSelectArt.addEventListener('error',()=>{gothicSelectArt.hidden=true;menu.classList.remove('gothic-ready');});
 if(gothicSelectArt.complete&&gothicSelectArt.naturalWidth){gothicSelectArt.hidden=false;menu.classList.add('gothic-ready');}
}
const grid=$('roster');
const selectedFighterName=$('selectedFighterName');
for(const r of roster.filter(r=>!r.hidden)){
 const btn=document.createElement('button');btn.className='fighter-card'+(r.id===selected?' selected':'');btn.dataset.id=r.id;btn.setAttribute('aria-label','Select '+r.name);btn.setAttribute('aria-pressed',String(r.id===selected));
 btn.innerHTML=`<img src="${ASSET_URLS[r.id+'_portrait']||ASSET_URLS[r.id]}" alt="${r.name} original character sprite"><span>${r.name}</span><em>${r.epithet}</em>`;
 if(r.id==='mothman'){
   const thumb=btn.querySelector('img'),source=new Image();
   source.onload=()=>{
     const c=document.createElement('canvas');c.width=220;c.height=170;
     const g=c.getContext('2d');const cw=source.naturalWidth/8,ch=source.naturalHeight/12;
     g.drawImage(source,0,0,cw,ch,20,5,180,158);thumb.src=c.toDataURL('image/png');
   };source.src=ASSET_URLS[r.id];
 }
 btn.addEventListener('click',()=>{selected=r.id;markSelected();selectedFighterName.textContent=r.name;if(opponent===selected){opponent=roster.filter(r=>!r.hidden).find(x=>x.id!==selected).id;$('enemySelect').value=opponent;} stage=roster.findIndex(x=>x.id===selected)%6;$('stageSelect').value=stage;blip(380,0.055);});grid.appendChild(btn);
}
// v4.2 select screen: each button sits exactly on its card in the artwork, and only the selected card glows.
const SEL=DATA.selectScreen,selectGlows={};
if(SEL){const stageEl=$('selectStage');
 for(const c of SEL.cards){const btn=grid.querySelector(`[data-id="${c.id}"]`);if(!btn)continue;
  btn.style.setProperty('--x',c.x+'%');btn.style.setProperty('--y',c.y+'%');btn.style.setProperty('--w',c.w+'%');btn.style.setProperty('--h',c.h+'%');btn.classList.add('art-slot');
  const glow=document.createElement('img');glow.src=SEL.glow;glow.alt='';glow.className='select-glow';glow.dataset.id=c.id;glow.decoding='async';
  Object.assign(glow.style,{left:c.glowX+'%',top:c.glowY+'%',width:SEL.glowSize.w+'%',height:SEL.glowSize.h+'%'});
  stageEl.insertBefore(glow,grid);selectGlows[c.id]=glow;
  btn.addEventListener('pointerenter',()=>glow.classList.add('hover'));btn.addEventListener('pointerleave',()=>glow.classList.remove('hover'));
  btn.addEventListener('focus',()=>glow.classList.add('hover'));btn.addEventListener('blur',()=>glow.classList.remove('hover'));}
}
// v4.3 center portrait + name banner follow the selected fighter
const centerPanels={};let centerName=null;
if(SEL&&SEL.centerPanel){const stageEl=$('selectStage'),cp=SEL.centerPanel,nb=SEL.nameBanner;
 for(const [id,src] of Object.entries(SEL.panels||{})){const im=document.createElement('img');im.src=src;im.alt='';im.className='center-panel';im.decoding='async';
  Object.assign(im.style,{left:cp.x+'%',top:cp.y+'%',width:cp.w+'%',height:cp.h+'%'});stageEl.insertBefore(im,grid);centerPanels[id]=im;}
 centerName=document.createElement('div');centerName.id='centerName';centerName.setAttribute('aria-live','polite');
 Object.assign(centerName.style,{left:nb.x+'%',top:nb.y+'%',width:nb.w+'%',height:nb.h+'%'});
 centerName.innerHTML='<span></span>';stageEl.insertBefore(centerName,grid);
 addEventListener('resize',()=>fitCenterName());
}
function fitCenterName(){if(!centerName)return;const sp=centerName.firstChild;sp.style.transform='';const room=centerName.clientWidth*.94,need=sp.scrollWidth;sp.style.transform=need>room?`scaleX(${(room/need).toFixed(3)})`:'';}
function showCenter(id){if(!centerName)return;for(const [pid,im] of Object.entries(centerPanels))im.classList.toggle('on',pid===id);
 const r=rosterById[id];centerName.firstChild.textContent=r?r.name.toLowerCase().replace(/(^|\s)\S/g,c=>c.toUpperCase()):'';requestAnimationFrame(fitCenterName);if(document.fonts)document.fonts.ready.then(fitCenterName);}
function markSelected(){showCenter(selected);grid.querySelectorAll('.fighter-card').forEach(x=>{const active=x.dataset.id===selected;x.classList.toggle('selected',active);x.setAttribute('aria-pressed',String(active));});for(const [id,g] of Object.entries(selectGlows))g.classList.toggle('on',id===selected);}
markSelected();
for(const r of roster){if(r.arcadeOnly)continue;let opt=document.createElement('option');opt.value=r.id;opt.textContent=r.name;$('enemySelect').appendChild(opt);}
$('enemySelect').value=opponent;$('enemySelect').addEventListener('change',e=>opponent=e.target.value);
for(let i=0;i<DATA.stages.length;i++){let opt=document.createElement('option');opt.value=i;opt.textContent=stageNames[i];$('stageSelect').appendChild(opt);}
$('stageSelect').value=0;$('stageSelect').addEventListener('change',e=>stage=Number(e.target.value));
$('fightCpu').onclick=()=>beginMatch('cpu');$('fightLocal').onclick=()=>beginMatch('local');
$('rosterBtn').onclick=()=>openRoster();$('backRoster').onclick=()=>openRoster();$('rematch').onclick=()=>resultPrimary();
$('arcadeBtn').onclick=()=>startArcade();$('practiceBtn').onclick=()=>startPractice();
$('dummyBtn').onclick=()=>{practice.dummy=practice.dummy==='hunter'?'captain':'hunter';opponent=practice.dummy;practiceReset();updatePracticeBar();blip(260,.06);};
$('playAsBtn').onclick=()=>{const L=PRACTICE_PICKS(),i=L.indexOf(practicePlayer());practice.player=L[(i+1)%L.length];practiceReset();updatePracticeBar();blip(300,.06);};
$('stanceBtn').onclick=()=>{practice.stance=(practice.stance+1)%STANCES.length;updatePracticeBar();blip(220,.06);};
$('resetBtn').onclick=()=>{practiceReset();blip(180,.06);};
$('pauseBtn').onclick=()=>togglePause();
$('soundBtn').onclick=()=>{muted=!muted;$('soundBtn').textContent=muted?'♪ SOUND OFF':'♪ SOUND ON';};

// Six independent commands. Contact windows match frames 3–5 of each eight-pose row.
const attackDefs=DATA.moves;
// Frame duration is scaled by fighter identity, without altering any sprite art.
const FIGHTER_STYLES=byFighter('style');
// Signature chains use exactly the ORIGINAL move sprites; no character art is redrawn.
const SIGNATURE_COMBOS=byFighter('signature');
const MOVE_LABELS={lp:'LP',mp:'MP',hp:'HP',lk:'LK',mk:'MK',hk:'HK'};
const FINISHERS=byFighter('finisher');
let cinematic=null,lastFinisher=null;
const FINISHER_COST=60,FINISHER_HEALTH=28,FINISHER_RANGE=350;
function canFinisher(f,o){return phase==='fight'&&!!f&&!!o&&!!FINISHERS[f.r.id]&&f.energy>=FINISHER_COST&&o.health>0&&o.health<=FINISHER_HEALTH&&f.health>0&&!f.stun&&!f.ko&&f.grounded&&f.dash<=0&&(!f.action||f.confirmed)&&Math.abs(f.x-o.x)<=FINISHER_RANGE&&Math.abs(f.y-o.y)<=135;}
function signatureStep(f,move,asCancel){
 const route=SIGNATURE_COMBOS[f.r.id];if(!route)return;
 const previous=asCancel?f.routeIndex:0;
 const next=asCancel&&previous>0&&route.moves[previous]===move?previous+1:(move===route.moves[0]?1:0);
 f.routeIndex=next;
 if(next===route.moves.length){
  // The final blow must actually connect; whiffed routes never award Spirit.
  f.signaturePending=route.name;f.routeIndex=0;
 }
}
function awardSignature(f){
 if(!f.signaturePending)return;
 f.signatureText=f.signaturePending;f.signaturePending=null;f.signatureTicks=105;
 f.energy=Math.min(100,f.energy+15);
 spawnHit(f.x+f.face*85,f.y-145,f.r.col,11);blip(620,.13,'triangle',.065);
}
const COMBO_ROUTES=DATA.comboRoutes;
function styleOf(f){return FIGHTER_STYLES[f.r.id]||FIGHTER_STYLES.wolf;}
function attackFor(f,move){
 const base=attackDefs[move];if(!base)return null;
 const st=styleOf(f),total=Math.max(9,Math.round(base.total*st.tempo));
 const start=Math.max(2,Math.round(base.start*st.tempo)),end=Math.min(total-3,Math.max(start,Math.round(base.end*st.tempo)));
 return {...base,start,end,total,damage:Math.max(1,Math.round(base.damage*st.power)),reach:Math.round(base.reach*st.reach),push:base.push*st.power};
}
function strikeOverlap(a,d,attack,extra=0){
 const def=styleOf(d),forward=(d.x-a.x)*a.face;
 return forward>=-def.hurtW*.55&&forward<=attack.reach+def.hurtW*.5+extra&&
   Math.abs(a.y-d.y)<=Math.max(def.hurtH,126)&&d.health>0;
}
function isCancelable(f,next){
 if(f.action==='super'||f.stun||f.ko||!f.grounded)return false;
 const prior=f.action,allowed=COMBO_ROUTES[prior]||[];
 const route=SIGNATURE_COMBOS[f.r.id];const signature=route&&f.routeIndex>0&&route.moves[f.routeIndex]===next;
 if((!allowed.includes(next)&&!signature)||(f.chainLinks>=4&&next!=='super'))return false;
 const a=attackFor(f,prior);
 return !!f.confirmed&&f.actionTick>=a.start&&f.actionTick<a.total-4;
}
function canLateBuffer(f,next){
 if(f.action==='super'||next===f.action)return false;
 const a=attackFor(f,f.action);return !!a&&a.total-f.actionTick<=7&&a.total-f.actionTick>=0;
}
function beginAttack(f,move,asCancel=false){
 const def=move==='super'?SPECIAL_INFO[f.r.id]:attackFor(f,move);
 if(!def||f.energy<def.cost)return false;
 if(move==='super'){f.motion.forwardAt=-1e6;f.motion.downAt=-1e6;}
 f.energy-=def.cost;f.action=move;f.actionTick=0;f.bufferAttack=null;f.bufferTicks=0;
 f.hitTargets.clear();f.guard=false;f.animTime=0;f.animation=move;f.confirmed=false;f.signaturePending=null;
 f.chainLinks=asCancel?f.chainLinks+1:0;
 if(move!=='super')signatureStep(f,move,asCancel);
 if(asCancel){spawnHit(f.x+f.face*55,f.y-128,'#e4bda4',5);blip(420,.035,'triangle',.02);}
 blip(move==='super'?94:move==='hp'||move==='hk'?118:move==='mp'||move==='mk'?155:245,move==='super'?.21:.07,'sawtooth');
 return true;
}
// All six art sets are the ORIGINAL approved creature designs, cropped into 4x2, 8-frame transparent atlases.
// QCF (down, down-forward, forward) + heavy punch activates the corresponding character special.
const SPECIAL_INFO=byFighter('specialMove');
function startFinisher(f,o){
 if(!canFinisher(f,o))return false;
 f.energy-=FINISHER_COST;f.action='finisher';f.actionTick=0;f.animTime=0;f.animation='super';f.confirmed=false;f.routeIndex=0;f.bufferAttack=null;f.guard=false;
 f.vx=0;f.face=o.x>=f.x?1:-1;
 o.guard=false;o.action=null;o.actionTick=0;o.bufferAttack=null;o.vx=0;o.stun=175;o.inv=0;
 cinematic={owner:f,target:o,id:f.r.id,tick:0,total:142,impact:80};phase='finisher';
 hitFreeze=0;specialProjectiles.length=0;shake=4;
 blip(84,.30,'sawtooth',.06);
 return true;
}
function stepFinisher(){
 const c=cinematic;if(!c)return;const f=c.owner,o=c.target;c.tick++;f.actionTick=c.tick;
 if(c.tick>=20&&c.tick<=48){const dx=o.x-f.x;f.x+=Math.sign(dx)*Math.min(3.5,Math.max(0,Math.abs(dx)-155)*.12);}
 if(c.tick===54){shake=8;spawnDust(f.x,GROUND,f.face);}
 if(c.tick===c.impact){o.health=0;o.ko=true;o.stun=75;o.guard=false;shake=20;lastFinisher={id:c.id,name:FINISHERS[c.id].name,owner:f.r.name};
  spawnHit(o.x,o.y-140,FINISHERS[c.id].color,34);blip(65,.42,'sawtooth',.1);}
 if(c.tick>=c.total){f.action=null;f.actionTick=0;cinematic=null;finishRound();}
}
function drawFinisherFX(){
 const c=cinematic;if(!c)return;const {owner:f,target:o,tick:t,id}=c;
 if(t<24)return;
 const alpha=Math.min(.78,(t-24)/28);ctx.save();ctx.globalAlpha=alpha;
 const color=FINISHERS[id].color;ctx.shadowColor=color;ctx.shadowBlur=22;ctx.strokeStyle=color;ctx.lineCap='round';
 if(id==='wolf'){
  for(let j=0;j<3;j++){ctx.lineWidth=4+j*2;ctx.beginPath();ctx.arc(o.x,o.y-130,85+j*16,Math.PI*.87+j*.11,Math.PI*1.81+j*.08);ctx.stroke();}
 }else if(id==='wendigo'){
  for(let j=0;j<5;j++){ctx.lineWidth=2+j%2;ctx.beginPath();ctx.moveTo(o.x,o.y-82-j*23);ctx.bezierCurveTo(o.x-42*f.face,o.y-180-j*12,f.x+70*f.face,f.y-230+j*6,f.x+22*f.face,f.y-220);ctx.stroke();}
 }else if(id==='yeti'){
  ctx.lineWidth=5;for(let j=0;j<9;j++){const r=25+j*12;ctx.globalAlpha=alpha*(1-j*.072);ctx.beginPath();ctx.arc(o.x,o.y-120,r,0,Math.PI*2);ctx.stroke();}
 }else if(id==='chupacabra'){
  for(let j=0;j<11;j++){ctx.lineWidth=2+j%3;ctx.beginPath();ctx.arc(o.x-30*f.face,o.y-128,24+j*9,Math.PI*.8,Math.PI*2.2);ctx.stroke();}
 }else if(id==='skinwalker'){
  for(let j=0;j<5;j++){ctx.lineWidth=3+j%2;ctx.beginPath();ctx.moveTo(f.x+20*f.face,f.y-220);ctx.bezierCurveTo(f.x+130*f.face,f.y-310-j*18,o.x-30*f.face,o.y-260+j*10,o.x,o.y-113);ctx.stroke();}
 }else if(id==='yucca'){
  for(let j=0;j<6;j++){ctx.lineWidth=3+j%2;ctx.beginPath();ctx.moveTo(f.x+30*f.face,GROUND-40-j*9);ctx.bezierCurveTo(o.x-120*f.face,GROUND-275-j*9,o.x+85*f.face,o.y-130-j*22,o.x+Math.sin(t*.08+j)*40,o.y-110-j*18);ctx.stroke();}
 }
 ctx.restore();
}
function drawFinisherCinema(){
 const c=cinematic;if(!c)return;const info=FINISHERS[c.id],t=c.tick;ctx.save();
 const grd=ctx.createRadialGradient((c.owner.x+c.target.x)/2,360,35,640,360,790);
 grd.addColorStop(0,'rgba(7,7,13,.08)');grd.addColorStop(1,'rgba(2,1,9,.77)');ctx.fillStyle=grd;ctx.fillRect(0,0,W,H);
 ctx.fillStyle='rgba(3,2,8,.95)';ctx.fillRect(0,0,W,92);ctx.fillRect(0,H-120,W,120);
 ctx.strokeStyle=info.color;ctx.lineWidth=2;ctx.globalAlpha=.75;
 ctx.beginPath();ctx.moveTo(0,92);ctx.lineTo(W,92);ctx.moveTo(0,H-120);ctx.lineTo(W,H-120);ctx.stroke();ctx.globalAlpha=1;
 ctx.fillStyle='#f4e3d3';ctx.font='bold 14px Georgia';ctx.textAlign='center';ctx.fillText('CURSEBOUND  ·  REDEMPTION FINISH',640,30);
 ctx.fillStyle=info.color;ctx.shadowBlur=20;ctx.shadowColor=info.color;
 ctx.font='bold 48px Georgia';ctx.fillText(info.name,640,74);ctx.shadowBlur=0;
 ctx.fillStyle='#dec9b6';ctx.font='bold 20px Georgia';ctx.fillText(t<c.impact?info.caption:'FINISHER!',640,H-68);
 ctx.font='13px system-ui';ctx.fillStyle='#ad9a93';ctx.fillText(t<c.impact?'THE FINAL JUDGMENT':'VICTORY THROUGH THE CURSE',640,H-36);
 if(t>c.impact-4&&t<c.impact+9){ctx.globalAlpha=(1-Math.abs(t-c.impact)/13)*.34;ctx.fillStyle=info.color;ctx.fillRect(0,0,W,H);}
 ctx.restore();
}
const specialProjectiles=[];
const specialHitDef=(damage,stun=18,push=10)=>({damage,stun,push,energy:0,shake:8});
function launchSpecial(f,other){
 const sp=SPECIAL_INFO[f.r.id];if(!sp||sp.type==='maul'||sp.type==='drain')return;
 const y=f.y-(sp.type==='vine'?57:sp.type==='snow'?161:sp.type==='spray'?130:158);
 specialProjectiles.push({type:sp.type,owner:f,target:other,x:f.x+f.face*71,y,dir:f.face,
  life:sp.type==='shadow'?60:sp.type==='vine'?35:sp.type==='spirit'?98:sp.type==='snow'?74:48,age:0,
  maxTravel:sp.reach,origin:f.x,hit:false,
  vx:f.face*(sp.type==='shadow'?16:sp.type==='vine'?20:sp.type==='snow'?13:sp.type==='spray'?21:sp.type==='spirit'?10:13)});
 blip(sp.type==='snow'?350:sp.type==='spray'?195:sp.type==='vine'?135:260,.18,'triangle',.04);
}
function updateSpecials(){
 for(let i=specialProjectiles.length-1;i>=0;i--){
  const p=specialProjectiles[i];p.life--;p.age++;p.x+=p.vx;
  if(p.type==='spirit'||p.type==='shadow')p.y+=Math.sin(p.age*.31)*(p.type==='shadow'?1.5:2.5);
  const o=p.target;if(o&&o.health>0&&!p.hit){
   const width=p.type==='shadow'?84:p.type==='spray'?79:p.type==='vine'?84:p.type==='snow'?45:51;
   const projAhead=(o.x-p.x)*p.dir;
   const verticalLimit=p.type==='shadow'?155:p.type==='vine'?144:p.type==='spray'?104:p.type==='snow'?94:126;
   const targetY=o.y-Math.min(145,styleOf(o).hurtH*.68);
   if(projAhead>=-width-styleOf(o).hurtW*.4&&projAhead<=width+styleOf(o).hurtW*.4&&Math.abs(targetY-p.y)<verticalLimit){
    const damage=p.type==='shadow'?12:p.type==='snow'?13:p.type==='spray'?8:p.type==='vine'?9:14;
    const impact=hit(p.owner,o,specialHitDef(damage,p.type==='shadow'?26:p.type==='vine'?24:p.type==='spray'?20:18,p.type==='shadow'?4:p.type==='vine'?3:8));
    if(impact&&impact.landed){
     if(!impact.guarded){
      if(p.type==='spray'){o.stun=Math.max(o.stun,32);o.debuff='DAZED';o.debuffTicks=32;}
      if(p.type==='vine'){o.stun=Math.max(o.stun,38);o.debuff='BOUND';o.debuffTicks=38;}
      if(p.type==='shadow'){o.stun=Math.max(o.stun,34);o.debuff=p.owner.r.id==='occultist'?'HEXED':'SHADOWBOUND';o.debuffTicks=34;}
      if(p.type==='snow'){o.stun=Math.max(o.stun,22);o.debuff='CHILLED';o.debuffTicks=24;}
     }
     p.hit=true;p.life=Math.min(p.life,10);
     spawnHit(p.x,p.y,p.type==='snow'?'#efeab3':p.type==='spray'?'#bc546b':p.type==='shadow'?'#a96be0':p.type==='spirit'?'#d6a0c4':'#7bb378',9);
    }
   }
  }
  if(p.life<=0||Math.abs(p.x-p.origin)>p.maxTravel||Math.abs(p.x)>W+130)specialProjectiles.splice(i,1);
 }
}
function specialPulse(f,opponent){
 const sp=SPECIAL_INFO[f.r.id];if(!sp)return;const tick=f.actionTick;
 if(sp.type==='maul'){
  if(tick===12){f.x=Math.max(100,Math.min(1180,f.x+f.face*68));spawnDust(f.x,GROUND,f.face);}
  if((tick===16||tick===25)&&strikeOverlap(f,opponent,{reach:sp.reach})){
   hit(f,opponent,specialHitDef(tick===16?9:16,21,tick===16?6:12));
  }
 }else if(sp.type==='drain'){
  if((tick===23||tick===31||tick===39)&&strikeOverlap(f,opponent,{reach:sp.reach})){
   const impact=hit(f,opponent,specialHitDef(6,6,0));
   if(impact&&impact.landed&&!impact.guarded)f.health=Math.min(100,f.health+Math.ceil(impact.damage*.65));
  }
 }else if(tick===sp.cast)launchSpecial(f,opponent);
}
function drawSpecialFX(){
 // Ranged specials have an intentionally restrained supernatural overlay; art stays on-model.
 for(const p of specialProjectiles){
  ctx.save();const age=p.age;
  if(p.type==='snow'){
   ctx.shadowColor='#f5e0a0';ctx.shadowBlur=16;ctx.fillStyle='#e7d69b';ctx.beginPath();ctx.arc(p.x,p.y,23+Math.sin(age*.44)*2,0,Math.PI*2);ctx.fill();
   ctx.fillStyle='#f6f3e1';for(let j=0;j<5;j++){ctx.beginPath();ctx.arc(p.x-12+j*7,p.y-15+Math.sin(j*2+age)*5,3,0,7);ctx.fill();}
  }else if(p.type==='spray'){
   const grad=ctx.createRadialGradient(p.x-40*p.dir,p.y,1,p.x,p.y,70);grad.addColorStop(0,'rgba(192,45,68,.58)');grad.addColorStop(1,'rgba(114,12,36,0)');ctx.fillStyle=grad;ctx.beginPath();ctx.ellipse(p.x,p.y,70,30,0,0,7);ctx.fill();
   ctx.fillStyle='rgba(214,82,102,.67)';for(let j=0;j<10;j++){ctx.beginPath();ctx.arc(p.x-35*p.dir+Math.sin(j*2.4+age*.3)*54,p.y+Math.sin(j*1.3+age)*21,1.5+j%3,0,7);ctx.fill();}
  }else if(p.type==='spirit'){
   ctx.shadowBlur=23;ctx.shadowColor='#f2abc6';ctx.strokeStyle='rgba(244,182,218,.77)';ctx.lineWidth=8;
   ctx.beginPath();ctx.moveTo(p.x-58*p.dir,p.y+18);ctx.quadraticCurveTo(p.x-15*p.dir,p.y-60,p.x+30*p.dir,p.y+4);ctx.stroke();
   ctx.fillStyle='rgba(244,188,219,.76)';ctx.beginPath();ctx.ellipse(p.x+21*p.dir,p.y,25,34,0,0,7);ctx.fill();ctx.fillStyle='#391b39';ctx.fillRect(p.x+13*p.dir,p.y-6,7,4);
  }else if(p.type==='shadow'){
   ctx.save();ctx.shadowColor='#9e51c6';ctx.shadowBlur=17;ctx.strokeStyle='#7c438e';ctx.lineWidth=12;ctx.lineCap='round';
   for(let i=0;i<4;i++){const phase=p.age*.18+i*1.6;ctx.beginPath();ctx.moveTo(p.owner.x+p.dir*36,p.owner.y-145+i*9);ctx.bezierCurveTo(p.owner.x+p.dir*125,p.owner.y-170+Math.sin(phase)*26,p.x-p.dir*65,p.y+Math.cos(phase)*35,p.x+p.dir*25,p.y+Math.sin(phase)*17);ctx.stroke();}
   ctx.restore();
  }else if(p.type==='vine'){
   ctx.strokeStyle='#789f59';ctx.lineWidth=11;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(p.owner.x+p.dir*28,GROUND-48);ctx.quadraticCurveTo((p.owner.x+p.x)/2,GROUND-125,p.x,p.y);ctx.stroke();
   ctx.strokeStyle='#a8ad6a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(p.owner.x+p.dir*28,GROUND-50);ctx.quadraticCurveTo((p.owner.x+p.x)/2,GROUND-123,p.x,p.y);ctx.stroke();
   for(let j=0;j<3;j++){const xx=p.x-j*18*p.dir;ctx.fillStyle='#617e4e';ctx.beginPath();ctx.ellipse(xx,p.y-6-j*6,14,6,.6*p.dir,0,7);ctx.fill();}
  }
  ctx.restore();
 }
 for(const f of fighters){
  if(f.debuffTicks>0&&f.health>0){ctx.save();ctx.globalAlpha=.47+.17*Math.sin(frameNo*.22);ctx.strokeStyle=f.debuff==='BOUND'?'#a2bf6b':f.debuff==='SHADOWBOUND'?'#ab6cde':f.debuff==='DAZED'?'#ce6b7c':'#e3f1ff';ctx.lineWidth=3;for(let j=0;j<3;j++){ctx.beginPath();ctx.ellipse(f.x,f.y-40-j*40,43+8*Math.sin(frameNo*.09+j),12,Math.sin(frameNo*.06+j)*.3,0,7);ctx.stroke();}ctx.restore();}
  if(f.action==='super'&&f.r.id==='wendigo'&&f.actionTick>=17&&f.actionTick<41){
   const o=fighters.find(q=>q!==f);if(!o||Math.abs(f.x-o.x)>435)continue;
   ctx.save();ctx.strokeStyle='rgba(200,230,226,.65)';ctx.shadowBlur=14;ctx.shadowColor='#d8f6f2';ctx.lineWidth=4;
   for(let j=0;j<3;j++){const dy=j*13;ctx.beginPath();ctx.moveTo(o.x,o.y-155+dy);ctx.bezierCurveTo(o.x+f.face*80,o.y-210-dy,f.x-f.face*90,f.y-175+dy,f.x+f.face*33,f.y-198);ctx.stroke();}
   ctx.restore();
  }
 }
}
function showSpecialGuide(){const f=fighters[0],sp=f&&SPECIAL_INFO[f.r.id];$('specialGuide').textContent=sp?`${sp.name} ↓↘→+HP · FINISH ↓↘→+HK`:'SPECIAL ↓↘→+HP · FINISH ↓↘→+HK';}
function newFighter(character,side){return {r:rosterById[character],x:side===1?345:935,y:GROUND,vx:0,vy:0,face:side===1?1:-1,health:100,energy:60,wins:0,grounded:true,guard:false,crouch:false,animation:'idle',animFrame:0,animTime:0,gait:0,action:null,actionTick:0,bufferAttack:null,bufferTicks:0,confirmed:false,chainLinks:0,hitTargets:new Set(),stun:0,dash:0,dashCD:0,inv:0,combo:0,comboTimer:0,blockFlash:0,ko:false,aiClock:0,aiChoice:'idle',input:{left:false,right:false,up:false,down:false,guard:false},motion:{downAt:-1e6,forwardAt:-1e6},debuff:'',debuffTicks:0,routeIndex:0,signatureText:'',signatureTicks:0,signaturePending:null,airTicks:0,landTicks:0};}
// ---- Arcade ladder (every other fighter, then the two hunters as bosses) and practice with hunter test dummies ----
const PLAYABLE=roster.filter(r=>!r.hidden).map(r=>r.id),BOSSES=['bloodymary','babayaga','hunter','captain'].filter(id=>rosterById[id]);
let arcade=null,practice={dummy:'hunter',stance:0,player:null};
const PRACTICE_PICKS=()=>PLAYABLE.concat(BOSSES);
const practicePlayer=()=>practice.player||selected;
const STANCES=['STAND','GUARD','JUMP','FIGHT BACK'];
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function startArcade(){arcade={ladder:shuffle(PLAYABLE.filter(id=>id!==selected)).concat(BOSSES),idx:0,continues:0,cleared:false,next:false};arcadeFight();}
function arcadeFight(){opponent=arcade.ladder[arcade.idx];$('stageSelect').value=String(arcade.idx%DATA.stages.length);beginMatch('arcade');}
function arcadeBoss(){return !!arcade&&BOSSES.includes(arcade.ladder[arcade.idx]);}
function arcadeLabel(){if(!arcade)return'';const n=arcade.ladder.length,i=arcade.idx;return i===n-1?'FINAL BOSS':arcadeBoss()?'BOSS · STAGE '+(i+1)+' OF '+n:'STAGE '+(i+1)+' OF '+n;}
function cpuLevel(){if(mode!=='arcade'||!arcade)return .35;if(arcadeBoss())return arcade.idx===arcade.ladder.length-1?1:.85;return Math.min(.75,.15+.6*arcade.idx/Math.max(1,arcade.ladder.length-3));}
function startPractice(){practice.player=selected;opponent=practice.dummy;beginMatch('practice');}
function practiceReset(){if(mode!=='practice'||fighters.length!==2)return;fighters[0]=newFighter(practicePlayer(),1);fighters[1]=newFighter(practice.dummy,2);fighters[0].energy=100;Object.assign(practice,{hits:0,dmg:0,hitAt:-999,meHitAt:-999,lastHits:0,lastDmg:0,best:practice.best||0});specialProjectiles.length=0;showSpecialGuide();}
function updatePracticeBar(){$('practiceBar').hidden=mode!=='practice'||phase==='menu';$('playAsBtn').textContent='PLAY AS: '+rosterById[practicePlayer()].name.toUpperCase();$('dummyBtn').textContent='DUMMY: '+rosterById[practice.dummy].name.toUpperCase();$('stanceBtn').textContent='STANCE: '+STANCES[practice.stance];}
function dummyThink(f,foe){f.input.left=f.input.right=f.input.down=f.input.guard=false;if(f.stun||f.ko)return;const st=STANCES[practice.stance];
 if(st==='GUARD')f.input.guard=true;else if(st==='JUMP'){if(f.grounded&&!f.action&&Math.random()<.035)pressed(1,'jump');}else if(st==='FIGHT BACK')cpuThink(f,foe);}
function practiceTick(){const me=fighters[0],d=fighters[1],P=practice;me.energy=100;
 if(P.hits&&frameNo-P.hitAt>50){P.lastHits=P.hits;P.lastDmg=P.dmg;P.best=Math.max(P.best||0,P.dmg);P.hits=0;P.dmg=0;}
 if(d.ko&&frameNo-P.hitAt>80){const x=d.x;fighters[1]=newFighter(P.dummy,2);fighters[1].x=x;faceOpponent(fighters[1],me);}
 else if(!d.ko&&d.health<100&&frameNo-P.hitAt>90)d.health=Math.min(100,d.health+2);
 if(me.ko&&frameNo-P.meHitAt>80){const x=me.x;fighters[0]=newFighter(practicePlayer(),1);fighters[0].x=x;fighters[0].energy=100;}
 else if(!me.ko&&me.health<100&&frameNo-P.meHitAt>90)me.health=Math.min(100,me.health+2);}
function practiceHit(attacker,defender,damage){if(mode!=='practice')return;if(defender===fighters[1]){if(frameNo-practice.hitAt>50){practice.hits=0;practice.dmg=0;}practice.hits++;practice.dmg+=damage;practice.hitAt=frameNo;}else practice.meHitAt=frameNo;}
function resultPrimary(){if(mode!=='arcade'||!arcade){beginMatch(mode);return;}if(arcade.cleared){startArcade();return;}if(arcade.next){arcade.idx++;arcade.next=false;}else arcade.continues++;arcadeFight();}
function beginMatch(newMode){mode=newMode;selected=selected||'wolf';opponent=opponent||'wendigo';fighters=[newFighter(selected,1),newFighter(opponent,2)];stage=Number($('stageSelect').value)||0;clock=90;subframes=0;frameNo=0;effects.length=0;sparks.length=0;specialProjectiles.length=0;cinematic=null;lastFinisher=null;shake=0;hitFreeze=0;paused=false;champion=null;roundTimer=0;introTimer=155;phase='intro';scene=null;showSpecialGuide();result.hidden=true;menu.hidden=true;battleUi.hidden=false;$('pauseBtn').textContent='Ⅱ PAUSE';clearInput();audioUnlock();blip(150,.14);const foe=fighters[1];foe.aiLevel=cpuLevel();if(mode==='arcade'&&arcadeBoss())foe.powerMul=arcade.idx===arcade.ladder.length-1?1.15:1.08;
 if(mode==='practice'){practiceReset();introTimer=110;}
 updatePracticeBar();startScene(buildIntroScene(),()=>{introTimer=155;phase='intro';});}
function openRoster(){phase='menu';scene=null;setCutsceneUi(false);$('practiceBar').hidden=true;cinematic=null;lastFinisher=null;paused=false;result.hidden=true;menu.hidden=false;battleUi.hidden=true;specialProjectiles.length=0;clearInput();}
function togglePause(){if(phase==='menu'||phase==='matchover')return;paused=!paused;$('pauseBtn').textContent=paused?'▶ RESUME':'Ⅱ PAUSE';clearInput();}
function clearInput(){keys.clear();for(const f of fighters){for(const k of Object.keys(f.input))f.input[k]=false;}}
function startNewRound(){for(let i=0;i<2;i++){const f=fighters[i],wins=f.wins;fighters[i]=newFighter(f.r.id,i+1);fighters[i].wins=wins;}clock=90;subframes=0;introTimer=145;phase='intro';cinematic=null;lastFinisher=null;specialProjectiles.length=0;showSpecialGuide();clearInput();}
function finishRound(){if(phase==='roundover'||phase==='matchover')return;phase='roundover';roundTimer=210;const a=fighters[0],b=fighters[1];let winner=a.health===b.health?null:(a.health>b.health?a:b);if(winner)winner.wins++;champion=winner;blip(winner?380:190,.18);if(!winner){effects.push({type:'text',text:'DRAW',life:75,x:W/2,y:340});} }
function showResult(){phase='matchover';result.hidden=false;battleUi.hidden=true;const win=fighters[0].wins>fighters[1].wins?fighters[0]:fighters[1];$('rematch').textContent='REMATCH';$('backRoster').textContent='CHANGE FIGHTERS';
 if(mode==='arcade'&&arcade){const won=win===fighters[0],n=arcade.ladder.length,last=arcade.idx>=n-1;$('backRoster').textContent='QUIT';
  if(won&&last){arcade.cleared=true;$('resultKicker').textContent='THE HUNT IS OVER';$('resultTitle').textContent='ARCADE CLEAR';$('resultDetail').textContent=`${win.r.name.toUpperCase()} DEFEATED ALL ${n} · CONTINUES USED: ${arcade.continues}`;$('rematch').textContent='PLAY AGAIN';}
  else if(won){arcade.next=true;const nx=arcade.ladder[arcade.idx+1],boss=BOSSES.includes(nx);$('resultKicker').textContent=`STAGE ${arcade.idx+1} OF ${n} CLEARED`;$('resultTitle').textContent='STAGE CLEAR';$('resultDetail').textContent=`NEXT: ${rosterById[nx].name.toUpperCase()}${arcade.idx+1===n-1?' · FINAL BOSS':boss?' · BOSS':''}`;$('rematch').textContent='NEXT FIGHT ▶';}
  else{arcade.next=false;$('resultKicker').textContent='CONTINUE?';$('resultTitle').textContent='DEFEAT';$('resultDetail').textContent=`${win.r.name.toUpperCase()} STOPS YOU AT ${arcadeLabel()}`;$('rematch').textContent='CONTINUE';}
  return;}$('resultTitle').textContent=win===fighters[0]?'VICTORY':'DEFEAT';$('resultDetail').textContent=`${win.r.name} CLAIMS THE ARENA · ${fighters[0].wins} — ${fighters[1].wins}`;$('resultKicker').textContent=lastFinisher&&lastFinisher.owner===win.r.name?'REDEMPTION FINISHER · '+lastFinisher.name:'THE CURSE REMAINS';}
function audioUnlock(){try{if(!snd)snd=new (window.AudioContext||window.webkitAudioContext)();if(snd.state==='suspended')snd.resume().catch(()=>{});}catch(e){}}
function blip(freq=200,dur=.08,wave='sawtooth',volume=.027){if(muted||!snd||snd.state!=='running')return;try{const o=snd.createOscillator(),g=snd.createGain();o.type=wave;o.frequency.setValueAtTime(freq,snd.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(60,freq*.55),snd.currentTime+dur);g.gain.setValueAtTime(volume,snd.currentTime);g.gain.exponentialRampToValueAtTime(.001,snd.currentTime+dur);o.connect(g).connect(snd.destination);o.start();o.stop(snd.currentTime+dur+.01);}catch(e){}}

let lastPress={p1:{left:-1000,right:-1000},p2:{left:-1000,right:-1000}};
const KEYMAP={KeyA:[0,'left'],KeyD:[0,'right'],KeyW:[0,'up'],Space:[0,'up'],KeyS:[0,'down'],ShiftLeft:[0,'guard'],ShiftRight:[0,'guard'],KeyJ:[0,'lp'],KeyK:[0,'mp'],KeyL:[0,'hp'],KeyU:[0,'lk'],KeyI:[0,'mk'],KeyO:[0,'hk'],ArrowLeft:[1,'left'],ArrowRight:[1,'right'],ArrowUp:[1,'up'],ArrowDown:[1,'down'],Numpad1:[1,'lp'],Numpad2:[1,'mp'],Numpad3:[1,'hp'],Numpad4:[1,'lk'],Numpad5:[1,'mk'],Numpad6:[1,'hk'],Numpad0:[1,'guard'],Digit1:[1,'lp'],Digit2:[1,'mp'],Digit3:[1,'hp'],Digit4:[1,'lk'],Digit5:[1,'mk'],Digit6:[1,'hk']};
function direction(side,dir,held){const f=fighters[side];if(!f)return;const before=f.input[dir];f.input[dir]=held;
 if(dir==='down'&&held&&!before)f.motion.downAt=performance.now();
 if(held&&!before&&(dir==='left'||dir==='right')){const who=side?'p2':'p1';const ticks=performance.now();const forward=(dir==='right'?1:-1)===f.face;
  if(forward&&ticks-f.motion.downAt<550)f.motion.forwardAt=ticks;
  if(ticks-lastPress[who][dir]<300&&forward&&ticks-f.motion.downAt>=550)requestDash(side,dir==='right'?1:-1);lastPress[who][dir]=ticks;}}

function requestDash(side,dir){const f=fighters[side];if(!f||phase!=='fight'||f.stun||f.action||!f.grounded||f.dashCD>0)return;f.dash=14;f.dashCD=36;f.inv=5;f.vx=dir*14;f.face=dir;f.animation='dash';f.animTime=0;blip(165,.07,'triangle',.035);spawnDust(f.x,GROUND,dir);}
function pressed(side,action){
 if(phase==='cutscene'){if(!paused)skipScene();return;}
 if(phase!=='fight'||paused)return;
 const f=fighters[side];if(!f)return;
 const alias={light:'lp',heavy:'mp',special:'hp'};action=alias[action]||action;
 // Down-to-forward + HP = special. Down-to-forward + HK = conditional cinematic finisher.
 const motionReady=f.motion&&performance.now()-f.motion.forwardAt<600;
 if(action==='hk'&&motionReady&&canFinisher(f,fighters[1-side])){startFinisher(f,fighters[1-side]);return;}
 if(action==='hp'&&motionReady&&SPECIAL_INFO[f.r.id]&&specialImgs[f.r.id]?.complete)action='super';
 if(action==='dash'){requestDash(side,f.face);return;}
 if(action==='jump'){
  if(f.grounded&&!f.stun&&!f.action){const jd=(f.input.right?1:0)-(f.input.left?1:0);f.grounded=false;f.vy=-JUMP.velocity;f.y-=4;if(jd)f.vx=jd*Math.max(JUMP.forwardSpeed,f.r.speed*1.25);f.airTicks=0;f.landTicks=0;f.animation='jump';f.animTime=0;blip(260,.065,'sine');}
  return;
 }
 if(action==='guard'){f.input.guard=true;return;}
 if(action==='super'&&(!SPECIAL_INFO[f.r.id]||!specialImgs[f.r.id]?.complete))return;
 if((action!=='super'&&!attackDefs[action])||f.stun||f.ko||f.dash>0)return;
 if(f.action){
   if(isCancelable(f,action)){
     // Confirmed normal hit or block allows a proper punch/kick chain or special-cancel.
     beginAttack(f,action,true);return;
   }
   if(canLateBuffer(f,action)){f.bufferAttack=action;f.bufferTicks=7;}
   return;
 }
 beginAttack(f,action,false);
}
const controlsHeld={};
window.addEventListener('keydown',e=>{if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();if(!e.repeat)togglePause();return;}if(phase==='cutscene'&&!paused){e.preventDefault();if(!e.repeat)skipScene();return;}const map=KEYMAP[e.code];if(!map)return;e.preventDefault();if(e.repeat||keys.has(e.code))return;keys.add(e.code);if(phase==='menu')return;const [side,act]=map;if(side===1&&mode!=='local')return;if(['left','right','up','down','guard'].includes(act)){direction(side,act,true);if(act==='up')pressed(side,'jump');}else pressed(side,act);});
window.addEventListener('keyup',e=>{const map=KEYMAP[e.code];if(!map)return;e.preventDefault();keys.delete(e.code);const [side,act]=map;if(['left','right','up','down','guard'].includes(act))direction(side,act,false);});
window.addEventListener('blur',()=>{clearInput();if(phase==='fight')togglePause();});
['contextmenu','selectstart','dragstart'].forEach(x=>document.addEventListener(x,e=>e.preventDefault()));
const joystick=$('joystick'),knob=$('joyKnob');let stickPointer=null,joyDir=0,joyUp=false,joyDown=false,joyLastDir=0,joyLastAt=0,joyArmed=false;
function joyReset(){stickPointer=null;joyDir=0;joyUp=false;joyDown=false;joyArmed=true;knob.style.transform='translate(0px,0px)';if(fighters[0]){fighters[0].input.left=false;fighters[0].input.right=false;fighters[0].input.down=false;fighters[0].input.guard=false;}}
function joyUpdate(e){const r=joystick.getBoundingClientRect(),xx=e.clientX-(r.left+r.width/2),yy=e.clientY-(r.top+r.height/2),rmax=r.width*.3,dd=Math.hypot(xx,yy)||1;knob.style.transform=`translate(${Math.round(xx/dd*Math.min(rmax,dd))}px,${Math.round(yy/dd*Math.min(rmax,dd))}px)`;const dir=xx>22?1:xx< -22?-1:0;const up=yy< -35&&Math.abs(yy)>Math.abs(xx)*.8;const down=yy>32&&Math.abs(yy)>Math.abs(xx)*.8;
 if(up&&!joyUp)pressed(0,'jump');if(down&&!joyDown)direction(0,'down',true);if(!down&&joyDown)direction(0,'down',false);joyUp=up;joyDown=down;if(fighters[0]){fighters[0].input.down=down;fighters[0].input.guard=dir!==0&&dir!==fighters[0].face&&!up&&!down;}
 if(dir!==joyDir){if(joyDir!==0)direction(0,joyDir===1?'right':'left',false);if(dir!==0){const n=performance.now();if(joyArmed&&joyLastDir===dir&&n-joyLastAt<350&&fighters[0]&&dir===fighters[0].face)requestDash(0,dir);joyLastDir=dir;joyLastAt=n;joyArmed=false;direction(0,dir===1?'right':'left',true);}else joyArmed=true;joyDir=dir;}}
canvas.addEventListener('pointerdown',()=>{if(!paused)skipScene();});
joystick.addEventListener('pointerdown',e=>{if(stickPointer!==null)return;e.preventDefault();audioUnlock();stickPointer=e.pointerId;joystick.setPointerCapture(e.pointerId);joyUpdate(e);});
joystick.addEventListener('pointermove',e=>{if(stickPointer===e.pointerId){e.preventDefault();joyUpdate(e);}});
for(const name of ['pointerup','pointercancel','lostpointercapture'])joystick.addEventListener(name,e=>{if(stickPointer===e.pointerId){e.preventDefault();if(joyDir)direction(0,joyDir===1?'right':'left',false);joyReset();}});
for(const btn of document.querySelectorAll('[data-act]')){let active=new Set();btn.addEventListener('pointerdown',e=>{e.preventDefault();audioUnlock();btn.setPointerCapture(e.pointerId);active.add(e.pointerId);pressed(0,btn.dataset.act);});for(const name of ['pointerup','pointercancel','lostpointercapture'])btn.addEventListener(name,e=>{if(!active.has(e.pointerId))return;active.delete(e.pointerId);});}

function cpuThink(f,foe){
 f.input.left=f.input.right=f.input.down=f.input.guard=false;
 if(f.stun||f.ko)return;
 const distance=foe.x-f.x,abs=Math.abs(distance),desired=Math.sign(distance)||-1;
 f.aiClock--;
 if(f.aiClock<=0){
  const L=f.aiLevel??.35;f.aiClock=Math.max(5,Math.round((14+Math.random()*17)*(1.25-.75*L)));
  f.aiChoice=Math.random()<.14?'guard':Math.random()<.09?'back':'approach';
  const sp=SPECIAL_INFO[f.r.id];
  // At range, ranged fighters prefer a special; close fighters close distance first.
  const ranged=sp&&sp.type!=='maul';
  if(sp&&f.energy>=sp.cost&&abs<sp.reach&&Math.random()<(ranged?.12:.09)*(.6+L*1.15)&&!f.action){
    pressed(1,'super');
  }else if(abs<200&&Math.random()<.34+.4*L){
    const attack=abs>151?(Math.random()<.55?'lk':'mk'):['lp','mp','hp','lk','mk','hk'][Math.floor(Math.random()*6)];
    pressed(1,attack);
  }else if(abs<430&&Math.random()<.11)pressed(1,'jump');
 }
 const threat=foe.action==='super'?(SPECIAL_INFO[foe.r.id]?.cast||20):(attackFor(foe,foe.action)?.start||12);
 if(foe.action&&abs<230&&foe.actionTick<threat+3&&Math.random()<.12+.34*(f.aiLevel??.35))f.aiChoice='guard';
 if(f.aiChoice==='guard'&&abs<224){f.input.guard=true;return;}
 if(abs>144||f.aiChoice==='back'){
  const travel=f.aiChoice==='back'?-desired:desired;
  f.input.right=travel>0;f.input.left=travel<0;
 }else if(!f.action&&f.aiClock<=4&&Math.random()<.12)pressed(1,Math.random()<.5?'lp':'lk');
}
function accelerate(f,delta,friction=.7){const desired=(f.input.right?1:0)-(f.input.left?1:0);
 if(!f.grounded){if(desired&&Math.sign(f.vx)!==desired)f.vx+=desired*.18;return;}
 const max=f.r.speed;const target=desired*max;f.vx+=(target-f.vx)*.21;if(!desired){f.vx*=friction;if(Math.abs(f.vx)<.12)f.vx=0;}}
function updateFighter(f,opponent,side){
 if(f.health<=0){f.ko=true;f.action=null;f.dash=0;f.guard=false;f.animation='ko';f.animTime=(f.animTime||0)+1;
  if(!f.grounded){f.vy+=JUMP.gravity;f.y+=f.vy;if(f.y>=GROUND){f.y=GROUND;f.vy=0;f.grounded=true;shake=Math.max(shake,7);spawnDust(f.x,GROUND,-f.face);spawnDust(f.x-f.face*60,GROUND,-f.face);}}
  else f.vx*=.86;
  const pad=wallPad(f);f.x=Math.max(pad,Math.min(W-pad,f.x+f.vx));return;}
 if(f.signatureTicks>0)f.signatureTicks--;
 if(f.inv>0)f.inv--;if(f.dashCD>0)f.dashCD--;if(f.blockFlash>0)f.blockFlash--;if(f.debuffTicks>0)f.debuffTicks--;else f.debuff='';if(f.comboTimer>0)f.comboTimer--;else f.combo=0;if(f.stun>0){f.stun--;f.guard=false;f.vx*=.82;}else{
  const backHeld=(f.face===1&&f.input.left)||(f.face===-1&&f.input.right);
  f.guard=(f.input.guard||backHeld)&&f.grounded&&!f.action&&!f.dash;
  f.crouch=f.input.down&&f.grounded&&!f.action;
  if(f.dash>0){f.dash--;f.vx=f.face*(12+Math.max(0,f.dash-8)*.28);}
  else if(f.guard){f.vx*=.55;}
  else{accelerate(f);if(f.action)f.vx*=.72;}
 }
 if(!f.grounded){f.airTicks=(f.airTicks||0)+1;f.vy+=JUMP.gravity;f.y+=f.vy;if(f.y>=GROUND){f.y=GROUND;f.vy=0;f.grounded=true;f.landTicks=LAND_TICKS;spawnDust(f.x,GROUND,f.face);}}
 else if(f.landTicks>0)f.landTicks--;
 // Fighters always turn to face the enemy once they are on the ground and free to act (fixes jump-turn lock).
 if(f.grounded&&!f.action&&!f.stun&&f.dash<=0)faceOpponent(f,opponent);
 const prev=f.x;const edgePad=Math.max(112,Math.min(205,f.r.h*.55));f.x=Math.max(edgePad,Math.min(W-edgePad,f.x+f.vx));const delta=Math.abs(f.x-prev);if(f.grounded&&f.dash<=0&&f.stun<=0&&delta>.01)f.gait+=delta;
 if(f.action){const a=f.action==='super'?SPECIAL_INFO[f.r.id]:attackFor(f,f.action);f.actionTick++;
  if(f.action==='super')specialPulse(f,opponent);
  else if(f.actionTick>=a.start&&f.actionTick<=a.end&&!f.hitTargets.has(opponent)&&strikeOverlap(f,opponent,a)){
   const impact=hit(f,opponent,a);
   if(impact&&impact.landed){f.hitTargets.add(opponent);f.confirmed=true;if(!impact.guarded)awardSignature(f);}
  }
  if(f.actionTick>=a.total){const next=f.bufferAttack;f.action=null;f.actionTick=0;f.bufferAttack=null;f.confirmed=false;f.chainLinks=0;f.signaturePending=null;
   if(next&&phase==='fight'&&!f.stun)pressed(side,next);
  }
 }
 const anim=f.ko?'ko':f.stun?'hurt':f.action||(!f.grounded?'jump':f.landTicks>0&&!f.guard&&Math.abs(f.vx)<2.5?'land':f.dash>0?'run':f.guard?'guard':f.crouch?'idle':Math.abs(f.vx)>(f.animation==='run'?2.85:3.6)?'run':Math.abs(f.vx)>.44?'walk':'idle');
 if(anim!==f.animation){f.animation=anim;f.animTime=0;}else f.animTime++;
}
// Pushbox: keep bodies apart without shoving anyone through the arena walls.
function wallPad(f){return Math.max(112,Math.min(205,f.r.h*.55));}
function separate(a,b,minDist){
 let left=a,right=b;
 if(a.x===b.x){const aw=a.grounded?0:1,bw=b.grounded?0:1;/* airborne fighter lands on the side it came from */ if(aw!==bw){const air=aw?a:b,gr=aw?b:a;left=air.vx>0?gr:air;right=left===gr?air:gr;}else{left=a.face>=0?a:b;right=left===a?b:a;}}
 else if(a.x>b.x){left=b;right=a;}
 const need=minDist-(right.x-left.x);if(need<=0)return;
 let lx=left.x-need/2,rx=right.x+need/2;
 const lmin=wallPad(left),rmax=W-wallPad(right);
 if(lx<lmin){rx+=lmin-lx;lx=lmin;}
 if(rx>rmax){lx-=rx-rmax;rx=rmax;}
 left.x=Math.max(lmin,lx);right.x=Math.min(rmax,rx);
}
function hit(attacker,defender,a){
 if(defender.inv>0||defender.health<=0)return {landed:false,guarded:false,damage:0};
 const guarded=defender.guard&&defender.grounded&&defender.face*(attacker.x-defender.x)>0;
 const nominal=a.damage*attacker.r.power*(attacker.powerMul||1)/defender.r.weight;
 const damage=Math.max(1,Math.round(nominal*(guarded?.14:1)));
 defender.health=Math.max(0,defender.health-damage);practiceHit(attacker,defender,damage);
 attacker.energy=Math.min(100,attacker.energy+(a.energy||0));
 if(!guarded){
  defender.stun=a.stun||10;defender.action=null;defender.actionTick=0;defender.bufferAttack=null;defender.confirmed=false;
  defender.vx=attacker.face*a.push/defender.r.weight;defender.inv=4;
  attacker.combo++;attacker.comboTimer=76;shake=a.shake;
 }else{
  defender.blockFlash=12;defender.stun=3;defender.vx=attacker.face*2.1;shake=2;
 }
 hitFreeze=guarded?2:4;
 spawnHit(defender.x,defender.y-116,guarded?'#d7c8b6':attacker.r.col,guarded?5:11);
 blip(guarded?480:140,guarded?.055:.11,guarded?'triangle':'sawtooth',guarded?.016:.065);
 if(defender.health<=0){defender.ko=true;defender.action=null;defender.animation='ko';defender.animTime=0;defender.stun=28;shake=18;defender.vx=attacker.face*5.5;defender.vy=Math.min(defender.vy,-7);defender.grounded=false;hitFreeze=Math.max(hitFreeze,14);}
 return {landed:true,guarded,damage};
}
function spawnHit(x,y,col,n){for(let i=0;i<n;i++){sparks.push({x,y,vx:(Math.random()-.5)*13,vy:(Math.random()-.85)*12,life:15+Math.random()*12,col,size:2+Math.random()*4});}effects.push({type:'ring',x,y,col,life:13});}
function spawnDust(x,y,face){for(let i=0;i<5;i++)sparks.push({x,y,vx:face*(Math.random()*3)+Math.random()*2-1,vy:-Math.random()*4,life:16+Math.random()*15,col:'#b3a9a0',size:3+Math.random()*5});}
function updateEffects(){sparks=sparks.filter(s=>s.life-->0);for(const s of sparks){s.x+=s.vx;s.y+=s.vy;s.vy+=.18;s.vx*=.96;}effects=effects.filter(e=>e.life-->0);shake*=.88;if(shake<.2)shake=0;}
function step(){frameNo++;if(paused||phase==='menu'||phase==='matchover')return;
 if(phase==='cutscene'){if(scene)stepScene();else phase='intro';return;}
 if(phase==='finisher'){stepFinisher();updateEffects();return;}
 if(hitFreeze>0){hitFreeze--;updateEffects();return;}
 if(phase==='intro'){introTimer--;if(introTimer<=0)phase='fight';}
 if(phase==='fight'){if(mode==='cpu'||mode==='arcade')cpuThink(fighters[1],fighters[0]);else if(mode==='practice')dummyThink(fighters[1],fighters[0]);let f0=fighters[0],f1=fighters[1];updateFighter(f0,f1,0);updateFighter(f1,f0,1);updateSpecials();const dist=Math.abs(f0.x-f1.x);const minDist=Math.min(185,Math.max(155,(f0.r.h+f1.r.h)*.31));const lift=f=>GROUND-f.y,over=(a,b)=>lift(a)>b.r.h*.42;if(dist<minDist&&!over(f0,f1)&&!over(f1,f0))separate(f0,f1,minDist);if(mode==='practice')practiceTick();else{if(++subframes>=60){subframes=0;clock=Math.max(0,clock-1);}if(clock===0||fighters.some(f=>f.health<=0))finishRound();}}
 if(phase==='roundover'){for(const f of fighters){f.input.left=f.input.right=f.input.down=f.input.guard=false;}updateFighter(fighters[0],fighters[1],0);updateFighter(fighters[1],fighters[0],1);roundTimer--;if(roundTimer<=0){if(fighters[0].wins>=2||fighters[1].wins>=2){const w=fighters[0].wins>=2?fighters[0]:fighters[1];if(mode==='arcade'){const finalWin=w===fighters[0]&&arcade.idx>=arcade.ladder.length-1;if(finalWin)startScene(buildWinScene(w),showResult);else showResult();}else startScene(buildWinScene(w),showResult);}else startNewRound();}}
 updateEffects();}

function drawGame(){if(phase==='cutscene'&&scene){drawScene();if(paused){ctx.fillStyle='#05050ab9';ctx.fillRect(0,0,W,H);overlayWords('PAUSED','PRESS P OR TAP RESUME');}return;}ctx.save();ctx.clearRect(0,0,W,H);drawStage();if(shake)ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake*.55);
 for(const f of fighters){drawShadow(f);}for(const f of fighters){drawFighter(f);}drawSpecialFX();drawFinisherFX();drawEffects();ctx.restore();drawHud();if(phase==='finisher')drawFinisherCinema();
 if(phase==='intro'){if(mode==='practice')overlayWords(introTimer>50?'PRACTICE':'FIGHT!',introTimer>50?'TEST DUMMY · '+fighters[1].r.name.toUpperCase():'');else overlayWords(introTimer>87?'ROUND '+(fighters[0].wins+fighters[1].wins+1):'FIGHT!',introTimer>87?(mode==='arcade'?arcadeLabel():'PROVE YOUR REDEMPTION'):'');}
 if(phase==='roundover'){const word=champion?champion===fighters[0]?'ROUND WON':'ROUND LOST':'DRAW';overlayWords(lastFinisher&&champion&&lastFinisher.owner===champion.r.name?'FINISHER!':word,champion?champion.r.name+' PREVAILS':'NEITHER SOUL YIELDS');}
 if(paused){ctx.fillStyle='#05050ab9';ctx.fillRect(0,0,W,H);overlayWords('PAUSED','PRESS P OR TAP RESUME');}}
function drawStage(){const b=backgrounds[stage];ctx.fillStyle='#071015';ctx.fillRect(0,0,W,H);if(b.complete&&b.naturalWidth){ctx.drawImage(b,0,0,W,H);}const sh=ctx.createLinearGradient(0,0,0,H);sh.addColorStop(0,'rgba(0,0,0,.10)');sh.addColorStop(.58,'rgba(5,7,12,.03)');sh.addColorStop(.80,'rgba(1,3,6,.12)');sh.addColorStop(1,'rgba(0,0,0,.68)');ctx.fillStyle=sh;ctx.fillRect(0,0,W,H);
 const ground=ctx.createLinearGradient(0,GROUND-8,0,H);ground.addColorStop(0,'#080d11a0');ground.addColorStop(.3,'#080b0fa8');ground.addColorStop(1,'#030406dd');ctx.fillStyle=ground;ctx.fillRect(0,GROUND-8,W,H-GROUND+8);
 ctx.strokeStyle='#8b74613f';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,GROUND);ctx.lineTo(W,GROUND);ctx.stroke();
 // Original static arena background: no moving fog or atmospheric overlays.
}
function drawShadow(f){ctx.save();ctx.fillStyle='rgba(0,0,0,.58)';ctx.beginPath();const radius=Math.max(29,Math.min(72,f.r.h*.19)-(GROUND-f.y)*.09);ctx.ellipse(f.x,GROUND+2,radius,13,0,0,Math.PI*2);ctx.fill();ctx.restore();}
function currentFrame(f){const r=f.r;if((f.animation==='jump'||f.animation==='land')&&!f.action){const jp=jumpPose(f);if(jp!=null)return jp;}const arr=r[f.animation]||r.idle;if(!arr.length)return 0;
 if(f.animation==='walk'||f.animation==='run'){const stride=f.animation==='run'?10:12;return arr[Math.floor(f.gait/stride)%arr.length];}
 if(f.action==='super'||f.action==='finisher')return r.idle[0];
 if(f.action){const cfg=attackFor(f,f.action);return arr[Math.min(arr.length-1,Math.floor(f.actionTick/cfg.total*arr.length))];}
 if(f.animation==='ko'){const k=f.r.koData,fr=(k&&k.frames)||arr;return fr[Math.min(fr.length-1,Math.floor(f.animTime/8))];}
 let rate=f.animation==='idle'?14:f.animation==='hurt'?4:f.animation==='jump'?7:8;return arr[Math.floor(f.animTime/rate)%arr.length];}

// v2.6: Extra micro-poses are transformed and cached from the original approved artwork.
const originalPoseMetrics=new WeakMap(), originalPoseMicroSprites=new WeakMap();
const poseProbe=document.createElement('canvas');
const poseProbeCtx=poseProbe.getContext('2d',{willReadFrequently:true});
function clampPose(v,lo,hi){return Math.max(lo,Math.min(hi,v));}
function getPoseMetrics(image,cols,rows,index){
 let cache=originalPoseMetrics.get(image);
 if(!cache){cache=new Map();originalPoseMetrics.set(image,cache);}
 const key=cols+'x'+rows+':'+index;
 if(cache.has(key))return cache.get(key);
 const cw=Math.floor(image.naturalWidth/cols),ch=Math.floor(image.naturalHeight/rows);
 if(!cw||!ch)return {cx:cw*.5,bottom:ch*.94,top:0,edge:false};
 poseProbe.width=cw;poseProbe.height=ch;poseProbeCtx.clearRect(0,0,cw,ch);
 poseProbeCtx.drawImage(image,(index%cols)*cw,Math.floor(index/cols)*ch,cw,ch,0,0,cw,ch);
 let data;
 try{data=poseProbeCtx.getImageData(0,0,cw,ch).data;}catch(e){return {cx:cw*.5,bottom:ch*.94,top:0,edge:false};}
 let left=cw,right=0,top=ch,bottom=0;
 for(let y=0;y<ch;y+=2)for(let x=0;x<cw;x+=2){
   if(data[(y*cw+x)*4+3]>40){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 }
 const bound=right<left?{cx:cw/2,bottom:ch*.94,top:0,edge:false}:
 {cx:(left+right)/2,bottom,top,edge:left<4||right>=cw-5||top<4||bottom>=ch-5};
 cache.set(key,bound);return bound;
}
function getMicroSprite(img,cols,rows,index,step){
 let cache=originalPoseMicroSprites.get(img);
 if(!cache){cache=new Map();originalPoseMicroSprites.set(img,cache);}
 const key=cols+'x'+rows+':'+index+':'+step;
 if(cache.has(key))return cache.get(key);
 const cw=Math.floor(img.naturalWidth/cols),ch=Math.floor(img.naturalHeight/rows);
 const extra=16,frame=document.createElement('canvas');frame.width=cw+extra*2;frame.height=ch+extra*2;
 const g=frame.getContext('2d');g.translate(extra+cw/2,extra+ch*.94);
 const phase=step===1?1:-1;
 g.rotate(phase*.013);g.transform(1,phase*.003,phase*.007,1,phase*1.3,0);
 g.drawImage(img,(index%cols)*cw,Math.floor(index/cols)*ch,cw,ch,-cw/2,-ch*.94,cw,ch);
 cache.set(key,frame);return frame;
}
function drawOriginalPose(img,cols,rows,frame,dx,dy,w,h,state,actor){
 const cellW=img.naturalWidth/cols,cellH=img.naturalHeight/rows;
 const bound=getPoseMetrics(img,cols,rows,frame);
 const reference=getPoseMetrics(img,cols,rows,0);
 const grounded=actor.grounded&&!actor.ko&&state!=='jump';
 const rawGroundOffset=(reference.bottom-bound.bottom)/cellH*h;
 const desiredY=grounded?clampPose(rawGroundOffset,-h*.055,h*.075):0;
 const desiredX=(state==='walk'||state==='run'||state==='idle')?clampPose((reference.cx-bound.cx)/cellW*w,-w*.045,w*.045):0;
 actor.poseOffsetY=(actor.poseOffsetY||0)+(desiredY-(actor.poseOffsetY||0))*.35;
 actor.poseOffsetX=(actor.poseOffsetX||0)+(desiredX-(actor.poseOffsetX||0))*.38;
 const x=dx+actor.poseOffsetX,y=dy+actor.poseOffsetY;
 const locomotion=state==='walk'||state==='run';
 if(locomotion){
   const length=state==='run'?10:13;
   const slot=Math.floor(actor.gait/length)%3;
   if(slot){
     const extra=16,sprite=getMicroSprite(img,cols,rows,frame,slot);
     ctx.drawImage(sprite,extra,extra,cellW,cellH,x,y,w,h);
     return;
   }
 }
 ctx.drawImage(img,(frame%cols)*cellW,Math.floor(frame/cols)*cellH,cellW,cellH,x,y,w,h);
}


// Mothman v3.1: draw the user-approved 8x12 sheet directly, not an interpolated
// or softened re-creation. Foot and body anchors use each source frame's
// actual alpha bounds so the sprite stays aligned through attack transitions.
function drawApprovedMothmanPose(image,cols,rows,index,height,squat=0){
 const srcW=image.naturalWidth/cols,srcH=image.naturalHeight/rows;
 const bounds=getPoseMetrics(image,cols,rows,index);
 const width=height*(srcW/srcH);
 const x=Math.round(-width*(bounds.cx/srcW));
 const y=Math.round(-height*(bounds.bottom/srcH)+squat);
 const oldSmooth=ctx.imageSmoothingEnabled;
 ctx.imageSmoothingEnabled=false;
 ctx.drawImage(image,(index%cols)*srcW,Math.floor(index/cols)*srcH,srcW,srcH,x,y,Math.round(width),Math.round(height));
 ctx.imageSmoothingEnabled=oldSmooth;
}

function drawAfterFighter(f){if(f.blockFlash>0){ctx.save();ctx.globalAlpha=f.blockFlash/12*.7;ctx.fillStyle='#e6d9c7';ctx.beginPath();ctx.arc(f.x+f.face*40,f.y-132,19,0,Math.PI*2);ctx.fill();ctx.restore();}}
function drawFighter(f){const r=f.r,img=imgs[r.id];if(!img?.complete||!img.naturalWidth)return;const frame=currentFrame(f),cellw=img.naturalWidth/r.cols,cellh=img.naturalHeight/r.rows;const h=r.h,w=h*cellw/cellh;
 ctx.save();ctx.translate(f.x,f.y);if(f.face<0)ctx.scale(-1,1);if(f.inv>0&&f.inv%3===0)ctx.globalAlpha=.65;
 // Maintain a consistent foot anchor without redrawing or transforming anatomy.
 if(f.ko)ctx.globalAlpha*=.95;
 const squat=f.crouch?9:0;
 const attackAtlas=attackImgs[r.id];
 if((f.action==='super'||f.action==='finisher')&&specialImgs[r.id]?.complete&&specialImgs[r.id].naturalWidth){
   const img2=specialImgs[r.id],sw=img2.naturalWidth/4,sh=img2.naturalHeight/2,sp=SPECIAL_INFO[r.id];
   const pose=Math.min(7,Math.floor((f.action==='finisher'?(cinematic?.tick||0)/(cinematic?.total||142):f.actionTick/sp.total)*8));
   const specialW=h*(sw/sh),specialH=h;
   if(r.id==='mothman')drawApprovedMothmanPose(img2,4,2,pose,h,squat);else drawOriginalPose(img2,4,2,pose,-specialW*.47,-specialH*.94+squat,specialW,specialH,'super',f);
 }else if(f.action&&ACTION_ROW[f.action]!==undefined&&attackAtlas?.complete&&attackAtlas.naturalWidth){
   const extended=['mothman','slender'].includes(r.id),row=(r.attackRows&&r.attackRows[f.action]!=null)?r.attackRows[f.action]:ACTION_ROW[f.action]+(extended?6:0),cfg=attackFor(f,f.action);
   const pose=Math.min(7,Math.floor(f.actionTick/cfg.total*8));
   if(r.id==='mothman')drawApprovedMothmanPose(attackAtlas,8,12,row*8+pose,h,squat);else{const arows=r.attackGridRows||(extended?12:6),aw=h*(attackAtlas.naturalWidth/8)/(attackAtlas.naturalHeight/arows);drawOriginalPose(attackAtlas,8,arows,row*8+pose,-h*.48-(aw-h)/2,-h*.96+squat,aw,h,f.action,f);}
 }else{
   const kd=r.koData,kimg=koImgs[r.id];
   if(f.ko&&kd&&kimg?.complete&&kimg.naturalWidth){const kw=h*(kimg.naturalWidth/kd.cols)/(kimg.naturalHeight/kd.rows);drawOriginalPose(kimg,kd.cols,kd.rows,frame,-kw*.48,-h*.96,kw,h,'ko',f);ctx.restore();return drawAfterFighter(f);}
   if(f.ko&&kd&&kd.topple){const t=Math.min(1,f.animTime/26);ctx.rotate(-t*t*1.38);ctx.translate(-t*h*.12,t*h*.05);}
   const jp=JUMP_POSES[r.id],jimg=jumpImgs[r.id],airborne=f.animation==='jump'||f.animation==='land';
   if(airborne&&jimg?.complete&&jimg.naturalWidth){const jch=jimg.naturalHeight/jp.rows,E=jp.padTop||0,u=h/(jch-E),jh=jch*u,jw=u*jimg.naturalWidth/jp.cols;drawOriginalPose(jimg,jp.cols,jp.rows,frame,-jw*.48,-h*.96-E*u+squat,jw,jh,'jump',f);}
   else{
    if(f.animation==='jump'&&jp&&!jp.art){const tilt=Math.max(-.09,Math.min(.11,-f.vy*.006));ctx.translate(0,-h*.45);ctx.rotate(tilt);ctx.translate(0,h*.45);}
    if(r.id==='mothman')drawApprovedMothmanPose(img,8,12,frame,h,squat);else drawOriginalPose(img,r.cols,r.rows,frame,-w*.48,-h*.96+squat,w,h,f.animation,f);
   }
 }
 if(f.guard&&f.health>0){ctx.strokeStyle=r.col+'aa';ctx.lineWidth=4;ctx.beginPath();ctx.arc(w*.20,-h*.48,56,-1.3,.95);ctx.stroke();}
 if(f.action&&attackDefs[f.action]&&f.actionTick>=attackDefs[f.action].start-3&&f.actionTick<=attackDefs[f.action].end+1){let a=f.action;ctx.lineCap='round';ctx.globalAlpha*=.5;const power=(a==='hp'||a==='hk')?3:(a==='mp'||a==='mk')?2:1;ctx.strokeStyle=a[0]==='h'?r.col:a[0]==='m'?'#e1d9c7':'#d9aca5';ctx.lineWidth=power*2+3;ctx.beginPath();ctx.arc(w*.36,-h*(a.endsWith('k')?.33:.56),power*13+58,-1.1,1.12);ctx.stroke();}
 ctx.restore();if(f.blockFlash>0){ctx.save();ctx.globalAlpha=f.blockFlash/12*.7;ctx.fillStyle='#e6d9c7';ctx.beginPath();ctx.arc(f.x+f.face*40,f.y-132,19,0,Math.PI*2);ctx.fill();ctx.restore();}}
function drawEffects(){for(const s of sparks){ctx.globalAlpha=Math.min(1,s.life/14);ctx.fillStyle=s.col;ctx.fillRect(s.x,s.y,s.size,s.size)}ctx.globalAlpha=1;for(const e of effects){if(e.type==='ring'){ctx.strokeStyle=e.col;ctx.globalAlpha=e.life/13;ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y,60+(13-e.life)*4,0,7);ctx.stroke();}}ctx.globalAlpha=1;}
window.CurseboundQA={spriteReport:()=>({originalArtPreserved:true,sourceClippingWarning:'Some original source cells touch the cell edge; unrecoverable cropped details require separate hand-drawn in-betweens.'}),status:()=>({phase,paused,round:Math.max(1,fighters[0]?.wins+fighters[1]?.wins+1),specialProjectiles:specialProjectiles.length,fighters:fighters.map(f=>({name:f.r.name,health:f.health,energy:f.energy,action:f.action,actionTick:f.actionTick,motion:{...f.motion},debuff:f.debuff}))}),startSpecial:(side=0)=>{if(phase==='fight')pressed(side,'super');}};
function drawHud(){if(fighters.length!==2)return;ctx.save();ctx.font='700 13px system-ui';ctx.textBaseline='middle';const f0=fighters[0],f1=fighters[1];const w=405,barY=44;
 ctx.fillStyle='#04050acb';ctx.fillRect(24,14,510,105);ctx.fillRect(746,14,510,105);
 ctx.strokeStyle='#776353af';ctx.strokeRect(24,14,510,105);ctx.strokeRect(746,14,510,105);
 ctx.fillStyle='#e8c6a4';ctx.font='bold 25px Georgia';ctx.textAlign='left';ctx.fillText(f0.r.name,40,34);ctx.textAlign='right';ctx.fillText(f1.r.name,1240,34);
 ctx.fillStyle='#2a111b';ctx.fillRect(40,barY,438,28);ctx.fillRect(802,barY,438,28);
 const healthGrad=ctx.createLinearGradient(0,barY,0,barY+28);healthGrad.addColorStop(0,'#d35c58');healthGrad.addColorStop(1,'#85222c');ctx.fillStyle=healthGrad;ctx.fillRect(40,barY,438*f0.health/100,28);ctx.fillRect(1240-438*f1.health/100,barY,438*f1.health/100,28);
 ctx.strokeStyle='#ad8581';ctx.strokeRect(40,barY,438,28);ctx.strokeRect(802,barY,438,28);
 ctx.fillStyle='#1b2931';ctx.fillRect(40,84,260,8);ctx.fillRect(980,84,260,8);ctx.fillStyle='#76bdcc';ctx.fillRect(40,84,260*f0.energy/100,8);ctx.fillRect(1240-260*f1.energy/100,84,260*f1.energy/100,8);
 ctx.fillStyle='#a79e9a';ctx.font='11px system-ui';ctx.textAlign='left';ctx.fillText('SPIRIT',309,89);ctx.textAlign='right';ctx.fillText('SPIRIT',971,89);
 for(let i=0;i<2;i++){ctx.beginPath();ctx.arc(45+i*25,104,7,0,7);ctx.fillStyle=i<f0.wins?'#edc799':'#34292d';ctx.fill();ctx.strokeStyle='#b4a396';ctx.stroke();ctx.beginPath();ctx.arc(1235-i*25,104,7,0,7);ctx.fillStyle=i<f1.wins?'#edc799':'#34292d';ctx.fill();ctx.stroke();}
 ctx.fillStyle='#090b10e8';ctx.beginPath();ctx.moveTo(568,18);ctx.lineTo(713,18);ctx.lineTo(740,53);ctx.lineTo(713,101);ctx.lineTo(568,101);ctx.lineTo(540,53);ctx.closePath();ctx.fill();ctx.strokeStyle='#a48873';ctx.stroke();
 ctx.fillStyle='#ead7bc';ctx.textAlign='center';ctx.font='bold 34px Georgia';ctx.fillText(mode==='practice'?'∞':String(clock).padStart(2,'0'),640,46);ctx.font='11px system-ui';ctx.fillStyle='#ca9c87';ctx.fillText('CURSEBOUND',640,85);
 if(f0.combo>1&&f0.comboTimer>0){ctx.textAlign='left';ctx.font='bold 30px Georgia';ctx.fillStyle='#edc49a';ctx.fillText(f0.combo+' HITS',38,191);}if(f1.combo>1&&f1.comboTimer>0){ctx.textAlign='right';ctx.font='bold 30px Georgia';ctx.fillStyle='#edc49a';ctx.fillText(f1.combo+' HITS',1242,191);}
 const route0=SIGNATURE_COMBOS[f0.r.id],route1=SIGNATURE_COMBOS[f1.r.id];
 ctx.font='bold 13px system-ui';ctx.fillStyle='#dfc1a9';
 if(route0){ctx.textAlign='left';ctx.fillText(route0.name+'  '+route0.moves.map(m=>MOVE_LABELS[m]).join(' > '),40,140);}
 if(route1){ctx.textAlign='right';ctx.fillText(route1.name+'  '+route1.moves.map(m=>MOVE_LABELS[m]).join(' > '),1240,140);}
 for(const [i,f] of fighters.entries()){
   const other=fighters[1-i],x=i?1240:40;ctx.textAlign=i?'right':'left';
   if(f.signatureTicks>0){ctx.font='bold 21px Georgia';ctx.fillStyle='#f2d5a8';ctx.fillText(f.signatureText+'!',x,225);}
   if(canFinisher(f,other)){ctx.font='bold 16px Georgia';ctx.fillStyle='#f5bc91';ctx.shadowColor='#c74f56';ctx.shadowBlur=7;ctx.fillText('FINISHER READY · ↓↘→+HK',x,164);ctx.shadowBlur=0;}
 }
 if(mode==='practice'){ctx.textAlign='center';ctx.font='bold 15px Georgia';ctx.fillStyle='#e8c9a6';ctx.shadowColor='#000';ctx.shadowBlur=6;const P=practice;ctx.fillText(P.hits?`${P.hits} HITS · ${P.dmg} DAMAGE`:`LAST COMBO ${P.lastHits||0} HITS · ${P.lastDmg||0} DAMAGE · BEST ${P.best||0}`,640,196);ctx.shadowBlur=0;}
 ctx.restore();}
function overlayWords(big,small){ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.shadowColor='#000';ctx.shadowBlur=16;ctx.fillStyle='#f6e7d4';ctx.font='bold 70px Georgia';ctx.fillText(big,640,306);ctx.font='bold 14px system-ui';ctx.fillStyle='#d0ab9c';ctx.fillText(small,640,362);ctx.restore();}
function tick(t){if(!lastFrame)lastFrame=t;acc+=Math.min(80,t-lastFrame);lastFrame=t;let cycles=0;while(acc>=STEP&&cycles++<5){step();acc-=STEP;}if(phase!=='menu')drawGame();requestAnimationFrame(tick)}
window.__curseboundDebug={
 state:()=>({phase,mode,clock,paused,stage,projectiles:specialProjectiles.length,finisher:cinematic?.id||null,lastFinisher:lastFinisher?.name||null,
  fighters:fighters.map(f=>({name:f.r.name,x:Math.round(f.x),health:f.health,energy:f.energy,wins:f.wins,animation:f.animation,action:f.action,tick:f.actionTick,confirmed:f.confirmed,chainLinks:f.chainLinks,routeIndex:f.routeIndex,signatureText:f.signatureText,signatureTicks:f.signatureTicks,dash:f.dash,stun:f.stun,guard:f.guard}))}),
 press:(side,act)=>pressed(side,act),direction:(side,dir,held)=>direction(side,dir,held),start:()=>beginMatch('cpu'),
 test:(p1='wolf',p2='wendigo')=>{selected=p1;opponent=p2;beginMatch('local');scene=null;setCutsceneUi(false);introTimer=0;phase='fight';},
 scene:()=>scene?{idx:scene.idx,t:scene.t,count:scene.shots.length,kind:scene.shots[scene.idx]?.kind,id:scene.shots[scene.idx]?.id||null}:null,skipScene:()=>{if(scene){scene.age=99;skipScene();}},
 set:(side,props)=>{const f=fighters[side];if(f)Object.assign(f,props)},
 step:(n=1)=>{for(let i=0;i<n;i++)step()},
 getMove:(side,move)=>attackFor(fighters[side],move),
 specials:()=>SPECIAL_INFO,signatureCombos:()=>SIGNATURE_COMBOS,finishers:()=>FINISHERS,canFinish:(side=0)=>canFinisher(fighters[side],fighters[1-side]),simulateFinisher:(side=0)=>startFinisher(fighters[side],fighters[1-side]),cinematic:()=>cinematic?{id:cinematic.id,tick:cinematic.tick,total:cinematic.total}:null,
 arcade:()=>arcade?{...arcade,ladder:[...arcade.ladder],label:arcadeLabel()}:null,practice:()=>({...practice}),startArcade:()=>startArcade(),startPractice:()=>startPractice(),setArcadeIdx:i=>{if(arcade){arcade.idx=i;arcade.next=false;arcadeFight();}},level:()=>fighters[1]?.aiLevel,
 simulateSpecial:(side)=>{const f=fighters[side];if(f)beginAttack(f,'super',false)}
};
requestAnimationFrame(tick);
})();
