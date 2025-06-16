# backend.py (финальный MVP ЖКХ с услугами)
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.models import Base, Task
from sqlalchemy.orm import Session
from typing import List
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
import uuid

# 🔑 Вставь сюда публичный ключ Keycloak
PUBLIC_KEY = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAt4a1jQrVtHpG9WBp6ZSkm5wmegRxc1dx1uzYQBlFk4EEG1lK9hwY7FKHnpbycKSXMfW0kAleVVODM1Z94P6+uHa3labQoghfNeIyyNr3zcecjVqCtxiyMQKS1Kn6l+AtTJoEMkV7GPIeUI6LI3daTqVtpbyywvFGMgJi7EEHaCGst7bTXPsh+eAVmOOc25TA5BO+5WL0pAPYfifQTj+Hla+TLeo/GfujS2TT5flsl0tQfGTY9O5HCXAgSfMEOxHRQNxeFVcn8emSfnqOFOqeQX+p1fwZIybfFoHIwrYoL4kBpi51q0DzILAw7Hs+J7zN4CuQBQMOF1K1pN7CmfAeDQIDAQAB"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
DATABASE_URL = "sqlite:///./tasks.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)

# создаём таблицы, если их нет
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/v1/tasks")
def create_task(data: dict, db: Session = Depends(get_db), request: Request = None):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    user = "Пользователь"
    try:
        decoded = jwt.decode(token, PUBLIC_KEY, algorithms=["RS256"])
        user = decoded.get("name") or decoded.get("preferred_username")
    except:
        pass

    task = Task(
        account_id=data.get("accountId", "user1"),
        category=data.get("category"),
        priority=data.get("priority", "normal"),
        title=data.get("title"),
        description=data.get("description"),
        status="Создана",
        history=[
            {
                "timestamp": datetime.utcnow().isoformat(),
                "action": "created",
                "user": user
            }
        ]
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return {
        "id": task.id,
        "title": task.title,
        "status": task.status,
        "createdAt": task.created_at.isoformat()
    }

@app.get("/api/v1/tasks")
def get_tasks(db: Session = Depends(get_db)):
    tasks = db.query(Task).all()
    return [
        {
            "id": task.id,
            "accountId": task.account_id,
            "category": task.category,
            "priority": task.priority,
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "createdAt": task.created_at,
            "assignee": {
                "id": task.assignee_id,
                "name": task.assignee_name,
                "role": task.assignee_role
            },
            "attachments": task.attachments,
            "history": task.history,
            "rating": task.rating
        }
        for task in tasks
    ]

@app.put("/api/v1/tasks/{task_id}/rate")
def rate_task(task_id: int, data: dict, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.rating = data.get("rating")
    db.commit()
    return {"message": "Оценка сохранена"}

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
