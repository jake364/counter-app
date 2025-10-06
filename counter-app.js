// counter-app.js
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

/**
 * <counter-app> - A reusable counter web component built with Lit.
 * 
 * Features:
 * - Increment and decrement functionality.
 * - Displays current count.
 * - Reactive property "count" that updates automatically.
 * - "count" is reflected to the HTML attribute and typed as a Number.
 */
class CounterApp extends LitElement {
  // Define component styles
  static styles = css`
    :host {
      display: inline-block;
      background: linear-gradient(135deg, #6a11cb, #2575fc);
      color: white;
      border-radius: 16px;
      padding: 20px;
      margin: 10px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      text-align: center;
      width: 160px;
      font-family: 'Arial', sans-serif;
      transition: transform 0.2s ease-in-out;
    }

    :host(:hover) {
      transform: scale(1.05);
    }

    h3 {
      font-size: 1.2rem;
      margin-bottom: 10px;
    }

    .count-display {
      font-size: 2rem;
      margin: 10px 0;
      font-weight: bold;
    }

    button {
      background-color: white;
      color: #2575fc;
      border: none;
      border-radius: 8px;
      padding: 8px 14px;
      margin: 5px;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s;
    }

    button:hover {
      background-color: #e0e0e0;
    }
  `;

  // Define properties with types and reflection
  static properties = {
    count: { type: Number, reflect: true }
  };

  /**
   * Constructor - initializes default property values.
   */
  constructor() {
    super();
    this.count = 0; // Start with zero
  }

  /**
   * increment() - increases the counter value by 1.
   * Automatically re-renders due to Lit's reactivity.
   */
  increment() {
    this.count++;
  }

  /**
   * decrement() - decreases the counter value by 1.
   * Automatically re-renders due to Lit's reactivity.
   */
  decrement() {
    this.count--;
  }

  /**
   * reset() - resets the counter value back to 0.
   */
  reset() {
    this.count = 0;
  }

  /**
   * render() - defines the HTML template for the component.
   * Automatically updates when properties change.
   */
  render() {
    return html`
      <h3>Counter</h3>
      <div class="count-display">${this.count}</div>
      <button @click=${this.decrement}>-</button>
      <button @click=${this.increment}>+</button>
      <button @click=${this.reset}>Reset</button>
    `;
  }
}

// Register the custom element
customElements.define('counter-app', CounterApp);


