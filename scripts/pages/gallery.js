function initGalleryCarousel() {
	const root = document.querySelector('[data-carousel]');
	if (!root) return;

	const track = root.querySelector('[data-carousel-track]');
	if (!(track instanceof HTMLElement)) return;

	const prevButton = document.querySelector('[data-carousel-prev]');
	const nextButton = document.querySelector('[data-carousel-next]');

	const prefersReducedMotion =
		typeof window !== 'undefined' &&
		typeof window.matchMedia === 'function' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	const getStep = () => {
		const first = track.querySelector('.gallery-slide');
		if (!(first instanceof HTMLElement)) return track.clientWidth;

		const rect = first.getBoundingClientRect();
		const style = window.getComputedStyle(track);
		const gap = Number.parseFloat(style.columnGap || style.gap || '0') || 0;
		return Math.max(1, rect.width + gap);
	};

	const scrollByStep = (direction) => {
		const step = getStep();
		track.scrollBy({
			left: step * direction,
			behavior: prefersReducedMotion ? 'auto' : 'smooth',
		});
	};

	const setButtonState = () => {
		if (!(prevButton instanceof HTMLButtonElement) || !(nextButton instanceof HTMLButtonElement)) return;

		const maxScrollLeft = track.scrollWidth - track.clientWidth;
		const atStart = track.scrollLeft <= 1;
		const atEnd = track.scrollLeft >= maxScrollLeft - 1;

		prevButton.disabled = atStart;
		nextButton.disabled = atEnd;
	};

	if (prevButton instanceof HTMLButtonElement) {
		prevButton.addEventListener('click', () => scrollByStep(-1));
	}
	if (nextButton instanceof HTMLButtonElement) {
		nextButton.addEventListener('click', () => scrollByStep(1));
	}

	track.addEventListener('keydown', (event) => {
		if (!(event instanceof KeyboardEvent)) return;

		switch (event.key) {
			case 'ArrowLeft':
				event.preventDefault();
				scrollByStep(-1);
				break;
			case 'ArrowRight':
				event.preventDefault();
				scrollByStep(1);
				break;
			case 'Home':
				event.preventDefault();
				track.scrollTo({ left: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
				break;
			case 'End':
				event.preventDefault();
				track.scrollTo({ left: track.scrollWidth, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
				break;
			default:
				break;
		}
	});

	track.addEventListener('scroll', setButtonState, { passive: true });
	window.addEventListener('resize', setButtonState, { passive: true });
	setButtonState();
}

document.addEventListener('DOMContentLoaded', () => {
	initGalleryCarousel();
});
