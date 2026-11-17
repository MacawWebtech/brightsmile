/**
 * ==========================================================================
 * STACKLY DENTAL CLINIC — 7-STEP INTERACTIVE BOOKING ENGINE
 * 
 * Flow Architecture:
 * Step 1: Select Dental Service
 * Step 2: Select Preferred Specialist / Dentist
 * Step 3: Choose Appointment Date (Interactive Calendar / Picker)
 * Step 4: Select Available Time Slot
 * Step 5: Patient Details & Form Validation (Email, Phone)
 * Step 6: Review Summary & Pricing Breakdown
 * Step 7: Confirmation & Redirect to appointment-confirmation.html
 * 
 * BACKEND INTEGRATION PLACEHOLDERS:
 * - Real-time Slot Availability: `fetch('/api/v1/availability?doctor=...&date=...')`
 * - Booking Submission: `fetch('/api/v1/appointments', { method: 'POST', body: ... })`
 * - SMS / Email Notifications: Webhook / SendGrid trigger
 * ==========================================================================
 */

const DentalBookingEngine = (() => {
  'use strict';

  // Booking State Machine
  const state = {
    step: 1,
    service: {
      id: '',
      name: '',
      price: '',
      duration: ''
    },
    doctor: {
      id: '',
      name: '',
      specialty: '',
      avatar: ''
    },
    date: '',
    time: '',
    patient: {
      fullName: '',
      email: '',
      phone: '',
      dob: '',
      isNewPatient: true,
      notes: ''
    },
    referenceCode: ''
  };

  // Pre-configured clinic services database
  const SERVICES_DATA = {
    'checkup': { name: 'General Dental Check-up & Prophylaxis', price: '$49', duration: '45 mins' },
    'cleaning': { name: 'Ultrasonic Teeth Cleaning & Polishing', price: '$95', duration: '45 mins' },
    'whitening': { name: 'Laser Teeth Whitening Acceleration', price: '$189', duration: '45 mins' },
    'implants': { name: 'Dental Implants 3D Guided Consultation', price: '$899', duration: '60 mins' },
    'orthodontics': { name: 'Clear Aligners & Orthodontic Assessment', price: '$1,250', duration: '45 mins' },
    'rootcanal': { name: 'Painless Microscope Root Canal Therapy', price: '$390', duration: '60 mins' },
    'extraction': { name: 'Atraumatic Wisdom Tooth Extraction', price: '$120', duration: '45 mins' },
    'periodontics': { name: 'Laser Periodontal Gum Therapy', price: '$180', duration: '50 mins' },
    'pediatric': { name: 'Pediatric Dental Gentle Examination', price: '$65', duration: '30 mins' },
    'crowns': { name: 'Same-Day CEREC Zirconia Ceramic Crown', price: '$580', duration: '60 mins' }
  };

  // Pre-configured specialists database
  const DOCTORS_DATA = {
    'any': { name: 'First Available Specialist', specialty: 'General & Diagnostic Clinic', avatar: 'DR' },
    'mitchell': { name: 'Dr. Sarah Mitchell, DDS', specialty: 'Cosmetic Dentistry & Smile Design', avatar: 'SM' },
    'vance': { name: 'Dr. Marcus Vance, DDS, FICOI', specialty: 'Implantology & Oral Surgery', avatar: 'MV' },
    'rostova': { name: 'Dr. Elena Rostova, DMD', specialty: 'Orthodontics & Clear Aligners', avatar: 'ER' },
    'chen': { name: 'Dr. David Chen, DDS', specialty: 'Pediatric Dentistry', avatar: 'DC' },
    'patel': { name: 'Dr. Priya Patel, BDS, MDS', specialty: 'Periodontics & Gum Disease', avatar: 'PP' },
    'wilson': { name: 'Dr. James Wilson, DDS', specialty: 'Endodontics & Root Canal Care', avatar: 'JW' },
    'thorne': { name: 'Dr. Amanda Thorne, DMD', specialty: 'General & Preventive Dentistry', avatar: 'AT' }
  };

  // Generate unique booking confirmation code (e.g., STK-DNT-84920)
  const generateReferenceCode = () => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `STK-DNT-${randomNum}`;
  };

  const init = () => {
    const wizardContainer = document.getElementById('booking-wizard');
    if (!wizardContainer) return;

    bindServiceSelection();
    bindDoctorSelection();
    bindDateSelection();
    bindTimeSlotSelection();
    bindFormInputs();
    bindNavigationButtons();
    checkURLParameters();

    // Default to step 1
    goToStep(1);
  };

  // Check URL query parameters (e.g. ?doctor=vance or ?service=implants)
  const checkURLParameters = () => {
    const params = new URLSearchParams(window.location.search);
    const serviceParam = params.get('service');
    const doctorParam = params.get('doctor');

    if (serviceParam && SERVICES_DATA[serviceParam]) {
      selectService(serviceParam);
    }
    if (doctorParam && DOCTORS_DATA[doctorParam]) {
      selectDoctor(doctorParam);
    }
  };

  // STEP 1: SERVICE SELECTION
  const bindServiceSelection = () => {
    const cards = document.querySelectorAll('[data-select-service]');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-select-service');
        selectService(id);
      });
    });
  };

  const selectService = (id) => {
    const data = SERVICES_DATA[id];
    if (!data) return;

    state.service.id = id;
    state.service.name = data.name;
    state.service.price = data.price;
    state.service.duration = data.duration;

    document.querySelectorAll('[data-select-service]').forEach((c) => {
      c.classList.toggle('selected', c.getAttribute('data-select-service') === id);
    });

    // Auto-enable next button
    const nextBtn = document.querySelector('[data-wizard-next="1"]');
    if (nextBtn) nextBtn.disabled = false;
  };

  // STEP 2: DOCTOR SELECTION
  const bindDoctorSelection = () => {
    const cards = document.querySelectorAll('[data-select-doctor]');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-select-doctor');
        selectDoctor(id);
      });
    });
  };

  const selectDoctor = (id) => {
    const data = DOCTORS_DATA[id];
    if (!data) return;

    state.doctor.id = id;
    state.doctor.name = data.name;
    state.doctor.specialty = data.specialty;
    state.doctor.avatar = data.avatar;

    document.querySelectorAll('[data-select-doctor]').forEach((c) => {
      c.classList.toggle('selected', c.getAttribute('data-select-doctor') === id);
    });

    const nextBtn = document.querySelector('[data-wizard-next="2"]');
    if (nextBtn) nextBtn.disabled = false;
  };

  // STEP 3: DATE PICKER & CALENDAR
  const bindDateSelection = () => {
    const dateInput = document.getElementById('booking-date-picker');
    if (dateInput) {
      // Set minimum date to tomorrow
      const today = new Date();
      today.setDate(today.getDate() + 1);
      const minDate = today.toISOString().split('T')[0];
      dateInput.min = minDate;
      dateInput.value = minDate;
      state.date = minDate;

      dateInput.addEventListener('change', (e) => {
        state.date = e.target.value;
        const nextBtn = document.querySelector('[data-wizard-next="3"]');
        if (nextBtn) nextBtn.disabled = !state.date;
      });
    }

    // Quick Day Preset Pills
    const presetPills = document.querySelectorAll('[data-date-preset]');
    presetPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        presetPills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        const offset = parseInt(pill.getAttribute('data-date-preset'), 10);
        const target = new Date();
        target.setDate(target.getDate() + offset);
        const dateStr = target.toISOString().split('T')[0];
        if (dateInput) dateInput.value = dateStr;
        state.date = dateStr;

        const nextBtn = document.querySelector('[data-wizard-next="3"]');
        if (nextBtn) nextBtn.disabled = false;
      });
    });
  };

  // STEP 4: TIME SLOT SELECTION
  const bindTimeSlotSelection = () => {
    const slots = document.querySelectorAll('.slot-pill');
    slots.forEach((slot) => {
      slot.addEventListener('click', () => {
        slots.forEach((s) => s.classList.remove('selected'));
        slot.classList.add('selected');
        state.time = slot.textContent.trim();

        const nextBtn = document.querySelector('[data-wizard-next="4"]');
        if (nextBtn) nextBtn.disabled = false;
      });
    });
  };

  // STEP 5: PATIENT DETAILS & VALIDATION
  const bindFormInputs = () => {
    const form = document.getElementById('booking-patient-form');
    if (!form) return;

    form.addEventListener('input', () => {
      validatePatientStep();
    });
  };

  const validatePatientStep = () => {
    const nameInput = document.getElementById('patient-name');
    const emailInput = document.getElementById('patient-email');
    const phoneInput = document.getElementById('patient-phone');
    const nextBtn = document.querySelector('[data-wizard-next="5"]');

    if (!nameInput || !emailInput || !phoneInput || !nextBtn) return false;

    const nameVal = nameInput.value.trim();
    const emailVal = emailInput.value.trim();
    const phoneVal = phoneInput.value.trim();

    // Regex validations
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
    const phoneValid = phoneVal.replace(/[^0-9]/g, '').length >= 10;
    const nameValid = nameVal.length >= 2;

    const isValid = nameValid && emailValid && phoneValid;
    nextBtn.disabled = !isValid;

    if (isValid) {
      state.patient.fullName = nameVal;
      state.patient.email = emailVal;
      state.patient.phone = phoneVal;
      const notesInput = document.getElementById('patient-notes');
      if (notesInput) state.patient.notes = notesInput.value.trim();
      const isNewInput = document.getElementById('patient-is-new');
      if (isNewInput) state.patient.isNewPatient = isNewInput.checked;
    }

    return isValid;
  };

  // STEP 6: RENDER REVIEW SUMMARY
  const renderSummary = () => {
    const summaryCard = document.getElementById('booking-summary-details');
    if (!summaryCard) return;

    summaryCard.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--space-3);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 12px; border-bottom: 1px solid var(--color-border-subtle);">
          <div>
            <span class="text-muted" style="font-size: 0.82rem; text-transform: uppercase;">Selected Treatment</span>
            <h4 style="margin: 2px 0 0 0;">${state.service.name || 'General Dental Examination'}</h4>
            <span style="font-size: 0.88rem; color: var(--color-text-muted);">Approx Duration: ${state.service.duration || '45 mins'}</span>
          </div>
          <span style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 700; color: var(--color-primary);">${state.service.price || '$49'}</span>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid var(--color-border-subtle);">
          <div>
            <span class="text-muted" style="font-size: 0.82rem; text-transform: uppercase;">Assigned Dentist</span>
            <h5 style="margin: 2px 0 0 0;">${state.doctor.name || 'First Available Specialist'}</h5>
            <span style="font-size: 0.85rem; color: var(--color-text-muted);">${state.doctor.specialty || 'General Dentistry'}</span>
          </div>
          <span class="badge-outline">Confirmed Specialist</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--color-border-subtle);">
          <div>
            <span class="text-muted" style="font-size: 0.82rem; text-transform: uppercase;">Appointment Date</span>
            <div style="font-weight: 600; margin-top: 2px;">${formatReadableDate(state.date)}</div>
          </div>
          <div>
            <span class="text-muted" style="font-size: 0.82rem; text-transform: uppercase;">Reserved Time Slot</span>
            <div style="font-weight: 600; margin-top: 2px; color: var(--color-primary);">${state.time || '10:00 AM'}</div>
          </div>
        </div>

        <div>
          <span class="text-muted" style="font-size: 0.82rem; text-transform: uppercase;">Patient Information</span>
          <div style="font-weight: 600; margin-top: 2px;">${state.patient.fullName}</div>
          <div style="font-size: 0.88rem; color: var(--color-text-muted);">${state.patient.email} • ${state.patient.phone}</div>
          ${state.patient.notes ? `<div style="font-size: 0.85rem; font-style: italic; margin-top: 6px; color: var(--color-text-muted);">Note: "${state.patient.notes}"</div>` : ''}
        </div>
      </div>
    `;
  };

  const formatReadableDate = (dateStr) => {
    if (!dateStr) return 'Selected Date';
    try {
      const parts = dateStr.split('-');
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  // STEP 7: CONFIRMATION & BACKEND INTEGRATION PLACEHOLDER
  const confirmBooking = () => {
    state.referenceCode = generateReferenceCode();

    // --------------------------------------------------------------------------
    // BACKEND INTEGRATION PLACEHOLDER:
    // In production, execute your API dispatch here:
    //
    // fetch('/api/v1/appointments/book', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(state)
    // })
    // .then(res => res.json())
    // .then(data => { ... })
    // --------------------------------------------------------------------------

    // Store state in sessionStorage so confirmation page can render it immediately
    try {
      sessionStorage.setItem('stackly_dental_booking_data', JSON.stringify(state));
      localStorage.setItem('stackly_dental_latest_booking', JSON.stringify({
        code: state.referenceCode,
        date: state.date,
        time: state.time,
        service: state.service.name,
        doctor: state.doctor.name,
        patientName: state.patient.fullName
      }));
    } catch (e) {
      console.warn('Storage exception:', e);
    }

    const confirmBtn = document.getElementById('confirm-booking-btn');
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = `
        <span class="icon-text">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line></svg>
          <span>Confirming with Clinic System...</span>
        </span>
      `;
    }

    setTimeout(() => {
      window.location.href = `appointment-confirmation.html?ref=${state.referenceCode}`;
    }, 900);
  };

  // WIZARD STEP NAVIGATION
  const goToStep = (stepNumber) => {
    if (stepNumber < 1 || stepNumber > 6) return;

    if (stepNumber === 6) {
      renderSummary();
    }

    state.step = stepNumber;

    // Update Step Pills in Navbar
    const stepItems = document.querySelectorAll('.wizard-step-item');
    stepItems.forEach((item) => {
      const stepIdx = parseInt(item.getAttribute('data-step-index'), 10);
      item.classList.remove('active', 'completed');
      if (stepIdx === stepNumber) {
        item.classList.add('active');
      } else if (stepIdx < stepNumber) {
        item.classList.add('completed');
      }
    });

    // Update Panels
    const panels = document.querySelectorAll('.wizard-panel');
    panels.forEach((panel) => {
      const pIdx = parseInt(panel.getAttribute('data-panel-step'), 10);
      panel.classList.toggle('active', pIdx === stepNumber);
    });

    // Scroll smoothly to top of wizard
    const topAnchor = document.getElementById('booking-wizard');
    if (topAnchor && stepNumber > 1) {
      topAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const bindNavigationButtons = () => {
    // Next buttons
    document.querySelectorAll('[data-wizard-next]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const currentStep = parseInt(btn.getAttribute('data-wizard-next'), 10);
        if (currentStep === 5) {
          if (!validatePatientStep()) return;
        }
        goToStep(currentStep + 1);
      });
    });

    // Prev buttons
    document.querySelectorAll('[data-wizard-prev]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const currentStep = parseInt(btn.getAttribute('data-wizard-prev'), 10);
        goToStep(currentStep - 1);
      });
    });

    // Direct Step click
    document.querySelectorAll('.wizard-step-item').forEach((item) => {
      item.addEventListener('click', () => {
        const targetStep = parseInt(item.getAttribute('data-step-index'), 10);
        if (targetStep < state.step) {
          goToStep(targetStep);
        }
      });
    });

    // Final Confirm Button
    const confirmBtn = document.getElementById('confirm-booking-btn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', (e) => {
        e.preventDefault();
        confirmBooking();
      });
    }
  };

  return { init, state, goToStep, selectService, selectDoctor };
})();

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', DentalBookingEngine.init);
}
