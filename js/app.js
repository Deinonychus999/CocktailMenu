let cocktailData = { categories: [], cocktails: [] };
let activeCategory = 'all';
let searchQuery = '';

// Elegant line-art glass SVG icons
const glassIcons = {
    coupe: `<svg class="glass-icon" viewBox="0 0 80 100" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="10" y1="18" x2="40" y2="50"/>
        <line x1="70" y1="18" x2="40" y2="50"/>
        <ellipse cx="40" cy="18" rx="30" ry="8"/>
        <line x1="40" y1="50" x2="40" y2="85"/>
        <ellipse cx="40" cy="90" rx="18" ry="5"/>
    </svg>`,
    rocks: `<svg class="glass-icon" viewBox="0 0 80 100" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 35 L18 75 Q18 80 40 80 Q62 80 62 75 L65 35"/>
        <ellipse cx="40" cy="35" rx="25" ry="8"/>
    </svg>`,
    highball: `<svg class="glass-icon" viewBox="0 0 80 100" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M25 15 L28 88 Q28 92 40 92 Q52 92 52 88 L55 15"/>
        <ellipse cx="40" cy="15" rx="15" ry="5"/>
    </svg>`,
    wine: `<svg class="glass-icon" viewBox="0 0 80 100" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 8 Q12 30 25 45 Q32 52 40 52 Q48 52 55 45 Q68 30 60 8"/>
        <ellipse cx="40" cy="8" rx="20" ry="5"/>
        <line x1="40" y1="52" x2="40" y2="85"/>
        <ellipse cx="40" cy="90" rx="16" ry="5"/>
    </svg>`
};

function getGlassIcon(glassType, size = 'normal') {
    const icon = glassIcons[glassType] || glassIcons.coupe;
    const sizeClass = size === 'large' ? 'glass-icon-large' : '';
    return `<div class="glass-placeholder ${sizeClass}">${icon}</div>`;
}

const categoryTabs = document.getElementById('categoryTabs');
const mainContent = document.getElementById('mainContent');
const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');
const modalClose = document.getElementById('modalClose');
const headerTitle = document.getElementById('headerTitle');
const backBtn = document.getElementById('backBtn');
const searchBar = document.getElementById('searchBar');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');

async function init() {
    try {
        const response = await fetch('data/cocktails.json');
        cocktailData = await response.json();
        renderCategories();
        renderCocktails();
    } catch (error) {
        console.error('Failed to load cocktails:', error);
        mainContent.innerHTML = '<p style="text-align:center;padding:40px;color:#999;">Erreur de chargement</p>';
    }
}

function renderCategories() {
    const allTab = `<button class="tab-button active" data-category="all">Tous</button>`;
    const buttons = cocktailData.categories
        .map(c => `<button class="tab-button" data-category="${c.id}">${c.name}</button>`)
        .join('');

    categoryTabs.innerHTML = allTab + buttons;

    categoryTabs.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
            categoryTabs.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = btn.dataset.category;

            const cat = cocktailData.categories.find(c => c.id === activeCategory);
            headerTitle.textContent = cat ? cat.name : 'Cocktails';
            backBtn.classList.toggle('visible', activeCategory !== 'all');

            renderCocktails();
        });
    });
}

backBtn.addEventListener('click', () => {
    categoryTabs.querySelector('[data-category="all"]').click();
});

function filterByIngredient(cocktails) {
    if (!searchQuery) return cocktails;
    const query = searchQuery.toLowerCase();
    return cocktails.filter(c =>
        c.ingredients.some(i => i.name.toLowerCase().includes(query))
    );
}

function renderCocktails() {
    let filtered = activeCategory === 'all'
        ? cocktailData.cocktails
        : cocktailData.cocktails.filter(c => c.category === activeCategory);

    filtered = filterByIngredient(filtered);

    if (activeCategory === 'all') {
        const grouped = {};
        cocktailData.categories.forEach(cat => {
            const items = filterByIngredient(cocktailData.cocktails.filter(c => c.category === cat.id));
            if (items.length) grouped[cat.id] = { name: cat.name, items };
        });

        const html = Object.entries(grouped)
            .map(([id, g]) => `
                <section class="category-section">
                    <h2 class="category-header">${g.name}</h2>
                    ${g.items.map(createCocktailItem).join('')}
                </section>
            `).join('');
        mainContent.innerHTML = html || '<p class="no-results">Aucun cocktail trouvé</p>';
    } else {
        mainContent.innerHTML = filtered.length
            ? filtered.map(createCocktailItem).join('')
            : '<p class="no-results">Aucun cocktail trouvé</p>';
    }

    mainContent.querySelectorAll('.cocktail-item').forEach(item => {
        item.addEventListener('click', () => {
            const cocktail = cocktailData.cocktails.find(c => c.id === item.dataset.id);
            if (cocktail) openModal(cocktail);
        });
    });
}

function createCocktailItem(cocktail) {
    const imageHtml = cocktail.image
        ? `<img class="cocktail-image" src="images/cocktails/${cocktail.image}" alt="${cocktail.name}">`
        : getGlassIcon(cocktail.glass || 'coupe');

    const ingredientList = cocktail.ingredients
        .map(i => i.name)
        .join('\n');

    return `
        <article class="cocktail-item" data-id="${cocktail.id}">
            ${imageHtml}
            <div class="cocktail-info">
                <h3 class="cocktail-name">${cocktail.name}</h3>
                <p class="cocktail-descriptor">${cocktail.description}</p>
                <p class="cocktail-ingredients">${ingredientList}</p>
            </div>
        </article>
    `;
}

function openModal(cocktail) {
    const imageHtml = cocktail.image
        ? `<img class="modal-image" src="images/cocktails/${cocktail.image}" alt="${cocktail.name}">`
        : getGlassIcon(cocktail.glass || 'coupe', 'large');

    modalContent.innerHTML = `
        <div class="modal-header">
            ${imageHtml}
            <div class="modal-title-area">
                <h2 class="modal-name">${cocktail.name}</h2>
                <p class="modal-descriptor">${cocktail.description}</p>
            </div>
        </div>

        <div class="modal-section">
            <h3 class="modal-section-title">Ingrédients</h3>
            <ul class="ingredients-list">
                ${cocktail.ingredients.map(i => `
                    <li class="ingredient-row">
                        <span class="ingredient-name">${i.name}</span>
                        <span class="ingredient-amount">${i.amount}</span>
                    </li>
                `).join('')}
            </ul>
        </div>

        ${cocktail.instructions ? `
            <div class="modal-section">
                <h3 class="modal-section-title">Préparation</h3>
                <p class="instructions-text">${cocktail.instructions}</p>
            </div>
        ` : ''}
    `;

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// Search functionality
searchBtn.addEventListener('click', () => {
    const isActive = searchBar.classList.toggle('active');
    if (isActive) {
        searchInput.focus();
    } else {
        searchInput.value = '';
        searchQuery = '';
        renderCocktails();
    }
});

searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderCocktails();
});

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        searchBar.classList.remove('active');
        searchInput.value = '';
        searchQuery = '';
        renderCocktails();
    }
});

init();
