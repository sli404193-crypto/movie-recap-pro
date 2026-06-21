# Movie Recap Script Writer Pro - Project TODO

## Phase 1: Core MVP (Script Generation & History)

### Database & Backend
- [x] Create `scripts` table in schema with fields: id, userId, movieTitle, year, genre, plotSummary, tone, length, generatedScript, wordCount, createdAt, updatedAt
- [ ] Create `movies` table for caching movie metadata (optional, for future enhancements)
- [x] Add database query helpers in `server/db.ts` for CRUD operations on scripts
- [x] Create tRPC procedures: `scripts.generate`, `scripts.list`, `scripts.getById`, `scripts.delete`, `scripts.update`

### Frontend - Core Pages
- [x] Create `ScriptGenerator.tsx` page with movie input form (title, year, genre, plot summary)
- [x] Implement tone selector component (Dramatic, Comedic, Suspenseful, Educational, Casual)
- [x] Implement length selector component (Short ~3min, Medium ~7min, Long ~12min)
- [ ] Create script generation loading state with cinematic animations
- [x] Create `ScriptEditor.tsx` page to display generated script with live word count
- [x] Implement script editing functionality (rich text area)
- [x] Create copy-to-clipboard functionality with toast notification
- [x] Create .txt file download functionality
- [x] Create `ScriptHistory.tsx` page showing user's past scripts with delete/view options

### UI & Design
- [x] Implement chiaroscuro design system: deep black background, golden gradients, light rays
- [x] Create global CSS variables for dramatic color palette (dark greys, golden accents, whites)
- [x] Design and implement cinematic typography: bold, uppercase, sans-serif with gradient effect
- [x] Create subtle atmospheric effects (faint light rays, lens flares)
- [x] Implement high-contrast visual hierarchy with negative space
- [x] Create responsive layout that works on mobile and desktop
- [x] Design form components with cinematic styling
- [x] Design buttons, inputs, and cards with dramatic aesthetic
- [x] Create script generation loading state with cinematic animations

### Authentication & User Management
- [x] Verify Manus OAuth is properly configured in project
- [x] Test login/logout flow
- [x] Ensure user context is available in protected procedures
- [x] Implement user profile display in navigation

### AI Integration
- [x] Implement LLM call in `scripts.generate` procedure with movie recap prompt
- [x] Create prompt template that respects tone and length parameters
- [x] Handle LLM response parsing and error handling
- [x] Implement word count calculation based on length selection

### Testing
- [x] Write vitest tests for `scripts.generate` procedure
- [x] Write vitest tests for `scripts.list` procedure
- [x] Write vitest tests for `scripts.delete` procedure

## Phase 2: Advanced Features & Refinements

### Video-to-Script Conversion (COMPLETED)
- [x] Implement video URL input and validation
- [x] Integrate Whisper API for real audio transcription
- [x] Create 3-step workflow (Input → Transcript → Output)
- [x] Implement editable transcript text area (Step 2)
- [x] Add multi-language support (English, Chinese, Myanmar)
- [x] Implement LLM-based dialogue-to-script conversion
- [x] Add proper error handling and user-friendly messages
- [x] Support YouTube, TikTok, Instagram, Douyin, Facebook, Vimeo
- [x] Create comprehensive test suite for video features

### Enhanced Script Generation
- [ ] Add character analysis to generated scripts
- [ ] Implement scene breakdown with timestamps
- [ ] Add thematic analysis section
- [ ] Create script templates for different content types (YouTube, TikTok, Podcast)
- [ ] Implement script versioning (save multiple versions of same script)

### Advanced Editor Features
- [ ] Add rich text formatting (bold, italic, underline, headers)
- [ ] Implement script sections (intro, acts, conclusion) with collapsible sections
- [ ] Add speaker/narrator role tags
- [ ] Create script preview mode with formatting
- [ ] Implement undo/redo functionality
- [ ] Add search and replace within script

### User Experience Enhancements
- [ ] Implement script favorites/bookmarking
- [ ] Add script tagging and filtering
- [ ] Create script sharing via unique URLs (shareable scripts)
- [ ] Add script collaboration features (share with other users)
- [ ] Implement script templates for quick generation
- [ ] Add script generation history with timestamps and parameters

### Export & Integration
- [ ] Add PDF export option
- [x] Add Markdown export option
- [ ] Add SRT subtitle format export
- [ ] Integrate with external APIs for movie data (OMDB, TMDB)
- [ ] Add automatic movie metadata fetching

### Performance & Optimization
- [ ] Implement script generation caching
- [ ] Add pagination to script history
- [ ] Optimize LLM prompts for faster generation
- [ ] Implement debouncing for auto-save functionality

### Analytics & Insights
- [ ] Track script generation metrics
- [ ] Add user engagement analytics
- [ ] Create dashboard showing generation statistics
- [ ] Implement usage tracking for different tones/lengths

### UI/UX Refinements
- [x] Add more cinematic animations and transitions (GenerationLoadingOverlay with progress, staged text)
- [ ] Implement dark mode toggle (if needed)
- [ ] Add accessibility features (ARIA labels, keyboard navigation)
- [ ] Create onboarding flow for new users
- [ ] Add help/tutorial section
- [ ] Implement responsive design for all screen sizes

### Testing & Quality
- [ ] Add E2E tests for complete script generation flow
- [ ] Add performance tests for LLM integration
- [ ] Implement error boundary improvements
- [ ] Add comprehensive error handling and user feedback

### Deployment & DevOps
- [ ] Set up CI/CD pipeline
- [ ] Configure production environment variables
- [ ] Implement monitoring and logging
- [ ] Set up error tracking (Sentry or similar)
- [ ] Create deployment documentation

## Completed Items
(Items will be marked as completed during development)
