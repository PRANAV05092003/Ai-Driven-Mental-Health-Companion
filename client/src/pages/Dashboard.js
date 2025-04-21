import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import apiService from '../services/apiService';
import { 
  FaRegSmile, 
  FaRegSadTear, 
  FaRegMeh, 
  FaChartLine, 
  FaBook, 
  FaComment, 
  FaLightbulb,
  FaCalendarAlt,
  FaArrowRight
} from 'react-icons/fa';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [moodData, setMoodData] = useState(null);
  const [recentJournals, setRecentJournals] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch mood stats
        const moodResponse = await apiService.getMoodStats();
        
        // Fetch recent journal entries
        const journalResponse = await apiService.getJournalEntries({ limit: 3 });
        
        // Fetch recommended resources
        const resourceResponse = await apiService.getResources({ featured: true, limit: 3 });
        
        setMoodData(moodResponse.data.stats);
        setRecentJournals(journalResponse.data.entries || []);
        setResources(resourceResponse.data.resources || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const getMoodIcon = (mood) => {
    switch(mood?.toLowerCase()) {
      case 'happy':
        return <FaRegSmile className="text-success text-2xl" />;
      case 'sad':
        return <FaRegSadTear className="text-error text-2xl" />;
      default:
        return <FaRegMeh className="text-warning text-2xl" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold text-error mb-4">Oops! Something went wrong</h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 min-h-screen pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">
            Good {getTimeOfDay()}, {currentUser?.name || 'there'}!
          </h1>
          <p className="text-white/90 text-lg">
            Welcome to your personal mental health dashboard
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Quick Actions */}
          <div className="md:col-span-3">
            <Card className="shadow-card">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-neutral-200 dark:divide-neutral-700">
                  
                  <Link to="/moods/add" className="p-6 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mr-4">
                        <FaRegSmile className="text-primary-600 dark:text-primary-300 text-xl" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900 dark:text-white text-lg">Log Mood</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">Record how you're feeling</p>
                      </div>
                    </div>
                  </Link>
                  
                  <Link to="/journal/new" className="p-6 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-secondary-100 dark:bg-secondary-900 flex items-center justify-center mr-4">
                        <FaBook className="text-secondary-600 dark:text-secondary-300 text-xl" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900 dark:text-white text-lg">New Journal</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">Express your thoughts</p>
                      </div>
                    </div>
                  </Link>
                  
                  <Link to="/chat" className="p-6 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-accent-100 dark:bg-accent-900 flex items-center justify-center mr-4">
                        <FaComment className="text-accent-600 dark:text-accent-300 text-xl" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900 dark:text-white text-lg">AI Chat</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">Talk to your companion</p>
                      </div>
                    </div>
                  </Link>
                  
                  <Link to="/resources" className="p-6 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mr-4">
                        <FaLightbulb className="text-yellow-500 text-xl" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900 dark:text-white text-lg">Resources</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">Explore helpful content</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Mood Overview */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Mood Overview</CardTitle>
                <Link to="/moods">
                  <Button variant="ghost" size="sm" icon={<FaChartLine />}>
                    Details
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {moodData ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Most frequent</p>
                      <div className="flex items-center mt-1">
                        {getMoodIcon(moodData.mostFrequentMood)}
                        <span className="ml-2 font-semibold text-neutral-900 dark:text-white">
                          {moodData.mostFrequentMood || 'No data'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Entries</p>
                      <p className="text-xl font-semibold text-neutral-900 dark:text-white text-center">
                        {moodData.totalEntries || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Avg. Intensity</p>
                      <p className="text-xl font-semibold text-neutral-900 dark:text-white text-center">
                        {moodData.averageIntensity || 0}/10
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Recent Moods</p>
                    <div className="flex flex-wrap gap-2">
                      {moodData.moodCounts && Object.keys(moodData.moodCounts).slice(0, 5).map(mood => (
                        <Badge key={mood} variant={getMoodVariant(mood)} rounded>
                          {mood}: {moodData.moodCounts[mood]}
                        </Badge>
                      ))}
                      
                      {(!moodData.moodCounts || Object.keys(moodData.moodCounts).length === 0) && (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          No mood data available yet. Start logging your moods!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-neutral-500 dark:text-neutral-400">
                    No mood data available yet. Start logging your moods!
                  </p>
                  <Link to="/moods/add" className="mt-4 inline-block">
                    <Button variant="primary" size="sm">Log Your First Mood</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Journal Entries */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Journal Entries</CardTitle>
                <Link to="/journal">
                  <Button variant="ghost" size="sm" icon={<FaBook />}>
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentJournals && recentJournals.length > 0 ? (
                <div className="space-y-4">
                  {recentJournals.map(entry => (
                    <Link key={entry._id} to={`/journal/${entry._id}`}>
                      <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-neutral-900 dark:text-white">{entry.title}</h4>
                          <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
                            <FaCalendarAlt className="mr-1" />
                            {formatDate(entry.date)}
                          </div>
                        </div>
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm line-clamp-2">
                          {entry.content}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-neutral-500 dark:text-neutral-400">
                    No journal entries yet. Start expressing your thoughts!
                  </p>
                  <Link to="/journal/new" className="mt-4 inline-block">
                    <Button variant="primary" size="sm">Write Your First Entry</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Recommended Resources */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recommended Resources</CardTitle>
                <Link to="/resources">
                  <Button variant="ghost" size="sm" icon={<FaLightbulb />}>
                    Explore
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {resources && resources.length > 0 ? (
                <div className="space-y-4">
                  {resources.map(resource => (
                    <a
                      key={resource._id}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-neutral-900 dark:text-white mb-1">{resource.title}</h4>
                          <p className="text-neutral-600 dark:text-neutral-400 text-sm line-clamp-2">
                            {resource.description}
                          </p>
                        </div>
                        <div className="text-primary-600 dark:text-primary-400 ml-4">
                          <FaArrowRight />
                        </div>
                      </div>
                      <div className="mt-2">
                        <Badge size="sm" variant="neutral">
                          {resource.type}
                        </Badge>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-neutral-500 dark:text-neutral-400">
                    No recommended resources yet.
                  </p>
                  <Link to="/resources" className="mt-4 inline-block">
                    <Button variant="primary" size="sm">Browse Resources</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
};

const getMoodVariant = (mood) => {
  switch(mood?.toLowerCase()) {
    case 'happy':
    case 'excited':
    case 'content':
    case 'grateful':
    case 'energetic':
      return 'success';
    case 'sad':
    case 'anxious':
    case 'frustrated':
    case 'stressed':
    case 'overwhelmed':
      return 'error';
    case 'calm':
    case 'hopeful':
      return 'primary';
    case 'bored':
    case 'tired':
    case 'confused':
      return 'warning';
    default:
      return 'neutral';
  }
};

export default Dashboard; 