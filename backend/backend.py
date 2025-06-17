# backend.py (финальный MVP ЖКХ с услугами)
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.models import Base, Task
from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
import uuid
import json

PUBLIC_KEY = """-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxjPg+xPFejorBmKYhlqlFIKOpZKKqw0EC1Geht6jVojXS0Lxc2qNV/kdv4wuR1+NA9GxMu89Glu8ZiPL9GbrlKQTyJkaoB0Q4DTVNOGjCNyt3/V2+J8g4TgXdnLQ8X8AJTduIBcg5jqSl5Vln0LToQcAuftM3IE8h0J+DqTCdFCWmx8Vw2ftVCEtFDtcEa/ikN3eShzOGk8mpfqqjJJHEYy9f4b/6Cl4UKeOe93CaJiCIgeMYMCmOgtM2v0Y7v+bzLpRV7cD8ZodKp2L4xrgTApzML1K5qv6QJcI0q0NNweRjYH1xiUoP0u4H3iR49+7J1r0D4WCTP3OF6a7NI233wIDAQAB
-----END PUBLIC KEY-----"""

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

class CommentRequest(BaseModel):
    comment: str

class AssigneeRequest(BaseModel):
    assignee_id: Optional[str] = None
    assignee_name: Optional[str] = None
    assignee_role: Optional[str] = None

@app.get("/services", response_model=List[Service])
def list_services():
    return services_db

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_user_from_token(token: str):
    """Извлекает информацию о пользователе из JWT токена"""
    user = "Пользователь"
    account_id = "неизвестно"
    try:
        decoded = jwt.decode(token, PUBLIC_KEY, algorithms=["RS256"], options={"verify_signature": False}) 
        print(decoded)

        account_id = decoded.get("sub") or decoded.get("preferred_username") or "неизвестно"
        given_name = decoded.get("given_name", "")
        family_name = decoded.get("family_name", "")
        full_name = f"{given_name} {family_name}".strip()
        user = full_name if full_name else decoded.get("preferred_username") or decoded.get("sub") or "Пользователь"
    except Exception as e:
        print("❌ Ошибка при декодировании токена:", str(e))
    return user, account_id

@app.post("/api/v1/tasks")
def create_task(data: dict, db: Session = Depends(get_db), request: Request = None):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    user, account_id = get_user_from_token(token)

    now = datetime.utcnow().replace(tzinfo=timezone.utc)
    task = Task(
        account_id=account_id,
        category=data.get("category"),
        priority=data.get("priority", "normal"),
        title=data.get("title"),
        description=data.get("description"),
        status="in_progress",
        assignee=json.dumps({
            "id": None,
            "name": None,
            "role": None
        }),
        attachments=json.dumps([]),
        history=json.dumps([
            {
                "timestamp": now.isoformat().replace("+00:00", "Z"),
                "action": "created",
                "user": user
            }
        ]),
        comments=json.dumps([]),  # Инициализируем пустой список комментариев
        created_at=now
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return {
        "id": f"TASK-{now.year}-{task.id:06d}",
        "accountId": task.account_id,
        "category": task.category,
        "priority": task.priority,
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "createdAt": task.created_at.isoformat().replace("+00:00", "Z"),
        "assignee": json.loads(task.assignee or '{}'),
        "attachments": json.loads(task.attachments or '[]'),
        "history": json.loads(task.history or '[]'),
        "comments": json.loads(task.comments or '[]'),
        "rating": task.rating
    }


@app.get("/api/v1/tasks")
def get_tasks(db: Session = Depends(get_db)):
    tasks = db.query(Task).all()
    return [
        {
            "id": f"TASK-{task.created_at.year}-{task.id:06d}",
            "accountId": task.account_id,
            "category": task.category,
            "priority": task.priority,
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "createdAt": task.created_at.isoformat().replace("+00:00", "Z"),
            "assignee": json.loads(task.assignee or '{}'),
            "attachments": json.loads(task.attachments or '[]'),
            "history": json.loads(task.history or '[]'),
            "comments": json.loads(task.comments or '[]'),
            "rating": task.rating
        }
        for task in tasks
    ]

@app.get("/api/v1/tasks/{task_id}")
def get_task(task_id: str, db: Session = Depends(get_db)):
    # Извлекаем ID из формата TASK-YYYY-XXXXXX
    try:
        task_numeric_id = int(task_id.split('-')[-1])
    except:
        raise HTTPException(status_code=400, detail="Invalid task ID format")
    
    task = db.query(Task).filter(Task.id == task_numeric_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return {
        "id": f"TASK-{task.created_at.year}-{task.id:06d}",
        "accountId": task.account_id,
        "category": task.category,
        "priority": task.priority,
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "createdAt": task.created_at.isoformat().replace("+00:00", "Z"),
        "assignee": json.loads(task.assignee or '{}'),
        "attachments": json.loads(task.attachments or '[]'),
        "history": json.loads(task.history or '[]'),
        "comments": json.loads(task.comments or '[]'),
        "rating": task.rating
    }

@app.post("/api/v1/tasks/{task_id}/comments")
def add_comment(task_id: str, comment_data: CommentRequest, db: Session = Depends(get_db), request: Request = None):
    # Извлекаем ID из формата TASK-YYYY-XXXXXX
    try:
        task_numeric_id = int(task_id.split('-')[-1])
    except:
        raise HTTPException(status_code=400, detail="Invalid task ID format")
    
    task = db.query(Task).filter(Task.id == task_numeric_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    user, _ = get_user_from_token(token)

    now = datetime.utcnow().replace(tzinfo=timezone.utc)
    
    # Добавляем комментарий
    comments = json.loads(task.comments or '[]')
    comments.append({
        "timestamp": now.isoformat().replace("+00:00", "Z"),
        "user": user,
        "comment": comment_data.comment
    })
    task.comments = json.dumps(comments)
    
    # Добавляем запись в историю
    history = json.loads(task.history or '[]')
    history.append({
        "timestamp": now.isoformat().replace("+00:00", "Z"),
        "action": "comment_added",
        "user": user
    })
    task.history = json.dumps(history)
    
    db.commit()
    return {"message": "Комментарий добавлен"}

@app.put("/api/v1/tasks/{task_id}/assignee")
def update_assignee(task_id: str, assignee_data: AssigneeRequest, db: Session = Depends(get_db), request: Request = None):
    # Извлекаем ID из формата TASK-YYYY-XXXXXX
    try:
        task_numeric_id = int(task_id.split('-')[-1])
    except:
        raise HTTPException(status_code=400, detail="Invalid task ID format")
    
    task = db.query(Task).filter(Task.id == task_numeric_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    user, _ = get_user_from_token(token)

    now = datetime.utcnow().replace(tzinfo=timezone.utc)
    
    # Обновляем исполнителя
    assignee = {
        "id": assignee_data.assignee_id,
        "name": assignee_data.assignee_name,
        "role": assignee_data.assignee_role
    }
    task.assignee = json.dumps(assignee)
    
    # Добавляем запись в историю
    history = json.loads(task.history or '[]')
    history.append({
        "timestamp": now.isoformat().replace("+00:00", "Z"),
        "action": "assignee_updated",
        "user": user
    })
    task.history = json.dumps(history)
    
    db.commit()
    return {"message": "Исполнитель обновлен"}

@app.put("/api/v1/tasks/{task_id}/status")
def update_status(task_id: str, status_data: dict, db: Session = Depends(get_db), request: Request = None):
    # Извлекаем ID из формата TASK-YYYY-XXXXXX
    try:
        task_numeric_id = int(task_id.split('-')[-1])
    except:
        raise HTTPException(status_code=400, detail="Invalid task ID format")
    
    task = db.query(Task).filter(Task.id == task_numeric_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    user, _ = get_user_from_token(token)

    now = datetime.utcnow().replace(tzinfo=timezone.utc)
    
    # Обновляем статус
    old_status = task.status
    new_status = status_data.get("status")
    task.status = new_status
    
    # Добавляем запись в историю
    history = json.loads(task.history or '[]')
    history.append({
        "timestamp": now.isoformat().replace("+00:00", "Z"),
        "action": f"status_changed_from_{old_status}_to_{new_status}",
        "user": user
    })
    task.history = json.dumps(history)
    
    db.commit()
    return {"message": "Статус обновлен"}

@app.put("/api/v1/tasks/{task_id}/rate")
def rate_task(task_id: str, data: dict, db: Session = Depends(get_db), request: Request = None):
    # Извлекаем ID из формата TASK-YYYY-XXXXXX
    try:
        task_numeric_id = int(task_id.split('-')[-1])
    except:
        task_numeric_id = int(task_id)  # Fallback для старого формата
    
    task = db.query(Task).filter(Task.id == task_numeric_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    user, _ = get_user_from_token(token)

    now = datetime.utcnow().replace(tzinfo=timezone.utc)
    
    task.rating = data.get("rating")
    
    # Добавляем запись в историю
    history = json.loads(task.history or '[]')
    history.append({
        "timestamp": now.isoformat().replace("+00:00", "Z"),
        "action": "rated",
        "user": user
    })
    task.history = json.dumps(history)
    
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

