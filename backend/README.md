# Finance Flow Backend

Node.js + Express + PostgreSQL backend server for Finance Flow personal finance management application.

## Quick Start

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your PostgreSQL credentials
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

The server will start at `http://localhost:3001`

## Environment Configuration

See `../ENVIRONMENT_NOTES.md` for complete environment setup:
- **Database**: PostgreSQL 17 at `/Library/Postgresql/17/bin/postgres`
- **Database Name**: `finance`
- **Database User**: `luxmiuser`
- **Database Password**: `luxmi`
- **Backend Port**: `3001`
- **Frontend Port**: `5173`

## API Endpoints

### Health & Status
- `GET /health` - Server health check
- `GET /api/status` - API status and configuration

### Authentication (Mock - To Be Implemented)
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Entity Endpoints (Mock - To Be Implemented)
- `GET /api/income` - List income records
- `POST /api/income` - Create income record
- `PUT /api/income/:id` - Update income record
- `DELETE /api/income/:id` - Delete income record

Similar patterns for: `expenses`, `bills`, `debts`, `assets`, `creditcards`, `insurance`, `budgetitems`, `budgets`, `accounts`

## Database Schema

See `../PostgreSQL_Database_Requirements.md` for complete database schema with:
- Users table with authentication
- 10 financial entity tables
- Proper relationships and indexes
- Security and encryption

## Next Steps

1. **Database Setup**: Create PostgreSQL schema
2. **Authentication**: Implement JWT authentication
3. **Entity Services**: Create CRUD operations for all entities
4. **Data Migration**: Import data from Base44
5. **Testing**: Add comprehensive test coverage

See `../Implementation_Todo_Plan.md` for detailed implementation roadmap.

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run migrate` - Run database migrations (to be implemented)
- `npm run seed` - Seed database with sample data (to be implemented)
- `npm run db:setup` - Setup database schema (to be implemented)
- `npm test` - Run tests (to be implemented)

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 17
- **Authentication**: JWT
- **Security**: Helmet, CORS
- **Validation**: Zod
- **Logging**: Winston
- **Testing**: Jest + Supertest