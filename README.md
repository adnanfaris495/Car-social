# Wheels - Car Social Media Platform

A modern social media platform built for car enthusiasts to share their vehicles, connect with other enthusiasts, and participate in car-related discussions.

## 🚗 Features

### ✅ Completed Features
- **User Authentication** - Secure login/signup with Supabase Auth
- **User Profiles** - Customizable profiles with following system
- **Car Garage** - Add, manage, and showcase your vehicles
- **Social Features** - Follow other users, view their garages
- **Forums** - Brand-specific discussion boards
- **Meets** - Create and join car meetups
- **Dark/Light Theme** - Beautiful theme switching
- **Responsive Design** - Works on all devices

### 🚧 Coming Soon
- **Marketplace** - Buy, sell, and trade vehicles and parts
- **Messaging** - Direct communication between users
- **Advanced Search** - Find specific cars and users
- **Mobile App** - Native iOS and Android apps

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, CSS Variables
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel
- **Icons**: Tabler Icons

## 🚀 Deployment

### Prerequisites
- Node.js 18+ 
- Supabase account
- Vercel account

### Environment Variables
Create a `.env.local` file with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Deploy to Vercel
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## 📱 Screenshots

### Homepage
- Instagram-inspired layout with left sidebar navigation
- Featured users and recent car updates
- Clean, modern design

### Garage
- Add and manage your car collection
- Set favorite car as avatar
- Beautiful car cards with images

### Forums
- Brand-specific discussion boards
- Rich text posts with images
- Community engagement

### Profile
- User profiles with following system
- Activity feed and statistics
- Customizable settings

## 🎨 Design System

- **Colors**: Red and black gradient theme
- **Typography**: Modern, readable fonts
- **Components**: Consistent card and button designs
- **Responsive**: Mobile-first approach

## 🔧 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📊 Database Schema

### Core Tables
- `users` - User profiles and authentication
- `cars` - Vehicle information and images
- `forum_posts` - Discussion posts
- `meets` - Car meetup events
- `follows` - User following relationships

### Features
- Row Level Security (RLS) enabled
- Real-time subscriptions
- Image storage with Supabase Storage
- Optimized queries and indexes

## 🤝 Contributing

This is a portfolio project showcasing modern web development skills including:
- Full-stack development with Next.js
- Database design and optimization
- Authentication and authorization
- Real-time features
- Responsive UI/UX design
- TypeScript and modern JavaScript
- Deployment and CI/CD

## 📄 License

This project is for portfolio purposes. All car brand names and logos are trademarks of their respective owners.

---

Built with ❤️ for the car enthusiast community 