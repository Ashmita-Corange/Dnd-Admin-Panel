import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlanById, updatePlan, Plan } from "../../store/slices/planSlice";
import { useParams, useNavigate } from "react-router-dom";
import { RootState } from "../../store";
import toast, { Toaster } from "react-hot-toast";

export default function EditPlan() {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const plan = useSelector((state: RootState) => state.plan?.plans?.find((p: any) => p._id === id));
    const [form, setForm] = useState<Plan | null>(plan ? {
        ...plan,
        description: plan.description ?? "",
        features: plan.features && Array.isArray(plan.features) ? plan.features : [{ key: "", value: "" }],
        metadata: plan.metadata || {},
    } : null);

    useEffect(() => {
        if (!plan && id) {
            dispatch<any>(fetchPlanById(id));
        } else if (plan) {
            setForm({
                ...plan,
                description: plan.description ?? "",
                features: plan.features && Array.isArray(plan.features) ? plan.features : [{ key: "", value: "" }],
                metadata: plan.metadata || {},
            });
        }
    }, [dispatch, id, plan]);

    // Options
    const availabilityOptions = ["daily", "weekly", "monthly", "yearly"];
    const discountTypes = ["percentage", "fixed"];
    const trialPeriodTypes = ["days", "weeks", "months"];
    const currencies = ["INR", "USD", "EUR", "GBP"];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        let checked = false;
        if (type === "checkbox" && "checked" in e.target) {
            checked = (e.target as HTMLInputElement).checked;
        }
        setForm((prev: any) => {
            if (!prev) return prev;
            if (name.startsWith("metadata.")) {
                const metaKey = name.split(".")[1];
                return { ...prev, metadata: { ...prev.metadata, [metaKey]: value } };
            }
            return {
                ...prev,
                [name]: type === "checkbox" ? checked : type === "number" ? parseFloat(value) || 0 : value,
            };
        });
    };

    const handleFeatureChange = (idx: number, field: "key" | "value", value: string) => {
        setForm((prev: any) => {
            if (!prev) return prev;
            const features = prev.features ? [...prev.features] : [];
            features[idx][field] = value;
            return { ...prev, features };
        });
    };

    const addFeature = () => {
        setForm((prev: any) => {
            if (!prev) return prev;
            return { ...prev, features: [...(prev.features || []), { key: "", value: "" }] };
        });
    };

    const removeFeature = (idx: number) => {
        setForm((prev: any) => {
            if (!prev) return prev;
            return { ...prev, features: prev.features.filter((_: any, i: number) => i !== idx) };
        });
    };

    const calculateDiscountedPrice = () => {
        if (!form) return 0;
        if (form.discount <= 0) return form.price;
        if (form.discountType === "percentage") {
            return form.price - (form.price * form.discount) / 100;
        } else {
            return Math.max(0, form.price - form.discount);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form || !id) return;
        // Validation (optional: add toast notifications)
        if (!form.name.trim()) {
            toast.error("Plan name is required.");
            return;
        }
        if (form.price < 0) {
            toast.error("Price cannot be negative.");
            return;
        }
        if (
            form.discount < 0 ||
            (form.discountType === "percentage" && form.discount > 100)
        ) {
            toast.error("Invalid discount value.");
            return;
        }
        if (!form.features || form.features.length === 0) {
            toast.error("At least one feature is required.");
            return;
        }
        await dispatch<any>(updatePlan({ id: id as string, data: form }));
        toast.success("Plan updated successfully!");
        navigate("/plan/list");
    };

    if (!form) return <div>Loading...</div>;

    return (
        <div>
            <Toaster position="top-right" />
            <div className="h-fit rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                <div className="mx-auto w-full">
                    <h2 className="text-xl font-bold mb-4">Edit Subscription Plan</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information Section */}
                        <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                Basic Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Plan Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        placeholder="Enter plan name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Currency
                                    </label>
                                    <select
                                        name="currency"
                                        value={form.currency}
                                        onChange={handleChange}
                                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    >
                                        {currencies.map((currency) => (
                                            <option key={currency} value={currency}>
                                                {currency}
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
                                    value={form.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    placeholder="Enter plan description"
                                />
                            </div>
                        </div>
                        {/* Pricing Section */}
                        <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                Pricing & Duration
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Price <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={form.price}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Availability
                                    </label>
                                    <select
                                        name="availability"
                                        value={form.availability}
                                        onChange={handleChange}
                                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    >
                                        {availabilityOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option.charAt(0).toUpperCase() + option.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Duration
                                    </label>
                                    <input
                                        type="number"
                                        name="duration"
                                        value={form.duration}
                                        onChange={handleChange}
                                        min="1"
                                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        placeholder="Duration"
                                    />
                                </div>
                            </div>
                            {/* Discount Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Discount
                                    </label>
                                    <input
                                        type="number"
                                        name="discount"
                                        value={form.discount}
                                        onChange={handleChange}
                                        min="0"
                                        max={form.discountType === "percentage" ? "100" : undefined}
                                        step="0.01"
                                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Discount Type
                                    </label>
                                    <select
                                        name="discountType"
                                        value={form.discountType}
                                        onChange={handleChange}
                                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    >
                                        {discountTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {/* Price Preview */}
                            {form.discount > 0 && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                    <p className="text-sm text-blue-800 dark:text-blue-300">
                                        <span className="font-medium">Final Price:</span>{" "}
                                        {form.currency} {calculateDiscountedPrice().toFixed(2)}
                                        <span className="ml-2 line-through text-gray-500">
                                            {form.currency} {form.price.toFixed(2)}
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>
                        {/* Trial Period Section */}
                        <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                Trial Period
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Trial Period Duration
                                    </label>
                                    <input
                                        type="number"
                                        name="trialPeriod"
                                        value={form.trialPeriod}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        placeholder="0"
                                    />
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Set to 0 for no trial period
                                    </p>
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Trial Period Type
                                    </label>
                                    <select
                                        name="trialPeriodType"
                                        value={form.trialPeriodType}
                                        onChange={handleChange}
                                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    >
                                        {trialPeriodTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        {/* Features Section */}
                        <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                Plan Features
                            </h3>
                            {/* Features List */}
                            {form.features && form.features.map((feature: any, idx: number) => (
                                <div key={idx} className="flex gap-2 mb-2">
                                    <input
                                        value={feature.key}
                                        onChange={(e) => handleFeatureChange(idx, "key", e.target.value)}
                                        placeholder="Feature Key"
                                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        required
                                    />
                                    <input
                                        value={feature.value}
                                        onChange={(e) => handleFeatureChange(idx, "value", e.target.value)}
                                        placeholder="Feature Value"
                                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        required
                                    />
                                    <button type="button" onClick={() => removeFeature(idx)} className="text-red-600 hover:text-red-800 transition">
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={addFeature} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                                Add Feature
                            </button>
                        </div>
                        {/* Plan Settings */}
                        <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                Plan Settings
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        name="isFeatured"
                                        checked={form.isFeatured}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        Featured Plan
                                    </span>
                                </label>
                                {/* Add other settings as needed */}
                            </div>
                        </div>
                        {/* Metadata */}
                        <div>
                            <input
                                name="metadata.color"
                                value={form.metadata?.color || ""}
                                onChange={handleChange}
                                placeholder="Color"
                                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            />
                        </div>
                        {/* Submit Button */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                className="rounded bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition"
                            >
                                Update Plan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
