// Minimal JS: mobile nav + about toggle + gallery lightbox + contact form (Formspree + mailto fallback)
document.addEventListener('DOMContentLoaded', function () {
  /* NAV toggle */
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('site-nav');
  navToggle && navToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  /* About read-more */
  const aboutToggle = document.getElementById('about-toggle');
  const aboutMore = document.getElementById('about-more');
  aboutToggle && aboutToggle.addEventListener('click', () => {
    const expanded = aboutToggle.getAttribute('aria-expanded') === 'true';
    aboutMore.classList.toggle('collapsed');
    aboutToggle.setAttribute('aria-expanded', String(!expanded));
    aboutToggle.textContent = expanded ? 'Read more' : 'Show less';
  });

  /* GALLERY: click to open lightbox */
  const galleryImages = Array.from(document.querySelectorAll('#gallery-grid img'));
  const lightbox = document.getElementById('lightbox');
  const lbImage = document.getElementById('lb-image');
  const lbCaption = document.getElementById('lb-caption');
  const lbClose = document.getElementById('lb-close');
  const lbPrev = document.getElementById('lb-prev');
  const lbNext = document.getElementById('lb-next');

  let currentIndex = 0;
  function openLightbox(index) {
    if (!galleryImages[index]) return;
    currentIndex = index;
    lbImage.src = galleryImages[index].src;
    lbImage.alt = galleryImages[index].alt || 'Gallery image';
    lbCaption.textContent = galleryImages[index].alt || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    lbImage.src = '';
    lbCaption.textContent = '';
  }
  function showPrev() { openLightbox((currentIndex - 1 + galleryImages.length) % galleryImages.length); }
  function showNext() { openLightbox((currentIndex + 1) % galleryImages.length); }

  galleryImages.forEach((img, idx) => {
    img.addEventListener('click', () => openLightbox(idx));
  });
  lbClose && lbClose.addEventListener('click', closeLightbox);
  lbPrev && lbPrev.addEventListener('click', showPrev);
  lbNext && lbNext.addEventListener('click', showNext);
  // close on background click
  lightbox && lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  // keyboard nav
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

/* PUBLICATIONS: read more toggle */
const readMoreButtons = document.querySelectorAll('.read-more-btn');

readMoreButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const paragraph = btn.previousElementSibling;
    const moreText = paragraph.querySelector('.more-text');
    const expanded = btn.getAttribute('aria-expanded') === 'true';

    if (expanded) {
      moreText.style.display = 'none';
      btn.textContent = 'Read more';
    } else {
      moreText.style.display = 'inline';
      btn.textContent = 'Read less';
    }

    btn.setAttribute('aria-expanded', String(!expanded));
  });
});


  /* CONTACT FORM: Formspree (AJAX) with mailto fallback if placeholder used */
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('contact-submit');
  const statusEl = document.getElementById('form-status');

  form && form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = '';
    statusEl.className = 'form-status';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    const formAction = form.getAttribute('action') || '';
    const formData = new FormData(form);

    // If user has not replaced the placeholder endpoint, use mailto fallback
    const isPlaceholder = formAction.includes('yourFormID') || formAction.trim() === '';

    if (isPlaceholder) {
      // Mailto fallback — opens the visitor's email client (they must click Send)
      const name = formData.get('name') || 'No name';
      const email = formData.get('email') || 'No email';
      const message = formData.get('message') || '';
      const yourEmail = 'youremail@institution.edu'; // <-- Replace this if you want fallback to go to a different address

      const subject = `Website contact from ${name}`;
      const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
      const mailto = `mailto:${encodeURIComponent(yourEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      // open user's mail client
      window.location.href = mailto;

      statusEl.textContent = 'Your mail client should open. Press Send to deliver the message.';
      statusEl.classList.add('success');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send message';
      return;
    }

    // If real Formspree endpoint provided — send via fetch (AJAX)
    try {
      const response = await fetch(formAction, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        // success
        form.reset();
        statusEl.textContent = 'Message sent — thank you! I will get back to you soon.';
        statusEl.classList.add('success');
      } else {
        const data = await response.json().catch(() => ({}));
        const errMsg = (data && data.error) ? data.error : 'There was a problem sending your message.';
        statusEl.textContent = errMsg;
        statusEl.classList.add('error');
      }
    } catch (err) {
      statusEl.textContent = 'Network error — could not send message. Try again later.';
      statusEl.classList.add('error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send message';
    }
  });

});
