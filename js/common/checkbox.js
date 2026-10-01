// ─── checkbox.js — reusable checkbox components ─────────────────────────────
// Both take a params object (like React props) and return markup only;
// the caller is responsible for querying/wiring the rendered input.

function checkmarkSvg() {
  return `<svg width="23" height="20" viewBox="0 0 23 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.7601 1.72837C22.6079 1.91613 8.92915 19.1417 8.79063 19.3192C8.46874 19.7242
      8.01793 19.968 7.53726 19.9971C7.05659 20.0261 6.58538 19.8381 6.22719 19.4742
      C6.15032 19.3945 6.07907 19.3081 6.01408 19.2158L0.267659 10.9475
      C0.0962799 10.7536 -1.35132e-08 10.4905 0 10.2163
      C1.35132e-08 9.94201 0.0962799 9.67898 0.267659 9.48505
      C0.439039 9.29112 0.671479 9.18217 0.913846 9.18217
      C1.15621 9.18217 1.38865 9.29112 1.56003 9.48505L7.34451 14.6321
      L21.4647 0.272796C22.3385 -0.572982 23.5106 0.727565 22.7601 1.72837Z"
      fill="#593F28" />
  </svg>`;
}

/** The bare checkbox visual: hidden native input + animated checkmark circle. */
function checkboxInputMarkup({ id, name, value, checked, extraClass } = {}) {
  const containerClass = extraClass ? `checkbox-container ${extraClass}` : "checkbox-container";
  const attrs = [
    id ? `id="${id}"` : "",
    name ? `name="${name}"` : "",
    value !== undefined ? `value="${value}"` : "",
    checked ? "checked" : "",
  ].filter(Boolean).join(" ");

  return `
    <div class="${containerClass}">
      <input type="checkbox" ${attrs}>
      <div class="checkmark">${checkmarkSvg()}</div>
    </div>`;
}

/** A plain checkbox, e.g. one list-row's selection checkbox. */
export function createCheckbox({ name, value, extraClass } = {}) {
  return checkboxInputMarkup({ name, value, extraClass });
}

/** A labeled, pill-shaped toggle (gujarati toggle, show-images toggle). */
export function createPillToggle({ id, checked, label }) {
  return `
    <label class="checkbox-label pill-toggle">
      ${checkboxInputMarkup({ id, checked })}
      <span class="checkbox-text">${label}</span>
    </label>`;
}
