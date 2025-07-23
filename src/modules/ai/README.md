# AI Module - TravelMate AI Server

This module handles all AI-powered features of the TravelMate AI application, including travel planning, itinerary generation, image analysis, and general AI chat capabilities.

## 📁 Module Structure

```
ai/
├── controllers/                # API endpoints controllers
│   ├── ai.controller.ts        # Main AI endpoints
│   └── itinerary.controller.ts # Structured itinerary endpoints
├── dto/                        # Data Transfer Objects
│   ├── ai-chat.dto.ts          # DTOs for AI chat requests
│   └── itinerary.dto.ts        # DTOs for itinerary generation
├── interfaces/                 # TypeScript interfaces
│   └── openrouter.interface.ts # OpenRouter API interfaces
├── schemas/                    # MongoDB schemas
│   ├── activity.schema.ts      # Activity schema
│   ├── itinerary.schema.ts     # Itinerary schema
│   └── itinerary-day.schema.ts # Itinerary day schema
├── services/                   # Business logic services
│   ├── openrouter.service.ts   # OpenRouter API integration
│   ├── travel-ai.service.ts    # Travel-specific AI features
│   └── itinerary-ai.service.ts # Structured itinerary generation
├── ai.module.ts                # Module definition
└── index.ts                    # Module exports
```

## 🔗 API Endpoints

### 1. Chat Completion

Advanced chat completion with multi-modal support.

**Endpoint:** `POST /ai/chat`

**Request:**
```json
{
  "model": "google/gemini-2.0-flash-001",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Tell me about this travel destination:"
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "https://example.com/bali-beach.jpg"
          }
        }
      ]
    }
  ],
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**Response:**
```json
{
  "id": "chat-abc123",
  "model": "google/gemini-2.0-flash-001",
  "content": "This appears to be a beautiful beach in Bali, Indonesia. Bali is known for its stunning beaches, vibrant culture, and lush landscapes...",
  "usage": {
    "promptTokens": 150,
    "completionTokens": 250,
    "totalTokens": 400
  },
  "finishReason": "stop",
  "createdAt": "2023-06-15T10:30:00Z"
}
```

### 2. Simple Text Completion

Simple text-based AI completion.

**Endpoint:** `POST /ai/text`

**Request:**
```json
{
  "message": "What are the best travel destinations in Southeast Asia?",
  "model": "google/gemini-2.0-flash-001",
  "temperature": 0.7
}
```

**Response:**
```json
{
  "id": "text-def456",
  "model": "google/gemini-2.0-flash-001",
  "content": "Southeast Asia offers many incredible destinations. Here are some of the best: 1. Bali, Indonesia - Known for beaches, culture, and spirituality...",
  "usage": {
    "promptTokens": 10,
    "completionTokens": 300,
    "totalTokens": 310
  },
  "finishReason": "stop",
  "createdAt": "2023-06-15T10:35:00Z"
}
```

### 3. Image Analysis

Analyze images with custom questions.

**Endpoint:** `POST /ai/image-analysis`

**Request:**
```json
{
  "imageUrl": "https://example.com/travel-photo.jpg",
  "question": "What is in this image? Is this a good travel destination?",
  "model": "google/gemini-2.0-flash-001"
}
```

**Response:**
```json
{
  "id": "img-ghi789",
  "model": "google/gemini-2.0-flash-001",
  "content": "The image shows the Eiffel Tower in Paris, France. This is definitely a popular travel destination known for its romantic atmosphere...",
  "usage": {
    "promptTokens": 120,
    "completionTokens": 200,
    "totalTokens": 320
  },
  "finishReason": "stop",
  "createdAt": "2023-06-15T10:40:00Z"
}
```

### 4. Travel Plan Generation

Generate comprehensive travel plans.

**Endpoint:** `POST /ai/travel/plan`

**Request:**
```json
{
  "destination": "Tokyo, Japan",
  "duration": "7 days",
  "budget": "$2000-3000",
  "interests": "culture, food, technology, temples",
  "travelStyle": "mid-range",
  "model": "google/gemini-2.0-flash-001"
}
```

**Response:**
```json
{
  "id": "plan-jkl012",
  "model": "google/gemini-2.0-flash-001",
  "content": "# 7-Day Tokyo Travel Plan\n\n## Overview\nThis 7-day itinerary covers the best of Tokyo with a mid-range budget...\n\n## Day 1: Arrival & Shinjuku\n- Morning: Arrive at Narita Airport...",
  "usage": {
    "promptTokens": 50,
    "completionTokens": 800,
    "totalTokens": 850
  },
  "finishReason": "stop",
  "createdAt": "2023-06-15T10:45:00Z"
}
```

### 5. Destination Information

Get detailed information about a travel destination.

**Endpoint:** `GET /ai/travel/destination-info?destination=Barcelona&model=google/gemini-2.0-flash-001`

**Response:**
```json
{
  "id": "dest-mno345",
  "model": "google/gemini-2.0-flash-001",
  "content": "# Barcelona, Spain\n\n## Overview\nBarcelona is the cosmopolitan capital of Spain's Catalonia region...\n\n## Best Time to Visit\nSpring (April to June) and fall (September to November)...",
  "usage": {
    "promptTokens": 15,
    "completionTokens": 600,
    "totalTokens": 615
  },
  "finishReason": "stop",
  "createdAt": "2023-06-15T10:50:00Z"
}
```

### 6. Destination Image Analysis

Analyze destination images.

**Endpoint:** `POST /ai/travel/destination-image`

**Request:**
```json
{
  "imageUrl": "https://example.com/santorini.jpg",
  "model": "google/gemini-2.0-flash-001"
}
```

**Response:**
```json
{
  "id": "destimg-pqr678",
  "model": "google/gemini-2.0-flash-001",
  "content": "This image shows the iconic white buildings with blue domes of Santorini, Greece. This is one of the most photographed destinations in the world...",
  "usage": {
    "promptTokens": 100,
    "completionTokens": 300,
    "totalTokens": 400
  },
  "finishReason": "stop",
  "createdAt": "2023-06-15T10:55:00Z"
}
```

### 7. Itinerary Generation

Generate day-by-day itineraries.

**Endpoint:** `GET /ai/travel/itinerary?destination=Paris&days=3&interests=art,history,cuisine&model=google/gemini-2.0-flash-001`

**Response:**
```json
{
  "id": "itin-stu901",
  "model": "google/gemini-2.0-flash-001",
  "content": "# 3-Day Paris Itinerary\n\n## Day 1: Classic Paris\n- Morning: Eiffel Tower (8:30-11:00)\n- Lunch: Café near Champ de Mars...",
  "usage": {
    "promptTokens": 30,
    "completionTokens": 700,
    "totalTokens": 730
  },
  "finishReason": "stop",
  "createdAt": "2023-06-15T11:00:00Z"
}
```

### 8. Local Recommendations

Get local recommendations for a destination.

**Endpoint:** `GET /ai/travel/recommendations?destination=Rome&category=restaurants&model=google/gemini-2.0-flash-001`

**Response:**
```json
{
  "id": "rec-vwx234",
  "model": "google/gemini-2.0-flash-001",
  "content": "# Best Restaurants in Rome\n\n## Authentic Local Spots\n1. **Trattoria Da Enzo al 29** - Located in Trastevere, this small family-run restaurant...",
  "usage": {
    "promptTokens": 20,
    "completionTokens": 500,
    "totalTokens": 520
  },
  "finishReason": "stop",
  "createdAt": "2023-06-15T11:05:00Z"
}
```

### 9. Budget Estimates

Get budget estimates for a trip.

**Endpoint:** `GET /ai/travel/budget?destination=London&duration=5%20days&style=mid-range&groupSize=2&model=google/gemini-2.0-flash-001`

**Response:**
```json
{
  "id": "budget-yz567",
  "model": "google/gemini-2.0-flash-001",
  "content": "# 5-Day London Budget Estimate (Mid-Range, 2 People)\n\n## Total Estimated Cost: $2,800-3,400\n\n## Breakdown\n- **Accommodation**: $800-1,000 (Mid-range hotel, 4 nights)...",
  "usage": {
    "promptTokens": 25,
    "completionTokens": 400,
    "totalTokens": 425
  },
  "finishReason": "stop",
  "createdAt": "2023-06-15T11:10:00Z"
}
```

### 10. Structured Itinerary Generation

Generate and save structured itineraries.

**Endpoint:** `POST /itinerary/generate`

**Request:**
```json
{
  "destination": "Tokyo, Japan",
  "startDate": "2024-03-15",
  "endDate": "2024-03-20",
  "numberOfTravelers": 2,
  "preferences": ["culture", "food", "technology", "temples"],
  "tripType": "mid-range",
  "budget": "$2000-3000",
  "model": "google/gemini-2.0-flash-001"
}
```

**Response:**
```json
{
  "itineraryId": "itin-12345",
  "destination": "Tokyo, Japan",
  "startDate": "2024-03-15",
  "endDate": "2024-03-20",
  "numberOfTravelers": 2,
  "preferences": ["culture", "food", "technology", "temples"],
  "tripType": "mid-range",
  "aiSummary": "A 6-day exploration of Tokyo's unique blend of traditional culture and cutting-edge technology...",
  "aiSuggestions": [
    "Purchase a 5-day Tokyo Metro pass to save on transportation",
    "Visit Tsukiji Outer Market early in the morning",
    "Book tickets for teamLab Borderless in advance"
  ],
  "weatherSummary": "Mild spring weather with occasional light rain",
  "chanceOfRain": 30,
  "temperatureMin": 10,
  "temperatureMax": 18,
  "days": [
    {
      "dayNumber": 1,
      "date": "2024-03-15",
      "weatherSummary": "Partly cloudy",
      "temperatureMin": 9,
      "temperatureMax": 16,
      "chanceOfRain": 20,
      "activities": [
        {
          "title": "Arrival & Check-in",
          "description": "Arrive at Narita Airport, transfer to hotel in Shinjuku",
          "location": "Shinjuku, Tokyo",
          "startTime": "14:00",
          "endTime": "16:00",
          "category": "transport",
          "estimatedCost": 3000,
          "priority": 1,
          "tags": ["essential"]
        },
        {
          "title": "Shinjuku Exploration",
          "description": "Walk around Shinjuku, visit Tokyo Metropolitan Government Building for free views",
          "location": "Shinjuku, Tokyo",
          "startTime": "17:00",
          "endTime": "19:00",
          "category": "sightseeing",
          "estimatedCost": 0,
          "priority": 2,
          "tags": ["views", "free"]
        }
      ]
    }
  ],
  "totalEstimatedCost": 250000,
  "createdAt": "2023-06-15T11:15:00Z",
  "updatedAt": "2023-06-15T11:15:00Z"
}
```

### 11. AI Service Health Check

Check AI service health.

**Endpoint:** `GET /ai/health`

**Response:**
```json
{
  "status": "healthy",
  "openrouter": true
}
```

## 🔧 Usage Examples

See the `examples` directory for detailed usage examples:
- `ai-usage-examples.ts`: Examples of using the AI services
- `itinerary-usage-examples.ts`: Examples of using the structured itinerary services