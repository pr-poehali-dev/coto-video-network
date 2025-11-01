"""
Business: Получение списка видео и взаимодействие с ними
Args: event - HTTP событие с методом, параметрами запроса
      context - контекст с request_id
Returns: HTTP ответ со списком видео или результатом действия
"""

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    if method == 'GET':
        params = event.get('queryStringParameters', {}) or {}
        video_type = params.get('type', 'all')
        
        if video_type == 'shorts':
            query = """
                SELECT v.*, u.username as channel_name, u.avatar_url as channel_avatar,
                       (SELECT COUNT(*) FROM likes WHERE video_id = v.id) as likes_count,
                       (SELECT COUNT(*) FROM comments WHERE video_id = v.id) as comments_count
                FROM videos v
                LEFT JOIN users u ON v.user_id = u.id
                WHERE v.is_short = true
                ORDER BY v.created_at DESC
                LIMIT 20
            """
        else:
            query = """
                SELECT v.*, u.username as channel_name, u.avatar_url as channel_avatar,
                       (SELECT COUNT(*) FROM likes WHERE video_id = v.id) as likes_count,
                       (SELECT COUNT(*) FROM comments WHERE video_id = v.id) as comments_count
                FROM videos v
                LEFT JOIN users u ON v.user_id = u.id
                WHERE v.is_short = false
                ORDER BY v.created_at DESC
                LIMIT 50
            """
        
        cur.execute(query)
        videos = [dict(row) for row in cur.fetchall()]
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'videos': videos}, default=str)
        }
    
    elif method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        video_id = body_data.get('video_id')
        user_id = body_data.get('user_id')
        
        if action == 'like':
            cur.execute(
                "INSERT INTO likes (user_id, video_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                (user_id, video_id)
            )
            conn.commit()
            
            cur.execute("SELECT COUNT(*) as count FROM likes WHERE video_id = %s", (video_id,))
            likes_count = cur.fetchone()['count']
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'likes': likes_count})
            }
        
        elif action == 'view':
            cur.execute("UPDATE videos SET views = views + 1 WHERE id = %s", (video_id,))
            cur.execute("INSERT INTO watch_history (user_id, video_id) VALUES (%s, %s)", (user_id, video_id))
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True})
            }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'})
    }
