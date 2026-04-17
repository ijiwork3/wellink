import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'

const MAX_TAGS = 10

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  addHash?: boolean
  tagColor?: 'brand' | 'red' | 'gray'
}

export default function TagInput({
  tags,
  onChange,
  placeholder = '입력 후 Enter',
  addHash = false,
  tagColor = 'gray',
}: TagInputProps) {
  const [input, setInput] = useState('')

  const isMaxReached = tags.length >= MAX_TAGS

  const addTag = () => {
    const val = input.trim()
    if (!val) return
    if (isMaxReached) return
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
    brand: 'bg-[#8CC63F]/10 text-[#5a8228] border-[#8CC63F]/30',
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
          placeholder={isMaxReached ? `태그는 최대 ${MAX_TAGS}개까지 입력 가능합니다` : placeholder}
          disabled={isMaxReached}
          className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-200 focus-visible:ring-2 focus-visible:ring-gray-900 transition-all disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={addTag}
          disabled={isMaxReached}
          className="text-sm bg-gray-100 text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-200 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          추가
        </button>
      </div>
      {isMaxReached && (
        <p className="text-xs text-amber-600">태그는 최대 {MAX_TAGS}개까지 입력할 수 있습니다.</p>
      )}
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
                aria-label={`${tag} 태그 삭제`}
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
