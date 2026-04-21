from fastapi import APIRouter
from pydantic import BaseModel
from core.database import get_db_connection

router = APIRouter(prefix="/api/calls", tags=["Calls"])

class Call(BaseModel):
    name: str
    email: str
    room_id: str

@router.get("/history")
def get_calls():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT name, email, room_id FROM calls ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()

    return [
        {"name": row[0], "email": row[1], "room_id": row[2]}
        for row in rows
    ]

@router.post("/history")
def save_call(call: Call):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO calls (name, email, room_id) VALUES (?, ?, ?)",
        (call.name, call.email, call.room_id)
    )

    conn.commit()
    conn.close()

    return {"message": "Call saved"}