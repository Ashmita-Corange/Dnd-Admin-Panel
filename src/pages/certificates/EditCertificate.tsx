import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchCertificateById,
  updateCertificate,
} from "../../store/slices/certificateSlice";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import toast from "react-hot-toast";

const EditCertificate: React.FC = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const certificate = useAppSelector((s) =>
    (s as any).certificates?.certificates?.find((c: any) => c._id === id)
  );

  const [form, setForm] = useState({
    name: "",
    description: "",
    file: null as File | null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await dispatch(fetchCertificateById(id)).unwrap();
        const data = res?.certificate || res || {};
        setForm({
          name: data.name || "",
          description: data.description || "",
          file: null,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, dispatch]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm((s) => ({ ...s, file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("description", form.description);
    if (form.file) fd.append("file", form.file);
    try {
      await dispatch(updateCertificate({ id, formData: fd })).unwrap();
      toast.success("Certificate updated");
      navigate("/certificate/list");
    } catch (err) {
      toast.error("Failed to update");
    }
  };

  return (
    <div>
      <PageMeta title="Edit Certificate" description="Edit certificate" />
      <div className="rounded-2xl border bg-white p-6">
        <PageBreadcrumb pageTitle="Edit Certificate" />
        {loading ? (
          <div>Loading...</div>
        ) : (
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
              <label className="block text-sm">
                File (leave blank to keep existing)
              </label>
              <input type="file" onChange={handleFile} />
            </div>
            <div>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditCertificate;
