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
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
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
        
        elif action == 'reset_password':
            email = body_data.get('email')
            
            cur.execute(
                "SELECT id FROM users WHERE email = %s",
                (email,)
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
            
            reset_token = secrets.token_urlsafe(32)
            
            cur.execute(
                "UPDATE users SET reset_token = %s, reset_token_expires = NOW() + INTERVAL '1 hour' WHERE email = %s",
                (reset_token, email)
            )
            conn.commit()
            
            smtp_host = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
            smtp_port = int(os.environ.get('SMTP_PORT', '587'))
            smtp_user = os.environ.get('SMTP_USER', '')
            smtp_password = os.environ.get('SMTP_PASSWORD', '')
            
            if smtp_user and smtp_password:
                msg = MIMEMultipart('alternative')
                msg['Subject'] = 'Восстановление пароля CotoVideo'
                msg['From'] = smtp_user
                msg['To'] = email
                
                reset_link = f"https://preview--coto-video-network.poehali.dev/reset?token={reset_token}"
                html = f"""
                <html>
                  <body>
                    <h2>Восстановление пароля</h2>
                    <p>Вы запросили восстановление пароля для CotoVideo.</p>
                    <p>Перейдите по ссылке для создания нового пароля:</p>
                    <p><a href="{reset_link}">{reset_link}</a></p>
                    <p>Ссылка действительна 1 час.</p>
                  </body>
                </html>
                """
                
                part = MIMEText(html, 'html')
                msg.attach(part)
                
                with smtplib.SMTP(smtp_host, smtp_port) as server:
                    server.starttls()
                    server.login(smtp_user, smtp_password)
                    server.send_message(msg)
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Письмо с инструкциями отправлено на email'})
            }
        
        elif action == 'confirm_reset':
            token = body_data.get('token')
            new_password = body_data.get('password')
            
            password_hash = hashlib.sha256(new_password.encode()).hexdigest()
            
            cur.execute(
                "UPDATE users SET password_hash = %s, reset_token = NULL, reset_token_expires = NULL WHERE reset_token = %s AND reset_token_expires > NOW() RETURNING id, email, username, avatar_url",
                (password_hash, token)
            )
            user = cur.fetchone()
            conn.commit()
            
            cur.close()
            conn.close()
            
            if user:
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'message': 'Пароль успешно изменен'})
                }
            else:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Неверный или истекший токен'})
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