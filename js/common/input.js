// ─── input.js — reusable floating-label input field ─────────────────────────
// Renders one labeled <input>: the label sits centered inside the field until
// it's focused or filled, then floats up to sit centered on the top border
// in a pill. Validation errors (e.g. "required") are shown as a red border
// + inline message instead of the native browser bubble — wire that up by
// calling initInputValidation() once the field is in the DOM.

export function createInputField({ id, name, type = "text", label, required, value } = {}) {
  const attrs = [
    `type="${type}"`,
    `id="${id}"`,
    name ? `name="${name}"` : "",
    required ? "required" : "",
    value !== undefined ? `value="${value}"` : "",
  ].filter(Boolean).join(" ");

  return `
    <div class="input-field">
      <div class="input-control">
        <input ${attrs} placeholder=" ">
        <label for="${id}" class="input-field-label">${label}</label>
      </div>
      <span class="input-field-error"></span>
    </div>`;
}

/** Wires an input's `.input-field` wrapper to show validation errors as a
 * red border + message instead of the native browser bubble. */
export function initInputValidation(inputEl) {
  const wrapper = inputEl.closest(".input-field");
  const errorEl = wrapper?.querySelector(".input-field-error");

  function setError(message) {
    wrapper?.classList.add("has-error");
    if (errorEl) errorEl.textContent = message;
  }

  function clearError() {
    wrapper?.classList.remove("has-error");
    if (errorEl) errorEl.textContent = "";
  }

  inputEl.addEventListener("invalid", (e) => {
    e.preventDefault(); // suppress the native bubble; we show our own message
    setError(inputEl.validationMessage);
  });

  inputEl.addEventListener("input", clearError);

  return { setError, clearError };
}
