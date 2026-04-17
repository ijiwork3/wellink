import { useState, useRef, type DragEvent } from 'react'
import { Upload, X, FileText } from 'lucide-react'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_FILE_COUNT = 5

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
  const [fileError, setFileError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  /** accept 문자열(e.g. "image/*,.pdf") 기반 MIME 타입 검사 */
  const isAccepted = (file: File): boolean => {
    if (!accept) return true
    const acceptList = accept.split(',').map(s => s.trim())
    return acceptList.some(pattern => {
      if (pattern.startsWith('.')) {
        return file.name.toLowerCase().endsWith(pattern.toLowerCase())
      }
      if (pattern.endsWith('/*')) {
        return file.type.startsWith(pattern.slice(0, -1))
      }
      return file.type === pattern
    })
  }

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return
    setFileError(null)
    const incoming = Array.from(newFiles)

    // 파일 타입 검사
    const invalidType = incoming.find(f => !isAccepted(f))
    if (invalidType) {
      setFileError(`'${invalidType.name}'은(는) 허용되지 않는 파일 형식입니다.`)
      return
    }

    // 파일 크기 검사
    const oversize = incoming.find(f => f.size > MAX_FILE_SIZE)
    if (oversize) {
      setFileError(`'${oversize.name}'은(는) 파일 크기가 10MB를 초과합니다.`)
      return
    }

    const combined = multiple ? [...files, ...incoming] : incoming

    // 파일 개수 제한
    if (combined.length > MAX_FILE_COUNT) {
      setFileError(`파일은 최대 ${MAX_FILE_COUNT}개까지 첨부할 수 있습니다.`)
      return
    }

    setFiles(combined)
    onFilesChange?.(combined)
  }

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index)
    setFiles(updated)
    setFileError(null)
    onFilesChange?.(updated)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-2">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-150
          ${dragging ? 'border-gray-400 bg-gray-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'}`}
      >
        <Upload size={20} className="text-gray-400" />
        <p className="text-sm text-gray-500 text-center">{hint}</p>
        <p className="text-xs text-gray-400">클릭하거나 파일을 드래그하세요 (최대 {MAX_FILE_COUNT}개, 10MB 이하)</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={e => { addFiles(e.target.files); e.target.value = '' }}
        />
      </div>
      {fileError && (
        <p className="text-xs text-red-500 flex items-center gap-1">{fileError}</p>
      )}

      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100"
            >
              <FileText size={14} className="text-gray-400 shrink-0" />
              <span className="flex-1 text-xs text-gray-700 truncate">{file.name}</span>
              <span className="text-xs text-gray-400 shrink-0">
                {(file.size / 1024).toFixed(0)}KB
              </span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                aria-label="파일 삭제"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
