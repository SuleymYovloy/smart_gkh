from flask import Blueprint, jsonify
from models import Charge, Account
from app import db

charges_bp = Blueprint('charges', __name__)

@charges_bp.route('/<int:account_id>')
def get_charges(account_id):
    charges = Charge.query.filter_by(account_id=account_id).all()
    return jsonify([{
        'id': ch.id,
        'amount': ch.amount,
        'service_type': ch.service_type,
        'date': ch.date.isoformat()
    } for ch in charges])