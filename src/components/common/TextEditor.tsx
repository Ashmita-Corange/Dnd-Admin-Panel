import { useState, useEffect, useRef, useMemo } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Autoformat,
  AutoImage,
  Autosave,
  BlockQuote,
  Bold,
  CloudServices,
  Essentials,
  Heading,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  MediaEmbed,
  Paragraph,
  PasteFromOffice,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextTransformation,
  TodoList,
  Underline,
  ImageInsert,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";

/**
 * Create a free account with a trial: https://portal.ckeditor.com/checkout?plan=free
 */
const LICENSE_KEY = "GPL"; // or <YOUR_LICENSE_KEY>.

const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000/";

export default function CustomEditor({ value, onChange }) {
  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const initialValue = useRef(value || "");
  const [editorContent, setEditorContent] = useState(value || "");
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const lastContentRef = useRef(value || "");
  const isUserEditingRef = useRef(false);

  // Preserve the original value on first render
  useEffect(() => {
    if (isFirstRender) {
      initialValue.current = value || "";
      lastContentRef.current = value || "";
      setIsFirstRender(false);
    }
  }, [value, isFirstRender]);

  // Handle external value changes
  useEffect(() => {
    // Don't update if user is currently typing/editing
    if (isUserEditingRef.current) {
      return;
    }

    // Only update if the editor is initialized and value changed
    if (
      isInitialized &&
      editorRef.current &&
      value !== lastContentRef.current
    ) {
      lastContentRef.current = value || "";
      setEditorContent(value || "");

      // Update editor content - carefully check if editor exists and has methods
      if (
        editorRef.current &&
        typeof editorRef.current.setData === "function"
      ) {
        try {
          editorRef.current.setData(value || "");
        } catch (error) {
          console.error("Error setting editor data:", error);
        }
      }
    }
  }, [value, isInitialized]);

  useEffect(() => {
    setIsLayoutReady(true);

    return () => {
      setIsLayoutReady(false);
      isUserEditingRef.current = false;
    };
  }, []);

  // Custom CKEditor Upload Adapter - uploads files to the server and
  // returns a URL that CKEditor will insert into the content.
  // The adapter expects the upload API at `/api/upload` which accepts
  // a form field named `file` and returns JSON containing the file URL
  // in one of the common keys (e.g. `url` or `path`).
  function CustomUploadAdapterPlugin(editor: any) {
    class MyUploadAdapter {
      loader: any;
      abortController: AbortController | null;

      constructor(loader: any) {
        this.loader = loader;
        this.abortController = null;
      }

      upload() {
        return this.loader.file.then((file: File) => {
          const url = `${API_BASE_URL}/upload`;
          this.abortController = new AbortController();
          const form = new FormData();
          form.append("file", file);

          return fetch(url, {
            method: "POST",
            body: form,
            signal: this.abortController.signal,
          })
            .then(async (resp) => {
              if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`Upload failed: ${resp.status} ${text}`);
              }
              const json = await resp.json().catch(() => ({}));

              // Support a few common response shapes
              const returnedUrl =
                json.url ||
                json.path ||
                json.fileUrl ||
                json.file_path ||
                (json.data && json.data.url);

              if (!returnedUrl) {
                if (typeof json === "string") {
                  const absolute = json.startsWith("http")
                    ? json
                    : window.location.origin + json;
                  return { default: absolute };
                }
                throw new Error(
                  "Upload succeeded but response did not contain a URL"
                );
              }

              const finalUrl = returnedUrl.startsWith("http")
                ? returnedUrl
                : API_BASE_URL + returnedUrl;
              return { default: finalUrl };
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        });
      }

      abort() {
        if (this.abortController) this.abortController.abort();
      }
    }

    // Register the factory for creating adapters
    editor.plugins.get("FileRepository").createUploadAdapter = (
      loader: any
    ) => {
      return new MyUploadAdapter(loader);
    };
  }

  const { editorConfig } = useMemo(() => {
    if (!isLayoutReady) {
      return {};
    }

    return {
      editorConfig: {
        toolbar: {
          items: [
            "heading",
            "|",
            "bold",
            "italic",
            "underline",
            "|",
            "link",
            "imageInsert",
            "mediaEmbed",
            "insertTable",
            "blockQuote",
            "|",
            "bulletedList",
            "numberedList",
            "todoList",
            "outdent",
            "indent",
          ],
          shouldNotGroupWhenFull: false,
        },
        plugins: [
          Autoformat,
          AutoImage,
          Autosave,
          BlockQuote,
          Bold,
          CloudServices,
          Essentials,
          Heading,
          ImageBlock,
          ImageCaption,
          ImageInsert,
          ImageInline,
          ImageInsertViaUrl,
          ImageResize,
          ImageStyle,
          ImageTextAlternative,
          ImageToolbar,
          ImageUpload,
          Indent,
          IndentBlock,
          Italic,
          Link,
          LinkImage,
          List,
          ListProperties,
          MediaEmbed,
          Paragraph,
          PasteFromOffice,
          Table,
          TableCaption,
          TableCellProperties,
          TableColumnResize,
          TableProperties,
          TableToolbar,
          TextTransformation,
          TodoList,
          Underline,
        ],
        heading: {
          options: [
            {
              model: "paragraph",
              title: "Paragraph",
              class: "ck-heading_paragraph",
            },
            {
              model: "heading1",
              view: "h1",
              title: "Heading 1",
              class: "ck-heading_heading1",
            },
            {
              model: "heading2",
              view: "h2",
              title: "Heading 2",
              class: "ck-heading_heading2",
            },
            {
              model: "heading3",
              view: "h3",
              title: "Heading 3",
              class: "ck-heading_heading3",
            },
            {
              model: "heading4",
              view: "h4",
              title: "Heading 4",
              class: "ck-heading_heading4",
            },
            {
              model: "heading5",
              view: "h5",
              title: "Heading 5",
              class: "ck-heading_heading5",
            },
            {
              model: "heading6",
              view: "h6",
              title: "Heading 6",
              class: "ck-heading_heading6",
            },
          ],
        },
        image: {
          toolbar: [
            "toggleImageCaption",
            "imageTextAlternative",
            "|",
            "imageStyle:inline",
            "imageStyle:wrapText",
            "imageStyle:breakText",
            "|",
            "resizeImage",
          ],
        },
        // Explicitly use the stored initialValue to prevent re-renders disrupting content
        initialData: initialValue.current,
        licenseKey: LICENSE_KEY,
        link: {
          addTargetToExternalLinks: true,
          defaultProtocol: "https://",
          decorators: {
            toggleDownloadable: {
              mode: "manual",
              label: "Downloadable",
              attributes: {
                download: "file",
              },
            },
          },
        },
        list: {
          properties: {
            styles: true,
            startIndex: true,
            reversed: true,
          },
        },

        // Register the custom upload adapter plugin so image uploads are handled
        // by our backend `/api/upload` endpoint.
        extraPlugins: [CustomUploadAdapterPlugin],
        placeholder: `Type or paste your content here! `,
        table: {
          contentToolbar: [
            "tableColumn",
            "tableRow",
            "mergeTableCells",
            "tableProperties",
            "tableCellProperties",
          ],
        },
      },
    };
  }, [isLayoutReady]);

  const handleEditorChange = (event, editor) => {
    try {
      isUserEditingRef.current = true;
      const data = editor.getData();
      setEditorContent(data);
      lastContentRef.current = data;
      onChange(data);

      // Reset the flag after a short delay to allow batched updates
      setTimeout(() => {
        isUserEditingRef.current = false;
      }, 100);
    } catch (error) {
      console.error("Error handling editor change:", error);
      isUserEditingRef.current = false;
    }
  };

  const handleEditorReady = (editor) => {
    editorRef.current = editor;

    // Add focus/blur handlers to track user editing state
    editor.editing.view.document.on("focus", () => {
      isUserEditingRef.current = true;
    });

    editor.editing.view.document.on("blur", () => {
      // Small delay to ensure data is processed before setting editing to false
      setTimeout(() => {
        isUserEditingRef.current = false;
      }, 100);
    });

    // Set initial content again to be safe
    if (initialValue.current) {
      try {
        editor.setData(initialValue.current);
      } catch (error) {
        console.error("Error setting initial editor data:", error);
      }
    }

    setIsInitialized(true);
  };

  return (
    <div className="main-container">
      <div
        className="editor-container editor-container_classic-editor"
        ref={editorContainerRef}
      >
        <div className="editor-container__editor ">
          <div ref={editorRef}>
            {editorConfig && (
              <CKEditor
                editor={ClassicEditor}
                config={editorConfig}
                onReady={handleEditorReady}
                data={initialValue.current} // Use the preserved initial value
                onChange={handleEditorChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
