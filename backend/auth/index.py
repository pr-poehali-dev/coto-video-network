"""
Business: Авторизация и регистрация пользователей CotoVideo
Args: event - HTTP событие с методом, телом запроса
      context - контекст с request_id, function_name
Returns: HTTP ответ с токеном или ошибкой
"""

import json
import os
import hashlib
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
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if action == 'register':
            email = body_data.get('email')
            password = body_data.get('password')
            username = body_data.get('username', email.split('@')[0])
            
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            cur.execute(
                "INSERT INTO users (email, password_hash, username) VALUES (%s, %s, %s) RETURNING id, email, username, avatar_url",
                (email, password_hash, username)
            )
            user = dict(cur.fetchone())
            conn.commit()
            
            token = secrets.token_urlsafe(32)
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'user': user,
                    'token': token
                })
            }
        
        elif action == 'login':
            email = body_data.get('email')
            password = body_data.get('password')
            
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            cur.execute(
                "SELECT id, email, username, avatar_url FROM users WHERE email = %s AND password_hash = %s",
                (email, password_hash)
            )
            user = cur.fetchone()
            
            cur.close()
            conn.close()
            
            if user:
                token = secrets.token_urlsafe(32)
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'user': dict(user),
                        'token': token
                    })
                }
            else:
                return {
                    'statusCode': 401,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Неверный email или пароль'})
                }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'})
    }
