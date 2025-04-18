from socketio import AsyncServer

sio = AsyncServer(async_mode="asgi")


@sio.event
async def join(sid, name_room):
    await sio.enter_room(sid, name_room)


@sio.event
async def leave(sid, name_room):
    await sio.leave_room(sid, name_room)
