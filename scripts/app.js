/* Global app behaviors (no page-specific logic) */

function initNavbar() {
	const nav = document.querySelector('.site-nav');
	if (!nav) return;

	// 1) Scroll state: add/remove .nav--scrolled
	const syncScrolledState = () => {
		const shouldBeScrolled = window.scrollY > 0;
		nav.classList.toggle('nav--scrolled', shouldBeScrolled);
	};
	syncScrolledState();
	window.addEventListener('scroll', syncScrolledState, { passive: true });

	// 2) Active link detection: apply .is-active based on current pathname
	const currentPath = window.location.pathname;
	const currentFile = (currentPath.split('/').pop() || 'index.html').toLowerCase();

	const links = nav.querySelectorAll('a.site-nav__link[href]');
	links.forEach((link) => {
		const href = (link.getAttribute('href') || '').split('#')[0].split('?')[0];
		const hrefFile = (href.split('/').pop() || '').toLowerCase();
		const isActive = hrefFile !== '' && hrefFile === currentFile;
		link.classList.toggle('is-active', isActive);
	});

	// 3) Mobile menu toggle: toggles .nav--open and aria-expanded
	const toggleButton = nav.querySelector('button.site-nav__toggle');
	const menu = nav.querySelector('.site-nav__menu');

	const closeMenu = () => {
		nav.classList.remove('nav--open');
		if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
	};

	if (toggleButton) {
		toggleButton.addEventListener('click', () => {
			const isOpen = nav.classList.toggle('nav--open');
			toggleButton.setAttribute('aria-expanded', String(isOpen));
		});
	}

	// Close menu when a nav link is clicked
	if (menu) {
		menu.addEventListener('click', (event) => {
			const target = event.target;
			if (!(target instanceof Element)) return;
			if (target.closest('a.site-nav__link')) closeMenu();
		});
	}
}

document.addEventListener('DOMContentLoaded', () => {
	initNavbar();
});
