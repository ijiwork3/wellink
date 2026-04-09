import { useState } from 'react'
import Modal from '../../components/Modal'
import { PageHeader, StoryBlock } from '../StoryLayout'
import CodeBlock from '../CodeBlock'

export default function ModalStory() {
  const [openSm, setOpenSm] = useState(false)
  const [openMd, setOpenMd] = useState(false)
  const [openLg, setOpenLg] = useState(false)
  const [openNoTitle, setOpenNoTitle] = useState(false)

  return (
    <div>
      <PageHeader
        name="Modal"
        description="공통 모달 컴포넌트. 배경 클릭/X 버튼으로 닫기, body scroll lock, 3가지 사이즈 지원."
        importPath="@wellink/ui"
        props={[
          { name: 'open', type: 'boolean', description: '모달 열림 여부' },
          { name: 'onClose', type: '() => void', description: '닫기 핸들러' },
          { name: 'title', type: 'string', description: '모달 헤더 제목. 없으면 헤더 영역 숨김' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'sm=384px / md=512px / lg=672px' },
          { name: 'closeOnBackdrop', type: 'boolean', default: 'true', description: '배경 클릭 시 닫기 여부' },
        ]}
      />

      <StoryBlock title="Size Variants" description="버튼을 클릭해서 각 사이즈를 확인하세요.">
        <button onClick={() => setOpenSm(true)}
          className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
          Small
        </button>
        <button onClick={() => setOpenMd(true)}
          className="px-4 py-2 bg-[#8CC63F] text-white text-sm rounded-lg hover:bg-[#7AB535]">
          Medium (기본)
        </button>
        <button onClick={() => setOpenLg(true)}
          className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
          Large
        </button>
        <button onClick={() => setOpenNoTitle(true)}
          className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
          No Title
        </button>
      </StoryBlock>

      <Modal open={openSm} onClose={() => setOpenSm(false)} title="작은 모달" size="sm">
        <p className="text-sm text-gray-600">sm 사이즈 모달입니다. 확인/취소 같은 간단한 액션에 사용합니다.</p>
        <div className="flex gap-2 mt-4 justify-end">
          <button onClick={() => setOpenSm(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">취소</button>
          <button onClick={() => setOpenSm(false)} className="px-4 py-2 text-sm text-white bg-[#8CC63F] rounded-lg hover:bg-[#7AB535]">확인</button>
        </div>
      </Modal>

      <Modal open={openMd} onClose={() => setOpenMd(false)} title="기본 모달 (md)" size="md">
        <p className="text-sm text-gray-600 mb-4">md 사이즈는 기본값입니다. 대부분의 폼, 상세 정보에 사용합니다.</p>
        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500">콘텐츠 영역</div>
        <div className="flex gap-2 mt-4 justify-end">
          <button onClick={() => setOpenMd(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">닫기</button>
        </div>
      </Modal>

      <Modal open={openLg} onClose={() => setOpenLg(false)} title="큰 모달 (lg)" size="lg">
        <p className="text-sm text-gray-600 mb-4">lg 사이즈는 복잡한 폼이나 미리보기에 사용합니다.</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4 h-32 text-sm text-gray-500 flex items-center justify-center">영역 1</div>
          <div className="bg-gray-50 rounded-xl p-4 h-32 text-sm text-gray-500 flex items-center justify-center">영역 2</div>
        </div>
        <div className="flex gap-2 mt-4 justify-end">
          <button onClick={() => setOpenLg(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">닫기</button>
        </div>
      </Modal>

      <Modal open={openNoTitle} onClose={() => setOpenNoTitle(false)}>
        <div className="text-center py-4">
          <p className="text-lg font-semibold text-gray-900 mb-2">제목 없는 모달</p>
          <p className="text-sm text-gray-500 mb-4">title prop을 생략하면 헤더 없이 표시됩니다.</p>
          <button onClick={() => setOpenNoTitle(false)} className="px-6 py-2 text-sm text-white bg-[#8CC63F] rounded-lg hover:bg-[#7AB535]">닫기</button>
        </div>
      </Modal>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Usage</h3>
        <CodeBlock code={`import { Modal } from '@wellink/ui'

const [open, setOpen] = useState(false)

<Modal
  open={open}
  onClose={() => setOpen(false)}
  title="모달 제목"
  size="md"
>
  <p>모달 내용</p>
</Modal>`} />
      </div>
    </div>
  )
}
