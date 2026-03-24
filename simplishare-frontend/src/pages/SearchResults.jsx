// Search Results Page
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchAPI } from '../services/api';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import { Search, Image as ImageIcon } from 'lucide-react';
import './SearchResults.css';

function SearchResults() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (query.trim()) {
            doSearch(query);
        }
    }, [query]);

    const doSearch = async (q) => {
        try {
            setLoading(true);
            setError('');
            const res = await searchAPI.searchByText(q);
            setResults(res.data || []);
        } catch (err) {
            console.error('Search error:', err);
            setError('Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="search-results-layout">
            <Navbar />
            <div className="search-results-container">
                <div className="search-results-header">
                    <Search size={24} />
                    <h1>
                        {query ? `Results for "${query}"` : 'Search Results'}
                    </h1>
                </div>

                {loading && (
                    <div className="search-results-loading">
                        <div className="spinner"></div>
                        <p>Searching...</p>
                    </div>
                )}

                {error && (
                    <div className="search-results-error">
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && results.length === 0 && query && (
                    <div className="search-results-empty">
                        <Search size={48} />
                        <h3>No results found</h3>
                        <p>Try different keywords</p>
                    </div>
                )}

                {!loading && results.length > 0 && (
                    <>
                        <p className="search-results-count">
                            {results.length} post{results.length !== 1 ? 's' : ''} found
                        </p>
                        <div className="search-results-feed">
                            {results.map(post => (
                                <PostCard key={post.id} post={post} onUpdate={() => doSearch(query)} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default SearchResults;