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

function initViewTransitionNavigation() {
	const nav = document.querySelector('.site-nav');
	if (!nav) return;

	// Progressive enhancement: only controls timing, never animates.
	const canUseViewTransitions =
		typeof document !== 'undefined' &&
		'startViewTransition' in document &&
		typeof document.startViewTransition === 'function';

	nav.addEventListener('click', (event) => {
		if (!(event instanceof MouseEvent)) return;
		if (event.defaultPrevented) return;

		// Ignore modifier clicks and non-left clicks (new tab/window behavior)
		if (event.button !== 0) return;
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

		const target = event.target;
		if (!(target instanceof Element)) return;

		// Target only internal navbar links
		const link = target.closest('a.site-nav__link');
		if (!(link instanceof HTMLAnchorElement)) return;
		if (link.target && link.target.toLowerCase() === '_blank') return;

		const href = link.getAttribute('href');
		if (!href) return;

		const url = new URL(href, window.location.href);
		const isExternal = url.origin !== window.location.origin;
		if (isExternal) return;

		// If it's just an in-page anchor, let the browser handle it.
		const sameDocument =
			url.pathname === window.location.pathname && url.search === window.location.search;
		if (sameDocument && url.hash) return;

		if (!canUseViewTransitions) return;

		event.preventDefault();
		// Cross-document view transition: navigate inside the callback.
		document.startViewTransition(() => {
			window.location.href = url.href;
		});
	});
}

document.addEventListener('DOMContentLoaded', () => {
	initNavbar();
	initViewTransitionNavigation();
});
