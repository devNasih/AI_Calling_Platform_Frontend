# AI Calling Platform - Frontend

A modern React-based frontend for the AI Calling Platform. This application provides a comprehensive interface for managing AI-powered calling campaigns, contacts, and analytics.

## 🚀 Features

- **Authentication**: Secure login system with JWT token support
- **Dashboard**: Real-time analytics and overview of campaign performance
- **Contact Management**: Upload and manage contact lists via CSV
- **Campaign Management**: Create and monitor AI calling campaigns
- **Analytics**: Detailed insights and reporting
- **Responsive Design**: Modern UI built with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library with shadcn/ui
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AI-calling-platform-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://your-backend-api-url
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🔧 Configuration

### Environment Variables

- `VITE_API_BASE_URL`: The base URL of your backend API

### API Integration

This frontend is designed to work with a separate backend API. The main API endpoints used are:

- `POST /v1/login` - User authentication (OAuth2 password flow)
- `GET /v1/contacts/all` - Fetch all contacts
- `POST /v1/contacts/upload` - Upload contacts via CSV
- Additional endpoints for campaigns, analytics, etc.

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (Button, Modal, etc.)
│   ├── layout/         # Layout components (Navbar, Sidebar)
│   └── ui/             # Base UI components
├── contexts/           # React contexts (Auth, etc.)
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── routes/             # Route configuration
├── services/           # API service functions
├── types/              # TypeScript type definitions
└── lib/                # Utility functions
```

## 🔐 Authentication

The application uses JWT token-based authentication with OAuth2 password flow. Users need to login with their credentials to access the application features.

## 📱 Features Overview

### Dashboard
- Real-time campaign statistics
- Recent activity overview
- Performance metrics

### Contacts
- CSV file upload for bulk contact import
- Contact list viewing with search and filters
- Contact management interface

### Campaigns
- Campaign creation and management
- Real-time campaign monitoring
- Campaign performance analytics

### Analytics
- Detailed performance reports
- Call success rates
- Historical data analysis

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting platform (Vercel, Netlify, etc.)

3. **Configure environment variables** on your hosting platform

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

The project uses TypeScript with strict mode enabled and follows React best practices.

## 📄 License

This project is licensed under the MIT License.

