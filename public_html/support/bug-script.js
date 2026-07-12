// CONFIGURATION: POINT BOTH LOCAL AND LIVE BUILDS TO THE RIGHT SERVER
const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const API_BASE_URL = window.location.protocol === 'file:' || isLocalHost
  ? 'http://localhost:3000'
  : 'https://ziggylabs.dev';

const BUG_REPORT_ENDPOINT = `${API_BASE_URL}/api/bug-reports`;

// DOM ELEMENTS MATCHING YOUR FORMS
const form = document.getElementById('bug-report-form');
const message = document.getElementById('form-message');
const submitBtn = document.getElementById('submit-btn');
const pageUrlInput = document.getElementById('page-url');

// Helper function to render success or error alerts in your UI
function showMessage(kind, text) {
  if (!message) return;
  message.className = `form-message ${kind === 'success' ? 'is-success' : 'is-error'}`;
  message.textContent = text;
}

// 2. INTERCEPT THE FORM SUBMISSION
if (form) {
  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    // Gather inputs and trim whitespace strings
    const payload = {
      // If these elements don't exist on the page, they safely default to an empty string ''
      name: document.getElementById('reporter-name')?.value.trim() || '',
      email: document.getElementById('reporter-email')?.value.trim() || '',
      
      pageUrl: pageUrlInput?.value.trim() || '',
      summary: document.getElementById('summary')?.value.trim() || '',
      details: document.getElementById('details')?.value.trim() || ''
    };


    // Quick frontend safety validation check
    if (!payload.summary || !payload.details) {
      showMessage('error', 'Summary and details are required.');
      return;
    }

    // Lock down button to prevent multiple spam clicks
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }
    showMessage('success', '');

    try {
      // 3. FIRE THE FETCH HANDSHAKE ACROSS TO YOUR MAIN SERVER
      const response = await fetch(BUG_REPORT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || 'Could not submit bug report.');
      }

      // Reset fields cleanly upon successful submission
      form.reset();
      
      showMessage('success', 'Bug report sent. Thank you.');
    } catch (error) {
      showMessage('error', error.message || 'Could not submit bug report.');
    } finally {
      // Unlock UI elements
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Bug Report';
      }
    }
  });
}
