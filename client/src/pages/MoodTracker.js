import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import apiService from '../services/apiService';
import { 
  FaRegSmile, 
  FaRegLaughBeam, 
  FaRegMeh, 
  FaRegFrown, 
  FaRegSadTear,
  FaPlus,
  FaTimes,
  FaCalendarAlt,
  FaChartBar,
  FaSave
} from 'react-icons/fa';

const MoodTracker = () => {
  const { currentUser } = useContext(AuthContext);
  const [view, setView] = useState('log'); // 'log', 'history', 'stats'
  const [loading, setLoading] = useState(false);
  const [moods, setMoods] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  
  // Form state for adding a new mood
  const [newMood, setNewMood] = useState({
    mood: '',
    intensity: 5,
    notes: '',
    factors: [],
    date: new Date().toISOString().split('T')[0],
  });
  
  // For factors input
  const [factorInput, setFactorInput] = useState('');
  
  useEffect(() => {
    if (view === 'history' || view === 'stats') {
      fetchMoodData();
    }
  }, [view]);
  
  const fetchMoodData = async () => {
    try {
      setLoading(true);
      
      // Fetch moods
      const moodResponse = await apiService.getMoods();
      setMoods(moodResponse.data.moods || []);
      
      // Fetch stats
      if (view === 'stats') {
        const statsResponse = await apiService.getMoodStats();
        setStats(statsResponse.data.stats || null);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching mood data:', err);
      setError('Failed to load mood data. Please try again later.');
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMood(prev => ({ ...prev, [name]: value }));
  };
  
  const handleIntensityChange = (intensity) => {
    setNewMood(prev => ({ ...prev, intensity }));
  };
  
  const handleAddFactor = () => {
    if (factorInput.trim() && !newMood.factors.includes(factorInput.trim())) {
      setNewMood(prev => ({
        ...prev,
        factors: [...prev.factors, factorInput.trim()]
      }));
      setFactorInput('');
    }
  };
  
  const handleRemoveFactor = (factor) => {
    setNewMood(prev => ({
      ...prev,
      factors: prev.factors.filter(f => f !== factor)
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newMood.mood) {
      setError('Please select a mood');
      return;
    }
    
    try {
      setLoading(true);
      
      await apiService.addMood(newMood);
      
      // Reset form
      setNewMood({
        mood: '',
        intensity: 5,
        notes: '',
        factors: [],
        date: new Date().toISOString().split('T')[0],
      });
      
      setError(null);
      setLoading(false);
      
      // Show success message or switch to history view
      setView('history');
      fetchMoodData();
      
    } catch (err) {
      console.error('Error saving mood:', err);
      setError('Failed to save mood. Please try again.');
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getMoodEmoji = (mood) => {
    switch(mood?.toLowerCase()) {
      case 'happy':
        return <FaRegSmile className="text-success text-2xl" />;
      case 'excited':
        return <FaRegLaughBeam className="text-success text-2xl" />;
      case 'sad':
        return <FaRegSadTear className="text-error text-2xl" />;
      case 'angry':
      case 'frustrated':
        return <FaRegFrown className="text-error text-2xl" />;
      default:
        return <FaRegMeh className="text-warning text-2xl" />;
    }
  };
  
  const moods_list = [
    { name: 'Happy', emoji: <FaRegSmile />, color: 'bg-green-500' },
    { name: 'Excited', emoji: <FaRegLaughBeam />, color: 'bg-blue-500' },
    { name: 'Calm', emoji: <FaRegMeh />, color: 'bg-blue-400' },
    { name: 'Tired', emoji: <FaRegMeh />, color: 'bg-purple-400' },
    { name: 'Anxious', emoji: <FaRegMeh />, color: 'bg-yellow-500' },
    { name: 'Stressed', emoji: <FaRegFrown />, color: 'bg-orange-500' },
    { name: 'Sad', emoji: <FaRegSadTear />, color: 'bg-red-400' },
    { name: 'Angry', emoji: <FaRegFrown />, color: 'bg-red-600' },
  ];
  
  const renderLogMoodForm = () => (
    <form onSubmit={handleSubmit}>
      {/* Mood Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">How are you feeling?</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {moods_list.map(mood => (
            <button
              key={mood.name}
              type="button"
              className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
                newMood.mood === mood.name 
                  ? `${mood.color} text-white shadow-lg scale-105` 
                  : 'bg-white dark:bg-neutral-800 hover:shadow-md'
              }`}
              onClick={() => setNewMood(prev => ({ ...prev, mood: mood.name }))}
            >
              <div className="text-3xl mb-2">{mood.emoji}</div>
              <span className="font-medium">{mood.name}</span>
            </button>
          ))}
        </div>
        {error && <p className="text-error text-sm mt-2">{error}</p>}
      </div>
      
      {/* Intensity Slider */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Intensity (1-10)</h3>
        <div className="flex items-center">
          <span className="text-sm mr-4">Mild</span>
          <div className="flex-1 flex items-center justify-between">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <button
                key={num}
                type="button"
                className={`w-8 h-8 rounded-full flex items-center justify-center font-medium transition-colors ${
                  newMood.intensity === num 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                }`}
                onClick={() => handleIntensityChange(num)}
              >
                {num}
              </button>
            ))}
          </div>
          <span className="text-sm ml-4">Strong</span>
        </div>
      </div>
      
      {/* Date Picker */}
      <div className="mb-6">
        <Input
          label="Date & Time"
          id="date"
          type="datetime-local"
          name="date"
          value={newMood.date}
          onChange={handleInputChange}
          icon={<FaCalendarAlt />}
        />
      </div>
      
      {/* Contributing Factors */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Contributing Factors (optional)</h3>
        <div className="flex items-center mb-3">
          <Input
            id="factor"
            placeholder="E.g., work, exercise, sleep"
            value={factorInput}
            onChange={(e) => setFactorInput(e.target.value)}
            className="mb-0 mr-2"
          />
          <Button 
            type="button" 
            onClick={handleAddFactor} 
            variant="primary" 
            icon={<FaPlus />}
            disabled={!factorInput.trim()}
          >
            Add
          </Button>
        </div>
        
        {/* Factors tags */}
        {newMood.factors.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {newMood.factors.map(factor => (
              <Badge 
                key={factor} 
                variant="neutral" 
                rounded 
                className="px-3 py-1"
                dismissible
                onDismiss={() => handleRemoveFactor(factor)}
              >
                {factor}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      {/* Notes */}
      <div className="mb-6">
        <label htmlFor="notes" className="block mb-2 text-sm font-medium text-neutral-900 dark:text-white">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows="4"
          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
          value={newMood.notes}
          onChange={handleInputChange}
          placeholder="Add any additional thoughts about how you're feeling..."
        ></textarea>
      </div>
      
      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          icon={<FaSave />}
        >
          Save Mood
        </Button>
      </div>
    </form>
  );
  
  const renderMoodHistory = () => (
    <div>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Your Mood History</h3>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : moods.length > 0 ? (
        <div className="space-y-4">
          {moods.map(entry => (
            <div 
              key={entry._id} 
              className="bg-white dark:bg-neutral-800 rounded-xl shadow-md p-4 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <div className="mr-3">
                    {getMoodEmoji(entry.mood)}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-semibold text-neutral-900 dark:text-white text-lg">{entry.mood}</h4>
                      <Badge className="ml-2" variant={getMoodVariant(entry.mood)} size="sm" rounded>
                        {entry.intensity}/10
                      </Badge>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {formatDate(entry.date)}
                    </p>
                  </div>
                </div>
              </div>
              
              {entry.factors && entry.factors.length > 0 && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-2">
                    {entry.factors.map(factor => (
                      <Badge key={factor} variant="neutral" size="sm" rounded>
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {entry.notes && (
                <p className="mt-3 text-neutral-600 dark:text-neutral-300 text-sm">
                  {entry.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-neutral-500 dark:text-neutral-400">
            No mood entries yet. Start tracking your moods!
          </p>
        </div>
      )}
    </div>
  );
  
  const renderMoodStats = () => (
    <div>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Your Mood Statistics</h3>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : stats ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-md">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Entries</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.totalEntries || 0}</p>
            </div>
            
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-md">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Avg. Intensity</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.averageIntensity || 0}/10</p>
            </div>
            
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-md">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Most Frequent</p>
              <div className="flex items-center">
                {getMoodEmoji(stats.mostFrequentMood)}
                <span className="ml-2 text-lg font-semibold text-neutral-900 dark:text-white">
                  {stats.mostFrequentMood || 'N/A'}
                </span>
              </div>
            </div>
            
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-md">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Mood Trend</p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-white capitalize">
                {stats.moodTrend || 'Stable'}
              </p>
            </div>
          </div>
          
          {/* Mood Distribution */}
          {stats.moodCounts && Object.keys(stats.moodCounts).length > 0 && (
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-md">
              <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">Mood Distribution</h4>
              <div className="space-y-3">
                {Object.entries(stats.moodCounts)
                  .sort((a, b) => b[1] - a[1]) // Sort by count descending
                  .map(([mood, count]) => (
                    <div key={mood} className="flex items-center">
                      <span className="w-24 text-sm text-neutral-700 dark:text-neutral-300">{mood}</span>
                      <div className="flex-1 mx-3">
                        <div 
                          className={`h-5 rounded-full ${getMoodColor(mood)}`} 
                          style={{ 
                            width: `${Math.max((count / stats.totalEntries) * 100, 5)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">{count}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
          
          {/* Add more statistics visualizations as needed */}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-neutral-500 dark:text-neutral-400">
            No statistics available yet. Start tracking your moods!
          </p>
        </div>
      )}
    </div>
  );
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Mood Tracker</h1>
        <div className="inline-flex rounded-lg shadow-sm">
          <button
            type="button"
            className={`px-4 py-2.5 text-sm font-medium rounded-l-lg ${
              view === 'log'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700'
            }`}
            onClick={() => setView('log')}
          >
            Log Mood
          </button>
          <button
            type="button"
            className={`px-4 py-2.5 text-sm font-medium ${
              view === 'history'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700'
            }`}
            onClick={() => setView('history')}
          >
            History
          </button>
          <button
            type="button"
            className={`px-4 py-2.5 text-sm font-medium rounded-r-lg ${
              view === 'stats'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700'
            }`}
            onClick={() => setView('stats')}
          >
            Stats
          </button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          {view === 'log' && renderLogMoodForm()}
          {view === 'history' && renderMoodHistory()}
          {view === 'stats' && renderMoodStats()}
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions
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

const getMoodColor = (mood) => {
  switch(mood?.toLowerCase()) {
    case 'happy':
    case 'excited':
    case 'content':
    case 'grateful':
    case 'energetic':
      return 'bg-green-500';
    case 'sad':
    case 'anxious':
    case 'frustrated':
    case 'stressed':
    case 'overwhelmed':
      return 'bg-red-500';
    case 'calm':
    case 'hopeful':
      return 'bg-blue-500';
    case 'bored':
    case 'tired':
    case 'confused':
      return 'bg-yellow-500';
    default:
      return 'bg-neutral-500';
  }
};

export default MoodTracker; 