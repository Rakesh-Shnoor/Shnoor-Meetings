import logging
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv

from routers import meeting, signaling, calendar

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# =========================
# App Initialization
# =========================
app = FastAPI(
    title="Shnoor Meetings Backend",
    description="WebRTC Signaling + Meeting Backend (Google Meet Clone)",
    version="1.0.0"
)
from routers import calls

app.include_router(calls.router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meeting.router)
app.include_router(signaling.router)
app.include_router(calendar.router)

@app.get("/")
async def root():
    return {"message": "🚀 Shnoor Meetings Backend Running"}



active_connections = {}

@app.websocket("/ws/{room_id}/{user_id}")
async def global_websocket(websocket: WebSocket, room_id: str, user_id: str):
    await websocket.accept()

    if room_id not in active_connections:
        active_connections[room_id] = []

    active_connections[room_id].append(websocket)

    logger.info(f"User {user_id} joined room {room_id}")

    try:
        while True:
            data = await websocket.receive_text()

            for connection in active_connections[room_id]:
                if connection != websocket:
                    await connection.send_text(data)

    except Exception as e:
        logger.error(f"WebSocket error: {e}")

    finally:
        active_connections[room_id].remove(websocket)
        logger.info(f"User {user_id} left room {room_id}")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )