import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import toast, { Toaster } from "react-hot-toast";
import { AppDispatch, RootState } from "../../store";
import {
  createCategory,
  fetchCategories,
} from "../../store/slices/categorySlice";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PopupAlert from "../../components/popUpAlert";
import {
  fetchSubcategoryById,
  updateSubcategory,
} from "../../store/slices/subCategory";
import { useParams } from "react-router";

interface SubCategoryInput {
  name: string;
}

export default function EditSubcategory() {
  const [category, setCategory] = useState({
    name: "",
    slug: "",
    description: "",
    status: "Active",
    parentCategory: null as string | null,
    image: null as File | null,
    thumbnail: null as File | null,
    seoTitle: "",
    seoDescription: "",
    sortOrder: 0,
    isFeatured: false,
  });
  const params = useParams();
  const subcategoryId = params.id;

  const { categories: allCategories } = useSelector(
    (state: RootState) => state.category
  );

  const [popup, setPopup] = useState({
    isVisible: false,
    message: "",
    type: "",
  });

  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector((state: RootState) => state.category.loading);

  useEffect(() => {
    // Fetch categories if needed
    if (allCategories.length === 0) {
      dispatch(fetchCategories());
    }
  }, []);

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setCategory({ ...category, [name]: checked });
    } else if (type === "number") {
      setCategory({ ...category, [name]: parseInt(value) || 0 });
    } else {
      setCategory({ ...category, [name]: value });

      // Auto-generate slug when name changes
      if (name === "name" && value && !category.slug) {
        setCategory((prev) => ({
          ...prev,
          name: value,
          slug: generateSlug(value),
        }));
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (e.target.files && e.target.files[0]) {
      setCategory({ ...category, [name]: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category.name) {
      toast.error("Category name is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }

    if (!category.slug) {
      toast.error("Category slug is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }

    const formData = new FormData();
    formData.append("name", category.name);
    formData.append("slug", category.slug);
    formData.append("description", category.description);
    formData.append("status", category.status);
    formData.append("seoTitle", category.seoTitle);
    formData.append("seoDescription", category.seoDescription);
    formData.append("sortOrder", category.sortOrder.toString());
    formData.append("isFeatured", category.isFeatured.toString());
    if (category.parentCategory) {
      formData.append("parentCategory", category.parentCategory);
    }

    if (category.image) {
      formData.append("image", category.image);
    }
    if (category.thumbnail) {
      formData.append("thumbnail", category.thumbnail);
    }

    try {
      // Create the main category and get the result (should include the new category's ID)
      const createdCategory = await dispatch(
        updateSubcategory({ id: subcategoryId, data: formData })
      ).unwrap();

      console.log(
        "Updated Subcategory:",

        createdCategory
      );

      setPopup({
        isVisible: true,
        message: "Subcategory updated successfully!",
        type: "success",
      });
      setCategory({
        name: "",
        slug: "",
        description: "",
        status: "Active",
        image: null,
        parentCategory: null,
        thumbnail: null,
        seoTitle: "",
        seoDescription: "",
        sortOrder: 0,
        isFeatured: false,
      });
    } catch (err: any) {
      setPopup({
        isVisible: true,
        message: "Failed to update Subcategory. Please try again.",
        type: "error",
      });
    }
  };

  const getData = async () => {
    try {
      const data = await dispatch(fetchSubcategoryById(subcategoryId)).unwrap();
      console.log("Fetched subcategory data:", data);
      setCategory({
        name: data.name,
        slug: data.slug,
        description: data.description || "",
        status: data.status || "Active",
        parentCategory: data.parentCategory._id || null,
        image: data.image, // Reset image to null for new upload
        thumbnail: data.thumbnail || null, // Reset thumbnail to null for new upload
        seoTitle: data.seoTitle || "",
        seoDescription: data.seoDescription || "",
        sortOrder: data.sortOrder || 0,
        isFeatured: data.isFeatured || false,
      });
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setPopup({
        isVisible: true,
        message: "Failed to fetch categories. Please try again.",
        type: "error",
      });
    }
  };

  useEffect(() => {
    // Fetch the subcategory data when the component mounts
    getData();
  }, []);

  const getFileUrl = (file) => {
    if (typeof file === "string") {
      return file;
    }
    return file ? URL.createObjectURL(file) : "";
  };

  return (
    <div>
      <Toaster position="top-right" />
      <PageMeta
        title="Edit Subcategory | TailAdmin"
        description="Edit an existing subcategory page for TailAdmin"
      />
      <div className="h-fit rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full ">
          <PageBreadcrumb pageTitle="Edit Subcategory" />
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Parent Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="parentCategory"
                    value={category.parentCategory}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select Parent Category</option>
                    {/* Map through categories to create options */}
                    {allCategories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={category.name}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="Enter category name"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={category.slug}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="category-slug"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    URL-friendly version of the name. Auto-generated from name
                    if left empty.
                  </p>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  name="description"
                  value={category.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  placeholder="Enter category description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <select
                    name="status"
                    value={category.status}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    name="sortOrder"
                    value={category.sortOrder}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="0"
                    min="0"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Lower numbers appear first
                  </p>
                </div>

                <div className="flex items-center pt-8">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    checked={category.isFeatured}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2"
                  />
                  <label
                    htmlFor="isFeatured"
                    className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                  >
                    Featured Category
                  </label>
                </div>
              </div>
            </div>

            {/* Images Section */}
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Images
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category Image
                  </label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                  {category.image && (
                    <div className="mt-2">
                      <img
                        src={getFileUrl(category.image)}
                        alt="Category Preview"
                        className="max-w-xs h-auto rounded border"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Thumbnail Image
                  </label>
                  <input
                    type="file"
                    name="thumbnail"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                  {category.thumbnail && (
                    <div className="mt-2">
                      <img
                        src={getFileUrl(category.thumbnail)}
                        alt="Thumbnail Preview"
                        className="max-w-xs h-auto rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SEO Section */}
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                SEO Settings
              </h3>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  SEO Title
                </label>
                <input
                  type="text"
                  name="seoTitle"
                  value={category.seoTitle}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  placeholder="SEO optimized title"
                  maxLength={60}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {category.seoTitle.length}/60 characters. Recommended: 50-60
                  characters
                </p>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  SEO Description
                </label>
                <textarea
                  name="seoDescription"
                  value={category.seoDescription}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  placeholder="SEO optimized description"
                  maxLength={160}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {category.seoDescription.length}/160 characters. Recommended:
                  150-160 characters
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                className="rounded bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Updating Subcategory..." : "Update Subcategory"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <PopupAlert
        message={popup.message}
        type={popup.type}
        isVisible={popup.isVisible}
        onClose={() => setPopup({ ...popup, isVisible: false })}
      />
    </div>
  );
}
