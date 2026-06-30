import requests
import json
from datetime import datetime
import heapq

# Configuration
API_URL = "http://4.224.186.213/evaluation-service/notifications"
# Note: Add an 'Authorization': 'Bearer <token>' header below if required by your endpoint
HEADERS = {} 

# Define weights based on requirements: Placement > Result > Event
TYPE_WEIGHTS = {
    "Placement": 3,
    "Result": 2,
    "Event": 1
}

class Notification:
    def __init__(self, id, type_, message, timestamp_str):
        self.id = id
        self.type = type_
        self.message = message
        self.timestamp_str = timestamp_str
        # Parse timestamp string to datetime object for correct comparison
        self.timestamp = datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S")
        self.weight = TYPE_WEIGHTS.get(type_, 0)

    # Custom comparison operators for Max-Heap matching our rules
    def __lt__(self, other):
        # Primary sort: Weight (Higher is better)
        if self.weight != other.weight:
            return self.weight < other.weight
        # Secondary sort: Recency (Newer/Greater timestamp is better)
        return self.timestamp < other.timestamp

    def to_dict(self):
        return {
            "ID": self.id,
            "Type": self.type,
            "Message": self.message,
            "Timestamp": self.timestamp_str
        }

def get_top_n_notifications(notifications_list, n=10):
    """
    Finds the top N notifications using a Min-Heap.
    Time Complexity: O(K log N) where K is total notifications.
    """
    # Create notification objects
    objs = []
    for item in notifications_list:
        try:
            objs.append(Notification(item["ID"], item["Type"], item["Message"], item["Timestamp"]))
        except KeyError as e:
            continue

    # Maintain a min-heap of size N
    min_heap = []
    for obj in objs:
        heapq.heappush(min_heap, obj)
        if len(min_heap) > n:
            heapq.heappop(min_heap) # Discard lowest priority elements

    # Elements out of the min-heap come out from smallest to largest, 
    # so we sort them in descending order for the final inbox display.
    top_n = sorted(min_heap, reverse=True)
    return [item.to_dict() for item in top_n]

def fetch_and_process():
    print(f"Fetching notifications from {API_URL}...")
    try:
        response = requests.get(API_URL, headers=HEADERS, timeout=10)
        # Check if successful; if not, fallback to the sample data provided
        if response.status_code == 200:
            data = response.json()
            # Handle if wrapped inside a dict key or directly a list
            notifications = data.get("notifications", data) if isinstance(data, dict) else data
        else:
            print(f"Failed to fetch data (Status {response.status_code}). Using local sample data.")
            notifications = get_sample_data()
    except Exception as e:
        print(f"Error fetching data ({e}). Using local sample data.")
        notifications = get_sample_data()

    # Process and fetch Top 10
    top_10 = get_top_n_notifications(notifications, n=10)
    
    print("\n=== PRIORITY INBOX: TOP 10 NOTIFICATIONS ===")
    print(json.dumps(top_10, indent=4))

def get_sample_data():
    return [
        {"ID": "d146095a-0d86-4a34-9e69-3900a14576bc", "Type": "Result", "Message": "mid-sem", "Timestamp": "2026-04-22 17:51:30"},
        {"ID": "b283218f-ea5a-4b7c-93a9-1f2f240d64be", "Type": "Placement", "Message": "CSX Corporation hiring", "Timestamp": "2026-04-22 17:51:18"},
        {"ID": "81589ada-0ad3-4f77-9554-f52fb558e09d", "Type": "Event", "Message": "farewell", "Timestamp": "2026-04-22 17:51:06"},
        {"ID": "0005513a-142b-4bbc-8678-eefec65e1ede", "Type": "Result", "Message": "mid-sem", "Timestamp": "2026-04-22 17:50:54"},
        {"ID": "ea836726-c25e-4f21-a72f-544a6af8a37f", "Type": "Result", "Message": "project-review", "Timestamp": "2026-04-22 17:50:42"},
        {"ID": "003cb427-8fc6-47f7-bb00-be228f6b0d2c", "Type": "Result", "Message": "external", "Timestamp": "2026-04-22 17:50:30"},
        {"ID": "e5c4ff20-31bf-4d40-8f02-72fda59e8918", "Type": "Result", "Message": "project-review", "Timestamp": "2026-04-22 17:50:18"},
        {"ID": "1cfce5ee-ad37-4894-8946-d707627176a5", "Type": "Event", "Message": "tech-fest", "Timestamp": "2026-04-22 17:50:06"},
        {"ID": "cf2885a6-45ac-4ba0-b548-6e9e9d4c52c8", "Type": "Result", "Message": "project-review", "Timestamp": "2026-04-22 17:49:54"},
        {"ID": "8a7412bd-6065-4d09-8501-a37f11cc848b", "Type": "Placement", "Message": "Advanced Micro Devices Inc. hiring", "Timestamp": "2026-04-22 17:49:42"}
    ]

if __name__ == "__main__":
    fetch_and_process()