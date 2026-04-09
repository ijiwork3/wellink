import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  addHash?: boolean
  tagColor?: 'blue' | 'red' | 'gray'
}

export default function TagInput({
  tags,
  onChange,
  placeholder = '입력 후 Enter',
  addHash = false,
  tagColor = 'gray',
}: TagInputProps) {
  const [input, setInput] = useState('')

  const addTag = () => {
    const val = input.trim()
    if (!val) return
    const formatted = addHash ? (val.startsWith('#') ? val : `#${val}`) : val
    if (!tags.includes(formatted)) {
      onChange([...tags, formatted])
    }
    setInput('')
  }

  const removeTag = (tag: string) => {
    onChange(tags.filter(t => t !== tag))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    }
    if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-200 focus-visible:ring-2 focus-visible:ring-gray-900 transition-all"
        />
        <button
          type="button"
          onClick={addTag}
          className="text-sm bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-150"
        >
          추가
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <span
              key={tag}
              className={`flex items-center gap-1 text-xs border px-2.5 py-1 rounded-full ${colorMap[tagColor]}`}
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:opacity-70 transition-opacity"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
