import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-feature-card-image';
      else div.className = 'cards-feature-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });

  // Variant detection: product-category cards lead with a plain "eyebrow"
  // paragraph (no <strong>) before the bold title; brand-story cards do not.
  const hasEyebrow = [...ul.querySelectorAll('.cards-feature-card-body')].some((body) => {
    const first = body.querySelector('p');
    return first && !first.querySelector('strong') && !first.querySelector('a');
  });
  block.classList.add(hasEyebrow ? 'cards-feature-grid-3' : 'cards-feature-grid-2');

  block.textContent = '';
  block.append(ul);
}
