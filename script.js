/**
 * Cadence OS - Landing Page Scripts
 * Handles waitlist form submission and visualization interactions
 */

// ============================================
// CONFIGURATION
// ============================================

// Replace this with your Google Apps Script Web App URL
// See SETUP.md for instructions on creating the Google Sheets integration
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwLG9aptCJuTIL_GeUC8uuNaD-qkQMwsBPDJRKzMUIabmuHFiyJChAiZum2Z28B9qYu/exec';

// Animation timing constants (in milliseconds)
const ANIMATION_TIMING = {
    MODAL_HIDE_DELAY: 300,
    SHAKE_DURATION: 500,
    INTRO_DURATION: 4500,
    INTRO_FADE_OUT: 700,
    CARDS_REVEAL_DELAY: 1200
};

// ============================================
// CTA Toggle (Hosted vs Self-Host)
// ============================================

function toggleCTA(option) {
    const hosted = document.getElementById('cta-hosted');
    const selfhost = document.getElementById('cta-selfhost');

    if (option === 'selfhost') {
        hosted.hidden = true;
        selfhost.hidden = false;
    } else {
        hosted.hidden = false;
        selfhost.hidden = true;
    }
}

// ============================================
// DOM Elements
// ============================================

const forms = document.querySelectorAll('.waitlist-form');
const modal = document.getElementById('success-modal');
const pageLoadTime = Date.now();

// ============================================
// Form Handling
// ============================================

forms.forEach(form => {
    form.addEventListener('submit', handleSubmit);
});

async function handleSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const email = form.querySelector('input[name="email"]').value;

    // Validate email
    if (!isValidEmail(email)) {
        shakeForm(form);
        return;
    }

    // Send to Google Sheets (no-cors mode returns immediately)
    if (GOOGLE_SCRIPT_URL) {
        submitToGoogleSheets(email);
    }

    showSuccessModal();
    form.reset();
}

async function submitToGoogleSheets(email) {
    const timeOnPage = Math.round((Date.now() - pageLoadTime) / 1000); // seconds
    const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Required for Google Apps Script
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            timestamp: new Date().toISOString(),
            source: window.location.href,
            timeOnPage: timeOnPage
        })
    });

    // Note: With no-cors mode, we can't read the response
    // The request will succeed silently
    return true;
}

// ============================================
// Validation
// ============================================

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ============================================
// UI Helpers
// ============================================

function shakeForm(form) {
    const formGroup = form.querySelector('.form-group');
    formGroup.style.animation = `shake ${ANIMATION_TIMING.SHAKE_DURATION}ms ease`;
    setTimeout(() => {
        formGroup.style.animation = '';
    }, ANIMATION_TIMING.SHAKE_DURATION);
}

function showSuccessModal() {
    modal.hidden = false;
    // Trigger reflow for animation
    modal.offsetHeight;
    modal.classList.add('show');
}

function closeModal() {
    modal.classList.remove('show');
    setTimeout(() => {
        modal.hidden = true;
    }, ANIMATION_TIMING.MODAL_HIDE_DELAY);
}

// Close modal on backdrop click
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) {
        closeModal();
    }
});

// ============================================
// Cadence Intro Animation
// ============================================

function initCadenceIntro() {
    const intro = document.getElementById('cadence-intro');
    const svg = document.querySelector('.cadence-svg');
    const cards = document.querySelector('.cadence-cards');
    const visualization = document.querySelector('.cadence-visualization');

    if (!intro || !svg || !visualization) return;

    // Pause animations initially until in view
    intro.style.animationPlayState = 'paused';
    intro.querySelectorAll('*').forEach(el => {
        el.style.animationPlayState = 'paused';
    });

    let hasStarted = false;
    let transitionTimeout = null;

    // Add skip button
    const skipBtn = document.createElement('button');
    skipBtn.className = 'skip-intro';
    skipBtn.textContent = 'Skip →';
    skipBtn.addEventListener('click', () => transitionToMain());
    intro.appendChild(skipBtn);

    // Observer to start animation when mostly visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasStarted) {
                hasStarted = true;
                startIntroAnimation();
                observer.disconnect();
            }
        });
    }, { threshold: 0.5 });

    observer.observe(visualization);

    function lockScroll() {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
    }

    function unlockScroll() {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
    }

    function startIntroAnimation() {
        // Lock scroll during intro
        lockScroll();

        // Unpause all animations
        intro.style.animationPlayState = 'running';
        intro.querySelectorAll('*').forEach(el => {
            el.style.animationPlayState = 'running';
        });

        // Auto-transition after intro completes
        transitionTimeout = setTimeout(transitionToMain, ANIMATION_TIMING.INTRO_DURATION);
    }

    function transitionToMain() {
        if (transitionTimeout) clearTimeout(transitionTimeout);

        // Unlock scroll
        unlockScroll();

        // Zoom into the week (intro scales up and fades)
        intro.classList.add('fade-out');

        // After zoom animation, hide intro and reveal main visualization
        setTimeout(() => {
            intro.classList.add('hidden');
            svg.classList.add('visible');
        }, ANIMATION_TIMING.INTRO_FADE_OUT);

        // Show cards after main SVG appears
        setTimeout(() => {
            if (cards) cards.classList.add('visible');
        }, ANIMATION_TIMING.CARDS_REVEAL_DELAY);
    }
}

// ============================================
// Cadence Visualization Interactivity
// ============================================

function initCadenceVisualization() {
    const cards = document.querySelectorAll('.cadence-card[data-layer]');
    const svg = document.querySelector('.cadence-svg');

    if (!cards.length || !svg) return;

    // Initialize intro animation first
    initCadenceIntro();

    // Add hover interactions
    cards.forEach(card => {
        const layer = card.dataset.layer;

        card.addEventListener('mouseenter', () => {
            // Remove active state from all cards
            cards.forEach(c => c.classList.remove('is-active'));
            // Add active state to this card
            card.classList.add('is-active');
            highlightLayer(svg, layer);
        });

        card.addEventListener('mouseleave', () => {
            card.classList.remove('is-active');
            resetLayers(svg);
        });
    });

    // Initialize intersection observer for scroll-triggered animations
    initScrollAnimations();
}

function highlightLayer(svg, layer) {
    // Dim all wave rows first
    const allWaves = svg.querySelectorAll('.wave-row');
    allWaves.forEach(wave => {
        wave.style.opacity = '0.25';
        wave.style.transition = 'opacity 0.3s ease';
    });

    // Highlight the selected wave row
    const targetWave = svg.querySelector(`.wave-${layer}`);
    if (targetWave) {
        targetWave.style.opacity = '1';
        // Add glow to the wave line
        const waveLine = targetWave.querySelector('.wave-line');
        if (waveLine) {
            waveLine.style.filter = 'url(#glow)';
            waveLine.style.strokeWidth = layer === 'weekly' ? '6' : layer === 'daily' ? '5' : '3';
        }
    }

    // Hide all layer annotations first
    const allAnnotations = svg.querySelectorAll('.layer-annotation');
    allAnnotations.forEach(annotation => {
        annotation.style.opacity = '0';
        annotation.style.transition = 'opacity 0.4s ease';
        annotation.style.pointerEvents = 'none';
    });

    // Show the annotation for this layer
    const targetAnnotation = svg.querySelector(`.annotation-${layer}`);
    if (targetAnnotation) {
        targetAnnotation.style.opacity = '1';
        targetAnnotation.style.pointerEvents = 'auto';
    }

    // Dim flow arrows
    const flowArrows = svg.querySelectorAll('.flow-arrow');
    flowArrows.forEach(arrow => {
        arrow.style.opacity = '0.2';
        arrow.style.transition = 'opacity 0.3s ease';
    });

    // Dim timeline bar except for relevant days
    const timelineBar = svg.querySelector('.timeline-bar');
    if (timelineBar) {
        timelineBar.style.opacity = layer === 'weekly' ? '1' : '0.4';
        timelineBar.style.transition = 'opacity 0.3s ease';
    }
}

function resetLayers(svg) {
    // Reset all wave rows
    const allWaves = svg.querySelectorAll('.wave-row');
    allWaves.forEach(wave => {
        wave.style.opacity = '';
        const waveLine = wave.querySelector('.wave-line');
        if (waveLine) {
            waveLine.style.filter = '';
            waveLine.style.strokeWidth = '';
        }
    });

    // Hide all layer annotations
    const allAnnotations = svg.querySelectorAll('.layer-annotation');
    allAnnotations.forEach(annotation => {
        annotation.style.opacity = '0';
        annotation.style.pointerEvents = 'none';
    });

    // Reset flow arrows
    const flowArrows = svg.querySelectorAll('.flow-arrow');
    flowArrows.forEach(arrow => {
        arrow.style.opacity = '';
    });

    // Reset timeline bar
    const timelineBar = svg.querySelector('.timeline-bar');
    if (timelineBar) {
        timelineBar.style.opacity = '';
    }
}

// Scroll-triggered animations
// Note: SVG visibility is now controlled by initCadenceIntro(), not here
function initScrollAnimations() {
    const visualization = document.querySelector('.cadence-visualization');
    if (!visualization) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                // SVG visible class is handled by intro animation
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });

    observer.observe(visualization);
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCadenceVisualization);
} else {
    initCadenceVisualization();
}

// ============================================
// Smooth scroll for any anchor links
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
