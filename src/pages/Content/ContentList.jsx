import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Edit3, Save, X, Image, Type, Layout, Eye, Settings, Home, Package, Star, Info, Check, AlertCircle, Loader } from 'lucide-react';
import { fetchHomePageContent, updateSectionContent, clearError } from '../../store/slices/contentSlice';
import axiosInstance from '../../services/axiosConfig';

const ProfessionalCMS = () => {
  const dispatch = useDispatch();
  const { sections, loading, updateLoading, error } = useSelector((state) => state.content);
  console?.log('Content sections:', sections);
  const BASE_IMAGE_URL = import.meta.env.VITE_IMAGE_URL || 'http://localhost:3000/';

  const [activeTab, setActiveTab] = useState('hero');
  const [editingSection, setEditingSection] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    dispatch(fetchHomePageContent());
  }, [dispatch]);

  // Auto-start editing when content loads
  useEffect(() => {
    if (sections[activeTab]?.[0] && !editingSection) {
      setEditingSection(activeTab);
      setFormData({ ...sections[activeTab][0].content });
    }
  }, [sections, activeTab, editingSection]);

  useEffect(() => {
    if (error) {
      setSaveStatus('error');
      setTimeout(() => {
        setSaveStatus(null);
        dispatch(clearError());
      }, 5000);
    }
  }, [error, dispatch]);

  const tabs = [
    { id: 'hero', name: 'Hero Section', icon: Home, color: 'blue' },
    { id: 'categoryPick', name: 'Product Picker', icon: Package, color: 'purple' },
    { id: 'offerBanner', name: 'Special Offers', icon: Star, color: 'orange' },
    { id: 'productSlider', name: 'Product Slider', icon: Plus, color: 'green' },
    { id: 'whyUs', name: 'Why Us', icon: Info, color: 'indigo' },
    { id: 'uniqueSellingPoints', name: 'Unique Points', icon: Settings, color: 'red' }
  ];

  const handleSave = async (sectionType) => {
    const currentSection = sections[sectionType]?.[0];
    if (!currentSection) return;

    try {
      // Create FormData to match your API expectations
      const apiFormData = new FormData();
      
      // Add content as JSON string - this is what your API expects
      apiFormData.append('content', JSON.stringify(formData));
      
      // Add optional section metadata
      apiFormData.append('sectionType', currentSection.sectionType);
      apiFormData.append('order', currentSection.order.toString());
      apiFormData.append('isVisible', currentSection.isVisible.toString());
      
      if (selectedImage) {
        apiFormData.append('image', selectedImage);
      }

      // Use correct endpoint format with query parameter
      const response = await axiosInstance.put(
        `/content?id=${currentSection._id}`,
        apiFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Handle successful response
      if (response.data.success || response.data.data) {
        // Refresh content to get updated data
        dispatch(fetchHomePageContent());
        
        setEditingSection(null);
        setHasUnsavedChanges(false);
        setSaveStatus('success');
        setFormData({});
        setSelectedImage(null);
        
        // Show success popup for longer duration
        setTimeout(() => setSaveStatus(null), 4000);
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 5000);
    }
  };

  const handleFormChange = () => {
    setHasUnsavedChanges(true);
  };

  const handleEdit = (sectionType) => {
    const sectionData = sections[sectionType]?.[0];
    if (sectionData) {
      setEditingSection(sectionType);
      // Initialize form data with current section content
      setFormData({ ...sectionData.content });
      setSelectedImage(null); // Reset selected image
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      handleFormChange();
    }
  };

  const renderEditForm = (sectionType, sectionData) => {
    const updateFormData = (updates) => {
      setFormData(prev => ({ ...prev, ...updates }));
      handleFormChange();
    };

    const renderFieldsByType = () => {
      switch(sectionType) {
        case 'hero':
          return (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => updateFormData({ title: e.target.value })}
                    className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                    placeholder="Enter section title"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Button Text</label>
                  <input
                    type="text"
                    value={formData.cta?.title || ''}
                    onChange={(e) => updateFormData({ cta: { ...formData.cta, title: e.target.value } })}
                    className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                    placeholder="Enter button text"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Button Link</label>
                <input
                  type="text"
                  value={formData.cta?.link || ''}
                  onChange={(e) => updateFormData({ cta: { ...formData.cta, link: e.target.value } })}
                  className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                  placeholder="Enter button link"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  rows={4}
                  className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm resize-none"
                  placeholder="Enter detailed description"
                />
              </div>
            </>
          );

        case 'categoryPick':
          return (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => updateFormData({ title: e.target.value })}
                    className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                    placeholder="Enter section title"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Button Text</label>
                  <input
                    type="text"
                    value={formData.cta?.title || ''}
                    onChange={(e) => updateFormData({ cta: { ...formData.cta, title: e.target.value } })}
                    className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                    placeholder="Enter button text"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Button Link</label>
                <input
                  type="text"
                  value={formData.cta?.link || ''}
                  onChange={(e) => updateFormData({ cta: { ...formData.cta, link: e.target.value } })}
                  className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                  placeholder="Enter button link"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  rows={4}
                  className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm resize-none"
                  placeholder="Enter detailed description"
                />
              </div>
            </>
          );

        case 'offerBanner':
          return (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tagline</label>
                  <input
                    type="text"
                    value={formData.tagline || ''}
                    onChange={(e) => updateFormData({ tagline: e.target.value })}
                    className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                    placeholder="Enter tagline"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => updateFormData({ title: e.target.value })}
                    className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                    placeholder="Enter section title"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  rows={4}
                  className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm resize-none"
                  placeholder="Enter detailed description"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Button Text</label>
                  <input
                    type="text"
                    value={formData.cta?.title || ''}
                    onChange={(e) => updateFormData({ cta: { ...formData.cta, title: e.target.value } })}
                    className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                    placeholder="Enter button text"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Offer End Date</label>
                  <input
                    type="datetime-local"
                    value={formData.countdown?.endDate ? new Date(formData.countdown.endDate).toISOString().slice(0, 16) : ''}
                    onChange={(e) => updateFormData({ countdown: { ...formData.countdown, endDate: e.target.value } })}
                    className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>
              </div>
            </>
          );

        case 'productSlider':
          return (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => updateFormData({ title: e.target.value })}
                  className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                  placeholder="Enter section title"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description (HTML allowed)</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  rows={4}
                  className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm resize-none"
                  placeholder="Enter detailed description with HTML if needed"
                />
              </div>
            </>
          );

        case 'whyUs':
          return (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => updateFormData({ title: e.target.value })}
                  className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                  placeholder="Enter section title"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  rows={4}
                  className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm resize-none"
                  placeholder="Enter detailed description"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Points (one per line)</label>
                <textarea
                  value={formData.points?.join('\n') || ''}
                  onChange={(e) => updateFormData({ points: e.target.value.split('\n').filter(point => point.trim()) })}
                  rows={4}
                  className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm resize-none"
                  placeholder="Enter points, one per line"
                />
              </div>
            </>
          );

        case 'uniqueSellingPoints':
          return (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => updateFormData({ title: e.target.value })}
                    className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                    placeholder="Enter section title"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Button Text</label>
                  <input
                    type="text"
                    value={formData.cta?.title || ''}
                    onChange={(e) => updateFormData({ cta: { ...formData.cta, title: e.target.value } })}
                    className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                    placeholder="Enter button text"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  rows={4}
                  className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm resize-none"
                  placeholder="Enter detailed description"
                />
              </div>

              {/* Cards Section */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Feature Cards</label>
                {formData.cards?.map((card, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-900">Card {index + 1}</h4>
                      <button
                        onClick={() => {
                          const newCards = [...(formData.cards || [])];
                          newCards.splice(index, 1);
                          updateFormData({ cards: newCards });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={card.tag || ''}
                        onChange={(e) => {
                          const newCards = [...(formData.cards || [])];
                          newCards[index] = { ...card, tag: e.target.value };
                          updateFormData({ cards: newCards });
                        }}
                        placeholder="Tag (e.g., 01 FEATURE)"
                        className="p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="text"
                        value={card.title || ''}
                        onChange={(e) => {
                          const newCards = [...(formData.cards || [])];
                          newCards[index] = { ...card, title: e.target.value };
                          updateFormData({ cards: newCards });
                        }}
                        placeholder="Card title"
                        className="p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <textarea
                        value={card.description || ''}
                        onChange={(e) => {
                          const newCards = [...(formData.cards || [])];
                          newCards[index] = { ...card, description: e.target.value };
                          updateFormData({ cards: newCards });
                        }}
                        placeholder="Card description"
                        rows={2}
                        className="p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newCards = [...(formData.cards || []), { tag: '', title: '', description: '' }];
                    updateFormData({ cards: newCards });
                  }}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
                >
                  <Plus size={16} className="inline mr-2" />
                  Add New Card
                </button>
              </div>
            </>
          );

        default:
          return (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => updateFormData({ title: e.target.value })}
                  className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                  placeholder="Enter section title"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  rows={4}
                  className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm resize-none"
                  placeholder="Enter detailed description"
                />
              </div>
            </>
          );
      }
    };

    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-lg">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold flex items-center space-x-2">
                <Edit3 size={24} />
                <span>Edit {tabs.find(t => t.id === sectionType)?.name}</span>
              </h3>
              <p className="text-blue-100 mt-1">Make changes to your content below</p>
            </div>
            <button 
              onClick={() => {
                setEditingSection(null);
                setHasUnsavedChanges(false);
                setFormData({});
                setSelectedImage(null);
              }}
              className="text-blue-100 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {renderFieldsByType()}

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
              <Image size={16} />
              <span>Upload Image</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
            />
            {(formData.image || selectedImage) && (
              <div className="mt-2">
                <img
                  src={selectedImage ? URL.createObjectURL(selectedImage) : `${BASE_IMAGE_URL}${formData.image}`}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-blue-200 bg-white/50 -mx-6 px-6 py-4 rounded-b-xl">
            <div className="flex items-center space-x-2">
              {hasUnsavedChanges && (
                <div className="flex items-center space-x-2 text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">
                  <AlertCircle size={16} />
                  <span className="text-sm font-medium">Unsaved changes</span>
                </div>
              )}
              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-1 rounded-lg">
                  <AlertCircle size={16} />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setEditingSection(null);
                  setHasUnsavedChanges(false);
                  setFormData({});
                  setSelectedImage(null);
                }}
                className="px-5 py-2.5 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium shadow-sm"
                disabled={updateLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave(sectionType)}
                disabled={updateLoading || !hasUnsavedChanges}
                className={`px-6 py-2.5 rounded-lg flex items-center space-x-2 transition-all font-medium shadow-lg disabled:opacity-50 ${
                  updateLoading 
                    ? 'bg-blue-400 text-white cursor-not-allowed' 
                    : hasUnsavedChanges
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {updateLoading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader size={24} className="animate-spin" />
          <span>Loading content...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Popup Notification */}
      {saveStatus === 'success' && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Check size={16} className="text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">Changes Saved Successfully!</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Your {tabs.find(t => t.id === activeTab)?.name} content has been updated.
                </p>
              </div>
              <button
                onClick={() => setSaveStatus(null)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Popup Notification */}
      {saveStatus === 'error' && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
          <div className="bg-white rounded-lg shadow-lg border border-red-200 p-4 max-w-sm">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle size={16} className="text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">Save Failed</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {error || 'There was an error saving your changes. Please try again.'}
                </p>
              </div>
              <button
                onClick={() => setSaveStatus(null)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Professional Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Content Management System</h1>
                <p className="text-gray-600 mt-1">Manage your website content</p>
                {/* Debug info */}
                <p className="text-xs text-gray-400 mt-1">
                  Available sections: {Object.keys(sections).length > 0 ? Object.keys(sections).join(', ') : 'Loading...'}
                </p>
              </div>
            </div>
          </div>

          {/* Top Tab Navigation */}
          <div className="px-6 pb-0">
            <nav className="flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const hasContent = sections[tab.id] && sections[tab.id].length > 0;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      // Automatically start editing when switching tabs
                      if (sections[tab.id]?.[0]) {
                        setEditingSection(tab.id);
                        setFormData({ ...sections[tab.id][0].content });
                        setSelectedImage(null);
                      }
                    }}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg font-medium text-sm transition-all relative ${
                      isActive
                        ? 'bg-white text-blue-600 shadow-sm border-t border-l border-r border-gray-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.name}</span>
                    {/* Content indicator */}
                    {hasContent && (
                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-600' : 'bg-green-500'}`}></div>
                    )}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border">
          {/* Section Header */}
          <div className="border-b bg-gray-50/50 px-6 py-4 rounded-t-xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Edit {tabs.find(t => t.id === activeTab)?.name}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Make changes to your content below
                </p>
                {/* Show current section info */}
                {sections[activeTab]?.[0] && (
                  <p className="text-xs text-gray-400 mt-1">
                    Section ID: {sections[activeTab][0]._id} | Visible: {sections[activeTab][0].isVisible ? 'Yes' : 'No'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {sections[activeTab]?.[0] ? (
              renderEditForm(activeTab, sections[activeTab]?.[0])
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No content available for this section</p>
                <p className="text-sm mt-2">Available sections: {Object.keys(sections).join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalCMS;