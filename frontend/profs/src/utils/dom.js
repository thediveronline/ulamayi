import { createIcon } from '../components/icon/icon.js';

export const createElement = ({ tag, className, text, html, attrs }) => {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined && text !== null) {
    element.textContent = text;
  }

  if (html) {
    element.innerHTML = html;
  }

  if (attrs) {
    Object.entries(attrs).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== false) {
        element.setAttribute(key, value === true ? '' : String(value));
      }
    });
  }

  return element;
};

export const createButton = ({
  label,
  icon,
  type = 'button',
  variant = 'primary',
  iconPosition = 'left',
  block = false,
  size = ''
}) => {
  const btn = document.createElement('button');
  btn.type = type;
  btn.className = ['btn', `btn-${variant}`, block ? 'btn-block' : '', size ? `btn-${size}` : '']
    .filter(Boolean)
    .join(' ');

  const iconNode = icon ? createIcon(icon, { size: size === 'sm' ? 14 : 16 }) : null;

  const labelNode = document.createElement('span');
  labelNode.dataset.btnLabel = '';
  labelNode.textContent = label;

  if (iconNode && iconPosition === 'left') {
    btn.append(iconNode, labelNode);
  } else if (iconNode && iconPosition === 'right') {
    btn.append(labelNode, iconNode);
  } else {
    btn.append(labelNode);
  }

  return btn;
};

export const createField = ({ name, label, type = 'text', value = '', placeholder = '', required = false, hint = '', autocomplete = '' }) => {
  const wrapper = createElement({ tag: 'label', className: 'field' });

  wrapper.append(createElement({ tag: 'span', className: 'field-label', text: label }));

  const input = document.createElement('input');
  input.className = 'input';
  input.type = type;
  input.name = name;
  if (value) input.value = value;
  if (placeholder) input.placeholder = placeholder;
  if (required) input.required = true;
  if (autocomplete) input.autocomplete = autocomplete;

  wrapper.append(input);

  if (hint) {
    wrapper.append(createElement({ tag: 'span', className: 'field-hint', text: hint }));
  }

  return wrapper;
};

export const createSelectField = ({ name, label, options, value = '', required = false }) => {
  const wrapper = createElement({ tag: 'label', className: 'field' });

  wrapper.append(createElement({ tag: 'span', className: 'field-label', text: label }));

  const select = document.createElement('select');
  select.className = 'select';
  select.name = name;
  if (required) select.required = true;

  options.forEach((opt) => {
    const option = document.createElement('option');
    if (typeof opt === 'string') {
      option.value = opt;
      option.textContent = opt;
    } else {
      option.value = opt.value;
      option.textContent = opt.label;
    }
    select.append(option);
  });

  if (value) {
    select.value = value;
  }

  wrapper.append(select);
  return wrapper;
};
