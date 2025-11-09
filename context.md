# Project Context: FashionAI - AI-Powered Fashion Assistant

## Overview
FashionAI is a modern e-commerce platform that leverages artificial intelligence to revolutionize the fashion shopping experience. The application provides personalized styling recommendations, virtual try-on capabilities, and intelligent wardrobe management through advanced AI technologies.

## Main Purpose and Aim
The primary goal of FashionAI is to democratize access to professional fashion styling by making AI-powered fashion assistance accessible to everyone. The project aims to:

- **Solve the Problem**: Traditional fashion shopping is time-consuming and often results in poor purchase decisions due to lack of personalized guidance
- **Bridge the Gap**: Connect consumers with professional-level fashion expertise through AI
- **Enhance Experience**: Provide virtual try-on, outfit suggestions, and style analysis without physical store visits
- **Drive Innovation**: Showcase the potential of AI in e-commerce and fashion technology

## Core Functionalities

### 🤖 AI-Powered Features
- **Virtual Try-On**: AI-generated images showing how clothes look on users using their uploaded photos
- **Personalized Recommendations**: Style quiz and AI chat for fashion advice
- **Wardrobe Analysis**: Upload and analyze clothing items with automatic tagging
- **Outfit Suggestions**: Generate complete outfit combinations from user's wardrobe
- **Style Quiz**: Comprehensive assessment to determine fashion preferences

### 🛍️ E-Commerce Platform
- **Product Catalog**: Browse curated fashion items with filtering and search
- **Shopping Cart & Wishlist**: Standard e-commerce functionality
- **Secure Checkout**: Multi-step payment process
- **User Profiles**: Photo uploads and preference management

### 👤 User Management
- **Authentication**: Secure login/signup with Supabase Auth
- **Profile Management**: Upload photos, manage preferences
- **Credit System**: Tiered access to AI features

## Credit System and Pricing

### Credit Tiers
- **Free**: ₹0/month - 5 AI generations per day
- **Pro**: ₹499/month - 50 AI generations per day  
- **Elite**: ₹999/month - Unlimited AI generations per day

### Credit Usage
- Virtual try-on: 1 credit per image
- Wardrobe try-on: 1 credit per image
- Style analysis: 1 credit per analysis
- Outfit suggestions: Free (shows 3 outfits)
- Batch operations: 3 credits

Credits reset daily at midnight. Users can upgrade tiers for higher limits.

## AI Models and Providers

### Primary AI Provider: Google Gemini
- **Model**: Gemini 2.0 Flash Exp (gemini-2.0-flash-preview-image-generation)
- **Usage**: Virtual try-on image generation, fashion chat recommendations
- **Fallback**: Gemini Pro for text-based operations
- **Capabilities**: Multimodal (text + image) processing, photorealistic image generation

### Additional Libraries
- **OpenAI**: Available for potential future integrations
- **Replicate**: Available for alternative AI model hosting

### AI Features Implementation
- **Image Generation**: Processes multiple user photos + product images for accurate try-on
- **Rate Limiting**: Client-side throttling (3 chat requests/2min, 2 try-on/3min)
- **Caching**: 5-minute cache for responses to reduce API costs
- **Error Handling**: Graceful fallbacks with descriptive messages when AI fails

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (React-based)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **State Management**: React hooks with localStorage
- **Animations**: Framer Motion

### Backend
- **API Routes**: Next.js API routes (serverless functions)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Cloudinary for image uploads

### AI Integration
- **Primary**: Google Generative AI SDK
- **Image Processing**: Base64 encoding for API transmission
- **Caching**: Response caching with TTL
- **Rate Limiting**: Client and server-side throttling

### Development Tools
- **Package Manager**: pnpm
- **Linting**: Next.js built-in ESLint
- **Deployment**: Optimized for Vercel/Netlify
- **Analytics**: Vercel Analytics

## Architecture

### Architecture Type: Client-Server with Serverless Functions

### Frontend Architecture
- **Component-Based**: Modular React components with TypeScript
- **Routing**: Next.js App Router for file-based routing
- **State Management**: Context API + localStorage for persistence
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Backend Architecture
- **API-First**: RESTful API routes in `/api` directory
- **Serverless**: Next.js API routes deployed as serverless functions
- **Database Layer**: Supabase client for database operations
- **Authentication**: JWT-based auth with Supabase

### Data Flow
1. **User Interaction** → React components
2. **API Calls** → Next.js API routes
3. **Business Logic** → Server-side processing
4. **AI Processing** → External AI APIs (Google Gemini)
5. **Data Storage** → Supabase database
6. **File Storage** → Cloudinary CDN

### Key Architectural Decisions
- **Serverless**: Reduces infrastructure management, scales automatically
- **API Routes**: Co-located with frontend for easier development
- **Supabase**: Managed database and auth service
- **Cloudinary**: Optimized image storage and delivery
- **Credit System**: Monetization strategy for AI usage

## Database Schema (Supabase)

### Core Tables
- **profiles**: User profiles with plan tiers
- **wardrobe_items**: User's uploaded clothing items
- **user_credits**: Credit tracking and limits
- **generation_history**: AI usage tracking
- **products**: E-commerce product catalog

### Key Features
- **Row Level Security (RLS)**: Automatic user data isolation
- **Real-time**: Live updates for collaborative features
- **Backup**: Automatic database backups

## What Could Be Better

### Technical Improvements
- **AI Reliability**: Current implementation has fallbacks due to API limitations
- **Performance**: Image processing could be optimized for faster generation
- **Scalability**: Database queries could be optimized for high traffic
- **Error Handling**: More robust error recovery mechanisms

### Feature Enhancements
- **Social Features**: Share outfits, follow stylists
- **AR Try-On**: Mobile AR for more accurate virtual try-on
- **Personal Shopper**: Dedicated AI stylist personas
- **Marketplace**: User-to-user clothing trading

### Business Improvements
- **Monetization**: Affiliate partnerships, premium stylist access
- **Analytics**: Better user behavior tracking
- **Mobile App**: Native mobile experience
- **Internationalization**: Multi-language support

### Technical Debt
- **Code Organization**: Some utilities could be better modularized
- **Testing**: Limited automated test coverage
- **Documentation**: API documentation could be more comprehensive
- **Monitoring**: Better logging and error tracking

## Development Workflow

### Local Development
```bash
pnpm install
pnpm dev
```

### Environment Setup
- Google AI API key for Gemini
- Supabase project credentials
- Cloudinary account for image storage

### Deployment
- Optimized for Vercel deployment
- Environment variables for production
- Database migrations via Supabase

## Future Roadmap

### Short Term
- Improve AI model reliability
- Add more product categories
- Enhance mobile responsiveness

### Long Term
- AR/virtual reality integration
- Social fashion platform
- AI-powered trend prediction
- Sustainable fashion focus

## Success Metrics

### User Engagement
- Daily active users
- AI generation usage
- Conversion rates

### Technical Metrics
- API response times
- Error rates
- Credit usage patterns

### Business Metrics
- Revenue per user
- Customer acquisition cost
- User retention rates

---

*This context document serves as a comprehensive overview of the FashionAI project, covering all aspects from technical implementation to business strategy. It should be updated as the project evolves.*
