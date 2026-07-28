/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: coleman section breaks and section metadata.
 *
 * Driven by payload.template.sections (page-templates.json, template
 * "landing-page", 6 sections). For each section (except the first) it inserts
 * an <hr> before the section element so html2md emits an EDS section break;
 * for sections that define a `style` it inserts a "Section Metadata" block.
 *
 * Runs in beforeTransform: at that point the ORIGINAL source section elements
 * (columns-container, cards-container, promo-banner-container,
 * carousel-container, email-signup-container) still exist. The block parsers
 * later replace the inner content but the inserted <hr> siblings survive.
 *
 * Selectors in page-templates.json are absolute (body > main > ...), so we
 * resolve them against the document, not the (body) element passed in.
 * Processed in reverse so insertions don't shift not-yet-processed sections.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.beforeTransform) return;

  const sections = payload
    && payload.template
    && Array.isArray(payload.template.sections)
    ? payload.template.sections
    : [];

  if (sections.length < 2) return;

  const doc = element.ownerDocument || document;

  for (let i = sections.length - 1; i >= 0; i -= 1) {
    const section = sections[i];
    if (!section || !section.selector) continue;

    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    let sectionEl = null;
    for (let s = 0; s < selectors.length && !sectionEl; s += 1) {
      sectionEl = doc.querySelector(selectors[s]);
    }
    if (!sectionEl) continue;

    if (section.style) {
      const metadataBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      sectionEl.after(metadataBlock);
    }

    if (i > 0) {
      sectionEl.before(doc.createElement('hr'));
    }
  }
}
