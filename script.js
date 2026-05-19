const API_URL = '/api'; 

let dropsData = [];
let currentReviews = [];
let currentActiveDropId = "";

// === SYSTEM TŁUMACZEŃ (i18n) ===
let currentLang = localStorage.getItem('lang') || 'pl';

function t(key) {
    return translations[currentLang][key] || key;
}

function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    
    // Update elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerText = t(key);
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });

    // Refresh dynamic sections
    renderDrops();
    filterDrops();
    if(document.getElementById('modal').classList.contains('active')) {
        openModal(currentActiveDropId);
    }
}

// === SYSTEM MOTYWÓW ===
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

function toggleTheme() {
    const theme = document.documentElement.getAttribute('data-theme');
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeBtn = document.getElementById('theme-btn');
    if (theme === 'dark') {
        themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
}

// === NARZĘDZIA (NOWE GWIAZDKI SVG Z FONT AWESOME) ===
function renderStars(rating, showNumber = true) {
    let starsHtml = '';
    const r = Number(rating);
    for(let i = 1; i <= 5; i++) {
        if (r >= i) {
            starsHtml += '<i class="fa-solid fa-star"></i>';
        } else if (r >= i - 0.5) {
            starsHtml += '<i class="fa-solid fa-star-half-stroke"></i>';
        } else {
            starsHtml += '<i class="fa-regular fa-star"></i>';
        }
    }
    if (showNumber) {
        return `${starsHtml} <span class="rating-number">(${r.toFixed(1)})</span>`;
    }
    return starsHtml;
}

// === KOPIOWANIE KOMENDY ===
function copyCommand() {
    const cmdName = currentLang === 'en' ? 'review' : 'ocenka';
    const cmdArg = currentLang === 'en' ? 'drop_id:' : 'id_dropu:';
    
    const cmd = `/${cmdName} ${cmdArg} ${currentActiveDropId}`;
    
    navigator.clipboard.writeText(cmd).then(() => {
        const btn = document.getElementById('copy-btn');
        const originalContent = btn.innerHTML;
        btn.innerHTML = `<i class="fa-solid fa-check"></i> ${t('copy_success')}`;
        btn.classList.add('success');
        setTimeout(() => {
            btn.innerHTML = originalContent;
            btn.classList.remove('success');
        }, 2000);
    });
}

// === POBIERANIE I RENDEROWANIE ===
async function fetchDrops() {
    try {
        const res = await fetch(`${API_URL}/drops`);
        if (!res.ok) throw new Error("API error");
        dropsData = await res.json();
        renderDrops();
    } catch (e) {
        document.getElementById('all-drops').innerHTML = `<p style="color:#ff4444; font-weight:bold;">${t('error_db')}</p>`;
        document.getElementById('top-drops').innerHTML = '';
    }
}

function createCard(drop, index) {
    const animationDelay = index * 0.1;
    const grammarWord = getReviewWord(drop.review_count, currentLang);
    
    return `
        <div class="card" onclick="openModal('${drop.id}')" style="animation-delay: ${animationDelay}s">
            <div class="card-img-wrapper">
                <div class="drop-id-badge">#${drop.id}</div>
                <img src="${drop.banner_url}" alt="Baner" onerror="this.src='https://via.placeholder.com/600x300?text=Brak+Zdjecia'">
            </div>
            <div class="card-content">
                <div class="card-title">${drop.name}</div>
                <div class="card-versions">
                    <span class="version-badge">☕ ${drop.java_version}</span>
                    <span class="version-badge">📱 ${drop.bedrock_version}</span>
                </div>
                <div class="stars">
                    ${renderStars(drop.avg_rating)} 
                    <span style="font-size:0.85rem; margin-left: 5px;">(${drop.review_count} ${grammarWord})</span>
                </div>
            </div>
        </div>
    `;
}

function renderDrops() {
    if (dropsData.length === 0) return;
    const top = [...dropsData].sort((a,b) => b.avg_rating - a.avg_rating).slice(0, 3);
    document.getElementById('top-drops').innerHTML = top.map((d, i) => createCard(d, i)).join('');
    document.getElementById('all-drops').innerHTML = dropsData.map((d, i) => createCard(d, i)).join('');
}

// === WYSZUKIWARKA I PODPOWIEDZI ===
function filterDrops() {
    const query = document.getElementById('search').value.toLowerCase().trim();
    const topSection = document.getElementById('top-section');
    const allDropsTitle = document.getElementById('all-drops-title');
    const suggestionsBox = document.getElementById('search-suggestions');

    if (query === '') {
        topSection.style.display = 'block';
        allDropsTitle.innerHTML = t('all_title');
        renderDrops();
        suggestionsBox.classList.remove('active');
        return;
    }

    topSection.style.display = 'none';
    allDropsTitle.innerHTML = t('search_results').replace('{query}', query);
    
    const filtered = dropsData.filter(d => d.name.toLowerCase().includes(query) || d.id.toLowerCase().includes(query));
    document.getElementById('all-drops').innerHTML = filtered.length > 0 
        ? filtered.map((d, i) => createCard(d, i)).join('') 
        : `<p style="font-size: 1.1rem; color: #ff4444; font-weight: bold;">${t('no_search_results')}</p>`;

    // Render suggestions
    if (filtered.length > 0) {
        suggestionsBox.innerHTML = filtered.slice(0, 5).map(d => `
            <div class="suggestion-item" onclick="selectSuggestion('${d.id}')">
                <img src="${d.banner_url}" onerror="this.src='logo_small.png'">
                <span>${d.name}</span>
            </div>
        `).join('');
        suggestionsBox.classList.add('active');
    } else {
        suggestionsBox.classList.remove('active');
    }
}

function selectSuggestion(id) {
    const drop = dropsData.find(d => d.id === id);
    document.getElementById('search').value = drop.name;
    document.getElementById('search-suggestions').classList.remove('active');
    openModal(id);
}

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) {
        document.getElementById('search-suggestions').classList.remove('active');
    }
});

// === MODAL Z BLOKADĄ SCROLLA ===
async function openModal(id) {
    const drop = dropsData.find(d => d.id === id);
    if(!drop) return;
    
    document.body.classList.add('no-scroll');
    currentActiveDropId = drop.id; 
    const grammarWord = getReviewWord(drop.review_count, currentLang);

    const dDate = currentLang === 'en' ? (drop.release_date_en || drop.release_date) : drop.release_date;
    const dFeat = currentLang === 'en' ? (drop.features_en || drop.features) : drop.features;

    document.getElementById('m-banner').src = drop.banner_url;
    document.getElementById('m-title').innerText = drop.name;
    document.getElementById('m-id-val').innerText = drop.id;
    document.getElementById('m-java-val').innerText = drop.java_version;
    document.getElementById('m-bedrock-val').innerText = drop.bedrock_version;
    document.getElementById('m-date-val').innerText = dDate;
    
    document.getElementById('m-stars').innerHTML = renderStars(drop.avg_rating) + `<span style="font-size:1.1rem; color:var(--text-muted); margin-left:15px; font-family: 'Inter', sans-serif;"> ${drop.review_count} ${grammarWord}</span>`;
    
    document.getElementById('m-features').innerHTML = dFeat;
    
    document.getElementById('review-sort').value = 'newest';
    document.getElementById('m-reviews').innerHTML = `<div style="text-align:center; padding: 20px; color: var(--accent); font-weight:bold;">${t('loading_reviews')}</div>`;
    document.getElementById('modal').classList.add('active');

    try {
        const res = await fetch(`${API_URL}/drops/${id}/reviews`);
        currentReviews = await res.json();
        sortReviews(); 
    } catch (e) {
        document.getElementById('m-reviews').innerHTML = `<p style="color:#ff4444">${t('error_reviews')}</p>`;
    }
}

function closeModalBtn() {
    document.getElementById('modal').classList.remove('active');
    document.body.classList.remove('no-scroll'); 
}

function closeModalOutside(e) {
    if(e.target.id === 'modal') closeModalBtn();
}

function sortReviews() {
    const showAllLangs = document.getElementById('show-all-langs').checked;
    
    let filteredReviews = currentReviews;
    if (!showAllLangs) {
        filteredReviews = currentReviews.filter(r => (r.language || 'pl') === currentLang);
    }

    if(filteredReviews.length === 0) {
        document.getElementById('m-reviews').innerHTML = `
            <div style="text-align:center; padding: 40px; background: var(--bg-main); border-radius: 12px; margin-top: 20px; border: 1px dashed var(--border-color);">
                <div style="font-size: 3rem; margin-bottom: 15px;">👻</div>
                <h3 style="color: var(--text-main);">${t('empty_reviews_title')}</h3>
                <p style="color: var(--text-muted); margin-top: 5px;">${t('empty_reviews_desc')}</p>
            </div>`;
        return;
    }

    const sortBy = document.getElementById('review-sort').value;
    
    filteredReviews.sort((a, b) => {
        if(sortBy === 'newest') return b.created_at - a.created_at;
        if(sortBy === 'oldest') return a.created_at - b.created_at;
        if(sortBy === 'highest') return b.rating - a.rating;
        if(sortBy === 'lowest') return a.rating - b.rating;
    });

    document.getElementById('m-reviews').innerHTML = filteredReviews.map(r => `
        <div class="review-card">
            <img src="${r.avatar_url}" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'" alt="Avatar">
            <div class="review-content">
                <div class="review-top">
                    <span class="reviewer-name">
                        ${r.username}
                        ${showAllLangs ? `<span class="lang-badge">${r.language || 'PL'}</span>` : ''}
                    </span>
                    <span class="stars" style="font-size: 1.1rem;">${renderStars(r.rating, false)}</span>
                </div>
                <div class="review-text">${r.review_text}</div>
                <div class="review-meta">
                    <span>${t('review_id')}: #${r.id}</span>
                    <span>${new Date(r.created_at).toLocaleString(currentLang === 'pl' ? 'pl-PL' : 'en-US', {day: '2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit'})}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
        langSelect.value = currentLang;
    }
    updateThemeIcon(savedTheme);
    changeLanguage(currentLang);
    fetchDrops();
});
