import React, { useState, useEffect } from 'react';
import apiConfig from '../config/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

// Interface matching your API response
interface BlogPost {
  id: number;
  title: string;
  content: string;
  published: boolean;
  authorId: number;
  cover_image: string | null;
  category_id: number;
  tag_id: number;
  createdAt: string;
  updatedAt: string;
  slug: string;
  author: {
    id: number;
    fullname: string;
    email: string;
    role: string;
    profile_image: string;
    createdAt: string;
    updatedAt: string;
  };
  category: {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  tags: {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  comments: any[];
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalBlogs: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

interface BlogApiResponse {
  message: string;
  data: BlogPost[];
  pagination: PaginationInfo;
}

// Function to strip HTML tags from content
const stripHtmlTags = (html: string): string => {
  if (typeof window !== 'undefined') {
    // Browser environment
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  } else {
    // Node.js environment (for SSR)
    return html.replace(/<[^>]*>/g, '');
  }
};

// Function to truncate text to a certain length
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

const BlogCard: React.FC<{post: BlogPost}> = ({post}) => {
  // Clean the content by removing HTML tags
  const cleanContent = stripHtmlTags(post.content);
  // Truncate the content to 120 characters
  const truncatedContent = truncateText(cleanContent, 120);
  
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl h-full flex flex-col">
      <img 
        src={post.cover_image || "https://via.placeholder.com/500x300/4b0082/ffffff?text=No+Image"} 
        alt={post.title} 
        className="w-full h-56 object-cover"
        onError={(e) => {
          e.currentTarget.src = "https://via.placeholder.com/500x300/4b0082/ffffff?text=No+Image";
        }}
      />
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex gap-2 mb-3 flex-wrap">
          <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1.5 rounded-full">
            {post.category.name}
          </span>
          <span className="bg-pink-100 text-pink-800 text-xs px-3 py-1.5 rounded-full">
            {post.tags.name}
          </span>
        </div>
        <h4 className="text-2xl font-bold text-[#4b0082] mb-3 line-clamp-2">
          {post.title}
        </h4>
        <p className="text-gray-600 mb-5 text-base line-clamp-3 flex-grow">
          {truncatedContent}
        </p>
        <div className="flex justify-between items-center mt-auto">
          <span className="text-sm text-gray-500">
            {/* {new Date(post.createdAt).toLocaleDateString()} •*/} By {post.author.fullname} 
          </span>
          <Link 
            to={`/blog?slug=${post.slug}`} 
            className="font-semibold text-[#880088] hover:text-[#4b0082] inline-flex items-center gap-2 group text-base"
          >
            Read Story <span className="transition-transform group-hover:translate-x-1 text-lg">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const postsPerPage = 12;

  // Fetch blog posts from backend API
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.MISC.ALL_BLOG}?page=${currentPage}&limit=${postsPerPage}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: BlogApiResponse = await response.json();
        setPosts(data.data || []);
        setPagination(data.pagination);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBlogPosts();
  }, [currentPage]);

  // Change page
  const paginate = (pageNumber: number) => {
    if (pagination) {
      if (pageNumber >= 1 && pageNumber <= pagination.totalPages) {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };
  
  // Generate page numbers for pagination
  const pageNumbers = [];
  if (pagination) {
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust if we're at the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
  }

  return (
    <div className="bg-gray-50">
        <Header variant="dark" />
        <main>
                <section className="relative h-[70vh] overflow-hidden">
                    <div className="absolute inset-0 bg-black">
                        <video autoPlay muted loop className="w-full h-full object-cover opacity-50">
                            <source src="https://res.cloudinary.com/dnuyqw6o1/video/upload/v1754817618/LEGASI_HERO_CON_zrsajm.mp4" type="video/mp4" />
                        </video>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    <div className="relative h-full flex items-end pb-20 text-white">
                        <div className="container mx-auto px-5">
                            <h1 className="font-playfair text-4xl md:text-6xl font-bold max-w-4xl leading-tight">Women Leading Peace Dialogues</h1>
                            <p className="text-xl mt-4 max-w-2xl">How LEGASI's Women Peace Councils are transforming conflict resolution in Northern Nigeria</p>
                        </div>
                    </div>
                </section>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center text-[#4b0082] mb-6">Our Blog</h1>
          <p className="text-center text-gray-600 mb-12 text-lg">
            {pagination ? `Showing ${posts.length} of ${pagination.totalBlogs} articles` : 'Loading articles...'}
          </p>
            
          {/* Loading state */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#4b0082]"></div>
              <span className="ml-4 text-[#4b0082] text-lg">Loading posts...</span>
            </div>
          )}
            
          {/* Error state */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 text-center">
              {error}
              <button 
                onClick={() => setCurrentPage(1)} 
                className="ml-4 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
              >
                Try Again
              </button>
            </div>
          )}
            
          {/* Blog posts grid */}
          {!isLoading && !error && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-10">
                    <p className="text-gray-600 text-lg">No blog posts available.</p>
                  </div>
                )}
              </div>
                
              {/* Pagination controls - only show if we have multiple pages */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <nav className="flex items-center gap-2">
                    <button 
                      onClick={() => paginate(currentPage - 1)} 
                      disabled={!pagination.hasPrev}
                      className="px-4 py-2 rounded-md bg-white text-[#4b0082] border border-[#4b0082] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4b0082] hover:text-white transition-colors text-lg"
                    >
                      Previous
                    </button>
                      
                    {/* Show first page if not in visible range */}
                    {pageNumbers[0] > 1 && (
                      <>
                        <button
                          onClick={() => paginate(1)}
                          className="w-12 h-12 rounded-full flex items-center justify-center bg-white text-[#4b0082] border border-[#4b0082] hover:bg-[#4b0082] hover:text-white transition-colors text-lg"
                        >
                          1
                        </button>
                        {pageNumbers[0] > 2 && <span className="px-2 text-gray-500 text-lg">...</span>}
                      </>
                    )}
                      
                    {pageNumbers.map(number => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          currentPage === number 
                          ? 'bg-[#4b0082] text-white' 
                          : 'bg-white text-[#4b0082] border border-[#4b0082] hover:bg-[#4b0082] hover:text-white'
                        } transition-colors text-lg`}
                      >
                        {number}
                      </button>
                    ))}
                      
                    {/* Show last page if not in visible range */}
                    {pageNumbers[pageNumbers.length - 1] < pagination.totalPages && (
                      <>
                        {pageNumbers[pageNumbers.length - 1] < pagination.totalPages - 1 && <span className="px-2 text-gray-500 text-lg">...</span>}
                        <button
                          onClick={() => paginate(pagination.totalPages)}
                          className="w-12 h-12 rounded-full flex items-center justify-center bg-white text-[#4b0082] border border-[#4b0082] hover:bg-[#4b0082] hover:text-white transition-colors text-lg"
                        >
                          {pagination.totalPages}
                        </button>
                      </>
                    )}
                      
                    <button 
                      onClick={() => paginate(currentPage + 1)} 
                      disabled={!pagination.hasNext}
                      className="px-4 py-2 rounded-md bg-white text-[#4b0082] border border-[#4b0082] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4b0082] hover:text-white transition-colors text-lg"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer/>
    </div>
  );
};

export default BlogPage;