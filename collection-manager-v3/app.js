const API_URL = "/api/workouts";
let allWorkouts = [];
let currentPage = 1;

// Requirement 5: Get page size from Cookie or default to 10
function getPageSize() {
    const match = document.cookie.match(/pageSize=(\d+)/);
    return match ? parseInt(match[1]) : 10;
}

// Requirement 5: Set Cookie when page size changes
function updatePageSize(newSize) {
    document.cookie = `pageSize=${newSize}; path=/; max-age=31536000`;
    document.getElementById('stat-pagesize').innerText = newSize;
    currentPage = 1;
    loadData();
}

async function loadData() {
    const limit = getPageSize();
    const offset = (currentPage - 1) * limit;
    const category = document.getElementById('filter-category').value;
    const sort = document.getElementById('sort-by').value;

    try {
        // Calling your Python API (Requirement 5: Filter, Sort, Paging)
        const res = await fetch(`${API_URL}?limit=${limit}&offset=${offset}&category=${category}&sort=${sort}`);
        const result = await res.json();
        
        allWorkouts = result.data;
        render(result.data, result.total);
    } catch (err) {
        console.error("SQL Connection Failed:", err);
    }
}

function render(items, total) {
    const grid = document.getElementById('grid');
    // Requirement 4: Image requirement with placeholder for broken links
    grid.innerHTML = items.map(w => `
        <div class="card">
            <img src="${w.image_url}" onerror="this.src='https://via.placeholder.com/300x200?text=Fitness+Tracker'" alt="${w.name}">
            <h3>${w.name}</h3>
            <p><strong>${w.category}</strong> | ${w.duration} mins</p>
            <div style="margin-top:10px;">
                <button onclick="deleteItem(${w.id})">Delete</button>
            </div>
        </div>
    `).join('');

    // Update Stats View (Requirement 4)
    document.getElementById('stat-total').innerText = total;
    document.getElementById('stat-pagesize').innerText = getPageSize();
    
    // Pagination logic
    const totalPages = Math.ceil(total / getPageSize());
    document.getElementById('page-info').innerText = `Page ${currentPage} of ${totalPages || 1}`;
}

// Requirement 4: Delete confirmation
async function deleteItem(id) {
    if (confirm("Are you sure you want to delete this from the SQL database?")) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        loadData();
    }
}

// Navigation logic for sections
function showSection(id) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

// Initial Load
document.getElementById('page-size-select').value = getPageSize();
loadData();
