/**
 * FileUpload — 파일 업로드 컴포넌트
 * 드래그앤드롭 + 클릭 업로드 지원
 * multiple: true 시 다중 파일 (기본값)
 */

import { useState, useRef, type DragEvent, type KeyboardEvent } from 'react'
import { Upload, X, FileText } from 'lucide-react'

interface FileUploadProps {
  onFilesChange?: (files: File[]) => void
  accept?: string
  multiple?: boolean
  hint?: string
}

export default function FileUpload({
  onFilesChange,
  accept,
  multiple = true,
  hint = '브랜드 가이드라인, 이미지 파일 등을 첨부하세요',
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return
    const arr = Array.from(newFiles)
    const updated = multiple ? [...files, ...arr] : arr
    setFiles(updated)
    onFilesChange?.(updated)
  }

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index)
    setFiles(updated)
    onFilesChange?.(updated)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      inputRef.current?.click()
    }
  }

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        aria-label="파일 업로드 영역. 클릭하거나 파일을 드래그하세요"
        onClick={() => inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green/50
          ${dragging ? 'border-brand-green bg-brand-green/5' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'}`}
      >
        <Upload size={20} className="text-gray-400" aria-hidden="true" />
        <p className="text-sm text-gray-500 text-center">{hint}</p>
        <p className="text-xs text-gray-400">클릭하거나 파일을 드래그하세요</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
          onChange={e => addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div role="list" className="space-y-1.5">
          {files.map((file, i) => (
            <div
              key={i}
              role="listitem"
              className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100"
            >
              <FileText size={14} className="text-gray-400 shrink-0" aria-hidden="true" />
              <span className="flex-1 text-xs text-gray-700 truncate">{file.name}</span>
              <span className="text-xs text-gray-400 shrink-0">
                {(file.size / 1024).toFixed(0)}KB
              </span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                aria-label={`${file.name} 삭제`}
                className="text-gray-400 hover:text-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-green/50 rounded"
              >
                <X size={13} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
