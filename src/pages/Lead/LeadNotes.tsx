import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  User,
  StickyNote,
  Save,
  X,
  FileText,
  Phone,
  Mail,
  Building
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { 
  fetchLeadById,
  addLeadNote,
  Lead
} from "../../store/slices/lead";
import PageMeta from "../../components/common/PageMeta";
import PopupAlert from "../../components/popUpAlert";

// Page Breadcrumb Component
const PageBreadcrumb: React.FC<{ pageTitle: string; leadName: string }> = ({ pageTitle, leadName }) => (
  <div className="mb-6">
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 md:space-x-3">
        <li className="flex items-center">
          <a href="#" className="text-gray-700 hover:text-blue-600 dark:text-gray-300">
            Home
          </a>
        </li>
        <li>
          <div className="flex items-center">
            <span className="mx-2 text-gray-400">/</span>
            <a href="/lead/list" className="text-gray-700 hover:text-blue-600 dark:text-gray-300">
              Leads
            </a>
          </div>
        </li>
        <li>
          <div className="flex items-center">
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-500 dark:text-gray-400">{pageTitle}</span>
          </div>
        </li>
      </ol>
    </nav>
    <h1 className="text-3xl font-bold text-gray-800 dark:text-white/90">
      {pageTitle}
    </h1>
    <p className="text-gray-600 dark:text-gray-400 mt-1">
      Managing notes for {leadName}
    </p>
  </div>
);

// Add Note Form Component
const AddNoteForm: React.FC<{
  onSubmit: (noteData: { note: string; nextFollowUpAt?: string }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}> = ({ onSubmit, onCancel, isSubmitting }) => {
  const [noteText, setNoteText] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [errors, setErrors] = useState<{ note?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate note
    const newErrors: { note?: string } = {};
    if (!noteText.trim()) {
      newErrors.note = "Note is required";
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      await onSubmit({
        note: noteText.trim(),
        ...(followUpDate ? { nextFollowUpAt: followUpDate } : {}),
      });
      // Reset form after successful submission
      setNoteText("");
      setFollowUpDate("");
      setErrors({});
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  return (
    <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
        <StickyNote className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        Add New Note
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Note Input */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Note <span className="text-red-500">*</span>
            </div>
          </label>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={5}
            className={`w-full rounded border px-3 py-2 focus:outline-none dark:bg-gray-900 dark:text-white resize-none ${
              errors.note
                ? "border-red-500 focus:border-red-500"
                : "border-gray-300 dark:border-gray-700 focus:border-blue-500"
            }`}
            placeholder="Enter your note here..."
            disabled={isSubmitting}
          />
          {errors.note && (
            <p className="mt-1 text-sm text-red-500">{errors.note}</p>
          )}
        </div>

        {/* Follow-up Date (Optional) */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Next Follow-up Date (Optional)
            </div>
          </label>
          <input
            type="datetime-local"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            className="w-full rounded border border-gray-300 dark:border-gray-700 px-3 py-2 focus:border-blue-500 focus:outline-none dark:bg-gray-900 dark:text-white"
            disabled={isSubmitting}
          />
        </div>

        {/* Form Actions */}
        <div className="pt-6 flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adding Note...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Add Note
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// Note Card Component
const NoteCard: React.FC<{
  note: {
    _id?: string;
    note: string;
    createdAt: string | Date;
    createdBy?: string | { name: string; email: string; _id: string };
  };
  index: number;
}> = ({ note, index }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {index + 1}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Note {index + 1}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{new Date(note.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pl-11">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {note.note}
        </p>
        
        {note.createdBy && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <User className="w-3 h-3" />
              <span>
                Added by{' '}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {typeof note.createdBy === 'string' ? note.createdBy : note.createdBy.name || 'Unknown'}
                </span>
                {typeof note.createdBy !== 'string' && note.createdBy.email && (
                  <span className="ml-1 text-gray-400">
                    ({note.createdBy.email})
                  </span>
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const LeadNotes: React.FC = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { leads, loading } = useAppSelector((state) => state.lead);
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  
  // Popup state for alerts
  const [popup, setPopup] = useState({
    message: "",
    type: "success" as "success" | "error",
    isVisible: false,
  });

  // Find current lead from leads array or fetch it
  useEffect(() => {
    if (leadId) {
      const existingLead = leads.find(lead => lead._id === leadId);
      if (existingLead) {
        setCurrentLead(existingLead);
      } else {
        // Fetch lead if not found in the current leads array
        dispatch(fetchLeadById(leadId));
      }
    }
  }, [leadId, leads, dispatch]);

  // Update current lead when leads change
  useEffect(() => {
    if (leadId && leads.length > 0) {
      const updatedLead = leads.find(lead => lead._id === leadId);
      if (updatedLead) {
        setCurrentLead(updatedLead);
      }
    }
  }, [leadId, leads]);

  const handleAddNote = async (noteData: { note: string; nextFollowUpAt?: string }) => {
    if (!leadId || !currentLead) return;
    
    setIsAddingNote(true);
    try {
      await dispatch(addLeadNote({
        id: leadId,
        noteData
      })).unwrap();

      setPopup({
        message: "Note added successfully!",
        type: "success",
        isVisible: true,
      });

      setShowAddForm(false);
    } catch (error) {
      console.error("Failed to add note:", error);
      setPopup({
        message: "Failed to add note. Please try again.",
        type: "error",
        isVisible: true,
      });
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleGoBack = () => {
    navigate("/lead/list");
  };

  if (loading) {
    return (
      <div>
        <PageMeta
          title="Lead Notes | TailAdmin"
          description="Managing lead notes in TailAdmin"
        />
        <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentLead) {
    return (
      <div>
        <PageMeta
          title="Lead Not Found | TailAdmin"
          description="Lead not found in TailAdmin"
        />
        <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Lead Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              The lead you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={handleGoBack}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Leads
            </button>
          </div>
        </div>
      </div>
    );
  }

  const notes = currentLead.notes || [];

  return (
    <div>
      <PageMeta
        title={`Notes - ${currentLead.fullName} | TailAdmin`}
        description={`Managing notes for ${currentLead.fullName} in TailAdmin`}
      />
      
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Leads
            </button>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Lead Notes
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Managing notes for {currentLead.fullName}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              showAddForm
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-indigo-500 text-white hover:bg-indigo-600"
            }`}
          >
            {showAddForm ? (
              <>
                <X className="w-4 h-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Note
              </>
            )}
          </button>
        </div>

        {/* Lead Summary Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentLead.fullName}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>{currentLead.email}</span>
                <span>{currentLead.phone}</span>
                {currentLead.company && <span>{currentLead.company}</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200">
                {currentLead.status?.charAt(0)?.toUpperCase() + currentLead.status?.slice(1)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {notes.length} note{notes.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Add Note Form */}
        {showAddForm && (
          <div className="mb-6">
            <AddNoteForm
              onSubmit={handleAddNote}
              onCancel={() => setShowAddForm(false)}
              isSubmitting={isAddingNote}
            />
          </div>
        )}

        {/* Notes List */}
        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <StickyNote className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No notes yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Start by adding the first note for this lead.
              </p>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <Plus className="w-4 h-4" />
                  Add First Note
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <StickyNote className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notes ({notes.length})
                </h2>
              </div>
              
              <div className="space-y-4">
                {[...notes]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((note, index) => (
                    <NoteCard
                      key={note._id || index}
                      note={note}
                      index={index}
                    />
                  ))}
              </div>
            </>
          )}
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
};

export default LeadNotes;
