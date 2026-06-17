# Movie Recap Script Writer Pro

A cinematic AI-powered movie recap script generator with dramatic chiaroscuro design.

## Overview

Movie Recap Script Writer Pro is a premium web application that transforms movie plots into compelling, professionally-written recap scripts using advanced AI. The application features a dramatic, immersive interface with golden accents, atmospheric effects, and a mysterious aesthetic.

## Key Features

### Phase 1 - Core MVP ✅

- **AI-Powered Script Generation**: Uses LLM to generate full movie recap scripts with structured narration
- **Flexible Tone Selection**: Choose from Dramatic, Comedic, Suspenseful, Educational, or Casual
- **Adjustable Length**: Select script duration - Short (~3 min), Medium (~7 min), or Long (~12 min)
- **Script Editor**: Rich text editing with live word count display
- **Export Options**: Copy to clipboard, download as TXT, or export as Markdown
- **Script History**: Save and manage all generated scripts in your personal library
- **User Authentication**: Manus OAuth integration for secure account management
- **Cinematic UI**: Dramatic chiaroscuro design with golden gradients and atmospheric effects

### Phase 2 - Advanced Features (In Progress)

- Enhanced script generation with character analysis and scene breakdowns
- Advanced editor features (rich text formatting, collapsible sections, undo/redo)
- Script favorites, tagging, and filtering
- Shareable scripts via unique URLs
- PDF export functionality
- Integration with movie databases (OMDB, TMDB)
- Performance optimizations and caching
- Analytics and usage tracking

## Technology Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Express 4 + tRPC 11 + Node.js
- **Database**: MySQL/TiDB with Drizzle ORM
- **Authentication**: Manus OAuth
- **AI**: LLM integration for script generation
- **Testing**: Vitest for unit tests
- **Build**: Vite + esbuild

## Project Structure

```
movie-recap-pro/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components (Home, ScriptGenerator, ScriptEditor, ScriptHistory)
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # tRPC client, utilities
│   │   └── index.css      # Global styles with chiaroscuro theme
│   └── public/            # Static assets
├── server/                # Express backend
│   ├── routers.ts         # tRPC procedure definitions
│   ├── db.ts              # Database query helpers
│   └── _core/             # Core infrastructure (auth, context, etc.)
├── drizzle/               # Database schema and migrations
├── shared/                # Shared types and constants
└── package.json           # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+
- MySQL/TiDB database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sli404193-crypto/movie-recap-pro.git
   cd movie-recap-pro
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   - Configure database connection
   - Set up Manus OAuth credentials
   - Configure LLM API access

4. **Run database migrations**
   ```bash
   pnpm drizzle-kit generate
   pnpm drizzle-kit migrate
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`

## Development

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests with LLM tests skipped
SKIP_LLM_TESTS=1 pnpm test
```

### Type Checking

```bash
pnpm check
```

### Building for Production

```bash
pnpm build
pnpm start
```

## Architecture

### Frontend Workflow

1. **Home Page**: Landing page with feature overview and call-to-action
2. **Script Generator**: Form to input movie details and select tone/length
3. **Script Editor**: View, edit, and export generated scripts
4. **Script History**: Manage all saved scripts

### Backend Workflow

1. **Authentication**: Manus OAuth handles user login/logout
2. **Script Generation**: tRPC procedure calls LLM with movie details
3. **Database**: Scripts stored with user association for history
4. **Export**: Multiple format support (TXT, Markdown, PDF)

### Database Schema

**Users Table**
- id, openId, name, email, role, createdAt, updatedAt, lastSignedIn

**Scripts Table**
- id, userId, movieTitle, year, genre, plotSummary, tone, length, generatedScript, wordCount, createdAt, updatedAt

## Design System

### Color Palette

- **Background**: Deep black (`oklch(0.08 0.01 0)`)
- **Primary Accent**: Golden amber (`oklch(0.7 0.15 40)`)
- **Text**: Bright white with gradients (`oklch(0.95 0.01 40)`)
- **Secondary**: Dark slate (`oklch(0.12 0.01 0)`)

### Typography

- **Headlines**: Bold, uppercase, sans-serif with gradient effect
- **Body**: Clean sans-serif with golden accents
- **Monospace**: For script content display

### Atmospheric Effects

- Blurred background gradients
- Subtle light rays and lens flares
- Smooth transitions and animations
- High-contrast visual hierarchy

## API Endpoints

### tRPC Procedures

**Authentication**
- `auth.me` - Get current user
- `auth.logout` - Logout user

**Scripts**
- `scripts.generate` - Generate new script
- `scripts.list` - Get user's scripts
- `scripts.getById` - Get specific script
- `scripts.update` - Update script content
- `scripts.delete` - Delete script

## Performance Considerations

- LLM calls are optimized with proper timeouts
- Database queries use indexes for fast retrieval
- Frontend uses React Query for caching
- Lazy loading for script history
- Debounced auto-save functionality

## Testing

The project includes comprehensive test coverage:

- **Unit Tests**: Procedure logic, validation, error handling
- **Integration Tests**: Database operations, tRPC procedures
- **Component Tests**: UI rendering and interactions

Run tests with: `pnpm test`

## Deployment

The application is designed for deployment on Manus platform with:

- Autoscale serverless hosting
- Automatic SSL/TLS
- Built-in monitoring and logging
- Custom domain support

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `pnpm test`
4. Type check: `pnpm check`
5. Commit with clear messages
6. Push and create a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues, feature requests, or questions, please open an issue on the GitHub repository.

## Roadmap

### Q3 2026
- [ ] PDF export functionality
- [ ] Movie database integration (OMDB/TMDB)
- [ ] Script collaboration features
- [ ] Advanced analytics dashboard

### Q4 2026
- [ ] Mobile app (React Native)
- [ ] Browser extension
- [ ] API for third-party integrations
- [ ] Batch script generation

## Acknowledgments

- Manus platform for OAuth and infrastructure
- LLM providers for script generation
- Community feedback and contributions
