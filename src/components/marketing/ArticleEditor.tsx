import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  Save,
  X,
  Upload,
  Image as ImageIcon,
  Eye,
  Calendar,
  Tag,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

interface ArticleEditorProps {
  article?: {
    id?: string;
    title: string;
    content: string;
    excerpt: string;
    author: string;
    published: boolean;
    published_at: string | null;
    scheduled_at: string | null;
    category: string | null;
    tags: string[];
    image_url: string | null;
  } | null;
  onSave: (article: any) => void;
  onClose: () => void;
}

export default function ArticleEditor({ article, onSave, onClose }: ArticleEditorProps) {
  const [formData, setFormData] = useState({
    title: article?.title || '',
    content: article?.content || '',
    excerpt: article?.excerpt || '',
    author: article?.author || '',
    published: article?.published || false,
    scheduled_at: article?.scheduled_at || null,
    category: article?.category || '',
    tags: article?.tags || [],
    image_url: article?.image_url || null
  });

  const [newTag, setNewTag] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quill modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['blockquote', 'code-block'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'color', 'background',
    'align',
    'link', 'image', 'video',
    'blockquote', 'code-block'
  ];

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    const loadingToast = toast.loading('Uploading image...');

    try {
      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `articles/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      toast.dismiss(loadingToast);
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.message || 'Failed to upload image');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSave = async (publish: boolean = false) => {
    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Please enter article content');
      return;
    }

    if (!formData.excerpt.trim()) {
      toast.error('Please enter an excerpt');
      return;
    }

    setSaving(true);
    const savingToast = toast.loading(publish ? 'Publishing article...' : 'Saving draft...');

    try {
      const articleData = {
        ...formData,
        published: publish,
        published_at: publish ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      };

      if (article?.id) {
        // Update existing article
        const { error } = await supabase
          .from('news_articles')
          .update(articleData)
          .eq('id', article.id);

        if (error) throw error;
      } else {
        // Create new article
        const { error } = await supabase
          .from('news_articles')
          .insert([{
            ...articleData,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      toast.dismiss(savingToast);
      toast.success(publish ? 'Article published!' : 'Draft saved!');
      onSave(articleData);
      onClose();
    } catch (error: any) {
      toast.dismiss(savingToast);
      toast.error(error.message || 'Failed to save article');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSchedule = async () => {
    if (!formData.scheduled_at) {
      toast.error('Please select a publish date');
      return;
    }

    setSaving(true);
    const savingToast = toast.loading('Scheduling article...');

    try {
      const articleData = {
        ...formData,
        published: false,
        scheduled_at: formData.scheduled_at,
        updated_at: new Date().toISOString()
      };

      if (article?.id) {
        const { error } = await supabase
          .from('news_articles')
          .update(articleData)
          .eq('id', article.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('news_articles')
          .insert([{
            ...articleData,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      toast.dismiss(savingToast);
      toast.success(`Article scheduled for ${new Date(formData.scheduled_at).toLocaleDateString()}`);
      onSave(articleData);
      onClose();
    } catch (error: any) {
      toast.dismiss(savingToast);
      toast.error(error.message || 'Failed to schedule article');
      console.error('Schedule error:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="min-h-screen px-4 py-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between z-10">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {article?.id ? 'Edit Article' : 'Create New Article'}
                </h2>
                <p className="text-sm text-blue-100">
                  {article?.id ? 'Update your article' : 'Write and publish your content'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Article Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter a compelling title..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
              />
            </div>

            {/* Metadata Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Author */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Author name"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select category...</option>
                  <option value="news">News</option>
                  <option value="insights">Industry Insights</option>
                  <option value="events">Events</option>
                  <option value="technology">Technology</option>
                  <option value="partnerships">Partnerships</option>
                  <option value="innovation">Innovation</option>
                </select>
              </div>
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Featured Image
              </label>
              <div className="flex items-center space-x-4">
                {formData.image_url ? (
                  <div className="relative">
                    <img
                      src={formData.image_url}
                      alt="Featured"
                      className="w-40 h-40 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      onClick={() => setFormData({ ...formData, image_url: null })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 min-w-[36px] min-h-[36px] flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Click to upload</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    Upload a featured image for your article (max 5MB)
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: 1200x630px for optimal social media sharing
                  </p>
                </div>
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Excerpt / Summary
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief summary of the article (150-200 characters)"
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.excerpt.length}/200 characters
              </p>
            </div>

            {/* WYSIWYG Editor */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Article Content
              </label>
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  modules={modules}
                  formats={formats}
                  placeholder="Write your article here..."
                  className="h-96"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-1"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="Add tag..."
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Button onClick={handleAddTag} variant="outline">
                  <Tag className="h-4 w-4 mr-2" />
                  Add Tag
                </Button>
              </div>
            </div>

            {/* Schedule Publishing */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Schedule Publishing (Optional)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="datetime-local"
                  value={formData.scheduled_at || ''}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {formData.scheduled_at && (
                  <Badge className="bg-orange-100 text-orange-700 px-3 py-2">
                    <Clock className="h-4 w-4 mr-2" />
                    Scheduled: {new Date(formData.scheduled_at).toLocaleString()}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowPreview(!showPreview)}
                variant="outline"
                className="border-2"
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? 'Edit' : 'Preview'}
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => handleSave(false)}
                variant="outline"
                disabled={saving || uploading}
                className="border-2"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              {formData.scheduled_at && (
                <Button
                  onClick={handleSchedule}
                  disabled={saving || uploading}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              )}
              <Button
                onClick={() => handleSave(true)}
                disabled={saving || uploading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {article?.published ? 'Update & Publish' : 'Publish Now'}
              </Button>
            </div>
          </div>

          {/* Preview Modal */}
          {showPreview && (
            <div className="absolute inset-0 bg-white z-20 overflow-y-auto p-8">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">Preview</h3>
                  <Button onClick={() => setShowPreview(false)} variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    Close Preview
                  </Button>
                </div>
                <article className="prose prose-lg max-w-none">
                  {formData.image_url && (
                    <img
                      src={formData.image_url}
                      alt={formData.title}
                      className="w-full h-96 object-cover rounded-xl mb-6"
                    />
                  )}
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">{formData.title}</h1>
                  <div className="flex items-center space-x-4 text-gray-600 mb-6">
                    <span>By {formData.author}</span>
                    <span>•</span>
                    <span>{formData.category}</span>
                  </div>
                  <p className="text-xl text-gray-600 italic mb-8">{formData.excerpt}</p>
                  <div dangerouslySetInnerHTML={{ __html: formData.content }} />
                  <div className="flex flex-wrap gap-2 mt-8">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} className="bg-blue-100 text-blue-700">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </article>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
