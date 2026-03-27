import requests
url = "https://live-session-recording-service.s3.ap-south-1.amazonaws.com/production/326543/mfzU7ZeVvU96K95thYo9ALrMQep3eQdc.mp4"
try:
    r = requests.head(url)
    print(f"Status: {r.status_code}")
    print(f"Headers: {r.headers}")
    size = int(r.headers.get('Content-Length', 0))
    print(f"Size: {size / 1024 / 1024:.2f} MB")
except Exception as e:
    print(f"Error: {e}")
