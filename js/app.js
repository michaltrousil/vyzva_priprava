/**
 * Výzva Příprava - Atletika Líbeznice
 * Aplikace pro sledování týdenní tréninkové výzvy
 */

// === KONFIGURACE ===
const API_URL = 'https://script.google.com/macros/s/AKfycbxXpe4SUXtP9CwENx9EMKE6BEhuJ4MfJBsZ_k6QltiBPvQF2QK0_uQEDCixUQ1xUPbx/exec';
const VERSION = 'priprava';

/**
 * Helper pro API volání - řeší CORS s Google Apps Script
 */
async function fetchAPI(url) {
    const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        redirect: 'follow'
    });
    return response.json();
}

// Cache klíče
const CACHE_KEYS = {
    athletes: 'priprava_athletes',
    leaderboard: 'priprava_leaderboard',
    leaderboardTime: 'priprava_leaderboard_time'
};
const CACHE_TTL = 5 * 60 * 1000; // 5 minut

// === KONFIGURACE CVIKŮ ===
const EXERCISES = {
    monday: {
        name: 'Protažení po tréninku',
        type: 'stretching',
        duration: '10-15 minut',
        points: 2,
        inputType: 'minutes',
        inputLabel: 'Počet minut',
        videos: ['https://www.youtube.com/watch?v=S4qP5x6He0Q'],
        videoTitle: 'Inspirace pro protažení',
        description: []
    },
    tuesday: {
        name: 'Core posilka',
        type: 'core',
        duration: '10-15 minut',
        points: 2,
        inputType: 'minutes',
        inputLabel: 'Počet minut',
        videos: ['https://www.instagram.com/p/DU-MnOmiKQG/?img_index=8&igsh=MWt3OTRhZ2l4Mm1tZw=='],
        videoTitle: 'Inspirace na cviky',
        description: []
    },
    wednesday: {
        name: 'Protažení po tréninku',
        type: 'stretching',
        duration: '10-15 minut',
        points: 2,
        inputType: 'minutes',
        inputLabel: 'Počet minut',
        videos: ['https://www.youtube.com/watch?v=S4qP5x6He0Q'],
        videoTitle: 'Inspirace pro protažení',
        description: []
    },
    thursday: {
        name: 'Core posilka',
        type: 'core',
        duration: '10-15 minut',
        points: 2,
        inputType: 'minutes',
        inputLabel: 'Počet minut',
        videos: ['https://www.instagram.com/p/DU-MnOmiKQG/?img_index=8&igsh=MWt3OTRhZ2l4Mm1tZw=='],
        videoTitle: 'Inspirace na cviky',
        description: []
    },
    friday: {
        name: 'Švihadlo full trénink',
        type: 'jumprope',
        duration: '1000+ přeskoků',
        points: null,
        maxValue: 1500,
        pointsPerUnit: 300,
        inputType: 'jumps',
        inputLabel: 'Počet přeskoků',
        videos: [],
        description: []
    },
    saturday: {
        name: 'Švihadlo full trénink',
        type: 'jumprope',
        duration: '1000+ přeskoků',
        points: null,
        maxValue: 1500,
        pointsPerUnit: 300,
        inputType: 'jumps',
        inputLabel: 'Počet přeskoků',
        videos: [],
        description: []
    },
    sunday: {
        name: 'Core posilka',
        type: 'core',
        duration: '10-15 minut',
        points: 2,
        inputType: 'minutes',
        inputLabel: 'Počet minut',
        videos: ['https://www.instagram.com/p/DU-MnOmiKQG/?img_index=8&igsh=MWt3OTRhZ2l4Mm1tZw=='],
        videoTitle: 'Inspirace na cviky',
        description: []
    }
};

// Mapování indexu dne na klíč
const DAY_MAP = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAY_NAMES = {
    sunday: 'Neděle',
    monday: 'Pondělí',
    tuesday: 'Úterý',
    wednesday: 'Středa',
    thursday: 'Čtvrtek',
    friday: 'Pátek',
    saturday: 'Sobota'
};

// === STAV APLIKACE ===
const state = {
    athletes: [],
    selectedAthlete: '',
    selectedDay: 'today',
    currentView: 'challenge',
    leaderboard: [],
    existingEntry: null,
    previewDay: null
};

// === POMOCNÉ FUNKCE ===

/**
 * Vrátí klíč dne pro dané datum
 */
function getDayKey(date) {
    return DAY_MAP[date.getDay()];
}

/**
 * Vrátí cvičení pro daný den
 */
function getExerciseForDate(date) {
    const dayKey = getDayKey(date);
    return { ...EXERCISES[dayKey], dayKey, dayName: DAY_NAMES[dayKey] };
}

/**
 * Vrátí dnešní cvičení
 */
function getTodayExercise() {
    return getExerciseForDate(new Date());
}

/**
 * Vrátí cvičení pro vybraný den (dnes/včera)
 */
function getSelectedExercise() {
    const date = getDateForDay(state.selectedDay);
    return getExerciseForDate(date);
}

/**
 * Vypočítá body pro švihadlo
 */
function calculateJumpropePoints(jumps) {
    const maxJumps = 1500;
    const cappedJumps = Math.min(jumps, maxJumps);
    return Math.floor(cappedJumps / 300);
}

/**
 * Vrátí body pro cvičení
 */
function getPointsForExercise(exercise, value) {
    if (exercise.type === 'jumprope') {
        return calculateJumpropePoints(value || 0);
    }
    return exercise.points;
}

/**
 * Formátuje datum pro zobrazení (čtvrtek 11. března 2026)
 */
function formatDate(date) {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('cs-CZ', options);
}

/**
 * Formátuje datum pro API (YYYY-MM-DD)
 */
function formatDateForAPI(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Vrátí Date objekt pro vybraný den
 */
function getDateForDay(day) {
    const date = new Date();
    if (day === 'yesterday') {
        date.setDate(date.getDate() - 1);
    }
    return date;
}

// === UI FUNKCE ===

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

function showError(message) {
    const errorEl = document.getElementById('error-message');
    document.getElementById('error-text').textContent = message;
    errorEl.classList.remove('hidden');
    setTimeout(() => errorEl.classList.add('hidden'), 5000);
}

function showSuccess() {
    const successEl = document.getElementById('success-message');
    successEl.classList.remove('hidden');
    setTimeout(() => successEl.classList.add('hidden'), 2000);
}

/**
 * Aktualizuje zobrazení dnešní výzvy
 */
function renderChallengeView() {
    const exercise = state.previewDay
        ? { ...EXERCISES[state.previewDay], dayKey: state.previewDay, dayName: DAY_NAMES[state.previewDay] }
        : getTodayExercise();

    const currentDayKey = state.previewDay || getDayKey(new Date());
    document.querySelectorAll('.day-switch-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.day === currentDayKey);
    });

    document.getElementById('current-day').textContent = `Dnes je: ${exercise.dayName}`;
    document.getElementById('challenge-name').textContent = exercise.name;
    document.getElementById('challenge-duration').textContent = exercise.duration;

    // Body
    let pointsText;
    if (exercise.type === 'jumprope') {
        pointsText = '1 bod / 300 skoků (max 5 bodů)';
    } else {
        pointsText = `${exercise.points} body za splnění`;
    }
    document.getElementById('challenge-points').textContent = pointsText;

    // Video(a) - jako odkazy na YouTube
    const videoContainer = document.getElementById('video-container');

    // Vrátí URL pro odkaz (YouTube embed převede na watch, ostatní ponechá)
    function toLinkUrl(url) {
        if (url.includes('youtube.com/embed/')) {
            return url.replace('youtube.com/embed/', 'youtube.com/watch?v=');
        }
        return url;
    }

    if (exercise.videos && exercise.videos.length > 0) {
        const validVideos = exercise.videos.filter(url => url !== null);
        if (validVideos.length > 0) {
            const title = exercise.videoTitle || '';
            videoContainer.innerHTML = `
                <div class="video-links">
                    ${title ? `<h3 class="video-title">${title}</h3>` : ''}
                    ${validVideos.map((url, i) => `
                        <a href="${toLinkUrl(url)}" target="_blank" class="video-link">
                            <span class="play-icon">▶</span>
                            ${validVideos.length > 1 ? `Video ${i + 1}` : 'Přehrát video'}
                        </a>
                    `).join('')}
                </div>
            `;
        } else {
            videoContainer.innerHTML = '';
        }
    } else {
        videoContainer.innerHTML = '';
    }

    // Popis cvičení - zobrazit pouze pokud existuje
    const descriptionEl = document.getElementById('exercise-description');
    const list = document.getElementById('exercise-list');
    if (exercise.description && exercise.description.length > 0) {
        descriptionEl.classList.remove('hidden');
        list.innerHTML = exercise.description.map(item => `<li>${item}</li>`).join('');
    } else {
        descriptionEl.classList.add('hidden');
    }
}

/**
 * Aktualizuje zobrazení vybrané výzvy v entry view
 */
function renderEntryChallenge() {
    const exercise = getSelectedExercise();

    document.getElementById('entry-challenge-name').textContent = exercise.name;
    document.getElementById('entry-challenge-duration').textContent = exercise.duration;
    document.getElementById('value-label').textContent = exercise.inputLabel;

    // Placeholder podle typu
    const valueInput = document.getElementById('value-input');
    if (exercise.type === 'jumprope') {
        valueInput.placeholder = 'Zadej počet přeskoků (max 1500)';
        valueInput.max = 1500;
    } else {
        valueInput.placeholder = 'Zadej počet minut';
        valueInput.removeAttribute('max');
    }
}

/**
 * Aktualizuje zobrazení vybraného data
 */
function updateSelectedDate() {
    const date = getDateForDay(state.selectedDay);
    document.getElementById('selected-date').textContent = formatDate(date);
    renderEntryChallenge();
}

/**
 * Renderuje seznam atletů
 */
function renderAthleteSelect() {
    const select = document.getElementById('athlete-select');
    select.innerHTML = '<option value="">-- Vyber atleta --</option>';

    state.athletes.forEach(athlete => {
        const option = document.createElement('option');
        option.value = athlete;
        option.textContent = athlete;
        select.appendChild(option);
    });
}

/**
 * Renderuje žebříček
 */
function renderLeaderboard() {
    const tbody = document.getElementById('leaderboard-body');
    const leaderboard = state.leaderboard;

    // Celkové statistiky
    const totalPoints = leaderboard.reduce((sum, a) => sum + a.totalPoints, 0);
    const activeAthletes = leaderboard.filter(a => a.totalPoints > 0).length;

    document.getElementById('total-points').textContent = totalPoints.toLocaleString('cs-CZ');
    document.getElementById('active-athletes').textContent = activeAthletes;

    // Tabulka
    if (leaderboard.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Žádná data</td></tr>';
        return;
    }

    // Seřadit podle bodů
    const sorted = [...leaderboard].sort((a, b) => b.totalPoints - a.totalPoints);

    // Přiřadit pořadí (sdílená místa)
    let currentRank = 0;
    let previousPoints = null;

    tbody.innerHTML = sorted.map((athlete, index) => {
        if (athlete.totalPoints !== previousPoints) {
            currentRank = index + 1;
            previousPoints = athlete.totalPoints;
        }

        let rankClass = '';
        if (currentRank === 1) rankClass = 'rank-1';
        else if (currentRank === 2) rankClass = 'rank-2';
        else if (currentRank === 3) rankClass = 'rank-3';

        return `
            <tr>
                <td class="rank ${rankClass}">${currentRank}.</td>
                <td>${athlete.name}</td>
                <td class="points">${athlete.totalPoints.toLocaleString('cs-CZ')}</td>
                <td class="days">${athlete.completedDays}</td>
            </tr>
        `;
    }).join('');
}

/**
 * Aktualizuje stav submit tlačítka
 */
function updateSubmitButton() {
    const athlete = state.selectedAthlete;
    const completed = document.getElementById('completed-checkbox').checked;
    const value = document.getElementById('value-input').value;
    const hasExisting = state.existingEntry !== null;

    const btn = document.getElementById('submit-btn');
    btn.disabled = !athlete || !completed || !value || hasExisting;
}

// === API FUNKCE ===

/**
 * Načte seznam atletů
 */
async function loadAthletes() {
    // Nejprve načíst z cache
    const cached = localStorage.getItem(CACHE_KEYS.athletes);
    if (cached) {
        state.athletes = JSON.parse(cached);
        renderAthleteSelect();
    }

    // Načíst čerstvá data
    try {
        const url = `${API_URL}?action=getAthletes&version=${VERSION}`;
        const data = await fetchAPI(url);

        if (data.athletes) {
            state.athletes = data.athletes;
            localStorage.setItem(CACHE_KEYS.athletes, JSON.stringify(data.athletes));
            renderAthleteSelect();
        }
    } catch (error) {
        console.error('Chyba při načítání atletů:', error);
        if (state.athletes.length === 0) {
            showError('Nepodařilo se načíst atlety');
        }
    }
}

/**
 * Načte existující záznam pro vybraný den
 */
async function loadExistingEntry() {
    if (!state.selectedAthlete) {
        state.existingEntry = null;
        document.getElementById('existing-entry').classList.add('hidden');
        updateSubmitButton();
        return;
    }

    try {
        const date = formatDateForAPI(getDateForDay(state.selectedDay));
        const url = `${API_URL}?action=getEntry&version=${VERSION}&athlete=${encodeURIComponent(state.selectedAthlete)}&date=${date}`;
        const data = await fetchAPI(url);

        if (data.entry) {
            state.existingEntry = data.entry;
            document.getElementById('existing-entry').classList.remove('hidden');
        } else {
            state.existingEntry = null;
            document.getElementById('existing-entry').classList.add('hidden');
        }

        updateSubmitButton();
    } catch (error) {
        console.error('Chyba při načítání záznamu:', error);
        state.existingEntry = null;
        document.getElementById('existing-entry').classList.add('hidden');
        updateSubmitButton();
    }
}

/**
 * Odešle splnění
 */
async function submitEntry() {
    const athlete = state.selectedAthlete;
    const completed = document.getElementById('completed-checkbox').checked;
    const value = parseInt(document.getElementById('value-input').value) || 0;
    const note = document.getElementById('note-input').value.trim();
    const date = formatDateForAPI(getDateForDay(state.selectedDay));
    const exercise = getSelectedExercise();

    // Validace pro švihadlo
    let finalValue = value;
    if (exercise.type === 'jumprope' && value > 1500) {
        finalValue = 1500;
    }

    // Vypočítat body
    const points = getPointsForExercise(exercise, finalValue);

    showLoading();

    try {
        const params = new URLSearchParams({
            action: 'saveEntry',
            version: VERSION,
            athlete: athlete,
            date: date,
            type: exercise.type,
            completed: completed ? '1' : '0',
            value: finalValue.toString(),
            points: points.toString(),
            note: note
        });

        const url = `${API_URL}?${params.toString()}`;
        const data = await fetchAPI(url);

        if (data.success) {
            // Invalidovat cache žebříčku
            localStorage.removeItem(CACHE_KEYS.leaderboard);
            localStorage.removeItem(CACHE_KEYS.leaderboardTime);

            // Reset formuláře
            document.getElementById('completed-checkbox').checked = false;
            document.getElementById('value-input').value = '';
            document.getElementById('note-input').value = '';

            // Znovu načíst existující záznam
            await loadExistingEntry();

            showSuccess();
        } else {
            showError(data.error || 'Nepodařilo se uložit záznam');
        }
    } catch (error) {
        console.error('Chyba při ukládání:', error);
        showError('Nepodařilo se uložit záznam');
    } finally {
        hideLoading();
    }
}

/**
 * Načte žebříček
 */
async function loadLeaderboard(forceRefresh = false) {
    // Zkontrolovat cache
    if (!forceRefresh) {
        const cached = localStorage.getItem(CACHE_KEYS.leaderboard);
        const cachedTime = localStorage.getItem(CACHE_KEYS.leaderboardTime);

        if (cached && cachedTime) {
            const age = Date.now() - parseInt(cachedTime);
            if (age < CACHE_TTL) {
                state.leaderboard = JSON.parse(cached);
                renderLeaderboard();
                return;
            }
        }
    }

    showLoading();

    try {
        const url = `${API_URL}?action=getLeaderboard&version=${VERSION}`;
        const data = await fetchAPI(url);

        if (data.leaderboard) {
            state.leaderboard = data.leaderboard;
            localStorage.setItem(CACHE_KEYS.leaderboard, JSON.stringify(data.leaderboard));
            localStorage.setItem(CACHE_KEYS.leaderboardTime, Date.now().toString());
            renderLeaderboard();
        }
    } catch (error) {
        console.error('Chyba při načítání žebříčku:', error);
        showError('Nepodařilo se načíst žebříček');
    } finally {
        hideLoading();
    }
}

// === EVENT HANDLERY ===

function handleNavigation(e) {
    const view = e.target.dataset.view;
    if (!view) return;

    state.currentView = view;

    // Aktualizovat aktivní tlačítko
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });

    // Přepnout pohledy
    document.getElementById('challenge-view').classList.toggle('hidden', view !== 'challenge');
    document.getElementById('entry-view').classList.toggle('hidden', view !== 'entry');
    document.getElementById('leaderboard-view').classList.toggle('hidden', view !== 'leaderboard');

    // Načíst data pro žebříček
    if (view === 'leaderboard') {
        loadLeaderboard();
    }
}

function handleAthleteSelect(e) {
    state.selectedAthlete = e.target.value;
    loadExistingEntry();
}

function handleDaySelect(e) {
    const day = e.target.dataset.day;
    if (!day) return;

    state.selectedDay = day;

    // Aktualizovat aktivní tlačítko
    document.querySelectorAll('.day-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.day === day);
    });

    updateSelectedDate();
    loadExistingEntry();
}

function handleSubmit() {
    if (document.getElementById('submit-btn').disabled) return;
    submitEntry();
}

function handleErrorClose() {
    document.getElementById('error-message').classList.add('hidden');
}

function handleDaySwitcher(e) {
    const day = e.target.dataset.day;
    if (!day) return;
    state.previewDay = day;
    renderChallengeView();
}


// === DEMO MÓD ===

function loadDemoData() {
    state.athletes = ['Anna Nová', 'Jan Rychlý', 'Petra Svobodová', 'Martin Dvořák'];
    renderAthleteSelect();

    state.leaderboard = [
        { name: 'Petra Svobodová', totalPoints: 15, completedDays: 8 },
        { name: 'Martin Dvořák', totalPoints: 12, completedDays: 6 },
        { name: 'Jan Rychlý', totalPoints: 10, completedDays: 5 },
        { name: 'Anna Nová', totalPoints: 4, completedDays: 2 }
    ];
    renderLeaderboard();
}

// === INICIALIZACE ===

function init() {
    // Event listenery - navigace
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', handleNavigation);
    });

    // Event listenery - přepínač dnů
    document.querySelectorAll('.day-switch-btn').forEach(btn => {
        btn.addEventListener('click', handleDaySwitcher);
    });


    // Event listenery - formulář
    document.getElementById('athlete-select').addEventListener('change', handleAthleteSelect);

    document.querySelectorAll('.day-btn').forEach(btn => {
        btn.addEventListener('click', handleDaySelect);
    });

    document.getElementById('completed-checkbox').addEventListener('change', updateSubmitButton);
    document.getElementById('value-input').addEventListener('input', updateSubmitButton);
    document.getElementById('submit-btn').addEventListener('click', handleSubmit);

    // Event listenery - žebříček
    document.getElementById('refresh-btn').addEventListener('click', () => loadLeaderboard(true));

    // Event listener - chyba
    document.getElementById('error-close').addEventListener('click', handleErrorClose);

    // Inicializace UI
    renderChallengeView();
    updateSelectedDate();

    // Načíst data
    if (API_URL === 'VLOŽTE_SVOU_GOOGLE_APPS_SCRIPT_URL') {
        console.log('Demo mód - API URL není nastavena');
        loadDemoData();
    } else {
        loadAthletes();
    }
}

document.addEventListener('DOMContentLoaded', init);
