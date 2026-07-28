export default function decorate(block) {
  // Expected content rows (default-content style, one cell each):
  //   1: heading/label   2: "Email Sign Up" input label   3+: terms text
  const rows = [...block.children];
  const cells = rows.map((r) => r.firstElementChild || r);

  const label = cells[0] ? cells[0].textContent.trim() : '';
  const inputLabel = cells[1] ? cells[1].textContent.trim() : 'Email Sign Up';
  const terms = cells.slice(2).map((c) => c.textContent.trim()).filter(Boolean);

  block.textContent = '';

  const heading = document.createElement('p');
  heading.className = 'email-signup-label';
  heading.textContent = label;

  // Static (non-functional) visual signup form.
  const form = document.createElement('form');
  form.className = 'email-signup-form';
  form.setAttribute('aria-label', 'Email sign up');
  form.addEventListener('submit', (e) => e.preventDefault());

  const field = document.createElement('div');
  field.className = 'email-signup-field';
  const input = document.createElement('input');
  input.type = 'email';
  input.setAttribute('aria-label', inputLabel);
  input.placeholder = inputLabel;
  const button = document.createElement('button');
  button.type = 'submit';
  button.textContent = 'Sign Up';
  field.append(input, button);

  const optin = document.createElement('label');
  optin.className = 'email-signup-optin';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  const optinText = document.createElement('span');
  optinText.textContent = 'Enter mobile and make it another 15% + Free Shipping**';
  optin.append(checkbox, optinText);

  form.append(field, optin);

  const info = document.createElement('div');
  info.className = 'email-signup-info';
  terms.forEach((t) => {
    const p = document.createElement('p');
    p.textContent = t;
    info.append(p);
  });

  block.append(heading, form, info);
}
