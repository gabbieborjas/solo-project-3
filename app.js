// Configuration
const API_URL = "/api/workouts";
let currentPage = 1;

/**
 * Requirement 5: PERSISTENCE
 * Retrieves page size from cookie or defaults to 10 if not found.
 */
function getPageSize() {
    const match = document.cookie.match(/pageSize=(\d+)/);
    return match ? parseInt(match[1]) : 10;
}

/**
 * Requirement 5: COOKIE STORAGE
 * Saves the user's page size preference to a cookie and reloads data.
 */
function updatePageSize(newSize) {
    document.cookie = `pageSize=${newSize}; path=/; max-age=31536000`;
    currentPage = 1;
    loadData();
}

/**
 * Requirement 5: PAGING, FILTERING, & SORTING
 * Fetches data from your Python SQL API based on current UI state.
 */
async function loadData() {
    const limit = getPageSize();
    const offset = (currentPage - 1) * limit;
    const category = document.getElementById('filter-category').value;
    const sort = document.getElementById('sort-by').value;

    try {
        const response = await fetch(`${API_URL}?limit=${limit}&offset=${offset}&category=${category}&sort=${sort}`);
        const result = await response.json();
        
        // Update the UI with data returned from SQL
        render(result.data, result.total, result.total_minutes);
    } catch (err) {
        console.error("SQL Connection Error:", err);
    }
}

/**
 * Requirement 4: LIST VIEW & IMAGE REQUIREMENT
 * Renders the small, separate cards with placeholder handling for images.
 */
function render(items, total, totalMinutes) {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';

    items.forEach(w => {
        const card = document.createElement('div');
        card.className = 'card'; // This uses your teal/coral CSS
        card.innerHTML = `
            <img src="${w.image_url}" 
                 onerror="this.src='https://via.placeholder.com/300x200?text=Fitness+Tracker'" 
                 alt="${w.name}">
            <h3>${w.name}</h3>
            <p><strong>${w.category}</strong> | ${w.duration} mins</p>
            <div class="card-actions">
                <button onclick="deleteItem(${w.id})" class="btn-delete">Delete</button>
            </div>
        `;
        grid.appendChild(card);
    });

    // Requirement 4: STATS VIEW
    // Updates the Production Dashboard with live SQL stats
    document.getElementById('stat-total').innerText = total;
    document.getElementById('stat-pagesize').innerText = getPageSize();
    document.getElementById('stat-minutes').innerText = totalMinutes;

    // Handle Pagination Text
    const totalPages = Math.ceil(total / getPageSize());
    document.getElementById('page-info').innerText = `Page ${currentPage} of ${totalPages || 1}`;
}

/**
 * Requirement 4: DELETE CONFIRMATION
 * Prompts the user before removing a record from the SQL database.
 */
async function deleteItem(id) {
    if (confirm("Are you sure you want to permanently delete this workout from the database?")) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            loadData();
        } catch (err) {
            alert("Error deleting record.");
        }
    }
}

/**
 * NAVIGATION LOGIC
 * Fixes the "buttons not working" issue by managing section visibility.
 */
window.showSection = function(id) {
    // Hide all sections first
    document.getElementById('list-view').classList.add('hidden');
    document.getElementById('stats-view').classList.add('hidden');
    if(document.getElementById('form-view')) {
        document.getElementById('form-view').classList.add('hidden');
    }

    // Show the requested section
    document.getElementById(id).classList.remove('hidden');
};

/**
 * PAGINATION CONTROLS
 */
window.changePage = function(direction) {
    currentPage += direction;
    // Prevent going below page 1
    if (currentPage < 1) currentPage = 1;
    loadData();
};

// INITIALIZATION
// Restores saved page size from cookie on load
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('page-size-select').value = getPageSize();
    loadData();
});
