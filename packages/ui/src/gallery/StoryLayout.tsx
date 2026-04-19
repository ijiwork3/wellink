import type { ReactNode } from 'react'

interface StoryBlockProps {
  title: string
  description?: string
  children: ReactNode
  bg?: 'white' | 'gray' | 'dark'
}

export function StoryBlock({ title, description, children, bg = 'white' }: StoryBlockProps) {
  const bgClass = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    dark: 'bg-gray-900',
  }[bg]

  return (
    <div className="mb-8">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <div className={`rounded-xl border border-gray-200 ${bgClass} p-6 flex flex-wrap items-start gap-3`}>
        {children}
      </div>
    </div>
  )
}

interface PageHeaderProps {
  name: string
  description: string
  importPath: string
  props?: { name: string; type: string; default?: string; description: string }[]
}

export function PageHeader({ name, description, importPath, props }: PageHeaderProps) {
  return (
    <div className="mb-10 pb-8 border-b border-gray-200">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
        <span className="text-xs font-medium bg-brand-green/10 text-brand-green-text px-2.5 py-1 rounded-full">Component</span>
      </div>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <div className="inline-flex items-center gap-2 bg-gray-900 text-gray-300 text-xs px-4 py-2 rounded-lg font-mono">
        <span className="text-gray-500">import</span>
        <span className="text-blue-400">{`{ ${name} }`}</span>
        <span className="text-gray-500">from</span>
        <span className="text-green-400">'{importPath}'</span>
      </div>

      {props && props.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Props</h2>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2.5 text-gray-600 font-semibold w-36">Name</th>
                  <th className="text-left px-4 py-2.5 text-gray-600 font-semibold w-48">Type</th>
                  <th className="text-left px-4 py-2.5 text-gray-600 font-semibold w-24">Default</th>
                  <th className="text-left px-4 py-2.5 text-gray-600 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {props.map(p => (
                  <tr key={p.name}>
                    <td className="px-4 py-2.5 font-mono text-blue-600 font-medium">{p.name}</td>
                    <td className="px-4 py-2.5 font-mono text-rose-500">{p.type}</td>
                    <td className="px-4 py-2.5 font-mono text-gray-500">{p.default ?? '—'}</td>
                    <td className="px-4 py-2.5 text-gray-600">{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
