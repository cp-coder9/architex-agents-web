import urllib.request
import json
import sys

BASE_URL = "http://localhost:8000/api"

def run_test():
    print("Starting full dashboard tests...")
    
    # 1. Test Project List (Admin & Client Dashboard)
    try:
        with urllib.request.urlopen(f"{BASE_URL}/projects/") as response:
            if response.status != 200:
                print(f"FAIL: GET /projects/ returned {response.status}")
                return
            data = json.loads(response.read().decode())
            print(f"PASS: GET /projects/ returned {len(data)} projects.")
            
            if data:
                p = data[0]
                if 'tasks' not in p:
                    print("FAIL: Project object missing 'tasks' field. Admin dashboard details will be empty.")
                else:
                    print(f"PASS: Project object has 'tasks' field ({len(p.get('tasks', []))} tasks).")
                
                if 'user' not in p:
                     print("FAIL: Project object missing 'user' field.")
                else:
                     print("PASS: Project object has 'user' field.")

                # Test Status Update (Admin 'Manage' Action)
                try:
                    update_data = json.dumps({"status": "completed", "admin_notes": "Automated test note"}).encode('utf-8')
                    req = urllib.request.Request(f"{BASE_URL}/projects/{p['id']}/status", data=update_data, method='PUT')
                    req.add_header('Content-Type', 'application/json')
                    with urllib.request.urlopen(req) as update_resp:
                        if update_resp.status == 200:
                            print(f"PASS: PUT /projects/{p['id']}/status success.")
                        else:
                            print(f"FAIL: PUT /projects/{p['id']}/status returned {update_resp.status}")
                except Exception as e:
                    print(f"FAIL: Update status error: {e}")

    except Exception as e:
        print(f"FAIL: Projects test error: {e}")

    # 2. Test Freelancer Tasks
    try:
        with urllib.request.urlopen(f"{BASE_URL}/freelancers/available-tasks") as response:
            if response.status != 200:
                 print(f"FAIL: GET /freelancers/available-tasks returned {response.status}")
            else:
                 data = json.loads(response.read().decode())
                 print(f"PASS: GET /freelancers/available-tasks returned {data.get('count')} tasks.")
    except Exception as e:
        print(f"FAIL: Freelancer test error: {e}")

    print("Tests completed.")

if __name__ == "__main__":
    run_test()
