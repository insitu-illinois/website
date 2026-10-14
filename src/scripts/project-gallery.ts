
  document.querySelectorAll<HTMLButtonElement>('[data-archive-animation]').forEach(button=>{
    const image=document.getElementById(button.getAttribute('aria-controls')!) as HTMLImageElement|null;
    if(!image)return;
    button.hidden=false;
    const setPlaying=(playing:boolean)=>{
      image.src=playing?button.dataset.archiveAnimation!:button.dataset.poster!;
      button.setAttribute('aria-pressed',String(playing));
      button.firstChild!.textContent=playing?'Stop animation':'Play animation';
    };
    button.addEventListener('click',()=>setPlaying(button.getAttribute('aria-pressed')!=='true'));
    document.addEventListener('visibilitychange',()=>{if(document.hidden)setPlaying(false);});
    const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
    motion.addEventListener('change',()=>{if(motion.matches)setPlaying(false);});
    new MutationObserver(()=>{if(document.documentElement.dataset.reduceMotion==='true')setPlaying(false);}).observe(document.documentElement,{attributes:true,attributeFilter:['data-reduce-motion']});
  });
