import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Filter, Calendar, Shield, Eye, Edit, ChevronDown, X, Save } from "lucide-react";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { fetchModules } from "../store/slices/moduleSlice";
import type { RootState, AppDispatch } from "../store";
import toast from "react-hot-toast";

const ModuleList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { modules, loading, error } = useSelector(
    (state: RootState) => state.modules
  );
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedModule, setSelectedModule] = useState(null);
  
  // Edit modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    allowedPermissions: []
  });

  useEffect(() => {
    dispatch(fetchModules());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handle edit button click
  const handleEditClick = (module, e) => {
    e.stopPropagation(); // Prevent card selection
    setEditingModule(module);
    setEditForm({
      name: module.name || "",
      description: module.description || "",
      allowedPermissions: module.allowedPermissions || []
    });
    setEditModalOpen(true);
  };

  // Handle form input changes
  const handleFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle permission changes
  const handlePermissionChange = (index, value) => {
    const newPermissions = [...editForm.allowedPermissions];
    newPermissions[index] = value;
    setEditForm(prev => ({
      ...prev,
      allowedPermissions: newPermissions
    }));
  };

  // Add new permission
  const addPermission = () => {
    setEditForm(prev => ({
      ...prev,
      allowedPermissions: [...prev.allowedPermissions, ""]
    }));
  };

  // Remove permission
  const removePermission = (index) => {
    const newPermissions = editForm.allowedPermissions.filter((_, i) => i !== index);
    setEditForm(prev => ({
      ...prev,
      allowedPermissions: newPermissions
    }));
  };

  // Handle save changes
  const handleSave = async () => {
    try {
      // Here you would dispatch an update action
      // dispatch(updateModule({ id: editingModule._id, data: editForm }));
      
      toast.success("Module updated successfully!");
      setEditModalOpen(false);
      setEditingModule(null);
    } catch (error) {
      toast.error("Failed to update module");
    }
  };

  // Close modal
  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingModule(null);
    setEditForm({ name: "", description: "", allowedPermissions: [] });
  };

  // Filter and sort modules
  const filteredModules = modules
    .filter(module => 
      module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (module.description && module.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "date":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "permissions":
          return (b.allowedPermissions?.length || 0) - (a.allowedPermissions?.length || 0);
        default:
          return 0;
      }
    });

  // Edit Modal Component
  const EditModal = () => {
    if (!editModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Edit Module
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Update module information and permissions
              </p>
            </div>
            <button
              onClick={closeEditModal}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6">
            {/* Module Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Module Name
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Enter module name"
              />
            </div>

            {/* Module Description */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={editForm.description}
                onChange={(e) => handleFormChange("description", e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white resize-none"
                placeholder="Enter module description"
              />
            </div> */}

            {/* Permissions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Permissions
                </label>
                <button
                  onClick={addPermission}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Permission
                </button>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {editForm.allowedPermissions.map((permission, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={permission}
                      onChange={(e) => handlePermissionChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder={`Permission ${index + 1}`}
                    />
                    <button
                      onClick={() => removePermission(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/20"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {editForm.allowedPermissions.length === 0 && (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    <p className="text-sm">No permissions added yet</p>
                    <p className="text-xs">Click "Add Permission" to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={closeEditModal}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ModuleCard = ({ module, index }) => (
    <div
      className={`group relative rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 dark:border-gray-700 dark:bg-gray-800/50 ${
        selectedModule?._id === module._id ? 'ring-2 ring-blue-500 shadow-xl' : ''
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => setSelectedModule(selectedModule?._id === module._id ? null : module)}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 transition-opacity duration-300 group-hover:opacity-50 dark:from-blue-900/20 dark:to-purple-900/20" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header with icon */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-sm">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                {module.name}
              </h4>
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="h-3 w-3" />
                <span>
                  {new Date(module.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={(e) => handleEditClick(module, e)}
            className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Edit className="h-4 w-4 text-gray-400 hover:text-blue-600" />
          </button>
        </div>

        {/* Description */}
        {module.description && (
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {module.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {module.allowedPermissions?.length || 0} Permissions
            </div>
          </div>
          
          <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-600 transition-colors">
            <Eye className="h-3 w-3" />
            <span>View Details</span>
          </button>
        </div>

        {/* Expanded details */}
        {selectedModule?._id === module._id && (
          <div className="mt-4 animate-in slide-in-from-top-2 duration-200 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
            <h5 className="mb-2 font-medium text-gray-900 dark:text-white">Permissions</h5>
            <div className="flex flex-wrap gap-2">
              {module.allowedPermissions?.map((permission, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-white px-2 py-1 text-xs text-gray-600 shadow-sm dark:bg-gray-600 dark:text-gray-300"
                >
                  {permission}
                </span>
              )) || (
                <span className="text-xs text-gray-500">No permissions assigned</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-200 p-6 dark:border-gray-700">
          <div className="animate-pulse">
            <div className="mb-4 flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1">
                <div className="mb-2 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
            <div className="mb-4 h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mb-2 h-3 w-4/5 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="flex justify-between">
              <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <PageMeta title="Module List" />
      <PageBreadcrumb pageTitle="All Modules" />
      
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {/* Header */}
        <div className="mb-8 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
              Module List
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage and view all system modules
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Filter className="h-4 w-4" />
              <span>Sort by {sortBy}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {filterOpen && (
              <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                {[
                  { value: "name", label: "Name" },
                  { value: "date", label: "Created Date" },
                  { value: "permissions", label: "Permissions Count" }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setFilterOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSkeleton />
        ) : filteredModules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-gray-100 p-6 dark:bg-gray-800">
              <Shield className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              {searchTerm ? "No modules found" : "No modules available"}
            </h3>
            <p className="mt-2 text-center text-sm text-gray-500">
              {searchTerm 
                ? `Try adjusting your search term "${searchTerm}"`
                : "Get started by creating your first module"
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((module, index) => (
              <ModuleCard key={module._id} module={module} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditModal />
    </div>
  );
};

export default ModuleList;