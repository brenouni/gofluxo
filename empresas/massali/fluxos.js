
(()=>{
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 document.querySelectorAll('[data-flow]').forEach(board=>{
  const stages=JSON.parse(board.querySelector('script[data-stages]').textContent),button=board.querySelector('[data-play]'),caption=board.querySelector('[data-caption]'),progress=board.querySelector('[data-progress]');
  let current=0,playing=false,frame=0,start=0,last=0,auto=false,inView=false;
  const signals=[];
  board.querySelectorAll('[data-flow-svg]').forEach(svg=>{
   const paths=[...svg.querySelectorAll('.flow-wire')];
   paths.forEach((path,i)=>{const c=document.createElementNS('http://www.w3.org/2000/svg','circle');c.setAttribute('r','4');c.setAttribute('class','flow-signal');c.style.display='none';svg.append(c);signals.push({svg,path,c,index:i});});
  });
  function select(index){
   current=index;const entry=stages[index];
   board.querySelectorAll('[data-step]').forEach(n=>{const chosen=Number(n.dataset.step)===index;n.classList.toggle('is-current',chosen);n.setAttribute('aria-pressed',String(chosen));});
   board.querySelectorAll('[data-zone]').forEach(n=>n.classList.toggle('is-associated',n.dataset.zone===entry[2]));
   caption.replaceChildren();const strong=document.createElement('strong');strong.textContent=entry[0]+'. ';caption.append(strong,document.createTextNode(entry[1]));progress.textContent=(index+1)+' / '+stages.length;if(!playing)button.textContent=index===stages.length-1?'Rever fluxo':'Reproduzir fluxo';
  }
  function stop(){playing=false;cancelAnimationFrame(frame);board.classList.remove('is-playing');signals.forEach(s=>s.c.style.display='none');button.textContent=current===stages.length-1?'Rever fluxo':'Reproduzir fluxo';button.setAttribute('aria-pressed','false');}
  function tick(now){
   if(!playing)return;
   if(document.hidden||!inView){stop();return;}
   if(now-last>=2600){if(current>=stages.length-1){stop();return;}select(current+1);last=now;}
   if(!reduce.matches)signals.forEach(s=>{
    if(!s.svg.getBoundingClientRect().width){s.c.style.display='none';return;}
    const active=(s.path.dataset.stages||'').split(',').filter(Boolean).map(Number).includes(current);
    s.c.style.display=active?'':'none';if(!active)return;
    const p=s.path.getPointAtLength(((now-start+s.index*430)%2200)/2200*s.path.getTotalLength());s.c.setAttribute('cx',p.x);s.c.setAttribute('cy',p.y);
   });
   frame=requestAnimationFrame(tick);
  }
  function play(){if(playing){stop();return;}if(current===stages.length-1)select(0);playing=true;start=last=performance.now();board.classList.add('is-playing');button.textContent='Pausar fluxo';button.setAttribute('aria-pressed','true');frame=requestAnimationFrame(tick);}
  button.addEventListener('click',play);
  board.querySelectorAll('[data-step]').forEach(n=>{const choose=()=>{stop();select(Number(n.dataset.step));};n.addEventListener('click',choose);n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose();}});});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});reduce.addEventListener('change',()=>stop());
  new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(!inView)stop();else if(!auto){auto=true;if(!reduce.matches)play();}},{threshold:.08}).observe(board);
  select(0);
 });
})();
