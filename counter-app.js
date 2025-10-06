/*
  Vanilla Web Component implementation of <counter-app>
  - Attributes: counter, start, min, max
  - Buttons: +, -, Reset
  - Keyboard: ArrowRight, ArrowLeft, R
  - Uses DDD CSS variables where possible
  - Dynamically imports confetti container from unpkg when counter === 21
*/

class CounterApp extends HTMLElement {
  // Tell the browser which attributes to watch for changes
  static get observedAttributes() {
    return ['counter','start','min','max'];
  }

  constructor(){
    super();
    // Attach a shadow DOM to isolate styles and structure
    this.attachShadow({mode:'open'});

    // Initialize default values for the counter and its bounds
    this._counter = 0;
    this._start = 0;
    this._min = 0;
    this._max = 10;

    // Bind the keyboard event handler to the correct context
    this._onKey = this._onKey.bind(this);
  }

  // Called when the element is inserted into the DOM
  connectedCallback(){
    // Initialize attributes from HTML if they exist
    this._counter = this._numAttr('counter', this._counter);
    this._start = this._numAttr('start', this._counter);
    this._min = this._numAttr('min', this._min);
    this._max = this._numAttr('max', this._max);

    // Render the initial HTML structure and attach event listeners
    this._render();

    // Listen to keyboard events globally
    window.addEventListener('keydown', this._onKey);
  }

  // Called when the element is removed from the DOM
  disconnectedCallback(){
    // Remove the global keyboard event listener to avoid memory leaks
    window.removeEventListener('keydown', this._onKey);
  }

  // Called when one of the observed attributes changes
  attributeChangedCallback(name, oldV, newV){
    if(oldV === newV) return; // No need to update if the value didn't change

    // Update the internal state for each attribute
    if(name === 'counter') this._counter = this._numAttr('counter', this._counter);
    if(name === 'start') this._start = this._numAttr('start', this._start);
    if(name === 'min') this._min = this._numAttr('min', this._min);
    if(name === 'max') this._max = this._numAttr('max', this._max);

    // Reflect changes in the DOM
    this._update();
  }

  // Helper method to parse numeric attributes safely
  _numAttr(name, fallback){
    const v = this.getAttribute(name);
    if(v === null) return fallback;
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  // Render the component's HTML structure and styles
  _render(){
    this.shadowRoot.innerHTML = `
      <style>
        /* Basic styles for the host and card container */
        :host{display:inline-block}
        .card{padding:16px;border-radius:10px;background:var(--ddd-theme-surface,#0b1220);color:var(--ddd-theme-text,#e6eef8);min-width:200px;text-align:center;font-family:system-ui,Segoe UI,Roboto,Arial}
        /* Large number display */
        .number{font-size:4.5rem;line-height:1;margin:0 0 16px 0;font-weight:700}
        /* Controls container */
        .controls{margin-top:8px;display:flex;justify-content:center;gap:12px}
        /* Button styles */
        button{padding:10px 16px;border-radius:8px;border:0;background:var(--ddd-theme-default-wonderPurple,#7c3aed);color:var(--ddd-theme-text,#ffffff);cursor:pointer;font-size:1rem}
        button:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(2,6,23,0.35)}
        button:focus{outline:3px solid var(--ddd-theme-default-wonderPurple, rgba(124,58,237,0.18));outline-offset:2px}
        button:disabled{opacity:.45;cursor:not-allowed;transform:none;box-shadow:none}
        /* Color states using DDD variables */
        .at-min{color:var(--ddd-theme-default-wonderPurple)}
        .at-18{color:var(--ddd-theme-default-wonderPurple,#7c3aed)}
        .at-21{color:var(--ddd-theme-default-punchPink,red)}
        .at-max{color:var(--ddd-theme-default-punchPink)}
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

    // Cache references to DOM elements for later use
    this._$num = this.shadowRoot.getElementById('num');
    this._$inc = this.shadowRoot.getElementById('inc');
    this._$dec = this.shadowRoot.getElementById('dec');
    this._$reset = this.shadowRoot.getElementById('reset');

    // Attach click event listeners to buttons
    this._$inc.addEventListener('click', ()=>this._change(1));
    this._$dec.addEventListener('click', ()=>this._change(-1));
    this._$reset.addEventListener('click', ()=>this._doReset());

    // Initial update to reflect current state
    this._update();
  }

  // Handle global keyboard events
  _onKey(e){
    if(e.key === 'ArrowRight') this._change(1);  // Increment on right arrow
    else if(e.key === 'ArrowLeft') this._change(-1); // Decrement on left arrow
    else if(e.key.toLowerCase() === 'r') this._doReset(); // Reset on "R"
  }

  // Change the counter by a given delta (+1 or -1)
  _change(delta){
    const next = this._counter + delta;

    // Only allow changes within min/max bounds
    if(next > this._max || next < this._min) return;

    this._counter = next;
    this.setAttribute('counter', String(this._counter)); // sync attribute
    this._update();

    // Trigger confetti when reaching 21
    if(this._counter === 21) this._makeItRain();
  }

  // Reset the counter to the start value (clamped to min/max)
  _doReset(){
    const s = Math.min(this._max, Math.max(this._min, Number(this._start ?? this._counter)));
    this._counter = s;
    this.setAttribute('counter', String(this._counter)); // sync attribute
    this._update();
  }

  // Update the DOM to reflect the current state
  _update(){
    if(this._$num) this._$num.textContent = String(this._counter);

    // Update min/max labels
    const minEl = this.shadowRoot.getElementById('min');
    const maxEl = this.shadowRoot.getElementById('max');
    if(minEl) minEl.textContent = String(this._min);
    if(maxEl) maxEl.textContent = String(this._max);

    // Disable increment/decrement buttons if at bounds
    if(this._$inc) this._$inc.disabled = this._counter >= this._max;
    if(this._$dec) this._$dec.disabled = this._counter <= this._min;

    // Update color classes based on special numbers
    if(this._$num){
      this._$num.className = '';
      if(this._counter === 18) this._$num.classList.add('at-18');
      else if(this._counter === 21) this._$num.classList.add('at-21');
      else if(this._counter === this._min) this._$num.classList.add('at-min');
      else if(this._counter === this._max) this._$num.classList.add('at-max');

      // Bold numbers at min or max
      if(this._counter === this._min || this._counter === this._max) this._$num.classList.add('bold');
    }
  }

  // Dynamically import confetti when counter reaches 21
  async _makeItRain(){
    try{
      await import('https://unpkg.com/@haxtheweb/multiple-choice@latest/lib/confetti-container.js');

      // Small delay to ensure confetti element is initialized
      setTimeout(()=>{
        const c = this.shadowRoot.querySelector('#confetti');
        if(c) c.setAttribute('popped',''); // trigger confetti animation
      }, 0);
    }catch(e){
      console.warn('confetti import failed', e);
    }
  }
}

// Define the custom element <counter-app>
customElements.define('counter-app', CounterApp);