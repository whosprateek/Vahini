# Vahini Power Grid Monitoring System

A comprehensive power grid monitoring and management system built with Next.js, featuring real-time monitoring, fault detection, maintenance scheduling, and user authentication.

![Power Grid Dashboard](https://img.shields.io/badge/Status-Active-green)
![Next.js](https://img.shields.io/badge/Next.js-14.2.16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)

## 🚀 Features

### 🔐 Authentication System
- **Login Form**: Secure authentication with demo credentials
- **Sign-Up Form**: Complete user registration with validation
- **Account Management**: Profile editing, security settings, and session management
- **Multi-tab Settings**: Authentication, Security, Notifications, Appearance, System

### 📊 Power Grid Monitoring
- **Real-time Dashboard**: Live monitoring of power grid status
- **Line Status Overview**: Detailed view of transmission lines
- **Fault Detection**: Automated fault identification and alerts
- **Maintenance Scheduling**: Track and schedule maintenance activities
- **Interactive Grid Map**: Visual representation of power infrastructure

### 🎨 User Interface
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark/Light Mode**: Theme switching capability
- **Professional UI**: Modern gradient designs and animations
- **Interactive Maps**: Google Maps integration for geographical data
- **Real-time Alerts**: Instant notifications for critical events

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Maps**: [Google Maps API](https://developers.google.com/maps)
- **Charts**: [Recharts](https://recharts.org/)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/vahini-power-grid-master.git
   cd vahini-power-grid-master
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add your Google Maps API key and other configurations
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 Demo Credentials

For testing the authentication system:
- **Email**: `admin@powergrid.com`
- **Password**: `admin123`

## 📱 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🗂️ Project Structure

```
vahini-power-grid-master/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Main page
├── components/            # React components
│   ├── auth/             # Authentication components
│   │   ├── login-form.tsx
│   │   ├── signup-form.tsx
│   │   └── manage-account.tsx
│   ├── ui/               # UI components
│   ├── dashboard.tsx     # Main dashboard
│   ├── sidebar.tsx       # Navigation sidebar
│   ├── settings.tsx      # Settings page
│   └── ...               # Other components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
└── public/               # Static assets
```

## 🔧 Configuration

### Google Maps Setup
1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Maps JavaScript API and Places API
3. Add your API key to environment variables

### Environment Variables
Create a `.env.local` file with:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
# Add other environment variables as needed
```

## 🌟 Key Components

### Authentication System
- **Login Form**: Email/password authentication with remember me
- **Sign-up Form**: Complete registration with role selection
- **Account Management**: Profile editing, security, notifications, sessions

### Dashboard Features
- **System Health**: Real-time monitoring of grid components
- **Line Status**: Individual transmission line monitoring
- **Critical Alerts**: Immediate notification system
- **Team Status**: Staff and operations overview
- **Analytics**: Performance metrics and reporting

### Settings Management
- **Authentication Tab**: Login, signup, account management
- **Security Tab**: Password, 2FA, session management
- **Notifications Tab**: Alert preferences and settings
- **Appearance Tab**: Theme and layout customization
- **System Tab**: Regional settings and data export

## 🚀 Deployment

### Deploy to Vercel
1. Install Vercel CLI: `npm install -g vercel`
2. Login to Vercel: `vercel login`
3. Deploy: `vercel --prod`

### Deploy to Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Heroku
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: Aditya Raj Singh
- **Email**: adityaraj200326@gmail.com

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Lucide](https://lucide.dev/) for beautiful icons

## 📞 Support

If you have any questions or need help with the project, feel free to:
- Open an issue on GitHub
- Contact: adityaraj200326@gmail.com

---

**Made with ❤️ for efficient power grid management**
