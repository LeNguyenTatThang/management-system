import { useState, useRef, useCallback } from 'react';
import { Bold, Italic, List, ListOrdered, RemoveFormatting } from 'lucide-react';

export default function RichTextEditor({ value, onChange, placeholder }) {
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
    <div className={`border rounded-lg overflow-hidden ${isFocused ? 'border-primary shadow-sm' : 'border-gray-200'}`}>
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200 flex-wrap">
        <button type="button" className="p-1.5 rounded hover:bg-gray-200 text-muted hover:text-main transition"
          onClick={() => exec('bold')} title="Bold"><Bold size={16} /></button>
        <button type="button" className="p-1.5 rounded hover:bg-gray-200 text-muted hover:text-main transition"
          onClick={() => exec('italic')} title="Italic"><Italic size={16} /></button>
        <span className="w-px h-5 bg-gray-300 mx-1" />
        <button type="button" className="p-1.5 rounded hover:bg-gray-200 text-muted hover:text-main transition"
          onClick={() => exec('insertUnorderedList')} title="Danh sách bullet"><List size={16} /></button>
        <button type="button" className="p-1.5 rounded hover:bg-gray-200 text-muted hover:text-main transition"
          onClick={() => exec('insertOrderedList')} title="Danh sách đánh số"><ListOrdered size={16} /></button>
        <span className="w-px h-5 bg-gray-300 mx-1" />
        <button type="button" className="p-1.5 rounded hover:bg-gray-200 text-muted hover:text-main transition"
          onClick={() => exec('removeFormat')} title="Clear formatting"><RemoveFormatting size={16} /></button>
      </div>
      <div
        ref={editorRef}
        className="px-3 py-2 min-h-32 text-sm outline-none"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onPaste={handlePaste}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
        style={value ? {} : { '--placeholder': placeholder || '' }}
      />
      <style>{`
        [contentEditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
