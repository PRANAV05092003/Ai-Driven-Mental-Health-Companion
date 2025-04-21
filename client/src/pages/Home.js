import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeartbeat, FaChartLine, FaBook, FaComments, FaShieldAlt } from 'react-icons/fa';
import Button from '../components/ui/Button';

// Import custom icons if needed
import { 
  BsChatDotsFill, 
  BsEmojiSmileFill, 
  BsShieldLockFill, 
  BsLightbulbFill,
  BsPersonCheckFill,
  BsGraphUp
} from 'react-icons/bs';

const Home = () => {
  return (
    <div className="bg-gradient-to-b from-white to-primary-50 dark:from-neutral-900 dark:to-primary-900 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 md:pt-20 lg:pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Your Personal
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500">
                {' Mental Health '}
              </span>
              Companion
            </h1>
            
            <p className="mt-6 text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
              Track your mood, journal your thoughts, and access personalized resources 
              to support your mental well-being journey.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button 
                  size="lg" 
                  className="font-semibold shadow-lg"
                  rounded
                >
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="font-semibold shadow-lg"
                  rounded
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-gradient-to-br from-primary-300/30 to-accent-300/30 rounded-full filter blur-3xl opacity-70 animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-gradient-to-br from-secondary-300/30 to-primary-300/30 rounded-full filter blur-3xl opacity-70 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </section>

      {/* Features Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-neutral-900 dark:text-white mb-12">
          Everything You Need for Your Mental Health Journey
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${feature.bgColor}`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-neutral-50 dark:bg-neutral-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-neutral-900 dark:text-white mb-12">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="relative bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4 mt-2">
                  {step.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-neutral-900 dark:text-white mb-12">
          What Our Users Say
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-card"
            >
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-medium">
                  {testimonial.initials}
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold text-neutral-900 dark:text-white">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {testimonial.location}
                  </p>
                </div>
              </div>
              <p className="text-neutral-600 dark:text-neutral-300 italic">
                "{testimonial.quote}"
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Start Your Mental Health Journey Today
          </h2>
          <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
            Join thousands of users who are taking charge of their mental well-being with our companion app.
          </p>
          <Link to="/register">
            <Button 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white hover:text-primary-600 font-semibold shadow-lg"
              rounded
            >
              Sign Up for Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Mental Health Companion
              </h3>
              <p className="text-neutral-400">
                Your personal guide to mental well-being and emotional health.
              </p>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><Link to="/" className="hover:text-white transition-colors">Mood Tracking</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Journal</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Resources</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">AI Chat</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">About</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><Link to="/" className="hover:text-white transition-colors">Our Mission</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><Link to="/" className="hover:text-white transition-colors">Crisis Support</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Mental Health Blog</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Community</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Help Center</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-neutral-800 text-neutral-400 text-sm text-center">
            <p>© {new Date().getFullYear()} Mental Health Companion. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Sample Data
const features = [
  {
    title: 'Mood Tracking',
    description: 'Log and visualize your moods over time to identify patterns and triggers.',
    icon: <FaChartLine className="text-white text-xl" />,
    bgColor: 'bg-primary-600',
  },
  {
    title: 'Digital Journal',
    description: 'Express your thoughts and feelings in a private, secure digital journal.',
    icon: <FaBook className="text-white text-xl" />,
    bgColor: 'bg-secondary-600',
  },
  {
    title: 'AI Chat Support',
    description: 'Chat with our AI companion for guidance, support, and coping strategies.',
    icon: <FaComments className="text-white text-xl" />,
    bgColor: 'bg-accent-600',
  },
  {
    title: 'Privacy Focused',
    description: 'Your data is encrypted and secure. Your privacy is our top priority.',
    icon: <FaShieldAlt className="text-white text-xl" />,
    bgColor: 'bg-neutral-700 dark:bg-neutral-600',
  },
];

const steps = [
  {
    title: 'Create Your Account',
    description: 'Sign up in just a few seconds with your email. Your journey to better mental health begins here.',
  },
  {
    title: 'Track Your Moods',
    description: 'Log your daily moods and emotions. Our app will help you visualize patterns over time.',
  },
  {
    title: 'Get Personalized Support',
    description: 'Receive customized resources and insights based on your mood patterns and journal entries.',
  },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    initials: 'SJ',
    location: 'New York, NY',
    quote: 'This app has been a game-changer for my anxiety. The mood tracking helped me identify triggers I wasn't even aware of.',
  },
  {
    name: 'Michael Chen',
    initials: 'MC',
    location: 'San Francisco, CA',
    quote: 'I love how the journal prompts help me reflect on my day. It's become an essential part of my evening routine.',
  },
  {
    name: 'Emily Rodriguez',
    initials: 'ER',
    location: 'Chicago, IL',
    quote: 'The AI chat feature feels like having a supportive friend available 24/7. It's helped me through some really tough moments.',
  },
];

export default Home; 