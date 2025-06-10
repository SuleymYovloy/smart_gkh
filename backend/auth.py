from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required
from python_keycloak import KeycloakOpenID
from app import db
from models import User
from flask_cors import CORS
from config import KEYCLOAK_CONFIG

auth_bp = Blueprint('auth', __name__)
CORS(auth_bp)

# Keycloak клиент
keycloak_openid = KeycloakOpenID(
    server_url=KEYCLOAK_CONFIG['server_url'],
    client_id=KEYCLOAK_CONFIG['client_id'],
    realm_name=KEYCLOAK_CONFIG['realm_name'],
    client_secret_key=KEYCLOAK_CONFIG['client_secret']
)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Перенаправляем на Keycloak для аутентификации"""
    auth_url = keycloak_openid.auth_url(
        redirect_uri="http://localhost:5000/auth/callback",
        scope="openid",
        state="some_state"
    )
    return jsonify({'auth_url': auth_url})

@auth_bp.route('/callback', methods=['GET'])
def callback():
    """Обработка callback от Keycloak"""
    code = request.args.get('code')
    if not code:
        return jsonify({'error': 'Authorization code missing'}), 400
    
    try:
        # Получаем токены от Keycloak
        tokens = keycloak_openid.token(
            grant_type="authorization_code",
            code=code,
            redirect_uri="http://localhost:5000/auth/callback"
        )
        
        # Получаем информацию о пользователе
        userinfo = keycloak_openid.userinfo(tokens['access_token'])
        
        # Проверяем/создаем пользователя в нашей БД
        user = User.query.filter_by(username=userinfo['preferred_username']).first()
        if not user:
            user = User(
                username=userinfo['preferred_username'],
                is_admin='admin' in userinfo.get('groups', [])
            )
            db.session.add(user)
            db.session.commit()
        
        # Создаем JWT токен для нашего приложения
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'access_token': access_token,
            'user_id': user.id,
            'is_admin': user.is_admin
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 401

@auth_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    """Пример защищенного роута"""
    return jsonify({'message': 'This is a protected endpoint'})

# Регистрация теперь не нужна - она происходит в Keycloak