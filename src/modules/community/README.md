# 🌟 Community Module - Complete API Documentation

## 📋 **Overview**

Community Module cho phép users **share itinerary**, **like**, **comment** và tương tác với nhau trong một community travel platform. Module được thiết kế theo clean architecture với security và performance tối ưu.

## 🏗️ **Architecture**

```
src/modules/community/
├── controllers/
│   ├── community.controller.ts      # 12 API endpoints
│   └── community.controller.spec.ts # 7 test suites
├── services/
│   └── community.service.ts         # Business logic + security
├── schemas/
│   ├── community-post.schema.ts     # Post schema + indexes
│   ├── comment.schema.ts            # Comment schema + indexes
│   └── like.schema.ts               # Like schema + unique constraints
├── dto/
│   ├── community-post.dto.ts        # Post DTOs + validation
│   ├── comment.dto.ts               # Comment DTOs + validation
│   └── like.dto.ts                  # Like DTOs + validation
├── community.module.ts              # Module definition
├── index.ts                         # Exports
└── README.md                        # This documentation
```

## 📊 **Database Schemas**

### **🏷️ CommunityPost**

```typescript
{
  _id: ObjectId,
  itineraryId: ObjectId,    // Reference to Itinerary
  userId: ObjectId,         // Post owner
  caption?: string,         // Optional description (max 500 chars)
  visibility: enum,         // "PUBLIC" | "PRIVATE" | "FRIENDS_ONLY"
  createdAt: Date,
  updatedAt: Date
}

// Indexes:
// { userId: 1, createdAt: -1 }     - User timeline
// { visibility: 1, createdAt: -1 } - Public feed
// { itineraryId: 1 }               - Find by itinerary
```

### **💬 Comment**

```typescript
{
  _id: ObjectId,
  postId: ObjectId,         // Reference to CommunityPost
  userId: ObjectId,         // Comment author
  content: string,          // Comment text (max 1000 chars)
  createdAt: Date,
  updatedAt: Date
}

// Indexes:
// { postId: 1, createdAt: -1 }     - Post comments
// { userId: 1, createdAt: -1 }     - User comments
```

### **❤️ Like**

```typescript
{
  _id: ObjectId,
  userId: ObjectId,         // User who liked
  postId: ObjectId,         // Post being liked
  createdAt: Date
}

// Indexes:
// { userId: 1, postId: 1 } (unique) - Prevent duplicate likes
// { postId: 1, createdAt: -1 }      - Post likes timeline
```

## 🔐 **Security & Privacy**

### **🛡️ Visibility Levels**

- **PUBLIC**: Ai cũng có thể xem và tương tác
- **PRIVATE**: Chỉ owner có thể xem
- **FRIENDS_ONLY**: Owner và friends có thể xem (ready for friends feature)

### **🔒 Access Control Rules**

- ✅ Users chỉ có thể edit/delete posts của chính họ
- ✅ Users chỉ có thể edit/delete comments của chính họ
- ✅ Private posts không thể được comment/like bởi người khác
- ✅ ObjectId validation cho tất cả parameters
- ✅ Input validation với class-validator
- ✅ SQL injection protection với MongoDB ODM

---

# 🚀 **Complete API Documentation**

## 📝 **COMMUNITY POSTS APIs**

### **1. Create Post (Share Itinerary)**

**Endpoint:** `POST /community/posts`
**Auth:** Required
**Description:** Share một itinerary thành community post

**Request Body:**

```json
{
  "itineraryId": "507f1f77bcf86cd799439012",
  "caption": "Amazing 5-day trip to Paris! The Eiffel Tower at sunset was breathtaking 🇫🇷✨",
  "visibility": "PUBLIC"
}
```

**Response:** `201 Created`

```json
{
  "postId": "507f1f77bcf86cd799439011",
  "itineraryId": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439013",
  "caption": "Amazing 5-day trip to Paris! The Eiffel Tower at sunset was breathtaking 🇫🇷✨",
  "visibility": "PUBLIC",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z",
  "user": {
    "userId": "507f1f77bcf86cd799439013",
    "fullName": "John Doe",
    "email": "john.doe@example.com"
  },
  "itinerary": {
    "itineraryId": "507f1f77bcf86cd799439012",
    "destination": "Paris, France",
    "startDate": "2024-01-15",
    "endDate": "2024-01-20",
    "numberOfTravelers": 2,
    "tripType": "COUPLE"
  },
  "likesCount": 0,
  "commentsCount": 0,
  "isLikedByCurrentUser": false,
  "recentComments": []
}
```

**Validation Rules:**

- `itineraryId`: Required, valid MongoDB ObjectId
- `caption`: Optional, max 500 characters
- `visibility`: Optional, enum ["PUBLIC", "PRIVATE", "FRIENDS_ONLY"], default "PUBLIC"

**Error Responses:**

```json
// 400 Bad Request - Invalid itineraryId
{
  "statusCode": 400,
  "message": "Invalid itineraryId format",
  "error": "Bad Request"
}

// 409 Conflict - Post already exists for this itinerary
{
  "statusCode": 409,
  "message": "Post already exists for this itinerary",
  "error": "Conflict"
}
```

---

### **2. Get Public Posts (Community Feed)**

**Endpoint:** `GET /community/posts`
**Auth:** Optional (for isLikedByCurrentUser)
**Description:** Lấy danh sách tất cả public posts, sắp xếp theo thời gian mới nhất

**Query Parameters:**

- `page`: number (default: 1)
- `limit`: number (default: 10, max: 50)

**Request:**

```bash
GET /community/posts?page=1&limit=5
```

**Response:** `200 OK`

```json
[
  {
    "postId": "507f1f77bcf86cd799439011",
    "itineraryId": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439013",
    "caption": "Amazing 5-day trip to Paris! The Eiffel Tower at sunset was breathtaking 🇫🇷✨",
    "visibility": "PUBLIC",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z",
    "user": {
      "userId": "507f1f77bcf86cd799439013",
      "fullName": "John Doe",
      "email": "john.doe@example.com"
    },
    "itinerary": {
      "itineraryId": "507f1f77bcf86cd799439012",
      "destination": "Paris, France",
      "startDate": "2024-01-15",
      "endDate": "2024-01-20",
      "numberOfTravelers": 2,
      "tripType": "COUPLE"
    },
    "likesCount": 15,
    "commentsCount": 8,
    "isLikedByCurrentUser": false,
    "recentComments": [
      {
        "commentId": "507f1f77bcf86cd799439020",
        "postId": "507f1f77bcf86cd799439011",
        "userId": "507f1f77bcf86cd799439021",
        "content": "Wow! How was the weather there?",
        "createdAt": "2024-01-16T09:30:00.000Z",
        "updatedAt": "2024-01-16T09:30:00.000Z",
        "user": {
          "userId": "507f1f77bcf86cd799439021",
          "fullName": "Jane Smith",
          "email": "jane.smith@example.com"
        }
      }
    ]
  },
  {
    "postId": "507f1f77bcf86cd799439014",
    "itineraryId": "507f1f77bcf86cd799439015",
    "userId": "507f1f77bcf86cd799439016",
    "caption": "Solo backpacking through Southeast Asia 🎒",
    "visibility": "PUBLIC",
    "createdAt": "2024-01-14T15:30:00.000Z",
    "updatedAt": "2024-01-14T15:30:00.000Z",
    "user": {
      "userId": "507f1f77bcf86cd799439016",
      "fullName": "Mike Johnson",
      "email": "mike.johnson@example.com"
    },
    "itinerary": {
      "itineraryId": "507f1f77bcf86cd799439015",
      "destination": "Bangkok, Thailand",
      "startDate": "2024-02-01",
      "endDate": "2024-02-14",
      "numberOfTravelers": 1,
      "tripType": "SOLO"
    },
    "likesCount": 23,
    "commentsCount": 12,
    "isLikedByCurrentUser": true,
    "recentComments": []
  }
]
```

---

### **3. Get Post by ID**

**Endpoint:** `GET /community/posts/:postId`
**Auth:** Optional
**Description:** Lấy chi tiết một post cụ thể

**Request:**

```bash
GET /community/posts/507f1f77bcf86cd799439011
```

**Response:** `200 OK`

```json
{
  "postId": "507f1f77bcf86cd799439011",
  "itineraryId": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439013",
  "caption": "Amazing 5-day trip to Paris! The Eiffel Tower at sunset was breathtaking 🇫🇷✨",
  "visibility": "PUBLIC",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z",
  "user": {
    "userId": "507f1f77bcf86cd799439013",
    "fullName": "John Doe",
    "email": "john.doe@example.com"
  },
  "itinerary": {
    "itineraryId": "507f1f77bcf86cd799439012",
    "destination": "Paris, France",
    "startDate": "2024-01-15",
    "endDate": "2024-01-20",
    "numberOfTravelers": 2,
    "tripType": "COUPLE"
  },
  "likesCount": 15,
  "commentsCount": 8,
  "isLikedByCurrentUser": false,
  "recentComments": [
    {
      "commentId": "507f1f77bcf86cd799439020",
      "postId": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439021",
      "content": "Wow! How was the weather there?",
      "createdAt": "2024-01-16T09:30:00.000Z",
      "updatedAt": "2024-01-16T09:30:00.000Z",
      "user": {
        "userId": "507f1f77bcf86cd799439021",
        "fullName": "Jane Smith",
        "email": "jane.smith@example.com"
      }
    }
  ]
}
```

**Error Responses:**

```json
// 404 Not Found
{
  "statusCode": 404,
  "message": "Post not found",
  "error": "Not Found"
}

// 403 Forbidden - Private post
{
  "statusCode": 403,
  "message": "You do not have permission to view this post",
  "error": "Forbidden"
}
```

---

### **4. Get User Posts**

**Endpoint:** `GET /community/users/:userId/posts`
**Auth:** Optional
**Description:** Lấy danh sách posts của một user cụ thể

**Query Parameters:**

- `page`: number (default: 1)
- `limit`: number (default: 10, max: 50)

**Request:**

```bash
GET /community/users/507f1f77bcf86cd799439013/posts?page=1&limit=3
```

**Response:** `200 OK`

```json
[
  {
    "postId": "507f1f77bcf86cd799439011",
    "itineraryId": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439013",
    "caption": "Amazing 5-day trip to Paris! The Eiffel Tower at sunset was breathtaking 🇫🇷✨",
    "visibility": "PUBLIC",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z",
    "user": {
      "userId": "507f1f77bcf86cd799439013",
      "fullName": "John Doe",
      "email": "john.doe@example.com"
    },
    "itinerary": {
      "itineraryId": "507f1f77bcf86cd799439012",
      "destination": "Paris, France",
      "startDate": "2024-01-15",
      "endDate": "2024-01-20",
      "numberOfTravelers": 2,
      "tripType": "COUPLE"
    },
    "likesCount": 15,
    "commentsCount": 8,
    "isLikedByCurrentUser": false,
    "recentComments": []
  }
]
```

**Note:** Nếu current user xem posts của chính họ, sẽ thấy cả PRIVATE posts. Nếu xem posts của người khác, chỉ thấy PUBLIC và FRIENDS_ONLY posts.

---

### **5. Update Post**

**Endpoint:** `PUT /community/posts/:postId`
**Auth:** Required
**Description:** Cập nhật post (chỉ owner mới có thể update)

**Request Body:**

```json
{
  "caption": "Updated: Amazing 5-day trip to Paris! The Eiffel Tower at sunset was absolutely breathtaking 🇫🇷✨ Highly recommend visiting in spring!",
  "visibility": "FRIENDS_ONLY"
}
```

**Response:** `200 OK`

```json
{
  "postId": "507f1f77bcf86cd799439011",
  "itineraryId": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439013",
  "caption": "Updated: Amazing 5-day trip to Paris! The Eiffel Tower at sunset was absolutely breathtaking 🇫🇷✨ Highly recommend visiting in spring!",
  "visibility": "FRIENDS_ONLY",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-16T14:30:00.000Z",
  "user": {
    "userId": "507f1f77bcf86cd799439013",
    "fullName": "John Doe",
    "email": "john.doe@example.com"
  },
  "itinerary": {
    "itineraryId": "507f1f77bcf86cd799439012",
    "destination": "Paris, France",
    "startDate": "2024-01-15",
    "endDate": "2024-01-20",
    "numberOfTravelers": 2,
    "tripType": "COUPLE"
  },
  "likesCount": 15,
  "commentsCount": 8,
  "isLikedByCurrentUser": false,
  "recentComments": []
}
```

**Error Responses:**

```json
// 403 Forbidden - Not owner
{
  "statusCode": 403,
  "message": "You can only update your own posts",
  "error": "Forbidden"
}
```

---

### **6. Delete Post**

**Endpoint:** `DELETE /community/posts/:postId`
**Auth:** Required
**Description:** Xóa post (chỉ owner mới có thể delete)

**Request:**

```bash
DELETE /community/posts/507f1f77bcf86cd799439011
```

**Response:** `200 OK`

```json
{
  "message": "Post deleted successfully"
}
```

**Note:** Khi xóa post, tất cả comments và likes liên quan cũng sẽ bị xóa.

**Error Responses:**

```json
// 403 Forbidden - Not owner
{
  "statusCode": 403,
  "message": "You can only delete your own posts",
  "error": "Forbidden"
}
```

---

## 💬 **COMMENTS APIs**

### **7. Create Comment**

**Endpoint:** `POST /community/comments`
**Auth:** Required
**Description:** Tạo comment mới trên một post

**Request Body:**

```json
{
  "postId": "507f1f77bcf86cd799439011",
  "content": "Wow! This looks absolutely amazing! How was the weather during your trip? I'm planning to visit Paris next month 😍"
}
```

**Response:** `201 Created`

```json
{
  "commentId": "507f1f77bcf86cd799439020",
  "postId": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439021",
  "content": "Wow! This looks absolutely amazing! How was the weather during your trip? I'm planning to visit Paris next month 😍",
  "createdAt": "2024-01-16T09:30:00.000Z",
  "updatedAt": "2024-01-16T09:30:00.000Z",
  "user": {
    "userId": "507f1f77bcf86cd799439021",
    "fullName": "Jane Smith",
    "email": "jane.smith@example.com"
  }
}
```

**Validation Rules:**

- `postId`: Required, valid MongoDB ObjectId
- `content`: Required, max 1000 characters

**Error Responses:**

```json
// 403 Forbidden - Private post
{
  "statusCode": 403,
  "message": "You cannot comment on this private post",
  "error": "Forbidden"
}

// 404 Not Found - Post doesn't exist
{
  "statusCode": 404,
  "message": "Post not found",
  "error": "Not Found"
}
```

---

### **8. Get Comments by Post**

**Endpoint:** `GET /community/posts/:postId/comments`
**Auth:** Optional
**Description:** Lấy danh sách comments của một post

**Query Parameters:**

- `page`: number (default: 1)
- `limit`: number (default: 20, max: 100)

**Request:**

```bash
GET /community/posts/507f1f77bcf86cd799439011/comments?page=1&limit=5
```

**Response:** `200 OK`

```json
[
  {
    "commentId": "507f1f77bcf86cd799439020",
    "postId": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439021",
    "content": "Wow! This looks absolutely amazing! How was the weather during your trip? I'm planning to visit Paris next month 😍",
    "createdAt": "2024-01-16T09:30:00.000Z",
    "updatedAt": "2024-01-16T09:30:00.000Z",
    "user": {
      "userId": "507f1f77bcf86cd799439021",
      "fullName": "Jane Smith",
      "email": "jane.smith@example.com"
    }
  },
  {
    "commentId": "507f1f77bcf86cd799439022",
    "postId": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439023",
    "content": "The weather was perfect! Spring is definitely the best time to visit. You'll love it! 🌸",
    "createdAt": "2024-01-16T10:15:00.000Z",
    "updatedAt": "2024-01-16T10:15:00.000Z",
    "user": {
      "userId": "507f1f77bcf86cd799439023",
      "fullName": "John Doe",
      "email": "john.doe@example.com"
    }
  }
]
```

---

### **9. Update Comment**

**Endpoint:** `PUT /community/comments/:commentId`
**Auth:** Required
**Description:** Cập nhật comment (chỉ author mới có thể update)

**Request Body:**

```json
{
  "content": "Updated: Wow! This looks absolutely amazing! How was the weather during your trip? I'm planning to visit Paris next month and would love some tips! 😍🗼"
}
```

**Response:** `200 OK`

```json
{
  "commentId": "507f1f77bcf86cd799439020",
  "postId": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439021",
  "content": "Updated: Wow! This looks absolutely amazing! How was the weather during your trip? I'm planning to visit Paris next month and would love some tips! 😍🗼",
  "createdAt": "2024-01-16T09:30:00.000Z",
  "updatedAt": "2024-01-16T11:45:00.000Z",
  "user": {
    "userId": "507f1f77bcf86cd799439021",
    "fullName": "Jane Smith",
    "email": "jane.smith@example.com"
  }
}
```

**Error Responses:**

```json
// 403 Forbidden - Not author
{
  "statusCode": 403,
  "message": "You can only update your own comments",
  "error": "Forbidden"
}
```

---

### **10. Delete Comment**

**Endpoint:** `DELETE /community/comments/:commentId`
**Auth:** Required
**Description:** Xóa comment (chỉ author mới có thể delete)

**Request:**

```bash
DELETE /community/comments/507f1f77bcf86cd799439020
```

**Response:** `200 OK`

```json
{
  "message": "Comment deleted successfully"
}
```

**Error Responses:**

```json
// 403 Forbidden - Not author
{
  "statusCode": 403,
  "message": "You can only delete your own comments",
  "error": "Forbidden"
}
```

---

## ❤️ **LIKES APIs**

### **11. Toggle Like**

**Endpoint:** `POST /community/likes`
**Auth:** Required
**Description:** Like hoặc unlike một post (toggle functionality)

**Request Body:**

```json
{
  "postId": "507f1f77bcf86cd799439011"
}
```

**Response:** `200 OK`

```json
// First time like
{
  "isLiked": true,
  "likesCount": 16,
  "message": "Post liked successfully"
}

// Second time (unlike)
{
  "isLiked": false,
  "likesCount": 15,
  "message": "Post unliked successfully"
}
```

**Error Responses:**

```json
// 403 Forbidden - Private post
{
  "statusCode": 403,
  "message": "You cannot like this private post",
  "error": "Forbidden"
}

// 404 Not Found - Post doesn't exist
{
  "statusCode": 404,
  "message": "Post not found",
  "error": "Not Found"
}
```

---

### **12. Get Post Likes**

**Endpoint:** `GET /community/posts/:postId/likes`
**Auth:** Optional
**Description:** Lấy danh sách users đã like một post

**Query Parameters:**

- `page`: number (default: 1)
- `limit`: number (default: 20, max: 100)

**Request:**

```bash
GET /community/posts/507f1f77bcf86cd799439011/likes?page=1&limit=10
```

**Response:** `200 OK`

```json
[
  {
    "likeId": "507f1f77bcf86cd799439030",
    "userId": "507f1f77bcf86cd799439021",
    "postId": "507f1f77bcf86cd799439011",
    "createdAt": "2024-01-16T12:00:00.000Z",
    "user": {
      "userId": "507f1f77bcf86cd799439021",
      "fullName": "Jane Smith",
      "email": "jane.smith@example.com"
    }
  },
  {
    "likeId": "507f1f77bcf86cd799439031",
    "userId": "507f1f77bcf86cd799439024",
    "postId": "507f1f77bcf86cd799439011",
    "createdAt": "2024-01-16T13:15:00.000Z",
    "user": {
      "userId": "507f1f77bcf86cd799439024",
      "fullName": "Mike Johnson",
      "email": "mike.johnson@example.com"
    }
  }
]
```

---

# 📊 **API Summary**

## **Complete Endpoints List**

| #   | Method | Endpoint                            | Description                   | Auth | Response    |
| --- | ------ | ----------------------------------- | ----------------------------- | ---- | ----------- |
| 1   | POST   | `/community/posts`                  | Create post (share itinerary) | ✅   | 201 Created |
| 2   | GET    | `/community/posts`                  | Get public posts feed         | ❌   | 200 OK      |
| 3   | GET    | `/community/posts/:postId`          | Get post details              | ❌   | 200 OK      |
| 4   | GET    | `/community/users/:userId/posts`    | Get user posts                | ❌   | 200 OK      |
| 5   | PUT    | `/community/posts/:postId`          | Update post                   | ✅   | 200 OK      |
| 6   | DELETE | `/community/posts/:postId`          | Delete post                   | ✅   | 200 OK      |
| 7   | POST   | `/community/comments`               | Create comment                | ✅   | 201 Created |
| 8   | GET    | `/community/posts/:postId/comments` | Get post comments             | ❌   | 200 OK      |
| 9   | PUT    | `/community/comments/:commentId`    | Update comment                | ✅   | 200 OK      |
| 10  | DELETE | `/community/comments/:commentId`    | Delete comment                | ✅   | 200 OK      |
| 11  | POST   | `/community/likes`                  | Toggle like/unlike            | ✅   | 200 OK      |
| 12  | GET    | `/community/posts/:postId/likes`    | Get post likes                | ❌   | 200 OK      |

**📊 Total: 12 endpoints**

- **📝 Posts**: 6 endpoints (CRUD + list operations)
- **💬 Comments**: 4 endpoints (CRUD operations)
- **❤️ Likes**: 2 endpoints (toggle + list)

---

# 🔧 **Features & Capabilities**

## ✅ **Core Features**

- ✅ **Share Itinerary**: Convert itinerary thành community post
- ✅ **Privacy Controls**: PUBLIC, PRIVATE, FRIENDS_ONLY
- ✅ **Like System**: Toggle like/unlike với real-time count
- ✅ **Comment System**: Full CRUD cho comments
- ✅ **User Interaction**: View, like, comment trên posts của người khác
- ✅ **Pagination**: Tất cả list endpoints đều support pagination
- ✅ **Security**: Owner-only edit/delete, privacy validation
- ✅ **Data Population**: Auto-populate user và itinerary info

## 🚀 **Advanced Features**

- ✅ **Real-time Stats**: likesCount, commentsCount được update real-time
- ✅ **Recent Comments**: Show 3-5 recent comments trong post response
- ✅ **Smart Visibility**: Private posts không thể được interact bởi người khác
- ✅ **Duplicate Prevention**: Không thể tạo multiple posts cho cùng itinerary
- ✅ **Cascade Delete**: Xóa post sẽ xóa tất cả comments và likes liên quan
- ✅ **Input Validation**: Comprehensive validation với class-validator
- ✅ **Error Handling**: Detailed error messages và proper HTTP status codes

---

# 🧪 **Testing**

## **Run Tests**

```bash
# Run all tests
npm test

# Run community module tests only
npm test -- --testPathPattern=community

# Run with coverage
npm test -- --coverage
```

## **Test Results**

```bash
Test Suites: 4 passed, 4 total
Tests:       28 passed, 28 total
Snapshots:   0 total
Time:        5.828 s
```

## **Test Coverage**

- ✅ **Controller Tests**: 7 test suites covering all endpoints
- ✅ **Service Tests**: Business logic và security validation
- ✅ **Integration Tests**: End-to-end API testing
- ✅ **Error Handling Tests**: Exception scenarios

---

# 📈 **Performance & Optimization**

## **Database Indexes**

```javascript
// CommunityPost indexes
{ userId: 1, createdAt: -1 }     // User timeline
{ visibility: 1, createdAt: -1 } // Public feed
{ itineraryId: 1 }               // Find by itinerary

// Comment indexes
{ postId: 1, createdAt: -1 }     // Post comments
{ userId: 1, createdAt: -1 }     // User comments

// Like indexes
{ userId: 1, postId: 1 } (unique) // Prevent duplicates
{ postId: 1, createdAt: -1 }      // Post likes
```

## **Query Optimization**

- ✅ **Pagination**: Efficient skip/limit queries
- ✅ **Population**: Selective field population
- ✅ **Aggregation**: Count queries optimized
- ✅ **Indexing**: Strategic indexes cho common queries

---

# 🚨 **Error Handling**

## **HTTP Status Codes**

- `200 OK`: Successful GET, PUT, DELETE operations
- `201 Created`: Successful POST operations
- `400 Bad Request`: Invalid input data, malformed ObjectId
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions (not owner, private post)
- `404 Not Found`: Resource không tồn tại
- `409 Conflict`: Duplicate resource (post already exists)
- `500 Internal Server Error`: Server errors

## **Common Error Responses**

```json
// Validation Error
{
  "statusCode": 400,
  "message": ["caption must not exceed 500 characters"],
  "error": "Bad Request"
}

// Permission Error
{
  "statusCode": 403,
  "message": "You can only update your own posts",
  "error": "Forbidden"
}

// Not Found Error
{
  "statusCode": 404,
  "message": "Post not found",
  "error": "Not Found"
}
```

---

# 🔗 **Integration**

## **Dependencies**

- `@nestjs/mongoose`: MongoDB integration
- `mongoose`: ODM for MongoDB
- `class-validator`: DTO validation
- `class-transformer`: Data transformation

## **Module Integration**

- ✅ **AIModule**: References Itinerary schema
- ✅ **UsersModule**: References User schema
- ✅ **AppModule**: Imported và configured
- ✅ **DatabaseModule**: MongoDB connection

---

# 🎯 **Usage Scenarios**

## **1. Share Travel Experience**

```bash
# User shares their completed trip
POST /community/posts
{
  "itineraryId": "...",
  "caption": "Amazing 5-day trip to Paris! 🇫🇷",
  "visibility": "PUBLIC"
}
```

## **2. Browse Community Feed**

```bash
# Get latest shared trips
GET /community/posts?page=1&limit=10
```

## **3. Interact with Posts**

```bash
# Like a post
POST /community/likes
{ "postId": "..." }

# Comment on a post
POST /community/comments
{
  "postId": "...",
  "content": "Looks amazing! How was the weather?"
}
```

## **4. View User Profile**

```bash
# See all posts by a user
GET /community/users/507f1f77bcf86cd799439013/posts
```

---

**🎉 Community Module provides a complete social platform for travelers to share experiences, discover new destinations, and connect with fellow travelers!**
