# Simple Personal Budget

A privacy-friendly budgeting web app for single users. Track income, expenses, and visualize spending patterns with beautiful charts.

## Features

### 🔐 Authentication
- Email/password signup & login
- Google OAuth integration
- Secure session management

### 📊 Dashboard
- Real-time KPI cards (Income, Expenses, Net Balance)
- Interactive charts (spending by category, daily trends)
- Quick transaction entry
- Recent transactions overview

### 🏷️ Categories
- Create custom categories with colors
- Edit/delete categories
- Auto-seeded defaults on signup
- Visual color indicators

### 💰 Transactions
- Full transaction history with filters
- Inline editing and deletion
- Search by note or amount
- Date range and category filtering
- CSV export

### 📧 Reports
- Monthly email summaries (via Resend)
- CSV export of all transactions
- Beautiful HTML email templates

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Database:** Supabase (PostgreSQL)
- **ORM:** Drizzle
- **Auth:** Supabase Auth
- **Charts:** Chart.js
- **Styling:** Tailwind CSS
- **Email:** Resend

## Setup

### Prerequisites
- Node.js 18+
- Supabase account
- Resend account (optional, for email reports)

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd SimplePersonalBudget
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
RESEND_API_KEY=re_your_resend_api_key  # Optional
```

4. Push database schema
```bash
npx drizzle-kit push
```

5. Set up Row Level Security (RLS) in Supabase

Go to Supabase SQL Editor and run:
```sql
-- Enable RLS
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE category ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_tag ENABLE ROW LEVEL SECURITY;

-- Create policies (see SECURITY.md for full SQL)
```

6. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # Protected dashboard pages
│   ├── transactions/     # Transaction history page
│   └── login/           # Auth pages
├── components/          # React components
├── lib/
│   ├── db/             # Database schema & client
│   ├── supabase/       # Supabase utilities
│   └── analytics.ts    # Data aggregation logic
└── middleware.ts       # Auth middleware
```

## Security

- ✅ Row Level Security (RLS) enabled
- ✅ Server-side authentication checks
- ✅ Input validation on API routes
- ✅ SQL injection protection via ORM
- ✅ Session management via Supabase

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Environment Variables (Production)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `RESEND_API_KEY` (optional)

## License

MIT

## Contributing

Pull requests welcome! Please ensure:
- Code passes `npm run lint`
- TypeScript types are correct
- RLS policies are tested
