import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
  fetchProducts,
  createVariant,
  fetchAttributes,
} from "../../store/slices/variant";
import toast, { Toaster } from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";
import PopupAlert from "../../components/popUpAlert";
import axiosInstance from "../../services/axiosConfig";

export default function AddVariant() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    products = [],
    attributes = [],
    loading,
  } = useSelector((state: RootState) => state.variant);
  const [popup, setPopup] = useState({
    isVisible: false,
    message: "",
    type: "",
  });
  const [attributesList, setAttributesList] = useState([]);
  const [variant, setVariant] = useState({
    productId: "",
    title: "",
    sku: "",
    price: 0,
    salePrice: 0,
    stock: 0,
    offerTag: "",
    images: [] as File[],
    attributes: [{ attributeId: "", value: "" }],
  });
  const [tenant] = useState("tenant1"); // Replace with actual tenant logic

  useEffect(() => {
    dispatch(fetchProducts({ tenant }));
    dispatch(fetchAttributes({ page: 1, limit: 50 }));
  }, [dispatch, tenant]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "number") {
      setVariant({ ...variant, [name]: parseFloat(value) || 0 });
    } else {
      setVariant({ ...variant, [name]: value });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setVariant({ ...variant, images: Array.from(e.target.files) });
    }
  };

  const handleAttributeChange = (idx: number, field: string, value: string) => {
    const updated = [...variant.attributes];
    updated[idx][field] = value;
    setVariant({ ...variant, attributes: updated });
  };

  const addAttribute = () => {
    setVariant({
      ...variant,
      attributes: [...variant.attributes, { attributeId: "", value: "" }],
    });
  };

  const removeAttribute = (idx: number) => {
    setVariant({
      ...variant,
      attributes: variant.attributes.filter((_, i) => i !== idx),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !variant.productId ||
      !variant.title ||
      !variant.sku ||
      !variant.price ||
      !variant.stock
    ) {
      toast.error("Please fill all required fields.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }
    try {
      await dispatch(
        createVariant({
          tenant,
          productId: variant.productId,
          title: variant.title,
          sku: variant.sku,
          price: variant.price,
          salePrice: variant.salePrice,
          stock: variant.stock,
          offerTag: variant.offerTag,
          images: variant.images,
          attributes: variant.attributes,
        })
      ).unwrap();
      setPopup({
        isVisible: true,
        message: "Variant created successfully!",
        type: "success",
      });
      setVariant({
        productId: "",
        title: "",
        sku: "",
        price: 0,
        salePrice: 0,
        stock: 0,
        offerTag: "",
        images: [],
        attributes: [{ attributeId: "", value: "" }],
      });
    } catch (err: any) {
      setPopup({
        isVisible: true,
        message: "Failed to create variant. Please try again.",
        type: "error",
      });
    }
  };

  const getAttributeOptions = async () => {
    try {
      const response = await axiosInstance.get(
        `/product/attribute/${variant.productId}`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setAttributesList(response.data.data);
      console.log("Fetched attributes: ===>", response.data);
    } catch (error) {
      console.error("Failed to fetch attributes:", error);
      // setPopup({
      //   isVisible: true,
      //   message: "Failed to fetch attributes. Please try again.",
      //   type: "error",
      // });
    }
  };

  useEffect(() => {
    getAttributeOptions();
  }, [variant.productId]);

  return (
    <div>
      <Toaster position="top-right" />
      <PageMeta
        title="Add Variant | TailAdmin"
        description="Add a new product variant"
      />
      <div className="h-fit rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Product <span className="text-red-500">*</span>
              </label>
              <select
                name="productId"
                value={variant.productId}
                onChange={handleChange}
                required
                className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">Select Product</option>
                {products?.length > 0 &&
                  products?.map((prod: any) => (
                    <option key={prod._id} value={prod._id}>
                      {prod.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={variant.title}
                onChange={handleChange}
                required
                className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="Variant Title"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="sku"
                value={variant.sku}
                onChange={handleChange}
                required
                className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="SKU"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={variant.price === 0 ? "" : variant.price}
                onChange={handleChange}
                required
                className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                min={0}
                step="any"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Sale Price
              </label>
              <input
                type="number"
                name="salePrice"
                value={variant.salePrice === 0 ? "" : variant.salePrice}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                min={0}
                step="any"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={variant.stock === 0 ? "" : variant.stock}
                onChange={handleChange}
                required
                className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                min={0}
                step="1"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Offer Tag
              </label>
              <input
                type="text"
                name="offerTag"
                value={variant.offerTag}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="Offer Tag"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Images
              </label>
              <input
                type="file"
                name="images"
                multiple
                onChange={handleImageChange}
                accept="image/*"
                className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              {variant.images.length > 0 && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {variant.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={URL.createObjectURL(img)}
                      alt="Preview"
                      className="w-16 h-16 rounded border"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Attributes
          </h3>
          {variant.attributes.map((attr, idx) => (
            <div key={idx} className="flex items-center gap-4 mb-2">
              <select
                value={attr.attributeId}
                onChange={(e) =>
                  handleAttributeChange(idx, "attributeId", e.target.value)
                }
                className="flex-1 rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">Select Attribute</option>
                {attributesList.map((attribute) => (
                  <option key={attribute._id} value={attribute._id}>
                    {attribute.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Value"
                value={attr.value}
                onChange={(e) =>
                  handleAttributeChange(idx, "value", e.target.value)
                }
                className="flex-1 rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => removeAttribute(idx)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
                title="Remove attribute"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addAttribute}
            className="rounded bg-blue-100 px-3 py-1 text-blue-700 font-semibold hover:bg-blue-200"
          >
            Add Attribute
          </button>
          <div className="pt-6">
            <button
              type="submit"
              className="rounded bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Adding Variant..." : "Add Variant"}
            </button>
          </div>
        </form>
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
