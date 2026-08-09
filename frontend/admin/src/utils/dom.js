export const createButton = ({ label, type = 'button', variant = 'primary', className = '', disabled = false, onClick }) => {
  const button = document.createElement('button');
  button.type = type;
  button.className = `btn btn-${variant} ${className}`.trim();
  button.textContent = label;
  button.disabled = disabled;
  if (onClick) button.addEventListener('click', onClick);
  return button;
};

export const createField = ({ label, type = 'text', name, value = '', placeholder = '', required = false, hint = '' }) => {
  const field = document.createElement('div');
  field.className = 'field';

  const labelEl = document.createElement('label');
  labelEl.className = 'field-label';
  labelEl.textContent = label;
  labelEl.setAttribute('for', name);
  field.append(labelEl);

  const input = document.createElement('input');
  input.className = 'input';
  input.type = type;
  input.id = name;
  input.name = name;
  input.value = value;
  input.placeholder = placeholder;
  input.required = required;
  field.append(input);

  if (hint) {
    const hintEl = document.createElement('span');
    hintEl.className = 'field-hint';
    hintEl.textContent = hint;
    field.append(hintEl);
  }

  return { element: field, input };
};

export const createSelectField = ({ label, name, options = [], value = '', required = false }) => {
  const field = document.createElement('div');
  field.className = 'field';

  const labelEl = document.createElement('label');
  labelEl.className = 'field-label';
  labelEl.textContent = label;
  labelEl.setAttribute('for', name);
  field.append(labelEl);

  const select = document.createElement('select');
  select.className = 'select';
  select.id = name;
  select.name = name;
  select.required = required;

  options.forEach((opt) => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    if (opt.value === value) option.selected = true;
    select.append(option);
  });

  field.append(select);
  return { element: field, select };
};
