# Notification System Design: Priority Inbox (Stage 1)

## 1. Problem Statement
Users lose track of critical announcements due to high overall message volumes. The solution introduces a **Priority Inbox** showcasing the top `n` unread notifications dynamically sorted by:
1. **Weight**: `Placement` (High) > `Result` (Medium) > `Event` (Low)
2. **Recency**: Newer timestamps prioritize over older timestamps within identical type groups.

---

## 2. Core Algorithmic Strategy
To maintain the top `n` list efficiently as new notifications continuously arrive over real-time streaming sockets or polling actions, the system utilizes a **Min-Heap Data Structure**.

### Why Min-Heap?
* **Naive Approach**: Appending new elements to a flat array and running a sorting algorithm (`O(K log K)`) every time an update lands scales poorly.
* **Optimized Approach**: By enforcing a Min-Heap capped at exact size `n`, the root of the heap always reflects the *lowest-scoring* element inside the elite bracket. 

When a new incoming notification arrives:
1. It is compared with the root of the Min-Heap.
2. If the new notification has a higher priority than the root element, the root is dropped (`heapq.heappop()`) and the new element enters (`heapq.heappush()`).
3. If it is lower, it is immediately discarded.

### Complexity Analysis
* **Time Complexity**: Inserting a fresh notification takes **$O(\log n)$**. Processing a historic batch of size $K$ takes **$O(K \log n)$** instead of $O(K \log K)$. Because $n \le 20$ usually, $\log n$ operates practically as a flat constant.
* **Space Complexity**: **$O(n)$**, requiring minimal memory storage bounds.

---

## 3. Production Architecture Considerations
For a scaling real-time ecosystem, processing sorting metrics inside runtime application memory instance fragments is a bottleneck. The architectural roadmap implements:

1. **Database Layer Tuning**:
   * Map structural string categories to indexable numerical enums (`Placement: 3`, `Result: 2`, `Event: 1`).
   * Apply a compound index on the storage engine: `CREATE INDEX idx_priority_inbox ON notifications (user_id, status_unread, weight_enum DESC, timestamp DESC);`
2. **Real-time Streaming**: Use Redis Sorted Sets (`ZSET`) where the designated calculated score is combined by embedding the weight into high-order bits and Unix epoch times into low-order bits for atomic retrieval.