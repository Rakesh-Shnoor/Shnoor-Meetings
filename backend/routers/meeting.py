import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict

router = APIRouter(
    prefix="/api/meetings",
    tags=["Meetings"]
)



class CreateMeetingRequest(BaseModel):
    user_email: str

class CreateMeetingResponse(BaseModel):
    room_id: str
    message: str
    user_email: str

class JoinMeetingRequest(BaseModel):
    room_id: str


active_meetings: Dict[str, Dict] = {}




@router.post("/create", response_model=CreateMeetingResponse)
async def create_meeting(data: CreateMeetingRequest):
    """
    Create a new meeting with user info
    """
    try:
        room_id = str(uuid.uuid4())

        active_meetings[room_id] = {
            "user_email": data.user_email
        }

        print(f"✅ Meeting created: {room_id} by {data.user_email}")

        return {
            "room_id": room_id,
            "message": "Meeting created successfully",
            "user_email": data.user_email
        }

    except Exception as e:
        print("❌ Error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{room_id}")
async def check_meeting(room_id: str):
    """
    Check if meeting exists
    """
    if not room_id:
        raise HTTPException(status_code=400, detail="Invalid room ID")

    if room_id not in active_meetings:
        raise HTTPException(status_code=404, detail="Meeting not found")

    return {
        "room_id": room_id,
        "valid": True,
        "created_by": active_meetings[room_id]["user_email"]
    }


@router.post("/join")
async def join_meeting(request: JoinMeetingRequest):
    """
    Join an existing meeting
    """
    room_id = request.room_id

    if room_id not in active_meetings:
        raise HTTPException(status_code=404, detail="Meeting does not exist")

    return {
        "room_id": room_id,
        "message": "Joined meeting successfully",
        "created_by": active_meetings[room_id]["user_email"]
    }




@router.get("/user/{email}")
async def get_user_meetings(email: str):
    """
    Get all meetings created by a user
    """
    user_meetings = []

    for room_id, data in active_meetings.items():
        if data["user_email"] == email:
            user_meetings.append(room_id)

    return {
        "user_email": email,
        "meetings": user_meetings
    }