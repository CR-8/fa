# Fashion Assistant

## AI Wardrobe: Outfit Recommendations

This feature lets users upload wardrobe items, have them auto-tagged by AI, and request outfit combinations for a given occasion.

Key pieces:
- Upload: `POST /api/upload` (uploads to Cloudinary)
- Clothing analysis: `POST /api/analyze-clothing` (Gemini image+text prompt, stores metadata client-side and in Supabase)
- Outfit recommendations: `POST /api/wardrobe-recommendations` (Gemini text prompt using your stored wardrobe items)
- UI: `app/wardrobe/page.tsx`

Environment variables required:
- GOOGLE_API_KEY
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server-side route optional fallback for RLS/testing)
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

Database:
- Table `wardrobe_items` with RLS policies is defined in `supabase-migrations.sql`.

Usage flow:
1. Go to Wardrobe page and add items (image upload + optional details). The item is analyzed by AI and saved to Supabase.
2. Enter an occasion like “party” and hit “Get AI Outfits”.
3. The page shows 1–3 outfit combinations using your stored items with short explanations.

Notes:
- Frontend requests are rate-limited client-side for stability.
- The AI route tries `gemini-2.0-flash` and falls back to `gemini-pro` automatically.
- Replace the placeholder `user-1` with your authenticated user ID when wiring auth.

# FashionAI - AI-Powered Fashion Assistant

A modern e-commerce platform with AI-powered virtual try-on and personalized styling recommendations.

## Features

### 🤖 AI Fashion Assistant
- **Personalized Recommendations**: Get tailored fashion advice based on your style preferences
- **Virtual Try-On**: AI-generated images showing how clothes look on you
- **Style Quiz**: Take a comprehensive quiz to define your fashion preferences
- **Smart Chat**: Conversational AI that understands your fashion needs

### 🛍️ E-Commerce Platform
- **Product Discovery**: Browse curated fashion items with advanced filtering
- **Secure Checkout**: Multi-step checkout process with multiple payment options
- **Wishlist & Cart**: Save items for later and manage your shopping cart
- **Product Reviews**: Rate and review products (coming soon)

### 👤 User Experience
- **Profile Management**: Upload photos and manage your fashion preferences
- **Data Export/Import**: Backup and restore your profile data
- **Responsive Design**: Optimized for mobile and desktop
- **Accessibility**: Screen reader support and keyboard navigation

### 🔧 Admin Features
- **Product Management**: Add new products with detailed specifications
- **Analytics Dashboard**: View key metrics and user statistics
- **Content Management**: Manage categories and product information

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, Lucide Icons
- **AI Integration**: Google Gemini AI for chat and image generation
- **Image Storage**: Cloudinary for user uploads
- **State Management**: React hooks with localStorage persistence
- **Performance**: Response caching, lazy loading, optimized images

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- Google AI API key
- Cloudinary account (for image uploads)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/CR-8/fa.git
cd fa
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your API keys:
```
GOOGLE_API_KEY=your_google_ai_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── ai-fa/             # AI chat interface
│   ├── checkout/          # Checkout flow
│   ├── profile/           # User profile management
│   ├── shop/              # Product catalog
│   └── style-quiz/        # Style preference quiz
├── components/            # Reusable UI components
├── data/                  # Static data and types
├── lib/                   # Utility functions
└── public/                # Static assets
```

## API Routes

- `POST /api/gemini-chat` - AI fashion recommendations
- `POST /api/try-on` - Virtual try-on image generation
- `POST /api/upload` - Image upload to Cloudinary

## Key Features Implementation

### AI Response Caching
Responses are cached for 5 minutes to improve performance and reduce API costs.

### Rate Limiting
- Chat: 3 requests per 2 minutes
- Try-on: 2 requests per 3 minutes

### Input Validation
All API inputs are validated and sanitized for security.

### Accessibility
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility

## Testing

Run the test suite:
```bash
pnpm test
```

## Deployment

The app is optimized for deployment on Vercel, Netlify, or any Node.js hosting platform.

### Environment Variables for Production
```
NODE_ENV=production
GOOGLE_API_KEY=your_production_api_key
CLOUDINARY_CLOUD_NAME=your_production_cloud_name
CLOUDINARY_API_KEY=your_production_api_key
CLOUDINARY_API_SECRET=your_production_api_secret
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please open an issue on GitHub.