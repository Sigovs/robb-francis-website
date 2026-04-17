/**
 * Robb Francis — main.js
 * Handles: FAQ accordion, smooth scroll, footer year
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- Footer year -------------------------------------------------------
    const yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();


    // --- FAQ accordion -----------------------------------------------------
    const faqItems = document.querySelectorAll('[data-faq-item]');

    faqItems.forEach(item => {
        const trigger = item.querySelector('[data-faq-trigger]');
        const answer  = item.querySelector('[data-faq-answer]');

        if (!trigger || !answer) return;

        trigger.setAttribute('role', 'button');
        trigger.setAttribute('tabindex', '0');
        trigger.setAttribute('aria-expanded', 'false');

        const open = () => {
            const isOpen = item.classList.contains('is-open');

            // Close all
            faqItems.forEach(i => {
                i.classList.remove('is-open');
                i.querySelector('[data-faq-trigger]')?.setAttribute('aria-expanded', 'false');
            });

            // Toggle clicked item
            if (!isOpen) {
                item.classList.add('is-open');
                trigger.setAttribute('aria-expanded', 'true');
            }
        };

        trigger.addEventListener('click', open);
        trigger.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open();
            }
        });
    });


    // --- Smooth scroll for anchor links ------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });


    // --- Gallery rail (drag + arrow scroll) ---------------------------------
    document.querySelectorAll('[data-rail]').forEach(rail => {
        const track   = rail.querySelector('[data-rail-track]');
        const btnPrev = rail.querySelector('[data-rail-prev]');
        const btnNext = rail.querySelector('[data-rail-next]');
        if (!track) return;

        // Arrow scroll — one card width per click
        const scrollBy = dir => {
            const card  = track.querySelector('.gallery-rail__item');
            const step  = card ? card.offsetWidth + 10 : 320;
            track.scrollBy({ left: dir * step, behavior: 'smooth' });
        };

        if (btnPrev) btnPrev.addEventListener('click', () => scrollBy(-1));
        if (btnNext) btnNext.addEventListener('click', () => scrollBy(1));

        // Disable buttons at scroll bounds
        const syncBtns = () => {
            if (!btnPrev || !btnNext) return;
            btnPrev.disabled = track.scrollLeft <= 2;
            btnNext.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
        };
        track.addEventListener('scroll', syncBtns, { passive: true });
        syncBtns();

        // Pointer drag
        let startX = 0, startScroll = 0, dragging = false;

        track.addEventListener('pointerdown', e => {
            dragging   = true;
            startX     = e.clientX;
            startScroll = track.scrollLeft;
            track.classList.add('is-dragging');
            track.setPointerCapture(e.pointerId);
        });

        track.addEventListener('pointermove', e => {
            if (!dragging) return;
            track.scrollLeft = startScroll - (e.clientX - startX);
        });

        const endDrag = () => {
            dragging = false;
            track.classList.remove('is-dragging');
        };
        track.addEventListener('pointerup',     endDrag);
        track.addEventListener('pointercancel', endDrag);
    });


    // --- Process section entrance animations --------------------------------
    const processEls = document.querySelectorAll('.process__header, .process-step');

    if (processEls.length && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        processEls.forEach(el => observer.observe(el));
    } else {
        processEls.forEach(el => el.classList.add('is-visible'));
    }


    // --- Site-wide scroll reveal --------------------------------------------
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!reduced && 'IntersectionObserver' in window) {
        // Mark staggered children with --i index before observing
        document.querySelectorAll('.reveal-group').forEach(group => {
            group.querySelectorAll('.reveal-item').forEach((el, i) => {
                el.style.setProperty('--i', i);
            });
        });

        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
    } else {
        // Reduced motion or no IO support — show everything immediately
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
    }

});
