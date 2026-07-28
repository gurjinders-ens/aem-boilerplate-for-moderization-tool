/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-product.
 * Base block: carousel.
 * Source: https://main--eds-react-coleman--ensemble-software.aem.live/
 * Generated: 2026-07-28
 *
 * Structure (per library-description.txt): 2-column carousel block.
 * Row 1: block name. Each subsequent row = one slide:
 *   Cell 1 (mandatory): image, with no other content.
 *   Cell 2 (optional): text content — title (heading/strong), description
 *                      (price), optional badge, and CTA link.
 *
 * Source markup: .carousel.block > section.slider > .slider-container >
 * .slider-item (one per slide). Each .slider-item contains an <a> (the whole
 * slide links to a product page) wrapping: optional .best-seller badge,
 * .slider-image > picture, .slider-text > strong (title), .price.
 *
 * The whole-slide product link is preserved by wrapping the title text in an
 * anchor to the product URL in the text cell.
 */
export default function parse(element, { document }) {
  const slides = Array.from(element.querySelectorAll('.slider-item, [class*="slider-item"]'));

  const cells = [];

  slides.forEach((slide) => {
    const link = slide.querySelector('a');
    const href = link ? link.getAttribute('href') : null;

    // Image cell: the slide picture only.
    const picture = slide.querySelector('.slider-image picture, .slider-image img, picture, img');

    // Text cell: title, price, and optional "Best Seller" badge.
    const contentCell = [];

    // Title (strong heading). Wrap in the product link to preserve navigation.
    const titleEl = slide.querySelector('.slider-text strong, .slider-text');
    if (titleEl) {
      const titleText = titleEl.textContent.trim();
      if (href) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.setAttribute('title', titleText);
        const strong = document.createElement('strong');
        strong.textContent = titleText;
        a.appendChild(strong);
        contentCell.push(a);
      } else {
        const strong = document.createElement('strong');
        strong.textContent = titleText;
        contentCell.push(strong);
      }
    }

    // Optional "Best Seller" badge.
    const badge = slide.querySelector('.best-seller');
    if (badge && badge.textContent.trim()) {
      const badgeP = document.createElement('p');
      badgeP.textContent = badge.textContent.trim();
      contentCell.push(badgeP);
    }

    // Price / description.
    const price = slide.querySelector('.price');
    if (price && price.textContent.trim()) {
      const priceP = document.createElement('p');
      priceP.textContent = price.textContent.trim();
      contentCell.push(priceP);
    }

    // Row: [image cell, text cell]. Pad if either is empty to keep 2 columns.
    cells.push([picture || '', contentCell.length ? contentCell : '']);
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-product', cells });

  // Preserve the section's leading heading (e.g. "New Arrivals/Top Picks")
  // as default content above the carousel block, instead of discarding it.
  const heading = element.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    const frag = document.createDocumentFragment();
    frag.appendChild(heading.cloneNode(true));
    frag.appendChild(block);
    element.replaceWith(frag);
  } else {
    element.replaceWith(block);
  }
}
