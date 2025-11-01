# Legalify Architecture Documentation

## 🎯 Core Philosophy: Eval Pipeline

### Reflection → Critique → Fix → Recheck → Verify

This architecture follows a systematic approach to minimize hallucinations and API waste:

1. **Reflection:** Understand user intent (template selection)
2. **Critique:** Validate all required data is collected (MCQ questions)
3. **Fix:** Ensure data completeness before API call
4. **Recheck:** Verify question answers are valid
5. **Verify:** Display generated document for user review

## 🏗️ System Architecture

### Stage-Based Flow

```
┌─────────────────┐
│  Template Stage │ ← User selects document type
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Questions Stage │ ← Collect ALL data via MCQ
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Generating Stage│ ← Single API call
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Result Stage   │ ← Display + Export
└─────────────────┘
```

### Component Hierarchy

```
App (page.tsx)
├── HeroSection
│   ├── FallingPattern (Canvas animation)
│   └── VercelV0Chat (Main interface)
│       ├── Template Selection (Stage 1)
│       ├── QuestionFlow (Stage 2)
│       │   ├── Progress Bar
│       │   ├── Question Display
│       │   └── Navigation Buttons
│       ├── Loading State (Stage 3)
│       └── DocumentResult (Stage 4)
│           ├── Document Display
│           └── Action Buttons
└── AnimatedFooter
    ├── Wave Animation
    └── Navigation Links
```

## 💾 Data Flow

### 1. Template Selection
```typescript
User clicks template
  → setSelectedTemplate(template)
  → setStage("questions")
```

### 2. Question Collection
```typescript
For each question:
  User answers → Store in answers object
  
When complete:
  answers = {
    sender: "John Doe",
    recipient: "Jane Smith",
    issue: "Breach of Contract",
    ...
  }
```

### 3. API Call (SINGLE REQUEST)
```typescript
generateDocument(systemPrompt, answers)
  → POST to OpenRouter
  → Model: claude-3.5-sonnet
  → Temperature: 0.3 (focused output)
  → Max tokens: 4000
  → Returns: Complete legal document
```

### 4. Result Display
```typescript
Document received
  → setGeneratedDoc(doc)
  → setStage("result")
  → User can copy/download
```

## 🎨 UI/UX Design Principles

### Color System
- **Background:** Pure black (#000000)
- **Foreground:** Pure white (#ffffff)
- **Borders:** Neutral-800 (#262626)
- **Hover:** Neutral-900 (#171717)
- **Disabled:** 50% opacity

### Interaction Patterns
1. **Template Cards:** Hover effect with border glow
2. **Question Flow:** Progress bar + smooth transitions
3. **Buttons:** Clear primary (white) vs secondary (outline)
4. **Loading:** Spinner with descriptive text

## 🔧 API Optimization Strategy

### Problem: Limited API Credits
**Solution:** Minimize API calls through smart data collection

### Implementation:
1. **Pre-defined Questions:** Each template has 6-8 specific questions
2. **MCQ Format:** Reduces ambiguity, ensures valid inputs
3. **Client-side Validation:** Check completeness before API call
4. **Single Request:** All data sent in one prompt
5. **Low Temperature:** 0.3 for consistent, focused output

### Token Usage Breakdown:
- System prompt: ~100 tokens
- User data: ~200-300 tokens
- Response: ~1,500-2,000 tokens
- **Total per document: ~1,800-2,400 tokens**

### Cost Calculation:
- Claude 3.5 Sonnet: ~$3/1M input, ~$15/1M output
- Per document: ~$0.01-0.02
- **100 documents = ~$1-2**

## 🛡️ Error Handling

### API Errors
```typescript
try {
  const doc = await generateDocument(...)
  setGeneratedDoc(doc)
  setStage("result")
} catch (err) {
  setError(err.message)
  setStage("questions") // Stay on questions
}
```

### Validation
- Required questions must be answered
- "Next" button disabled until answered
- Progress bar shows completion status

## 📱 Responsive Design

### Breakpoints:
- Mobile: < 768px (1 column)
- Tablet: 768px - 1024px (2 columns)
- Desktop: > 1024px (3 columns)

### Mobile Optimizations:
- Stack template cards vertically
- Full-width question cards
- Touch-friendly button sizes (min 44px)
- Simplified footer layout

## 🔐 Security Considerations

### Current Implementation:
- API key hardcoded in `lib/api.ts`
- Client-side API calls
- No user authentication

### Production Recommendations:
1. Move API key to environment variables
2. Create API route in `app/api/generate/route.ts`
3. Call API from server-side
4. Add rate limiting (e.g., 10 requests/hour per IP)
5. Implement user authentication
6. Add CAPTCHA for abuse prevention

## 🚀 Performance Optimizations

### Current:
- Client-side rendering for interactivity
- Canvas animation with RAF (requestAnimationFrame)
- Lazy loading for footer (IntersectionObserver)
- Minimal dependencies

### Future:
- Server-side rendering for static pages
- Image optimization (if adding images)
- Code splitting for templates
- Service worker for offline support

## 📊 Monitoring & Analytics

### Recommended Tracking:
1. Template selection frequency
2. Question completion rate
3. Document generation success rate
4. API response times
5. Error rates by type

### Tools:
- Vercel Analytics (built-in)
- PostHog (open-source)
- Google Analytics 4

## 🧪 Testing Strategy

### Unit Tests:
- Template question validation
- API response parsing
- Utility functions

### Integration Tests:
- Full question flow
- API integration
- Document generation

### E2E Tests:
- Complete user journey
- Cross-browser compatibility
- Mobile responsiveness

## 🔄 Future Enhancements

### Phase 2:
- [ ] User accounts & authentication
- [ ] Document history/storage
- [ ] PDF export with formatting
- [ ] Document templates customization

### Phase 3:
- [ ] Multi-language support
- [ ] Collaborative editing
- [ ] Version control for documents
- [ ] Advanced AI features (suggestions, improvements)

### Phase 4:
- [ ] Mobile app (React Native)
- [ ] API for third-party integrations
- [ ] White-label solution
- [ ] Enterprise features

## 📝 Code Quality Standards

### TypeScript:
- Strict mode enabled
- No `any` types
- Proper interface definitions

### React:
- Functional components only
- Custom hooks for reusable logic
- Proper dependency arrays

### Styling:
- Tailwind utility classes
- No inline styles (except dynamic)
- Consistent spacing scale

### File Organization:
- Components in `/components`
- Utilities in `/lib`
- Pages in `/app`
- Types co-located with components

---

**This architecture ensures:**
✅ Minimal API usage
✅ Clear user flow
✅ Production-ready code
✅ Scalable structure
✅ Maintainable codebase
