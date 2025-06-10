from app import app, db
from models import User, Account, Payment
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Разрешить все домены (для разработки)

def create_test_data():
    with app.app_context():
        db.create_all()

        # Тестовый пользователь
        user = User(username='admin', password_hash=generate_password_hash('admin'), is_admin=True)
        db.session.add(user)

        # Лицевой счёт
        account = Account(address='ул. Пушкина, д. 42', user_id=user.id)
        db.session.add(account)

        # Платёж
        payment = Payment(amount=1500.50, account_id=account.id)
        db.session.add(payment)

        # Добавить в create_test_data()
        charge = Charge(amount=1200.0, service_type='коммунальные услуги', account_id=account.id)
        db.session.add(charge)

        db.session.commit()

if __name__ == '__main__':
    create_test_data()