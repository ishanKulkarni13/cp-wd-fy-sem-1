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

	function setTheme(body, theme, { persist }) {
		if (theme === THEME_DARK_CONTRAST) {
			body.classList.add(THEME_DARK_CONTRAST);
			body.classList.remove(THEME_LIGHT, 'dark');
			if (persist) safeSetStoredTheme(THEME_DARK_CONTRAST);
			return;
		}

		// Default / fallback theme is always light for this project.
		body.classList.remove(THEME_DARK_CONTRAST, 'dark');
		body.classList.add(THEME_LIGHT);
		if (persist) safeSetStoredTheme(THEME_LIGHT);
	}

	function initThemeFromStorage(body) {
		// IMPORTANT: Do not force light mode into localStorage on every load.
		// Rules:
		// - If localStorage.theme === "dark-contrast" => apply body.dark-contrast
		// - If no stored theme (or unknown value) => default to body.light
		// - If dark-contrast is disabled later => we persist "light" explicitly
		const storedTheme = safeGetStoredTheme();
		if (storedTheme === THEME_DARK_CONTRAST) {
			setTheme(body, THEME_DARK_CONTRAST, { persist: false });
			return;
		}

		if (storedTheme === THEME_LIGHT) {
			setTheme(body, THEME_LIGHT, { persist: false });
			return;
		}

		setTheme(body, THEME_LIGHT, { persist: false });
	}

	function isModalOpen(body) {
		return body.classList.contains('a11y-open');
	}

	function syncModalVisualState({ body, backdrop, modal }) {
		// Modal state model (do not change CSS):
		// - body.a11y-open is the logical state for JS.
		// - data-open="true" on backdrop+modal is the visual state consumed by CSS.
		const open = isModalOpen(body);
		if (backdrop) backdrop.dataset.open = open ? 'true' : 'false';
		if (modal) modal.dataset.open = open ? 'true' : 'false';
	}

	function openModal({ body, backdrop, modal, closeButton }) {
		body.classList.add('a11y-open');
		syncModalVisualState({ body, backdrop, modal });
		closeButton?.focus?.();
	}

	function closeModal({ body, backdrop, modal }) {
		body.classList.remove('a11y-open');
		syncModalVisualState({ body, backdrop, modal });
	}

	function handleModalActionClick({ body }, action) {
		if (action === 'high-contrast') {
			const enabling = !body.classList.contains(THEME_DARK_CONTRAST);
			setTheme(body, enabling ? THEME_DARK_CONTRAST : THEME_LIGHT, { persist: true });
			return;
		}

		if (action === 'invert') {
			// Exists in UI but intentionally unimplemented for now.
			return;
		}
	}

	function initAccessibility() {
		const body = document.body;
		if (!body) return;

		// 1) Theme persistence
		initThemeFromStorage(body);

		// 2) Modal behavior
		const toggle = document.querySelector('[data-a11y-toggle]');
		const backdrop = document.querySelector('.accessibility-backdrop');
		const modal = document.querySelector('.accessibility-modal');
		const closeButton = modal?.querySelector(
			'.accessibility-actions button[type="button"], .accessibility-actions button',
		);

		// Theme still works even if modal elements are missing.
		if (!modal || !backdrop) return;

		const api = { body, backdrop, modal, closeButton };
		syncModalVisualState(api);

		if (toggle) {
			toggle.addEventListener('click', (event) => {
				event.preventDefault();
				openModal(api);
			});
		}

		backdrop.addEventListener('click', () => {
			closeModal(api);
		});

		closeButton?.addEventListener('click', () => {
			closeModal(api);
		});

		document.addEventListener('keydown', (event) => {
			if (event.key !== 'Escape') return;
			if (!isModalOpen(body)) return;
			closeModal(api);
		});

		// 3) Modal actions (data-driven)
		modal.addEventListener('click', (event) => {
			const target = event.target;
			if (!(target instanceof Element)) return;
			const actionEl = target.closest('[data-a11y-action]');
			if (!actionEl || !modal.contains(actionEl)) return;

			const action = actionEl.getAttribute('data-a11y-action');
			if (!action) return;
			handleModalActionClick(api, action);
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initAccessibility);
	} else {
		initAccessibility();
	}
})();
