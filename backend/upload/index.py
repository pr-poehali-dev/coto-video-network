"""
Business: Загрузка видео и создание записей в базе данных
Args: event - HTTP событие с данными видео
      context - контекст с request_id
Returns: HTTP ответ с данными загруженного видео
"""

import json
import os
import secrets
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
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        user_id = body_data.get('user_id')
        title = body_data.get('title')
        description = body_data.get('description', '')
        thumbnail_url = body_data.get('thumbnail_url', '')
        video_url = body_data.get('video_url', '')
        duration = body_data.get('duration', '0:00')
        is_short = body_data.get('is_short', False)
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute(
            """
            INSERT INTO videos (user_id, title, description, thumbnail_url, video_url, duration, is_short)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, title, thumbnail_url, video_url, created_at
            """,
            (user_id, title, description, thumbnail_url, video_url, duration, is_short)
        )
        
        video = dict(cur.fetchone())
        conn.commit()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'video': video
            }, default=str)
        }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'})
    }
