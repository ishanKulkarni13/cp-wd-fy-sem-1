/* Events page: client-side filters (category/state/city) */

document.addEventListener('DOMContentLoaded', () => {
	const filtersForm = document.getElementById('eventsFilters');
	const categorySelect = document.getElementById('filterCategory');
	const stateSelect = document.getElementById('filterState');
	const citySelect = document.getElementById('filterCity');
	const clearButton = document.getElementById('filtersClear');
	const emptyState = document.getElementById('eventsEmpty');

	if (!(filtersForm instanceof HTMLFormElement)) return;
	if (!(categorySelect instanceof HTMLSelectElement)) return;
	if (!(stateSelect instanceof HTMLSelectElement)) return;
	if (!(citySelect instanceof HTMLSelectElement)) return;
	if (!(clearButton instanceof HTMLButtonElement)) return;

	const cards = Array.from(document.querySelectorAll('.events-card'));
	if (cards.length === 0) return;

	const normalize = (value) => (value || '').toString().trim().toLowerCase();

	const deriveCityStateFromVenue = (venueRaw) => {
		const venue = (venueRaw || '').toString().trim();
		if (!venue) return { city: '', state: '' };

		const parts = venue
			.split(',')
			.map((part) => part.trim())
			.filter(Boolean)
			.map((part) => part.replace(/\.+$/u, '').trim());

		if (parts.length >= 2) {
			return {
				city: parts.at(-2) || '',
				state: (parts.at(-1) || '').replace(/\.$/u, ''),
			};
		}

		return { city: venue.replace(/\.+$/u, '').trim(), state: '' };
	};

	const categories = new Map();
	const states = new Map();
	const cities = new Map();

	for (const card of cards) {
		if (!(card instanceof HTMLElement)) continue;

		const categoryRaw = card.dataset.category || '';
		const venueRaw = card.dataset.venue || card.querySelector('.events-card__venue')?.textContent || '';

		const { city, state } = deriveCityStateFromVenue(venueRaw);

		card.dataset.city = city;
		card.dataset.state = state;

		const categoryKey = normalize(categoryRaw);
		if (categoryKey) categories.set(categoryKey, categoryRaw.trim());

		const stateKey = normalize(state);
		if (stateKey) states.set(stateKey, state.trim());

		const cityKey = normalize(city);
		if (cityKey) cities.set(cityKey, city.trim());
	}

	const populateSelect = (select, placeholderText, items) => {
		const placeholderOption = select.querySelector('option[value=""]');
		if (placeholderOption) placeholderOption.textContent = placeholderText;

		// Remove old dynamic options
		Array.from(select.querySelectorAll('option[data-dynamic="true"]')).forEach((opt) => opt.remove());

		const values = Array.from(items.values()).sort((a, b) => a.localeCompare(b));
		for (const value of values) {
			const option = document.createElement('option');
			option.value = normalize(value);
			option.textContent = value;
			option.dataset.dynamic = 'true';
			select.append(option);
		}

		select.disabled = values.length === 0;
		select.setAttribute('aria-disabled', String(select.disabled));
	};

	populateSelect(categorySelect, 'All categories', categories);
	populateSelect(stateSelect, 'All states', states);
	populateSelect(citySelect, 'All cities', cities);

	const applyFilters = () => {
		const selectedCategory = normalize(categorySelect.value);
		const selectedState = normalize(stateSelect.value);
		const selectedCity = normalize(citySelect.value);

		let visibleCount = 0;
		for (const card of cards) {
			if (!(card instanceof HTMLElement)) continue;

			const matchesCategory = !selectedCategory || normalize(card.dataset.category) === selectedCategory;
			const matchesState = !selectedState || normalize(card.dataset.state) === selectedState;
			const matchesCity = !selectedCity || normalize(card.dataset.city) === selectedCity;

			const shouldShow = matchesCategory && matchesState && matchesCity;
			card.hidden = !shouldShow;
			if (shouldShow) visibleCount += 1;
		}

		if (emptyState instanceof HTMLElement) {
			emptyState.hidden = visibleCount !== 0;
		}
	};

	categorySelect.addEventListener('change', applyFilters);
	stateSelect.addEventListener('change', applyFilters);
	citySelect.addEventListener('change', applyFilters);

	clearButton.addEventListener('click', () => {
		categorySelect.value = '';
		stateSelect.value = '';
		citySelect.value = '';
		applyFilters();
		categorySelect.focus();
	});

	applyFilters();
});
