# AniTracker+ API Documentation

## Models

### User

- id : integer (primary key, auto-increment)
- fullName : string (required)
- username : string (unique, required)
- email : string (unique, required)
- password : string (required, min 6 characters, auto-hashed)
- createdAt : datetime
- updatedAt : datetime

### Anime

- id : integer (primary key, auto-increment)
- mal_id : integer (unique, required)
- url : string (unique, required)
- title : string (unique, required)
- title_english : string (unique, nullable)
- title_japanese : string (unique, nullable)
- image_url : string (nullable)
- trailer_url : string (nullable)
- genre : array of strings (default: [])
- synopsis : text (nullable)
- type : string (nullable)
- episodes : integer (nullable)
- status : string (nullable)
- source : string (nullable)
- duration : string (nullable)
- rating : string (nullable)
- score : float (nullable, min: 0)
- rank : integer (nullable, min: 1)
- popularity : integer (nullable, min: 1)
- aired_from : date (nullable)
- aired_to : date (nullable)
- season : string (nullable)
- year : integer (nullable, min: 1900)
- createdAt : datetime
- updatedAt : datetime

### UserAnime

- id : integer (primary key, auto-increment)
- UserId : integer (required, foreign key → Users.id)
- AnimeId : integer (required, foreign key → Animes.id)
- watch_status : string (default: "In Progress")
- score : integer (nullable, min: 0)
- episodes_watched : integer (nullable, min: 0, default: 0)
- notes : text (nullable)
- createdAt : datetime
- updatedAt : datetime

### Genre

- id : integer (primary key, auto-increment)
- mal_id : integer (required)
- name : string (required)
- url : string (required, valid URL)
- icon : string (required)
- description : string (required)
- createdAt : datetime
- updatedAt : datetime

### UserGenre

- id : integer (primary key, auto-increment)
- UserId : integer (required, foreign key → Users.id)
- GenreId : integer (required, foreign key → Genres.id)
- createdAt : datetime
- updatedAt : datetime

## Relationships

### One-to-Many

- User has many UserAnime
- User has many UserGenre
- Anime has many UserAnime
- Genre has many UserGenre

### Many-to-Many

- User and Anime through UserAnime
- User and Genre through UserGenre

## Endpoints

### Public Routes

- `POST /register`
- `POST /login`
- `POST /login/google`
- `GET /pub/animes`
- `GET /pub/animes/:id`
- `GET /pub/animes/popular`
- `GET /pub/genres`

### Authenticated Routes

- `GET /animes`
- `POST /animes/:id`
- `GET /animes/:id`
- `PUT /animes/:id`
- `DELETE /animes/:id`
- `GET /animes/genres`
- `POST /animes/genres/:id`
- `DELETE /animes/genres/:id`
- `GET /animes/recommendation`

---

## Authentication

All authenticated routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## 1. POST /register

Create a new user account.

**Request Body:**

```json
{
  "fullName": "string",
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response (201 - Created):**

```json
{
  "message": "User created successfully",
  "user": {
    "id": "integer",
    "fullName": "string",
    "username": "string",
    "email": "string"
  }
}
```

**Response (400 - Bad Request):**

```json
{
  "message": "Email must be unique"
}
```

OR

```json
{
  "message": "Username must be unique"
}
```

OR

```json
{
  "message": "Password must be at least 6 characters"
}
```

OR other validation errors

---

## 2. POST /login

Login with email/username and password.

**Request Body:**

```json
{
  "username": "string (optional)",
  "email": "string (optional)",
  "password": "string"
}
```

_Note: Either username OR email is required_

**Response (200 - OK):**

```json
{
  "access_token": "string",
  "user": {
    "id": "integer",
    "fullName": "string",
    "username": "string",
    "email": "string"
  }
}
```

**Response (400 - Bad Request):**

```json
{
  "message": "Email or Username is required"
}
```

OR

```json
{
  "message": "Password is required"
}
```

**Response (401 - Unauthorized):**

```json
{
  "message": "Invalid email/username/password"
}
```

---

## 3. POST /login/google

Login or register using Google OAuth.

**Request Body:**

```json
{
  "googleToken": "string"
}
```

**Response (200 - OK):**

```json
{
  "message": "Login Success",
  "access_token": "string",
  "user": {
    "id": "integer",
    "fullName": "string",
    "username": "string",
    "email": "string"
  }
}
```

**Response (500 - Internal Server Error):**

```json
{
  "message": "Internal server error"
}
```

_Note: Returns 500 for missing googleToken or verification failures_

---

## 4. GET /pub/animes

Get all animes with optional filtering, searching, sorting, and pagination.

**Query Parameters (all optional):**

- `search`: string (search by title, case-insensitive)
- `filter`: string (filter by genre)
- `sort`: string (sort by field, prefix with '-' for descending)
- `page[size]`: integer (items per page, default: 10, max: 100)
- `page[number]`: integer (page number, default: 1)

**Response (200 - OK):**

```json
{
  "page": "integer",
  "data": [
    {
      "id": "integer",
      "mal_id": "integer",
      "url": "string",
      "title": "string",
      "title_english": "string",
      "title_japanese": "string",
      "image_url": "string",
      "trailer_url": "string",
      "genre": ["string"],
      "synopsis": "string",
      "type": "string",
      "episodes": "integer",
      "status": "string",
      "source": "string",
      "duration": "string",
      "rating": "string",
      "score": "float",
      "rank": "integer",
      "popularity": "integer",
      "aired_from": "date",
      "aired_to": "date",
      "season": "string",
      "year": "integer"
    }
  ],
  "totalData": "integer",
  "totalPage": "integer",
  "dataPerPage": "integer"
}
```

**Response (400 - Bad Request):**

```json
{
  "message": "Cannot sort by 'field' - invalid field"
}
```

**Notes:**

- Returns empty data array if page number exceeds total pages
- Invalid page parameters use defaults
- Genre filter uses PostgreSQL array contains operation

---

## 5. GET /pub/animes/:id

Get specific anime by ID.

**URL Parameters:**

- `id`: integer

**Response (200 - OK):**

```json
{
  "id": "integer",
  "mal_id": "integer",
  "url": "string",
  "title": "string",
  "title_english": "string",
  "title_japanese": "string",
  "image_url": "string",
  "trailer_url": "string",
  "genre": ["string"],
  "synopsis": "string",
  "type": "string",
  "episodes": "integer",
  "status": "string",
  "source": "string",
  "duration": "string",
  "rating": "string",
  "score": "float",
  "rank": "integer",
  "popularity": "integer",
  "aired_from": "date",
  "aired_to": "date",
  "season": "string",
  "year": "integer"
}
```

**Response (404 - Not Found):**

```json
{
  "message": "Anime not Found"
}
```

**Response (500 - Internal Server Error):**

```json
{
  "message": "Internal server error"
}
```

_Note: Returns 500 for invalid ID format_

---

## 6. GET /pub/animes/popular

Get popular airing animes from external Jikan API.

**Response (200 - OK):**

```json
[
  {
    "mal_id": "integer",
    "title": "string",
    "images": "object",
    "score": "float",
    "genres": ["object"]
  }
]
```

**Response (500 - Internal Server Error):**

```json
{
  "message": "Internal server error"
}
```

_Note: Returns 500 for external API failures_

---

## 7. GET /pub/genres

Get all available genres.

**Response (200 - OK):**

```json
[
  {
    "id": "integer",
    "mal_id": "integer",
    "name": "string",
    "url": "string",
    "icon": "string",
    "description": "string"
  }
]
```

**Response (500 - Internal Server Error):**

```json
{
  "message": "Internal server error"
}
```

---

## 8. GET /animes

Get all animes in current user's list.

**Headers:**

```json
{
  "Authorization": "Bearer <access_token>"
}
```

**Response (200 - OK):**

```json
[
  {
    "id": "integer",
    "UserId": "integer",
    "AnimeId": "integer",
    "watch_status": "string",
    "score": "integer",
    "episodes_watched": "integer",
    "notes": "string",
    "Anime": {
      "title": "string",
      "title_english": "string",
      "title_japanese": "string",
      "image_url": "string",
      "trailer_url": "string",
      "genre": ["string"],
      "synopsis": "string",
      "type": "string",
      "episodes": "integer",
      "status": "string",
      "source": "string",
      "duration": "string",
      "rating": "string",
      "score": "float",
      "rank": "integer",
      "popularity": "integer",
      "aired_from": "date",
      "aired_to": "date",
      "season": "string",
      "year": "integer"
    }
  }
]
```

**Response (401 - Unauthorized):**

```json
{
  "message": "Invalid token"
}
```

**Notes:**

- Returns empty array if user has no animes
- Excludes createdAt and updatedAt fields

---

## 9. POST /animes/:id

Add anime to user's list.

**Headers:**

```json
{
  "Authorization": "Bearer <access_token>"
}
```

**URL Parameters:**

- `id`: integer (anime ID)

**Response (201 - Created):**

```json
{
  "id": "integer",
  "UserId": "integer",
  "AnimeId": "integer"
}
```

**Response (400 - Bad Request):**

```json
{
  "message": "Anime already in your list"
}
```

**Response (401 - Unauthorized):**

```json
{
  "message": "Invalid token"
}
```

**Response (404 - Not Found):**

```json
{
  "message": "Anime not found"
}
```

---

## 10. GET /animes/:id

Get specific anime from user's list.

**Headers:**

```json
{
  "Authorization": "Bearer <access_token>"
}
```

**URL Parameters:**

- `id`: integer (UserAnime ID, not Anime ID)

**Response (200 - OK):**

```json
{
  "id": "integer",
  "UserId": "integer",
  "AnimeId": "integer",
  "watch_status": "string",
  "score": "integer",
  "episodes_watched": "integer",
  "notes": "string",
  "Anime": {
    "title": "string",
    "title_english": "string",
    "title_japanese": "string",
    "image_url": "string",
    "trailer_url": "string",
    "genre": ["string"],
    "synopsis": "string",
    "type": "string",
    "episodes": "integer",
    "status": "string",
    "source": "string",
    "duration": "string",
    "rating": "string",
    "score": "float",
    "rank": "integer",
    "popularity": "integer",
    "aired_from": "date",
    "aired_to": "date",
    "season": "string",
    "year": "integer"
  }
}
```

**Response (401 - Unauthorized):**

```json
{
  "message": "Invalid token"
}
```

**Response (403 - Forbidden):**

```json
{
  "message": "You are not authorized"
}
```

**Response (404 - Not Found):**

```json
{
  "message": "Anime not found"
}
```

---

## 11. PUT /animes/:id

Update anime in user's list.

**Headers:**

```json
{
  "Authorization": "Bearer <access_token>"
}
```

**URL Parameters:**

- `id`: integer (UserAnime ID)

**Request Body:**

```json
{
  "score": "integer",
  "episodes_watched": "integer",
  "notes": "string"
}
```

**Response (200 - OK):**

```json
{
  "message": "Anime has been updated"
}
```

**Response (400 - Bad Request):**

```json
{
  "message": "Anime data cannot be empty"
}
```

OR

```json
{
  "message": "Score cannot be empty"
}
```

OR

```json
{
  "message": "Episodes watched cannot be empty"
}
```

OR

```json
{
  "message": "Episodes watched cannot exceed total episodes"
}
```

**Response (401 - Unauthorized):**

```json
{
  "message": "Invalid token"
}
```

**Response (403 - Forbidden):**

```json
{
  "message": "You're not authorized"
}
```

**Response (404 - Not Found):**

```json
{
  "message": "Anime not found"
}
```

**Notes:**

- watch_status is automatically set based on episodes_watched:
  - "Completed" if episodes_watched equals total episodes
  - "In Progress" otherwise

---

## 12. DELETE /animes/:id

Remove anime from user's list.

**Headers:**

```json
{
  "Authorization": "Bearer <access_token>"
}
```

**URL Parameters:**

- `id`: integer (UserAnime ID)

**Response (200 - OK):**

```json
{
  "message": "Anime has been deleted"
}
```

**Response (401 - Unauthorized):**

```json
{
  "message": "Invalid token"
}
```

**Response (403 - Forbidden):**

```json
{
  "message": "You're not authorized"
}
```

**Response (404 - Not Found):**

```json
{
  "message": "Anime not found"
}
```

---

## 13. GET /animes/genres

Get user's favorite genres.

**Headers:**

```json
{
  "Authorization": "Bearer <access_token>"
}
```

**Response (200 - OK):**

```json
[
  {
    "id": "integer",
    "UserId": "integer",
    "GenreId": "integer",
    "Genre": {
      "id": "integer",
      "mal_id": "integer",
      "name": "string",
      "url": "string",
      "icon": "string",
      "description": "string"
    }
  }
]
```

**Response (401 - Unauthorized):**

```json
{
  "message": "Invalid token"
}
```

**Response (404 - Not Found):**

```json
{
  "message": "Genres not found"
}
```

---

## 14. POST /animes/genres/:id

Add genre to user's favorites.

**Headers:**

```json
{
  "Authorization": "Bearer <access_token>"
}
```

**URL Parameters:**

- `id`: integer (Genre ID)

**Response (201 - Created):**

```json
{
  "id": "integer",
  "UserId": "integer",
  "GenreId": "integer"
}
```

**Response (401 - Unauthorized):**

```json
{
  "message": "Invalid token"
}
```

**Response (404 - Not Found):**

```json
{
  "message": "Genres not found"
}
```

_Note: This error occurs when genres table is empty_

---

## 15. DELETE /animes/genres/:id

Remove genre from user's favorites.

**Headers:**

```json
{
  "Authorization": "Bearer <access_token>"
}
```

**URL Parameters:**

- `id`: integer (Genre ID)

**Response (200 - OK):**

```json
{
  "message": "Genres deleted from favorite"
}
```

**Response (401 - Unauthorized):**

```json
{
  "message": "Invalid token"
}
```

**Response (404 - Not Found):**

```json
{
  "message": "Genres not found"
}
```

---

## 16. GET /animes/recommendation

Get anime recommendations based on user's favorite genres using Google Gemini AI.

**Headers:**

```json
{
  "Authorization": "Bearer <access_token>"
}
```

**Response (200 - OK):**

```json
{
  "recommendations": [
    {
      "id": "integer",
      "mal_id": "integer",
      "url": "string",
      "title": "string",
      "title_english": "string",
      "title_japanese": "string",
      "image_url": "string",
      "trailer_url": "string",
      "genre": ["string"],
      "synopsis": "string",
      "type": "string",
      "episodes": "integer",
      "status": "string",
      "source": "string",
      "duration": "string",
      "rating": "string",
      "score": "float",
      "rank": "integer",
      "popularity": "integer",
      "aired_from": "date",
      "aired_to": "date",
      "season": "string",
      "year": "integer"
    }
  ],
  "basedOnGenres": ["string"],
  "method": "string"
}
```

**Response (401 - Unauthorized):**

```json
{
  "message": "Invalid token"
}
```

**Notes:**

- Returns exactly 6 anime recommendations
- `method` can be:
  - "gemini": Successfully used AI recommendations
  - "fallback-random": AI failed, returned random animes
- Works even without favorite genres (empty basedOnGenres array)
- Uses Google Gemini AI with fallback to random selection

---

## Global Error Responses

### 401 - Unauthorized

```json
{
  "message": "Invalid token"
}
```

### 500 - Internal Server Error

```json
{
  "message": "Internal server error"
}
```

---

## Additional Notes

### Password Requirements

- Minimum 6 characters
- Automatically hashed using bcrypt before storage

### Token Format

- JWT tokens are used for authentication
- Include only the user ID in the payload
- Must be sent as Bearer token in Authorization header

### Database Constraints

- All foreign keys have CASCADE on update and delete
- Unique constraints on: User.email, User.username, Anime.mal_id, Anime.url, Anime.title
- Default values: UserAnime.watch_status = "In Progress", Anime.genre = []

### Validation Rules

- Email must be valid email format
- URLs must be valid URL format (for Genre.url)
- Numeric fields have minimum value constraints
- Required fields cannot be null or empty strings
