'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'

interface RichEditorProps {
  name: string
  defaultValue?: string
  initialContent?: string
  placeholder?: string
  onChange?: (html: string) => void
}

export default function RichEditor({ name, defaultValue = '', initialContent, placeholder, onChange }: RichEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent ?? defaultValue,
    editorProps: {
      attributes: {
        style: 'min-height: 180px; outline: none; padding: 14px 16px; font-size: 14px; line-height: 1.7; color: var(--text)',
      },
    },
    onUpdate({ editor }) {
      onChange?.(editor.getHTML())
    },
  })

  useEffect(() => {
    return () => { editor?.destroy() }
  }, [editor])

  const html = editor?.getHTML() ?? defaultValue

  const btnStyle = (active: boolean): React.CSSProperties => ({
    width: '30px', height: '30px', borderRadius: '6px',
    background: active ? 'var(--primary)' : 'transparent',
    color: active ? '#fff' : 'var(--text-muted)',
    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '13px', fontWeight: 700,
    transition: 'all 0.15s',
  })

  return (
    <div>
      <input type="hidden" name={name} value={html} />
      <div style={{
        background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--shadow-in)', overflow: 'hidden',
      }}>
        {/* Toolbar */}
        <div style={{
          display: 'flex', gap: '2px', padding: '8px 10px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
        }}>
          {[
            { label: 'B', action: () => editor?.chain().focus().toggleBold().run(), mark: 'bold' },
            { label: 'I', action: () => editor?.chain().focus().toggleItalic().run(), mark: 'italic' },
            { label: 'S', action: () => editor?.chain().focus().toggleStrike().run(), mark: 'strike' },
          ].map(({ label, action, mark }) => (
            <button key={mark} type="button" onClick={action} style={btnStyle(editor?.isActive(mark) ?? false)}>
              {label}
            </button>
          ))}
          <div style={{ width: '1px', background: 'var(--border)', margin: '0 4px' }} />
          <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()}
            style={btnStyle(editor?.isActive('bulletList') ?? false)}>
            ≡
          </button>
          <button type="button" onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            style={btnStyle(editor?.isActive('orderedList') ?? false)}>
            1.
          </button>
          <div style={{ width: '1px', background: 'var(--border)', margin: '0 4px' }} />
          <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            style={btnStyle(editor?.isActive('heading', { level: 2 }) ?? false)}>
            H2
          </button>
          <button type="button" onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            style={btnStyle(editor?.isActive('blockquote') ?? false)}>
            "
          </button>
        </div>

        {/* Editor area */}
        {editor ? (
          <EditorContent editor={editor} />
        ) : (
          <div style={{ minHeight: '180px', padding: '14px 16px', fontSize: '14px', color: 'var(--text-muted)' }}>
            {placeholder}
          </div>
        )}
      </div>
    </div>
  )
}
