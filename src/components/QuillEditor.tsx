import React, { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  Image,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  EyeOff,
  Maximize,
  Minimize,
} from "lucide-react";

// Quill Editor Component
const QuillEditor = ({
  value,
  onChange,
  placeholder = "Start typing...",
  height = "250px",
  toolbar = "full",
  className = "",
}) => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const [isPreview, setIsPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize Quill
  useEffect(() => {
    if (!editorRef.current) return;

    // Import Quill dynamically (in real app, you'd import normally)
    const initializeQuill = () => {
      // Since we can't actually import Quill in this environment,
      // we'll simulate it with a rich text editor
      const editor = editorRef.current;

      // Make it contentEditable
      editor.contentEditable = true;
      editor.innerHTML = value || "";

      // Add event listeners
      const handleInput = () => {
        onChange(editor.innerHTML);
      };

      editor.addEventListener("input", handleInput);
      editor.addEventListener("paste", handleInput);

      return () => {
        editor.removeEventListener("input", handleInput);
        editor.removeEventListener("paste", handleInput);
      };
    };

    const cleanup = initializeQuill();
    return cleanup;
  }, []);

  // Update content when value changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url && /^https?:\/\/[^\s]+$/.test(url)) {
      execCommand("createLink", url);
    } else if (url) {
      alert("Please enter a valid URL");
    }
  };

  const insertImage = () => {
    const url = prompt("Enter image URL:");
    if (url && /\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
      execCommand("insertImage", url);
    } else if (url) {
      alert("Please enter a valid image URL");
    }
  };

  const getToolbarConfig = () => {
    const fullToolbar = [
      { icon: Bold, command: "bold", title: "Bold" },
      { icon: Italic, command: "italic", title: "Italic" },
      { icon: Underline, command: "underline", title: "Underline" },
      { divider: true },
      {
        icon: Heading1,
        command: "formatBlock",
        value: "h1",
        title: "Heading 1",
      },
      {
        icon: Heading2,
        command: "formatBlock",
        value: "h2",
        title: "Heading 2",
      },
      {
        icon: Heading3,
        command: "formatBlock",
        value: "h3",
        title: "Heading 3",
      },
      { divider: true },
      { icon: AlignLeft, command: "justifyLeft", title: "Align Left" },
      { icon: AlignCenter, command: "justifyCenter", title: "Align Center" },
      { icon: AlignRight, command: "justifyRight", title: "Align Right" },
      { divider: true },
      { icon: List, command: "insertUnorderedList", title: "Bullet List" },
      {
        icon: ListOrdered,
        command: "insertOrderedList",
        title: "Numbered List",
      },
      {
        icon: Quote,
        command: "formatBlock",
        value: "blockquote",
        title: "Quote",
      },
      { divider: true },
      {
        icon: Link,
        command: "custom",
        action: insertLink,
        title: "Insert Link",
      },
      {
        icon: Image,
        command: "custom",
        action: insertImage,
        title: "Insert Image",
      },
      { icon: Code, command: "formatBlock", value: "pre", title: "Code Block" },
    ];

    const basicToolbar = [
      { icon: Bold, command: "bold", title: "Bold" },
      { icon: Italic, command: "italic", title: "Italic" },
      { icon: Underline, command: "underline", title: "Underline" },
      { divider: true },
      { icon: List, command: "insertUnorderedList", title: "Bullet List" },
      {
        icon: ListOrdered,
        command: "insertOrderedList",
        title: "Numbered List",
      },
      { divider: true },
      {
        icon: Link,
        command: "custom",
        action: insertLink,
        title: "Insert Link",
      },
    ];

    return toolbar === "basic" ? basicToolbar : fullToolbar;
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const editorHeight = isFullscreen ? "calc(100vh - 200px)" : height;

  return (
    <div
      className={`relative ${
        isFullscreen ? "fixed inset-0 z-50 bg-white " : ""
      } ${className}`}
    >
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white dark:bg-white/[0.03] shadow-lg">
        {/* Toolbar */}
        <div className="border-b bg-gray-50 dark:bg-white/[0.05] p-3 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {getToolbarConfig().map((button, index) => {
              if (button.divider) {
                return (
                  <div key={index} className="w-px h-6 bg-gray-200 mx-1" />
                );
              }

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() =>
                    button.action
                      ? button.action()
                      : execCommand(button.command, button.value)
                  }
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/40 transition-colors duration-200 group"
                  title={button.title}
                >
                  <button.icon className="w-4 h-4 text-gray-600 group-hover:text-gray-800 dark:text-white/90 " />
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/40 transition-colors duration-200"
              title="Toggle Preview"
            >
              {isPreview ? (
                <EyeOff className="w-4 h-4 text-gray-600  dark:text-white/90" />
              ) : (
                <Eye className="w-4 h-4 text-gray-600 dark:text-white/90" />
              )}
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/40 transition-colors duration-200"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 text-gray-600 dark:text-white/90" />
              ) : (
                <Maximize className="w-4 h-4 text-gray-600 dark:text-white/90 " />
              )}
            </button>
          </div>
        </div>

        {/* Editor Content */}
        {isPreview ? (
          <div
            className="p-6 prose max-w-none bg-gray-50 dark:bg-white/[0.03] overflow-y-auto"
            style={{ height: editorHeight }}
            dangerouslySetInnerHTML={{ __html: value }}
          />
        ) : (
          <div
            ref={editorRef}
            className="p-6 outline-none prose max-w-none bg-white dark:bg-white/[0.03] dark:text-white/90 text-black dark:placeholder:text-white/60 placeholder:text-black/80 overflow-y-auto focus:ring-2 focus:ring-blue-500 focus:ring-inset"
            style={{ height: editorHeight }}
            suppressContentEditableWarning={true}
            data-placeholder={placeholder}
          />
        )}
      </div>

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={toggleFullscreen}
            className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200"
          >
            <Minimize className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );
};

export default QuillEditor;
