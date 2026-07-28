/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import columnsHeroParser from './parsers/columns-hero.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import carouselProductParser from './parsers/carousel-product.js';
import promoBannerParser from './parsers/promo-banner.js';
import emailSignupParser from './parsers/email-signup.js';

// TRANSFORMER IMPORTS
import colemanCleanupTransformer from './transformers/coleman-cleanup.js';
import colemanSectionsTransformer from './transformers/coleman-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'landing-page',
  description: 'Coleman brand landing page: hero (columns), product category feature grid (cards), promo banner, product carousel, brand-story cards, and email/SMS signup section.',
  urls: [
    'https://main--eds-react-coleman--ensemble-software.aem.live/',
  ],
  blocks: [
    {
      name: 'columns-hero',
      instances: ['body > main > div.section.full-width.columns-container'],
    },
    {
      name: 'cards-feature',
      instances: [
        'body > main > div.section.cards-container:nth-of-type(2)',
        'body > main > div.section.cards-container:nth-of-type(5)',
      ],
    },
    {
      name: 'carousel-product',
      instances: ['body > main > div.section.carousel-container'],
    },
    {
      name: 'promo-banner',
      instances: ['body > main > div.section.full-width.promo-banner-container'],
    },
    {
      name: 'email-signup',
      instances: ['body > main > div.section.email-signup-container'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero',
      selector: 'body > main > div.section.full-width.columns-container',
      style: null,
      blocks: ['columns-hero'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Product Category Grid',
      selector: 'body > main > div.section.cards-container:nth-of-type(2)',
      style: null,
      blocks: ['cards-feature'],
      defaultContent: [],
    },
    {
      id: 'section-3',
      name: 'Promo Banner',
      selector: 'body > main > div.section.full-width.promo-banner-container',
      style: null,
      blocks: ['promo-banner'],
      defaultContent: [],
    },
    {
      id: 'section-4',
      name: 'New Arrivals Carousel',
      selector: 'body > main > div.section.carousel-container',
      style: null,
      blocks: ['carousel-product'],
      defaultContent: [],
    },
    {
      id: 'section-5',
      name: 'Brand Story Cards',
      selector: 'body > main > div.section.cards-container:nth-of-type(5)',
      style: null,
      blocks: ['cards-feature'],
      defaultContent: [],
    },
    {
      id: 'section-6',
      name: 'Email Signup',
      selector: 'body > main > div.section.email-signup-container',
      style: null,
      blocks: ['email-signup'],
      defaultContent: [],
    },
  ],
};

// PARSER REGISTRY
const parsers = {
  'columns-hero': columnsHeroParser,
  'cards-feature': cardsFeatureParser,
  'carousel-product': carouselProductParser,
  'promo-banner': promoBannerParser,
  'email-signup': emailSignupParser,
};

// TRANSFORMER REGISTRY - cleanup runs first, sections run after (in afterTransform)
const transformers = [
  colemanCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [colemanSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path. Map the site root ("/") to "/index" so the
    // path is never empty (an empty path makes the markdown pipeline fall back
    // to process.cwd(), which does not exist in the browser bundle).
    let pathname = new URL(params.originalURL).pathname.replace(/\.html$/, '');
    pathname = pathname.replace(/\/$/, '');
    if (pathname === '') pathname = '/index';
    const path = WebImporter.FileUtils.sanitizePath(pathname);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
