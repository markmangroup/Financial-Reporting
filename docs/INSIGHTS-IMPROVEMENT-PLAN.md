# Markman Group Intelligent Insights System
## Comprehensive Plan for Natural Language Project Querying

**Last Updated**: 2025-11-07
**Status**: Planning Phase
**Goal**: Enable COO/CFO-level conversational insights across all Markman Group project data

---

## Executive Summary

This plan transforms our consolidated project data (8 projects, 84 documents, 16 repos, 5,340 files) into an intelligent, queryable knowledge base that responds to natural language questions with contextual, executive-level insights.

**Vision Example:**
```
User: "What work have we done around accounts payable?"

Insight Response: "Accounts Payable automation has been a key focus in our Dittmar AP
Automation project (2024), where Carmen led a comprehensive assessment of AP processes
with 19 documented deliverables. While this was a non-revenue assessment project
($797 costs), it established our capabilities in process discovery and automation roadmapping.

Related capabilities demonstrated across projects:
• Proposal Application workflow automation (Laurel AG)
• Financial process digitization (Metropolitan Current State)
• Document processing and OCR integration (multiple projects)

These projects collectively showcase our end-to-end AP automation offering, from
process assessment through implementation."
```

---

## Current State: Data Assets Inventory

### ✅ What We Have

#### 1. Project Metadata (8 projects)
- **Location**: `data/projects/*/metadata.json`
- **Content**: Financial data, timelines, team allocations, descriptions
- **Coverage**: $181K revenue, $134K costs, 100% consultant allocation
- **Projects**:
  - Laurel AG Proposal Tools (revenue: $134K, margin: 47.8%)
  - Metropolitan Current State (revenue: $47K, margin: 0.5%)
  - Dittmar AP Automation (overhead, Carmen-led)
  - BrainDead Portal (Ivana/Nikola R&D)
  - Markman Internal (strategic planning)
  - MDL Pitch (cancelled)
  - Notice Board (internal tool)
  - Siguler Guff (active pitch/demo)

#### 2. Extracted Document Text (84 documents, 97% extracted)
- **Location**: Document metadata with `extractedText` field (5,000 char samples)
- **Coverage**: SOWs, proposals, specs, deliverables, test files
- **Searchable**: Yes (plain text)
- **Categories**: Contracts, Proposals, Deliverables, Documentation

#### 3. GitHub Repository Code (16 repos)
- **Location**: `data/github-repos/*/`
- **Content**: 5,340 files, 600 MB, 2,905 commits
- **Metadata**: README content, package.json, repo analysis
- **Key Repos**:
  - mike-os (Siguler Guff: 234 files)
  - metropolitan-partners-portal (163 commits)
  - LaurelAG-app, rental-platform, estimation-platform
  - braindead, mdl, notice-board

#### 4. SharePoint Activity History
- **Location**: `data/sharepoint-inventory-2025-11-07.json`
- **Content**: 2,149 items with modification history
- **Value**: Consultant activity patterns, project timelines

### ⚠️ What We're Missing

1. **Semantic Relationships**: No mapping between projects showing common capabilities
2. **Offering Taxonomy**: No structured view of "what we offer" derived from project work
3. **Code-to-Project Links**: GitHub code not integrated into project context
4. **Document Search Interface**: Text extracted but not searchable via UI
5. **Natural Language Query**: No Q&A interface for conversational insights

---

## Architecture: 3-Phase Implementation

### Phase 1: Foundation (Weeks 1-2)
**Goal**: Basic keyword search with project context

#### Components:
1. **Full-Text Search Index**
   - Aggregate all extractedText from 84 documents
   - Index project descriptions, notes, consultant names
   - Index README content from 16 repos
   - Store with project/document/repo linkage

2. **Basic Query API**
   ```typescript
   POST /api/insights/query
   {
     "query": "accounts payable",
     "filters": {
       "projects": ["dittmar-ap-automation"],
       "documentTypes": ["proposals", "deliverables"],
       "dateRange": { "start": "2024-01-01", "end": "2024-12-31" }
     }
   }
   ```

3. **Simple Insights UI**
   - Search bar in main dashboard
   - Results showing: Project → Document → Text excerpt
   - Click-through to project detail page

#### Data Structure:
```typescript
interface SearchIndex {
  id: string
  type: 'project' | 'document' | 'repo' | 'consultant'
  projectId: string
  title: string
  content: string // All searchable text
  metadata: {
    revenue?: number
    costs?: number
    consultants?: string[]
    dates?: { start: string, end: string }
    tags?: string[] // e.g., ["AP automation", "financial processes"]
  }
  sourceUrl: string // Link to SharePoint/GitHub/detail page
}
```

#### Implementation:
- Create `src/lib/searchIndex.ts` to build index from existing data
- Create `src/app/api/insights/query/route.ts` for search API
- Add search bar to main dashboard with results modal
- Use simple JavaScript `.includes()` for keyword matching (no external dependencies)

**Deliverable**: Search for "accounts payable" → Returns Dittmar project + related documents

---

### Phase 2: Semantic Understanding (Weeks 3-4)
**Goal**: Cross-project insights with offering taxonomy

#### Components:
1. **Capability Taxonomy**
   - Extract capabilities from project work
   - Map to standardized offering categories
   - Link projects to capabilities

   ```typescript
   interface CapabilityTaxonomy {
     categories: {
       "Process Automation": {
         subcategories: ["AP Automation", "Proposal Generation", "Workflow Management"]
         projects: ["dittmar-ap-automation", "laurel-ag-proposal-tools"]
       },
       "Data Visualization": {
         subcategories: ["Executive Dashboards", "Portfolio Management", "Compliance Reporting"]
         projects: ["siguler-guff", "metropolitan-current-state"]
       },
       "Portal Development": {
         subcategories: ["Client Portals", "Internal Tools", "Deal Flow Management"]
         projects: ["braindead-portal", "notice-board", "metropolitan-current-state"]
       }
     }
   }
   ```

2. **Project Relationship Mapping**
   - Identify common technologies (React, Next.js, Azure, etc.)
   - Identify common consultants (expertise transfer)
   - Identify common client needs (reusable solutions)

3. **Enhanced Query Response**
   - Primary project answer
   - Related projects with explanations
   - Capability summary
   - Consultant expertise

   ```typescript
   interface InsightResponse {
     query: string
     primaryAnswer: {
       project: ProjectMetadata
       relevanceScore: number
       keyFindings: string[]
       documentExcerpts: Array<{
         filename: string
         excerpt: string
         sourceUrl: string
       }>
     }
     relatedWork: Array<{
       project: ProjectMetadata
       relationship: string // "Similar technology", "Same consultant", "Related offering"
       relevanceScore: number
     }>
     capabilitySummary: {
       offeringCategory: string
       demonstratedCapabilities: string[]
       projectsInCategory: string[]
     }
     consultantExpertise: Array<{
       name: string
       projectsInArea: string[]
       totalCosts: number
     }>
   }
   ```

#### Implementation:
- Create `data/capability-taxonomy.json` with manual categorization
- Create `src/lib/insightsEngine.ts` with relationship mapping logic
- Enhance API response structure
- Add "Related Projects" section to insights results
- Add "Capability Summary" card

**Deliverable**: Search for "AP automation" → Returns Dittmar + related workflow projects + consultant expertise

---

### Phase 3: Conversational Intelligence (Weeks 5-8)
**Goal**: COO/CFO-level natural language responses

#### Components:
1. **LLM Integration for Response Generation**
   - Use Claude API (Anthropic) or GPT-4 for response synthesis
   - Provide search results + project context as prompt
   - Generate executive-level narrative responses

   ```typescript
   interface ConversationalInsight {
     query: string
     executiveSummary: string // Generated narrative (2-3 paragraphs)
     keyMetrics: {
       projectsInvolved: number
       totalRevenue: number
       totalCosts: number
       timespan: string
     }
     detailedBreakdown: Array<{
       projectName: string
       contribution: string // Narrative explanation
       financials: { revenue: number, costs: number, margin: number }
       deliverables: string[]
     }>
     strategicInsights: string[] // "This demonstrates our capability in...", "Opportunity to expand..."
     followUpQuestions: string[] // Suggested related queries
   }
   ```

2. **Conversation History**
   - Track query sessions
   - Allow follow-up questions with context
   - "Tell me more about the Dittmar project"
   - "Who else worked on AP automation?"

3. **Advanced Query Types**
   - Financial queries: "What was our most profitable project in 2024?"
   - Consultant queries: "What has Carmen worked on?"
   - Capability queries: "What can we offer around financial process automation?"
   - Timeline queries: "What did we deliver in Q2 2024?"
   - Comparison queries: "Compare margins between Laurel AG and Metropolitan"

4. **Interactive Insights Chat**
   - Dedicated insights page with chat interface
   - Conversational back-and-forth
   - Inline project cards with drill-down
   - Export conversation to PDF/summary

#### Implementation:
- Add `ANTHROPIC_API_KEY` to environment variables
- Create `src/lib/llm/insightsGenerator.ts` with Claude API integration
- Create `src/app/insights/page.tsx` with chat UI (inspired by ChatGPT)
- Implement conversation state management (React Context)
- Build prompt templates for different query types
- Add "Export Insights" feature

**Deliverable**: Conversational Q&A like talking to Markman Group COO/CFO

---

## Data Integration Strategy

### 1. Siguler Guff Deep Dive (Example Implementation)

**Problem**: 234 files in mike-os repo not surfaced in insights

**Solution**: Extract structured metadata from code

#### Step 1: Code Analysis Script
```javascript
// analyze-siguler-code.js
const fs = require('fs');
const path = require('path');

const sigulerFiles = [
  'data/github-repos/mike-os/src/app/data-vault/',
  'data/github-repos/mike-os/src/app/dashboards/',
  'data/github-repos/mike-os/src/app/scrapers/',
  // ... all 234 files
];

const analysis = {
  dataModels: extractDataModels(), // Parse TypeScript interfaces
  dashboards: extractDashboards(), // Find dashboard components
  features: extractFeatures(), // Identify major features
  integrations: extractIntegrations() // APIs, scrapers, external services
};

fs.writeFileSync('data/projects/siguler-guff/code-analysis.json', JSON.stringify(analysis));
```

#### Step 2: Add to Project Metadata
```json
{
  "id": "siguler-guff",
  "technicalDetails": {
    "codeAnalysis": {
      "totalFiles": 234,
      "dashboards": [
        { "name": "CEO Dashboard", "file": "src/app/dashboards/ceo/page.tsx", "features": ["Fund performance", "Team metrics"] },
        { "name": "CFO Dashboard", "file": "src/app/dashboards/cfo/page.tsx", "features": ["P&L", "Deal pipeline"] }
      ],
      "dataModels": [
        { "name": "Fund", "fields": ["name", "aum", "vintage", "irr"] },
        { "name": "Employee", "fields": ["name", "title", "department"] }
      ],
      "scrapers": [
        { "target": "siguler.com", "dataExtracted": ["news", "team roster", "fund info"] }
      ]
    }
  }
}
```

#### Step 3: Make Searchable
- Index dashboard names and features
- Index data model names and fields
- Link to "Data Visualization" and "Portfolio Management" capabilities
- Enable queries like "show me all dashboard work" → Returns Siguler Guff + Metropolitan

### 2. Cross-Project Technology Mapping

Create `data/technology-inventory.json`:
```json
{
  "technologies": {
    "React": {
      "projects": ["siguler-guff", "metropolitan-current-state", "laurel-ag-proposal-tools"],
      "totalFiles": 450,
      "expertise": ["Ivana", "Nikola", "Carmen"]
    },
    "Next.js": {
      "projects": ["siguler-guff", "braindead-portal", "notice-board"],
      "versions": ["13.x", "14.x"],
      "expertise": ["Ivana", "Nikola"]
    },
    "Azure Functions": {
      "projects": ["laurel-ag-proposal-tools", "metropolitan-current-state"],
      "expertise": ["Nikoleta", "Marianna"]
    }
  }
}
```

**Query Example**: "What have we built with React?" → Returns all React projects with file counts and consultant expertise

### 3. Consultant Knowledge Graph

Create `data/consultant-expertise.json`:
```json
{
  "consultants": {
    "Carmen": {
      "primaryExpertise": ["Process Discovery", "Requirements Analysis", "SharePoint Integration"],
      "projects": [
        { "id": "dittmar-ap-automation", "role": "Lead Analyst", "activities": 19 },
        { "id": "metropolitan-current-state", "role": "Senior Consultant", "allocation": 56.3 },
        { "id": "laurel-ag-proposal-tools", "role": "Senior Consultant", "allocation": 34.1 }
      ],
      "totalCosts": 14211,
      "keyDeliverables": ["AP Process Assessment", "Current State Documentation", "Requirements Specs"]
    },
    "Ivana": {
      "primaryExpertise": ["React Development", "Portal Architecture", "UI/UX Design"],
      "projects": [
        { "id": "braindead-portal", "role": "Lead Developer", "costs": 11104 }
      ],
      "totalCosts": 11104,
      "technologies": ["React", "Next.js", "TypeScript", "TailwindCSS"]
    }
  }
}
```

**Query Example**: "Who should work on a new React portal project?" → Returns Ivana with BrainDead experience + Nikola with mike-os experience

---

## Example Queries & Expected Responses

### Query 1: "What work have we done around accounts payable?"

**Phase 1 Response** (Keyword Search):
```
Found 1 project related to "accounts payable":

Dittmar AP Automation
- Status: Completed
- Consultant: Carmen (19 file modifications)
- Costs: $797
- Documents: 3 files found

Excerpts:
"Assessment of current state accounts payable processes including vendor management, invoice processing, and approval workflows..."
```

**Phase 2 Response** (Semantic Understanding):
```
Accounts Payable Automation

Primary Project:
• Dittmar AP Automation (2024) - Comprehensive AP process assessment led by Carmen
  - 19 documented deliverables covering invoice processing, vendor management, approvals
  - $797 project costs (non-revenue assessment)

Related Work:
• Laurel AG Proposal Tools - Automated proposal generation with approval workflows (similar workflow automation)
• Metropolitan Current State - Financial process documentation (related process discovery)

Capability Summary:
Our AP automation offering includes:
- Process discovery and assessment
- Workflow automation design
- System integration planning
- Digital transformation roadmapping

Consultant Expertise:
- Carmen: 3 projects involving process automation (56% time allocation)
```

**Phase 3 Response** (Conversational Intelligence):
```
Accounts Payable has been a key focus area for Markman Group, demonstrated most clearly through our Dittmar AP Automation project in 2024. This engagement, led by Carmen as the primary consultant, involved a comprehensive assessment of AP processes including vendor management, invoice processing, and approval workflows. While this was a non-revenue assessment project with $797 in costs, it established critical capabilities that position us for larger AP automation implementations.

Our AP automation expertise extends beyond the Dittmar project. The Laurel AG Proposal Tools project ($134K revenue, 47.8% margin) showcased our ability to automate complex workflow processes, including multi-stage approvals and document generation - skills directly applicable to AP automation. Similarly, the Metropolitan Current State project involved detailed financial process documentation, demonstrating our process discovery methodology.

Strategic Implications:
• We have proven process discovery capabilities (Carmen: 19+ documented deliverables)
• Our workflow automation toolkit can be applied to AP, AR, and broader financial processes
• Cross-project experience positions us to offer end-to-end AP automation from assessment through implementation
• Technology stack includes Azure Functions, SharePoint integration, and modern web frameworks (React/Next.js)

Recommended Next Steps:
1. Package AP automation as a formal offering with case studies from Dittmar and Laurel AG
2. Expand Carmen's process automation practice with additional consultant training
3. Target mid-market companies with manual AP processes as ideal prospects

Would you like me to detail the specific deliverables from the Dittmar project, or explore our broader process automation capabilities?
```

### Query 2: "Show me our most profitable projects"

**Phase 3 Response**:
```
Laurel AG Proposal Tools has been our most profitable client engagement to date:

Financial Performance:
• Revenue: $134,405 (74% of total client revenue)
• Costs: $70,172 (consultants + overhead)
• Gross Profit: $64,233
• Gross Margin: 47.8% ⭐

This project ran from June 2024 through October 2024, with primary work by Nikoleta (79.8% allocation) and supporting work by Carmen (34.1%) and Marianna (100%). The engagement included development of proposal generation tools, rental application platforms, and estimation calculators.

Key Success Factors:
1. Clear scope with defined deliverables (3 applications delivered)
2. Experienced team with complementary skills (Nikoleta: technical lead, Carmen: business analysis, Marianna: specialized development)
3. Client had well-documented requirements and active engagement
4. Technology choices aligned with team expertise (Azure Functions, SharePoint integration)

In contrast, Metropolitan Current State achieved break-even performance (0.5% margin) with $47,335 revenue and $47,069 costs. The difference highlights the importance of scope management and consultant allocation efficiency.

This analysis suggests our sweet spot is mid-sized application development projects ($100K-$150K range) with experienced technical leads and clear requirements. Projects under $50K tend to have lower margins due to fixed overhead costs.

Would you like me to analyze what made Laurel AG successful and how we can replicate it?
```

### Query 3: "What can we offer around data visualization and dashboards?"

**Phase 3 Response**:
```
Data visualization and executive dashboards represent a significant Markman Group capability, demonstrated across multiple projects with varying client contexts:

Active Demonstration Projects:

Siguler Guff Pitch/Demo (Active):
Our most comprehensive dashboard work to date, currently in pitch phase. The mike-os repository contains 234 files including:
• CEO Dashboard - Fund performance, team metrics, strategic KPIs
• CFO Dashboard - P&L analysis, deal pipeline, financial forecasting
• Department Dashboards - Team-specific views for investment, operations, compliance
• Portfolio Management - Fund tracking, LP reporting, deal funnel visualization
• Compliance Center - Regulatory tracking, audit trails, risk monitoring

Technology: React, Next.js, data visualization libraries, automated web scrapers for live data integration, presentation orchestrator with scene transitions.

This represents significant R&D investment (~234 files) showcasing our full-stack dashboard capabilities for private equity firms.

Client Deliverables:

Metropolitan Partners Portal (163 commits, $47K revenue):
Production portal for private equity client including current state documentation and deal flow management interfaces. While focused on process documentation, this project included data visualization components for portfolio tracking.

Technology: React, Next.js, Azure deployment

BrainDead Portal (Ivana/Nikola internal R&D, $15K costs):
Internal portal development demonstrating our core portal architecture patterns. While client-facing name is confidential, this established reusable components for future dashboard projects.

Offering Package:

Based on these projects, we can offer:

1. Executive Dashboard Suites
   - C-suite specific views (CEO, CFO, COO)
   - Industry-specific templates (private equity, real estate, financial services)
   - Real-time data integration via scrapers/APIs
   - Responsive design for mobile/tablet/desktop

2. Portfolio Management Systems
   - Fund performance tracking
   - Deal pipeline visualization
   - LP reporting and investor portals
   - Compliance and regulatory dashboards

3. Custom Data Visualization
   - Interactive charts and graphs
   - Drill-down capabilities
   - Export to PDF/PowerPoint
   - Scheduled report generation

Team Expertise:
• Ivana & Nikola: React/Next.js development, portal architecture
• Carmen: Requirements gathering, data modeling, user research
• Demonstrated across 3+ projects with 397+ files of visualization code

Competitive Advantages:
- Full-stack capability (scraping → processing → visualization → presentation)
- Industry experience (private equity, real estate, financial services)
- Modern tech stack (React, Next.js, serverless architecture)
- Proven ability to handle complex financial data and calculations

Investment Required:
The Siguler Guff work represents ~$15K-$20K in R&D costs (Ivana/Nikola time) that can be amortized across future dashboard projects. This positions us to bid competitively on similar engagements with pre-built components.

Recommended Positioning:
"Markman Group delivers executive-grade data visualization and dashboard solutions for financial services firms. Our portfolio includes CEO/CFO dashboards, portfolio management systems, and compliance centers - backed by proven delivery in private equity and real estate sectors."

Would you like me to:
1. Detail the specific dashboard components we've built (charts, tables, KPIs)?
2. Analyze the potential market for dashboard solutions based on our experience?
3. Create a proposal template for dashboard projects using Siguler Guff as the reference architecture?
```

---

## UI/UX Design

### Main Dashboard Integration

Add "Ask a Question" search bar prominently:

```
┌─────────────────────────────────────────────────────────────┐
│  Markman Group Financial Reporting                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🔍 Ask about projects, capabilities, or consultants  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  [Revenue Card]  [Costs Card]  [Margin Card]  [Projects]  │
└─────────────────────────────────────────────────────────────┘
```

### Dedicated Insights Page

New navigation item: "Insights" (next to Operating, Projects, Currencies)

```
┌─────────────────────────────────────────────────────────────┐
│  Markman Group Insights                                     │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 💬 Chat with Markman Group Intelligence            │    │
│  ├────────────────────────────────────────────────────┤    │
│  │                                                     │    │
│  │  You: What work have we done around accounts      │    │
│  │       payable?                                     │    │
│  │                                                     │    │
│  │  Insights: Accounts Payable has been a key focus  │    │
│  │  area for Markman Group, demonstrated most        │    │
│  │  clearly through our Dittmar AP Automation...     │    │
│  │                                                     │    │
│  │  [Dittmar AP Automation Card]                     │    │
│  │  ├─ Revenue: $0                                    │    │
│  │  ├─ Costs: $797                                    │    │
│  │  └─ [View Project Details →]                      │    │
│  │                                                     │    │
│  │  Related Projects (2):                             │    │
│  │  • Laurel AG - Workflow automation                │    │
│  │  • Metropolitan - Process discovery               │    │
│  │                                                     │    │
│  │  ┌──────────────────────────────────────┐         │    │
│  │  │ Ask a follow-up question...          │         │    │
│  │  └──────────────────────────────────────┘         │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  Suggested Questions:                                       │
│  • What are our most profitable projects?                  │
│  • Who are our most experienced consultants?               │
│  • What technologies do we have expertise in?              │
│  • Show me all work related to dashboards                  │
└─────────────────────────────────────────────────────────────┘
```

### Quick Insights Widgets (Dashboard)

Add insight cards to main dashboard:

```
┌────────────────────────────────────┐
│  💡 Featured Capability            │
├────────────────────────────────────┤
│  Data Visualization & Dashboards   │
│                                    │
│  Demonstrated in 3 projects:       │
│  • Siguler Guff (234 files)       │
│  • Metropolitan Portal             │
│  • BrainDead Portal                │
│                                    │
│  [Explore Capability →]            │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│  👤 Top Consultant                 │
├────────────────────────────────────┤
│  Carmen                            │
│                                    │
│  3 projects, $14K costs            │
│  Expertise: Process automation,    │
│  requirements analysis             │
│                                    │
│  [View Profile →]                  │
└────────────────────────────────────┘
```

---

## Implementation Roadmap

### Week 1-2: Foundation (Phase 1)
- [ ] Create search index builder (`src/lib/searchIndex.ts`)
- [ ] Implement basic keyword search API (`src/app/api/insights/query/route.ts`)
- [ ] Add search bar to main dashboard
- [ ] Create results modal/page with excerpts
- [ ] Test with "accounts payable", "dashboard", "Carmen" queries

**Validation**: Can search for keywords and see relevant projects/documents

### Week 3-4: Semantic Layer (Phase 2)
- [ ] Create capability taxonomy (`data/capability-taxonomy.json`)
- [ ] Build cross-project relationship mapping logic
- [ ] Create technology inventory (`data/technology-inventory.json`)
- [ ] Create consultant expertise graph (`data/consultant-expertise.json`)
- [ ] Enhance API response with related projects and capability summaries
- [ ] Add "Related Work" section to results
- [ ] Implement Siguler Guff code analysis script

**Validation**: Query for "AP automation" returns Dittmar + related workflow projects + Carmen expertise

### Week 5-6: LLM Integration (Phase 3 - Basic)
- [ ] Set up Anthropic Claude API credentials
- [ ] Create prompt templates for query types
- [ ] Build LLM response generator (`src/lib/llm/insightsGenerator.ts`)
- [ ] Test executive summary generation
- [ ] Add narrative responses to API

**Validation**: Query generates COO-level narrative response with context

### Week 7-8: Conversational UI (Phase 3 - Advanced)
- [ ] Create dedicated Insights page (`src/app/insights/page.tsx`)
- [ ] Build chat interface (message history, follow-ups)
- [ ] Implement conversation state management
- [ ] Add inline project cards with drill-down
- [ ] Create "Export Insights" feature (PDF/Markdown)
- [ ] Add suggested follow-up questions
- [ ] Implement quick insight widgets for main dashboard

**Validation**: Can have multi-turn conversation about projects, export results

### Week 9-10: Polish & Advanced Features
- [ ] Add filters (date range, project type, consultant)
- [ ] Implement query history/saved queries
- [ ] Add comparison queries ("Compare Laurel AG vs Metropolitan")
- [ ] Create financial query shortcuts ("Show me Q2 2024 revenue")
- [ ] Build "Featured Capability" dashboard widget
- [ ] Add "Top Consultant" dashboard widget
- [ ] Performance optimization (caching, index preloading)

**Validation**: All query types working, fast response times, polished UX

---

## Technical Stack

### Backend
- **Search Indexing**: JavaScript with JSON file storage (no external DB needed for MVP)
- **API**: Next.js API routes (TypeScript)
- **LLM**: Anthropic Claude API (claude-3-sonnet for cost-efficiency)
- **Data Storage**: JSON files in `data/` directory (existing pattern)

### Frontend
- **Framework**: React + Next.js (existing)
- **UI Components**: TailwindCSS (existing) + Headless UI for modals/comboboxes
- **Chat Interface**: Custom React components (message list, input, streaming)
- **State Management**: React Context for conversation history

### Data Processing
- **Text Extraction**: Existing `extract-document-text.js` (textutil)
- **Code Analysis**: Custom Node.js scripts for repo parsing
- **Index Building**: Run-once scripts to generate search indexes

---

## Cost & Resource Estimates

### Phase 1 (Weeks 1-2): ~20-25 hours
- Search index: 8 hours
- API development: 6 hours
- UI components: 6 hours
- Testing: 4 hours

### Phase 2 (Weeks 3-4): ~25-30 hours
- Taxonomy creation: 8 hours (manual + scripting)
- Relationship mapping: 10 hours
- API enhancement: 5 hours
- UI updates: 5 hours

### Phase 3 (Weeks 5-8): ~40-50 hours
- LLM integration: 12 hours
- Chat UI: 15 hours
- Prompt engineering: 10 hours
- Testing & refinement: 10 hours

### Polish (Weeks 9-10): ~15-20 hours
- Advanced features: 8 hours
- Performance optimization: 4 hours
- Documentation: 3 hours

**Total Estimate**: 100-125 hours over 10 weeks

### LLM API Costs
- Claude Sonnet: ~$3 per 1M input tokens, ~$15 per 1M output tokens
- Estimated usage: 50-100 queries/day × 500 tokens avg = 25K-50K tokens/day
- Monthly cost: ~$50-$100/month for moderate usage

---

## Success Metrics

### Phase 1 Success Criteria
- [ ] Can search and find all 8 projects
- [ ] Can search and find relevant documents (84 files)
- [ ] Response time < 500ms for keyword search
- [ ] User can click through to source documents

### Phase 2 Success Criteria
- [ ] Query for capability shows 3+ related projects
- [ ] Consultant query shows all projects + expertise areas
- [ ] Technology query maps to all relevant projects
- [ ] 100% of projects categorized in taxonomy

### Phase 3 Success Criteria
- [ ] Generated responses are factually accurate (manual review)
- [ ] Response time < 3 seconds for LLM generation
- [ ] Can handle 5+ different query types
- [ ] Follow-up questions maintain context
- [ ] User satisfaction: "feels like talking to COO/CFO"

### Overall Success
- [ ] Users prefer insights to manual project exploration
- [ ] Insights surface connections not obvious in UI
- [ ] New team members can learn project history via Q&A
- [ ] Executive-level summaries suitable for client conversations

---

## Risks & Mitigations

### Risk 1: LLM Hallucination
**Impact**: Generated responses include false information
**Mitigation**:
- Always ground responses in actual data (no inference without evidence)
- Show source documents/excerpts inline
- Add confidence scores
- Manual review process for first 50 queries

### Risk 2: Poor Query Understanding
**Impact**: Users don't get relevant results
**Mitigation**:
- Start with suggested questions
- Provide query examples
- Allow refinement/filters
- Show "Did you mean...?" suggestions

### Risk 3: Slow Response Times
**Impact**: User abandons tool before results load
**Mitigation**:
- Implement streaming responses (show results as generated)
- Cache common queries
- Preload search index on app startup
- Use faster Claude Haiku model for simple queries

### Risk 4: Data Freshness
**Impact**: Insights don't reflect new projects/documents
**Mitigation**:
- Rebuild search index on project metadata changes
- Add "Last updated" timestamp to results
- Implement incremental index updates

---

## Future Enhancements (Beyond 10 Weeks)

1. **Proactive Insights**
   - Weekly email: "This week in Markman Group"
   - Dashboard alerts: "Laurel AG margin improved 5%"
   - Anomaly detection: "Carmen's allocation unusually low this month"

2. **Predictive Analytics**
   - "Based on Laurel AG, this new proposal should target 45% margin"
   - "Project complexity score suggests 3-month timeline"
   - "Recommended team: Nikoleta (lead) + Carmen (analyst)"

3. **External Data Integration**
   - Import Upwork timesheets automatically
   - Sync with accounting system for real-time financials
   - Connect to GitHub API for live repo stats

4. **Client-Facing Version**
   - Filtered insights for specific client
   - "Your project status" conversational interface
   - Deliverable tracking and milestone visibility

5. **Voice Interface**
   - "Alexa, ask Markman Group about Q3 revenue"
   - Voice-to-text query input
   - Audio summary responses

---

## Appendix: Data Schema Examples

### Search Index Entry
```typescript
{
  "id": "dittmar-ap-automation-project",
  "type": "project",
  "projectId": "dittmar-ap-automation",
  "title": "Dittmar AP Automation",
  "content": "Comprehensive assessment of accounts payable processes including vendor management invoice processing approval workflows payment automation Carmen led 19 file modifications...",
  "metadata": {
    "revenue": 0,
    "costs": 797,
    "consultants": ["Carmen"],
    "status": "completed",
    "dates": {
      "start": "2024-01-01",
      "end": "2024-06-30"
    },
    "tags": ["AP automation", "process discovery", "financial processes", "workflow automation"],
    "capabilities": ["Process Automation", "Requirements Analysis"]
  },
  "sourceUrl": "/projects/dittmar-ap-automation",
  "relevanceBoost": 1.0
}
```

### Capability Taxonomy Entry
```json
{
  "id": "process-automation",
  "name": "Process Automation",
  "description": "End-to-end automation of business processes including discovery, design, and implementation",
  "subcategories": [
    {
      "id": "ap-automation",
      "name": "Accounts Payable Automation",
      "projects": ["dittmar-ap-automation"],
      "keywords": ["invoice", "vendor", "payment", "approval workflow"]
    },
    {
      "id": "proposal-automation",
      "name": "Proposal Generation Automation",
      "projects": ["laurel-ag-proposal-tools"],
      "keywords": ["proposal", "document generation", "template", "workflow"]
    }
  ],
  "consultants": {
    "Carmen": {
      "projectCount": 3,
      "expertiseLevel": "advanced",
      "primaryFocus": true
    },
    "Nikoleta": {
      "projectCount": 1,
      "expertiseLevel": "intermediate",
      "primaryFocus": false
    }
  },
  "relatedCapabilities": ["data-visualization", "portal-development"],
  "offeringDescription": "Markman Group delivers end-to-end process automation solutions from discovery through implementation, with proven expertise in financial processes, proposal generation, and workflow automation."
}
```

### LLM Prompt Template
```typescript
const INSIGHT_PROMPT_TEMPLATE = `You are an AI assistant representing the collective knowledge of Markman Group, a consulting and development firm. You have access to complete project history, financial data, and consultant expertise.

User Query: {query}

Context (Projects & Documents):
{searchResults}

Consultant Expertise:
{consultantContext}

Capability Taxonomy:
{capabilityContext}

Task: Provide an executive-level response (COO/CFO perspective) that:
1. Directly answers the user's question with specific project examples
2. Includes relevant financial data (revenue, costs, margins)
3. Highlights consultant expertise and team composition
4. Connects projects to broader capabilities/offerings
5. Provides strategic insights and recommendations
6. Suggests 2-3 follow-up questions

Response Guidelines:
- Use narrative style (paragraphs, not bullet points at top level)
- Be specific with numbers and project names
- Ground all statements in actual data (no speculation)
- Maintain professional, confident tone
- Length: 2-4 paragraphs + structured data sections

Generate response:`;
```

---

## Getting Started

### Immediate Next Steps (This Week)

1. **Review this plan** with key stakeholders
2. **Prioritize phases** - Can we start with Phase 1 only? Or jump to Phase 3?
3. **Set up development environment** - Claude API key, update .env
4. **Create sample queries** - List 20-30 questions we want to answer
5. **Manual taxonomy** - Start categorizing projects into capabilities

### Quick Win (1-2 Days)
Build a simple keyword search as proof-of-concept:
- Aggregate all extracted text into single JSON file
- Create basic API endpoint with `.includes()` search
- Add search bar to dashboard
- Demo with "accounts payable" query

This validates the approach before committing to full 10-week build.

---

**Ready to proceed with implementation?** Let me know which phase to start with, or if you'd like to begin with the quick win proof-of-concept.
