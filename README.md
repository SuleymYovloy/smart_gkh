# Smart ЖКХ - [exIT]

Мы реализовали MVP-платформу для взаимодействия жителей с управляющими компаниями и поставщиками коммунальных услуг.

---

## 📌 Основной функционал

-   🔐 Авторизация через Keycloak
-   💳 Оплата коммунальных услуг
-   🧾 Просмотр начислений по лицевому счёту

---

## 🛠️ Стек технологий

-   **Frontend**: React + Vite + Material UI
-   **Backend**: Flask + SQLAlchemy
-   **Авторизация**: Keycloak (OIDC)
-   **Базы данных**: PostgreSQL
-   **Инфраструктура**: Docker + Docker Compose

---

## 🚀 Как запустить проект

### 1. Предусловия

-   Установлен **Docker Desktop**
-   Установлен **Node.js** (рекомендуемая версия: ≥ 18)
-   Установлен **Python 3.10+** и `pip`

---

### 2. Запуск сервисов через Docker

Перейдите в корневую папку проекта:

```bash
cd smart-gkh


#Запустите базу данных, Keycloak и backend:
docker compose up -d db keycloak backend


#3. Установка зависимостей и запуск фронтенда
cd client
npm install
npm run dev


#Установка зависимостей бэкенда

cd backend
pip install -r requirements.txt
uvicorn backend:app --reload



#. Импорт Realm в Keycloak
Откройте в браузере: http://localhost:9080


Войдите под данными администратора (указаны в docker-compose.yml).

Перейдите в раздел Realm settings и импортируйте файл smart-gkh.json.



#После запуска платформа будет доступна по адресу:http://localhost:5173
http://localhost:5173
```
