# backend.py — Итоговый backend для MVP ЖКХ
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime
import uuid
import qrcode
import base64
from io import BytesIO

app = FastAPI()

# Разрешаем доступ с фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Пример пользователей
users_db = {
    "user1": {"id": "user1", "name": "Иван Иванов", "balance": 1500.0}
}

# Моки для платежей и квитанций
payments_db = []
receipts_db = []

# Модель запроса оплаты
class PaymentRequest(BaseModel):
    user_id: str
    amount: float
    service: str

# Модель квитанции с QR-кодом
class Receipt(BaseModel):
    id: str
    user_id: str
    service: str
    amount: float
    date: str
    qr_code: str = None

# Модель услуги
class Service(BaseModel):
    name: str
    description: str
    price: float

# Пример услуг
services_list = [
    Service(name="Вода", description="Подача холодной и горячей воды", price=500),
    Service(name="Электричество", description="Электроснабжение квартиры", price=1000),
    Service(name="Вывоз мусора", description="Коммунальные услуги по вывозу ТБО", price=300),
]

# Генерация QR-кода в формате base64
def generate_qr_base64(text: str) -> str:
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(text)
    qr.make(fit=True)
    img = qr.make_image(fill="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    return f"data:image/png;base64,{base64.b64encode(buffer.getvalue()).decode()}"

# Получить список всех услуг
@app.get("/services", response_model=List[Service])
def get_services():
    return services_list

# Получить баланс пользователя
@app.get("/balance/{user_id}")
def get_balance(user_id: str):
    user = users_db.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user_id": user_id, "name": user['name'], "balance": user['balance']}

# Совершить оплату
@app.post("/pay")
def pay_service(payment: PaymentRequest):
    user = users_db.get(payment.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user['balance'] < payment.amount:
        raise HTTPException(status_code=400, detail="Insufficient funds")

    # Списываем деньги
    user['balance'] -= payment.amount
    payments_db.append({
        "user_id": payment.user_id,
        "amount": payment.amount,
        "service": payment.service,
        "date": datetime.utcnow().isoformat()
    })

    # Генерация QR-кода по данным
    qr_text = f"User: {user['name']}, Service: {payment.service}, Amount: {payment.amount}, Date: {datetime.utcnow().strftime('%Y-%m-%d')}"
    qr_code = generate_qr_base64(qr_text)

    # Создаем квитанцию
    receipt = Receipt(
        id=str(uuid.uuid4()),
        user_id=payment.user_id,
        service=payment.service,
        amount=payment.amount,
        date=datetime.utcnow().strftime("%Y-%m-%d"),
        qr_code=qr_code
    )
    receipts_db.append(receipt.dict())

    return {"message": "Оплата прошла успешно", "receipt": receipt}

# Получить все квитанции пользователя
@app.get("/receipts/{user_id}", response_model=List[Receipt])
def get_receipts(user_id: str):
    return [r for r in receipts_db if r['user_id'] == user_id]
