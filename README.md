# 🏙️ Smart ЖКХ — [exIT]

Мы реализовали MVP-платформу для взаимодействия жителей с управляющими компаниями и поставщиками коммунальных услуг.

---

## 📌 Основной функционал

-   🔐 Авторизация через **Keycloak**
-   💳 Оплата коммунальных услуг
-   🧾 Просмотр начислений по лицевому счёту
-   📂 Отправка заявок и отслеживание статуса

---

## 🛠️ Стек технологий

-   **Frontend**: React + Vite + Material UI
-   **Backend**: FastAPI + SQLAlchemy
-   **Авторизация**: Keycloak (OIDC)
-   **База данных**: SQLite (в рамках MVP)
-   **Инфраструктура**: Docker + Docker Compose

---

## 🚀 Как запустить проект локально

### 📦 Предварительные требования

-   **Docker Desktop**
-   **Node.js** (рекомендуемая версия: ≥ 18)
-   **Python 3.10+**
-   `pip` — менеджер пакетов Python

---

### 1. Запуск Keycloak и базы данных

Перейдите в корень проекта `smart-gkh` и запустите сервисы:

```bash
docker compose up -d db keycloak
```

---

### 2. Установка и запуск frontend

```bash
cd client
npm install
npm run dev
```

Frontend будет доступен по адресу:  
👉 http://localhost:5173

---

### 3. Установка и запуск backend

```bash
cd backend
pip install -r requirements.txt

```

Затем запустите backend из корня проекта:

```bash
cd ..
uvicorn backend.backend:app --reload
```

Backend будет доступен по адресу:  
👉 http://localhost:8000

---

### 4. Импорт Realm в Keycloak

1. Перейдите в браузере по адресу: http://localhost:9080
2. Войдите под логином/паролем администратора (указаны в `docker-compose.yml`)
3. Импортируйте файл `smart-gkh.json` в настройках Realm

---

## ✅ Проект готов к использованию!

Платформа будет доступна по адресу:  
👉 http://localhost:5173
