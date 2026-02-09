# API Documentation

## Base URL

- **Development**: `http://localhost:5001/grabber/us-east1`
- **Production**: `https://us-east1-grabber.cloudfunctions.net`

---

## Endpoints

### POST /getVideoInfo

Fetch metadata for a video.

**Request**
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Response (200)**
```json
{
  "data": {
    "id": "dQw4w9WgXcQ",
    "title": "Video Title",
    "description": "Video description",
    "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    "duration": 212,
    "platform": "youtube",
    "uploader": "Channel Name",
    "formats": [
      {
        "formatId": "22",
        "extension": "mp4",
        "quality": "720p",
        "resolution": "1280x720",
        "fileSize": 50000000,
        "hasAudio": true,
        "hasVideo": true
      }
    ]
  },
  "requestId": "uuid"
}
```

---

### POST /downloadVideo

Download a video in the specified format.

**Request**
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "formatId": "22"
}
```

**Response (200)**
```json
{
  "data": {
    "downloadUrl": "https://storage.googleapis.com/...",
    "fileName": "Video Title.mp4",
    "mimeType": "video/mp4",
    "size": 50000000,
    "expiresAt": 1707400000000
  },
  "requestId": "uuid"
}
```

---

### GET /healthCheck

**Response (200)**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-08T12:00:00.000Z",
  "version": "1.0.0"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  },
  "requestId": "uuid"
}
```

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request body |
| `UNSUPPORTED_PLATFORM` | 400 | URL is not from YouTube or Instagram |
| `VIDEO_NOT_FOUND` | 404 | Video not found or unavailable |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `DOWNLOAD_ERROR` | 500 | Failed to download video |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Rate Limiting

- **Limit**: 10 requests per minute per IP
- **Window**: 60 seconds (sliding)
- **Response**: 429 with `RATE_LIMIT_EXCEEDED` error code
