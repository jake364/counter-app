/*
  Vanilla Web Component implementation of <counter-app>
  - Attributes: counter, start, min, max
  - Buttons: +, -, Reset
  - Keyboard: ArrowRight, ArrowLeft, R
  - Uses DDD CSS variables where possible
  - Dynamically imports confetti container from unpkg when counter === 21
*/

class CounterApp extends HTMLElement {
  static get observedAttributes() {
    return ['counter','start','min','max'];
  }

  constructor(){
    super();
    this.attachShadow({mode:'open'});
    // defaults
    this._counter = 0;
    this._start = 0;
    this._min = 0;
    this._max = 10;
    this._onKey = this._onKey.bind(this);
  }

  connectedCallback(){
    // initialize from attributes (if present)
    this._counter = this._numAttr('counter', this._counter);
    this._start = this._numAttr('start', this._counter);
    this._min = this._numAttr('min', this._min);
    this._max = this._numAttr('max', this._max);
    this._render();
    window.addEventListener('keydown', this._onKey);
  }

  disconnectedCallback(){
    window.removeEventListener('keydown', this._onKey);
  }

  attributeChangedCallback(name, oldV, newV){
    if(oldV === newV) return;
    if(name === 'counter') this._counter = this._numAttr('counter', this._counter);
    if(name === 'start') this._start = this._numAttr('start', this._start);
    if(name === 'min') this._min = this._numAttr('min', this._min);
    if(name === 'max') this._max = this._numAttr('max', this._max);
    this._update();
  }

  _numAttr(name, fallback){
    const v = this.getAttribute(name);
    if(v === null) return fallback;
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  _render(){
    this.shadowRoot.innerHTML = `
      <style>
        :host{display:inline-block}
        .card{padding:16px;border-radius:10px;background:var(--ddd-theme-surface,#0b1220);color:var(--ddd-theme-text,#e6eef8);min-width:200px;text-align:center;font-family:system-ui,Segoe UI,Roboto,Arial}
        /* number should be rather large */
        .number{font-size:4.5rem;line-height:1;margin:0 0 16px 0;font-weight:700}
        /* controls below the number, buttons adjacent */
        .controls{margin-top:8px;display:flex;justify-content:center;gap:12px}
        button{padding:10px 16px;border-radius:8px;border:0;background:var(--ddd-theme-default-wonderPurple,#7c3aed);color:var(--ddd-theme-text,#ffffff);cursor:pointer;font-size:1rem}
        button:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(2,6,23,0.35)}
        button:focus{outline:3px solid var(--ddd-theme-default-wonderPurple, rgba(124,58,237,0.18));outline-offset:2px}
        button:disabled{opacity:.45;cursor:not-allowed;transform:none;box-shadow:none}
        /* color states using DDD variables */
  .at-min{color:var(--ddd-theme-default-wonderPurple)}
  /* 18 should be purple */
  .at-18{color:var(--ddd-theme-default-wonderPurple,#7c3aed)}
  /* 21 should be red (use punchPink CSS var with red fallback) */
  .at-21{color:var(--ddd-theme-default-punchPink,red)}
  .at-max{color:var(--ddd-theme-default-punchPink)}
  /* bold modifier when at min or max */
  .bold{font-weight:800}
        .muted{font-size:.85rem;color:var(--ddd-theme-muted,#94a3b8);margin-top:12px}
      </style>
      <div class="card">
        <confetti-container id="confetti">
          <div class="number" id="num">${this._counter}</div>
          <div class="controls" role="group" aria-label="counter controls">
            <button id="dec" aria-label="decrement">-</button>
            <button id="inc" aria-label="increment">+</button>
            <button id="reset" aria-label="reset">Reset</button>
          </div>
        </confetti-container>
        <div class="muted">min: <span id="min">${this._min}</span> max: <span id="max">${this._max}</span></div>
      </div>
    `;

    this._$num = this.shadowRoot.getElementById('num');
    this._$inc = this.shadowRoot.getElementById('inc');
    this._$dec = this.shadowRoot.getElementById('dec');
    this._$reset = this.shadowRoot.getElementById('reset');

    this._$inc.addEventListener('click', ()=>this._change(1));
    this._$dec.addEventListener('click', ()=>this._change(-1));
    this._$reset.addEventListener('click', ()=>this._doReset());

    this._update();
  }

  _onKey(e){
    if(e.key === 'ArrowRight') this._change(1);
    else if(e.key === 'ArrowLeft') this._change(-1);
    else if(e.key.toLowerCase() === 'r') this._doReset();
  }

  _change(delta){
    const next = this._counter + delta;
    if(next > this._max || next < this._min) return;
    this._counter = next;
    this.setAttribute('counter', String(this._counter));
    this._update();
    if(this._counter === 21) this._makeItRain();
  }

  _doReset(){
    const s = Math.min(this._max, Math.max(this._min, Number(this._start ?? this._counter)));
    this._counter = s;
    this.setAttribute('counter', String(this._counter));
    this._update();
  }

  _update(){
    if(this._$num) this._$num.textContent = String(this._counter);
    const minEl = this.shadowRoot.getElementById('min');
    const maxEl = this.shadowRoot.getElementById('max');
    if(minEl) minEl.textContent = String(this._min);
    if(maxEl) maxEl.textContent = String(this._max);
    if(this._$inc) this._$inc.disabled = this._counter >= this._max;
    if(this._$dec) this._$dec.disabled = this._counter <= this._min;
    // update color classes: exact matches only. priority: 18 -> 21 -> min -> max
    if(this._$num){
      this._$num.className = '';
  if(this._counter === 18) this._$num.classList.add('at-18');
  else if(this._counter === 21) this._$num.classList.add('at-21');
  else if(this._counter === this._min) this._$num.classList.add('at-min');
  else if(this._counter === this._max) this._$num.classList.add('at-max');
  // apply bold when at min or max
  if(this._counter === this._min || this._counter === this._max) this._$num.classList.add('bold');
    }
  }

  async _makeItRain(){
    try{
      // dynamic import from unpkg so no npm install required for the demo
      await import('https://unpkg.com/@haxtheweb/multiple-choice@latest/lib/confetti-container.js');
      // small timeout to allow element to initialize
      setTimeout(()=>{
        const c = this.shadowRoot.querySelector('#confetti');
        if(c) c.setAttribute('popped','');
      }, 0);
    }catch(e){
      console.warn('confetti import failed', e);
    }
  }
}

customElements.define('counter-app', CounterApp);

