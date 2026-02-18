const API_URL = "/api/workouts"; // Points to your Render backend via domain proxy
let currentPage = 1;

// Requirement 5: Get page size from Cookie or default to 10
function getPageSize() {
    const match = document.cookie.match(/pageSize=(\d+)/);
    return match ? parseInt(match[1]) : 10;
}

async function loadData() {
    const limit = getPageSize();
    const offset = (currentPage - 1) * limit;
    const category = document.getElementById('filter-category').value;
    const sort = document.getElementById('sort-by').value;

    try {
        const res = await fetch(`${API_URL}?limit=${limit}&offset=${offset}&category=${category}&sort=${sort}`);
        const result = await res.json();
        render(result.data, result.total);
    } catch (err) {
        console.error("Database connection failed", err);
    }
}

function render(items, total) {
    const grid = document.getElementById('grid');
    grid.innerHTML = items.map(w => `
        <div class="card">
            <img src="${w.image_url}" onerror="this.src='https://via.placeholder.com/300x200?text=Fitness+Tracker'" alt="${w.name}">
            <h3>${w.name}</h3>
            <p><strong>${w.category}</strong> | ${w.duration} mins</p>
            <div class="actions">
                <button onclick="deleteItem(${w.id})">Delete</button>
            </div>
        </div>
    `).join('');

    // Update Stats View
    document.getElementById('stat-total').innerText = total;
    document.getElementById('stat-pagesize').innerText = getPageSize();
}

// Requirement 5: Set Cookie when page size changes
function updatePageSize(newSize) {
    document.cookie = `pageSize=${newSize}; path=/; max-age=31536000`;
    currentPage = 1;
    loadData();
}

async function deleteItem(id) {
    if (confirm("Confirm deletion from Production Database?")) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        loadData();
    }
}

loadData();