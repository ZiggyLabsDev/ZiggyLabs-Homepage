const slides = Array.from(document.querySelectorAll('.hero-slide'));
let currentSlide = 0;

function showSlide(index) {
    slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === index);
    });
}

if (slides.length > 0) {
    setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }, 6000);

    showSlide(currentSlide);
}

function updateFooterYear() {
    const footerYear = document.getElementById('footer-year');
    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    const menuToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-links a[href]');

    const closeNavMenu = () => {
        if (navMenu) {
            navMenu.classList.remove('active');
        }
        if (menuToggle) {
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
        document.body.classList.remove('nav-open');
    };

    const closeDropdowns = () => {
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('open');
            const title = dropdown.querySelector('.nav-dropdown-title');
            if (title) {
                title.setAttribute('aria-expanded', 'false');
            }
        });
    };

    if (menuToggle && navMenu) {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.addEventListener('click', event => {
            event.stopPropagation();
            const isOpen = navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active', isOpen);
            menuToggle.setAttribute('aria-expanded', String(isOpen));
            document.body.classList.toggle('nav-open', isOpen);
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeNavMenu();
            }
        });
    });

    dropdowns.forEach(dropdown => {
        const title = dropdown.querySelector('.nav-dropdown-title');
        const content = dropdown.querySelector('.nav-dropdown-content');

        if (!title || !content) return;

        title.setAttribute('tabindex', '0');
        title.setAttribute('role', 'button');
        title.setAttribute('aria-haspopup', 'true');
        title.setAttribute('aria-expanded', 'false');

        const toggleDropdown = event => {
            event.preventDefault();
            const isOpen = !dropdown.classList.contains('open');
            closeDropdowns();
            if (isOpen) {
                dropdown.classList.add('open');
                title.setAttribute('aria-expanded', 'true');
                requestAnimationFrame(() => {
                    content.style.minWidth = `${Math.ceil(title.getBoundingClientRect().width)}px`;
                    positionDropdown(content, dropdown);
                });
            }
        };

        const positionDropdown = (content, dropdown) => {
            content.style.left = '0';
            content.style.right = 'auto';
            const rect = content.getBoundingClientRect();
            const padding = 8;
            if (rect.right > window.innerWidth - padding) {
                content.style.left = 'auto';
                content.style.right = '0';
            }
            if (rect.left < padding) {
                content.style.left = '0';
                content.style.right = 'auto';
            }
        };

        title.addEventListener('click', toggleDropdown);
        title.addEventListener('keydown', event => {
            const key = event.key || event.code;
            if (key === 'Enter' || key === ' ' || key === 'Spacebar' || key === 'Space') {
                toggleDropdown(event);
            }
        });
    });

    document.addEventListener('click', event => {
        if (!event.target.closest('.topbar')) {
            closeDropdowns();
            closeNavMenu();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            document.body.classList.remove('nav-open');
        }
    });

    updateFooterYear();
});