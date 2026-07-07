(() => {
  const maintenancePlanOptions = [
    {
      id: 'none',
      name: 'No maintenance plan',
      price: 0,
      priceDisplay: '$0.00/month',
      features: ['No ongoing support or updates']
    },
    {
      id: 'basic',
      name: 'Basic Maintenance',
      price: 9.99,
      priceDisplay: '$9.99/month',
      features: ['Security Updates', 'Bug Fixes'],
      popular: true
    },
    {
      id: 'standard',
      name: 'Standard Maintenance',
      price: 19.99,
      priceDisplay: '$19.99/month',
      features: ['Everything in Basic', 'Monthly Content Updates', 'Website Backups']
    },
    {
      id: 'premium',
      name: 'Premium Maintenance',
      price: 39.99,
      priceDisplay: '$39.99/month',
      features: ['Everything in Standard', 'Priority Support', 'Performance Monitoring', 'Feature Updates']
    }
  ];

  const plans = [
    {
      id: 'starter-website',
      heading: 'Great, you have selected our Starter Website Plan. Select any Add-ons you want below:',
      basePrice: 89.99,
      intro: 'Choose the extras that fit your project',
      addons: [
        {
          name: 'AI Chatbot',
          price: 130.00,
          priceDisplay: 'Starting at $130.00',
          helpKey: 'ai-chatbot',
          disabled: true,
          disabledText: 'Requires Professional Website or Higher'
        },
        {
          name: 'Enhanced Mobile Optimization',
          price: 20.00,
          priceDisplay: '+$20.00',
          helpKey: 'enhanced-mobile-optimization'
        },
        {
          name: 'Extra Page',
          price: 15.00,
          priceDisplay: '+$15.00 each',
          helpKey: 'extra-page',
          type: 'extra-pages',
          detailLabel: 'How many extra pages do you need?',
          detailInputType: 'number',
          detailMin: 1,
          detailValue: 1
        },
        {
          name: 'Unlimted Custom Animations',
          price: 25.00,
          priceDisplay: '+$25.00',
          helpKey: 'custom-animations'
        },
        {
          name: 'Image Carosel',
          price: 30.00,
          priceDisplay: '+$30.00',
          helpKey: 'image-gallery'
        },
        {
          name: 'JSON File Integration / Dynamic Website',
          price: 35.00,
          priceDisplay: '+$35.00',
          helpKey: 'json-file-integration'
        },
        {
          name: 'Logo Design',
          price: 75.00,
          priceDisplay: 'Starting at $75.00',
          helpKey: 'logo-design',
          type: 'logo-design',
          detailLabel: 'What would you like your logo to include?',
          detailTextarea: true,
          detailPlaceholder: 'Describe your logo idea here...'
        },
        {
          name: 'Appointment Booking',
          price: 40.00,
          priceDisplay: '+$40.00',
          helpKey: 'appointment-booking',
          disabled: true,
          disabledText: 'Requires Standard Website or Higher'
        },
        {
          name: 'Advanced SEO',
          price: 40.00,
          priceDisplay: '+$40.00',
          helpKey: 'advanced-seo',
          disabled: true,
          disabledText: 'Requires Standard Website or Higher'
        },
        {
          name: 'User Account System',
          price: 50.00,
          priceDisplay: '+$50.00',
          helpKey: 'user-account-system',
          disabled: true,
          disabledText: 'Requires Professional Website or Higher'
        },
        {
          name: 'Google Analytics Setup',
          price: 25.00,
          priceDisplay: '+$25.00',
          helpKey: 'google-analytics-setup',
          disabled: true,
          disabledText: 'Requires Standard Website or Higher'
        }
      ]
    },
    {
      id: 'standard-website',
      heading: 'Great, you have selected our Standard Website Plan. Select any Add-ons you want below:',
      basePrice: 174.99,
      intro: 'Choose the extras that fit your project',
      addons: [
        {
          name: 'AI Chatbot',
          price: 130.00,
          priceDisplay: 'Starting at $130.00',
          helpKey: 'ai-chatbot',
          disabled: true,
          disabledText: 'Requires Professional Website or Higher'
        },
        {
          name: 'Extra Page',
          price: 15.00,
          priceDisplay: '+$15.00 each',
          helpKey: 'extra-page',
          type: 'extra-pages',
          detailLabel: 'How many extra pages do you need?',
          detailInputType: 'number',
          detailMin: 1,
          detailValue: 1
        },
        {
          name: 'Image Carosel',
          price: 30.00,
          priceDisplay: '+$30.00',
          helpKey: 'image-gallery'
        },
        {
          name: 'JSON File Integration / Dynamic Website',
          price: 35.00,
          priceDisplay: '+$35.00',
          helpKey: 'json-file-integration'
        },
        {
          name: 'Logo Design',
          price: 75.00,
          priceDisplay: 'Starting at $75.00',
          helpKey: 'logo-design',
          type: 'logo-design',
          detailLabel: 'What would you like your logo to include?',
          detailTextarea: true,
          detailPlaceholder: 'Describe your logo idea here...'
        },
        {
          name: 'Appointment Booking',
          price: 40.00,
          priceDisplay: '+$40.00',
          helpKey: 'appointment-booking'
        },
        {
          name: 'Advanced SEO',
          price: 40.00,
          priceDisplay: '+$40.00',
          helpKey: 'advanced-seo'
        },
        {
          name: 'User Account System',
          price: 50.00,
          priceDisplay: '+$50.00',
          helpKey: 'user-account-system',
          disabled: true,
          disabledText: 'Requires Professional Website or Higher'
        },
        {
          name: 'Google Analytics Setup',
          price: 25.00,
          priceDisplay: '+$25.00',
          helpKey: 'google-analytics-setup'
        }
      ]
    },
    {
      id: 'professional-website',
      heading: 'Great, you have selected our Professional Website Plan. Select any Add-ons you want below:',
      basePrice: 349.99,
      intro: 'Choose the extras that fit your project',
      addons: [
        {
          name: 'AI Chatbot',
          price: 130.00,
          priceDisplay: 'Starting at $130.00',
          helpKey: 'ai-chatbot'
        },
        {
          name: 'Extra Page',
          price: 15.00,
          priceDisplay: '+$15.00 each',
          helpKey: 'extra-page',
          type: 'extra-pages',
          detailLabel: 'How many extra pages do you need?',
          detailInputType: 'number',
          detailMin: 1,
          detailValue: 1
        },
        {
          name: 'Image Carosel',
          price: 30.00,
          priceDisplay: '+$30.00',
          helpKey: 'image-gallery'
        },
        {
          name: 'JSON File Integration / Dynamic Website',
          price: 35.00,
          priceDisplay: '+$35.00',
          helpKey: 'json-file-integration'
        },
        {
          name: 'Logo Design',
          price: 75.00,
          priceDisplay: 'Starting at $75.00',
          helpKey: 'logo-design',
          type: 'logo-design',
          detailLabel: 'What would you like your logo to include?',
          detailTextarea: true,
          detailPlaceholder: 'Describe your logo idea here...'
        },
        {
          name: 'Appointment Booking',
          price: 40.00,
          priceDisplay: '+$40.00',
          helpKey: 'appointment-booking'
        },
        {
          name: 'Advanced SEO',
          price: 35.00,
          priceDisplay: '+$35.00',
          helpKey: 'advanced-seo'
        },
        {
          name: 'User Account System',
          price: 20.00,
          priceDisplay: '+$20.00',
          helpKey: 'user-account-system'
        },
        {
          name: 'Google Analytics Setup',
          price: 25.00,
          priceDisplay: '+$25.00',
          helpKey: 'google-analytics-setup'
        },
        {
          name: 'No Database',
          price: -10.00,
          priceDisplay: '-$10.00',
          helpKey: 'no-database'
        }
      ]
    }
  ];

  function formatCurrency(value) {
    return `$${Number(value).toFixed(2)}`;
  }

  function createDetailMarkup(plan, addon) {
    if (!addon.type) return '';

    const detailId = `${plan.id}-${addon.type === 'extra-pages' ? 'extra-pages' : 'logo-design'}-detail`;
    const fieldId = `${plan.id}-${addon.type === 'extra-pages' ? 'extra-pages-count' : 'logo-design-idea'}`;

    if (addon.type === 'extra-pages') {
      return `
        <div class="addon-detail" data-addon-detail="extra-pages" id="${detailId}" hidden>
          <label class="addon-detail-field" for="${fieldId}">
            <span>${addon.detailLabel}</span>
            <input type="number" id="${fieldId}" min="1" value="1" inputmode="numeric">
          </label>
        </div>`;
    }

    return `
      <div class="addon-detail" data-addon-detail="logo-design" id="${detailId}" hidden>
        <label class="addon-detail-field" for="${fieldId}">
          <span>${addon.detailLabel}</span>
          <textarea id="${fieldId}" rows="3" placeholder="${addon.detailPlaceholder || ''}"></textarea>
        </label>
      </div>`;
  }

  function createMaintenanceOptionMarkup(plan, option) {
    const checked = option.id === 'none' ? 'checked' : '';
    const popularBadge = option.popular ? '<span class="pricing-badge maintenance-badge">Popular</span>' : '';
    const featureMarkup = option.features.map((feature) => `<li>${feature}</li>`).join('');

    return `
      <label class="addon-option maintenance-option${option.popular ? ' is-popular' : ''}" role="listitem">
        <input type="radio" name="${plan.id}-maintenance-plan" value="${option.id}" data-maintenance-price="${option.price.toFixed(2)}" ${checked}>
        <span class="addon-copy">
          <div class="maintenance-heading">
            <strong>${option.name}</strong>
            ${popularBadge}
          </div>
          <span>${option.priceDisplay}</span>
          <ul class="maintenance-features">${featureMarkup}</ul>
        </span>
      </label>`;
  }

  function createMaintenanceModalMarkup(plan) {
    const maintenanceOptionsMarkup = maintenancePlanOptions.map((option) => createMaintenanceOptionMarkup(plan, option)).join('');

    return `
      <div id="${plan.id}-maintenance" class="modal-large maintenance-modal" tabindex="-1" data-plan-id="${plan.id}">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Choose a maintenance plan for your website</h2>
            <div class="modal-total-pill" aria-live="polite">
              <span class="modal-total-label">Running total</span>
              <strong data-maintenance-total>${formatCurrency(plan.basePrice)}</strong>
            </div>
          </div>
          <div class="modal-body">
            <p class="modal-intro">Pick ongoing support for your site. You can also skip maintenance for now.</p>
            <div class="addon-list" role="list">
              ${maintenanceOptionsMarkup}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="button button-secondary" data-modal-close>Back</button>
            <button type="button" class="button button-primary" data-modal-trigger="website-questionnaire" data-modal-replace="true">Next</button>
          </div>
        </div>
      </div>`;
  }

  function createQuestionnaireModalMarkup() {
    return `
      <div id="website-questionnaire" class="modal-large questionnaire-modal" tabindex="-1">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Quick project questionnaire</h2>
          </div>
          <div class="modal-body">
            <p class="modal-intro">Share a few details so we can tailor the best package and next steps for your project.</p>
            <div class="questionnaire-form">
              <div class="question-group">
                <h3>Contact details</h3>
                <div class="contact-grid">
                  <label class="text-field">
                    <span>Name</span>
                    <input type="text" placeholder="Your name" required>
                  </label>
                  <label class="text-field">
                    <span>Email</span>
                    <input type="email" placeholder="you@example.com" required>
                  </label>
                  <label class="text-field">
                    <span>Phone</span>
                    <input type="tel" placeholder="(555) 123-4567">
                  </label>
                </div>
              </div>
              <div class="question-group">
                <h3>What kind of website do you need?</h3>
                <div class="question-options">
                  <label class="question-option"><input type="radio" name="website-goal" value="landing"><span>Landing page</span></label>
                  <label class="question-option"><input type="radio" name="website-goal" value="business"><span>Business site</span></label>
                  <label class="question-option"><input type="radio" name="website-goal" value="shop"><span>Online store</span></label>
                  <label class="question-option"><input type="radio" name="website-goal" value="portfolio"><span>Portfolio</span></label>
                </div>
              </div>
              <div class="question-group">
                <h3>What is your timeline?</h3>
                <div class="question-options">
                  <label class="question-option"><input type="radio" name="timeline" value="asap"><span>ASAP</span></label>
                  <label class="question-option"><input type="radio" name="timeline" value="2-4-weeks"><span>2–4 weeks</span></label>
                  <label class="question-option"><input type="radio" name="timeline" value="1-2-months"><span>1–2 months</span></label>
                </div>
              </div>
              <div class="question-group">
                <h3>In a few paragraphs, please explain exactly what website you need. Please be as detailed as possible.</h3>
                <label class="text-field text-field--full">
                  <span>Project details</span>
                  <textarea rows="6" required placeholder="Explain what website you need"></textarea>
                </label>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="button button-secondary" data-modal-close>Close</button>
          </div>
        </div>
      </div>`;
  }

  function createAddonMarkup(plan, addon) {
    const inputAttributes = [`data-addon-price="${addon.price.toFixed(2)}"`];
    if (addon.type) {
      inputAttributes.push(`data-addon-type="${addon.type}"`);
    }
    if (addon.disabled) {
      inputAttributes.push('disabled');
    }

    const detailMarkup = createDetailMarkup(plan, addon);

    return `
      <label class="addon-option${addon.disabled ? ' greyed-out' : ''}" role="listitem">
        <input type="checkbox" ${inputAttributes.join(' ')}>
        <span class="addon-copy">
          <strong>${addon.name}</strong>
          ${addon.disabledText ? `<i>${addon.disabledText}</i>` : ''}
          <span>${addon.priceDisplay}</span>
        </span>
        <button class="addon-help-trigger" type="button" data-modal-trigger="addon-help-modal" data-help-key="${addon.helpKey}" aria-label="Learn more about ${addon.name}">?</button>
      </label>
      ${detailMarkup}`;
  }

  function createPlanModalMarkup(plan) {
    const addonMarkup = plan.addons.map((addon) => createAddonMarkup(plan, addon)).join('');

    return `
      <div id="${plan.id}" class="modal-large addon-modal" tabindex="-1">
        <div class="modal-content">
          <div class="modal-header">
            <h2>${plan.heading}</h2>
            <div class="modal-total-pill" aria-live="polite">
              <span class="modal-total-label">Running total</span>
              <strong id="${plan.id}-total" data-addon-total data-base-price="${plan.basePrice.toFixed(2)}">${formatCurrency(plan.basePrice)}</strong>
            </div>
          </div>
          <div class="modal-body">
            <p class="modal-intro">${plan.intro}</p>
            <div class="addon-list" role="list">
              ${addonMarkup}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="button button-secondary" data-modal-trigger="${plan.id}-maintenance" data-modal-replace="true">Next</button>
          </div>
        </div>
      </div>`;
  }

  function createHelpModalMarkup() {
    return `
      <div id="addon-help-modal" class="modal-small addon-help-modal" tabindex="-1">
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="addon-help-title">Add-on details</h2>
          </div>
          <div class="modal-body">
            <p id="addon-help-description">Select an add-on to learn more about it.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="button button-secondary" data-modal-close>Close</button>
          </div>
        </div>
      </div>`;
  }

  function injectModalMarkup() {
    const modalsContainer = document.getElementById('modals');
    if (!modalsContainer) return;

    const generatedMarkup = [
      ...plans.map((plan) => createPlanModalMarkup(plan)),
      ...plans.map((plan) => createMaintenanceModalMarkup(plan)),
      createQuestionnaireModalMarkup(),
      createHelpModalMarkup()
    ].join('');

    modalsContainer.innerHTML = generatedMarkup;
  }

  injectModalMarkup();
})();
