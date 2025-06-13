# backend.py (финальный MVP ЖКХ с услугами)
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime
import uuid

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # ← точный адрес фронта
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],                      # нужен, т.к. есть заголовок Authorization
)

# Моки
users_db = {
    "user1": {"id": "user1", "name": "Иван Иванов", "balance": 153453535300.0}
}

payments_db = []
receipts_db = []

services_db = [
    {"name": "Вода", "amount": 500.0, "description": "Холодная и горячая вода"},
    {"name": "Электричество", "amount": 750.0, "description": "Плата за электроэнергию"},
    {"name": "Газ", "amount": 300.0, "description": "Газоснабжение"},
    {"name": "Отопление", "amount": 600.0, "description": "Центральное отопление"}
]

# Модели
class PaymentRequest(BaseModel):
    user_id: str
    amount: float
    service: str

class Receipt(BaseModel):
    id: str
    user_id: str
    service: str
    amount: float
    date: str

class BalanceResponse(BaseModel):
    user_id: str
    name: str
    balance: float

class Service(BaseModel):
    name: str
    amount: float
    description: str

@app.get("/services", response_model=List[Service])
def list_services():
    return services_db

@app.post("/pay")
def pay_service(payment: PaymentRequest):
    user = users_db.get(payment.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    if user['balance'] < payment.amount:
        raise HTTPException(status_code=400, detail="Недостаточно средств")

    user['balance'] -= payment.amount
    payments_db.append({
        "user_id": payment.user_id,
        "amount": payment.amount,
        "service": payment.service,
        "date": datetime.utcnow().isoformat()
    })

    receipt = Receipt(
        id=str(uuid.uuid4()),
        user_id=payment.user_id,
        service=payment.service,
        amount=payment.amount,
        date=datetime.utcnow().strftime("%Y-%m-%d")
    )
    receipts_db.append(receipt.dict())

    return {"message": "Оплата прошла успешно", "receipt": receipt}

@app.get("/receipts/{user_id}", response_model=List[Receipt])
def get_receipts(user_id: str):
    return [r for r in receipts_db if r['user_id'] == user_id]

@app.get("/balance/{user_id}", response_model=BalanceResponse)
def get_balance(user_id: str):
    user = users_db.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return BalanceResponse(user_id=user_id, name=user['name'], balance=user['balance'])