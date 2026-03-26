/* ============================================================
   Morphological Operations – Interactive Demo Script v2
   ============================================================ */
'use strict';

// ── Scroll progress + active nav ─────────────────────────────
const scrollBar = document.getElementById('scroll-bar');
const NAV_SECS = ['hero','motivation','definitions','operations','interactive','examples','parameters','takeaways'];
window.addEventListener('scroll', () => {
  const s = document.documentElement;
  scrollBar.style.transform = `scaleX(${s.scrollTop / (s.scrollHeight - s.clientHeight)})`;
  let active = NAV_SECS[0];
  for (const id of NAV_SECS) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top < 110) active = id;
  }
  document.querySelectorAll('nav ul li a').forEach(a => a.classList.toggle('active', a.id === `nav-${active}`));
});

// ── Intersection reveal ───────────────────────────────────────
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ── Kernel generators ─────────────────────────────────────────
function makeKernel(shape, radius) {
  const size = 2 * radius + 1, k = [];
  for (let r = 0; r < size; r++) {
    k.push([]);
    for (let c = 0; c < size; c++) {
      const dr = r - radius, dc = c - radius;
      let v = 0;
      if      (shape === 'square')  v = 1;
      else if (shape === 'cross')   v = (dr === 0 || dc === 0) ? 1 : 0;
      else if (shape === 'disk')    v = (dr*dr + dc*dc <= radius*radius) ? 1 : 0;
      else if (shape === 'diamond') v = (Math.abs(dr)+Math.abs(dc) <= radius) ? 1 : 0;
      k[r].push(v);
    }
  }
  return k;
}

// ── Kernel display (control panel) ────────────────────────────
function renderKernelDisplay(kernel) {
  const grid = document.getElementById('kernel-grid');
  if (!grid) return;
  const size = kernel.length, rad = Math.floor(size/2);
  grid.style.gridTemplateColumns = `repeat(${size}, 26px)`;
  grid.innerHTML = '';
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
    const cell = document.createElement('div');
    const isC = r===rad && c===rad;
    cell.className = `k-cell ${kernel[r][c] ? 'on' : 'off'}${isC ? ' center' : ''}`;
    cell.textContent = isC ? '⊕' : kernel[r][c] ? '1' : '0';
    grid.appendChild(cell);
  }
}

// ── SE visual (definitions section) ──────────────────────────
function renderSEVisual() {
  const con = document.getElementById('se-visual');
  if (!con) return;
  const shapes = ['square','cross','disk','diamond'];
  const labels = ['Square 3×3','Cross (+)','Disk','Diamond'];
  con.innerHTML = '';
  shapes.forEach((shape, i) => {
    const k = makeKernel(shape, 2), size = k.length, rad = Math.floor(size/2);
    const wrap = document.createElement('div');
    wrap.className = 'se-shape-wrap';
    const g = document.createElement('div');
    g.style.cssText = `display:inline-grid;grid-template-columns:repeat(${size},20px);gap:2px;margin-bottom:6px;`;
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
      const cell = document.createElement('div');
      const isC = r===rad && c===rad;
      cell.style.cssText = `width:20px;height:20px;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:0.6rem;font-weight:800;font-family:'Fira Code',monospace;`;
      if (k[r][c]) {
        if (isC) {
          cell.style.background = '#ffffff';
          cell.style.color = 'var(--accent)';
          cell.style.border = '2px solid var(--accent)';
          cell.style.fontWeight = '900';
        } else {
          cell.style.background = 'var(--accent)';
          cell.style.color = '#fff';
        }
        cell.textContent = isC ? '⊕' : '1';
      } else {
        cell.style.background = 'var(--bg-card3)';
        cell.style.color = 'var(--text-muted)';
        cell.style.border = '1px solid var(--border)';
        cell.textContent = '0';
      }
      g.appendChild(cell);
    }
    const lbl = document.createElement('div');
    lbl.className = 'se-shape-label';
    lbl.textContent = labels[i];
    wrap.appendChild(g); wrap.appendChild(lbl);
    con.appendChild(wrap);
  });
}

// ── FIT / HIT / MISS static visualizers ──────────────────────
function renderFHMGrids() {
  // Shared 5×5 image patch (inner square)
  const imgPatch = [
    [0,0,0,0,0],
    [0,1,1,1,0],
    [0,1,1,1,0],
    [0,1,1,1,0],
    [0,0,0,0,0],
  ];
  // SE: 3×3 cross
  const se = [[0,1,0],[1,1,1],[0,1,0]];
  // Positions: FIT=center of patch, HIT=edge, MISS=corner
  const positions = { fit:{r:2,c:2}, hit:{r:1,c:1}, miss:{r:0,c:0} };

  function buildGrid(containerId, anchorR, anchorC, klass) {
    const con = document.getElementById(containerId);
    if (!con) return;
    const size = imgPatch.length, seRad = 1;
    const g = document.createElement('div');
    g.style.cssText = `display:inline-grid;grid-template-columns:repeat(${size},22px);gap:2px;`;
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
      const cell = document.createElement('div');
      cell.style.cssText = `width:22px;height:22px;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:0.58rem;font-weight:800;font-family:'Fira Code',monospace;transition:all 0.2s;`;
      const dr = r - anchorR, dc = c - anchorC;
      const inSe = Math.abs(dr) <= seRad && Math.abs(dc) <= seRad && se[dr+seRad] && se[dr+seRad][dc+seRad];
      const isAnchor = r === anchorR && c === anchorC;
      const isImg = imgPatch[r][c] === 1;

      if (isAnchor) {
        cell.style.background = '#ffffff'; cell.style.color='var(--accent)';
        cell.style.outline = '2px solid var(--accent)';
        cell.style.fontWeight = '900';
        cell.textContent = '⊕';
      } else if (inSe && isImg) {
        cell.style.background = klass==='miss' ? 'rgba(192,57,43,0.15)' : 'rgba(0,137,123,0.15)';
        cell.style.color = klass==='miss' ? 'var(--red)' : '#00897b';
        cell.style.outline = klass==='miss' ? '1px solid var(--red)' : '1px solid #00897b';
        cell.textContent = '1';
      } else if (inSe && !isImg) {
        cell.style.background = 'rgba(255,69,96,0.2)'; cell.style.color='var(--red)';
        cell.style.outline = '1px solid rgba(255,69,96,0.5)';
        cell.textContent = '0';
      } else if (isImg) {
        cell.style.background = '#fde8e8'; cell.style.color='var(--accent)'; cell.textContent='1';
      } else {
        cell.style.background = '#f5f5f5'; cell.style.color='var(--text-muted)'; cell.textContent='0';
      }
      g.appendChild(cell);
    }
    con.appendChild(g);
  }
  buildGrid('fhm-fit',  positions.fit.r,  positions.fit.c,  'fit');
  buildGrid('fhm-hit',  positions.hit.r,  positions.hit.c,  'hit');
  buildGrid('fhm-miss', positions.miss.r, positions.miss.c, 'miss');
}

// ── Operation data ────────────────────────────────────────────
const opData = {
  erosion: {
    color:'#c0392b', emoji:'<span class="mi mi-sm">compress</span>', title:'Erosion',
    short:'Shrinks foreground regions. Output = 1 only if the SE completely <strong>FITs</strong> inside the foreground.',
    rule:'out[p] = 1  iff  SE ⊆ FG around p   (FIT)\nout[p] = 0  otherwise',
    math:'A ⊖ B = { z | Bz ⊆ A }',
    uses:['Removes small noise blobs','Separates touching objects','Strips thin protrusions','Pre-step in Opening'],
    python:`<span class="cm"># Erosion — output 1 only if entire kernel fits in foreground</span>\n<span class="vr">kernel</span> = cv2.getStructuringElement(cv2.MORPH_RECT, (<span class="nu">3</span>,<span class="nu">3</span>))\n<span class="vr">eroded</span> = cv2.erode(img, kernel, iterations=<span class="nu">1</span>)`,
    julia:`<span class="kw">using</span> ImageMorphology\n<span class="vr">eroded</span> = <span class="fn">erode</span>(img)`,
  },
  dilation: {
    color:'#1565c0', emoji:'<span class="mi mi-sm">open_in_full</span>', title:'Dilation',
    short:'Expands foreground regions. Output = 1 if the SE <strong>HITs</strong> any foreground pixel.',
    rule:'out[p] = 1  iff  SE ∩ FG ≠ ∅ around p   (HIT)\nout[p] = 0  otherwise (MISS)',
    math:'A ⊕ B = { z | B̂z ∩ A ≠ ∅ }',
    uses:['Fills small holes inside objects','Bridges narrow gaps','Amplifies / grows regions','Pre-step in Closing'],
    python:`<span class="cm"># Dilation — output 1 if kernel touches any foreground pixel</span>\n<span class="vr">kernel</span> = cv2.getStructuringElement(cv2.MORPH_RECT, (<span class="nu">3</span>,<span class="nu">3</span>))\n<span class="vr">dilated</span> = cv2.dilate(img, kernel, iterations=<span class="nu">1</span>)`,
    julia:`<span class="kw">using</span> ImageMorphology\n<span class="vr">dilated</span> = <span class="fn">dilate</span>(img)`,
  },
  opening: {
    color:'#6a0dad', emoji:'<span class="mi mi-sm">swap_horiz</span>', title:'Opening = Erosion → Dilation',
    short:'Removes small objects and smooths contours <em>without</em> significantly changing the size of larger objects.',
    rule:'A ∘ B = (A ⊖ B) ⊕ B\nErode first, then dilate with the same SE',
    math:'A ∘ B = (A ⊖ B) ⊕ B',
    uses:['Salt & pepper noise removal','Remove thin protrusions','Preserve shape of large blobs','Separate touching objects'],
    python:`<span class="cm"># Opening = erode then dilate</span>\n<span class="vr">kernel</span> = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (<span class="nu">5</span>,<span class="nu">5</span>))\n<span class="vr">opened</span> = cv2.morphologyEx(img, cv2.MORPH_OPEN, kernel)`,
    julia:`<span class="kw">using</span> ImageMorphology\n<span class="vr">opened</span> = <span class="fn">opening</span>(img)`,
  },
  closing: {
    color:'#e65100', emoji:'<span class="mi mi-sm">adjust</span>', title:'Closing = Dilation → Erosion',
    short:'Fills small holes and bridges narrow gaps without changing the overall size of objects.',
    rule:'A • B = (A ⊕ B) ⊖ B\nDilate first, then erode with the same SE',
    math:'A • B = (A ⊕ B) ⊖ B',
    uses:['Fill small interior holes','Close narrow breaks','Connect nearby objects','Smooth jagged edges (inward)'],
    python:`<span class="cm"># Closing = dilate then erode</span>\n<span class="vr">kernel</span> = cv2.getStructuringElement(cv2.MORPH_RECT, (<span class="nu">5</span>,<span class="nu">5</span>))\n<span class="vr">closed</span> = cv2.morphologyEx(img, cv2.MORPH_CLOSE, kernel)`,
    julia:`<span class="kw">using</span> ImageMorphology\n<span class="vr">closed</span> = <span class="fn">closing</span>(img)`,
  },
  gradient: {
    color:'#00897b', emoji:'<span class="mi mi-sm">border_style</span>', title:'Morphological Gradient = Dilate − Erode',
    short:'Highlights object boundaries — the morphological analogue of the image gradient.',
    rule:'gradient = dilation − erosion\nKeeps only pixels that changed between the two',
    math:'(A ⊕ B) − (A ⊖ B)',
    uses:['Edge / boundary extraction','Contour detection without directional bias','Text / sign edge detection'],
    python:`<span class="cm"># Gradient = dilate − erode</span>\n<span class="vr">kernel</span> = cv2.getStructuringElement(cv2.MORPH_RECT, (<span class="nu">3</span>,<span class="nu">3</span>))\n<span class="vr">grad</span> = cv2.morphologyEx(img, cv2.MORPH_GRADIENT, kernel)`,
    julia:'',
  },
  tophat: {
    color:'#b71c1c', emoji:'<span class="mi mi-sm">brightness_high</span>', title:'Top Hat = Original − Opened',
    short:'Extracts bright features smaller than the SE. Great for uneven illumination correction.',
    rule:'tophat = original − opening\nKeeps small bright blobs removed by opening',
    math:'A − (A ∘ B)',
    uses:['Bright spot / text detection on dark bg','Uneven illumination correction','Small bright feature extraction','Fingerprint ridge enhancement'],
    python:`<span class="cm"># Top Hat = original − opened  (bright on dark)</span>\n<span class="vr">kernel</span> = cv2.getStructuringElement(cv2.MORPH_RECT, (<span class="nu">9</span>,<span class="nu">9</span>))\n<span class="vr">tophat</span> = cv2.morphologyEx(img, cv2.MORPH_TOPHAT, kernel)`,
    julia:'',
  },
  blackhat: {
    color:'#37474f', emoji:'<span class="mi mi-sm">brightness_low</span>', title:'Black Hat = Closed − Original',
    short:'Extracts dark features smaller than the SE — the inverse of Top Hat.',
    rule:'blackhat = closing − original\nKeeps small dark blobs filled by closing',
    math:'(A • B) − A',
    uses:['Dark spot detection on bright bg','Text detection in documents','Small dark feature extraction'],
    python:`<span class="cm"># Black Hat = closed − original  (dark on bright)</span>\n<span class="vr">kernel</span> = cv2.getStructuringElement(cv2.MORPH_RECT, (<span class="nu">9</span>,<span class="nu">9</span>))\n<span class="vr">bhat</span> = cv2.morphologyEx(img, cv2.MORPH_BLACKHAT, kernel)`,
    julia:'',
  },
};

function showOp(name, btn) {
  document.querySelectorAll('.op-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const d = opData[name];
  document.getElementById('op-content').innerHTML = `
  <div class="op-desc-grid fade-in">
    <div class="op-desc-card" style="border-color:${d.color}44;">
      <div style="font-size:1.6rem;margin-bottom:0.4rem;">${d.emoji}</div>
      <h4 style="color:${d.color};font-size:1.1rem;">${d.title}</h4>
      <p style="font-size:0.88rem;color:var(--text-muted);margin:0.5rem 0 0.8rem;">${d.short}</p>
      <div class="rule">${d.rule}</div>
      <div style="margin-top:0.7rem;font-size:0.8rem;color:var(--text-muted);">Set notation: <code style="color:var(--accent);font-family:'Fira Code',monospace;">${d.math}</code></div>
    </div>
    <div class="op-desc-card">
      <h4>💡 Common Applications</h4>
      <ul>${d.uses.map(u=>`<li>${u}</li>`).join('')}</ul>
      <div style="margin-top:1.1rem;">
        <div style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:0.45rem;">Python (OpenCV)</div>
        <div class="code-block" style="font-size:0.76rem;">${d.python}</div>
        ${d.julia ? `<div style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin:0.6rem 0 0.45rem;">Julia</div>
        <div class="code-block" style="font-size:0.76rem;">${d.julia}</div>` : ''}
      </div>
    </div>
  </div>`;
}

// ── Binary grid ───────────────────────────────────────────────
const ROWS = 12, COLS = 18;
let binaryGrid = [];
let animFrame = null, isAnimating = false;
let isDragging = false, dragValue = null;
let currentGlobalOp = 'opening';
let currentGlobalR = 3;
let currentGlobalShape = 'square';

const PRESETS = {
  'letter-A': [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0],
    [0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0],
    [0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  'slide-shape': [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0,0],
    [0,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0,0],
    [0,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0,0],
    [0,0,0,1,1,1,1,1,0,0,1,1,1,0,0,0,0,0],
    [0,0,0,1,1,1,1,1,0,0,1,1,1,0,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,0,0,1,1,1,0,0,1,1,1,1,1,0,0,0],
    [0,0,0,0,0,1,1,1,0,0,1,1,1,1,1,0,0,0],
    [0,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0,0],
    [0,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0,0],
    [0,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  'circle': [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0],
    [0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
    [0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
    [0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
    [0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  'thick': [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0],
    [0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  'noise': (() => {
    const g = [];
    const rng = { s:42, next() { this.s=(this.s*1664525+1013904223)&0xffffffff; return (this.s>>>0)/0xffffffff; }};
    for (let r=0;r<ROWS;r++){g.push([]);for(let c=0;c<COLS;c++){
      const inR=r>1&&r<10&&c>2&&c<15;
      const hole=(r===5&&(c===6||c===7||c===8));
      const noise=rng.next()<0.06;
      g[r].push(inR&&!hole?1:(noise?1:0));
    }}return g;
  })(),
  'demo': [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,1,1,1,1,0,0,0,0,1,1,1,0,0,0],
    [0,0,1,1,1,1,0,0,0,0,0,1,1,1,1,0,0,0],
    [0,0,0,1,1,0,0,0,0,0,1,1,1,1,1,0,0,0],
    [0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
};

function clearGrid() {
  binaryGrid = Array.from({length:ROWS},()=>Array(COLS).fill(0));
  renderBinaryGrid(); clearOutputCanvases();
}
function resetGrid() { loadPreset('letter-A'); }
function loadPreset(name) {
  const p = PRESETS[name];
  binaryGrid = p.map(r=>[...r]);
  renderBinaryGrid(); clearOutputCanvases(); resetCompPanel();
}
function clearOutputCanvases() {
  ['canvas-input','canvas-output','canvas-diff'].forEach(id=>{
    const c=document.getElementById(id);
    if(c){const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);}
  });
}
function resetCompPanel() {
  document.getElementById('comp-pos').textContent = 'Pixel [–, –]';
  document.getElementById('comp-overlap').textContent = '–/–';
  document.getElementById('comp-status').textContent = '–';
  document.getElementById('comp-rule').textContent = '–';
  document.getElementById('comp-output').innerHTML = '';
  renderMiniKernel(null, null);
}

function renderBinaryGrid() {
  const con = document.getElementById('binary-grid');
  if (!con) return;
  con.style.gridTemplateColumns = `repeat(${COLS}, 38px)`;
  con.innerHTML = '';
  for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) {
    const cell = document.createElement('div');
    cell.className = `b-cell val${binaryGrid[r][c]}`;
    cell.textContent = binaryGrid[r][c];
    cell.dataset.r = r; cell.dataset.c = c;
    cell.addEventListener('mousedown', e => {
      e.preventDefault(); isDragging = true;
      dragValue = binaryGrid[r][c] === 0 ? 1 : 0;
      toggleCell(r, c, dragValue);
    });
    cell.addEventListener('mouseenter', () => { if(isDragging) toggleCell(r,c,dragValue); });
    con.appendChild(cell);
  }
  document.addEventListener('mouseup', ()=>{ isDragging=false; }, {once:false});
}

function toggleCell(r,c,val) {
  binaryGrid[r][c]=val;
  const con=document.getElementById('binary-grid');
  const cells=con.querySelectorAll('.b-cell');
  const cell=cells[r*COLS+c];
  cell.className=`b-cell val${val}`;
  cell.textContent=val;
}

// ── Get all HTML grid cells ───────────────────────────────────
function getGridCells() { return document.getElementById('binary-grid').querySelectorAll('.b-cell'); }

function clearGridOverlay() {
  getGridCells().forEach(cell => {
    const v = cell.textContent;
    cell.className = `b-cell val${v}`;
  });
}

function applyGridOverlay(centerR, centerC, kernel, hitMissState) {
  const cells = getGridCells();
  const rad = Math.floor(kernel.length/2);
  clearGridOverlay();
  for (let kr=0; kr<kernel.length; kr++) for (let kc=0; kc<kernel[0].length; kc++) {
    const nr = centerR + kr - rad, nc = centerC + kc - rad;
    if (nr<0||nr>=ROWS||nc<0||nc>=COLS) continue;
    const idx = nr*COLS+nc;
    const cell = cells[idx];
    if (!kernel[kr][kc]) { cell.classList.add('k-range'); continue; }
    const isCenter = nr===centerR && nc===centerC;
    if (isCenter) cell.classList.add('k-center');
    if (hitMissState && hitMissState[kr] !== undefined && hitMissState[kr][kc] !== undefined) {
      cell.classList.add(hitMissState[kr][kc] ? 'k-hit' : 'k-miss');
    }
  }
}

// ── Mini kernel panel ─────────────────────────────────────────
function renderMiniKernel(kernel, hitState) {
  const grid = document.getElementById('mini-kernel-grid');
  if (!grid) return;
  if (!kernel) { grid.innerHTML = '<div style="color:var(--text-muted);font-size:0.75rem;padding:0.5rem;">Run animation…</div>'; return; }
  const size = kernel.length, rad = Math.floor(size/2);
  grid.style.gridTemplateColumns = `repeat(${size}, 20px)`;
  grid.innerHTML = '';
  for (let r=0; r<size; r++) for (let c=0; c<size; c++) {
    const cell = document.createElement('div');
    const isC = r===rad && c===rad;
    let cls = 'mk-cell ';
    if (!kernel[r][c]) cls += 'mk-off';
    else if (hitState && hitState[r] && hitState[r][c] !== undefined) {
      cls += hitState[r][c] ? 'mk-hit' : 'mk-miss';
    } else cls += 'mk-on';
    if (isC) cls += ' mk-center';
    cell.className = cls;
    cell.textContent = kernel[r][c] ? (isC ? '⊕' : '1') : '0';
    grid.appendChild(cell);
  }
}

// ── Update computation panel ──────────────────────────────────
function updateCompPanel(r, c, kernel, hitMissState, op) {
  document.getElementById('comp-pos').textContent = `Pixel [${r}, ${c}]`;
  let hits=0, total=0;
  const flat = [];
  for (let kr=0; kr<kernel.length; kr++) for (let kc=0; kc<kernel[0].length; kc++) {
    if (kernel[kr][kc]) { total++; if(hitMissState[kr]&&hitMissState[kr][kc]) { hits++; flat.push('green'); } else flat.push('red'); }
  }
  const isFit = hits===total;
  const isHit = hits>0;
  document.getElementById('comp-overlap').textContent = `${hits}/${total}`;
  const statusEl = document.getElementById('comp-status');
  if (isFit)      { statusEl.textContent='✅ FIT';  statusEl.className='stat-val stat-fit'; }
  else if (isHit) { statusEl.textContent='⚡ HIT';  statusEl.className='stat-val stat-hit'; }
  else            { statusEl.textContent='❌ MISS'; statusEl.className='stat-val stat-miss'; }

  let rule='';
  if (op==='erosion')  rule = isFit ? 'FIT → output <b>1</b>' : 'Not FIT → output <b>0</b>';
  else if (op==='dilation') rule = isHit ? 'HIT → output <b>1</b>' : 'MISS → output <b>0</b>';
  else rule = `Computed from primitive ops`;
  document.getElementById('comp-rule').innerHTML = rule;

  const outVal = (op==='erosion') ? (isFit?1:0) : (op==='dilation') ? (isHit?1:0) : '?';
  const outEl = document.getElementById('comp-output');
  if (outVal !== '?') {
    outEl.innerHTML = `<div class="comp-result-badge ${outVal?'badge-1':'badge-0'}">output[${r}][${c}] = ${outVal}</div>`;
  } else { outEl.innerHTML=''; }

  renderMiniKernel(kernel, hitMissState);
}

// ── Morphological ops (binary) ────────────────────────────────
function applyMorphOp(grid, kernel, op, polarity) {
  const rows=grid.length, cols=grid[0].length;
  const kR=Math.floor(kernel.length/2), kC=Math.floor(kernel[0].length/2);
  const img = polarity==='black' ? grid.map(row=>row.map(v=>v^1)) : grid.map(row=>[...row]);

  function erode(src) {
    const out=Array.from({length:rows},()=>Array(cols).fill(0));
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
      let fit=true;
      outer: for(let kr=0;kr<kernel.length;kr++) for(let kc=0;kc<kernel[0].length;kc++){
        if(!kernel[kr][kc]) continue;
        const nr=r+kr-kR,nc=c+kc-kC;
        if(nr<0||nr>=rows||nc<0||nc>=cols||!src[nr][nc]){fit=false;break outer;}
      }
      out[r][c]=fit?1:0;
    }
    return out;
  }
  function dilate(src) {
    const out=Array.from({length:rows},()=>Array(cols).fill(0));
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
      let hit=false;
      outer: for(let kr=0;kr<kernel.length;kr++) for(let kc=0;kc<kernel[0].length;kc++){
        if(!kernel[kr][kc]) continue;
        const nr=r+kr-kR,nc=c+kc-kC;
        if(nr>=0&&nr<rows&&nc>=0&&nc<cols&&src[nr][nc]){hit=true;break outer;}
      }
      out[r][c]=hit?1:0;
    }
    return out;
  }

  let result;
  switch(op){
    case 'erosion':  result=erode(img); break;
    case 'dilation': result=dilate(img); break;
    case 'opening':  result=dilate(erode(img)); break;
    case 'closing':  result=erode(dilate(img)); break;
    case 'gradient': { const d=dilate(img),e=erode(img); result=d.map((row,r)=>row.map((v,c)=>Math.max(0,v-e[r][c]))); break; }
    case 'tophat':   { const o=dilate(erode(img)); result=img.map((row,r)=>row.map((v,c)=>Math.max(0,v-o[r][c]))); break; }
    case 'blackhat': { const cl=erode(dilate(img)); result=cl.map((row,r)=>row.map((v,c)=>Math.max(0,v-img[r][c]))); break; }
    default: result=img;
  }
  return polarity==='black' ? result.map(row=>row.map(v=>v^1)) : result;
}

// ── Draw grid on canvas ───────────────────────────────────────
function drawGridOnCanvas(canvasId, grid, hrC, hrR, kernel, diffBase) {
  const canvas=document.getElementById(canvasId); if(!canvas) return;
  const rows=grid.length, cols=grid[0].length;

  // Match canvas resolution to actual display size × devicePixelRatio → sharp text
  const dpr=window.devicePixelRatio||1;
  const rect=canvas.getBoundingClientRect();
  const dispW=rect.width||canvas.offsetWidth||400;
  const dispH=rect.height||canvas.offsetHeight||300;
  canvas.width=Math.round(dispW*dpr);
  canvas.height=Math.round(dispH*dpr);
  const ctx=canvas.getContext('2d');
  ctx.scale(dpr,dpr);
  const pw=dispW/cols, ph=dispH/rows;
  ctx.clearRect(0,0,dispW,dispH);
  const kR=kernel?Math.floor(kernel.length/2):0;

  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
    const v=grid[r][c];
    const inK=kernel&&hrC!==undefined&&Math.abs(r-hrR)<=kR&&Math.abs(c-hrC)<=kR&&kernel[r-hrR+kR]&&kernel[r-hrR+kR][c-hrC+kR];
    if(diffBase){
      const o=diffBase[r][c];
      ctx.fillStyle=v===o?(v?'#fde8e8':'#f5f5f5'):(v>o?'rgba(0,137,123,0.3)':'rgba(192,57,43,0.2)');
    } else if(inK){
      ctx.fillStyle=v?'rgba(192,57,43,0.18)':'rgba(0,0,0,0.04)';
    } else {
      ctx.fillStyle=v?'#fde8e8':'#f5f5f5';
    }
    ctx.fillRect(c*pw,r*ph,pw,ph);
    ctx.fillStyle=v?(inK?'#c0392b':'#c0392b'):'#d0d0d0';
    ctx.font=`bold ${Math.max(7,pw*0.38)}px "Fira Code",monospace`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(v,c*pw+pw/2,r*ph+ph/2);
  }
  if(kernel&&hrC!==undefined){
    const kS=kernel.length, sR=hrR-kR, sC=hrC-kR;
    ctx.strokeStyle='#c0392b'; ctx.lineWidth=2.5;
    ctx.strokeRect(sC*pw,sR*ph,kS*pw,kS*ph);
    ctx.strokeStyle='rgba(0,137,123,0.8)'; ctx.lineWidth=1.5;
    ctx.strokeRect(hrC*pw+2,hrR*ph+2,pw-4,ph-4);
  }
  ctx.strokeStyle='rgba(0,0,0,0.06)'; ctx.lineWidth=0.5;
  for(let r=0;r<=rows;r++){ctx.beginPath();ctx.moveTo(0,r*ph);ctx.lineTo(dispW,r*ph);ctx.stroke();}
  for(let c=0;c<=cols;c++){ctx.beginPath();ctx.moveTo(c*pw,0);ctx.lineTo(c*pw,dispH);ctx.stroke();}
}

// ── Controls helpers ──────────────────────────────────────────
function getControls() {
  const speedMap=[600,300,120,60,25];
  const spIdx=parseInt(document.getElementById('ctrl-speed').value)-1;
  return {
    op:      document.getElementById('ctrl-op').value,
    kshape:  document.getElementById('ctrl-kshape').value,
    radius:  parseInt(document.getElementById('ctrl-radius').value),
    iter:    parseInt(document.getElementById('ctrl-iter').value),
    polarity:document.getElementById('ctrl-polarity').value,
    stepMs:  speedMap[spIdx] ?? 120,
  };
}

function setStepInfo(html) { document.getElementById('step-info').innerHTML = html; }

// ── Apply instantly ───────────────────────────────────────────
function applyOperation() {
  stopAnimate();
  const ctrl=getControls(), kernel=makeKernel(ctrl.kshape,ctrl.radius);
  let result=binaryGrid.map(r=>[...r]);
  for(let i=0;i<ctrl.iter;i++) result=applyMorphOp(result,kernel,ctrl.op,ctrl.polarity);
  const W=250,H=200;
  ['canvas-input','canvas-output','canvas-diff'].forEach(id=>{
    const c=document.getElementById(id); c.width=W; c.height=H;
  });
  drawGridOnCanvas('canvas-input',binaryGrid,undefined,undefined,null,null);
  drawGridOnCanvas('canvas-output',result,undefined,undefined,null,null);
  drawGridOnCanvas('canvas-diff',result,undefined,undefined,null,binaryGrid);
  document.getElementById('canvas-out-label').textContent=`Output (${ctrl.op})`;
  setStepInfo(`✅ Applied <b>${ctrl.op}</b> · kernel ${ctrl.kshape} r=${ctrl.radius} · ${ctrl.iter}× iteration(s).`);
  updateCodeDisplay(ctrl);
  clearGridOverlay();
}

// ── Animate ───────────────────────────────────────────────────
function toggleAnimate() { isAnimating ? stopAnimate() : startAnimate(); }

function stopAnimate() {
  if(animFrame){cancelAnimationFrame(animFrame);animFrame=null;}
  isAnimating=false;
  const btn=document.getElementById('btn-anim');
  if(btn){btn.innerHTML='<span class="mi mi-sm">animation</span> Animate';btn.classList.remove('running');}
  clearGridOverlay();
}

function startAnimate() {
  const ctrl=getControls(), kernel=makeKernel(ctrl.kshape,ctrl.radius);
  renderKernelDisplay(kernel);
  const W=250, H=200;
  ['canvas-input','canvas-output','canvas-diff'].forEach(id=>{
    const c=document.getElementById(id); c.width=W; c.height=H;
  });

  // Compute final result
  let finalResult=binaryGrid.map(r=>[...r]);
  for(let i=0;i<ctrl.iter;i++) finalResult=applyMorphOp(finalResult,kernel,ctrl.op,ctrl.polarity);

  const rows=binaryGrid.length, cols=binaryGrid[0].length;
  const kR=Math.floor(kernel.length/2);
  let partialOut=Array.from({length:rows},()=>Array(cols).fill(0));

  isAnimating=true;
  const btn=document.getElementById('btn-anim');
  btn.innerHTML='<span class="mi mi-sm">stop</span> Stop'; btn.classList.add('running');

  let r=0,c=0,lastTs=0;

  // Build hit/miss state for a pixel
  function getHitMiss(pr,pc) {
    const state=kernel.map(row=>row.map(()=>null));
    for(let kr=0;kr<kernel.length;kr++) for(let kc=0;kc<kernel[0].length;kc++){
      if(!kernel[kr][kc]) continue;
      const nr=pr+kr-kR, nc=pc+kc-kR;
      state[kr][kc]=(nr>=0&&nr<rows&&nc>=0&&nc<cols&&binaryGrid[nr][nc]===1);
    }
    return state;
  }

  function step(ts) {
    if(!isAnimating)return;
    if(ts-lastTs < ctrl.stepMs){animFrame=requestAnimationFrame(step);return;}
    lastTs=ts;
    if(r>=rows){
      stopAnimate();
      drawGridOnCanvas('canvas-diff',finalResult,undefined,undefined,null,binaryGrid);
      setStepInfo(`✅ Animation complete! <b>${ctrl.op}</b> finished.`);
      clearGridOverlay(); resetCompPanel();
      return;
    }

    partialOut[r][c]=finalResult[r][c];
    const hitMiss=getHitMiss(r,c);
    let hits=0,total=0;
    for(let kr=0;kr<kernel.length;kr++) for(let kc=0;kc<kernel[0].length;kc++){
      if(!kernel[kr][kc])continue; total++;
      if(hitMiss[kr][kc]) hits++;
    }
    const isFit=hits===total, isHit=hits>0;
    const statusStr=isFit?'✅ FIT':isHit?'⚡ HIT':'❌ MISS';
    const outputVal=finalResult[r][c];

    drawGridOnCanvas('canvas-input', binaryGrid, c, r, kernel, null);
    drawGridOnCanvas('canvas-output', partialOut, c, r, kernel, null);
    applyGridOverlay(r, c, kernel, hitMiss);
    updateCompPanel(r, c, kernel, hitMiss, ctrl.op);

    const rule=ctrl.op==='erosion'?'(1 on FIT only)':ctrl.op==='dilation'?'(1 on HIT)':'';
    setStepInfo(`Scanning <b>[${r}, ${c}]</b> &nbsp;|&nbsp; overlap <b>${hits}/${total}</b> &nbsp;|&nbsp; <b>${statusStr}</b> &nbsp;|&nbsp; output <b class="hl">${outputVal}</b> ${rule}`);

    c++;if(c>=cols){c=0;r++;}
    animFrame=requestAnimationFrame(step);
  }
  animFrame=requestAnimationFrame(step);
  updateCodeDisplay(ctrl);
}

// ── Code display ──────────────────────────────────────────────
const kmap={square:'RECT',cross:'CROSS',disk:'ELLIPSE',diamond:'RECT'};
const codeTpl={
  erosion:  c=>`<span class="kw">import</span> cv2\n<span class="vr">kernel</span> = cv2.getStructuringElement(cv2.MORPH_${kmap[c.kshape]}, (<span class="nu">${2*c.radius+1}</span>,<span class="nu">${2*c.radius+1}</span>))\n<span class="vr">result</span> = cv2.erode(img, kernel, iterations=<span class="nu">${c.iter}</span>)`,
  dilation: c=>`<span class="kw">import</span> cv2\n<span class="vr">kernel</span> = cv2.getStructuringElement(cv2.MORPH_${kmap[c.kshape]}, (<span class="nu">${2*c.radius+1}</span>,<span class="nu">${2*c.radius+1}</span>))\n<span class="vr">result</span> = cv2.dilate(img, kernel, iterations=<span class="nu">${c.iter}</span>)`,
  opening:  c=>`<span class="kw">import</span> cv2\n<span class="vr">kernel</span> = cv2.getStructuringElement(cv2.MORPH_${kmap[c.kshape]}, (<span class="nu">${2*c.radius+1}</span>,<span class="nu">${2*c.radius+1}</span>))\n<span class="vr">result</span> = cv2.morphologyEx(img, cv2.MORPH_OPEN, kernel, iterations=<span class="nu">${c.iter}</span>)`,
  closing:  c=>`<span class="kw">import</span> cv2\n<span class="vr">kernel</span> = cv2.getStructuringElement(cv2.MORPH_${kmap[c.kshape]}, (<span class="nu">${2*c.radius+1}</span>,<span class="nu">${2*c.radius+1}</span>))\n<span class="vr">result</span> = cv2.morphologyEx(img, cv2.MORPH_CLOSE, kernel, iterations=<span class="nu">${c.iter}</span>)`,
  gradient: c=>`<span class="kw">import</span> cv2\n<span class="vr">kernel</span> = cv2.getStructuringElement(cv2.MORPH_${kmap[c.kshape]}, (<span class="nu">${2*c.radius+1}</span>,<span class="nu">${2*c.radius+1}</span>))\n<span class="vr">result</span> = cv2.morphologyEx(img, cv2.MORPH_GRADIENT, kernel)`,
  tophat:   c=>`<span class="kw">import</span> cv2\n<span class="vr">kernel</span> = cv2.getStructuringElement(cv2.MORPH_${kmap[c.kshape]}, (<span class="nu">${2*c.radius+1}</span>,<span class="nu">${2*c.radius+1}</span>))\n<span class="vr">result</span> = cv2.morphologyEx(img, cv2.MORPH_TOPHAT, kernel)`,
  blackhat: c=>`<span class="kw">import</span> cv2\n<span class="vr">kernel</span> = cv2.getStructuringElement(cv2.MORPH_${kmap[c.kshape]}, (<span class="nu">${2*c.radius+1}</span>,<span class="nu">${2*c.radius+1}</span>))\n<span class="vr">result</span> = cv2.morphologyEx(img, cv2.MORPH_BLACKHAT, kernel)`,
};
function updateCodeDisplay(ctrl) {
  const el=document.getElementById('code-display'); if(!el)return;
  el.innerHTML=(codeTpl[ctrl.op]||codeTpl.erosion)(ctrl);
}

// ── Control listeners ─────────────────────────────────────────
function setupControls() {
  const opSel=document.getElementById('ctrl-op');
  const kshape=document.getElementById('ctrl-kshape');
  const radiusSl=document.getElementById('ctrl-radius');
  const iterSl=document.getElementById('ctrl-iter');
  const speedSl=document.getElementById('ctrl-speed');
  const polarity=document.getElementById('ctrl-polarity');

  opSel.addEventListener('change',()=>{ document.getElementById('op-val').textContent=opSel.options[opSel.selectedIndex].text; updateCodeDisplay(getControls()); });
  kshape.addEventListener('change',()=>{ document.getElementById('ks-val').textContent=kshape.options[kshape.selectedIndex].text; renderKernelDisplay(makeKernel(kshape.value,parseInt(radiusSl.value))); });
  radiusSl.addEventListener('input',()=>{ document.getElementById('kr-val').textContent=radiusSl.value; renderKernelDisplay(makeKernel(kshape.value,parseInt(radiusSl.value))); });
  iterSl.addEventListener('input',()=>{ document.getElementById('it-val').textContent=iterSl.value; });
  const speedLabels=['Slowest','Slow','Medium','Fast','Fastest'];
  speedSl.addEventListener('input',()=>{ document.getElementById('sp-val').textContent=speedLabels[parseInt(speedSl.value)-1]; });
  polarity.addEventListener('change',()=>{ document.getElementById('po-val').textContent=polarity.value==='white'?'White=FG':'Black=FG'; });
}

// ── Real image examples ───────────────────────────────────────
function setGlobalOp(op, btn) {
  currentGlobalOp = op;
  const parent = btn.parentElement;
  parent.querySelectorAll('.btn-toggle').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderAllExamples();
}

function setGlobalR(r, btn) {
  currentGlobalR = r;
  const parent = btn.parentElement;
  parent.querySelectorAll('.btn-toggle').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderAllExamples();
}

function setGlobalShape(shape, btn) {
  currentGlobalShape = shape;
  const parent = btn.parentElement;
  parent.querySelectorAll('.btn-toggle').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderAllExamples();
}

function renderAllExamples() {
  [1, 2, 3].forEach(i => renderExample(i));
}

function renderExample(idx) {
  const op = currentGlobalOp, r = currentGlobalR, shape = currentGlobalShape;
  
  // Update the label to show current operation
  const labelEl = document.getElementById(`ex${idx}-label`);
  if (labelEl) labelEl.textContent = `${op} (r=${r}, ${shape})`;

  const srcs = {1:'images/Morphorlogical Operations.png', 2:'images/Gausian Blur.png', 3:'images/TIme Squre.png'};
  const src = srcs[idx];
  const img = new Image();
  img.onload = () => processImageOnCanvas(img, `ex${idx}-canvas`, op, r, shape, `ex${idx}-label`);
  img.onerror = () => { console.warn('Image load failed:', src); };
  img.src = src;
}

function processImageOnCanvas(srcImg,canvasId,op,radius,shape,labelId){
  const canvas=document.getElementById(canvasId); if(!canvas) return;
  const ctx=canvas.getContext('2d');
  const w=srcImg.naturalWidth||srcImg.width||512, h=srcImg.naturalHeight||srcImg.height||512;
  canvas.width=w; canvas.height=h;
  
  try {
    const off=document.createElement('canvas'); off.width=w; off.height=h;
    const octx=off.getContext('2d'); octx.drawImage(srcImg,0,0);
    const data=octx.getImageData(0,0,w,h).data;
    const gray=new Float32Array(w*h);
    for(let i=0;i<w*h;i++) gray[i]=(0.299*data[i*4]+0.587*data[i*4+1]+0.114*data[i*4+2])/255;

    function isInside(kr, kc) {
      if (shape === 'square') return true;
      if (shape === 'cross') return Math.abs(kr) + Math.abs(kc) <= radius;
      if (shape === 'circle') return kr*kr + kc*kc <= radius*radius;
      return true;
    }

    function erodeG(src){const o=new Float32Array(w*h);for(let r=0;r<h;r++)for(let c=0;c<w;c++){let mn=1;for(let kr=-radius;kr<=radius;kr++)for(let kc=-radius;kc<=radius;kc++){if(!isInside(kr,kc))continue;const nr=r+kr,nc=c+kc;if(nr<0||nr>=h||nc<0||nc>=w)continue;mn=Math.min(mn,src[nr*w+nc]);}o[r*w+c]=mn;}return o;}
    function dilateG(src){const o=new Float32Array(w*h);for(let r=0;r<h;r++)for(let c=0;c<w;c++){let mx=0;for(let kr=-radius;kr<=radius;kr++)for(let kc=-radius;kc<=radius;kc++){if(!isInside(kr,kc))continue;const nr=r+kr,nc=c+kc;if(nr<0||nr>=h||nc<0||nc>=w)continue;mx=Math.max(mx,src[nr*w+nc]);}o[r*w+c]=mx;}return o;}

    let result;
    switch(op){
      case 'erosion':   result=erodeG(gray); break;
      case 'dilation':  result=dilateG(gray); break;
      case 'opening':   result=dilateG(erodeG(gray)); break;
      case 'closing':   result=erodeG(dilateG(gray)); break;
      case 'gradient': { const d=dilateG(gray),e=erodeG(gray); result=d.map((v,i)=>Math.max(0,v-e[i])); break; }
      case 'tophat':   { const o=dilateG(erodeG(gray)); result=gray.map((v,i)=>Math.max(0,v-o[i])); break; }
      case 'blackhat': { const cl=erodeG(dilateG(gray)); result=cl.map((v,i)=>Math.max(0,v-gray[i])); break; }
      default: result=gray;
    }
    const out=ctx.createImageData(w,h);
    for(let i=0;i<w*h;i++){const v=Math.round(result[i]*255);out.data[i*4]=v;out.data[i*4+1]=v;out.data[i*4+2]=v;out.data[i*4+3]=255;}
    ctx.putImageData(out,0,0);
  } catch (err) {
    console.error(err);
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, w, h);
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    
    if (err.name === 'SecurityError' || err.message.includes('tainted')) {
      ctx.fillStyle = '#e74c3c';
      ctx.fillText('⚠️ Security Mismatch', w/2, h/2 - 20);
      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#7f8c8d';
      ctx.fillText('Please open via Open Live Server', w/2, h/2 + 10);
      ctx.fillText('or http://localhost:8080', w/2, h/2 + 35);
    } else {
      ctx.fillStyle = '#e74c3c';
      ctx.fillText('Canvas Error', w/2, h/2);
    }
  }
}

// ── Init ──────────────────────────────────────────────────────
// ── Op Showcases ──────────────────────────────────────────────
function drawOpCanvasDark(canvasId, grid) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !grid || !grid.length) return;
  const rows = grid.length, cols = grid[0].length;

  // Use offsetWidth first (reliable after layout); fallback to 600
  const dispW = canvas.offsetWidth || 600;
  // Keep cells square
  const dispH = Math.round(dispW * rows / cols);

  const dpr = window.devicePixelRatio || 1;
  canvas.width  = Math.round(dispW * dpr);
  canvas.height = Math.round(dispH * dpr);
  canvas.style.height = dispH + 'px';   // fix CSS height to match

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const pw = dispW / cols, ph = dispH / rows;

  // dark background
  ctx.fillStyle = '#111111';
  ctx.fillRect(0, 0, dispW, dispH);

  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const v = grid[r][c];
    if (v) {
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(c*pw+1, r*ph+1, pw-2, ph-2);
    }
    ctx.fillStyle = v ? '#ffffff' : '#444444';
    ctx.font = `bold ${Math.max(6, pw*0.42)}px "Fira Code",monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(v, c*pw+pw/2, r*ph+ph/2);
  }
  // subtle grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 0.5;
  for (let i = 0; i <= rows; i++) { ctx.beginPath(); ctx.moveTo(0,i*ph); ctx.lineTo(dispW,i*ph); ctx.stroke(); }
  for (let j = 0; j <= cols; j++) { ctx.beginPath(); ctx.moveTo(j*pw,0); ctx.lineTo(j*pw,dispH); ctx.stroke(); }
}

function renderOpShowcases() {
  // Use the slide-shape preset as source image
  const src = PRESETS['slide-shape'];
  if (!src) return;
  const ker = makeKernel('square', 1);  // 3×3 square kernel

  const eroded   = applyMorphOp(src, ker, 'erosion');
  const dilated  = applyMorphOp(src, ker, 'dilation');
  const opened   = applyMorphOp(applyMorphOp(src, ker, 'erosion'),  ker, 'dilation');
  const closed   = applyMorphOp(applyMorphOp(src, ker, 'dilation'), ker, 'erosion');

  // Erosion
  drawOpCanvasDark('ops-erosion-in',   src);
  drawOpCanvasDark('ops-erosion-out',  eroded);
  // Dilation
  drawOpCanvasDark('ops-dilation-in',  src);
  drawOpCanvasDark('ops-dilation-out', dilated);
  // Opening & Closing tree
  drawOpCanvasDark('ops-oc-orig',      src);
  drawOpCanvasDark('ops-closing-mid',  dilated);  // closing path: dilate first
  drawOpCanvasDark('ops-opening-mid',  eroded);   // opening path: erode first
  drawOpCanvasDark('ops-closing-out',  closed);
  drawOpCanvasDark('ops-opening-out',  opened);
}

document.addEventListener('DOMContentLoaded', () => {
  renderSEVisual();
  renderFHMGrids();
  setupControls();
  const ctrl=getControls();
  renderKernelDisplay(makeKernel(ctrl.kshape,ctrl.radius));
  updateCodeDisplay(ctrl);
  loadPreset('letter-A');
  ['canvas-input','canvas-output','canvas-diff'].forEach(id=>{
    const c=document.getElementById(id); if(c){c.width=250;c.height=200;}
  });
  renderMiniKernel(null, null);
  setTimeout(renderAllExamples, 150);
  // Render op showcases after layout is stable
  setTimeout(renderOpShowcases, 400);
});

// ── Lightbox ──────────────────────────────────────────────────
function openLightbox(el) {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  if (el.tagName === 'CANVAS') img.src = el.toDataURL();
  else img.src = el.src;
  lb.style.display = 'block';
}

function closeLightbox(e) {
  if (e && e.target.id === 'lightbox-img') return;
  document.getElementById('lightbox').style.display = 'none';
}
