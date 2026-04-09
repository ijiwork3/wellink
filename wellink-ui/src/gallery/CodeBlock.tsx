import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CodeBlockProps {
  code: string
  lang?: string
}

export default function CodeBlock({ code, lang = 'tsx' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code.trim())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-[#1E1E2E]">
      {/* 상단 바 */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#181825] border-b border-white/5">
        <span className="text-[11px] font-medium text-gray-500 uppercase tracking-widest">{lang}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      {/* 코드 */}
      <pre className="p-4 overflow-x-auto text-[12.5px] leading-relaxed text-gray-300 whitespace-pre">
        <code>{code.trim()}</code>
      </pre>
    </div>
  )
}
