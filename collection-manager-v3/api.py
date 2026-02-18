import os
import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='.')
CORS(app)

# Requirement 3: Use Environment Variables for secrets
DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

# ==========================================
# 1. SERVING FRONTEND (Production Requirement)
# ==========================================

@app.route('/')
def index():
    # Serves your index.html as the home page of fitnesstracker.online
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    # Serves app.js, style.css, and images
    return send_from_directory('.', path)

# ==========================================
# 2. API ROUTES (CRUD + Paging + Sorting)
# ==========================================

@app.route('/api/workouts', methods=['GET'])
def get_workouts():
    # Requirement 5: Handling paging, filtering, and sorting in SQL
    category_filter = request.args.get('category', '')
    sort_by = request.args.get('sort', 'name') # Default sort by name
    limit = int(request.args.get('limit', 10))
    offset = int(request.args.get('offset', 0))

    # Safety check for sort column to prevent SQL injection
    allowed_sorts = ['name', 'duration', 'category']
    if sort_by not in allowed_sorts:
        sort_by = 'name'

    conn = get_db_connection()
    cur = conn.cursor()
    
    # SQL query for filtering and sorting
    query = f"SELECT * FROM workouts WHERE category ILIKE %s ORDER BY {sort_by} LIMIT %s OFFSET %s"
    cur.execute(query, ('%' + category_filter + '%', limit, offset))
    workouts = cur.fetchall()
    
    # Get total count for pagination stats
    cur.execute("SELECT COUNT(*) FROM workouts")
    total_count = cur.fetchone()['count']
    
    cur.close()
    conn.close()
    return jsonify({"data": workouts, "total": total_count})

@app.route('/api/workouts', methods=['POST'])
def add_workout():
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO workouts (name, category, duration, image_url) VALUES (%s, %s, %s, %s)",
        (data['name'], data['category'], data['duration'], data['image_url'])
    )
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"status": "success"}), 201

@app.route('/api/workouts/<int:workout_id>', methods=['DELETE'])
def delete_workout(workout_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM workouts WHERE id = %s", (workout_id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"status": "deleted"})

if __name__ == '__main__':
    # Render provides the port in an environment variable
    port = int(os.environ.get("PORT", 5000))
    # You MUST bind to 0.0.0.0 for Render to 'see' the app
    app.run(host='0.0.0.0', port=port)
