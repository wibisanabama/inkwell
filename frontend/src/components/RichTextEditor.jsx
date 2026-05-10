import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { 
  FiBold, FiItalic, FiMinus, FiList, 
  FiHash, FiImage, FiLink, FiCode, FiMessageSquare 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../api/axios';

const MenuBar = ({ editor }) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!editor) return null;

  const addImage = useCallback(() => {
    // Trigger hidden file input
    fileInputRef.current?.click();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    const loadingToast = toast.loading('Uploading image...');

    try {
      const response = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const url = response.data.url;
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
      toast.success('Image uploaded', { id: loadingToast });
    } catch (error) {
      console.error('Upload error', error);
      toast.error(error.response?.data?.message || 'Failed to upload image', { id: loadingToast });
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    
    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  return (
    <div className="tiptap-toolbar">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`toolbar-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
        title="Bold"
      >
        <FiBold />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`toolbar-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
        title="Italic"
      >
        <FiItalic />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`toolbar-btn ${editor.isActive('strike') ? 'is-active' : ''}`}
        title="Strikethrough"
      >
        <FiMinus />
      </button>

      <div className="toolbar-divider" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
        title="Heading 2"
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`toolbar-btn ${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}`}
        title="Heading 3"
      >
        H3
      </button>

      <div className="toolbar-divider" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`toolbar-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`}
        title="Bullet List"
      >
        <FiList />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`toolbar-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`}
        title="Ordered List"
      >
        <FiHash />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`toolbar-btn ${editor.isActive('blockquote') ? 'is-active' : ''}`}
        title="Quote"
      >
        <FiMessageSquare />
      </button>

      <div className="toolbar-divider" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`toolbar-btn ${editor.isActive('codeBlock') ? 'is-active' : ''}`}
        title="Code Block"
      >
        <FiCode />
      </button>
      <button
        type="button"
        onClick={setLink}
        className={`toolbar-btn ${editor.isActive('link') ? 'is-active' : ''}`}
        title="Link"
      >
        <FiLink />
      </button>
      <button
        type="button"
        onClick={addImage}
        className="toolbar-btn"
        title="Add Image"
      >
        <FiImage />
      </button>
    </div>
  );
};

const RichTextEditor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update editor content if prop changes externally (e.g. initial load)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="tiptap-wrapper">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
