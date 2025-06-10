from app import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

class Account(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    address = db.Column(db.String(200), nullable=False)
    balance = db.Column(db.Float, default=0.0)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    user = db.relationship('User', backref='accounts')

class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, default=db.func.now())
    account_id = db.Column(db.Integer, db.ForeignKey('account.id'))
    account = db.relationship('Account', backref='payments')

class Charge(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)  # Сумма начисления
    date = db.Column(db.DateTime, default=db.func.now())  # Дата начисления
    service_type = db.Column(db.String(50))  # Тип услуги (вода, свет, газ)
    account_id = db.Column(db.Integer, db.ForeignKey('account.id'))
    account = db.relationship('Account', backref='charges')