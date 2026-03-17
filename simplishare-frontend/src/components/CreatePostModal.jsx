// Create Post Modal Component
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { postAPI } from '../services/api';
import { X, Image as ImageIcon, Type, Grid } from 'lucide-react';
import './CreatePostModal.css';

function CreatePostModal({ isOpen, onClose, onPostCreated }) {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Handle file selection
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        // Validate file count (max 20 as per your requirement)
        if (files.length > 20) {
            setError('Maximum 20 images allowed');
            return;
        }

        // Validate file types
        const validFiles = files.filter(file => file.type.startsWith('image/'));
        if (validFiles.length !== files.length) {
            setError('Only image files are allowed');
            return;
        }

        setSelectedFiles(validFiles);

        // Create preview URLs
        const urls = validFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);
        setError('');
    };

    // Remove an image from selection
    const removeImage = (index) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newUrls = previewUrls.filter((_, i) => i !== index);

        // Revoke the old URL to free memory
        URL.revokeObjectURL(previewUrls[index]);

        setSelectedFiles(newFiles);
        setPreviewUrls(newUrls);
    };

    // Determine content type automatically
    const getContentType = () => {
        if (selectedFiles.length === 0) return 0; // Text
        if (selectedFiles.length === 1) return 1; // Image
        return 2; // ImageGallery
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!title.trim()) {
            setError('Title is required');
            return;
        }

        const contentType = getContentType();

        if (contentType === 1 && selectedFiles.length === 0) {
            setError('Please select at least one image');
            return;
        }

        if (contentType === 2 && selectedFiles.length < 2) {
            setError('Image gallery requires at least 2 images');
            return;
        }

        if (contentType === 0 && !content.trim()) {
            setError('Text content is required for text posts');
            return;
        }

        try {
            setLoading(true);

            // Create FormData
            const formData = new FormData();
            formData.append('Title', title);
            formData.append('Content', content || '');
            formData.append('UserId', user.id);
            formData.append('ContentType', contentType);

            // Append images
            selectedFiles.forEach((file) => {
                formData.append('images', file);
            });

            // Send to backend
            await postAPI.createPost(formData);

            // Success - close modal and refresh feed
            handleClose();
            if (onPostCreated) {
                onPostCreated();
            }
        } catch (err) {
            console.error('Error creating post:', err);
            setError(err.response?.data?.message || 'Failed to create post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Close modal and reset form
    const handleClose = () => {
        setTitle('');
        setContent('');
        setSelectedFiles([]);
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        setPreviewUrls([]);
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    const contentType = getContentType();

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="modal-header">
                    <h2>Create Post</h2>
                    <button className="modal-close-btn-small" onClick={handleClose}>
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="modal-body">
                    {/* Title Input */}
                    <div className="form-group">
                        <label htmlFor="title" className="form-label">
                            Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input"
                            placeholder="Give your post a title..."
                            maxLength={100}
                        />
                    </div>

                    {/* Content Type Info */}
                    <div className="content-type-info">
                        <div className="content-type-badge">
                            {contentType === 0 && (
                                <>
                                    <Type size={16} />
                                    <span>Text Post</span>
                                </>
                            )}
                            {contentType === 1 && (
                                <>
                                    <ImageIcon size={16} />
                                    <span>Image Post</span>
                                </>
                            )}
                            {contentType === 2 && (
                                <>
                                    <Grid size={16} />
                                    <span>Image Gallery</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="form-group">
                        <label htmlFor="content" className="form-label">
                            Content {contentType === 0 && '*'}
                        </label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="input textarea"
                            placeholder="What's on your mind?"
                            rows={4}
                            maxLength={1000}
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="form-group">
                        <label className="form-label">Images (Optional)</label>
                        <div className="image-upload-area">
                            <input
                                type="file"
                                id="images"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                className="file-input"
                            />
                            <label htmlFor="images" className="file-input-label">
                                <ImageIcon size={24} />
                                <span>Choose images</span>
                                <small>Up to 20 images</small>
                            </label>
                        </div>

                        {/* Image Previews */}
                        {previewUrls.length > 0 && (
                            <div className="image-preview-grid">
                                {previewUrls.map((url, index) => (
                                    <div key={index} className="image-preview-item">
                                        <img src={url} alt={`Preview ${index + 1}`} />
                                        <button
                                            type="button"
                                            className="remove-image-btn"
                                            onClick={() => removeImage(index)}
                                        >
                                            <X size={16} />
                                        </button>
                                        <div className="image-index">{index + 1}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && <div className="error-message">{error}</div>}

                    {/* Modal Footer */}
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreatePostModal;