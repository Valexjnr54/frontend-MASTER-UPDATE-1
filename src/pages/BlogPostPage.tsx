import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import apiConfig from '../config/api';

const RelatedStoryCard: React.FC<{img: string, title: string, desc: string, link: string}> = ({img, title, desc, link}) => (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
        <img src={img} alt={title} className="w-full h-48 object-cover"/>
        <div className="p-5">
            <h4 className="text-xl font-bold text-[#4b0082] mb-2">{title}</h4>
            <p className="text-gray-600 mb-4 text-sm line-clamp-3">{desc}</p>
            <Link to={link} className="font-semibold text-[#880088] hover:text-[#4b0082] inline-flex items-center gap-2 group">
                Read Story <i className="fas fa-arrow-right transition-transform group-hover:translate-x-1"></i>
            </Link>
        </div>
    </div>
);

interface BlogPost {
    id: number;
    title: string;
    content: string;
    published: boolean;
    author: {
        id: number;
        name: string;
        fullname: string;
    };
    cover_image: string | null;
    category: {
        id: number;
        name: string;
    };
    tags: {
        id: number;
        name: string;
    };
    comments: any[];
    createdAt: string;
    updatedAt: string;
    slug: string;
}

interface RelatedPost {
    id: number;
    title: string;
    excerpt: string;
    cover_image: string | null;
    slug: string;
}

interface ApiResponse {
    message: string;
    data: BlogPost;
}

interface RelatedPostsResponse {
    message: string;
    data: RelatedPost[];
}

interface CommentFormData {
    author: string;
    email: string;
    content: string;
}

const BlogPostPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
    const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [commentForm, setCommentForm] = useState<CommentFormData>({
        author: '',
        email: '',
        content: ''
    });
    const [submittingComment, setSubmittingComment] = useState(false);
    const [commentError, setCommentError] = useState<string | null>(null);
    const [commentSuccess, setCommentSuccess] = useState(false);

    // Function to extract slug from query parameters
    const getSlugFromQuery = () => {
        const searchParams = new URLSearchParams(location.search);
        return searchParams.get('slug');
    };

    useEffect(() => {
        const fetchBlogPost = async () => {
            const slug = getSlugFromQuery();
            
            if (!slug) {
                setError('No slug provided in URL');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                // Construct the API URL with cache-busting parameter
                const timestamp = new Date().getTime();
                const apiUrl = `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.MISC.SINGLE_BLOG}?slug=${slug}&t=${timestamp}`;
                console.log('Fetching from:', apiUrl);
                
                // Add cache-control headers to prevent caching
                const response = await fetch(apiUrl, {
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                    }
                });
                
                console.log('Response status:', response.status);
                
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Blog post not found');
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const responseData: ApiResponse = await response.json();
                console.log('API Response:', responseData);
                
                // Check if data exists in the response
                if (!responseData.data) {
                    throw new Error('Invalid API response format: missing data property');
                }
                
                // Extract the blog post data from the nested 'data' property
                const blogData = responseData.data;
                
                // Check if blog data is valid
                if (!blogData || typeof blogData !== 'object') {
                    throw new Error('Invalid blog data received from API');
                }
                
                if (!blogData.published) {
                    throw new Error('This blog post is not published yet');
                }
                
                setBlogPost(blogData);
                
                // Fetch related posts after successfully loading the blog post
                await fetchRelatedPosts(blogData.id, blogData.category.id);
            } catch (err) {
                console.error('Error fetching blog post:', err);
                setError(err.message || 'Failed to fetch blog post');
            } finally {
                setLoading(false);
            }
        };

        const fetchRelatedPosts = async (postId: number, categoryId: number) => {
            try {
                const timestamp = new Date().getTime();
                const apiUrl = `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.MISC.RELATED_POSTS}?postId=${postId}&categoryId=${categoryId}&limit=4&t=${timestamp}`;
                
                const response = await fetch(apiUrl, {
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                    }
                });
                
                if (!response.ok) {
                    console.error('Failed to fetch related posts');
                    return;
                }
                
                const responseData: RelatedPostsResponse = await response.json();
                
                if (responseData.data && Array.isArray(responseData.data)) {
                    setRelatedPosts(responseData.data);
                }
            } catch (err) {
                console.error('Error fetching related posts:', err);
            }
        };

        fetchBlogPost();
    }, [location.search]);

    const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCommentForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!blogPost) return;
        
        setSubmittingComment(true);
        setCommentError(null);
        
        try {
            const response = await fetch(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.MISC.ADD_COMMENT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...commentForm,
                    blog_id: blogPost.id
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to submit comment');
            }
            
            // Reset form
            setCommentForm({
                author: '',
                email: '',
                content: ''
            });
            
            setCommentSuccess(true);
            
            // Refresh the blog post to show the new comment (after approval)
            // In a real app, you might want to handle this differently
            setTimeout(() => {
                setCommentSuccess(false);
            }, 3000);
            
        } catch (err) {
            setCommentError(err.message || 'Error submitting comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <Header variant="dark" />
                <div className="container mx-auto px-5 py-20 text-center">
                    <div className="animate-pulse">
                        <div className="h-12 bg-gray-300 rounded w-3/4 mx-auto mb-4"></div>
                        <div className="h-6 bg-gray-300 rounded w-1/2 mx-auto"></div>
                    </div>
                    
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !blogPost) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <Header variant="dark" />
                <div className="container mx-auto px-5 py-20 text-center">
                    <h1 className="text-3xl font-bold text-[#4b0082] mb-4">Error Loading Post</h1>
                    <p className="text-gray-600 mb-8">{error || 'Blog post not found'}</p>
                    
                    <button 
                        onClick={() => navigate(-1)} 
                        className="mt-8 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors mr-4"
                    >
                        Go Back
                    </button>
                    <Link to="/" className="mt-8 bg-[#880088] text-white px-6 py-3 rounded-lg hover:bg-[#4b0082] transition-colors">
                        Return to Home
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    // Check if blogPost has all required properties
    if (!blogPost.title || !blogPost.content || !blogPost.author || !blogPost.category || !blogPost.tags) {
        console.log('Blog data missing required properties:', blogPost);
        return (
            <div className="bg-gray-50 min-h-screen">
                <Header variant="dark" />
                <div className="container mx-auto px-5 py-20 text-center">
                    <h1 className="text-3xl font-bold text-[#4b0082] mb-4">Invalid Blog Data</h1>
                    <p className="text-gray-600 mb-8">The blog post data is incomplete or malformed.</p>
                    <div className="mt-8 p-4 bg-yellow-100 rounded-lg text-left">
                        <h3 className="text-lg font-semibold text-yellow-800">Debug Info</h3>
                        <p className="text-yellow-600">Missing required properties in blog data</p>
                        <pre className="text-xs mt-2 overflow-auto">
                            {JSON.stringify(blogPost, null, 2)}
                        </pre>
                    </div>
                    <button 
                        onClick={() => navigate(-1)} 
                        className="mt-8 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors mr-4"
                    >
                        Go Back
                    </button>
                    <Link to="/" className="mt-8 bg-[#880088] text-white px-6 py-3 rounded-lg hover:bg-[#4b0082] transition-colors">
                        Return to Home
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    // Filter only approved comments
    const approvedComments = blogPost.comments.filter(comment => comment.approved);

    return (
        <div className="bg-gray-50">
            <Header variant="dark" />
            <main>
                <section className="relative h-[70vh] overflow-hidden">
                    <div className="absolute inset-0 bg-black">
                        {blogPost.cover_image ? (
                            <img 
                                src={blogPost.cover_image} 
                                alt={blogPost.title}
                                className="w-full h-full object-cover opacity-50"
                                onError={(e) => {
                                    // Fallback if image fails to load
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-purple-900 to-indigo-800 opacity-70"></div>
                        )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    <div className="relative h-full flex items-end pb-20 text-white">
                        <div className="container mx-auto px-5">
                            <h1 className="font-playfair text-4xl md:text-6xl font-bold max-w-4xl leading-tight">{blogPost.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 mt-4">
                                <span className="px-3 py-1 bg-purple-900/70 rounded-full text-sm">
                                    {blogPost.category.name}
                                </span>
                                <span className="px-3 py-1 bg-purple-900/70 rounded-full text-sm">
                                    {blogPost.tags.name}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="container mx-auto px-5 py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <article className="lg:col-span-2">
                            <div className="flex flex-wrap items-center gap-6 mb-8 text-gray-500">
                                <span><i className="far fa-calendar-alt text-[#880088] mr-2"></i>
                                    {new Date(blogPost.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                                <span><i className="far fa-user text-[#880088] mr-2"></i>By {blogPost.author.fullname}</span>
                                <span><i className="far fa-comment text-[#880088] mr-2"></i>{approvedComments.length} comments</span>
                            </div>

                            <div 
                                className="prose max-w-none text-lg text-gray-800 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: blogPost.content }}
                            />
                            
                            {/* Comments Section */}
                            <div className="mt-12 pt-8 border-t border-gray-200">
                                <h3 className="text-2xl font-bold text-[#4b0082] mb-6">Comments ({approvedComments.length})</h3>
                                {approvedComments.length > 0 ? (
                                    <div className="space-y-6">
                                        {approvedComments.map((comment) => (
                                            <div key={comment.id} className="bg-gray-50 p-5 rounded-lg">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-purple-800 font-bold">
                                                        {comment.author ? comment.author.charAt(0) : 'U'}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold">{comment.author || 'Unknown User'}</h4>
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(comment.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-gray-700">{comment.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">No comments yet. Be the first to comment!</p>
                                )}
                                
                                {/* Comment Form */}
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <h4 className="text-xl font-bold text-[#4b0082] mb-4">Leave a Comment</h4>
                                    
                                    {commentSuccess && (
                                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                                            Your comment has been submitted and is awaiting approval.
                                        </div>
                                    )}
                                    
                                    {commentError && (
                                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                            {commentError}
                                        </div>
                                    )}
                                    
                                    <form onSubmit={handleCommentSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="author"
                                                    name="author"
                                                    value={commentForm.author}
                                                    onChange={handleCommentChange}
                                                    required
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#880088] focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Email *
                                                </label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={commentForm.email}
                                                    onChange={handleCommentChange}
                                                    required
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#880088] focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                                                Comment *
                                            </label>
                                            <textarea
                                                id="content"
                                                name="content"
                                                rows={4}
                                                value={commentForm.content}
                                                onChange={handleCommentChange}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#880088] focus:border-transparent"
                                            ></textarea>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={submittingComment}
                                            className="bg-[#880088] text-white px-6 py-3 rounded-md hover:bg-[#4b0082] transition-colors disabled:opacity-50"
                                        >
                                            {submittingComment ? 'Submitting...' : 'Post Comment'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </article>
                        
                        <aside>
                            <div className="sticky top-28 space-y-8">
                                <div className="bg-white p-6 rounded-xl shadow-lg">
                                    <h3 className="font-playfair text-2xl font-bold text-[#4b0082] mb-4 pb-2 border-b-2 border-[#e6e6fa]">About the Author</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-purple-200 flex items-center justify-center text-2xl text-purple-800 font-bold">
                                            {blogPost.author.fullname.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">{blogPost.author.fullname}</h4>
                                            <p className="text-gray-600 text-sm">Author at LEGASI</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="font-playfair text-3xl font-bold text-[#4b0082] mb-6 pb-3 border-b-2 border-[#e6e6fa]">More Stories</h3>
                                    <div className="space-y-8">
                                        {relatedPosts.length > 0 ? (
                                            relatedPosts.map((post) => (
                                                <RelatedStoryCard 
                                                    key={post.id}
                                                    img={post.cover_image || "https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812551/youth_handbook_cover_ukabrk.jpg"}
                                                    title={post.title}
                                                    desc={post.excerpt}
                                                    link={`/blog-post?slug=${post.slug}`}
                                                />
                                            ))
                                        ) : (
                                            // Fallback content if no related posts are available
                                            <>
                                                <RelatedStoryCard 
                                                    img="https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812551/youth_handbook_cover_ukabrk.jpg"
                                                    title="THE YOUNG HUMANITARIANS HANDBOOK"
                                                    desc="Empowering young people to organize and tackle the many different crises in front of them."
                                                    link="#"
                                                />
                                                <RelatedStoryCard 
                                                    img="https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812450/climat_change_traning6_b0fudh.jpg"
                                                    title="LEGASI Trains Women on Climate Change"
                                                    desc="As part of the International Women's Days activities, LEGASI organized an advocacy training for women in Plateau State."
                                                    link="#"
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    );
};

export default BlogPostPage;