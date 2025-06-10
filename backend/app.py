from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config  # Импортируем настройки
from charges import charges_bp

app.register_blueprint(charges_bp, url_prefix='/api/charges')

app = Flask(__name__)
app.config.from_object(Config)  # Загружаем конфиги

db = SQLAlchemy(app)  # Подключаем БД а что там с БД без понятия

# Регистрируем модули
from auth import auth_bp
from accounts import accounts_bp
from payments import payments_bp
from receipts import receipts_bp

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(accounts_bp, url_prefix='/api/accounts')
app.register_blueprint(payments_bp, url_prefix='/api/payments')
app.register_blueprint(receipts_bp, url_prefix='/api/receipts')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Создаём таблицы
    app.run(debug=True)