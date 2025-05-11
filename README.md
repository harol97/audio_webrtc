sudo systemctl start redis-server
sudo systemctl status redis-server
ngrok http --domain=ixtream.ngrok.app 8000
uv run --env-file .env -- uvicorn main:app

## PENDIENTES

- Actualmente el poryecto detecta el silencio con el objetivo de finalizar la grabación para cada proceso, esto se hace en el servidor mediante webrtc y socketio.

  La intención es cambiar esto y que la detección del silencio se haga desde el frontend y quitar webrtc y socketio complementamente del poryecto

  ¡Claro, solo si no se usa en algo más, que hasta el momento no lo hacen!

- Actualmente se usa un método para listar los dispositivos disponible solo en chrome, se debe cambiar esto para que sea multiplataforma
