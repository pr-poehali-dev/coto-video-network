"""
Business: Управление прямыми трансляциями
Args: event - HTTP событие с данными трансляции
      context - контекст с request_id
Returns: HTTP ответ с данными трансляции или списком активных эфиров
"""

import json
import os
import secrets
from typing import Dict, Any
from datetime import datetime
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
        cur.execute(
            """
            SELECT s.*, u.username as channel_name, u.avatar_url as channel_avatar
            FROM streams s
            LEFT JOIN users u ON s.user_id = u.id
            WHERE s.is_live = true
            ORDER BY s.started_at DESC
            LIMIT 20
            """
        )
        streams = [dict(row) for row in cur.fetchall()]
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'streams': streams}, default=str)
        }
    
    elif method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        
        if action == 'start':
            user_id = body_data.get('user_id')
            title = body_data.get('title')
            description = body_data.get('description', '')
            
            stream_key = secrets.token_urlsafe(32)
            rtmp_url = f"rtmp://stream.cotovideo.ru/live/{stream_key}"
            
            cur.execute(
                """
                INSERT INTO streams (user_id, title, description, stream_key, rtmp_url, is_live, started_at)
                VALUES (%s, %s, %s, %s, %s, true, NOW())
                RETURNING id, title, stream_key, rtmp_url, is_live
                """,
                (user_id, title, description, stream_key, rtmp_url)
            )
            
            stream = dict(cur.fetchone())
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
                    'stream': stream
                }, default=str)
            }
        
        elif action == 'stop':
            stream_id = body_data.get('stream_id')
            
            cur.execute(
                "UPDATE streams SET is_live = false, ended_at = NOW() WHERE id = %s",
                (stream_id,)
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
        
        elif action == 'join':
            stream_id = body_data.get('stream_id')
            user_id = body_data.get('user_id')
            
            cur.execute(
                "INSERT INTO stream_viewers (stream_id, user_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                (stream_id, user_id)
            )
            cur.execute(
                "UPDATE streams SET viewers_count = viewers_count + 1 WHERE id = %s",
                (stream_id,)
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
