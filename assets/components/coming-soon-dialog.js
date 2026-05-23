(function () {
  "use strict";

  const TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML = `
    <style>
      :host {
        display: contents;
      }

      dialog {
        width: min(100vw - 2rem, 48rem);
        margin: auto;
        padding: 0;
        border: 0;
        overflow: visible;
        background: transparent;
        color: inherit;
      }

      dialog::backdrop {
        background: rgba(7, 12, 18, 0.72);
        backdrop-filter: blur(16px);
      }

      .showcase-card {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr;
        min-height: 100%;
        background: var(--site-header-bg);
        border: 1px solid rgba(119, 168, 214, 0.18);
        border-radius: 22px;
        overflow: hidden;
        box-shadow: 0 24px 50px rgba(15, 23, 34, 0.16);
      }

      .showcase-body {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1.75rem;
      }

      .showcase-body.showcase-body-compact {
        gap: 0.8rem;
        padding: 1.4rem;
      }

      .showcase-body.showcase-body-clamp-summary .showcase-summary {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 4;
        overflow: hidden;
      }

      .showcase-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
      }

      .showcase-tag {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.35rem 0.75rem;
        border-radius: 999px;
        background: rgba(59, 162, 255, 0.12);
        color: #9fd1ff;
        font-size: 0.74rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .showcase-tag i {
        line-height: 1;
      }

      .showcase-title {
        margin: 0.8rem 0 0;
        font-size: 2rem;
        color: #ffffff;
      }

      .showcase-summary {
        margin: 0;
        color: #d4dfec;
        font-size: 1rem;
        line-height: 1.75;
      }

      .showcase-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
      }

      .showcase-platform {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.35rem 0.75rem;
        border-radius: 999px;
        border: 1px solid rgba(136, 183, 228, 0.24);
        background: rgba(255, 255, 255, 0.06);
        color: #ffffff;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .showcase-platform i {
        font-size: 0.9rem;
        line-height: 1;
        letter-spacing: normal;
        text-transform: none;
      }

      .showcase-links {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        align-items: center;
        gap: 0.75rem;
        margin-top: auto;
      }

      .showcase-links .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 3rem;
        height: 3rem;
        padding: 0;
        border-radius: 999px;
        background: transparent;
        color: #e7f2ff;
        border: 1px solid rgba(151, 193, 233, 0.3);
        font-size: 1rem;
        font-weight: 700;
        letter-spacing: 0;
        text-transform: none;
      }

      .showcase-links .button i {
        line-height: 1;
      }

      .showcase-links .button:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #ffffff;
        box-shadow: none;
      }

      .showcase-links .button-coming-soon {
        color: #e7f2ff;
        border-color: rgba(151, 193, 233, 0.3);
        background: transparent;
      }

      .showcase-links .button-coming-soon:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
      }

      .showcase-links .button-outline-a {
        background: transparent;
        color: #e7f2ff;
        border-color: rgba(151, 193, 233, 0.3);
      }

      .showcase-links .button-outline-a:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #ffffff;
      }

      .showcase-links .button-a {
        background: #3ba2ff;
        border-color: #3ba2ff;
        color: #ffffff;
      }

      .showcase-links .button-a:hover {
        background: #2f8ee0;
        border-color: #2f8ee0;
      }

      .coming-soon-close {
        width: auto;
        min-width: 9rem;
        height: 3rem;
        padding: 0 1.1rem;
        border-radius: 12px;
        cursor: pointer;
      }

      @media (max-width: 575px) {
        .showcase-body {
          padding: 1.2rem;
        }

        .showcase-title {
          font-size: 1.65rem;
        }

        .showcase-links .button {
          width: 100%;
          border-radius: 14px;
        }

        .showcase-links {
          width: 100%;
          justify-content: stretch;
        }
      }
    </style>
    <dialog part="dialog" aria-labelledby="comingSoonModalTitle" aria-describedby="comingSoonModalDescription">
      <article class="showcase-card coming-soon-card" role="document">
        <div class="showcase-body">
          <div class="showcase-top">
            <div>
              <span class="showcase-tag coming-soon-kicker"><i class="bi bi-stars" aria-hidden="true"></i> Platform update</span>
              <h2 class="showcase-title" id="comingSoonModalTitle">Store support is on the way</h2>
            </div>
          </div>
          <p class="showcase-summary" id="comingSoonModalDescription">This storefront is planned, but it is not live yet.</p>
          <div class="showcase-tags">
            <span class="showcase-platform">
              <i class="bi bi-shop" aria-hidden="true"></i>
              <span data-coming-soon-platform-name></span>
            </span>
          </div>
          <div class="showcase-links">
            <button type="button" class="button button-a coming-soon-close" data-coming-soon-close>
              Close
            </button>
          </div>
        </div>
      </article>
    </dialog>
  `;

  class ComingSoonDialogElement extends HTMLElement {
    constructor() {
      super();
      this._dialog = null;
      this._platformEl = null;
      this._descriptionEl = null;
      this._lastTrigger = null;
      this._previousBodyOverflow = "";
      this._initialized = false;
      this._boundDocumentClick = this._handleDocumentClick.bind(this);
      this._boundDialogClick = this._handleDialogClick.bind(this);
      this._boundDialogClose = this._handleDialogClose.bind(this);
      this._boundDialogCancel = this._handleDialogCancel.bind(this);
    }

    connectedCallback() {
      if (this._initialized) return;

      if (!this.shadowRoot) {
        this.attachShadow({ mode: "open" });
      }

      if (!this.shadowRoot.hasChildNodes()) {
        this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
      }

      this._dialog = this.shadowRoot.querySelector("dialog");
      this._platformEl = this.shadowRoot.querySelector("[data-coming-soon-platform-name]");
      this._descriptionEl = this.shadowRoot.querySelector("#comingSoonModalDescription");

      this._dialog.addEventListener("click", this._boundDialogClick);
      this._dialog.addEventListener("close", this._boundDialogClose);
      this._dialog.addEventListener("cancel", this._boundDialogCancel);
      document.addEventListener("click", this._boundDocumentClick);
      this._initialized = true;

      if (!window.ComingSoonDialog) {
        window.ComingSoonDialog = {
          show: (platform, trigger) => this.show(platform, trigger),
          hide: () => this.hide()
        };
      }
    }

    disconnectedCallback() {
      this._initialized = false;

      if (this._dialog && this._dialog.open) {
        this._dialog.close();
      }

      document.removeEventListener("click", this._boundDocumentClick);

      if (this._dialog) {
        this._dialog.removeEventListener("click", this._boundDialogClick);
        this._dialog.removeEventListener("close", this._boundDialogClose);
        this._dialog.removeEventListener("cancel", this._boundDialogCancel);
      }
    }

    show(platform, trigger) {
      if (!this._dialog) return;

      const platformLabel = platform || "This platform";
      if (this._platformEl) {
        this._platformEl.textContent = platformLabel;
      }
      if (this._descriptionEl) {
        this._descriptionEl.textContent = `${platformLabel} support is coming soon. For now, the app is available on the platforms that are already linked here.`;
      }

      this._lastTrigger = trigger || document.activeElement;
      this._previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      if (!this._dialog.open) {
        this._dialog.showModal();
      }

      const closeButton = this.shadowRoot.querySelector("[data-coming-soon-close]");
      if (closeButton) {
        closeButton.focus();
      }
    }

    hide() {
      if (!this._dialog || !this._dialog.open) return;
      this._dialog.close();
    }

    _restoreFocus() {
      document.body.style.overflow = this._previousBodyOverflow;

      if (this._lastTrigger && typeof this._lastTrigger.focus === "function") {
        this._lastTrigger.focus();
      }

      this._lastTrigger = null;
    }

    _handleDocumentClick(event) {
      const trigger = event.target.closest(".button-coming-soon");
      if (!trigger || !this.isConnected) return;

      event.preventDefault();
      this.show(trigger.getAttribute("data-coming-soon-platform") || "This platform", trigger);
    }

    _handleDialogClick(event) {
      if (event.target === this._dialog) {
        this.hide();
      }
    }

    _handleDialogClose() {
      this._restoreFocus();
    }

    _handleDialogCancel(event) {
      event.preventDefault();
      this.hide();
    }
  }

  if (!window.customElements.get("coming-soon-dialog")) {
    window.customElements.define("coming-soon-dialog", ComingSoonDialogElement);
  }
})();