/* =============================================
   ROADMATE AI — MAIN JS
   ============================================= */

/* --- Nav: scroll background --- */
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* --- Mobile nav toggle --- */
const navToggle  = document.getElementById('nav-toggle');
const navMobile  = document.getElementById('nav-mobile');

navToggle.addEventListener('click', () => {
  const isOpen = navMobile.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

function closeMobileNav() {
  navMobile.classList.remove('open');
  navToggle.classList.remove('open');
  document.body.style.overflow = '';
}

// Close on outside click
document.addEventListener('click', (e) => {
  if (!nav.contains(e.target) && !navMobile.contains(e.target)) {
    closeMobileNav();
  }
});

/* --- Smooth scroll for anchor links --- */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80; // nav height
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* --- State field visibility (show only for US/Canada) --- */
function toggleState(country) {
  const stateGroup = document.getElementById('state-group');
  const stateInput = document.getElementById('state');
  const showState  = country === 'US' || country === 'CA';
  stateGroup.style.display = showState ? '' : 'none';
  stateInput.required      = false; // state is never required
}
// Hide state initially if country is not US/CA
toggleState(document.getElementById('country')?.value || 'US');

/* --- Scroll reveal (IntersectionObserver) --- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* --- Waitlist form submission --- */
const form        = document.getElementById('waitlist-form');
const successBox  = document.getElementById('waitlist-success');
const errorBanner = document.getElementById('form-error');
const submitBtn   = document.getElementById('submit-btn');
const btnText     = document.getElementById('btn-text');
const btnLoading  = document.getElementById('btn-loading');

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwYBxFN6XHZyzOnv1KHARa9VsuonZNE2VoACq5TSDusCOadqRFH3gsZCn90l7q4LZ5HBw/exec';

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorBanner.style.display = 'none';
  setLoading(true);

  try {
    const payload = Object.fromEntries(new FormData(form).entries());

    // Google Apps Script requires no-cors mode to avoid preflight CORS issues
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // no-cors responses are opaque — if fetch didn't throw, treat as success
    showSuccess();

  } catch {
    errorBanner.style.display = 'flex';
    setLoading(false);
  }
});

function setLoading(loading) {
  submitBtn.disabled = loading;
  btnText.style.display    = loading ? 'none'  : 'inline';
  btnLoading.style.display = loading ? 'inline' : 'none';
}

function showSuccess() {
  form.style.display       = 'none';
  successBox.style.display = 'block';
  successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
