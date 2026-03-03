import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """Получение списка чатов и создание нового чата."""

    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    try:
        method = event.get('httpMethod', 'GET')

        if method == 'GET':
            cur.execute("""
                SELECT
                    c.id, c.name, c.avatar, c.is_group, c.is_pinned, c.online,
                    m.text AS last_text,
                    m.file_type,
                    m.sent_at AS last_time,
                    COUNT(m2.id) FILTER (WHERE m2.is_own = false) AS unread
                FROM chats c
                LEFT JOIN LATERAL (
                    SELECT text, file_type, sent_at
                    FROM messages
                    WHERE chat_id = c.id
                    ORDER BY sent_at DESC
                    LIMIT 1
                ) m ON true
                LEFT JOIN messages m2 ON m2.chat_id = c.id AND m2.is_own = false AND m2.status != 'read'
                GROUP BY c.id, c.name, c.avatar, c.is_group, c.is_pinned, c.online, m.text, m.file_type, m.sent_at
                ORDER BY c.is_pinned DESC, COALESCE(m.sent_at, c.created_at) DESC
            """)
            rows = cur.fetchall()
            chats = []
            for r in rows:
                last_msg = r[6] or ''
                if not last_msg and r[7]:
                    types = {'image': '📷 Фото', 'video': '🎥 Видео', 'doc': '📎 Документ'}
                    last_msg = types.get(r[7], '📎 Файл')
                chats.append({
                    'id': r[0], 'name': r[1], 'avatar': r[2],
                    'isGroup': r[3], 'pinned': r[4], 'online': r[5],
                    'lastMessage': last_msg,
                    'time': r[8].strftime('%H:%M') if r[8] else '',
                    'unread': r[9] or 0,
                })
            return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'chats': chats}, ensure_ascii=False)}

        if method == 'POST':
            body = json.loads(event.get('body') or '{}')
            name = body.get('name', '').strip()
            avatar = body.get('avatar', name[:2].upper() if name else 'НК')
            is_group = body.get('isGroup', False)
            if not name:
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'name required'})}
            cur.execute(
                "INSERT INTO chats (name, avatar, is_group) VALUES (%s, %s, %s) RETURNING id",
                (name, avatar, is_group)
            )
            chat_id = cur.fetchone()[0]
            conn.commit()
            return {'statusCode': 201, 'headers': cors, 'body': json.dumps({'id': chat_id, 'name': name, 'avatar': avatar})}

    finally:
        cur.close()
        conn.close()
