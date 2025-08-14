# WebClone Pro

## Overview

WebClone Pro is a full-stack web application that allows users to clone entire websites by downloading their HTML, CSS, JavaScript, images, fonts, and other assets into a downloadable ZIP file. The application features a modern React frontend with real-time progress monitoring and a Node.js/Express backend that handles web scraping and file processing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development tooling
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system and dark theme
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for clone job management
- **Web Scraping**: Custom scraping service using Cheerio for DOM parsing and node-fetch for HTTP requests
- **File Processing**: Archiver library for ZIP file generation
- **Development**: Hot module replacement with Vite middleware in development mode

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **In-Memory Storage**: Fallback MemStorage implementation for development/testing
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **File Storage**: Local filesystem for temporary ZIP files with cleanup

### Authentication and Authorization
- **Session-based Authentication**: Express sessions with PostgreSQL backing store
- **Security**: CORS configuration and request validation using Zod schemas
- **Error Handling**: Centralized error handling middleware with proper status codes

### External Dependencies

#### Core Frontend Libraries
- **React Ecosystem**: React 18, React DOM, React Hook Form
- **State Management**: TanStack React Query for server state synchronization
- **UI Framework**: Radix UI primitives with Shadcn/ui abstraction layer
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer
- **Date Handling**: date-fns for date manipulation and formatting
- **Validation**: Zod for runtime type checking and form validation

#### Backend Services
- **Database**: Neon Database (serverless PostgreSQL) via @neondatabase/serverless
- **ORM**: Drizzle ORM with drizzle-kit for migrations
- **Web Scraping**: Cheerio for server-side DOM manipulation
- **HTTP Client**: node-fetch for making HTTP requests during scraping
- **File Processing**: Archiver for ZIP file creation and compression
- **Session Storage**: connect-pg-simple for PostgreSQL session management

#### Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Code Quality**: ESBuild for production bundling
- **Development Experience**: Replit-specific plugins for error overlays and cartographer
- **Type Checking**: TypeScript with strict configuration and path mapping

#### Third-party Integrations
- **Cloud Database**: Neon Database for managed PostgreSQL hosting
- **Font Services**: Google Fonts for typography (Inter, Architects Daughter, DM Sans, Fira Code, Geist Mono)
- **Development Platform**: Replit-specific integrations for development banner and error handling