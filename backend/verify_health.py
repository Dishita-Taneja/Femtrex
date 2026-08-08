import sys
import time
import urllib.request
import json

def test_health():
    url = "http://127.0.0.1:8000/health"
    print(f"Pinging health check endpoint at: {url}")
    
    for i in range(5):
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=5) as response:
                body = response.read().decode('utf-8')
                data = json.loads(body)
                print("\nResponse status: 200")
                print("Response JSON body:")
                print(json.dumps(data, indent=2))
                
                if response.status == 200 and data.get("status") == "ok":
                    print("\n[SUCCESS] Health check verify passed! All services connected.")
                    return True
                else:
                    print(f"[FAIL] Unexpected response structure: {data}")
        except Exception as e:
            print(f"Connection attempt {i + 1} failed: {e}")
            time.sleep(2)
            
    print("\n[ERROR] Health check failed after 5 retries.")
    return False

if __name__ == "__main__":
    success = test_health()
    sys.exit(0 if success else 1)
