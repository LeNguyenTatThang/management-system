import { useState, useRef, useCallback } from 'react';
import { Bold, Italic, List, ListOrdered, RemoveFormatting } from 'lucide-react';

export default function RichTextEditor({ value, onChange, placeholder, label, required, error }) {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  const exec = useCallback((cmd) => {
    document.execCommand(cmd, false, null);
    editorRef.current?.focus();
    if (onChange) onChange(editorRef.current?.innerHTML || '');
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (onChange) onChange(editorRef.current?.innerHTML || '');
  }, [onChange]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    if (onChange) onChange(editorRef.current?.innerHTML || '');
  }, [onChange]);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold mb-1">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <div className={`rounded-lg overflow-hidden border transition duration-200
        ${error ? 'border-danger' : isFocused ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-gray-300'}`}
      >
        <div className="flex items-center gap-0.5 px-3 py-2 bg-gray-50 border-b border-gray-200 flex-wrap">
          <button type="button" className="p-1.5 rounded hover:bg-gray-200 text-muted hover:text-main transition"
            onClick={() => exec('bold')} title="Bold"><Bold size={15} /></button>
          <button type="button" className="p-1.5 rounded hover:bg-gray-200 text-muted hover:text-main transition"
            onClick={() => exec('italic')} title="Italic"><Italic size={15} /></button>
          <span className="w-px h-5 bg-gray-300 mx-1" />
          <button type="button" className="p-1.5 rounded hover:bg-gray-200 text-muted hover:text-main transition"
            onClick={() => exec('insertUnorderedList')} title="Danh sách"><List size={15} /></button>
          <button type="button" className="p-1.5 rounded hover:bg-gray-200 text-muted hover:text-main transition"
            onClick={() => exec('insertOrderedList')} title="Danh sách số"><ListOrdered size={15} /></button>
          <span className="w-px h-5 bg-gray-300 mx-1" />
          <button type="button" className="p-1.5 rounded hover:bg-gray-200 text-muted hover:text-main transition"
            onClick={() => exec('removeFormat')} title="Xóa định dạng"><RemoveFormatting size={15} /></button>
        </div>
        <div
          ref={editorRef}
          className="px-4 py-3 min-h-[120px] text-sm outline-none text-gray-900 leading-relaxed"
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onPaste={handlePaste}
          dangerouslySetInnerHTML={{ __html: value }}
          data-placeholder={placeholder || ''}
        />
      </div>
      <style>{`
        [contentEditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        [contentEditable]:focus {
          outline: none;
        }
      `}</style>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}
