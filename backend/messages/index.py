import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """Получение истории и отправка сообщений в чат."""

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
        params = event.get('queryStringParameters') or {}

        if method == 'GET':
            chat_id = params.get('chat_id')
            if not chat_id:
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'chat_id required'})}
            limit = int(params.get('limit', 50))
            offset = int(params.get('offset', 0))
            cur.execute("""
                SELECT id, text, is_own, status, file_name, file_size, file_type, file_url, sent_at
                FROM messages
                WHERE chat_id = %s
                ORDER BY sent_at ASC
                LIMIT %s OFFSET %s
            """, (int(chat_id), limit, offset))
            rows = cur.fetchall()
            msgs = []
            for r in rows:
                msg = {
                    'id': r[0], 'text': r[1], 'isOwn': r[2],
                    'status': r[3],
                    'time': r[8].strftime('%H:%M') if r[8] else '',
                }
                if r[6]:
                    msg['file'] = {'name': r[4], 'size': r[5], 'type': r[6], 'url': r[7] or ''}
                msgs.append(msg)
            return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'messages': msgs}, ensure_ascii=False)}

        if method == 'POST':
            body = json.loads(event.get('body') or '{}')
            chat_id = body.get('chat_id')
            text = body.get('text', '').strip()
            file_data = body.get('file')
            if not chat_id:
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'chat_id required'})}
            if not text and not file_data:
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'text or file required'})}

            if file_data:
                cur.execute("""
                    INSERT INTO messages (chat_id, text, is_own, status, file_name, file_size, file_type, file_url)
                    VALUES (%s, %s, true, 'sent', %s, %s, %s, %s) RETURNING id, sent_at
                """, (chat_id, text or None, file_data.get('name'), file_data.get('size'), file_data.get('type'), file_data.get('url')))
            else:
                cur.execute("""
                    INSERT INTO messages (chat_id, text, is_own, status)
                    VALUES (%s, %s, true, 'sent') RETURNING id, sent_at
                """, (chat_id, text))

            row = cur.fetchone()
            conn.commit()
            result = {
                'id': row[0],
                'text': text or None,
                'isOwn': True,
                'status': 'sent',
                'time': row[1].strftime('%H:%M'),
            }
            if file_data:
                result['file'] = file_data
            return {'statusCode': 201, 'headers': cors, 'body': json.dumps(result, ensure_ascii=False)}

    finally:
        cur.close()
        conn.close()
