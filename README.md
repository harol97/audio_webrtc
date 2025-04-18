sudo systemctl start redis-server
sudo systemctl status redis-server
ngrok http --domain=ixtream.ngrok.app 8000
uv run --env-file .env -- uvicorn main:app

