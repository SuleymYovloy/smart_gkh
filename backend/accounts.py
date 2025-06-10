from flask import Blueprint, jsonify
from models import Account
from app import db

accounts_bp = Blueprint('accounts', __name__)

@accounts_bp.route('/<int:user_id>')
def get_accounts(user_id):
    accounts = Account.query.filter_by(user_id=user_id).all()
    return jsonify([{'id': acc.id, 'address': acc.address} for acc in accounts])