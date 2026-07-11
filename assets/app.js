(function(){
  var page=document.querySelector('.page');
  var fw=document.querySelector('.fireword');
  var hero=document.querySelector('.hero');
  var glow=document.querySelector('.cursorglow');
  var embers=document.querySelector('.embers');
  var refire=document.querySelector('.refire');
  var toggle=document.querySelector('.toggle');
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setMode(m){ page.dataset.mode=m; toggle.innerHTML=(m==='dark')?'☀️ Light':'☾ Dark';
    toggle.setAttribute('aria-label','Switch to '+(m==='dark'?'light':'dark')+' theme'); glow.style.opacity=0; }
  setMode('light');
  toggle.addEventListener('click', function(){ setMode(page.dataset.mode==='dark'?'light':'dark'); });

  /* fire the word */
  var cur=0, touched=false;
  function heat(x){ x=Math.max(0,Math.min(100,x)); cur=x; fw.style.setProperty('--x', x+'%'); page.style.setProperty('--heat',(x/100).toFixed(3)); }
  function fire(){ fw.style.transition='--x 2.6s cubic-bezier(.4,0,.2,1)'; heat(100); }
  function resetFire(){ touched=false; fw.style.transition='none'; heat(0); void fw.offsetWidth; }
  heat(0);
  if(reduce){ fw.style.transition='none'; heat(100); } else setTimeout(function(){ if(!touched) fire(); }, 900);
  var sx=0, sRAF=0;
  function scrub(e){ sx=e.clientX; touched=true; if(!sRAF) sRAF=requestAnimationFrame(doScrub); }
  function doScrub(){ sRAF=0; var r=fw.getBoundingClientRect(); var f=Math.max(0,Math.min(1,(sx-r.left)/r.width)); fw.style.transition='none'; heat(f*100+12); }
  fw.addEventListener('pointermove', scrub); fw.addEventListener('pointerdown', scrub);
  fw.addEventListener('pointerleave', function(){ fw.style.transition='--x 1.1s cubic-bezier(.4,0,.2,1)'; heat(100); });

  var gx=0, gy=0, gRAF=0, gShow=false;
  document.addEventListener('pointermove', function(e){
    gx=e.clientX; gy=e.clientY;
    gShow = !reduce && !!(e.target && e.target.closest && e.target.closest('.hero'));
    if(!gRAF) gRAF=requestAnimationFrame(applyGlow);
  }, {passive:true});
  function applyGlow(){ gRAF=0; glow.style.transform='translate3d('+(gx-170)+'px,'+(gy-170)+'px,0)'; glow.style.opacity=gShow?1:0; }
  document.documentElement.addEventListener('mouseleave', function(){ gShow=false; glow.style.opacity=0; });
  refire.addEventListener('click', function(){ resetFire(); requestAnimationFrame(function(){ requestAnimationFrame(fire); }); });

  /* embers surge on scroll gesture (wheel/touch) */
  var budget=0;
  function surge(p){ budget=Math.min(budget+p, 8); while(budget>=1){ budget-=1; spawnGust(); } }
  window.addEventListener('wheel', function(e){ if(!reduce) surge(Math.min(Math.abs(e.deltaY)/38, 5)); }, {passive:true});
  var lastTouch=null;
  window.addEventListener('touchmove', function(e){ if(reduce||!e.touches[0]) return; if(lastTouch!=null) surge(Math.min(Math.abs(e.touches[0].clientY-lastTouch)/28, 5)); lastTouch=e.touches[0].clientY; }, {passive:true});
  window.addEventListener('touchend', function(){ lastTouch=null; });
  function spawnGust(){ var s=document.createElement('span'); s.className='gust'; s.style.left=(2+Math.random()*96)+'%'; s.style.bottom=(Math.random()*14)+'%';
    var sz=4+Math.random()*7; s.style.width=sz+'px'; s.style.height=sz+'px'; s.style.setProperty('--dx',(Math.random()*64-32)+'px');
    s.style.animationDuration=(1.1+Math.random()*1.3)+'s'; s.style.animationDelay=(Math.random()*0.2)+'s';
    embers.appendChild(s); s.addEventListener('animationend', function(){ s.remove(); }); }

  /* material switcher (real renders, one at a time) */
  var mats=document.querySelectorAll('.mat');
  document.querySelectorAll('.sw').forEach(function(btn){
    btn.addEventListener('click', function(){
      document.querySelectorAll('.sw').forEach(function(b){ b.setAttribute('aria-pressed', String(b===btn)); });
      mats.forEach(function(m){ m.classList.toggle('on', m.dataset.mat===btn.dataset.mat); });
    });
  });

  /* wordmark -> smooth scroll to top, no lingering #hash */
  var brand=document.querySelector('.brand');
  if(brand) brand.addEventListener('click', function(e){
    e.preventDefault();
    window.scrollTo({ top:0, behavior: reduce ? 'auto' : 'smooth' });
    if(history.replaceState) history.replaceState(null, '', location.pathname + location.search);
  });
})();
