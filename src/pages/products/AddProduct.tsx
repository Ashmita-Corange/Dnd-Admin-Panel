import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { Plus, Trash2, Upload } from "lucide-react";
import { createProduct } from "../../store/slices/product";

// Mock interfaces - replace with your actual types
interface Category {
  _id: string;
  name: string;
}

interface Attribute {
  _id: string;
  name: string;
}

interface HowToUseStep {
  title: string;
  description: string;
}

interface ProductState {
  name: string;
  description: string;
  category: string;
  images: File[];
  thumbnail: File | null;
  howToUseTitle: string;
  howToUseVideo: string;
  howToUseSteps: HowToUseStep[];
  descriptionImages: File[];
  descriptionVideo: string;
  highlights: string[];
  attributeSet: string[];
  status: string;
}

export default function AddProduct() {
  const [product, setProduct] = useState<ProductState>({
    name: "",
    description: "",
    category: "",
    images: [],
    thumbnail: null,
    howToUseTitle: "",
    howToUseVideo: "",
    howToUseSteps: [{ title: "", description: "" }],
    descriptionImages: [],
    descriptionVideo: "",
    highlights: [""],
    attributeSet: [],
    status: "active",
  });

  const [popup, setPopup] = useState({
    isVisible: false,
    message: "",
    type: "",
  });

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: any) => state.product);

  // Mock data - replace with your actual Redux selectors
  const categories: Category[] = [
    { _id: "6883384f405c4a83f3b68d39", name: "Tea & Beverages" },
    { _id: "6883384f405c4a83f3b68d40", name: "Health & Wellness" },
  ];

  const attributes: Attribute[] = [
    { _id: "6884664eccba51f7e84ca903", name: "Weight" },
    { _id: "6884665dccba51f7e84ca908", name: "Flavor" },
    { _id: "6884665dccba51f7e84ca909", name: "Brand" },
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleMultipleImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: "images" | "descriptionImages"
  ) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setProduct({
        ...product,
        [fieldName]: [...product[fieldName], ...filesArray],
      });
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProduct({ ...product, thumbnail: e.target.files[0] });
    }
  };

  const removeImage = (
    index: number,
    fieldName: "images" | "descriptionImages"
  ) => {
    const updatedImages = product[fieldName].filter((_, i) => i !== index);
    setProduct({ ...product, [fieldName]: updatedImages });
  };

  const addHowToUseStep = () => {
    setProduct({
      ...product,
      howToUseSteps: [...product.howToUseSteps, { title: "", description: "" }],
    });
  };

  const removeHowToUseStep = (index: number) => {
    if (product.howToUseSteps.length > 1) {
      const updatedSteps = product.howToUseSteps.filter((_, i) => i !== index);
      setProduct({ ...product, howToUseSteps: updatedSteps });
    }
  };

  const updateHowToUseStep = (
    index: number,
    field: "title" | "description",
    value: string
  ) => {
    const updatedSteps = product.howToUseSteps.map((step, i) =>
      i === index ? { ...step, [field]: value } : step
    );
    setProduct({ ...product, howToUseSteps: updatedSteps });
  };

  const addHighlight = () => {
    setProduct({ ...product, highlights: [...product.highlights, ""] });
  };

  const removeHighlight = (index: number) => {
    if (product.highlights.length > 1) {
      const updatedHighlights = product.highlights.filter(
        (_, i) => i !== index
      );
      setProduct({ ...product, highlights: updatedHighlights });
    }
  };

  const updateHighlight = (index: number, value: string) => {
    const updatedHighlights = product.highlights.map((highlight, i) =>
      i === index ? value : highlight
    );
    setProduct({ ...product, highlights: updatedHighlights });
  };

  const handleAttributeChange = (attributeId: string, checked: boolean) => {
    if (checked) {
      setProduct({
        ...product,
        attributeSet: [...product.attributeSet, attributeId],
      });
    } else {
      setProduct({
        ...product,
        attributeSet: product.attributeSet.filter((id) => id !== attributeId),
      });
    }
  };

  const handleSubmit = async () => {
    if (!product.name) {
      toast.error("Product name is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }

    if (!product.category) {
      toast.error("Category is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }

    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("description", product.description);
    formData.append("category", product.category);
    formData.append("howToUseTitle", product.howToUseTitle);
    formData.append("howToUseVideo", product.howToUseVideo);
    formData.append("descriptionVideo", product.descriptionVideo);
    formData.append("status", product.status);

    // Add images
    product.images.forEach((image, index) => {
      formData.append(`images[${index}]`, image);
    });

    // Add thumbnail
    if (product.thumbnail) {
      formData.append("thumbnail", product.thumbnail);
    }

    // Add description images
    product.descriptionImages.forEach((image, index) => {
      formData.append(`descriptionImages[${index}]`, image);
    });

    // Add how to use steps
    product.howToUseSteps.forEach((step, index) => {
      formData.append(`howToUseSteps[${index}].title`, step.title);
      formData.append(`howToUseSteps[${index}].description`, step.description);
    });

    // Add highlights
    product.highlights.forEach((highlight, index) => {
      formData.append(`highlights[${index}]`, highlight);
    });

    // Add attribute set
    product.attributeSet.forEach((attributeId, index) => {
      formData.append(`attributeSet[${index}].attributeId`, attributeId);
    });

    try {
      const response = await dispatch(createProduct(formData));
      // Reset form
      setProduct({
        name: "",
        description: "",
        category: "",
        images: [],
        thumbnail: null,
        howToUseTitle: "",
        howToUseVideo: "",
        howToUseSteps: [{ title: "", description: "" }],
        descriptionImages: [],
        descriptionVideo: "",
        highlights: [""],
        attributeSet: [],
        status: "active",
      });
    } catch (err: any) {
      setPopup({
        isVisible: true,
        message: "Failed to create product. Please try again.",
        type: "error",
      });
    }
  };


  console.log("Base Url ==>" , window.location.origin);
  return (
    <div>
      <Toaster position="top-right" />
      <div className="h-fit rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Add Product
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create a new product with all details
            </p>
          </div>

          <div className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={product.category}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  name="description"
                  value={product.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  placeholder="Enter product description"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  name="status"
                  value={product.status}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            {/* Images Section */}
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Product Images
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Product Images
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleMultipleImagesChange(e, "images")}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                  {product.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {product.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Product ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index, "images")}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Thumbnail Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                  {product.thumbnail && (
                    <div className="mt-2">
                      <img
                        src={URL.createObjectURL(product.thumbnail)}
                        alt="Thumbnail Preview"
                        className="max-w-xs h-auto rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* How to Use Section */}
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                How to Use
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    How to Use Title
                  </label>
                  <input
                    type="text"
                    name="howToUseTitle"
                    value={product.howToUseTitle}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="Enter how to use title"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    How to Use Video URL
                  </label>
                  <input
                    type="url"
                    name="howToUseVideo"
                    value={product.howToUseVideo}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="Enter video URL"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    How to Use Steps
                  </label>
                  <button
                    type="button"
                    onClick={addHowToUseStep}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Plus size={16} />
                    Add Step
                  </button>
                </div>

                {product.howToUseSteps.map((step, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 mb-4 bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-800 dark:text-white">
                        Step {index + 1}
                      </h4>
                      {product.howToUseSteps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeHowToUseStep(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) =>
                          updateHowToUseStep(index, "title", e.target.value)
                        }
                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        placeholder="Step title"
                      />
                      <input
                        type="text"
                        value={step.description}
                        onChange={(e) =>
                          updateHowToUseStep(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        placeholder="Step description"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description Media Section */}
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Description Media
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description Images
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      handleMultipleImagesChange(e, "descriptionImages")
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                  {product.descriptionImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {product.descriptionImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Description ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeImage(index, "descriptionImages")
                            }
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description Video URL
                  </label>
                  <input
                    type="url"
                    name="descriptionVideo"
                    value={product.descriptionVideo}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="Enter description video URL"
                  />
                </div>
              </div>
            </div>

            {/* Highlights Section */}
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Product Highlights
                </h3>
                <button
                  type="button"
                  onClick={addHighlight}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Plus size={16} />
                  Add Highlight
                </button>
              </div>

              {product.highlights.map((highlight, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={highlight}
                    onChange={(e) => updateHighlight(index, e.target.value)}
                    className="flex-1 rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="Enter product highlight"
                  />
                  {product.highlights.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeHighlight(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Attributes Section */}
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Product Attributes
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {attributes.map((attribute) => (
                  <div key={attribute._id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`attr-${attribute._id}`}
                      checked={product.attributeSet.includes(attribute._id)}
                      onChange={(e) =>
                        handleAttributeChange(attribute._id, e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label
                      htmlFor={`attr-${attribute._id}`}
                      className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                    >
                      {attribute.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Adding Product..." : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Popup Alert */}
      {popup.isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <div
              className={`text-center ${
                popup.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              <p className="font-medium">{popup.message}</p>
              <button
                onClick={() => setPopup({ ...popup, isVisible: false })}
                className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
