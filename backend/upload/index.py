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
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'POST':
        headers = event.get('headers', {})
        user_id = headers.get('X-User-Id') or headers.get('x-user-id')
        
        if not user_id:
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Необходима авторизация'})
            }
        
        body_data = json.loads(event.get('body', '{}'))
        title = body_data.get('title', 'Без названия')
        video_base64 = body_data.get('video')
        thumbnail_base64 = body_data.get('thumbnail')
        
        if not video_base64:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Видео не найдено'})
            }
        
        video_data = base64.b64decode(video_base64)
        video_id = str(uuid.uuid4())
        video_key = f'shorts/{video_id}.mp4'
        
        s3_client = boto3.client(
            's3',
            endpoint_url=os.environ.get('S3_ENDPOINT'),
            aws_access_key_id=os.environ.get('S3_ACCESS_KEY'),
            aws_secret_access_key=os.environ.get('S3_SECRET_KEY')
        )
        
        bucket = os.environ.get('S3_BUCKET', 'cotovideo')
        
        s3_client.put_object(
            Bucket=bucket,
            Key=video_key,
            Body=video_data,
            ContentType='video/mp4'
        )
        
        video_url = f"{os.environ.get('S3_ENDPOINT')}/{bucket}/{video_key}"
        
        thumbnail_url = None
        if thumbnail_base64:
            thumbnail_data = base64.b64decode(thumbnail_base64)
            thumbnail_key = f'shorts/thumbnails/{video_id}.jpg'
            
            s3_client.put_object(
                Bucket=bucket,
                Key=thumbnail_key,
                Body=thumbnail_data,
                ContentType='image/jpeg'
            )
            
            thumbnail_url = f"{os.environ.get('S3_ENDPOINT')}/{bucket}/{thumbnail_key}"
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute(
            "SELECT username, avatar_url FROM users WHERE id = %s",
            (user_id,)
        )
        user = cur.fetchone()
        
        if not user:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Пользователь не найден'})
            }
        
        cur.execute(
            """INSERT INTO videos 
            (user_id, title, video_url, thumbnail_url, video_type, channel_name, channel_avatar, duration) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s) 
            RETURNING id""",
            (int(user_id), title, video_url, thumbnail_url, 'shorts', 
             user['username'], user['avatar_url'], '00:00:30')
        )
        
        video_db_id = cur.fetchone()['id']
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
                'id': video_db_id,
                'video_url': video_url,
                'thumbnail_url': thumbnail_url,
                'message': 'Видео успешно загружено'
            })
        }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'})
    }