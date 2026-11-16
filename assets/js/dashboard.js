/**
 * ==========================================================================
 * BRIGHTSMILE DENTAL CARE — COMPLETE DASHBOARD CONTROLLER
 * Handles:
 * 1. Collapsible Sidebar (Desktop toggle + Mobile drawer)
 * 2. Topbar Dropdowns (Notifications & Profile menu)
 * 3. Theme & RTL Sync with Main Site
 * 4. Data Table Live Search & Filter
 * 5. Interactive Modals (Reschedule, Cancel, Rx View, Receipt Preview, Add Item)
 * 6. Tooth Charting Inspection
 * 7. Prescription & Invoice Printable View Triggers
 * ==========================================================================
 */

const DentalDashboard = (() => {
  'use strict';

  // 1. Sidebar Controller
  const initSidebar = () => {
    const toggleBtns = document.querySelectorAll('[data-action="toggle-sidebar"]');
    const sidebar = document.querySelector('.dashboard-sidebar');
    const overlay = document.querySelector('.dashboard-overlay');

    toggleBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.innerWidth >= 1024) {
          sidebar?.classList.toggle('collapsed');
          localStorage.setItem('brightsmile_dashboard_collapsed', sidebar?.classList.contains('collapsed'));
        } else {
          sidebar?.classList.toggle('mobile-open');
          overlay?.classList.toggle('active');
        }
      });
    });

    overlay?.addEventListener('click', () => {
      sidebar?.classList.remove('mobile-open');
      overlay?.classList.remove('active');
    });

    // Restore desktop collapsed state
    if (window.innerWidth >= 1024 && localStorage.getItem('brightsmile_dashboard_collapsed') === 'true') {
      sidebar?.classList.add('collapsed');
    }
  };

  // 2. Topbar Dropdowns Controller
  const initDropdowns = () => {
    const dropdownTriggers = document.querySelectorAll('[data-dropdown-trigger]');
    
    dropdownTriggers.forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetId = trigger.getAttribute('data-dropdown-trigger');
        const targetMenu = document.getElementById(targetId);

        // Close other open menus
        document.querySelectorAll('.dropdown-menu-custom').forEach((menu) => {
          if (menu !== targetMenu) menu.classList.remove('show');
        });

        targetMenu?.classList.toggle('show');
      });
    });

    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-menu-custom').forEach((menu) => {
        menu.classList.remove('show');
      });
    });
  };

  // 3. Theme & RTL Controller Sync
  const initThemeAndRTL = () => {
    const themeToggles = document.querySelectorAll('[data-action="toggle-theme"]');
    const rtlToggles = document.querySelectorAll('[data-action="toggle-rtl"]');

    themeToggles.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const isDark = document.documentElement.classList.toggle('dark-mode');
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        localStorage.setItem('brightsmile_dental_theme', isDark ? 'dark' : 'light');
      });
    });

    rtlToggles.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const isRtl = document.documentElement.classList.toggle('rtl-mode');
        document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
        localStorage.setItem('brightsmile_dental_rtl', isRtl ? 'rtl' : 'ltr');
      });
    });
  };

  // 4. Data Table Search & Status Filtering
  const initTableFilter = () => {
    const searchInputs = document.querySelectorAll('[data-table-search]');
    
    searchInputs.forEach((input) => {
      const tableId = input.getAttribute('data-table-search');
      const table = document.getElementById(tableId);
      if (!table) return;

      input.addEventListener('input', () => {
        const query = input.value.trim().toLowerCase();
        const rows = table.querySelectorAll('tbody tr');

        rows.forEach((row) => {
          const text = row.textContent.toLowerCase();
          row.style.display = text.includes(query) ? '' : 'none';
        });
      });
    });

    const filterSelects = document.querySelectorAll('[data-table-filter]');
    filterSelects.forEach((select) => {
      const tableId = select.getAttribute('data-table-filter');
      const table = document.getElementById(tableId);
      if (!table) return;

      select.addEventListener('change', () => {
        const selectedValue = select.value.toLowerCase();
        const rows = table.querySelectorAll('tbody tr');

        rows.forEach((row) => {
          const statusEl = row.querySelector('[data-status]');
          if (!statusEl || selectedValue === 'all') {
            row.style.display = '';
          } else {
            const status = statusEl.getAttribute('data-status').toLowerCase();
            row.style.display = status === selectedValue ? '' : 'none';
          }
        });
      });
    });
  };

  // 5. Modals Management (Open, Close, Print)
  const initModals = () => {
    const openBtns = document.querySelectorAll('[data-modal-open]');
    const closeBtns = document.querySelectorAll('[data-modal-close]');

    openBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = btn.getAttribute('data-modal-open');
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.classList.add('open');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    closeBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const modal = btn.closest('.modal-overlay-custom');
        if (modal) {
          modal.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
    });

    document.querySelectorAll('.modal-overlay-custom').forEach((modal) => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
    });

    // Print Buttons
    const printBtns = document.querySelectorAll('[data-action="print-document"]');
    printBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.print();
      });
    });
  };

  // 6. Tooth Charting Interactivity
  const initToothChart = () => {
    const teeth = document.querySelectorAll('.tooth-box');
    const detailsContainer = document.getElementById('tooth-selected-info');

    teeth.forEach((tooth) => {
      tooth.addEventListener('click', () => {
        teeth.forEach((t) => t.classList.remove('active'));
        tooth.classList.add('active');

        const toothNum = tooth.getAttribute('data-tooth-num');
        const toothName = tooth.getAttribute('data-tooth-name');
        const toothCondition = tooth.getAttribute('data-tooth-condition') || 'Healthy / Intact';
        const lastProcedure = tooth.getAttribute('data-last-procedure') || 'Routine Prophylaxis (Aug 2026)';

        if (detailsContainer) {
          detailsContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-weight: 700; color: var(--color-primary); font-size: 1.1rem;">Tooth #${toothNum}: ${toothName}</span>
              <span class="badge-status badge-confirmed">${toothCondition}</span>
            </div>
            <p style="font-size: 0.9rem; color: var(--color-text-muted); margin-bottom: 4px;">
              <strong>Recent Procedure:</strong> ${lastProcedure}
            </p>
            <p style="font-size: 0.9rem; color: var(--color-text-muted); margin-bottom: 0;">
              <strong>Periodontal Probing Depth:</strong> 2mm (Normal / Healthy gingival sulcus)
            </p>
          `;
        }
      });
    });
  };

  const init = () => {
    initSidebar();
    initDropdowns();
    initThemeAndRTL();
    initTableFilter();
    initModals();
    initToothChart();
  };

  return { init };
})();

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', DentalDashboard.init);
}
