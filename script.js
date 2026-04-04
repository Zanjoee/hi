import * as THREE from "https://cdn.skypack.dev/three@0.133.1/build/three.module";


const $ = id => document.getElementById(id);
const landing=$('landing'), garden=$('garden'), prelude=$('prelude'),
      hiii=$('hiii-text'), bouquetWrap=$('bouquet-wrap'),
      envelopeWrap=$('envelope-wrap'), letterOverlay=$('letter-overlay'),
      closeLetter=$('close-letter'), bgm=$('bgm'), musicHint=$('music-hint'),
      canvas=$('flower-canvas');

let entered=false, envelopeOpen=false;

/* star field */
(()=>{
  const n=Math.min(65,Math.floor(innerWidth*innerHeight/1000));
  for(let i=0;i<n;i++){
    const s=document.createElement('div'); s.className='star';
    const sz=.5+Math.random()*2.2;
    s.style.cssText=`width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${Math.random()*5}s;animation-duration:${2.5+Math.random()*3.5}s;`;
    landing.appendChild(s);
  }
})();

function spawnSparkles(){
  const n=innerWidth<480?22:44;
  for(let i=0;i<n;i++){
    const d=document.createElement('div'); d.className='sparkle';
    const sz=1.5+Math.random()*5;
    d.style.cssText=`width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${Math.random()*5}s;animation-duration:${2+Math.random()*3.5}s;`;
    garden.appendChild(d);
  }
}
function spawnHearts(){
  const sym=['♡','✿','❀','✦','˚','·','✧'];
  const n=innerWidth<480?12:22;
  for(let i=0;i<n;i++){
    const h=document.createElement('div'); h.className='heart-particle';
    h.textContent=sym[Math.floor(Math.random()*sym.length)];
    const dur=6+Math.random()*8;
    h.style.cssText=`left:${Math.random()*100}%;bottom:${Math.random()*50}%;color:rgba(255,${160+Math.floor(Math.random()*80)},${200+Math.floor(Math.random()*55)},.55);animation-duration:${dur}s;animation-delay:${Math.random()*dur}s;`;
    garden.appendChild(h);
  }
}
function spawnGlitter(){
  const n=innerWidth<480?14:28;
  for(let i=0;i<n;i++){
    const g=document.createElement('div'); g.className='glitter';
    const sz=1.5+Math.random()*3.5; const pink=Math.random()>.4; const dur=8+Math.random()*10;
    g.style.cssText=`width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${-5+Math.random()*15}%;background:${pink?`rgba(255,${150+Math.floor(Math.random()*80)},${200+Math.floor(Math.random()*55)},.8)`:'rgba(255,255,255,.85)'};animation-duration:${dur}s;animation-delay:${Math.random()*dur}s;`;
    garden.appendChild(g);
  }
}
function spawnNotes(){
  const notes=['♪','♫','♩','♬'];
  setInterval(()=>{
    const n=document.createElement('div'); n.className='music-note';
    n.textContent=notes[Math.floor(Math.random()*notes.length)];
    n.style.cssText=`left:${10+Math.random()*80}%;bottom:${8+Math.random()*28}%;animation-duration:${3+Math.random()*2.5}s;font-size:${.7+Math.random()*.65}rem;`;
    garden.appendChild(n); setTimeout(()=>n.remove(),5600);
  },1800);
}
function startMusic() {
  bgm.volume = 0;
  bgm.play().catch(() => {});

  let v = 0;
  const f = setInterval(() => {
    v = Math.min(v + 0.05, 0.20); // 3-second fade
    bgm.volume = v;
    if(v >= 0.15) clearInterval(f);
  }, 90);

  setTimeout(() => musicHint.classList.add('show'), 3000);
  setTimeout(() => musicHint.classList.remove('show'), 7200);
}

/* THREE */
let bm, sm2, rdr, sS, bS, cam, clk, rts;
let fp={x:.5,y:.5,clicked:false}, running=false;

function initThree(){
  rdr=new THREE.WebGLRenderer({canvas,alpha:true,premultipliedAlpha:false});
  rdr.setPixelRatio(Math.min(devicePixelRatio,2));
  rdr.setClearColor(0x000000,0);
  rdr.setSize(innerWidth,innerHeight);
  sS=new THREE.Scene(); bS=new THREE.Scene();
  cam=new THREE.OrthographicCamera(-1,1,1,-1,0,10);
  clk=new THREE.Clock();
  rts=[
    new THREE.WebGLRenderTarget(innerWidth,innerHeight,{format:THREE.RGBAFormat}),
    new THREE.WebGLRenderTarget(innerWidth,innerHeight,{format:THREE.RGBAFormat})
  ];
  sm2=new THREE.ShaderMaterial({
    uniforms:{
      u_stop_time:{value:0},
      u_stop_randomizer:{value:new THREE.Vector2(Math.random(),Math.random())},
      u_cursor:{value:new THREE.Vector2(.5,.5)},
      u_ratio:{value:innerWidth/innerHeight},
      u_texture:{value:null},
      u_clean:{value:1}
    },
    vertexShader:document.getElementById('vert').textContent,
    fragmentShader:document.getElementById('frag').textContent
  });
  bm=new THREE.MeshBasicMaterial({transparent:true,depthWrite:false});
  const geo=new THREE.PlaneGeometry(2,2);
  sS.add(new THREE.Mesh(geo,sm2)); bS.add(new THREE.Mesh(geo,bm));
}

function tick(){
  if(!running) return;
  sm2.uniforms.u_texture.value=rts[0].texture;
  if(fp.clicked){
    sm2.uniforms.u_cursor.value=new THREE.Vector2(fp.x,1-fp.y);
    sm2.uniforms.u_stop_randomizer.value=new THREE.Vector2(Math.random(),Math.random());
    sm2.uniforms.u_stop_time.value=0;
    fp.clicked=false;
  }
  sm2.uniforms.u_stop_time.value+=clk.getDelta();
  rdr.setRenderTarget(rts[1]);
  rdr.setClearColor(0x000000,0); rdr.clear();
  rdr.render(sS,cam);
  bm.map=rts[1].texture;
  rdr.setRenderTarget(null);
  rdr.setClearColor(0x000000,0); rdr.clear();
  rdr.render(bS,cam);
  [rts[0],rts[1]]=[rts[1],rts[0]];
  requestAnimationFrame(tick);
}

function bloom(x,y){ fp.x=x; fp.y=y; fp.clicked=true; }

/* ═══ MAIN SEQUENCE ═══ */
landing.addEventListener('click',()=>{
  if(entered) return;
  entered=true;
  startMusic();

  // Step 1 — pink garden fades in, landing fades out simultaneously
  garden.classList.add('visible');
  spawnSparkles();
  landing.classList.add('fade-out');
  setTimeout(()=>{ landing.style.display='none'; }, 1500);

  // Step 2 — prelude starts after bg is in (2s)
  setTimeout(()=>{
    initThree();
    running=true;
    tick();

    // fade prelude layer in
    prelude.classList.add('show');

    // plant 5 flowers, one every 900ms, spread across screen
    const spots = [
  [.17,.25],
  [.50,.70],
  [.87,.25]
];
    spots.forEach(([x,y],i)=>{
      setTimeout(()=> bloom(x+(Math.random()-.5)*.04, y+(Math.random()-.5)*.04), i*1500);
    });

    // HIIIIII fades in after first two flowers are blooming
    setTimeout(()=>{ hiii.classList.add('show'); }, 2000);

    // Step 3 — hold, then fade out prelude
    // prelude shows for ~6s then dissolves
    setTimeout(()=>{
      hiii.classList.remove('show');      // text fades
      setTimeout(()=>{
        running=false;
        prelude.classList.remove('show'); // canvas fades
        prelude.classList.add('hide');
      }, 1800);

      // Step 4 — bouquet rises while prelude is fading
      setTimeout(()=>{
        spawnHearts();
        spawnGlitter();
        spawnNotes();
        bouquetWrap.classList.add('risen');
      }, 2400);

      setTimeout(()=>{ envelopeWrap.classList.add('appear'); }, 4200);

    }, 6500);

  }, 2000);
});

/* envelope / letter */
envelopeWrap.addEventListener('click',()=>{
  if(envelopeOpen) return;
  envelopeOpen=true;
  envelopeWrap.classList.add('open');
  setTimeout(()=> letterOverlay.classList.add('show'), 600);
});
const closeLett=()=>{
  letterOverlay.classList.remove('show');
  setTimeout(()=>{ envelopeWrap.classList.remove('open'); envelopeOpen=false; }, 640);
};
closeLetter.addEventListener('click',e=>{ e.stopPropagation(); closeLett(); });
letterOverlay.addEventListener('click',e=>{ if(e.target===letterOverlay) closeLett(); });