/* eslint-disable */
/* global WebImporter */
/**
 * Parser for promo-banner.
 * Source section: div.section.full-width.promo-banner-container
 *   > .promo-banner.block > .wrapper > div(image) + div(text paragraphs)
 *
 * Output: single row, two cells — [image] | [promo text paragraphs].
 */
export default function parse(element, { document }) {
  const picture = element.querySelector('picture, img');
  const paragraphs = Array.from(element.querySelectorAll('p')).filter((p) => p.textContent.trim());

  const textCell = [];
  paragraphs.forEach((p) => {
    const np = document.createElement('p');
    np.textContent = p.textContent.trim();
    textCell.push(np);
  });

  const cells = [[picture || '', textCell.length ? textCell : '']];

  const hasContent = picture || textCell.length;
  if (!hasContent) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'promo-banner', cells });
  element.replaceWith(block);
}
