import React, { useState } from "react";
import { useAppDispatch } from "../../hooks/redux";
import { createCertificate } from "../../store/slices/certificateSlice";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AddCertificate: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    file: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm((s) => ({ ...s, file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      toast.error("Name is required");
      return;
    }
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("description", form.description);
    if (form.file) fd.append("file", form.file);

    setIsSubmitting(true);
    try {
      await dispatch(createCertificate(fd)).unwrap();
      toast.success("Certificate created");
      navigate("/certificate/list");
    } catch (err) {
      toast.error("Failed to create certificate");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageMeta title="Add Certificate" description="Add a certificate" />
      <div className="rounded-2xl border bg-white p-6">
        <PageBreadcrumb pageTitle="Add Certificate" />
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm">Description</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm">File</label>
            <input type="file" onChange={handleFile} />
            {form.file && (
              <div className="mt-2">Selected: {form.file.name}</div>
            )}
          </div>
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCertificate;
