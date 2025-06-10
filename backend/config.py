import os

class Config:
    # Ключ для подписи сессий и токенов
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-123')

    # Настройки БД
    SQLALCHEMY_DATABASE_URI = 'sqlite:///smart_jkh.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Эмуляция Keycloak (если нужно)
    KEYCLOAK_SERVER = 'http://localhost:8080'
    KEYCLOAK_REALM = 'smart_jkh'

    CORS_HEADERS = 'Content-Type'

    KEYCLOAK_CLIENT_ID = 'smart-hcs-frontend'
    KEYCLOAK_CLIENT_SECRET = 'сгенерированный-секрет'  # Если клиент не public

    KEYCLOAK_SERVER = 'http://localhost:8080'  # Адрес Keycloak
    KEYCLOAK_REALM = 'smart-hcs'               # Должно совпадать с "realm" в JSON

    KEYCLOAK_CONFIG = {
        'server_url': 'http://localhost:8080',
        'realm_name': 'smart-hcs',
        'client_id': 'smart-hcs-backend',
        'client_secret': 'your-client-secret'
    }