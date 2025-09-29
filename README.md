# Markman Group Financial Reporting

A CFO-level financial reporting dashboard that analyzes Chase bank CSV files to provide comprehensive business insights and executive-level financial summaries.

## Features

### 🔍 Data Analysis
- **Automatic CSV Detection**: Recognizes Chase checking account and credit card formats
- **Transaction Categorization**: Smart categorization of business expenses and revenue
- **Client Payment Tracking**: Identifies and tracks major client payments
- **Consultant Payment Analysis**: Monitors international contractor payments

### 📊 Executive Reports
- **Monthly Cash Flow**: Detailed month-over-month financial trends
- **Category Breakdowns**: Spending analysis by business category
- **Account Summaries**: Real-time balance and transaction summaries
- **Combined Financial Overview**: Unified view across all accounts

### 💼 Business Intelligence
- **Vendor Analysis**: Track payments to suppliers and service providers
- **Expense Management**: Categorized business expense tracking
- **Revenue Recognition**: Client payment pattern analysis
- **Financial Forecasting**: Trend-based projections

## Technology Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Custom CSV Parser**: Handles Chase bank formats

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/markmangroup/markman-group-financial-reporting.git
cd markman-group-financial-reporting

# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage

1. **Upload CSV Files**: Drag and drop your Chase bank CSV files
   - Business checking account CSV
   - Business credit card CSV

2. **View Analysis**: The dashboard automatically generates:
   - Account summaries and balances
   - Monthly cash flow analysis
   - Category-wise spending breakdowns
   - Client and vendor payment tracking

3. **Export Reports**: Financial summaries ready for executive review

## CSV File Formats

### Chase Checking Account
- Columns: `Details, Posting Date, Description, Amount, Type, Balance, Check or Slip #`
- Automatically categorizes: Client payments, consultant wires, business services

### Chase Credit Card
- Columns: `Card, Transaction Date, Post Date, Description, Category, Type, Amount, Memo`
- Pre-categorized spending: Office supplies, travel, utilities, professional services

## Development

```bash
# Type checking
npm run type-check

# Build for production
npm run build

# Start production server
npm start
```

## Data Security

- **Client-side Processing**: All CSV parsing happens in your browser
- **No Data Storage**: Files are never uploaded to external servers
- **Privacy First**: Your financial data stays on your machine

## Contributing

This is a private business tool. For issues or feature requests, contact the development team.

## License

Private - Markman Group LLC

---

**Built for Markman Group's financial analysis and CFO reporting needs.**