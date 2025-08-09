# Finance Flow - Environment Configuration Notes

## Project Environment Settings

### Default Configuration
- **Default Port**: Always use the same default port number (will be determined during setup)
- **Tech Stack**: React, Tailwind CSS, PostgreSQL, Node.js/Express

### PostgreSQL Configuration
- **PostgreSQL Path**: `/Library/Postgresql/17/bin/postgres`
- **PostgreSQL Version**: 17
- **Superuser**: `postgres`
- **Superuser Password**: `luxmi`

### Database Setup
- **Database Name**: `finance`
- **Database User**: `luxmiuser`
- **Database Password**: `luxmi`

### Environment Variables Template
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finance
DB_USER=luxmiuser
DB_PASSWORD=luxmi

# Application Configuration
NODE_ENV=development
PORT=3001  # Backend API port (to be confirmed)
FRONTEND_PORT=5173  # Vite default port

# Security
JWT_SECRET=your_jwt_secret_key_here
ENCRYPTION_KEY=your_encryption_key_here

# PostgreSQL Path
POSTGRES_PATH=/Library/Postgresql/17/bin/postgres
```

### Database Creation Commands
```sql
-- Connect as superuser postgres
CREATE DATABASE finance;
CREATE USER luxmiuser WITH PASSWORD 'luxmi';
GRANT ALL PRIVILEGES ON DATABASE finance TO luxmiuser;
GRANT ALL ON SCHEMA public TO luxmiuser;
```

### Connection String
```javascript
// PostgreSQL connection string
const connectionString = 'postgresql://luxmiuser:luxmi@localhost:5432/finance';
```

### Notes for Implementation
- Always refer to these settings during database setup
- Use these credentials consistently across all configuration files
- Ensure PostgreSQL path is correctly referenced in scripts
- Maintain same port numbers throughout development and deployment