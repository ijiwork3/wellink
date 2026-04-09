import { ToastProvider, useToast } from '../../components/Toast'
import { PageHeader, StoryBlock } from '../StoryLayout'
import CodeBlock from '../CodeBlock'

function ToastTrigger() {
  const { showToast } = useToast()
  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => showToast('저장되었습니다.', 'success')}
        className="px-4 py-2 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600"
      >
        Success
      </button>
      <button
        onClick={() => showToast('오류가 발생했습니다.', 'error')}
        className="px-4 py-2 bg-rose-500 text-white text-sm rounded-lg hover:bg-rose-600"
      >
        Error
      </button>
      <button
        onClick={() => showToast('캠페인이 검토 중입니다.', 'info')}
        className="px-4 py-2 bg-sky-500 text-white text-sm rounded-lg hover:bg-sky-600"
      >
        Info
      </button>
    </div>
  )
}

export default function ToastStory() {
  return (
    <div>
      <PageHeader
        name="Toast / useToast"
        description="Context + Provider 패턴의 토스트 알림. App 최상단에 ToastProvider를 래핑하고, useToast() hook으로 호출합니다."
        importPath="@wellink/ui"
        props={[
          { name: 'showToast(message, type)', type: 'function', description: "message: 텍스트 / type: 'success' | 'error' | 'info' (기본 'success')" },
        ]}
      />

      <StoryBlock title="Live Demo" description="버튼을 클릭해 토스트를 띄워보세요. 3초 후 자동 사라집니다.">
        <ToastProvider>
          <ToastTrigger />
        </ToastProvider>
      </StoryBlock>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Setup — App.tsx</h3>
        <CodeBlock code={`import { ToastProvider } from '@wellink/ui'

function App() {
  return (
    <ToastProvider>
      <Router>
        {/* ... */}
      </Router>
    </ToastProvider>
  )
}`} />
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Usage — 컴포넌트 내부</h3>
        <CodeBlock code={`import { useToast } from '@wellink/ui'

function MyComponent() {
  const { showToast } = useToast()

  const handleSave = async () => {
    await save()
    showToast('저장되었습니다.', 'success')
  }

  const handleError = () => {
    showToast('오류가 발생했습니다.', 'error')
  }
}`} />
      </div>
    </div>
  )
}
