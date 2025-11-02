"""
Business: API для работы с видео - получение списка, просмотр конкретного видео, лайки
Args: event - HTTP событие с методом GET/POST
      context - контекст с request_id
Returns: HTTP ответ с данными видео или результатом действия
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
        params = event.get('queryStringParameters') or {}
        video_id = params.get('id')
        video_type = params.get('type')
        
        if video_id:
            cur.execute(
                """SELECT v.*, 
                   (SELECT COUNT(*) FROM video_likes WHERE video_id = v.id) as likes_count,
                   (SELECT COUNT(*) FROM video_views WHERE video_id = v.id) as views
                   FROM videos v WHERE v.id = %s""",
                (video_id,)
            )
            video = cur.fetchone()
            
            cur.close()
            conn.close()
            
            if video:
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'video': dict(video)})
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Видео не найдено'})
                }
        
        if video_type == 'shorts':
            query = """SELECT v.*, 
                       (SELECT COUNT(*) FROM video_likes WHERE video_id = v.id) as likes_count,
                       (SELECT COUNT(*) FROM video_views WHERE video_id = v.id) as comments_count
                       FROM videos v 
                       WHERE v.video_type = 'shorts'
                       ORDER BY v.created_at DESC 
                       LIMIT 50"""
        else:
            query = """SELECT v.*, 
                       (SELECT COUNT(*) FROM video_likes WHERE video_id = v.id) as likes_count,
                       (SELECT COUNT(*) FROM video_views WHERE video_id = v.id) as views
                       FROM videos v 
                       WHERE v.video_type = 'video' OR v.video_type IS NULL
                       ORDER BY v.created_at DESC 
                       LIMIT 50"""
        
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
            'body': json.dumps({'videos': videos})
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        
        if action == 'like':
            video_id = body_data.get('video_id')
            user_id = body_data.get('user_id', 1)
            
            cur.execute(
                "SELECT * FROM video_likes WHERE video_id = %s AND user_id = %s",
                (video_id, user_id)
            )
            existing = cur.fetchone()
            
            if existing:
                cur.execute(
                    "DELETE FROM video_likes WHERE video_id = %s AND user_id = %s",
                    (video_id, user_id)
                )
                liked = False
            else:
                cur.execute(
                    "INSERT INTO video_likes (video_id, user_id) VALUES (%s, %s)",
                    (video_id, user_id)
                )
                liked = True
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'liked': liked})
            }
        
        elif action == 'view':
            video_id = body_data.get('video_id')
            user_id = body_data.get('user_id', 1)
            
            cur.execute(
                "INSERT INTO video_views (video_id, user_id) VALUES (%s, %s)",
                (video_id, user_id)
            )
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
