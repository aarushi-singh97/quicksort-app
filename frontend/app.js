let steps = [], current = 0, boxEls = [], idxEls = [], tagIEls = [], tagJEls = [], rangeBarEl, n = 0, minVal = 0, maxVal = 0;
const SLOT = 54;
let barsMode = false, playing = false, playTimer = null;

function parseInput(text) {
  const parts = text.split(',').map(s => s.trim()).filter(s => s.length);
  if (parts.length === 0) throw new Error('Enter some integers first, e.g. 5, 1, 4, 2.');
  if (parts.length < 2) throw new Error('Enter at least 2 integers, separated by commas.');
  if (parts.length > 14) throw new Error('Keep it to 14 numbers or fewer so the boxes stay readable.');
  return parts.map(p => {
    if (!/^-?\d+$/.test(p)) throw new Error(`"${p}" isn't a whole number.`);
    return parseInt(p, 10);
  });
}

// A small browser version creates the visual steps.  The same Hoare logic is
// shown in quicksort.c, which is the C program submitted with this project.
function generateSteps(input) {
  const arr = [...input], out = [];
  const snap = (desc, extra = {}) => out.push({ array: [...arr], swapped: null, sorted: false, ...extra, desc });
  function partition(low, high) {
    const pivotValue = arr[low]; let i = low - 1, j = high + 1;
    snap(`Pivot is arr[${low}] = ${pivotValue}.`, { low, high, pivotValue });
    while (true) {
      do { i++; } while (arr[i] < pivotValue);
      do { j--; } while (arr[j] > pivotValue);
      snap(`i = ${i}, j = ${j}.`, { low, high, i, j, pivotValue });
      if (i >= j) return j;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      snap(`Swap arr[${i}] and arr[${j}].`, { low, high, i, j, pivotValue, swapped: [i, j] });
    }
  }
  function quicksort(low, high) {
    if (low < high) {
      const split = partition(low, high);
      quicksort(low, split);       // split stays in the left part for Hoare
      quicksort(split + 1, high);
    }
  }
  snap('Starting Quick Sort with Hoare partition.', { low: 0, high: arr.length - 1 });
  quicksort(0, arr.length - 1);
  snap('Done — the array is sorted.', { low: 0, high: arr.length - 1, sorted: true });
  return out;
}

function setupStage(arr) {
  n = arr.length;
  minVal = Math.min(...arr); maxVal = Math.max(...arr);
  const stage = document.getElementById('stage');
  stage.innerHTML = '';
  stage.style.width = (n * SLOT) + 'px';
  boxEls = arr.map((v, i) => {
    const el = document.createElement('div');
    el.className = 'box-el';
    el.textContent = v;
    el.style.left = (i * SLOT) + 'px';
    stage.appendChild(el);
    return { el, slot: i, value: v };
  });
  idxEls = []; tagIEls = []; tagJEls = [];
  for (let i = 0; i < n; i++) {
    const idx = document.createElement('div'); idx.className = 'slot-idx'; idx.style.left = (i * SLOT) + 'px'; idx.textContent = i; stage.appendChild(idx); idxEls.push(idx);
    const ti = document.createElement('div'); ti.className = 'slot-tag i'; ti.style.left = (i * SLOT) + 'px'; stage.appendChild(ti); tagIEls.push(ti);
    const tj = document.createElement('div'); tj.className = 'slot-tag j'; tj.style.left = (i * SLOT) + 'px'; stage.appendChild(tj); tagJEls.push(tj);
  }
  rangeBarEl = document.createElement('div'); rangeBarEl.className = 'range-bar-el'; stage.appendChild(rangeBarEl);
  applyBarsMode();
}

function applyBarsMode() {
  boxEls.forEach(b => {
    if (barsMode) { b.el.style.height = (24 + Math.round(((b.value - minVal) / Math.max(1, maxVal - minVal)) * 90)) + 'px'; }
    else { b.el.style.height = ''; }
  });
  document.getElementById('stage').classList.toggle('bars', barsMode);
}

function renderVars(step) {
  const fmt = v => (v === undefined ? '\u2014' : v);
  document.getElementById('varPanel').innerHTML = [
    ['low', step.low], ['high', step.high], ['i', step.i], ['j', step.j], ['pivot', step.pivotValue]
  ].map(([k, v]) => `<div class="vchip"><span class="vk">${k}</span><span class="vv">${fmt(v)}</span></div>`).join('');
}

function renderStep(step, opts) {
  opts = opts || {};
  if (opts.swap) {
    const [i, j] = opts.swap;
    const a = boxEls.find(b => b.slot === i), b2 = boxEls.find(b => b.slot === j);
    if (a && b2) { const t = a.slot; a.slot = b2.slot; b2.slot = t; a.el.style.left = (a.slot * SLOT) + 'px'; b2.el.style.left = (b2.slot * SLOT) + 'px'; }
  } else {
    boxEls.forEach((b, idx) => { b.slot = idx; b.value = step.array[idx]; b.el.textContent = step.array[idx]; b.el.style.left = (idx * SLOT) + 'px'; });
    applyBarsMode();
  }
  for (let i = 0; i < n; i++) {
    tagIEls[i].textContent = step.i === i ? 'i' : '';
    tagJEls[i].textContent = step.j === i ? 'j' : '';
  }
  boxEls.forEach(b => {
    const cls = ['box-el'];
    const inRange = step.low !== undefined && b.slot >= step.low && b.slot <= step.high;
    if (step.low !== undefined && !inRange) cls.push('out-range');
    if (step.i === b.slot && step.j === b.slot) cls.push('marker-both');
    else if (step.i === b.slot) cls.push('marker-i');
    else if (step.j === b.slot) cls.push('marker-j');
    if (step.swapped && (step.swapped[0] === b.slot || step.swapped[1] === b.slot)) cls.push('swapped');
    if (step.sorted) cls.push('sorted');
    b.el.className = cls.join(' ');
  });
  if (step.low !== undefined) {
    rangeBarEl.style.display = 'block';
    rangeBarEl.style.left = (step.low * SLOT) + 'px';
    rangeBarEl.style.width = ((step.high - step.low + 1) * SLOT - 8) + 'px';
  } else { rangeBarEl.style.display = 'none'; }

  let text = step.desc;
  if (step.pivotValue !== undefined) text += ` <span class="pivot-badge">pivot = ${step.pivotValue}</span>`;
  document.getElementById('explainText').innerHTML = text;
  renderVars(step);
}

function updateNavUI() {
  document.getElementById('stepCount').textContent = `Step ${current + 1} / ${steps.length}`;
  document.getElementById('prevBtn').disabled = current === 0;
  document.getElementById('nextBtn').disabled = current === steps.length - 1;
  const scrub = document.getElementById('scrubber');
  scrub.max = steps.length - 1; scrub.value = current;
}
function next() {
  if (current >= steps.length - 1) return;
  const s = steps[current + 1];
  current++;
  renderStep(s, s.swapped ? { swap: s.swapped } : {});
  updateNavUI();
}
function prev() {
  if (current <= 0) return;
  current--;
  renderStep(steps[current], {});
  updateNavUI();
}
function jumpTo(i) {
  current = Math.max(0, Math.min(steps.length - 1, i));
  renderStep(steps[current], {});
  updateNavUI();
}
function stopPlay() {
  playing = false;
  document.getElementById('playBtn').textContent = '\u25b6 Play';
  if (playTimer) clearInterval(playTimer);
  playTimer = null;
}
function startPlay() {
  if (current >= steps.length - 1) jumpTo(0);
  playing = true;
  document.getElementById('playBtn').textContent = '\u23f8 Pause';
  const spd = +document.getElementById('speedSelect').value;
  playTimer = setInterval(() => {
    if (current < steps.length - 1) next(); else stopPlay();
  }, spd);
}

function visualize() {
  stopPlay();
  const errEl = document.getElementById('errorMsg');
  errEl.textContent = '';
  try {
    const nums = parseInput(document.getElementById('arrInput').value);
    steps = generateSteps(nums);
    setupStage(steps[0].array);
    current = 0;
    renderStep(steps[0], {});
    updateNavUI();
  } catch (e) { errEl.textContent = e.message; }
}

document.getElementById('visualizeBtn').addEventListener('click', visualize);
document.getElementById('resetBtn').addEventListener('click', () => { stopPlay(); jumpTo(0); });
document.getElementById('nextBtn').addEventListener('click', next);
document.getElementById('prevBtn').addEventListener('click', prev);
document.getElementById('scrubber').addEventListener('input', e => { stopPlay(); jumpTo(+e.target.value); });
document.getElementById('playBtn').addEventListener('click', () => playing ? stopPlay() : startPlay());
document.getElementById('speedSelect').addEventListener('change', () => { if (playing) { stopPlay(); startPlay(); } });
document.getElementById('viewToggle').addEventListener('click', () => {
  barsMode = !barsMode;
  document.getElementById('viewToggle').textContent = barsMode ? 'Boxes view' : 'Bars view';
  applyBarsMode();
});
document.getElementById('randomizeBtn').addEventListener('click', () => {
  const len = 6 + Math.floor(Math.random() * 4);
  const arr = Array.from({ length: len }, () => 1 + Math.floor(Math.random() * 60));
  document.getElementById('arrInput').value = arr.join(', ');
  visualize();
});
document.getElementById('arrInput').addEventListener('keydown', e => { if (e.key === 'Enter') visualize(); });
document.addEventListener('keydown', e => {
  if (e.target && e.target.tagName === 'INPUT') return;
  if (e.key === 'ArrowRight') { stopPlay(); next(); }
  else if (e.key === 'ArrowLeft') { stopPlay(); prev(); }
  else if (e.code === 'Space') { e.preventDefault(); playing ? stopPlay() : startPlay(); }
});

visualize();
