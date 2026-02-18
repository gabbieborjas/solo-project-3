const API_URL = "/api/workouts";
let currentPage = 1;

// Requirement 5: Page size stored in COOKIE
function getPageSize() {
    const match = document.cookie.match(/pageSize=(\d+)/);
    return match ? parseInt(match[1]) : 10;
}

function updatePageSize(newSize) {
    document.cookie = `pageSize=${newSize}; path=/; max-age=31536000`;
    currentPage = 1;
    loadData();
}

async function loadData() {
    const limit = getPageSize();
    const offset = (currentPage - 1) * limit;
    const cat = document.getElementById('filter-category').value;
    const sort = document.getElementById('sort-by').value;

    try {
        const res = await fetch(`${API_URL}?limit=${limit}&offset=${offset}&category=${cat}&sort=${sort}`);
        const result = await res.json();
        render(result.data, result.total, result.total_minutes);
    } catch (err) {
        console.error("Connection error:", err);
    }
}

function render(items, total, totalMinutes) {
    const grid = document.getElementById('grid');
    // Requirement 4: Images with Placeholder handling
    grid.innerHTML = items.map(w => `
        <div class="card">
            <img src="${w.image_url}" onerror="this.src='https://via.placeholder.com/300x200?text=Workout'" alt="${w.name}">
            <h3>${w.name}</h3>
            <p><strong>${w.category}</strong> | ${w.duration} mins</p>
            <button onclick="deleteItem(${w.id})" class="del-btn">Delete</button>
        </div>
    `).join('');

    // Requirement 4: Stats View Updates
    document.getElementById('stat-total').innerText = total;
    document.getElementById('stat-pagesize').innerText = getPageSize();
    document.getElementById('stat-minutes').innerText = totalMinutes;

    const totalPages = Math.ceil(total / getPageSize());
    document.getElementById('page-info').innerText = `Page ${currentPage} of ${totalPages || 1}`;
}

// Requirement 4: Delete Confirmation
async function deleteItem(id) {
    if (confirm("Permanently delete this record from SQL?")) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        loadData();
    }
}

function changePage(dir) {
    currentPage += dir;
    loadData();
}

function showSection(id) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

// Initial Call
document.getElementById('page-size-select').value = getPageSize();
loadData();
