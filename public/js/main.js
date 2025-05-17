document.addEventListener("DOMContentLoaded", () => {
	const body = document.body;
	const navContainer = document.querySelector('.nav_container');
  const drawerToggle = document.getElementById('drawerToggle');
	const drawerLink = document.querySelector('.drawer_link');

	function getScrollbarWidth() {
		return window.innerWidth - document.documentElement.clientWidth;
	}

	drawerToggle.addEventListener('change', () => {
		if (drawerToggle.checked) {
			const scrollbarWidth = getScrollbarWidth();
			body.style.overflow = 'hidden';
			body.style.paddingRight = `${scrollbarWidth}px`;
			navContainer.style.marginRight = `${scrollbarWidth}px`;
			drawerLink.style.marginRight = `${scrollbarWidth}px`;
		} else {
			body.style.overflow = '';
			body.style.paddingRight = '';
			navContainer.style.marginRight = '';
			drawerLink.style.marginRight = '';
			document.documentElement.style.overflow = '';
			body.style.overflow = '';
		}
	});

	const radios = document.querySelectorAll(".tab_radio");
  const labels = document.querySelectorAll(".tab_label");
  const overlay = document.querySelector(".button_overlay");
  const cards = document.querySelectorAll("#tabber-cards");

  const positions = {
    labels: "0.438rem",
    ribbons: "34.1%",
    equipment: "67.1%"
  };

  function updateTabUI(value) {
    labels.forEach(label => {
      const input = document.getElementById(label.htmlFor);
      if (input.value === value) {
        label.style.color = "var(--clr-cta-text)";
      } else {
        label.style.color = "var(--clr-text)";
      }
    });

    overlay.style.left = `calc(${positions[value]} - 0.25rem)`;

    cards.forEach(section => {
      section.style.display = section.dataset.tab === value ? "flex" : "none";
    });
  }

  radios.forEach(radio => {
    radio.addEventListener("change", () => {
      updateTabUI(radio.value);
    });

    if (radio.checked) updateTabUI(radio.value);
  });

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const data = {};
      formData.forEach((value, key) => {
        data[key] = value;
      });
      try {
        const response = await fetch('/contact-request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (response.ok) {
          showSnackbar('Request sent successfully!');
          contactForm.reset();
        } else {
          showSnackbar('Failed to send request. Please try again.');
        }
      } catch (err) {
        showSnackbar('Error sending request.');
      } 
    });
  }

  let snackbarTimeout = null;
  function showSnackbar(message) {
    const snackbar = document.getElementById('snackBar');
    const snackText = snackbar.querySelector('.snack_text');
    
    if (snackbarTimeout) {
      clearTimeout(snackbarTimeout);
      
      if (snackbar.classList.contains('show')) {
        snackbar.classList.remove('show');
          
        setTimeout(() => {
          showNewSnackbar();
        }, 50);
      } else {
        showNewSnackbar();
      }
    } else {
      showNewSnackbar();
    }
    
    function showNewSnackbar() {
      snackText.textContent = message;
      snackbar.classList.add('show');
      
      snackbarTimeout = setTimeout(() => {
        snackbar.classList.remove('show');
        snackbarTimeout = null;
      }, 4000);
    }
  }

  const languageSwitcher = document.getElementById('language-switcher');
  const currentLang = localStorage.getItem('language') || 'es';

  function updateLanguage(lang) {
    if (lang !== 'en' && lang !== 'es') return;
    
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    
    const newLang = lang === 'en' ? 'es' : 'en';
    languageSwitcher.setAttribute('data-lang', newLang);
    languageSwitcher.textContent = translations[newLang]['language.switch'];
    
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        if (element.tagName === 'INPUT' && element.hasAttribute('data-i18n-value')) {
          element.value = translations[lang][key];
          element.textContent = translations[lang][key];
        } else {
          element.textContent = translations[lang][key];
        }
      }
    });
    
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      if (translations[lang] && translations[lang][key]) {
        element.placeholder = translations[lang][key];
      }
    });
  }

  updateLanguage(currentLang);

  languageSwitcher.addEventListener('click', () => {
    const newLang = languageSwitcher.getAttribute('data-lang');
    updateLanguage(newLang);
  });

  function handleNavigationClick(e) {
    const target = e.target.closest('a');
    if (!target || !target.hash) return;

    e.preventDefault();
    const targetId = target.hash.substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (!targetElement) return;

    if (drawerToggle.checked) {
      drawerToggle.checked = false;
      body.style.overflow = '';
      body.style.paddingRight = '';
      navContainer.style.marginRight = '';
      drawerLink.style.marginRight = '';
      setTimeout(() => {
        scrollToSection(targetElement);
      }, 300);
    } else {
      scrollToSection(targetElement);
    }
  }

  function scrollToSection(element) {
    const headerOffset = 110;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({
      top: offsetPosition,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });

    document.documentElement.style.overflow = '';
    body.style.overflow = '';
  }

  document.querySelectorAll('.nav_container a, .drawer_content a, .hero_cta a').forEach(link => {
    link.addEventListener('click', handleNavigationClick);
  });
})