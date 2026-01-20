# VedZeb - დაკარგული დედმამისვილების საძიებო პლატფორმა

Search platform for lost siblings - for those who were adopted or taken at birth.

## Tech Stack

### Frontend
- React 18 with Vite
- React Router for navigation
- React Query for server state management
- i18next for multilingual support (Georgian, English, Russian)
- Tailwind CSS for styling
- React Hook Form for form handling

### Backend
- Node.js + Express
- PostgreSQL with Prisma ORM
- JWT authentication
- SMS verification (Twilio/mock mode)
- Cloudinary for image uploads

## Project Structure

```
vedzeb/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # Auth context
│   │   ├── services/       # API calls
│   │   ├── i18n/           # Translations
│   │   └── hooks/          # Custom hooks
│   └── package.json
│
├── server/                 # Node.js Backend
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, validation
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── app.js
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- (Optional) Twilio account for SMS
- (Optional) Cloudinary account for images

### Server Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Update `.env` with your database URL and other settings:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/vedzeb"
JWT_SECRET="your-secret-key"
SMS_MOCK_MODE="true"  # Set to false for real SMS
```

5. Generate Prisma client and run migrations:
```bash
npm run db:generate
npm run db:push
```

6. Start development server:
```bash
npm run dev
```

Server runs on http://localhost:3001

### Client Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Client runs on http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/auth/send-code` - Send SMS verification code
- `POST /api/auth/verify-code` - Verify code and get tokens
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Profiles
- `GET /api/profiles` - List profiles (with filters)
- `GET /api/profiles/:id` - Get profile details
- `POST /api/profiles` - Create profile
- `PUT /api/profiles/:id` - Update profile
- `DELETE /api/profiles/:id` - Delete profile
- `POST /api/profiles/:id/photos` - Upload photo
- `DELETE /api/profiles/:id/photos/:photoId` - Delete photo

### Contact Requests
- `POST /api/contact-requests` - Send contact request
- `GET /api/contact-requests` - Get my requests
- `PUT /api/contact-requests/:id` - Update status (accept/reject)

### Search Alerts
- `POST /api/alerts` - Create alert
- `GET /api/alerts` - Get my alerts
- `PUT /api/alerts/:id` - Update alert
- `DELETE /api/alerts/:id` - Delete alert

## Features

- **Multilingual Support**: Georgian, English, Russian
- **SMS Authentication**: Phone number verification
- **Profile Management**: Create, edit, delete search profiles
- **Photo Upload**: Multiple photos per profile
- **Advanced Search**: Filter by type, region, gender, birth year
- **Contact Requests**: Secure messaging system
- **Search Alerts**: Get notified of new matches
- **Responsive Design**: Works on mobile and desktop

## Development Notes

### SMS Mock Mode
In development, set `SMS_MOCK_MODE=true` in your `.env` file. Verification codes will be printed to the console instead of being sent via SMS.

### Database
The project uses PostgreSQL with Prisma ORM. To view and manage data:
```bash
npm run db:studio
```

## License

MIT
