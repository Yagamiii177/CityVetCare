# CityVetCare Backend - Node.js/Express

Modern Node.js backend for CityVetCare application, migrated from PHP.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
copy .env.example .env
```

Edit `.env` with your database credentials:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=cityvetcare_db
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

3. **Run database migrations:**
```bash
npm run migrate
```

4. **Start the server:**
```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:3000`

## 📁 Project Structure

```
Backend-Node/
├── config/
│   └── database.js          # MySQL2 connection pool
├── models/
│   ├── Incident.js          # Incident model
│   ├── PatrolStaff.js       # Patrol staff model
│   ├── PatrolSchedule.js    # Patrol schedule model
│   └── CatcherTeam.js       # Catcher team model
├── routes/
│   ├── incidents.js         # Incident endpoints
│   ├── patrol-staff.js      # Patrol staff endpoints
│   ├── patrol-schedules.js  # Patrol schedule endpoints
│   ├── catchers.js          # Catcher team endpoints
│   ├── dashboard.js         # Dashboard statistics
│   └── health.js            # Health check
├── migrations/
│   ├── 001_stored_procedures.sql  # Database stored procedures
│   ├── run-migrations.js          # Migration runner
│   └── MIGRATION_LOG.md           # Detailed migration docs
├── server.js                # Main application entry
├── package.json
└── .env.example
```

## 🔌 API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Available Endpoints

#### Health Check
- `GET /api/health` - Server health status

#### Incidents
- `GET /api/incidents` - Get all incidents
- `GET /api/incidents/:id` - Get single incident
- `POST /api/incidents` - Create new incident
- `PUT /api/incidents/:id` - Update incident
- `DELETE /api/incidents/:id` - Delete incident

#### Patrol Staff
- `GET /api/patrol-staff` - Get all patrol staff
- `GET /api/patrol-staff/:id` - Get single staff
- `POST /api/patrol-staff` - Create staff member
- `PUT /api/patrol-staff/:id` - Update staff
- `DELETE /api/patrol-staff/:id` - Delete staff

#### Patrol Schedules
- `GET /api/patrol-schedules` - Get all schedules
- `GET /api/patrol-schedules/:id` - Get single schedule
- `GET /api/patrol-schedules/incident/:incidentId` - Get by incident
- `POST /api/patrol-schedules` - Create schedule
- `PUT /api/patrol-schedules/:id` - Update schedule
- `DELETE /api/patrol-schedules/:id` - Delete schedule

#### Catcher Teams
- `GET /api/catchers` - Get all catcher teams
- `GET /api/catchers/:id` - Get single team
- `POST /api/catchers` - Create team
- `PUT /api/catchers/:id` - Update team
- `DELETE /api/catchers/:id` - Delete team

#### Dashboard
- `GET /api/dashboard` - Get comprehensive statistics

## 🗄️ Database Stored Procedures

The migration includes 10 stored procedures for complex operations:

1. **sp_get_incident_statistics** - Get incident stats by status/priority
2. **sp_get_active_patrol_schedules** - Get active patrol schedules
3. **sp_assign_patrol_to_incident** - Assign staff to incident (transaction-safe)
4. **sp_complete_patrol_schedule** - Mark patrol as completed
5. **sp_get_incidents_by_date_range** - Filter incidents by date
6. **sp_get_available_patrol_staff** - Get available staff for date
7. **sp_get_monthly_incident_report** - Monthly analytics
8. **sp_bulk_update_incident_status** - Bulk status updates
9. **sp_get_catcher_team_performance** - Team performance metrics
10. **sp_archive_old_incidents** - Archive old resolved incidents

See `migrations/MIGRATION_LOG.md` for detailed documentation.

## 🛠️ Development

### Running in Development Mode
```bash
npm run dev
```

Uses `nodemon` for automatic server restart on file changes.

### Testing Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Get all incidents
curl http://localhost:3000/api/incidents

# Create new incident
curl -X POST http://localhost:3000/api/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Dog Bite Incident",
    "location": "123 Main St",
    "priority": "high",
    "reporter_name": "John Doe",
    "reporter_contact": "09123456789"
  }'
```

## 📦 Dependencies

### Core
- **express** - Web framework
- **mysql2** - MySQL client with promises
- **cors** - CORS middleware
- **dotenv** - Environment variables

### Development
- **nodemon** - Auto-reload during development

## 🔄 Migration from PHP

This backend replaces the PHP version with modern Node.js/Express:

- ✅ Better performance with async/await
- ✅ Connection pooling for database
- ✅ ES6 modules
- ✅ Built-in JSON handling
- ✅ Stored procedures for complex operations
- ✅ Environment-based configuration

### Frontend Update Required

Update your frontend API base URL from:
```javascript
// Old PHP
const API_BASE_URL = 'http://localhost/CityVetCare/Backend';

// New Node.js
const API_BASE_URL = 'http://localhost:3000';
```

All endpoints and response formats remain the same.

## 📚 Documentation

For complete migration details, see:
- `migrations/MIGRATION_LOG.md` - Full migration documentation
- `migrations/001_stored_procedures.sql` - Database procedures

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📄 License

MIT License - CityVetCare Team

## 🆘 Troubleshooting

### Database Connection Failed
- Check MySQL is running
- Verify `.env` credentials
- Ensure database `cityvetcare_db` exists

### Port Already in Use
- Change `PORT` in `.env`
- Or stop the process using port 3000

### Migration Errors
- Run migrations manually from `migrations/001_stored_procedures.sql`
- Check MySQL user has CREATE PROCEDURE privileges

---

**Built with ❤️ for CityVetCare**
