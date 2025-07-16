import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  Award,
  FileText,
  Zap,
  CheckCircle,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import {
  fetchCourseContents,
  createDripRule,
  updateDripRuleByReferenceId,
} from "../../store/slices/drip.js";
import { useSelector, useDispatch } from "react-redux";
import PopupAlert from "../../components/popUpAlert.jsx";
import axiosInstance from "../../services/axiosConfig.js";

const DRIP_TYPES = [
  {
    value: "days_after_enrollment",
    label: "Days After Enrollment",
    description: "Release content after student enrolls",
    icon: Users,
    category: "enrollment",
  },
  {
    value: "days_after_lesson_completed",
    label: "Days After Lesson Completed",
    description: "Release after completing a specific lesson",
    icon: BookOpen,
    category: "completion",
  },
  // {
  //   value: "days_after_module_completed",
  //   label: "Days After Module Completed",
  //   description: "Release after completing a module",
  //   icon: CheckCircle,
  //   category: "completion",
  // },
  {
    value: "after_lesson_completed",
    label: "Immediately After Lesson",
    description: "Release immediately when lesson is completed",
    icon: Zap,
    category: "immediate",
  },
  // {
  //   value: "after_module_completed",
  //   label: "Immediately After Module",
  //   description: "Release immediately when module is completed",
  //   icon: CheckCircle,
  //   category: "immediate",
  // },
  {
    value: "specific_date",
    label: "Specific Date",
    description: "Release on a specific date and time",
    icon: Calendar,
    category: "scheduled",
  },
  {
    value: "after_quiz_passed",
    label: "After Quiz Passed",
    description: "Release when student passes a quiz",
    icon: Award,
    category: "achievement",
  },
  {
    value: "after_assignment_submitted",
    label: "After Assignment Submitted",
    description: "Release when assignment is submitted",
    icon: FileText,
    category: "achievement",
  },
  // {
  //   value: "after_feedback_received",
  //   label: "After Feedback Received",
  //   description: "Release after instructor provides feedback",
  //   icon: AlertCircle,
  //   category: "interaction",
  // },
  // {
  //   value: "custom_condition",
  //   label: "Custom Condition",
  //   description: "Set up custom release conditions",
  //   icon: Zap,
  //   category: "advanced",
  // },
];

const REFERENCE_TYPES = [
  {
    value: "lesson",
    label: "Specific Lesson",
    description: "Reference a particular lesson",
    icon: BookOpen,
  },
  // {
  //   value: "module",
  //   label: "Specific Module",
  //   description: "Reference a particular module",
  //   icon: CheckCircle,
  // },
  // {
  //   value: "date",
  //   label: "Date/Time",
  //   description: "Use date and time reference",
  //   icon: Calendar,
  // },
  // {
  //   value: "enrollment",
  //   label: "Enrollment Date",
  //   description: "Based on when student enrolled",
  //   icon: Users,
  // },
];

const CONDITION_OPERATORS = [
  { value: "AND", label: "AND", description: "All conditions must be met" },
];

const DripPopup = ({
  onSubmit,
  onClose,
  initialData,
  courseData,
  onFetchCourseData,
  targetType,
  targetId,
}) => {
  const dispatch = useDispatch();
  const [dripData, setDripData] = useState(initialData || {});
  const { data: course, loading } = useSelector((state) => state.drip);
  console.log("targetType:", course);
  const [edit, setEdit] = useState(false);

  const [popup, setPopup] = useState({
    isVisible: false,
    message: "",
    type: "",
  });

  console.log("Redux course data:", course);
  console.log("Target Type:", targetType);
  console.log("Target ID:", targetId);

  useEffect(() => {
    dispatch(fetchCourseContents());
  }, [dispatch]);

  console.log("Initial Data:", initialData[0]?.dripType);

  const [form, setForm] = useState({
    dripType: initialData[0]?.dripType || "",
    referenceType: initialData[0]?.referenceType || "enrollment",
    referenceId: initialData[0]?.referenceId || initialData[0]?.targetId || "",
    delayDays: initialData[0]?.delayDays || 0,
    unlockDate: initialData[0]?.unlockDate || "",
    requiredScore: initialData[0]?.requiredScore || "",
    conditionOperator: initialData[0]?.conditionOperator || "AND",
    targetType: targetType || initialData[0]?.targetType || "lesson",
    targetId: targetId || initialData[0]?.targetId || "",
  });

  const [activeCategory, setActiveCategory] = useState("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset referenceId when reference type changes
    if (name === "referenceType") {
      setForm((prev) => ({
        ...prev,
        referenceId: "",
      }));
    }
  };

  const getData = async () => {
    try {
      const result = await axiosInstance.get(
        `/drip/drip-rules/by-reference/${targetId}`
      );
      const data = result.data.data[0];
      setEdit(true);
      setForm({
        dripType: data.dripRuleId.dripType || "",
        referenceType: data.dripRuleId.referenceType || "",
        referenceId: data.dripRuleId.referenceId || "",
        delayDays: data.dripRuleId.delayDays || 0,
        unlockDate: data.dripRuleId.unlockDate || "",
        requiredScore: data.dripRuleId.requiredScore || "",
        conditionOperator: data.dripRuleId.conditionOperator || "AND",
        targetType: data.targetType || "lesson",
        targetId: data.targetId || "",
      });
    } catch (error) {
      console.error("Failed to fetch drip data:", error);
    }
  };

  useEffect(() => {
    if (targetId) {
      getData();
    }
  }, [targetId]);

  const handleSubmit = async () => {
    if (form.dripType) {
      try {
        const dripRuleData = {
          ...form,
          targetType: form.targetType,
          targetId: form.targetId,
        };

        console.log("Creating drip rule with data:", dripRuleData);

        let result;
        if (edit) {
          result = await dispatch(updateDripRuleByReferenceId(dripRuleData));
        } else {
          result = await dispatch(createDripRule(dripRuleData));
        }
        console.log("Drip rule creation result:", result);

        onSubmit(dripRuleData, result.payload);
      } catch (error) {
        // setPopup({
        //   isVisible: true,
        //   message: `Failed to add Drip Rule , Please try again later!`,
        //   type: "error",
        // });
        console.error("Failed to create drip rule:", error);
      }
    }
  };

  const getFilteredDripTypes = () => {
    if (activeCategory === "all") return DRIP_TYPES;
    return DRIP_TYPES.filter((type) => type.category === activeCategory);
  };

  const getDropdownOptions = () => {
    if (!course) return [];

    if (form.referenceType === "module") {
      return (
        course.modules?.map((module) => ({
          value: module._id,
          label: module.title,
          sublabel: `Course: ${module.courseId?.title || "Unknown"} | Order: ${
            module.order
          }`,
        })) || []
      );
    }

    if (form.referenceType === "lesson") {
      let filteredLessons = course.lessons || [];

      if (form.dripType === "after_quiz_passed") {
        filteredLessons = filteredLessons.filter(
          (lesson) => lesson.type === "quiz"
        );
      } else if (form.dripType === "after_assignment_submitted") {
        filteredLessons = filteredLessons.filter(
          (lesson) => lesson.type === "assignment"
        );
      } else if (
        form.dripType === "after_lesson_completed" ||
        form.dripType === "days_after_lesson_completed"
      ) {
        filteredLessons = filteredLessons.filter(
          (lesson) => lesson.type === "video-lesson"
        );
      }

      return filteredLessons.map((lesson) => {
        const module = course.modules?.find(
          (m) => m._id === lesson.moduleId._id
        );
        return {
          value: lesson._id,
          label: lesson.title,
          sublabel: `Type: ${lesson.type} | Module: ${
            module?.title || "Unknown"
          } | Order: ${lesson.order}`,
        };
      });
    }

    return [];
  };

  const getSelectedOptionLabel = () => {
    const options = getDropdownOptions();
    const selected = options.find(
      (option) => option.value === form.referenceId
    );
    return selected ? selected.label : "Select an option...";
  };

  const categories = [
    { value: "all", label: "All Types", count: DRIP_TYPES.length },
    {
      value: "enrollment",
      label: "Enrollment",
      count: DRIP_TYPES.filter((t) => t.category === "enrollment").length,
    },
    {
      value: "completion",
      label: "Completion",
      count: DRIP_TYPES.filter((t) => t.category === "completion").length,
    },
    {
      value: "immediate",
      label: "Immediate",
      count: DRIP_TYPES.filter((t) => t.category === "immediate").length,
    },
    {
      value: "scheduled",
      label: "Scheduled",
      count: DRIP_TYPES.filter((t) => t.category === "scheduled").length,
    },
    {
      value: "achievement",
      label: "Achievement",
      count: DRIP_TYPES.filter((t) => t.category === "achievement").length,
    },
  ];

  const selectedDripType = DRIP_TYPES.find(
    (type) => type.value === form.dripType
  );

  // Helper function to determine if reference type selection should be shown
  const shouldShowReferenceTypeSelection = () => {
    return (
      form.dripType &&
      form.dripType !== "days_after_enrollment" &&
      form.dripType !== "specific_date"
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <Zap className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white/90 mb-2">
            Configure Drip Settings
          </h2>
          <p className="text-gray-600 dark:text-white/70 max-w-md mx-auto">
            Set up when and how this {targetType} should be released to students
          </p>
          {/* Show target information */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-white/[0.03] rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-500">
              <span className="font-medium">Target:</span> {targetType} (ID:{" "}
              {targetId})
            </p>
          </div>
        </div>
        <div className="space-y-8">
          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setActiveCategory(category.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeCategory === category.value
                      ? "bg-purple-600 text-white shadow-lg"
                      : "bg-gray-100 dark:bg-white/[0.06] dark:text-white/70 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {category.label} ({category.count})
                </button>
              ))}
            </div>
          </div>

          {/* Drip Type Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white/90 mb-3">
              Choose Release Trigger
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getFilteredDripTypes().map((type) => {
                const IconComponent = type.icon;
                return (
                  <div
                    key={type.value}
                    className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      form.dripType === type.value
                        ? "border-purple-500 bg-purple-50 dark:bg-white/[0.1] shadow-lg"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                    onClick={() =>
                      setForm((prev) => ({ ...prev, dripType: type.value }))
                    }
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`p-2 rounded-lg ${
                          form.dripType === type.value
                            ? "bg-purple-600 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white/90 mb-1">
                          {type.label}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-white/70">
                          {type.description}
                        </p>
                      </div>
                      <input
                        type="radio"
                        name="dripType"
                        value={type.value}
                        checked={form.dripType === type.value}
                        onChange={handleChange}
                        className="w-5 h-5 text-purple-600 border-gray-300 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conditional Fields */}
          {form.dripType && (
            <div className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90 flex items-center">
                <div
                  className={`p-2 rounded-lg mr-3 ${
                    selectedDripType
                      ? "bg-purple-600 text-white"
                      : "bg-gray-400 text-white"
                  }`}
                >
                  {selectedDripType && (
                    <selectedDripType.icon className="w-5 h-5" />
                  )}
                </div>
                Configure: {selectedDripType?.label}
              </h3>

              {/* Reference Type - Only show if not "days_after_enrollment" and not "specific_date" */}
              {shouldShowReferenceTypeSelection() && (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white/90">
                    Reference Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {REFERENCE_TYPES.map((refType) => {
                      const IconComponent = refType.icon;
                      return (
                        <div
                          key={refType.value}
                          className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                            form.referenceType === refType.value
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 hover:border-purple-300"
                          }`}
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              referenceType: refType.value,
                              referenceId: "",
                            }))
                          }
                        >
                          <div className="flex items-center space-x-3">
                            <IconComponent
                              className={`w-5 h-5 ${
                                form.referenceType === refType.value
                                  ? "text-purple-600"
                                  : "text-gray-500"
                              }`}
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-white/90">
                                {refType.label}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-white/70">
                                {refType.description}
                              </div>
                            </div>
                            <input
                              type="radio"
                              name="referenceType"
                              value={refType.value}
                              checked={form.referenceType === refType.value}
                              onChange={handleChange}
                              className="w-4 h-4 text-purple-600"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reference ID Dropdown - Only show if reference type is lesson or module */}
              {shouldShowReferenceTypeSelection() &&
                (form.referenceType !== "lesson" ||
                  form.referenceType !== "module") && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white/90">
                      {form.referenceType === "lesson"
                        ? "Select Lesson"
                        : "Select Module"}
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="w-full px-4 py-3 border dark:text-white/70 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-white/[0.03] text-left flex items-center justify-between"
                      >
                        <span
                          className={
                            form.referenceId
                              ? "text-gray-900 dark:text-white/90"
                              : "text-gray-500 dark:text-white/70"
                          }
                        >
                          {getSelectedOptionLabel()}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                            dropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {dropdownOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {loading ? (
                            <div className="px-4 py-3 text-gray-500 text-center">
                              Loading...
                            </div>
                          ) : getDropdownOptions().length === 0 ? (
                            <div className="px-4 py-3 text-gray-500 text-center">
                              {form.dripType === "after_quiz_passed"
                                ? "No quizzes available"
                                : form.dripType === "after_assignment_submitted"
                                ? "No assignments available"
                                : `No ${form.referenceType}s available`}
                            </div>
                          ) : (
                            getDropdownOptions().map((option) => (
                              <div
                                key={option.value}
                                className={`px-4 py-3 cursor-pointer hover:bg-purple-50 border-b border-gray-100 last:border-b-0 transition-colors duration-150 ${
                                  form.referenceId === option.value
                                    ? "bg-purple-50 text-purple-700"
                                    : "text-gray-900"
                                }`}
                                onClick={() => {
                                  setForm((prev) => ({
                                    ...prev,
                                    referenceId: option.value,
                                  }));
                                  setDropdownOpen(false);
                                }}
                              >
                                <div className="font-medium">
                                  {option.label}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {option.sublabel}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Delay Days */}
              {(form.dripType === "days_after_enrollment" ||
                form.dripType === "days_after_lesson_completed" ||
                form.dripType === "days_after_module_completed") && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white/90">
                    Delay (Days)
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      name="delayDays"
                      value={form.delayDays}
                      onChange={handleChange}
                      min={0}
                      placeholder="Number of days to wait"
                      className="w-full pl-12 pr-4 py-3 border dark:text-white/70 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Unlock Date */}
              {form.dripType === "specific_date" && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white/90">
                    Unlock Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      name="unlockDate"
                      value={form.unlockDate}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border dark:text-white/70 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Required Score */}
              {(form.dripType === "after_quiz_passed" ||
                form.dripType === "after_assignment_submitted") && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white/90">
                    Required Score (%)
                  </label>
                  <div className="relative">
                    <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-white/90 text-gray-400" />
                    <input
                      type="number"
                      name="requiredScore"
                      value={form.requiredScore}
                      onChange={handleChange}
                      min={0}
                      max={100}
                      placeholder="Minimum score required"
                      className="w-full pl-12 pr-4 py-3 border  dark:text-white/70 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
              )}

              {/* Condition Operator */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white/90">
                  Condition Logic
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CONDITION_OPERATORS.map((operator) => (
                    <div
                      key={operator.value}
                      className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                        form.conditionOperator === operator.value
                          ? "border-purple-500 bg-purple-50 dark:bg-white/[0.09]"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          conditionOperator: operator.value,
                        }))
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white/90">
                            {operator.label}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-white/70">
                            {operator.description}
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="conditionOperator"
                          value={operator.value}
                          checked={form.conditionOperator === operator.value}
                          onChange={handleChange}
                          className="w-4 h-4 text-purple-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!form.dripType}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Save Drip Settings for {targetType}
            </button>
          </div>
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

export default DripPopup;
