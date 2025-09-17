import React, { useState } from 'react';
import './MarkdownEditor.css';

const MarkdownEditor = ({ value, onChange }) => {
  const [activeTab, setActiveTab] = useState('write');

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const insertMarkdown = (before, after = '') => {
    const textarea = document.getElementById('markdown-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    onChange(newText);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 10);
  };

  const renderPreview = (text) => {
    if (!text) return '<p>Nothing to preview</p>';
    
    let html = text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/```([^`]+)```/gim, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      .replace(/\n\n/gim, '</p><p>')
      .replace(/\n/gim, '<br>');

    return `<p>${html}</p>`;
  };

  return (
    <div className="markdown-editor">
      <div className="editor-header">
        <div className="tabs">
          <button
            type="button"
            className={`tab ${activeTab === 'write' ? 'active' : ''}`}
            onClick={() => setActiveTab('write')}
          >
            Write
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>
        </div>
        
        {activeTab === 'write' && (
          <div className="toolbar">
            <button type="button" onClick={() => insertMarkdown('**', '**')} title="Bold">
              <strong>B</strong>
            </button>
            <button type="button" onClick={() => insertMarkdown('*', '*')} title="Italic">
              <em>I</em>
            </button>
            <button type="button" onClick={() => insertMarkdown('# ', '')} title="Header">
              H1
            </button>
            <button type="button" onClick={() => insertMarkdown('[', '](url)')} title="Link">
              🔗
            </button>
            <button type="button" onClick={() => insertMarkdown('`', '`')} title="Code">
              {'</>'}
            </button>
            <button type="button" onClick={() => insertMarkdown('```\n', '\n```')} title="Code Block">
              {'{ }'}
            </button>
          </div>
        )}
      </div>

      <div className="editor-content">
        {activeTab === 'write' ? (
          <textarea
            id="markdown-textarea"
            value={value}
            onChange={handleChange}
            placeholder="Write your post content in Markdown..."
            rows="15"
          />
        ) : (
          <div 
            className="preview-content"
            dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
          />
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;