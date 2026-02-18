import os
import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='.')
CORS(app)

# Requirement 3: SQL Database (PostgreSQL) + Env Vars
DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

# --- SERVING FRONTEND ---
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

# --- API ROUTES ---
@app.route('/api/workouts', methods=['GET'])
def get_workouts():
    # Requirement 5: Filtering, Sorting, and Paging
    cat = request.args.get('category', '')
    sort = request.args.get('sort', 'name')
    limit = int(request.args.get('limit', 10))
    offset = int(request.args.get('offset', 0))

    conn = get_db()
    cur = conn.cursor()
    # SQL query handling filtering and sorting
    query = f"SELECT * FROM workouts WHERE category ILIKE %s ORDER BY {sort} LIMIT %s OFFSET %s"
    cur.execute(query, ('%' + cat + '%', limit, offset))
    data = cur.fetchall()
    
    cur.execute("SELECT COUNT(*) FROM workouts")
    total = cur.fetchone()['count']
    
    # Requirement 4: Domain Statistic (Total Minutes)
    cur.execute("SELECT SUM(duration) as total_mins FROM workouts")
    minutes = cur.fetchone()['total_mins'] or 0
    
    cur.close()
    conn.close()
    return jsonify({"data": data, "total": total, "total_minutes": minutes})

# Requirement 5: Full CRUD (Create/Delete shown)
@app.route('/api/workouts', methods=['POST'])
def add():
    d = request.json
    conn = get_db()
    cur = conn.cursor()
    cur.execute("INSERT INTO workouts (name, category, duration, image_url) VALUES (%s, %s, %s, %s)",
                (d['name'], d['category'], d['duration'], d['image_url']))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"status": "success"})

@app.route('/api/workouts/<int:id>', methods=['DELETE'])
def delete(id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM workouts WHERE id = %s", (id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"status": "deleted"})

if __name__ == '__main__':
    # Render requires binding to 0.0.0.0 and the PORT environment variable
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
