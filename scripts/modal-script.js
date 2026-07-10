/*
 Universal modal helper script

 Usage notes (backwards-compatible):
 - Wrap all modal elements inside an element with id="modals".
 - Modal elements should have an `id` (e.g. "modal1").
 - Trigger elements may be:
   * an element with id equal to the modal id + "-trig" (backwards-compatible),
   * or any element with attribute `data-modal-trigger="<modalId>"` (recommended).
*/

const DEBUG = false;
let modalsParent = null;
let activeModalId = null;
let lastFocusedTrigger = null;
const modalMap = new Map();
const modalStack = [];
const fallbackDictionary = {
  'ai-chatbot': {
    title: 'AI Chatbot',
    description: 'A smart chatbot that can answer visitor questions, capture leads, and guide users through your site automatically.'
  },
  'enhanced-mobile-optimization': {
    title: 'Enhanced Mobile Optimization',
    description: 'Improves how your site performs and appears on phones and tablets, including faster loading and touch-friendly layouts.'
  },
  'extra-page': {
    title: 'Extra Page',
    description: 'Adds one more page to your website, such as an About, Services, or Contact page.'
  },
  'custom-animations': {
    title: 'Custom Animations',
    description: 'Adds polished motion effects to make your website feel more dynamic and engaging.'
  },
  'image-gallery': {
    title: 'Image Gallery',
    description: 'Creates a clean, interactive gallery so you can showcase photos, products, or portfolio work.'
  },
  'logo-design': {
    title: 'Logo Design',
    description: 'Includes a custom logo concept tailored to your brand style, colors, and business identity.'
  },
  'appointment-booking': {
    title: 'Appointment Booking',
    description: 'Adds a booking system so clients can schedule appointments directly from your website.'
  },
  'advanced-seo': {
    title: 'Advanced SEO',
    description: 'Improves your site’s visibility in search engines with deeper keyword targeting, metadata, and structure improvements.'
  },
  'google-analytics-setup': {
    title: 'Google Analytics Setup',
    description: 'Connects your website to Google Analytics so you can track visitors, traffic sources, and user behavior.'
  }
};
let addonDictionary = { ...fallbackDictionary };

function getFocusableElements(container) {
  if (!container) return [];
  const selectors = 'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';
  // Use getClientRects to determine visibility (works for fixed and transformed elements)
  return Array.from(container.querySelectorAll(selectors)).filter(el => {
    try {
      const rects = el.getClientRects();
      return rects && rects.length > 0 && !el.hasAttribute('disabled');
    } catch (err) {
      return false;
    }
  });
}

function injectCloseButton(modal) {
  if (modal.dataset.modalNoClose !== undefined) return;
  if (modal.dataset.modalCloseInjected === 'true') return;

  const header = modal.querySelector('.modal-header') || modal.querySelector('.modal-content');
  if (!header) return;

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'modal-close';
  closeButton.dataset.modalClose = '';
  closeButton.setAttribute('aria-label', 'Close');
  closeButton.textContent = '×';

  if (header.classList.contains('modal-header')) {
    header.appendChild(closeButton);
  } else {
    const wrapper = document.createElement('div');
    wrapper.className = 'modal-header';
    wrapper.appendChild(closeButton);
    while (header.firstChild) {
      wrapper.appendChild(header.firstChild);
    }
    header.appendChild(wrapper);
  }

  modal.dataset.modalCloseInjected = 'true';
}

function setInitialModalState() {
  if (!modalsParent) return;

  Array.from(modalsParent.children).forEach(child => {
    if (!child.id) {
      console.error('Modal element missing an ID. It cannot be targeted.', child);
      return;
    }
    modalMap.set(child.id, child);
    child.classList.add('hide');
    child.setAttribute('aria-hidden', 'true');
    injectCloseButton(child);
  });

  modalsParent.classList.add('hide', 'pointer-events-none');
}

function shouldStackModal(triggerElement, targetId) {
  if (targetId === 'addon-help-modal') return true;
  const trigger = triggerElement && typeof triggerElement.closest === 'function'
    ? triggerElement.closest('[data-modal-stack]')
    : null;
  return Boolean(trigger);
}

function shouldReplaceModal(triggerElement, targetId) {
  const trigger = triggerElement && typeof triggerElement.closest === 'function'
    ? triggerElement.closest('[data-modal-replace]')
    : null;
  return Boolean(trigger);
}

function openModal(id, triggerElement) {
  const modal = modalMap.get(id);
  if (!modal || !modalsParent) {
    if (DEBUG) console.error('openModal: target or parent not found for', id);
    return false;
  }

  if (activeModalId && activeModalId !== id) {
    if (shouldReplaceModal(triggerElement, id)) {
      closeModal();
    } else if (shouldStackModal(triggerElement, id)) {
      if (!modalStack.includes(activeModalId)) {
        modalStack.push(activeModalId);
      }
    } else {
      closeModal();
    }
  }

  modal.classList.remove('hide');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-hidden', 'false');
  modal.setAttribute('tabindex', '-1');

  modalsParent.classList.remove('hide', 'pointer-events-none');

  lastFocusedTrigger = triggerElement || document.activeElement;
  activeModalId = id;
  document.body.classList.add('modal-open');

  const focusable = getFocusableElements(modal);
  if (focusable.length > 0) {
    focusable[0].focus();
  } else {
    modal.focus();
  }

  if (DEBUG) console.log(`Modal opened: ${id}`);
  return true;
}

function closeModal() {
  if (!activeModalId) return false;
  const modal = modalMap.get(activeModalId);
  if (!modal || !modalsParent) return false;
  modal.classList.add('hide');
  modal.setAttribute('aria-hidden', 'true');
  // remove role/aria-modal/tabindex when closed to keep DOM clean
  modal.removeAttribute('role');
  modal.removeAttribute('aria-modal');
  modal.removeAttribute('tabindex');

  const previousModalId = modalStack.pop();
  if (previousModalId) {
    const previousModal = modalMap.get(previousModalId);
    if (previousModal) {
      previousModal.classList.remove('hide');
      previousModal.setAttribute('role', 'dialog');
      previousModal.setAttribute('aria-modal', 'true');
      previousModal.setAttribute('aria-hidden', 'false');
      previousModal.setAttribute('tabindex', '-1');
      activeModalId = previousModalId;
      modalsParent.classList.remove('hide', 'pointer-events-none');
      document.body.classList.add('modal-open');

      const focusable = getFocusableElements(previousModal);
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        previousModal.focus();
      }

      if (DEBUG) console.log(`Modal closed: ${activeModalId}`);
      return true;
    }
  }

  modalsParent.classList.add('hide', 'pointer-events-none');
  document.body.classList.remove('modal-open');

  if (lastFocusedTrigger && typeof lastFocusedTrigger.focus === 'function') {
    lastFocusedTrigger.focus();
  }

  if (DEBUG) console.log(`Modal closed: ${activeModalId}`);
  activeModalId = null;
  lastFocusedTrigger = null;
  return true;
}

function handleFocusTrap(e) {
  if (!activeModalId) return;
  const modal = modalMap.get(activeModalId);
  if (!modal) return;

  const focusable = getFocusableElements(modal);
  if (focusable.length === 0) {
    e.preventDefault();
    modal.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  } else if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  }
}

function findTriggerTarget(element) {
  if (!element) return null;
  const trigger = element.closest('[data-modal-trigger], [id$="-trig"]');
  if (!trigger) return null;
  if (trigger.hasAttribute('data-modal-trigger')) return trigger.dataset.modalTrigger;
  if (trigger.id && trigger.id.endsWith('-trig')) return trigger.id.slice(0, -5);
  return null;
}

function isCurrentModalNoClose() {
  if (!activeModalId) return false;
  const modal = modalMap.get(activeModalId);
  return modal ? modal.dataset.modalNoClose !== undefined : false;
}

async function loadDictionary() {
  try {
    const response = await fetch('dictionary.json');
    if (!response.ok) throw new Error('Unable to load dictionary');
    const data = await response.json();
    if (data && typeof data === 'object') {
      addonDictionary = { ...fallbackDictionary, ...data };
    }
  } catch (error) {
    addonDictionary = { ...fallbackDictionary };
  }
}

function populateHelpModal(helpKey) {
  const modal = document.getElementById('addon-help-modal');
  const titleElement = document.getElementById('addon-help-title');
  const descriptionElement = document.getElementById('addon-help-description');
  if (!modal || !titleElement || !descriptionElement) return;

  const normalizedKey = (helpKey || '').toString().trim().toLowerCase().replace(/\s+/g, '-');
  const entry = addonDictionary[normalizedKey] || addonDictionary[helpKey] || fallbackDictionary[normalizedKey];
  titleElement.textContent = entry?.title || 'Add-on details';
  descriptionElement.textContent = entry?.description || 'More information for this add-on will appear here.';
}

function setupModalEvents() {
  document.addEventListener('click', (event) => {
    const target = event.target;
    const helpTrigger = target.closest('[data-help-key]');

    if (helpTrigger) {
      event.preventDefault();
      event.stopPropagation();
      populateHelpModal(helpTrigger.dataset.helpKey);
      openModal('addon-help-modal', helpTrigger);
      return;
    }

    const backTrigger = target.closest('[data-modal-back]');
    if (backTrigger) {
      event.preventDefault();
      event.stopPropagation();

      const backTargetId = backTrigger.dataset.modalBackTarget || (activeModalId === 'website-questionnaire' ? `${document.getElementById('website-questionnaire')?.dataset.selectedPlanId || ''}-maintenance` : '');
      closeModal();

      if (backTargetId && activeModalId !== backTargetId) {
        openModal(backTargetId, backTrigger);
      }
      return;
    }

    const closeButton = target.closest('[data-modal-close]');
    if (closeButton && activeModalId) {
      event.preventDefault();
      event.stopPropagation();
      closeModal();
      return;
    }

    const modalId = findTriggerTarget(target);
    if (modalId) {
      event.preventDefault();
      event.stopPropagation();
      openModal(modalId, target.closest('[data-modal-trigger], [id$="-trig"]'));
      return;
    }

    if (target === modalsParent && !isCurrentModalNoClose()) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (!activeModalId) return;
    if (event.key === 'Escape') {
      if (!isCurrentModalNoClose()) {
        event.preventDefault();
        closeModal();
      }
    } else if (event.key === 'Tab') {
      handleFocusTrap(event);
    }
  });
}

function initAddonModal(modal) {
  const totalElement = modal.querySelector('[data-addon-total]');
  const checkboxes = modal.querySelectorAll('input[data-addon-price]');
  const noDatabaseCheckbox = modal.querySelector('input[data-addon-key="no-database"]');
  const noDatabaseDependentCheckboxes = Array.from(modal.querySelectorAll(
    'input[data-addon-key="ai-chatbot"], input[data-addon-key="appointment-booking"], input[data-addon-key="user-account-system"]'
  ));
  const extraPageCheckbox = modal.querySelector('input[data-addon-type="extra-pages"]');
  const extraPageDetail = modal.querySelector('[data-addon-detail="extra-pages"]');
  const extraPageCountInput = extraPageDetail ? extraPageDetail.querySelector('input') : null;
  const logoDesignCheckbox = modal.querySelector('input[data-addon-type="logo-design"]');
  const logoDesignDetail = modal.querySelector('[data-addon-detail="logo-design"]');
  if (!totalElement || checkboxes.length === 0) return;

  const basePrice = parseFloat(totalElement.dataset.basePrice || '0');

  const formatCurrency = (value) => `$${value.toFixed(2)}`;

  function toggleDetail(checkbox, detail) {
    if (detail) {
      detail.hidden = !checkbox.checked;
    }
  }

  function updateTotal() {
    let total = basePrice;
    checkboxes.forEach((checkbox) => {
      if (!checkbox.checked) return;

      const price = parseFloat(checkbox.dataset.addonPrice || '0');
      if (checkbox.dataset.addonType === 'extra-pages') {
        const quantity = parseInt(extraPageCountInput?.value || '0', 10);
        if (!Number.isNaN(quantity) && quantity > 0) {
          total += price * quantity;
        }
      } else {
        total += price;
      }
    });
    totalElement.textContent = formatCurrency(total);
  }

  function applyNoDatabaseDependencies() {
    if (!noDatabaseCheckbox || noDatabaseDependentCheckboxes.length === 0) return;

    const noDatabaseSelected = noDatabaseCheckbox.checked;

    noDatabaseDependentCheckboxes.forEach((checkbox) => {
      if (!checkbox.dataset.initialDisabled) {
        checkbox.dataset.initialDisabled = checkbox.disabled ? 'true' : 'false';
      }

      const initiallyDisabled = checkbox.dataset.initialDisabled === 'true';

      if (noDatabaseSelected && checkbox.checked) {
        checkbox.checked = false;
      }

      checkbox.disabled = noDatabaseSelected || initiallyDisabled;
      const option = checkbox.closest('.addon-option');
      if (option) {
        option.classList.toggle('greyed-out', checkbox.disabled);
      }
    });
  }

  checkboxes.forEach((checkbox) => checkbox.addEventListener('change', () => {
    if (checkbox.dataset.addonKey === 'no-database') {
      applyNoDatabaseDependencies();
    }
    if (checkbox.dataset.addonType === 'extra-pages') {
      toggleDetail(checkbox, extraPageDetail);
    }
    if (checkbox.dataset.addonType === 'logo-design') {
      toggleDetail(checkbox, logoDesignDetail);
    }
    updateTotal();
  }));

  if (extraPageCountInput) {
    extraPageCountInput.addEventListener('input', updateTotal);
  }

  if (extraPageCheckbox) {
    toggleDetail(extraPageCheckbox, extraPageDetail);
  }
  if (logoDesignCheckbox) {
    toggleDetail(logoDesignCheckbox, logoDesignDetail);
  }

  applyNoDatabaseDependencies();

  updateTotal();
}

function initMaintenanceModal(modal) {
  const totalElement = modal.querySelector('[data-maintenance-total]');
  const options = modal.querySelectorAll('input[data-maintenance-price]');
  const planId = modal.dataset.planId;
  if (!totalElement || options.length === 0 || !planId) return;

  const formatCurrency = (value) => `$${value.toFixed(2)}`;

  function updateTotal() {
    const linkedModal = document.getElementById(planId);
    const linkedTotalElement = linkedModal?.querySelector('[data-addon-total]');
    const linkedTotalText = linkedTotalElement?.textContent || '';
    const linkedTotal = parseFloat((linkedTotalText || '').replace(/[^0-9.-]+/g, ''));
    const websiteTotal = Number.isNaN(linkedTotal) ? 0 : linkedTotal;

    const selectedOption = modal.querySelector('input[data-maintenance-price]:checked');
    const maintenancePrice = parseFloat(selectedOption?.dataset.maintenancePrice || '0');
    totalElement.textContent = formatCurrency(websiteTotal + maintenancePrice);
  }

  options.forEach((option) => option.addEventListener('change', updateTotal));

  const linkedModal = document.getElementById(planId);
  if (linkedModal) {
    linkedModal.addEventListener('change', updateTotal);
    linkedModal.addEventListener('input', updateTotal);
  }

  updateTotal();
}

function initAddonTotals() {
  document.querySelectorAll('.addon-modal').forEach((modal) => initAddonModal(modal));
  document.querySelectorAll('.maintenance-modal').forEach((modal) => initMaintenanceModal(modal));
}

function activateModals() {
  modalsParent = document.getElementById('modals');
  if (!modalsParent) {
    if (DEBUG) console.warn('activateModals: #modals container not found');
    return;
  }

  setInitialModalState();
  setupModalEvents();
  initAddonTotals();
  void loadDictionary();
}

document.addEventListener('DOMContentLoaded', activateModals);