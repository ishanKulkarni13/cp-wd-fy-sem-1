/* Accessibility modal + high-contrast theme (no frameworks) */

(() => {
	'use strict';

	const STORAGE_KEY = 'theme';
	const THEME_DARK_CONTRAST = 'dark-contrast';
	const THEME_LIGHT = 'light';

	function safeGetStoredTheme() {
		try {
			return localStorage.getItem(STORAGE_KEY);
		} catch {
			return null;
		}
	}

	function safeSetStoredTheme(theme) {
		try {
			localStorage.setItem(STORAGE_KEY, theme);
		} catch {
			// ignore (privacy mode / blocked storage)
		}
	}

	function applyDarkContrastTheme(body) {
		body.classList.add(THEME_DARK_CONTRAST);
		body.classList.remove('light', 'dark');
		safeSetStoredTheme(THEME_DARK_CONTRAST);
	}

	function applyDefaultLightTheme(body, storedTheme) {
		body.classList.remove(THEME_DARK_CONTRAST, 'dark');
		body.classList.add(THEME_LIGHT);
		safeSetStoredTheme(THEME_LIGHT);
	}

	function syncThemeFromStorage(body) {
		const storedTheme = safeGetStoredTheme();
		if (storedTheme === THEME_DARK_CONTRAST) {
			applyDarkContrastTheme(body);
			return;
		}

		applyDefaultLightTheme(body, storedTheme);
	}

	function findCardByTitle(modal, titleText) {
		if (!modal) return null;

		const cards = Array.from(modal.querySelectorAll('.accessibility-card'));
		for (const card of cards) {
			const heading = card.querySelector('h1, h2, h3, h4, h5, h6');
			const label = (heading?.textContent || card.textContent || '').trim();
			if (label.toLowerCase().includes(titleText.toLowerCase())) return card;
		}

		return null;
	}

	function setModalOpen({ body, backdrop, modal, closeButton }, isOpen) {
		body.classList.toggle('a11y-open', isOpen);

		// Keep compatibility with existing CSS that uses data-open.
		if (backdrop) backdrop.dataset.open = isOpen ? 'true' : 'false';
		if (modal) modal.dataset.open = isOpen ? 'true' : 'false';

		if (isOpen) {
			closeButton?.focus?.();
		}
	}

	function initAccessibility() {
		const body = document.body;
		if (!body) return;

		// 1) Theme persistence
		syncThemeFromStorage(body);

		// 2) Modal behavior
		const toggle = document.querySelector('[data-a11y-toggle]');
		const backdrop = document.querySelector('.accessibility-backdrop');
		const modal = document.querySelector('.accessibility-modal');

		if (!modal || !backdrop) {
			// Theme still works without modal.
			return;
		}

		const closeButton = modal.querySelector('.accessibility-actions button[type="button"], .accessibility-actions button');

		const api = { body, backdrop, modal, closeButton };

		const openModal = () => setModalOpen(api, true);
		const closeModal = () => setModalOpen(api, false);

		if (toggle) {
			toggle.addEventListener('click', (event) => {
				event.preventDefault();
				openModal();
			});
		}

		backdrop.addEventListener('click', () => {
			closeModal();
		});

		closeButton?.addEventListener('click', () => {
			closeModal();
		});

		document.addEventListener('keydown', (event) => {
			if (event.key !== 'Escape') return;
			if (!body.classList.contains('a11y-open')) return;
			closeModal();
		});

		// 3) High contrast toggle
		const highContrastCard = findCardByTitle(modal, 'High Contrast');
		highContrastCard?.addEventListener('click', () => {
			applyDarkContrastTheme(body);
		});

		// 4) Invert option exists but does nothing yet.
		// Intentionally left unimplemented.
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initAccessibility);
	} else {
		initAccessibility();
	}
})();
