import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  // The block has a single row with two cells: [image] [text].
  const row = block.firstElementChild;
  if (row) {
    const cells = [...row.children];
    if (cells[0]) cells[0].classList.add('promo-banner-image');
    if (cells[1]) cells[1].classList.add('promo-banner-text');
  }
  block.querySelectorAll('picture > img').forEach((img) => {
    const pic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(pic);
  });
}
