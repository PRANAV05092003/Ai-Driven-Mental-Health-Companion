import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import apiService from '../services/apiService';
import {
  FaSearch,
  FaBook,
  FaHeadphones,
  FaRunning,
  FaMicrophone,
  FaPhone,
  FaHeart,
  FaExternalLinkAlt,
  FaFilter,
  FaTimes
} from 'react-icons/fa';

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [resources, setResources] = useState([]);
  const [crisisResources, setCrisisResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResources();
    fetchCrisisResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await apiService.getResources();
      setResources(response.data.resources || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Failed to load resources. Please try again later.');
      setLoading(false);
    }
  };

  const fetchCrisisResources = async () => {
    try {
      const response = await apiService.getCrisisResources();
      setCrisisResources(response.data.resources || []);
    } catch (err) {
      console.error('Error fetching crisis resources:', err);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
  };

  const clearSearchAndFilters = () => {
    setSearchTerm('');
    setActiveCategory('all');
  };

  // Filter resources based on search term and active category
  const filteredResources = resources.filter(resource => {
    const matchesSearch = searchTerm === '' || 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || resource.type === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Resources', icon: <FaHeart /> },
    { id: 'article', name: 'Articles', icon: <FaBook /> },
    { id: 'meditation', name: 'Meditation', icon: <FaHeadphones /> },
    { id: 'exercise', name: 'Exercises', icon: <FaRunning /> },
    { id: 'podcast', name: 'Podcasts', icon: <FaMicrophone /> }
  ];

  // Get the icon for a resource type
  const getResourceIcon = (type) => {
    const category = categories.find(cat => cat.id === type);
    return category ? category.icon : <FaHeart />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
          Mental Health Resources
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
          Discover helpful articles, exercises, meditations, and more to support your mental well-being journey.
        </p>
      </div>

      {/* Crisis Support Section - Always Visible */}
      <div className="mb-10">
        <Card variant="accent">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center">
              <FaPhone className="mr-2 text-accent-600 dark:text-accent-400" />
              Crisis Support
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 mb-6">
              If you're experiencing a mental health crisis or need immediate support, these resources are available 24/7:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {crisisResources.length > 0 ? (
                crisisResources.map(resource => (
                  <a
                    key={resource._id}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-all flex"
                  >
                    <div className="w-12 h-12 rounded-full bg-accent-100 dark:bg-accent-900 flex items-center justify-center mr-4 flex-shrink-0">
                      <FaPhone className="text-accent-600 dark:text-accent-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">{resource.title}</h3>
                      {resource.phoneNumber && (
                        <p className="text-accent-600 dark:text-accent-400 font-medium">{resource.phoneNumber}</p>
                      )}
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">{resource.description}</p>
                    </div>
                  </a>
                ))
              ) : (
                <div className="col-span-3 text-center py-6">
                  <p className="text-neutral-500 dark:text-neutral-400">Crisis resources loading...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <Input
                  id="search"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  icon={<FaSearch />}
                  className="mb-0"
                />
              </div>
              
              {(searchTerm || activeCategory !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<FaTimes />}
                  onClick={clearSearchAndFilters}
                  className="md:self-end"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "primary" : "outline"}
                  size="sm"
                  icon={category.icon}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resources Grid */}
      <div className="mb-10">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <h2 className="text-2xl font-semibold text-error mb-4">Oops! Something went wrong</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">{error}</p>
            <Button onClick={() => fetchResources()}>Try Again</Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center">
                <FaFilter className="mr-2 text-primary-600 dark:text-primary-400" />
                {activeCategory === 'all' ? 'All Resources' : `${categories.find(cat => cat.id === activeCategory)?.name}`}
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400">
                {filteredResources.length} {filteredResources.length === 1 ? 'result' : 'results'}
              </p>
            </div>

            {filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map(resource => (
                  <a
                    key={resource._id}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <CardContent className="p-6">
                        <div className="flex items-start mb-4">
                          <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mr-4 flex-shrink-0">
                            {getResourceIcon(resource.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-neutral-900 dark:text-white text-lg mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {resource.title}
                            </h3>
                            <Badge size="sm" variant="neutral">
                              {resource.type}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                          {resource.description}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-neutral-200 dark:border-neutral-700">
                          <div className="flex flex-wrap gap-2">
                            {resource.tags && resource.tags.map(tag => (
                              <Badge key={tag} size="sm" variant="outline" rounded>
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <FaExternalLinkAlt className="text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                  No resources found
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <Button onClick={clearSearchAndFilters}>Clear Filters</Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Featured Resources */}
      {!loading && !error && filteredResources.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center">
            <FaHeart className="mr-2 text-primary-600 dark:text-primary-400" />
            Featured Resources
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resources
              .filter(resource => resource.featured)
              .slice(0, 3)
              .map(resource => (
                <a
                  key={resource._id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <Card variant="primary" className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-start mb-4">
                        <div className="w-12 h-12 rounded-full bg-white dark:bg-primary-800 flex items-center justify-center mr-4 flex-shrink-0">
                          {getResourceIcon(resource.type)}
                        </div>
                        <div>
                          <Badge variant="accent" className="mb-2" rounded>Featured</Badge>
                          <h3 className="font-semibold text-neutral-900 dark:text-white text-lg group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                            {resource.title}
                          </h3>
                        </div>
                      </div>
                      
                      <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                        {resource.description}
                      </p>
                      
                      <Button 
                        className="w-full mt-2" 
                        variant="secondary"
                        size="sm"
                        icon={<FaExternalLinkAlt />}
                        iconPosition="right"
                      >
                        View Resource
                      </Button>
                    </CardContent>
                  </Card>
                </a>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources; 