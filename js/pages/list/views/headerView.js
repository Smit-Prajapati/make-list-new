// ─── headerView.js — markup for the list page's header bar ──────────────────

import { createPillToggle } from "../../../common/checkbox.js";
import { BACK_ARROW_ICON } from "../../../utils/svgIcons.js";

export function renderHeader({ page, state }) {
  const backHtml = `<a href="index.html" class="back-button" id="back-button" title="Back" aria-label="Back">
    ${BACK_ARROW_ICON}
  </a>`;

  const logoHtml = `<img src="${page.logoUrl}" alt="${page.name}" id="company-logo">`;
  const gujaratiHtml = state.hasGujarati
    ? `<div class="gujarati-div">${createPillToggle({ id: "gujarati-toggle", checked: state.showGujarati, label: "ગુજરાતી" })}</div>`
    : "";

  return backHtml + logoHtml + gujaratiHtml;
}
