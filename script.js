document.addEventListener('DOMContentLoaded',()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const nav=document.getElementById('primary-nav'),toggle=document.getElementById('nav-toggle');
 toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',open)});nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
 document.getElementById('year').textContent=new Date().getFullYear();
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');observer.unobserve(e.target)}}),{threshold:.14});document.querySelectorAll('.reveal,.contact-section').forEach(el=>observer.observe(el));
 const card=document.getElementById('featured-book-card'),btn=document.getElementById('book-flip-button');
 function flip(){const flipped=card.classList.toggle('flipped');card.setAttribute('aria-pressed',flipped);btn.textContent=flipped?'View Front Cover':'View Back Cover'}
 card?.addEventListener('click',flip);card?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();flip()}});btn?.addEventListener('click',flip);
 if(!reduced){
  const canvas=document.getElementById('cosmos-canvas'),ctx=canvas.getContext('2d');let stars=[];
  function resize(){canvas.width=innerWidth*devicePixelRatio;canvas.height=innerHeight*devicePixelRatio;canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);stars=Array.from({length:Math.min(240,Math.floor(innerWidth/5))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.4+.15,v:Math.random()*.08+.015,a:Math.random()*.7+.2}))}
  function draw(){ctx.clearRect(0,0,innerWidth,innerHeight);for(const s of stars){s.y-=s.v;if(s.y<0){s.y=innerHeight;s.x=Math.random()*innerWidth}ctx.globalAlpha=s.a*(.7+.3*Math.sin(Date.now()*.001+s.x));ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill()}requestAnimationFrame(draw)}resize();addEventListener('resize',resize);draw();
  const glow=document.getElementById('cursor-glow');addEventListener('pointermove',e=>{glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'});
  document.querySelectorAll('[data-parallax]').forEach(el=>el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.querySelector('img').style.transform=`rotateY(${x*7}deg) rotateX(${-y*7}deg) scale(1.02)`}));document.querySelectorAll('[data-parallax]').forEach(el=>el.addEventListener('pointerleave',()=>el.querySelector('img').style.transform=''));
 }
 const modal=document.getElementById('archive-modal');document.getElementById('archive-trigger')?.addEventListener('click',()=>{modal.classList.add('open');modal.setAttribute('aria-hidden','false')});document.getElementById('archive-close')?.addEventListener('click',()=>{modal.classList.remove('open');modal.setAttribute('aria-hidden','true')});modal?.addEventListener('click',e=>{if(e.target===modal)document.getElementById('archive-close').click()});addEventListener('keydown',e=>{if(e.key==='Escape')document.getElementById('archive-close')?.click()});
});
