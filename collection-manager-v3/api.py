import os
import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Requirement 3: Secrets stored in Environment Variables
DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

@app.route('/api/workouts', methods=['GET'])
def get_workouts():
    # Requirement 5: Filter, Sort, and Paging
    category_filter = request.args.get('category', '')
    sort_by = request.args.get('sort', 'name')
    limit = int(request.args.get('limit', 10))
    offset = int(request.args.get('offset', 0))

    conn = get_db()
    cur = conn.cursor()
    
    query = "SELECT * FROM workouts WHERE category ILIKE %s ORDER BY " + sort_by + " LIMIT %s OFFSET %s"
    cur.execute(query, ('%' + category_filter + '%', limit, offset))
    records = cur.fetchall()
    
    cur.execute("SELECT COUNT(*) FROM workouts")
    total_count = cur.fetchone()['count']
    
    cur.close()
    conn.close()
    return jsonify({"data": records, "total": total_count})

@app.route('/api/workouts', methods=['POST'])
def add_workout():
    d = request.json
    conn = get_db()
    cur = conn.cursor()
    cur.execute("INSERT INTO workouts (name, category, duration, image_url) VALUES (%s, %s, %s, %s)",
                (d['name'], d['category'], d['duration'], d['image_url']))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"status": "success"}), 201

@app.route('/api/workouts/<int:id>', methods=['DELETE'])
def delete_workout(id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM workouts WHERE id = %s", (id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"status": "deleted"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 5000)))