/**
 * ==========================================================================
 * BRIGHTSMILE DENTAL CARE — CORE JAVASCRIPT
 * Features:
 * 1. FOUC-Free Dark/Light Theme System with localStorage persistence
 * 2. True Layout-Level RTL Toggle System with localStorage persistence
 * 3. Mobile Navigation Drawer (44px touch targets, ESC/backdrop dismissal)
 * 4. FAQ Accordion Controller
 * 5. Dynamic Live Specialization Filter & Real-Time Doctor Search
 * 6. Quick Booking & Consultation Form Handler
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ==========================================================================
  // 1. THEME CONTROLLER (Dark / Light Mode)
  // ==========================================================================
  const ThemeController = (() => {
    const STORAGE_KEY = 'brightsmile_dental_theme';
    const themeToggleBtns = document.querySelectorAll('[data-action="toggle-theme"]');

    const getPreferredTheme = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const applyTheme = (theme) => {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark-mode');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark-mode');
        document.documentElement.setAttribute('data-theme', 'light');
      }
      localStorage.setItem(STORAGE_KEY, theme);
      updateButtons(theme);
    };

    const updateButtons = (theme) => {
      themeToggleBtns.forEach((btn) => {
        const isDark = theme === 'dark';
        btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
        btn.setAttribute('title', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');

        const label = btn.querySelector('.theme-label');
        if (label) {
          label.textContent = isDark ? 'Light Mode' : 'Dark Mode';
        }

        const iconContainer = btn.querySelector('.theme-icon');
        if (iconContainer) {
          iconContainer.innerHTML = isDark
            ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
            : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
        }
      });
    };

    const toggle = () => {
      const current = document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    };

    const init = () => {
      const active = getPreferredTheme();
      applyTheme(active);

      themeToggleBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          toggle();
        });
      });

      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(STORAGE_KEY)) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    };

    return { init, toggle, applyTheme };
  })();

  // ==========================================================================
  // 2. RTL CONTROLLER (Layout-Level Direction Mirroring)
  // ==========================================================================
  const RTLController = (() => {
    const STORAGE_KEY = 'brightsmile_dental_rtl';
    const rtlToggleBtns = document.querySelectorAll('[data-action="toggle-rtl"]');

    const getPreferredDirection = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return saved;
      return document.documentElement.getAttribute('dir') || 'ltr';
    };

    const applyDirection = (dir) => {
      const isRTL = dir === 'rtl';
      document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
      if (isRTL) {
        document.documentElement.classList.add('rtl-mode');
      } else {
        document.documentElement.classList.remove('rtl-mode');
      }
      localStorage.setItem(STORAGE_KEY, isRTL ? 'rtl' : 'ltr');
      updateButtons(isRTL);
    };

    const updateButtons = (isRTL) => {
      rtlToggleBtns.forEach((btn) => {
        btn.setAttribute('aria-pressed', isRTL ? 'true' : 'false');
        btn.setAttribute('title', isRTL ? 'Switch to Left-to-Right' : 'Switch to Right-to-Left');

        const label = btn.querySelector('.rtl-label');
        if (label) {
          label.textContent = isRTL ? 'LTR' : 'RTL';
        }
      });
    };

    const toggle = () => {
      const current = document.documentElement.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr';
      const next = current === 'rtl' ? 'ltr' : 'rtl';
      applyDirection(next);
    };

    const init = () => {
      const active = getPreferredDirection();
      applyDirection(active);

      rtlToggleBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          toggle();
        });
      });
    };

    return { init, toggle, applyDirection };
  })();

  // ==========================================================================
  // 3. MOBILE HAMBURGER DRAWER CONTROLLER
  // ==========================================================================
  const MobileDrawerController = (() => {
    const hamburgerBtn = document.querySelector('[data-action="open-drawer"]');
    const closeBtn = document.querySelector('[data-action="close-drawer"]');
    const drawer = document.querySelector('.mobile-drawer');
    const backdrop = document.querySelector('.mobile-drawer-backdrop');

    if (!drawer) return { init: () => {} };

    const openDrawer = () => {
      drawer.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
      document.body.classList.add('menu-open');
      if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'true');
    };

    const closeDrawer = () => {
      drawer.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
      document.body.classList.remove('menu-open');
      if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'false');
    };

    const init = () => {
      if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', (e) => {
          e.preventDefault();
          openDrawer();
        });
      }

      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          closeDrawer();
        });
      }

      if (backdrop) {
        backdrop.addEventListener('click', closeDrawer);
      }

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer.classList.contains('open')) {
          closeDrawer();
        }
      });

      drawer.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', () => {
          closeDrawer();
        });
      });
    };

    return { init, openDrawer, closeDrawer };
  })();

  // ==========================================================================
  // 4. FAQ ACCORDION CONTROLLER
  // ==========================================================================
  const AccordionController = (() => {
    const init = () => {
      const accordions = document.querySelectorAll('.accordion-group');
      accordions.forEach((group) => {
        const buttons = group.querySelectorAll('.accordion-btn');
        buttons.forEach((btn) => {
          btn.addEventListener('click', () => {
            const item = btn.closest('.accordion-item');
            const isOpen = item.classList.contains('open');

            // Close all sibling items in the same group
            group.querySelectorAll('.accordion-item').forEach((sibling) => {
              sibling.classList.remove('open');
              const siblingBtn = sibling.querySelector('.accordion-btn');
              if (siblingBtn) siblingBtn.setAttribute('aria-expanded', 'false');
            });

            // If it wasn't open, open it
            if (!isOpen) {
              item.classList.add('open');
              btn.setAttribute('aria-expanded', 'true');
            }
          });
        });
      });
    };

    return { init };
  })();

  // ==========================================================================
  // 5. DOCTOR & SERVICE LIVE FILTER AND SEARCH
  // ==========================================================================
  const FilterSearchController = (() => {
    const init = () => {
      const filterNavs = document.querySelectorAll('[data-filter-nav]');
      const searchInputs = document.querySelectorAll('[data-search-target]');

      // Category Filter Tabs
      filterNavs.forEach((nav) => {
        const targetGridId = nav.getAttribute('data-filter-nav');
        const grid = document.getElementById(targetGridId);
        if (!grid) return;

        const buttons = nav.querySelectorAll('.filter-btn');
        buttons.forEach((btn) => {
          btn.addEventListener('click', () => {
            buttons.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.getAttribute('data-filter');
            const items = grid.querySelectorAll('[data-category]');

            items.forEach((item) => {
              const itemCats = item.getAttribute('data-category').split(' ');
              if (category === 'all' || itemCats.includes(category)) {
                item.style.display = '';
              } else {
                item.style.display = 'none';
              }
            });
          });
        });
      });

      // Real-time Text Search
      searchInputs.forEach((input) => {
        const targetGridId = input.getAttribute('data-search-target');
        const grid = document.getElementById(targetGridId);
        if (!grid) return;

        input.addEventListener('input', () => {
          const query = input.value.trim().toLowerCase();
          const items = grid.querySelectorAll('[data-search-text]');

          items.forEach((item) => {
            const text = item.getAttribute('data-search-text').toLowerCase();
            if (text.includes(query)) {
              item.style.display = '';
            } else {
              item.style.display = 'none';
            }
          });
        });
      });
    };

    return { init };
  })();

  // ==========================================================================
  // 6. QUICK BOOKING CONSULTATION FORM FEEDBACK
  // ==========================================================================
  const FormController = (() => {
    const init = () => {
      const bookingForms = document.querySelectorAll('[data-booking-form]');
      bookingForms.forEach((form) => {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const submitBtn = form.querySelector('button[type="submit"]');
          if (submitBtn) {
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
              <span class="icon-text">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                <span>Reserving Consultation...</span>
              </span>
            `;

            setTimeout(() => {
              submitBtn.innerHTML = `
                <span class="icon-text" style="color: #FFFFFF;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Request Received! We will call you.</span>
                </span>
              `;
              submitBtn.style.backgroundColor = 'var(--color-primary-dark)';
              form.reset();

              setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                submitBtn.style.backgroundColor = '';
              }, 4000);
            }, 800);
          }
        });
      });
    };

    return { init };
  })();

  // ==========================================================================
  // 7. PASSWORD VISIBILITY TOGGLE CONTROLLER
  // ==========================================================================
  const PasswordToggleController = (() => {
    const init = () => {
      const toggleButtons = document.querySelectorAll('.password-toggle-btn, [data-password-toggle]');
      toggleButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const wrap = btn.closest('.password-input-wrap') || btn.parentElement;
          const input = wrap ? wrap.querySelector('input') : null;
          if (!input) return;

          const isPassword = input.getAttribute('type') === 'password';
          input.setAttribute('type', isPassword ? 'text' : 'password');

          // Toggle icon
          if (isPassword) {
            btn.innerHTML = `
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            `;
            btn.setAttribute('aria-label', 'Hide password');
          } else {
            btn.innerHTML = `
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            `;
            btn.setAttribute('aria-label', 'Show password');
          }
        });
      });
    };

    return { init };
  })();

  // ==========================================================================
  // 8. LIVE COUNTDOWN TIMER CONTROLLER (COMING SOON)
  // ==========================================================================
  const CountdownController = (() => {
    const init = () => {
      const countdownBox = document.querySelector('[data-countdown]');
      if (!countdownBox) return;

      const daysEl = document.getElementById('countdown-days');
      const hoursEl = document.getElementById('countdown-hours');
      const minsEl = document.getElementById('countdown-minutes');
      const secsEl = document.getElementById('countdown-seconds');

      if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

      // Target: 45 days from first load or stored in attribute
      const attrDate = countdownBox.getAttribute('data-target-date');
      let targetDate = attrDate ? new Date(attrDate).getTime() : new Date().getTime() + (45 * 24 * 60 * 60 * 1000);

      const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
          daysEl.textContent = '00';
          hoursEl.textContent = '00';
          minsEl.textContent = '00';
          secsEl.textContent = '00';
          return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        daysEl.textContent = days < 10 ? '0' + days : days;
        hoursEl.textContent = hours < 10 ? '0' + hours : hours;
        minsEl.textContent = minutes < 10 ? '0' + minutes : minutes;
        secsEl.textContent = seconds < 10 ? '0' + seconds : seconds;
      };

      updateCountdown();
      setInterval(updateCountdown, 1000);
    };

    return { init };
  })();

  // ==========================================================================
  // 9. CONTACT & NEWSLETTER FORM CONTROLLER
  // ==========================================================================
  const ContactFormController = (() => {
    const init = () => {
      const contactForms = document.querySelectorAll('[data-contact-form], [data-newsletter-form]');
      contactForms.forEach((form) => {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const submitBtn = form.querySelector('button[type="submit"]');
          if (!submitBtn) return;

          const originalText = submitBtn.innerHTML;
          submitBtn.disabled = true;
          submitBtn.innerHTML = `
            <span class="icon-text">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
              <span>Sending Message...</span>
            </span>
          `;

          setTimeout(() => {
            submitBtn.innerHTML = `
              <span class="icon-text" style="color: #FFFFFF;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Message Sent Successfully!</span>
              </span>
            `;
            submitBtn.style.backgroundColor = 'var(--color-primary-dark)';
            form.reset();

            setTimeout(() => {
              submitBtn.disabled = false;
              submitBtn.innerHTML = originalText;
              submitBtn.style.backgroundColor = '';
            }, 4000);
          }, 900);
        });
      });
    };

    return { init };
  })();

  // ==========================================================================
  // 10. AUTHENTICATION TABS & COPY LINK CONTROLLERS
  // ==========================================================================
  const AuthTabController = (() => {
    const init = () => {
      const tabBtns = document.querySelectorAll('.auth-tab-btn');
      tabBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const targetRole = btn.getAttribute('data-auth-tab');
          tabBtns.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');

          const roleInputs = document.querySelectorAll('[data-auth-role-target]');
          roleInputs.forEach((el) => {
            if (el.getAttribute('data-auth-role-target') === targetRole) {
              el.style.display = '';
            } else {
              el.style.display = 'none';
            }
          });
        });
      });

      // Copy link buttons
      const copyBtns = document.querySelectorAll('.copy-link-btn');
      copyBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          navigator.clipboard.writeText(window.location.href).then(() => {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = `<span class="icon-text"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Copied!</span></span>`;
            setTimeout(() => {
              btn.innerHTML = originalHTML;
            }, 2000);
          }).catch(() => {
            alert('URL copied to clipboard!');
          });
        });
      });
    };

    return { init };
  })();

  // Initialize all controllers
    // ==========================================================================
  // NAVIGATION DROPDOWN CONTROLLER
  // ==========================================================================
  const DropdownController = (() => {
    const dropdowns = document.querySelectorAll('.nav-item.dropdown');
    if (!dropdowns.length) return { init: () => {} };

    const init = () => {
      dropdowns.forEach((dd) => {
        const toggle = dd.querySelector('.dropdown-toggle');
        if (!toggle) return;

        toggle.addEventListener('click', (e) => {
          const isOpen = dd.classList.contains('open');
          dropdowns.forEach((other) => other.classList.remove('open'));
          if (!isOpen) {
            e.preventDefault();
            dd.classList.add('open');
            toggle.setAttribute('aria-expanded', 'true');
          } else {
            toggle.setAttribute('aria-expanded', 'false');
          }
        });
      });

      document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-item.dropdown')) {
          dropdowns.forEach((dd) => {
            dd.classList.remove('open');
            const toggle = dd.querySelector('.dropdown-toggle');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
          });
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          dropdowns.forEach((dd) => {
            dd.classList.remove('open');
            const toggle = dd.querySelector('.dropdown-toggle');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
          });
        }
      });
    };

    return { init };
  })();

  DropdownController.init();
  ThemeController.init();
  RTLController.init();
  MobileDrawerController.init();
  AccordionController.init();
  FilterSearchController.init();
  FormController.init();
  PasswordToggleController.init();
  CountdownController.init();
  ContactFormController.init();
  AuthTabController.init();
});
