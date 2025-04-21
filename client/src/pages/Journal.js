import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { BsPencilSquare, BsTrash, BsSearch, BsPlusCircle, BsCalendarDate, BsChevronLeft, BsChevronRight } from 'react-icons/bs';

const Journal = () => {
  const { currentUser } = useContext(AuthContext);
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentEntry, setCurrentEntry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  // New entry form state
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().slice(0, 16),
    mood: 'Neutral',
    tags: []
  });

  // Load entries when component mounts
  useEffect(() => {
    fetchEntries();
    fetchStats();
  }, [currentUser]);

  // Fetch entries from API
  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/journals');

      if (response.data.success) {
        // Sort entries by date (newest first)
        const sortedEntries = response.data.entries.sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });
        setEntries(sortedEntries);
      } else {
        setError('Failed to load journal entries');
      }
    } catch (err) {
      setError('Error loading journal entries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch journal stats
  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/journals/stats');

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Error loading journal stats:', err);
    }
  };

  // Handle creating a new entry
  const handleCreateEntry = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/journals', newEntry);

      if (response.data.success) {
        setNewEntry({
          title: '',
          content: '',
          date: new Date().toISOString().slice(0, 16),
          mood: 'Neutral',
          tags: []
        });
        fetchEntries();
        fetchStats();
        setIsEditing(false);
      } else {
        setError('Failed to create entry');
      }
    } catch (err) {
      setError('Error creating entry');
      console.error(err);
    }
  };

  // Handle updating an entry
  const handleUpdateEntry = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/api/journals/${currentEntry._id}`, currentEntry);

      if (response.data.success) {
        setIsEditing(false);
        fetchEntries();
        fetchStats();
      } else {
        setError('Failed to update entry');
      }
    } catch (err) {
      setError('Error updating entry');
      console.error(err);
    }
  };

  // Handle deleting an entry
  const handleDeleteEntry = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const response = await axios.delete(`/api/journals/${entryId}`);

        if (response.data.success) {
          fetchEntries();
          fetchStats();
          if (currentEntry && currentEntry._id === entryId) {
            setCurrentEntry(null);
          }
        } else {
          setError('Failed to delete entry');
        }
      } catch (err) {
        setError('Error deleting entry');
        console.error(err);
      }
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchEntries();
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`/api/journals?search=${searchTerm}`);

      if (response.data.success) {
        setEntries(response.data.entries);
      } else {
        setError('Search failed');
      }
    } catch (err) {
      setError('Error searching entries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter entries based on search term (client-side filtering for immediate feedback)
  const filteredEntries = searchTerm.trim() === '' ? entries : entries.filter(entry => 
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle mood selection
  const handleMoodChange = (mood) => {
    if (currentEntry) {
      setCurrentEntry({...currentEntry, mood});
    } else {
      setNewEntry({...newEntry, mood});
    }
  };

  // Mood options
  const moodOptions = [
    'Happy', 'Sad', 'Angry', 'Anxious', 'Calm', 'Energetic', 'Tired', 
    'Stressed', 'Excited', 'Content', 'Bored', 'Hopeful', 'Overwhelmed', 
    'Grateful', 'Frustrated', 'Confused', 'Neutral'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-800 dark:text-indigo-300 mb-8">Journal</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Entry List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:h-[calc(100vh-12rem)] flex flex-col">
            <div className="flex items-center mb-4">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search entries..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <BsSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
              <button 
                onClick={() => {
                  setCurrentEntry(null);
                  setIsEditing(true);
                }}
                className="ml-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
              >
                <BsPlusCircle className="mr-1" /> New
              </button>
            </div>

            <div className="flex justify-between mb-4">
              <button 
                className={`py-1 px-3 rounded-lg ${!showStats ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                onClick={() => setShowStats(false)}
              >
                Entries
              </button>
              <button 
                className={`py-1 px-3 rounded-lg ${showStats ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                onClick={() => setShowStats(true)}
              >
                Stats
              </button>
            </div>

            {!showStats ? (
              <div className="overflow-y-auto flex-grow">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredEntries.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">No journal entries found</p>
                    ) : (
                      filteredEntries.map(entry => (
                        <div 
                          key={entry._id}
                          className={`p-3 rounded-lg cursor-pointer hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors ${currentEntry && currentEntry._id === entry._id ? 'bg-indigo-100 dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-800'}`}
                          onClick={() => {
                            setCurrentEntry(entry);
                            setIsEditing(false);
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-indigo-900 dark:text-indigo-300 truncate">{entry.title}</h3>
                            <div className="flex space-x-1">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentEntry(entry);
                                  setIsEditing(true);
                                }}
                                className="text-gray-600 dark:text-gray-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                              >
                                <BsPencilSquare />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteEntry(entry._id);
                                }}
                                className="text-gray-600 dark:text-gray-400 hover:text-red-600"
                              >
                                <BsTrash />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{entry.content.substring(0, 60)}...</p>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center">
                              <BsCalendarDate className="mr-1" /> {formatDate(entry.date)}
                            </p>
                            {entry.mood && (
                              <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 rounded-full">
                                {entry.mood}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-y-auto flex-grow">
                {stats ? (
                  <div className="space-y-6 p-2">
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4">
                      <h3 className="font-medium text-indigo-800 dark:text-indigo-300 mb-2">Journal Summary</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                          <p className="text-gray-500 dark:text-gray-400 text-sm">Total Entries</p>
                          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.totalEntries}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                          <p className="text-gray-500 dark:text-gray-400 text-sm">Avg. Length</p>
                          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.averageLength} words</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4">
                      <h3 className="font-medium text-indigo-800 dark:text-indigo-300 mb-2">Most Frequent Mood</h3>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                        <p className="text-xl font-medium text-center text-indigo-700 dark:text-indigo-400">
                          {stats.mostFrequentMood || "No data"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4">
                      <h3 className="font-medium text-indigo-800 dark:text-indigo-300 mb-2">Monthly Activity</h3>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                        {stats.monthlyActivity && Object.keys(stats.monthlyActivity).length > 0 ? (
                          <div className="space-y-2">
                            {Object.entries(stats.monthlyActivity).map(([month, count]) => (
                              <div key={month} className="flex items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400 w-24">{month}</span>
                                <div className="flex-grow h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                  <div 
                                    className="h-2 bg-indigo-600 dark:bg-indigo-500 rounded-full" 
                                    style={{ width: `${Math.min(100, (count / stats.totalEntries) * 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">{count}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-gray-500 dark:text-gray-400">No data available</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4">
                      <h3 className="font-medium text-indigo-800 dark:text-indigo-300 mb-2">Common Words</h3>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                        {stats.wordFrequency && Object.keys(stats.wordFrequency).length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(stats.wordFrequency)
                              .sort((a, b) => b[1] - a[1])
                              .slice(0, 10)
                              .map(([word, count]) => (
                                <span 
                                  key={word} 
                                  className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 rounded-full text-sm"
                                >
                                  {word} ({count})
                                </span>
                              ))
                            }
                          </div>
                        ) : (
                          <p className="text-center text-gray-500 dark:text-gray-400">No data available</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Entry View/Edit */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 md:col-span-2 md:h-[calc(100vh-12rem)] flex flex-col">
            {isEditing ? (
              <form onSubmit={currentEntry ? handleUpdateEntry : handleCreateEntry} className="h-full flex flex-col">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Entry Title"
                    className="w-full p-2 text-xl font-medium border-b-2 border-indigo-200 focus:border-indigo-600 focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    value={currentEntry ? currentEntry.title : newEntry.title}
                    onChange={(e) => currentEntry 
                      ? setCurrentEntry({...currentEntry, title: e.target.value}) 
                      : setNewEntry({...newEntry, title: e.target.value})
                    }
                    required
                  />
                </div>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <div className="flex-grow md:flex-grow-0 md:w-48">
                    <input
                      type="datetime-local"
                      className="w-full p-2 text-sm text-gray-600 dark:text-gray-300 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:border-gray-600"
                      value={(currentEntry ? new Date(currentEntry.date).toISOString() : newEntry.date).slice(0, 16)}
                      onChange={(e) => currentEntry 
                        ? setCurrentEntry({...currentEntry, date: e.target.value}) 
                        : setNewEntry({...newEntry, date: e.target.value})
                      }
                      required
                    />
                  </div>
                  <div className="w-full md:w-auto flex-grow">
                    <select
                      className="w-full p-2 text-sm text-gray-600 dark:text-gray-300 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:border-gray-600"
                      value={currentEntry ? currentEntry.mood : newEntry.mood}
                      onChange={(e) => handleMoodChange(e.target.value)}
                    >
                      <option value="" disabled>Select Mood</option>
                      {moodOptions.map(mood => (
                        <option key={mood} value={mood}>{mood}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex-grow mb-4">
                  <textarea
                    placeholder="Write your thoughts here..."
                    className="w-full h-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={currentEntry ? currentEntry.content : newEntry.content}
                    onChange={(e) => currentEntry 
                      ? setCurrentEntry({...currentEntry, content: e.target.value}) 
                      : setNewEntry({...newEntry, content: e.target.value})
                    }
                    required
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      if (!currentEntry) {
                        setNewEntry({
                          title: '',
                          content: '',
                          date: new Date().toISOString().slice(0, 16),
                          mood: 'Neutral',
                          tags: []
                        });
                      }
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {currentEntry ? 'Update Entry' : 'Save Entry'}
                  </button>
                </div>
              </form>
            ) : currentEntry ? (
              <div className="h-full flex flex-col">
                <div className="mb-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-300">{currentEntry.title}</h2>
                    {currentEntry.mood && (
                      <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 rounded-full">
                        {currentEntry.mood}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatDate(currentEntry.date)}</p>
                </div>
                <div className="flex-grow overflow-y-auto">
                  <p className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed">
                    {currentEntry.content}
                  </p>
                </div>
                <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <BsPencilSquare className="mr-2" /> Edit Entry
                  </button>
                  <button
                    onClick={() => handleDeleteEntry(currentEntry._id)}
                    className="flex items-center px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <BsTrash className="mr-2" /> Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="text-center max-w-md">
                  <h2 className="text-xl font-semibold text-indigo-800 dark:text-indigo-300 mb-2">Your Journal</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start journaling today to track your thoughts and feelings. Regular journaling can help improve your mental wellbeing.
                  </p>
                  <button
                    onClick={() => {
                      setCurrentEntry(null);
                      setIsEditing(true);
                    }}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center mx-auto"
                  >
                    <BsPlusCircle className="mr-2" /> Create Your First Entry
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journal; 