"use client";

import React from "react";
import {
  BookOpen,
  Star,
  Image,
  FileText,
  ShoppingCart,
  Heart,
  Share2,
  Eye,
  Check,
  Award,
  Zap,
  Shield,
  Truck,
  Gift,
  ChevronLeft,
  ChevronRight,
  Tag,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
} from "lucide-react";

// Component types
export const COMPONENT_TYPES = {
  IMAGES: "images",
  DETAILS: "details",
  DESCRIPTION: "description",
  FREQUENTLY_PURCHASED: "frequentlyPurchased",
  INGREDIENTS: "ingredients",
  COUPONS: "coupons",
  HOW_TO_USE: "howToUse",
  CUSTOMER_REVIEWS: "customerReviews",
};

// Component variants configuration
export const COMPONENT_VARIANTS = {
  [COMPONENT_TYPES.IMAGES]: {
    modern: {
      label: "Modern",
      description: "Clean modern design with hover effects",
    },
    gallery: {
      label: "Gallery",
      description: "Grid-based image gallery",
    },
    showcase: {
      label: "Showcase",
      description: "Premium showcase with detailed view",
    },
  },
  [COMPONENT_TYPES.DETAILS]: {
    modern: {
      label: "Modern",
      description: "Professional clean layout",
    },
    card: {
      label: "Card",
      description: "Compact card-style layout",
    },
    premium: {
      label: "Premium",
      description: "Luxury showcase design",
    },
  },
  [COMPONENT_TYPES.DESCRIPTION]: {
    layout: {
      label: "Layout",
      description: "Two-column layout with description and media",
    },
    compact: {
      label: "Compact",
      description: "Minimal single-column layout",
    },
    showcase: {
      label: "Showcase",
      description: "Full-width media showcase design",
    },
  },
  [COMPONENT_TYPES.FREQUENTLY_PURCHASED]: {
    slider: {
      label: "Slider",
      description: "Horizontal scrolling product slider",
    },
    grid: {
      label: "Grid",
      description: "Clean grid layout",
    },
    carousel: {
      label: "Carousel",
      description: "Interactive carousel with controls",
    },
  },
  [COMPONENT_TYPES.INGREDIENTS]: {
    scrolling: {
      label: "Scrolling",
      description: "Interactive scroll-based ingredient showcase",
    },
    grid: {
      label: "Grid",
      description: "Grid layout with ingredient cards",
    },
    carousel: {
      label: "Carousel",
      description: "Horizontal carousel of ingredients",
    },
  },
  [COMPONENT_TYPES.COUPONS]: {
    slider: {
      label: "Slider",
      description: "Interactive coupon slider with selection",
    },
    grid: {
      label: "Grid",
      description: "Grid layout of available coupons",
    },
    compact: {
      label: "Compact",
      description: "Minimal coupon display",
    },
  },
  [COMPONENT_TYPES.HOW_TO_USE]: {
    standard: {
      label: "Standard",
      description: "Video with step-by-step instructions",
    },
    minimal: {
      label: "Minimal",
      description: "Clean layout with numbered steps",
    },
    detailed: {
      label: "Detailed",
      description: "Enhanced layout with rich descriptions",
    },
  },
  [COMPONENT_TYPES.CUSTOMER_REVIEWS]: {
    cards: {
      label: "Cards",
      description: "Individual review cards with ratings",
    },
    list: {
      label: "List",
      description: "Clean list layout with compact design",
    },
    testimonial: {
      label: "Testimonial",
      description: "Featured testimonial style layout",
    },
  },
};

// Product Images Component with Enhanced Variations
const imageUrl = import.meta.env.VITE_IMAGE_URL;
export function ProductImages({
  component,
  product,
  settings,
  onUpdateSettings,
  onUpdateSpan,
  isFullWidth = false,
  isPreviewMode = false,
  COMPONENT_SPANS,
}: {
  component: any;
  product: any;
  settings: any;
  onUpdateSettings: any;
  onUpdateSpan: any;
  isFullWidth?: boolean;
  isPreviewMode?: boolean;
  COMPONENT_SPANS: any;
}) {
  const imageSettings = {
    ...{
      showThumbnails: true,
      imageSize: "medium",
      span: component.span || 1,
      variant: "modern",
    },
    ...settings[component.id],
    variant: component.variant || settings[component.id]?.variant || "modern",
  };

  // Dummy images if product images are not available
  const dummyImages = [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&h=600&fit=crop",
  ];

  const images =
    product?.images?.length > 0
      ? product.images.map((img: string) => `${imageUrl}/${img.url}`)
      : dummyImages;

  // Modern/Elegant Variant - Clean modern design with hover effects
  const renderModernVariant = () => (
    <div className="space-y-4">
      <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100">
        <img
          src={images[0]}
          alt="Main product"
          className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors">
            <Heart size={16} className="text-gray-600" />
          </button>
          <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors">
            <Share2 size={16} className="text-gray-600" />
          </button>
        </div>
        {!product?.images?.length && (
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full font-medium">
              Demo Product
            </span>
          </div>
        )}
      </div>

      {imageSettings.showThumbnails && images.length > 1 && (
        <div className="flex gap-3 justify-center">
          {images.slice(1, 4).map((img: string, idx: number) => (
            <div
              key={idx}
              className="relative group cursor-pointer overflow-hidden rounded-xl bg-gray-100"
            >
              <img
                src={img}
                alt={`Product view ${idx + 2}`}
                className="w-16 h-16 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Gallery Variant - Grid-based layout with zoom functionality
  const renderGalleryVariant = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 relative group overflow-hidden rounded-xl">
          <img
            src={images[0]}
            alt="Main product"
            className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex justify-between items-end">
              <div>
                <h4 className="text-white font-semibold text-lg mb-1">
                  {product?.name || "Premium Product"}
                </h4>
                <p className="text-white/80 text-sm">
                  Gallery View • {images.length} Photos
                </p>
              </div>
              <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                <Eye size={16} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {images.slice(1, 3).map((img: string, idx: number) => (
          <div key={idx} className="relative group overflow-hidden rounded-xl">
            <img
              src={img}
              alt={`Product ${idx + 2}`}
              className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="p-2 bg-white/90 rounded-full">
                <Eye size={14} className="text-gray-700" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Showcase Variant - Premium showcase with detailed view
  const renderShowcaseVariant = () => (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100 to-transparent rounded-tr-full" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <Award size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Featured Product
                </h3>
                <p className="text-sm text-gray-600">Premium Collection</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                ✨ Best Seller
              </span>
            </div>
          </div>

          <div className="relative group">
            <img
              src={images[0]}
              alt="Showcase product"
              className="w-full h-72 object-cover rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex justify-between items-end">
                <div className="text-white">
                  <h4 className="font-bold text-xl mb-1">
                    {product?.name || "Premium Wireless Headphones"}
                  </h4>
                  <p className="text-white/90 text-sm">
                    Professional Grade • Limited Edition
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                    <Heart size={18} className="text-white" />
                  </button>
                  <button className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                    <ShoppingCart size={18} className="text-gray-700" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {imageSettings.showThumbnails && images.length > 1 && (
        <div className="flex gap-4 justify-center">
          {images.slice(1, 4).map((img: string, idx: number) => (
            <div key={idx} className="relative group cursor-pointer">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-3 border-transparent group-hover:border-blue-200 transition-colors duration-300">
                <img
                  src={img}
                  alt={`Showcase ${idx + 2}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderVariant = () => {
    switch (imageSettings.variant) {
      case "gallery":
        return renderGalleryVariant();
      case "showcase":
        return renderShowcaseVariant();
      default:
        return renderModernVariant();
    }
  };

  return (
    <div
      className={`${
        isPreviewMode
          ? "bg-transparent"
          : "bg-white rounded-2xl shadow-xl border border-gray-100"
      } ${isPreviewMode ? "" : "p-6 mb-4"} ${isFullWidth ? "w-full" : ""}`}
    >
      {!isPreviewMode && (
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold flex items-center gap-3 text-gray-900">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Image size={20} className="text-blue-600" />
            </div>
            Product Gallery
            {isFullWidth && (
              <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                Full Width
              </span>
            )}
          </h3>
        </div>
      )}

      {renderVariant()}
    </div>
  );
}

// Product Details Component with Enhanced Variations
export function ProductDetails({
  component,
  product,
  settings,
  onUpdateSettings,
  onUpdateSpan,
  isFullWidth = false,
  isPreviewMode = false,
  COMPONENT_SPANS,
}: {
  component: any;
  product: any;
  settings: any;
  onUpdateSettings: any;
  onUpdateSpan: any;
  isFullWidth?: boolean;
  isPreviewMode?: boolean;
  COMPONENT_SPANS: any;
}) {
  const detailSettings = {
    ...{
      showPrice: true,
      showDescription: true,
      showFeatures: true,
      span: component.span || 1,
      variant: "modern",
    },
    ...settings[component.id],
    variant: component.variant || settings[component.id]?.variant || "modern",
  };

  // Dummy data for missing product details
  const dummyProduct = {
    name: "Premium Wireless Headphones",
    price: 199.99,
    originalPrice: 299.99,
    description:
      "Experience premium sound quality with our latest wireless headphones featuring active noise cancellation, premium comfort, and extended battery life.",
    features: [
      "Active Noise Cancellation",
      "30-hour Battery Life",
      "Premium Comfort Fit",
      "Hi-Fi Audio Quality",
      "Quick Charge Technology",
    ],
    rating: 4.8,
    reviews: 1247,
    availability: "In Stock",
    brand: "TechPro",
  };

  const productData = {
    name: product?.name || dummyProduct.name,
    price: product?.price || dummyProduct.price,
    originalPrice: product?.originalPrice || dummyProduct.originalPrice,
    description: product?.description || dummyProduct.description,
    features: product?.features || dummyProduct.features,
    rating: product?.rating || dummyProduct.rating,
    reviews: product?.reviews || dummyProduct.reviews,
    availability: product?.availability || dummyProduct.availability,
    brand: product?.brand || dummyProduct.brand,
  };

  // Modern/Professional Variant - Clean and minimalist design
  const renderModernVariant = () => (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {productData.brand}
              </span>
              <div className="flex items-center gap-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={`${
                        i < Math.floor(productData.rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-1">
                  {productData.rating} ({productData.reviews} reviews)
                </span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {productData.name}
            </h1>
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              <Heart size={18} className="text-gray-600" />
            </button>
            <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              <Share2 size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Price Section */}
        {detailSettings.showPrice && (
          <div className="flex items-center gap-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">
                ${productData.price}
              </span>
              {productData.originalPrice > productData.price && (
                <span className="text-lg text-gray-500 line-through">
                  ${productData.originalPrice}
                </span>
              )}
              {productData.originalPrice > productData.price && (
                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md">
                  Save $
                  {(productData.originalPrice - productData.price).toFixed(2)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-700">
                {productData.availability}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      {detailSettings.showDescription && (
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Description
          </h3>
          <p className="text-gray-700 leading-relaxed">
            {productData.description}
          </p>
        </div>
      )}

      {/* Features */}
      {detailSettings.showFeatures && productData.features && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Key Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {productData.features.map((feature: string, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-shadow"
              >
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Check size={14} className="text-blue-600" />
                </div>
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
          <ShoppingCart size={18} />
          Add to Cart
        </button>
        <button className="px-6 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl font-semibold transition-colors">
          Buy Now
        </button>
      </div>
    </div>
  );

  // Card Variant - Compact card-style layout
  const renderCardVariant = () => (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="space-y-5">
        {/* Header with Badge */}
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1.5 rounded-full">
              ⭐ FEATURED
            </span>
            <div className="flex gap-1">
              <button className="p-1.5 bg-white shadow-sm rounded-lg hover:shadow-md transition-shadow">
                <Heart size={14} className="text-gray-500" />
              </button>
              <button className="p-1.5 bg-white shadow-sm rounded-lg hover:shadow-md transition-shadow">
                <Share2 size={14} className="text-gray-500" />
              </button>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {productData.name}
          </h2>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={`${
                    i < Math.floor(productData.rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">
              {productData.rating} • {productData.reviews} reviews
            </span>
          </div>
        </div>

        {/* Price */}
        {detailSettings.showPrice && (
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  ${productData.price}
                </span>
                {productData.originalPrice > productData.price && (
                  <span className="text-sm text-gray-500 line-through">
                    ${productData.originalPrice}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md">
                {Math.round(
                  ((productData.originalPrice - productData.price) /
                    productData.originalPrice) *
                    100
                )}
                % OFF
              </span>
            </div>
          </div>
        )}

        {/* Quick Features */}
        {detailSettings.showFeatures && productData.features && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900">Highlights</h4>
            <div className="space-y-2">
              {productData.features
                .slice(0, 3)
                .map((feature: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <Check size={12} className="text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Action */}
        <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-xl font-semibold transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2">
          <ShoppingCart size={16} />
          Quick Add
        </button>
      </div>
    </div>
  );

  // Premium Variant - Luxury showcase design
  const renderPremiumVariant = () => (
    <div className="relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 rounded-3xl"></div>
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-200/30 to-transparent rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-200/30 to-transparent rounded-full blur-2xl"></div>

      <div className="relative z-10 p-8 space-y-6">
        {/* Premium Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl">
              <Award size={24} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-amber-600">
                  PREMIUM
                </span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="text-amber-400 fill-current"
                    />
                  ))}
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {productData.name}
              </h1>
              <p className="text-sm text-gray-600">
                {productData.brand} • Limited Edition
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button className="p-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:bg-white transition-colors">
              <Heart size={18} className="text-gray-600" />
            </button>
            <button className="p-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:bg-white transition-colors">
              <Share2 size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Premium Price Display */}
        {detailSettings.showPrice && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ${productData.price}
                  </span>
                  {productData.originalPrice > productData.price && (
                    <span className="text-lg text-gray-500 line-through">
                      ${productData.originalPrice}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    💰 Best Value
                  </span>
                  <span className="text-sm text-gray-600">
                    ⚡ Limited Time Offer
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-green-600 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">In Stock</span>
                </div>
                <p className="text-xs text-gray-600">Fast & Free Shipping</p>
              </div>
            </div>
          </div>
        )}

        {/* Premium Description */}
        {detailSettings.showDescription && (
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Zap size={18} className="text-blue-600" />
              Product Excellence
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {productData.description}
            </p>
          </div>
        )}

        {/* Premium Features Grid */}
        {detailSettings.showFeatures && productData.features && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Shield size={18} className="text-green-600" />
              Premium Features
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {productData.features.map((feature: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/70 transition-colors"
                >
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                    <Check size={16} className="text-white" />
                  </div>
                  <span className="text-gray-800 font-medium">{feature}</span>
                  <div className="ml-auto">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Premium Actions */}
        <div className="flex gap-4 pt-4">
          <button className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white px-8 py-4 rounded-2xl font-bold transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-3">
            <ShoppingCart size={20} />
            Add to Premium Cart
            <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
          </button>
          <button className="px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-blue-600 text-blue-600 hover:bg-white rounded-2xl font-bold transition-colors">
            Buy Now
          </button>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/20">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Shield size={14} className="text-green-600" />
            <span>2-Year Warranty</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Truck size={14} className="text-blue-600" />
            <span>Free Shipping</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Gift size={14} className="text-purple-600" />
            <span>Gift Wrapping</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVariant = () => {
    switch (detailSettings.variant) {
      case "card":
        return renderCardVariant();
      case "premium":
        return renderPremiumVariant();
      default:
        return renderModernVariant();
    }
  };

  return (
    <div
      className={`${
        isPreviewMode
          ? "bg-transparent"
          : "bg-white rounded-2xl shadow-xl border border-gray-100"
      } ${isPreviewMode ? "" : "p-6 mb-4"} ${isFullWidth ? "w-full" : ""}`}
    >
      {!isPreviewMode && (
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold flex items-center gap-3 text-gray-900">
            <div className="p-2 bg-green-100 rounded-xl">
              <FileText size={20} className="text-green-600" />
            </div>
            Product Details
            {isFullWidth && (
              <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                Full Width
              </span>
            )}
          </h3>
        </div>
      )}

      {renderVariant()}
    </div>
  );
}

// Description Component with Enhanced Variations
export function Description({
  component,
  product,
  settings,
  onUpdateSettings,
  onUpdateSpan,
  isFullWidth = false,
  isPreviewMode = false,
  COMPONENT_SPANS,
}: {
  component: any;
  product: any;
  settings: any;
  onUpdateSettings: any;
  onUpdateSpan: any;
  isFullWidth?: boolean;
  isPreviewMode?: boolean;
  COMPONENT_SPANS: any;
}) {
  const descriptionSettings = {
    ...{
      showVideo: true,
      showImages: true,
      span: component.span || 1,
      variant: "layout",
    },
    ...settings[component.id],
    variant: component.variant || settings[component.id]?.variant || "layout",
  };

  const extractVideoId = (url: string) => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : url;
  };

  // Enhanced dummy data structure with more comprehensive content
  const dummyDescriptionData = {
    description: `
      <div>
        <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #1f2937;">Premium Quality Craftsmanship</h2>
        <p style="margin-bottom: 16px; line-height: 1.6; color: #374151;">
          Experience the perfect blend of innovation and style with our premium product. Carefully crafted with attention to detail, 
          this item represents the pinnacle of quality and design excellence.
        </p>
        <p style="margin-bottom: 16px; line-height: 1.6; color: #374151;">
          Our team of expert craftsmen has spent countless hours perfecting every aspect of this product, ensuring that it not only 
          meets but exceeds the highest standards of quality and performance.
        </p>
        <h3 style="font-size: 20px; font-weight: 600; margin: 24px 0 12px 0; color: #1f2937;">Key Features:</h3>
        <ul style="margin-bottom: 16px; padding-left: 20px; color: #374151;">
          <li style="margin-bottom: 8px;">Premium materials sourced from the finest suppliers</li>
          <li style="margin-bottom: 8px;">Advanced engineering for optimal performance</li>
          <li style="margin-bottom: 8px;">Sleek and modern design that complements any style</li>
          <li style="margin-bottom: 8px;">Environmentally conscious manufacturing process</li>
        </ul>
        <p style="margin-bottom: 16px; line-height: 1.6; color: #374151;">
          Whether you're a professional looking for reliable performance or someone who appreciates fine craftsmanship, 
          this product delivers an exceptional experience that will exceed your expectations.
        </p>
      </div>
    `,
    descriptionVideo: "https://www.youtube.com/watch?v=9bZkp7q19f0", // Demo video (Gangnam Style for demo purposes)
    descriptionImages: [
      {
        url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop",
        alt: "Product main view",
      },
      {
        url: "https://images.unsplash.com/photo-1506629905685-74283b375c04?w=600&h=600&fit=crop",
        alt: "Product detail view",
      },
      {
        url: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=600&fit=crop",
        alt: "Product in use",
      },
      {
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
        alt: "Product close-up",
      },
      {
        url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop",
        alt: "Product lifestyle",
      },
      {
        url: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&h=600&fit=crop",
        alt: "Product features",
      },
    ],
  };

  // Use product data if available, otherwise fallback to dummy data
  const data = product && product.description ? product : dummyDescriptionData;

  // Layout Variant - Two-column layout with description and media
  const renderLayoutVariant = () => (
    <div className="py-10 lg:py-20 px-4">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column */}
        <div className="flex flex-col space-y-6 flex-1">
          {/* Description Text */}
          <div className="sticky top-10">
            <h1 className="text-[50px] leading-[6vh] lg:leading-[18vh] lg:text-[130px] text-black bebas mb-4 md:mb-0">
              DESCRIPTION
            </h1>
            <div
              className="text-black relative poppins-medium leading-tight text-lg ml-auto mb-8"
              dangerouslySetInnerHTML={{ __html: data?.description }}
            />

            {/* Large Square Video/Image */}
            <div className="rounded-lg w-full h-[350px] max-h-[400px] overflow-hidden">
              {descriptionSettings.showVideo && data?.descriptionVideo ? (
                <div className="rounded-lg w-full h-[350px] max-h-[400px] overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${extractVideoId(
                      data.descriptionVideo
                    )}`}
                    allowFullScreen
                    className="w-full h-full object-cover rounded-lg"
                    style={{ border: 0 }}
                    title="Description Video"
                  />
                </div>
              ) : (
                <div
                  className="w-full h-full bg-gray-200 rounded-lg"
                  style={{
                    backgroundImage: data?.descriptionImages?.[0]?.url
                      ? `url(${data.descriptionImages[0].url})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                ></div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        {descriptionSettings.showImages && (
          <div className="flex flex-col flex-1 gap-4">
            {/* Top Row - Two Small Squares */}
            <div
              className="rounded-lg flex-1 aspect-square"
              style={{
                backgroundImage: `url(${
                  data?.descriptionImages?.[0]?.url ||
                  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop"
                })`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            ></div>
            <div className="flex gap-4">
              <div className="flex flex-col gap-4 flex-1">
                {data.descriptionImages
                  ?.slice(1)
                  .map((image: any, index: number) => (
                    <div
                      key={index}
                      className="bg-gray-400 rounded-lg flex-1 aspect-square"
                      style={{
                        backgroundImage: `url(${image.url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    ></div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Compact Variant - Single column minimal layout
  const renderCompactVariant = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Product Description
        </h2>
        <div
          className="text-gray-600 max-w-3xl mx-auto leading-relaxed"
          dangerouslySetInnerHTML={{ __html: data?.description }}
        />
      </div>

      {descriptionSettings.showVideo && data?.descriptionVideo && (
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl overflow-hidden aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${extractVideoId(
                data.descriptionVideo
              )}`}
              allowFullScreen
              className="w-full h-full"
              style={{ border: 0 }}
              title="Description Video"
            />
          </div>
        </div>
      )}

      {descriptionSettings.showImages && data?.descriptionImages && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {data.descriptionImages.map((image: any, index: number) => (
            <div
              key={index}
              className="aspect-square rounded-lg overflow-hidden"
              style={{
                backgroundImage: `url(${image.url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            ></div>
          ))}
        </div>
      )}
    </div>
  );

  // Showcase Variant - Full-width media showcase
  const renderShowcaseVariant = () => (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-6xl lg:text-8xl font-bold text-black mb-6">
          DESCRIPTION
        </h1>
        <div
          className="text-gray-800 text-xl max-w-4xl mx-auto leading-relaxed"
          dangerouslySetInnerHTML={{ __html: data?.description }}
        />
      </div>

      {descriptionSettings.showVideo && data?.descriptionVideo && (
        <div className="w-full">
          <div className="rounded-2xl overflow-hidden aspect-video max-w-6xl mx-auto">
            <iframe
              src={`https://www.youtube.com/embed/${extractVideoId(
                data.descriptionVideo
              )}`}
              allowFullScreen
              className="w-full h-full"
              style={{ border: 0 }}
              title="Description Video"
            />
          </div>
        </div>
      )}

      {descriptionSettings.showImages && data?.descriptionImages && (
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.descriptionImages.map((image: any, index: number) => (
              <div
                key={index}
                className="aspect-square rounded-xl overflow-hidden shadow-lg"
                style={{
                  backgroundImage: `url(${image.url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderVariant = () => {
    switch (descriptionSettings.variant) {
      case "compact":
        return renderCompactVariant();
      case "showcase":
        return renderShowcaseVariant();
      default:
        return renderLayoutVariant();
    }
  };

  return (
    <div
      className={`${
        isPreviewMode
          ? "bg-transparent"
          : "bg-white rounded-2xl shadow-xl border border-gray-100"
      } ${isPreviewMode ? "" : "p-6 mb-4"} ${isFullWidth ? "w-full" : ""}`}
    >
      {!isPreviewMode && (
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold flex items-center gap-3 text-gray-900">
            <div className="p-2 bg-purple-100 rounded-xl">
              <FileText size={20} className="text-purple-600" />
            </div>
            Description
            {isFullWidth && (
              <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                Full Width
              </span>
            )}
          </h3>
        </div>
      )}

      {renderVariant()}
    </div>
  );
}

// Coupons Component with Enhanced Variations
export function Coupons({
  component,
  product,
  settings,
  onUpdateSettings,
  onUpdateSpan,
  isFullWidth = false,
  isPreviewMode = false,
  COMPONENT_SPANS,
}: {
  component: any;
  product: any;
  settings: any;
  onUpdateSettings: any;
  onUpdateSpan: any;
  isFullWidth?: boolean;
  isPreviewMode?: boolean;
  COMPONENT_SPANS: any;
}) {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [selectedCoupon, setSelectedCoupon] = React.useState(null);

  const couponSettings = {
    ...{
      itemsPerView: 2,
      showSelection: true,
      span: component.span || 1,
      variant: "slider",
    },
    ...settings[component.id],
    variant: component.variant || settings[component.id]?.variant || "slider",
  };

  // Dummy coupon data
  const dummyCoupons = [
    {
      _id: "1",
      code: "SAVE20",
      type: "percent",
      value: 20,
      description: "Get 20% off on your order",
      minCartValue: 500,
    },
    {
      _id: "2",
      code: "FLAT100",
      type: "flat",
      value: 100,
      description: "Flat ₹100 off on orders above ₹1000",
      minCartValue: 1000,
    },
    {
      _id: "3",
      code: "WELCOME15",
      type: "percent",
      value: 15,
      description: "Welcome offer for new customers",
      minCartValue: 300,
    },
    {
      _id: "4",
      code: "MEGA50",
      type: "flat",
      value: 50,
      description: "Mega sale offer",
      minCartValue: 750,
    },
  ];

  const coupons = product?.coupons?.length > 0 ? product.coupons : dummyCoupons;
  const itemsPerView = couponSettings.itemsPerView;
  const maxSlides = Math.max(0, (coupons?.length || 0) - itemsPerView);

  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, maxSlides));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const handleSelectCoupon = (coupon: any) => {
    if (selectedCoupon?._id === coupon._id) {
      setSelectedCoupon(null);
    } else {
      setSelectedCoupon(coupon);
    }
  };

  // Slider Variant - Interactive coupon slider with selection
  const renderSliderVariant = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          🎉 Available Offers
        </h3>
        <p className="text-gray-600">
          Choose from our exclusive discount coupons
        </p>
      </div>

      <div className="relative">
        <div className="flex relative items-center gap-3">
          {/* Left Arrow */}
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={`w-8 h-8 left-0 top-1/2 translate-y-[-50%] absolute z-30 rounded-full border-2 flex items-center justify-center transition-all ${
              currentSlide === 0
                ? "border-gray-200 bg-white text-gray-300 cursor-not-allowed"
                : "border text-green-600 hover:bg-green-50"
            }`}
          >
            <ChevronLeft size={16} />
          </button>

          {/* Coupon Container */}
          <div className="flex-1 overflow-hidden">
            <div
              className="flex gap-3 transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${
                  currentSlide * (100 / itemsPerView)
                }%)`,
              }}
            >
              {coupons.map((coupon: any) => {
                // Assign color and textColor based on type
                let color = "bg-gradient-to-r from-green-500 to-teal-500";
                let textColor = "text-white";
                if (coupon.type === "percent")
                  color = "bg-gradient-to-r from-blue-500 to-cyan-500";
                if (coupon.type === "flat")
                  color = "bg-gradient-to-r from-orange-500 to-red-500";

                const discount =
                  coupon.type === "percent"
                    ? `${coupon.value}% OFF`
                    : `₹${coupon.value} OFF`;

                return (
                  <div
                    key={coupon._id}
                    className={`flex-shrink-0 w-1/2 relative cursor-pointer transition-all duration-300 ${
                      selectedCoupon?._id === coupon._id
                        ? "scale-105"
                        : "hover:scale-102"
                    }`}
                    onClick={() => handleSelectCoupon(coupon)}
                  >
                    <div
                      className={`${color} rounded-lg p-4 relative overflow-hidden`}
                    >
                      {/* Decorative pattern */}
                      <div className="absolute top-0 right-0 w-16 h-16 opacity-20">
                        <Gift size={64} className="transform rotate-12" />
                      </div>

                      {/* Selection indicator */}
                      {selectedCoupon?._id === coupon._id && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                      )}

                      <div className={`${textColor} relative z-10`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Tag size={16} />
                          <span className="font-bold text-sm">
                            {coupon.code}
                          </span>
                        </div>
                        <div className="font-bold text-lg mb-1">{discount}</div>
                        <div className="text-xs opacity-90 mb-1">
                          {coupon.description || ""}
                        </div>
                        <div className="text-xs opacity-75">
                          Min order: ₹{coupon.minCartValue || 0}
                        </div>
                      </div>

                      {/* Border for selected coupon */}
                      {selectedCoupon?._id === coupon._id && (
                        <div className="absolute inset-0 border-3 border-white rounded-lg"></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={nextSlide}
            disabled={currentSlide >= maxSlides}
            className={`w-8 h-8 absolute right-0 top-1/2 translate-y-[-50%] z-30 rounded-full border-2 flex items-center justify-center transition-all ${
              currentSlide >= maxSlides
                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                : "border text-green-600 hover:bg-green-50"
            }`}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Selected Coupon Display */}
        {selectedCoupon && couponSettings.showSelection && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">
                  Coupon {selectedCoupon.code} selected -{" "}
                  {selectedCoupon.type === "percent"
                    ? `${selectedCoupon.value}% OFF`
                    : `₹${selectedCoupon.value} OFF`}
                </span>
              </div>
              <button
                onClick={() => setSelectedCoupon(null)}
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Slide indicators */}
        <div className="flex justify-center gap-1 mt-3">
          {Array.from({ length: maxSlides + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentSlide === index ? "bg-green-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );

  // Grid Variant - Grid layout of available coupons
  const renderGridVariant = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          💳 Discount Coupons
        </h3>
        <p className="text-gray-600">Save more with our exclusive offers</p>
      </div>

      <div
        className={`grid ${isFullWidth ? "grid-cols-4" : "grid-cols-2"} gap-4`}
      >
        {coupons.map((coupon: any) => {
          let color = "bg-gradient-to-r from-green-500 to-teal-500";
          if (coupon.type === "percent")
            color = "bg-gradient-to-r from-blue-500 to-cyan-500";
          if (coupon.type === "flat")
            color = "bg-gradient-to-r from-orange-500 to-red-500";

          const discount =
            coupon.type === "percent"
              ? `${coupon.value}% OFF`
              : `₹${coupon.value} OFF`;

          return (
            <div
              key={coupon._id}
              className={`relative cursor-pointer transition-all duration-300 hover:scale-105 ${
                selectedCoupon?._id === coupon._id
                  ? "scale-105 ring-2 ring-green-400"
                  : ""
              }`}
              onClick={() => handleSelectCoupon(coupon)}
            >
              <div
                className={`${color} rounded-xl p-5 relative overflow-hidden text-white`}
              >
                <div className="absolute top-0 right-0 w-12 h-12 opacity-20">
                  <Gift size={48} className="transform rotate-12" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag size={14} />
                    <span className="font-bold text-sm">{coupon.code}</span>
                  </div>
                  <div className="font-bold text-xl mb-2">{discount}</div>
                  <div className="text-xs opacity-90 mb-2">
                    {coupon.description}
                  </div>
                  <div className="text-xs opacity-75">
                    Min: ₹{coupon.minCartValue}
                  </div>
                </div>

                {selectedCoupon?._id === coupon._id && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <Check size={12} className="text-green-600" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedCoupon && couponSettings.showSelection && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="text-center">
            <h4 className="font-semibold text-green-800 mb-1">
              Selected Coupon
            </h4>
            <p className="text-green-700">
              {selectedCoupon.code} -{" "}
              {selectedCoupon.type === "percent"
                ? `${selectedCoupon.value}% OFF`
                : `₹${selectedCoupon.value} OFF`}
            </p>
            <button
              onClick={() => setSelectedCoupon(null)}
              className="mt-2 text-sm text-green-600 hover:text-green-800 font-medium"
            >
              Remove Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Compact Variant - Minimal coupon display
  const renderCompactVariant = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-100 rounded-xl">
          <Gift size={20} className="text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Available Offers</h3>
          <p className="text-sm text-gray-600">
            {coupons.length} coupons available
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {coupons.slice(0, 3).map((coupon: any, idx: number) => {
          const discount =
            coupon.type === "percent"
              ? `${coupon.value}% OFF`
              : `₹${coupon.value} OFF`;

          return (
            <div
              key={coupon._id}
              className={`flex items-center justify-between p-3 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                selectedCoupon?._id === coupon._id
                  ? "border-green-400 bg-green-50"
                  : "border-gray-300 hover:border-green-300"
              }`}
              onClick={() => handleSelectCoupon(coupon)}
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <span className="font-semibold text-gray-900">
                    {coupon.code}
                  </span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="font-medium text-green-600">{discount}</span>
                </div>
              </div>
              {selectedCoupon?._id === coupon._id && (
                <Check size={16} className="text-green-600" />
              )}
            </div>
          );
        })}
      </div>

      {selectedCoupon && (
        <div className="mt-3 text-center text-sm text-green-700 font-medium">
          ✓ {selectedCoupon.code} applied
        </div>
      )}
    </div>
  );

  const renderVariant = () => {
    switch (couponSettings.variant) {
      case "grid":
        return renderGridVariant();
      case "compact":
        return renderCompactVariant();
      default:
        return renderSliderVariant();
    }
  };

  return (
    <div
      className={`${
        isPreviewMode
          ? "bg-transparent"
          : "bg-white rounded-2xl shadow-xl border border-gray-100"
      } ${isPreviewMode ? "" : "p-6 mb-4"} ${isFullWidth ? "w-full" : ""}`}
    >
      {!isPreviewMode && (
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold flex items-center gap-3 text-gray-900">
            <div className="p-2 bg-green-100 rounded-xl">
              <Gift size={20} className="text-green-600" />
            </div>
            Discount Coupons
            {isFullWidth && (
              <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                Full Width
              </span>
            )}
          </h3>
        </div>
      )}

      {renderVariant()}
    </div>
  );
}

// FrequentlyPurchased Component with Enhanced Variations
export function FrequentlyPurchased({
  component,
  product,
  settings,
  onUpdateSettings,
  onUpdateSpan,
  isFullWidth = false,
  isPreviewMode = false,
  COMPONENT_SPANS,
}: {
  component: any;
  product: any;
  settings: any;
  onUpdateSettings: any;
  onUpdateSpan: any;
  isFullWidth?: boolean;
  isPreviewMode?: boolean;
  COMPONENT_SPANS: any;
}) {
  const frequentlyPurchasedSettings = {
    ...{
      showRating: true,
      maxProducts: 4,
      layout: "slider",
      span: component.span || 1,
      variant: "slider",
    },
    ...settings[component.id],
    variant: component.variant || settings[component.id]?.variant || "slider",
  };

  // Sample products data
  const products = [
    {
      id: 1,
      name: "Glamorous Garnets",
      rating: 5,
      reviews: 238,
      price: 563,
      outOfStock: false,
      image:
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop",
    },
    {
      id: 2,
      name: "Luxury Limelight",
      rating: 4,
      reviews: 839,
      price: 238,
      outOfStock: true,
      image:
        "https://images.unsplash.com/photo-1506629905685-74283b375c04?w=300&h=300&fit=crop",
    },
    {
      id: 3,
      name: "Sumptuous Splendor",
      rating: 4,
      reviews: 435,
      price: 183,
      outOfStock: false,
      image:
        "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=300&h=300&fit=crop",
    },
    {
      id: 4,
      name: "Enchanting Ensembles",
      rating: 5,
      reviews: 954,
      price: 39,
      outOfStock: false,
      image:
        "https://images.unsplash.com/photo-1596944924591-6f69e091d83c?w=300&h=300&fit=crop",
    },
    {
      id: 5,
      name: "Premium Collection",
      rating: 5,
      reviews: 1247,
      price: 899,
      outOfStock: false,
      image:
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop",
    },
  ];

  const scrollLeft = () => {
    const container = document.getElementById("products-slider");
    if (container) {
      container.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById("products-slider");
    if (container) {
      container.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const StarRating = ({
    rating,
    reviews,
  }: {
    rating: number;
    reviews: number;
  }) => (
    <div className="flex items-center gap-1 mb-2">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={12}
            className={`${
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500 ml-1">{reviews} Reviews</span>
    </div>
  );

  // Slider Variant - Horizontal scrolling product slider
  const renderSliderVariant = () => (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
          FREQUENTLY PURCHASED
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Discover products that our customers love and frequently buy together.
          These handpicked items complement your selection perfectly.
        </p>
      </div>

      {/* Products Slider */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
        >
          <ChevronRight className="w-6 h-6 text-gray-600" />
        </button>

        <div
          id="products-slider"
          className="overflow-x-auto scrollbar-hide px-12"
        >
          <div className="flex gap-6 pb-4">
            {products
              .slice(0, frequentlyPurchasedSettings.maxProducts)
              .map((product) => (
                <div
                  key={product.id}
                  className="bg-white flex-shrink-0 w-64 p-4 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                >
                  {/* Product Image */}
                  <div className="relative rounded-xl overflow-hidden aspect-square mb-4 bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Heart Icon */}
                    <div className="absolute top-3 right-3">
                      <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors cursor-pointer">
                        <Heart className="w-4 h-4 text-gray-500 hover:text-red-500 transition-colors" />
                      </div>
                    </div>

                    {/* Out of Stock Badge */}
                    {product.outOfStock && (
                      <div className="absolute top-3 left-3">
                        <div className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                          OUT OF STOCK
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 leading-tight">
                      {product.name}
                    </h3>
                    <StarRating
                      rating={product.rating}
                      reviews={product.reviews}
                    />
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-bold text-gray-900">
                        ${product.price}
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Grid Variant - Clean grid layout
  const renderGridVariant = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium mb-4">
          <ShoppingCart size={16} />
          Frequently Purchased Together
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Complete Your Collection
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          These products are often bought together by our customers
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products
          .slice(0, frequentlyPurchasedSettings.maxProducts)
          .map((product) => (
            <div key={product.id} className="group">
              <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:border-blue-200">
                {/* Product Image */}
                <div className="relative rounded-xl overflow-hidden aspect-square mb-4 bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Quick Actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Heart className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>

                  {product.outOfStock && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2">
                    {product.name}
                  </h3>

                  {frequentlyPurchasedSettings.showRating && (
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            className={`${
                              i < product.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        ({product.reviews})
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">
                      ${product.price}
                    </span>
                    <button
                      disabled={product.outOfStock}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    >
                      {product.outOfStock ? "Unavailable" : "Add"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* View More */}
      <div className="text-center">
        <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-medium transition-colors">
          View All Products
        </button>
      </div>
    </div>
  );

  // Carousel Variant - Interactive carousel with controls
  const renderCarouselVariant = () => (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            You might also like
          </h2>
          <p className="text-gray-600">Based on your browsing history</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={scrollLeft}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={scrollRight}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative">
        <div id="products-slider" className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 pb-4">
            {products.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-48">
                <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  {/* Compact Image */}
                  <div className="relative rounded-lg overflow-hidden aspect-square mb-3 bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />

                    {product.outOfStock && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Compact Info */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            className={`${
                              i < product.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        ({product.reviews})
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 text-sm">
                        ${product.price}
                      </span>
                      <button
                        disabled={product.outOfStock}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                      >
                        {product.outOfStock ? "N/A" : "+"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Indicators */}
      <div className="flex items-center justify-center gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-2 h-2 bg-gray-300 rounded-full"></div>
        ))}
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="w-2 h-2 bg-gray-300 rounded-full"></div>
        ))}
      </div>
    </div>
  );

  const renderVariant = () => {
    switch (frequentlyPurchasedSettings.variant) {
      case "grid":
        return renderGridVariant();
      case "carousel":
        return renderCarouselVariant();
      default:
        return renderSliderVariant();
    }
  };

  return (
    <div
      className={`${
        isPreviewMode
          ? "bg-transparent"
          : "bg-white rounded-2xl shadow-xl border border-gray-100"
      } ${isPreviewMode ? "" : "p-6 mb-4"} ${isFullWidth ? "w-full" : ""}`}
    >
      {!isPreviewMode && (
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold flex items-center gap-3 text-gray-900">
            <div className="p-2 bg-orange-100 rounded-xl">
              <ShoppingCart size={20} className="text-orange-600" />
            </div>
            Frequently Purchased
            {isFullWidth && (
              <span className="text-xs bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-medium">
                Full Width
              </span>
            )}
          </h3>
        </div>
      )}

      {renderVariant()}
    </div>
  );
}

// Ingredients Component with Enhanced Variations
export function Ingredients({
  component,
  product,
  settings,
  onUpdateSettings,
  onUpdateSpan,
  isFullWidth = false,
  isPreviewMode = false,
  COMPONENT_SPANS,
}: {
  component: any;
  product: any;
  settings: any;
  onUpdateSettings: any;
  onUpdateSpan: any;
  isFullWidth?: boolean;
  isPreviewMode?: boolean;
  COMPONENT_SPANS: any;
}) {
  const [activeIngredient, setActiveIngredient] = React.useState(0);
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const ingredientsRef = React.useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const ingredientSettings = {
    ...{
      showImages: true,
      showDetails: true,
      span: component.span || 1,
      variant: "scrolling",
    },
    ...settings[component.id],
    variant:
      component.variant || settings[component.id]?.variant || "scrolling",
  };

  // Sample ingredients data - replace with your actual data structure
  const ingredients = product?.ingredients || [
    {
      id: 1,
      name: "Fresh Tomatoes",
      description:
        "Vine-ripened tomatoes, carefully selected for their rich flavor and vibrant color. These premium tomatoes form the base of our signature sauce.",
      image:
        "https://images.unsplash.com/photo-1546470427-e26264be0b91?w=400&h=400&fit=crop",
      details: "Organic, locally sourced",
    },
    {
      id: 2,
      name: "Extra Virgin Olive Oil",
      description:
        "Cold-pressed olive oil from Mediterranean groves, providing a smooth, fruity flavor that enhances every dish with its golden richness.",
      image:
        "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop",
      details: "First cold press, Mediterranean origin",
    },
    {
      id: 3,
      name: "Fresh Basil",
      description:
        "Hand-picked basil leaves with their distinctive aroma and peppery flavor. This herb adds the perfect aromatic finish to our creations.",
      image:
        "https://images.unsplash.com/photo-1618375569909-3c8616cf598e?w=400&h=400&fit=crop",
      details: "Locally grown, pesticide-free",
    },
    {
      id: 4,
      name: "Sea Salt",
      description:
        "Pure sea salt harvested from pristine coastal waters, providing the perfect mineral balance to enhance natural flavors.",
      image:
        "https://images.unsplash.com/photo-1502819126416-e54b65efb8be?w=400&h=400&fit=crop",
      details: "Unrefined, mineral-rich",
    },
    {
      id: 5,
      name: "Garlic",
      description:
        "Fresh garlic cloves with their pungent, savory flavor that forms the aromatic foundation of countless culinary masterpieces.",
      image:
        "https://images.unsplash.com/photo-1553978297-833d24758027?w=400&h=400&fit=crop",
      details: "Farm fresh, hand-selected",
    },
    {
      id: 6,
      name: "Black Pepper",
      description:
        "Freshly ground black peppercorns that deliver a sharp, piney fragrance and a characteristic heat that awakens the palate.",
      image:
        "https://images.unsplash.com/photo-1506629905056-7199b18204d8?w=400&h=400&fit=crop",
      details: "Whole peppercorns, freshly ground",
    },
  ];

  React.useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const containerTop = containerRef.current.offsetTop;
      const containerHeight = containerRef.current.offsetHeight;
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;

      // Check if we're in the ingredients section
      if (
        scrollPosition + windowHeight > containerTop &&
        scrollPosition < containerTop + containerHeight
      ) {
        ingredientsRef.current.forEach((ref, index) => {
          if (ref) {
            const rect = ref.getBoundingClientRect();
            const isInViewport =
              rect.top < windowHeight * 0.6 && rect.bottom > windowHeight * 0.4;

            if (isInViewport && activeIngredient !== index) {
              setActiveIngredient(index);
            }
          }
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeIngredient]);

  // Scrolling Variant - Interactive scroll-based showcase
  const renderScrollingVariant = () => (
    <div ref={containerRef} className="py-10 lg:py-20 px-4">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Scrolling Ingredients */}
        <div className="flex flex-col space-y-8 flex-1">
          {/* Title */}
          <div className="bg-white pb-4">
            <h1 className="text-[50px] leading-[6vh] lg:leading-[18vh] lg:text-[130px] text-black font-bold mb-4 md:mb-0">
              INGREDIENTS
            </h1>
          </div>

          {/* Ingredients List */}
          <div className="space-y-12">
            {ingredients.map((ingredient: any, index: number) => (
              <div
                key={ingredient.id}
                ref={(el) => {
                  ingredientsRef.current[index] = el;
                }}
                className={`transition-all duration-500 ${
                  activeIngredient === index
                    ? "opacity-100 transform translate-x-0"
                    : "opacity-70 transform translate-x-2"
                }`}
              >
                {/* Ingredient Number */}
                <div className="flex items-start gap-6 mb-4">
                  <span className="text-6xl font-bold text-gray-300 leading-none">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-black mb-2">
                      {ingredient.name}
                    </h3>
                    <p className="text-sm text-gray-600 font-medium mb-2">
                      {ingredient.details}
                    </p>
                  </div>
                </div>

                {/* Ingredient Description */}
                <div className="ml-20">
                  <p className="text-black font-medium leading-tight text-lg">
                    {ingredient.description}
                  </p>
                </div>

                {/* Mobile Image (visible only on mobile) */}
                <div className="lg:hidden mt-6 rounded-lg w-full h-[250px] overflow-hidden">
                  <img
                    src={ingredient.image}
                    alt={ingredient.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {/* Divider */}
                {index < ingredients.length - 1 && (
                  <div className="mt-12 h-px bg-gray-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Sticky Image */}
        <div className="hidden lg:flex flex-col flex-1">
          <div className="sticky top-32">
            {/* Active Ingredient Image */}
            <div className="relative">
              <div className="rounded-lg w-full h-[500px] overflow-hidden shadow-lg">
                <img
                  src={ingredients[activeIngredient]?.image}
                  alt={ingredients[activeIngredient]?.name}
                  className="w-full h-full object-cover rounded-lg transition-all duration-700 ease-in-out transform"
                  style={{
                    filter: "brightness(0.95) contrast(1.05)",
                  }}
                />
              </div>

              {/* Image Overlay Info */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="text-xl font-bold text-black mb-1">
                    {ingredients[activeIngredient]?.name}
                  </h4>
                  <p className="text-sm text-gray-700 font-medium">
                    {ingredients[activeIngredient]?.details}
                  </p>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="absolute top-6 right-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-sm font-bold text-black">
                    {activeIngredient + 1} / {ingredients.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Ingredient Dots Navigation */}
            <div className="flex justify-center mt-6 space-x-2">
              {ingredients.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setActiveIngredient(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    activeIngredient === index
                      ? "bg-black scale-125"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Grid Variant - Grid layout with ingredient cards
  const renderGridVariant = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl lg:text-6xl font-bold text-black mb-4">
          PREMIUM INGREDIENTS
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Each ingredient is carefully selected for its quality and flavor
          profile
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ingredients.map((ingredient: any, index: number) => (
          <div
            key={ingredient.id}
            className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={ingredient.image}
                alt={ingredient.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-black text-white text-sm font-bold px-3 py-1 rounded-full">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-black mb-2">
                {ingredient.name}
              </h3>
              <p className="text-sm text-blue-600 font-medium mb-3">
                {ingredient.details}
              </p>
              <p className="text-gray-700 text-sm leading-relaxed">
                {ingredient.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Carousel Variant - Horizontal carousel of ingredients
  const renderCarouselVariant = () => {
    const itemsPerView = 3;
    const maxSlide = Math.max(0, ingredients.length - itemsPerView);

    const nextSlide = () => {
      setCurrentSlide((prev) => Math.min(prev + 1, maxSlide));
    };

    const prevSlide = () => {
      setCurrentSlide((prev) => Math.max(prev - 1, 0));
    };

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl lg:text-5xl font-bold text-black mb-2">
              INGREDIENTS
            </h2>
            <p className="text-gray-600">Discover our premium selection</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="p-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-full transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              disabled={currentSlide === maxSlide}
              className="p-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-full transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out gap-6"
            style={{
              transform: `translateX(-${currentSlide * (100 / itemsPerView)}%)`,
            }}
          >
            {ingredients.map((ingredient: any, index: number) => (
              <div
                key={ingredient.id}
                className="flex-shrink-0 bg-white rounded-2xl overflow-hidden shadow-lg"
                style={{ width: `calc(${100 / itemsPerView}% - 1rem)` }}
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={ingredient.image}
                    alt={ingredient.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-white text-black text-xs font-bold px-2 py-1 rounded">
                      #{index + 1}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-black mb-1">
                    {ingredient.name}
                  </h3>
                  <p className="text-xs text-blue-600 font-medium mb-2">
                    {ingredient.details}
                  </p>
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                    {ingredient.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: maxSlide + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentSlide === index ? "bg-black" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderVariant = () => {
    switch (ingredientSettings.variant) {
      case "grid":
        return renderGridVariant();
      case "carousel":
        return renderCarouselVariant();
      default:
        return renderScrollingVariant();
    }
  };

  return (
    <div
      className={`${
        isPreviewMode
          ? "bg-transparent"
          : "bg-white rounded-2xl shadow-xl border border-gray-100"
      } ${isPreviewMode ? "" : "p-6 mb-4"} ${isFullWidth ? "w-full" : ""}`}
    >
      {!isPreviewMode && (
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold flex items-center gap-3 text-gray-900">
            <div className="p-2 bg-green-100 rounded-xl">
              <BookOpen size={20} className="text-green-600" />
            </div>
            Ingredients
            {isFullWidth && (
              <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                Full Width
              </span>
            )}
          </h3>
        </div>
      )}

      {renderVariant()}
    </div>
  );
}

// How To Use Component with Enhanced Variations
export function HowToUse({
  component,
  product,
  settings,
  onUpdateSettings,
  onUpdateSpan,
  isFullWidth = false,
  isPreviewMode = false,
  COMPONENT_SPANS,
}: {
  component: any;
  product: any;
  settings: any;
  onUpdateSettings: any;
  onUpdateSpan: any;
  isFullWidth?: boolean;
  isPreviewMode?: boolean;
  COMPONENT_SPANS: any;
}) {
  const howToUseSettings = {
    ...{
      showVideo: true,
      showSteps: true,
      span: component.span || 1,
      variant: "standard",
    },
    ...settings[component.id],
    variant: component.variant || settings[component.id]?.variant || "standard",
  };

  const extractVideoId = (url: string) => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : url;
  };

  // Dummy data for How To Use
  const dummyHowToUseData = {
    howToUseVideo: "https://www.youtube.com/watch?v=9bZkp7q19f0",
    howToUseSteps: [
      {
        number: "01",
        title: "Get Started",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
      },
      {
        number: "02",
        title: "Configure Settings",
        description:
          "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.",
      },
      {
        number: "03",
        title: "Launch & Monitor",
        description:
          "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      },
      {
        number: "04",
        title: "Optimize Results",
        description:
          "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim.",
      },
    ],
  };

  // Use product data if available, otherwise fallback to dummy data
  const data =
    product && (product.howToUseVideo || product.howToUseSteps)
      ? product
      : dummyHowToUseData;

  // Standard Variant - Original design with video and steps
  const renderStandardVariant = () => (
    <div className="py-10 lg:py-20 px-4">
      <div className="max-w-full mx-auto">
        {/* Heading */}
        <div className="text-start mb-16">
          <h2 className="text-[50px] leading-[6vh] lg:leading-[18vh] lg:text-[130px] text-black bebas mb-4 md:mb-0">
            HOW TO USE
          </h2>
          <p className="text-black max-w-xl relative poppins-medium leading-tight text-lg mb-8">
            Lorem ipsum dolor sit amet,{" "}
            <span className="text font-semibold">consectetur</span> eiusmod
            tempor incididunt ut labore et dolor magna aliquaLorem ipsum dolor
            sit amet, consectetur.
          </p>
        </div>

        {/* Video and Steps Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {howToUseSettings.showVideo && data?.howToUseVideo && (
            <div className="relative h-full">
              <div className="aspect-video sticky top-10 bg-gray-900/5 rounded-2xl overflow-hidden shadow-2xl">
                <iframe
                  src={`https://www.youtube.com/embed/${extractVideoId(
                    data.howToUseVideo
                  )}`}
                  allowFullScreen
                  className="w-full h-full object-cover rounded-lg"
                  style={{ border: 0 }}
                  title="How To Use Video"
                  onError={(e) => console.error("Iframe error:", e)}
                />
              </div>
            </div>
          )}
          {howToUseSettings.showSteps && (
            <div className="space-y-8">
              {data?.howToUseSteps?.map((step: any, index: number) => (
                <div key={index} className="flex gap-6 group">
                  {/* Step Number */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bebas bg-black text-white rounded-full flex items-center justify-center font-black text-lg group-hover:bg-gray-800 transition-colors duration-300">
                      {step.number || `0${index + 1}`}
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 pt-2">
                    <h3 className="text-2xl font-bold poppins text-black mb-2 group-hover:text-gray-700 transition-colors duration-300">
                      {step.title}
                    </h3>
                    <div
                      className="text-gray-600 poppins text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: step.description }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Minimal Variant - Clean layout with numbered steps
  const renderMinimalVariant = () => (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-black mb-4">How To Use</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Follow these simple steps to get the most out of your product
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {howToUseSettings.showVideo && data?.howToUseVideo && (
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${extractVideoId(
                  data.howToUseVideo
                )}`}
                allowFullScreen
                className="w-full h-full"
                style={{ border: 0 }}
                title="How To Use Video"
              />
            </div>
          )}
          {howToUseSettings.showSteps && (
            <div className="space-y-6">
              {data?.howToUseSteps?.map((step: any, index: number) => (
                <div key={index} className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h4>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Detailed Variant - Enhanced layout with rich descriptions
  const renderDetailedVariant = () => (
    <div className="py-12 px-4 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-black mb-6">
            Complete Usage Guide
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Master your product with our comprehensive step-by-step tutorial and
            video guide
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {howToUseSettings.showVideo && data?.howToUseVideo && (
            <div className="lg:col-span-2">
              <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
                <iframe
                  src={`https://www.youtube.com/embed/${extractVideoId(
                    data.howToUseVideo
                  )}`}
                  allowFullScreen
                  className="w-full h-full"
                  style={{ border: 0 }}
                  title="How To Use Video"
                />
              </div>
              <p className="text-center text-gray-500 mt-4">
                📹 Watch our detailed video tutorial
              </p>
            </div>
          )}
          {howToUseSettings.showSteps && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Step by Step
              </h3>
              {data?.howToUseSteps?.map((step: any, index: number) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl flex items-center justify-center text-lg font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-3">
                        {step.title}
                      </h4>
                      <div
                        className="text-gray-600 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: step.description }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderVariant = () => {
    switch (howToUseSettings.variant) {
      case "minimal":
        return renderMinimalVariant();
      case "detailed":
        return renderDetailedVariant();
      default:
        return renderStandardVariant();
    }
  };

  return (
    <div
      className={`${
        isPreviewMode
          ? "bg-transparent"
          : "bg-white rounded-2xl shadow-xl border border-gray-100"
      } ${isPreviewMode ? "" : "p-6 mb-4"} ${isFullWidth ? "w-full" : ""}`}
    >
      {renderVariant()}
    </div>
  );
}

// Customer Reviews Component with Enhanced Variations
export function CustomerReviews({
  component,
  product,
  settings,
  onUpdateSettings,
  onUpdateSpan,
  isFullWidth = false,
  isPreviewMode = false,
  COMPONENT_SPANS,
}: {
  component: any;
  product: any;
  settings: any;
  onUpdateSettings: any;
  onUpdateSpan: any;
  isFullWidth?: boolean;
  isPreviewMode?: boolean;
  COMPONENT_SPANS: any;
}) {
  const reviewSettings = {
    ...{
      showRatingOverview: true,
      showReviewImages: true,
      maxReviews: 3,
      span: component.span || 1,
      variant: "cards",
    },
    ...settings[component.id],
    variant: component.variant || settings[component.id]?.variant || "cards",
  };

  // Dummy review data
  const dummyReviews = [
    {
      name: "Pablo Kahastoria",
      rating: 5,
      text: "The goods landed safely, arrived quickly, use instant delivery, the quality of the goods is okay and works well, the packing is safe and the delivery is fast, great, thank you.",
      likes: 10,
      dislikes: 16,
      comments: 14,
      verified: true,
    },
    {
      name: "Thomas Chan",
      rating: 5,
      text: "The goods landed safely, arrived quickly, use instant delivery, the quality of the goods is okay and works well, the packing is safe and the delivery is fast, great, thank you.",
      likes: 21,
      dislikes: 23,
      comments: 7,
      verified: true,
    },
    {
      name: "Samuel Drya",
      rating: 5,
      text: "The laptop package has arrived complete with charger, 2 mics, 1 headset. The laptop is really cool, good performance and sturdy, hope it lasts long. Thank you. Good luck with the sale",
      likes: 8,
      dislikes: 12,
      comments: 0,
      verified: true,
    },
  ];

  const reviews = product?.reviews || dummyReviews;

  const StarRating = ({
    filled,
    count,
  }: {
    filled: number;
    count?: number;
  }) => (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < filled ? "fill-green-500 text-green-500" : "text-gray-300"
            }`}
          />
        ))}
      </div>
      {count && <span className="text-xs text-gray-500">{count}</span>}
    </div>
  );

  // Cards Variant - Individual review cards with ratings
  const renderCardsVariant = () => (
    <div className="py-10 lg:py-20 px-4">
      <div className="flex justify-between flex-col md:flex-row gap-12">
        {/* Left Column */}
        <div className="max-w-2xl">
          <h1 className="text-[50px] leading-[6vh] lg:leading-[18vh] lg:text-[130px] text-black bebas mb-4 md:mb-0 ">
            PRODUCT REVIEW
          </h1>
          <p className="text-black relative max-w-sm poppins-medium leading-tight text-lg mb-8">
            Lorem ipsum dolor{" "}
            <span className="text font-semibold">consectetur</span> eiusmod
            tempor incididunt ut consectetur.
          </p>
        </div>

        {/* Right Column - Rating Overview */}
        {reviewSettings.showRatingOverview && (
          <div className="flex items-start justify-between max-w-sm w-full gap-8">
            {/* Rating Circle */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-green-500 flex items-center justify-center bg-white">
                <span className="text-2xl font-bold text-black">4.8</span>
              </div>
            </div>

            {/* Rating Bars */}
            <div className="flex-1 space-y-1">
              {[
                { stars: 5, percentage: 91 },
                { stars: 4, percentage: 7 },
                { stars: 3, percentage: 1.2 },
                { stars: 2, percentage: 0.5 },
                { stars: 1, percentage: 0.3 },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < item.stars
                            ? "fill-green-500 text-green-500"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        {reviews
          .slice(0, reviewSettings.maxReviews)
          .map((review: any, index: number) => (
            <div key={index} className="bg-white relative">
              {/* User Info */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
                  <div>
                    <div className="font-medium text-sm text-black">
                      {review.name}
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating
                              ? "fill-orange-400 text-orange-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {review.verified && (
                  <div className="w-[18px] h-[18px] bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              {/* Review Text */}
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                {review.text}
              </p>

              {/* Review Images */}
              {reviewSettings.showReviewImages && (
                <div className="flex gap-2 justify-between">
                  <div className="bg-gray-400 rounded h-24 w-full mb-4"></div>
                  <div className="bg-gray-400 rounded h-24 w-full mb-4"></div>
                  <div className="bg-gray-400 rounded h-24 w-full mb-4"></div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-6 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" />
                  <span>{review.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsDown className="w-3 h-3" />
                  <span>{review.dislikes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  <span>{review.comments}</span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  // List Variant - Clean list layout with compact design
  const renderListVariant = () => (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Customer Reviews</h2>
          {reviewSettings.showRatingOverview && (
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">4.8</div>
                <StarRating filled={5} />
                <div className="text-sm text-gray-600 mt-1">1,247 reviews</div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {reviews
            .slice(0, reviewSettings.maxReviews)
            .map((review: any, index: number) => (
              <div key={index} className="border-b border-gray-200 pb-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-gray-900">
                          {review.name}
                        </h4>
                        {review.verified && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <StarRating filled={review.rating} />
                    </div>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {review.text}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <button className="flex items-center gap-1 hover:text-gray-700">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{review.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-gray-700">
                        <ThumbsDown className="w-4 h-4" />
                        <span>{review.dislikes}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-gray-700">
                        <MessageCircle className="w-4 h-4" />
                        <span>Reply ({review.comments})</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  // Testimonial Variant - Featured testimonial style layout
  const renderTestimonialVariant = () => (
    <div className="py-12 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what real customers have to
            say about their experience.
          </p>
        </div>

        {reviewSettings.showRatingOverview && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-6 bg-white rounded-2xl px-8 py-6 shadow-lg">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">4.8</div>
                <StarRating filled={5} />
                <div className="text-sm text-gray-600 mt-2">Average Rating</div>
              </div>
              <div className="w-px h-16 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  1,247
                </div>
                <div className="text-sm text-gray-600">Total Reviews</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews
            .slice(0, reviewSettings.maxReviews)
            .map((review: any, index: number) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {review.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {review.name}
                    </h4>
                    <StarRating filled={review.rating} />
                  </div>
                </div>

                <blockquote className="text-gray-700 italic mb-4 leading-relaxed">
                  "{review.text}"
                </blockquote>

                {review.verified && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="w-4 h-4" />
                    <span>Verified Purchase</span>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {review.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {review.comments}
                    </span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Read more
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderVariant = () => {
    switch (reviewSettings.variant) {
      case "list":
        return renderListVariant();
      case "testimonial":
        return renderTestimonialVariant();
      default:
        return renderCardsVariant();
    }
  };

  return (
    <div
      className={`${
        isPreviewMode
          ? "bg-transparent"
          : "bg-white rounded-2xl shadow-xl border border-gray-100"
      } ${isPreviewMode ? "" : "p-6 mb-4"} ${isFullWidth ? "w-full" : ""}`}
    >
      {!isPreviewMode && (
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold flex items-center gap-3 text-gray-900">
            <div className="p-2 bg-yellow-100 rounded-xl">
              <Star size={20} className="text-yellow-600" />
            </div>
            Customer Reviews
            {isFullWidth && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
                Full Width
              </span>
            )}
          </h3>
        </div>
      )}

      {renderVariant()}
    </div>
  );
}

// Component renderer
export function ComponentRenderer({
  component,
  product,
  settings,
  onUpdateSettings,
  onUpdateSpan,
  totalColumns = 3,
  isPreviewMode = false,
  COMPONENT_SPANS,
}: {
  component: { id: string; type: string; span: number; variant: string };
  product: object;
  settings: object;
  onUpdateSettings: (componentId: string, newSettings: object) => void;
  onUpdateSpan: (componentId: string, newSpan: number) => void;
  totalColumns?: number;
  isPreviewMode?: boolean;
  COMPONENT_SPANS: { [key: string]: { value: number; label: string } };
}) {
  const isFullWidth = component.span === totalColumns;

  const commonProps = {
    component,
    product,
    settings,
    onUpdateSettings,
    onUpdateSpan,
    isFullWidth,
    isPreviewMode,
    COMPONENT_SPANS,
  };

  switch (component.type) {
    case COMPONENT_TYPES.IMAGES:
      return <ProductImages {...commonProps} />;
    case COMPONENT_TYPES.DETAILS:
      return <ProductDetails {...commonProps} />;
    case COMPONENT_TYPES.DESCRIPTION:
      return <Description {...commonProps} />;
    case COMPONENT_TYPES.COUPONS:
      return <Coupons {...commonProps} />;
    case COMPONENT_TYPES.FREQUENTLY_PURCHASED:
      return <FrequentlyPurchased {...commonProps} />;
    case COMPONENT_TYPES.INGREDIENTS:
      return <Ingredients {...commonProps} />;
    case COMPONENT_TYPES.HOW_TO_USE:
      return <HowToUse {...commonProps} />;
    case COMPONENT_TYPES.CUSTOMER_REVIEWS:
      return <CustomerReviews {...commonProps} />;
    default:
      return null;
  }
}
