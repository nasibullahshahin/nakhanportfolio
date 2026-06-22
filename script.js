/**
 * Modern UI Experience Controller
 * Uses Linear Interpolation (Lerp) for smooth physics-based animations.
 */
class ModernUI {
    constructor() {
        this.config = {
            lerpFactor: 0.1, // Lower = smoother/slower, Higher = snappier
            particleCount: 40
        };
        
        this.init();
    }

    init() {
        this.setupMagneticButtons();
        this.setupScrollReveal();
        this.setupParticles();
        this.setupFormHandling();
        console.log('✨ Modern UI Initialized');
    }

    // ================= HELPER: LERP =================
    // Makes values go from A to B smoothly over time
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    // ================= 1. MAGNETIC BUTTONS =================
    setupMagneticButtons() {
        const buttons = document.querySelectorAll('.data-hover');
        
        buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                // Calculate distance from center
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                // Move button slightly towards mouse (Magnetic effect)
                btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) scale(1.1)`;
                btn.classList.add('is-hovering');
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0) scale(1)';
                btn.classList.remove('is-hovering');
            });
        });
    }

    // ================= 2. SCROLL REVEAL (INTERSECTION OBSERVER) =================
    setupScrollReveal() {
        const observerOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add staggered delay via inline style, but handle anim in CSS
                    const target = entry.target;
                    const delay = target.dataset.delay || 0;
                    target.style.transitionDelay = `${delay}ms`;
                    target.classList.add('is-visible');
                    observer.unobserve(target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal').forEach((el, index) => {
            // Auto-assign staggered delays if not present
            if(!el.dataset.delay) el.dataset.delay = index * 100;
            observer.observe(el);
        });
    }

    // ================= 3. PERFORMANCE OPTIMIZED PARTICLES =================
    setupParticles() {
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < this.config.particleCount; i++) {
            const p = document.createElement('div');
            p.className = 'floating-particle';
            
            const size = Math.random() * 4 + 1;
            p.style.width = `${size}px`;
            p.style.height = `${size}px`;
            p.style.background = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
            p.style.left = `${Math.random() * 100}vw`;
            p.style.top = `${Math.random() * 100}vh`;
            
            // Random floating duration between 10s and 20s
            const duration = 10 + Math.random() * 10;
            p.style.animation = `float ${duration}s ease-in-out infinite alternate`;
            
            // Add custom float keyframe programmatically if needed, 
            // but assuming standard float CSS exists. 
            // We give them random offsets to prevent "robot dance" sync.
            p.style.animationDelay = `-${Math.random() * 20}s`;
            
            fragment.appendChild(p);
        }
        
        document.body.appendChild(fragment);
    }


// ================= 5. FORM HANDLING (CORRECTED) =================
    setupFormHandling() {
        const contactForm = document.getElementById('contact-form');
        const submitBtn = document.getElementById('submit-btn');

        // Safety check: Exit if form doesn't exist to prevent errors
        if (!contactForm) return;

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 1. Check if EmailJS is loaded
            if (typeof emailjs === 'undefined') {
                console.error('CRITICAL ERROR: EmailJS script is missing in HTML.');
                this.showToast('❌ System Error: Email Service not loaded.');
                return;
            }

            // 2. UI State: Loading
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerText = "Sending...";
            submitBtn.disabled = true;

            // 3. Get values safely (Use optional chaining ?.value)
            // Ensure your HTML inputs have these EXACT IDs
            const templateParams = {
                name: document.getElementById('name')?.value || 'Anonymous',
                email: document.getElementById('email')?.value || 'No Email',
                message: document.getElementById('message')?.value || 'No Message'
            };

            try {
                // 4. Send via EmailJS
                // Verify these IDs in your EmailJS Dashboard!
                await emailjs.send(
                    'service_bejwb0a347',     // Service ID
                    'template_rl8h3ys',       // Template ID
                    templateParams,           
                    'Rejr-r5kNvFCmMxke'       // Public Key 
                );

                // 5. Success Actions
                this.showToast('✨ Message sent! I will be in touch soon.');
                contactForm.reset();

            } catch (error) {
                // 6. Detailed Error Logging
                console.error('FAILED...', error);
                
                // Show specific error to you (developer) in console, generic to user
                if(error.status === 412) {
                     console.error("Precondition Failed: Check your Public Key.");
                } else if (error.status === 400) {
                     console.error("Bad Request: Check your Service ID or Template ID.");
                }

                this.showToast('❌ Failed to send. Please try again later.');
                
            } finally {
                // 7. Restore UI State
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }


    showToast(message) {
        // Check if toast exists, reuse it
        let toast = document.querySelector('.neon-toast');
        
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'neon-toast';
            document.body.appendChild(toast);
        }

        // Add icon and text
        toast.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--primary)"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <span>${message}</span>
        `;

        // Trigger animation
        requestAnimationFrame(() => toast.classList.add('active'));

        // Auto hide
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
            toast.classList.remove('active');
        }, 4000);
    }
}

// Initialize the magic when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ModernUI();
});