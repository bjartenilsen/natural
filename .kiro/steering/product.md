# Natural Wine Detector - Product Overview

## What It Is
A React Native mobile app that uses ChatGPT's image analysis to identify natural wines from photos. Users can take pictures of wine bottles, get AI-powered assessments with confidence scores, and maintain a personal wine history with location data and notes.

## Core Features
- **AI Wine Analysis**: Photo-based natural wine detection using OpenAI's ChatGPT API
- **Local Data Storage**: All wine records stored locally using SQLite for offline access
- **Location Tracking**: GPS coordinates captured during photo sessions
- **Personal Wine Journal**: Track consumption status and add personal notes
- **Wine History**: Browse past analyses with full details and images

## Target Platform
Android-first mobile application with React Native for potential iOS expansion.

## Key User Flows
1. **Analyze Wine**: Camera → Photo → AI Analysis → Results with confidence score
2. **Log Experience**: Analysis → Consumption tracking → Notes → Save to history
3. **Browse History**: View past wines → Filter by consumption → Access detailed records

## Business Logic
- Images compressed before API calls to optimize costs
- All data persists locally for offline functionality
- Location data optional but enhances user experience
- Clean architecture with separation of UI, business logic, and data layers