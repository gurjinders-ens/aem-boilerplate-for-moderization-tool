/* eslint-disable */
/* global WebImporter */
/**
 * Parser for email-signup.
 * Source section: div.section.email-signup-container > .email-signup.block
 *   > .label (heading)
 *   > .input-fields (interactive controls — stripped by cleanup transformer)
 *   > .information > p, p (terms text)
 *
 * The interactive controls are removed during cleanup; the authorable content
 * is the label plus the terms text. The block decorator rebuilds a static
 * visual form from this content.
 *
 * Output: one cell per row —
 *   row 1: label text
 *   row 2: input label ("Email Sign Up")
 *   row 3..n: terms paragraphs
 */
export default function parse(element, { document }) {
  const cells = [];

  const label = element.querySelector('.label');
  if (label && label.textContent.trim()) {
    cells.push([label.textContent.trim()]);
  }

  // Input label text (from the removed text-input's <label>, if still present)
  // otherwise fall back to a sensible default.
  const inputLabel = element.querySelector('.text-input label, label');
  cells.push([inputLabel && inputLabel.textContent.trim() ? inputLabel.textContent.trim() : 'Email Sign Up']);

  const terms = Array.from(element.querySelectorAll('.information p, p')).filter((p) => p.textContent.trim());
  const seen = new Set();
  terms.forEach((p) => {
    const t = p.textContent.trim();
    if (seen.has(t)) return;
    seen.add(t);
    cells.push([t]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'email-signup', cells });
  element.replaceWith(block);
}
