# Project Structure & Organization

## Root Structure
```
NaturalWineDetector/
├── src/                    # Main source code
├── assets/                 # Static assets (images, fonts)
├── App.tsx                 # Root application component
├── index.ts                # Entry point
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── eslint.config.js        # Linting rules
└── README.md               # Project documentation
```

## Source Directory (`src/`)
```
src/
├── components/             # Reusable UI components
├── screens/                # Screen-level components
├── services/               # External API and device services
├── repositories/           # Data access layer (SQLite operations)
├── hooks/                  # Custom React hooks for business logic
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions and constants
└── context/                # React Context providers for global state
```

## Architectural Layers

### UI Layer
- **screens/**: Full-screen components (CameraScreen, HistoryScreen, etc.)
- **components/**: Reusable UI elements (WineAnalysisComponent, etc.)

### Business Logic Layer
- **hooks/**: Custom hooks for state management and business logic
- **services/**: External integrations (ChatGPT API, Location, Camera)

### Data Layer
- **repositories/**: Database operations and data persistence
- **types/**: TypeScript interfaces and type definitions

### Supporting
- **utils/**: Helper functions, constants, and utilities
- **context/**: Global state management with React Context

## Naming Conventions
- **Files**: PascalCase for components (e.g., `WineAnalysisComponent.tsx`)
- **Directories**: lowercase with hyphens if needed
- **Types**: PascalCase interfaces (e.g., `WineRecord`, `LocationData`)
- **Services**: PascalCase classes ending in "Service" (e.g., `ChatGPTService`)
- **Hooks**: camelCase starting with "use" (e.g., `useWineAnalysis`)

## File Organization Rules
- One main export per file
- Co-locate related types with their implementations
- Keep components focused and single-responsibility
- Separate business logic from UI components using custom hooks
- Use barrel exports (index.ts) for clean imports

## Import Structure
```typescript
// External libraries first
import React from 'react';
import { View, Text } from 'react-native';

// Internal imports by layer (services, hooks, types, utils)
import { ChatGPTService } from '../services/ChatGPTService';
import { useWineAnalysis } from '../hooks/useWineAnalysis';
import { WineRecord } from '../types/WineTypes';
import { formatDate } from '../utils/dateUtils';
```