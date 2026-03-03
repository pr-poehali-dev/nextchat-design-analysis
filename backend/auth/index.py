import json
import os
import hashlib
import secrets
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
}

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def get_user_by_token(cur, token: str):
    cur.execute("""
        SELECT u.id, u.name, u.username, u.avatar, u.status
        FROM sessions s
        JOIN users u ON u.id = s.user_id
        WHERE s.token = %s AND s.expires_at > NOW()
    """, (token,))
    return cur.fetchone()

def handler(event: dict, context) -> dict:
    """Регистрация, вход и получение профиля пользователя."""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    try:
        method = event.get('httpMethod', 'GET')
        params = event.get('queryStringParameters') or {}
        action = params.get('action', '')
        body = json.loads(event.get('body') or '{}')

        # GET /auth — получить текущего пользователя по токену
        if method == 'GET':
            token = (event.get('headers') or {}).get('X-Authorization', '').replace('Bearer ', '')
            if not token:
                return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Не авторизован'})}
            row = get_user_by_token(cur, token)
            if not row:
                return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Токен недействителен'})}
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({
                'id': row[0], 'name': row[1], 'username': row[2], 'avatar': row[3], 'status': row[4]
            }, ensure_ascii=False)}

        # POST ?action=register
        if action == 'register':
            name = body.get('name', '').strip()
            username = body.get('username', '').strip().lower()
            password = body.get('password', '')
            if not name or not username or not password:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Заполните все поля'})}
            if len(password) < 6:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Пароль минимум 6 символов'})}
            avatar = ''.join([w[0].upper() for w in name.split()[:2]])

            cur.execute("SELECT id FROM users WHERE username = %s", (username,))
            if cur.fetchone():
                return {'statusCode': 409, 'headers': CORS, 'body': json.dumps({'error': 'Имя пользователя уже занято'})}

            cur.execute(
                "INSERT INTO users (name, username, password_hash, avatar) VALUES (%s, %s, %s, %s) RETURNING id",
                (name, username, hash_password(password), avatar)
            )
            user_id = cur.fetchone()[0]
            token = secrets.token_hex(32)
            cur.execute("INSERT INTO sessions (user_id, token) VALUES (%s, %s)", (user_id, token))
            conn.commit()
            return {'statusCode': 201, 'headers': CORS, 'body': json.dumps({
                'token': token, 'user': {'id': user_id, 'name': name, 'username': username, 'avatar': avatar}
            }, ensure_ascii=False)}

        # POST ?action=login
        if action == 'login':
            username = body.get('username', '').strip().lower()
            password = body.get('password', '')
            if not username or not password:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Введите логин и пароль'})}

            cur.execute(
                "SELECT id, name, username, avatar, status FROM users WHERE username = %s AND password_hash = %s",
                (username, hash_password(password))
            )
            row = cur.fetchone()
            if not row:
                return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Неверный логин или пароль'})}

            token = secrets.token_hex(32)
            cur.execute("INSERT INTO sessions (user_id, token) VALUES (%s, %s)", (row[0], token))
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({
                'token': token, 'user': {'id': row[0], 'name': row[1], 'username': row[2], 'avatar': row[3], 'status': row[4]}
            }, ensure_ascii=False)}

        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Маршрут не найден'})}

    finally:
        cur.close()
        conn.close()