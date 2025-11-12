import axiosInstance from "./axiosConfig";

export const createCertificateApi = async (formData: FormData) => {
  const res = await axiosInstance.post(`/certificates`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const fetchCertificatesApi = async (params: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const { page = 1, limit = 10, search = "" } = params || {};
  const qp = new URLSearchParams();
  qp.append("page", String(page));
  qp.append("limit", String(limit));
  if (search) qp.append("search", search);
  const res = await axiosInstance.get(`/certificates?${qp.toString()}`);
  return res.data;
};

export const fetchCertificateByIdApi = async (id: string) => {
  const res = await axiosInstance.get(`/certificates/${id}`);
  return res.data;
};

export const updateCertificateApi = async (id: string, formData: FormData) => {
  const res = await axiosInstance.put(`/certificates/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteCertificateApi = async (id: string) => {
  const res = await axiosInstance.delete(`/certificates/${id}`);
  return res.data;
};

export default {
  createCertificateApi,
  fetchCertificatesApi,
  fetchCertificateByIdApi,
  updateCertificateApi,
  deleteCertificateApi,
};
