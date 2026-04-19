import { useState } from 'react'
import CustomSelect from '../../components/CustomSelect'
import TagInput from '../../components/TagInput'
import FileUpload from '../../components/FileUpload'
import Toggle from '../../components/Toggle'
import CustomCheckbox from '../../components/CustomCheckbox'
import Dropdown from '../../components/Dropdown'
import { PageHeader, StoryBlock } from '../StoryLayout'
import CodeBlock from '../CodeBlock'
import { MoreHorizontal } from 'lucide-react'

export default function FormStory() {
  const [single, setSingle] = useState('')
  const [multi, setMulti] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>(['뷰티', '라이프스타일'])
  const [hashTags, setHashTags] = useState<string[]>(['#건강', '#운동'])
  const [toggle1, setToggle1] = useState(true)
  const [toggle2, setToggle2] = useState(false)
  const [check1, setCheck1] = useState(true)
  const [check2, setCheck2] = useState(false)
  const [check3, setCheck3] = useState(false)

  const options = [
    { label: '뷰티·화장품', value: 'beauty' },
    { label: '스포츠·건강', value: 'sports' },
    { label: '푸드·요리', value: 'food' },
    { label: '여행·라이프', value: 'travel' },
    { label: '패션·스타일', value: 'fashion' },
  ]

  return (
    <div>
      <PageHeader
        name="Form Components"
        description="CustomSelect, TagInput, FileUpload, Toggle, CustomCheckbox, Dropdown — 입력·선택 관련 컴포넌트 묶음."
        importPath="@wellink/ui"
      />

      {/* CustomSelect */}
      <h2 className="text-base font-bold text-gray-900 mb-4 mt-2">CustomSelect</h2>
      <StoryBlock title="Single Select">
        <div className="w-64">
          <CustomSelect value={single} onChange={v => setSingle(v as string)} options={options} placeholder="카테고리 선택" />
          {single && <p className="mt-2 text-xs text-gray-500">선택됨: <span className="font-medium text-gray-900">{single}</span></p>}
        </div>
      </StoryBlock>
      <StoryBlock title="Multiple Select" description="multiple=true 시 다중 선택 가능.">
        <div className="w-64">
          <CustomSelect value={multi} onChange={v => setMulti(v as string[])} options={options} placeholder="카테고리 복수 선택" multiple />
          {multi.length > 0 && <p className="mt-2 text-xs text-gray-500">선택됨: <span className="font-medium text-gray-900">{multi.join(', ')}</span></p>}
        </div>
      </StoryBlock>
      <div className="mb-8">
        <CodeBlock code={`// 단일 선택
<CustomSelect
  value={value}
  onChange={(v) => setValue(v as string)}
  options={[{ label: '뷰티', value: 'beauty' }, ...]}
  placeholder="카테고리 선택"
/>

// 다중 선택
<CustomSelect
  value={selected}
  onChange={(v) => setSelected(v as string[])}
  options={options}
  multiple
/>`} />
      </div>

      {/* TagInput */}
      <h2 className="text-base font-bold text-gray-900 mb-4">TagInput</h2>
      <StoryBlock title="Default Tags">
        <div className="w-full max-w-sm">
          <TagInput tags={tags} onChange={setTags} placeholder="카테고리 입력 후 Enter" />
        </div>
      </StoryBlock>
      <StoryBlock title="Hashtag Mode" description="addHash=true 시 # 자동 prefix.">
        <div className="w-full max-w-sm">
          <TagInput tags={hashTags} onChange={setHashTags} placeholder="#해시태그 입력" addHash tagColor="blue" />
        </div>
      </StoryBlock>
      <div className="mb-8">
        <CodeBlock code={`<TagInput
  tags={tags}
  onChange={setTags}
  placeholder="카테고리 입력 후 Enter"
  tagColor="gray"  // 'gray' | 'blue' | 'red'
/>

// 해시태그 모드
<TagInput tags={hashTags} onChange={setHashTags} addHash tagColor="blue" />`} />
      </div>

      {/* Toggle & Checkbox */}
      <h2 className="text-base font-bold text-gray-900 mb-4">Toggle & CustomCheckbox</h2>
      <StoryBlock title="Toggle">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Toggle checked={toggle1} onChange={() => setToggle1(v => !v)} />
            <span className="text-sm text-gray-600">{toggle1 ? 'ON' : 'OFF'}</span>
          </div>
          <div className="flex items-center gap-3">
            <Toggle checked={toggle2} onChange={() => setToggle2(v => !v)} />
            <span className="text-sm text-gray-600">{toggle2 ? 'ON' : 'OFF'}</span>
          </div>
        </div>
      </StoryBlock>
      <StoryBlock title="CustomCheckbox">
        <div className="flex flex-col gap-3">
          <CustomCheckbox checked={check1} onChange={() => setCheck1(v => !v)} label="인스타그램 포스팅 동의" />
          <CustomCheckbox checked={check2} onChange={() => setCheck2(v => !v)} label="개인정보 수집 동의 (필수)" />
          <CustomCheckbox checked={check3} onChange={() => setCheck3(v => !v)} label="마케팅 수신 동의 (선택)" />
        </div>
      </StoryBlock>

      {/* Dropdown */}
      <h2 className="text-base font-bold text-gray-900 mb-4">Dropdown</h2>
      <StoryBlock title="Dropdown Menu">
        <Dropdown trigger={<button type="button" className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"><MoreHorizontal size={14} /> 더보기</button>}>
          <div className="py-1 min-w-[140px]">
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">상세보기</button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">수정</button>
            <button className="w-full text-left px-4 py-2 text-sm text-rose-500 hover:bg-rose-50">삭제</button>
          </div>
        </Dropdown>
      </StoryBlock>

      {/* FileUpload */}
      <h2 className="text-base font-bold text-gray-900 mb-4">FileUpload</h2>
      <StoryBlock title="Drag & Drop" bg="gray">
        <div className="w-full">
          <FileUpload hint="브랜드 가이드라인, 이미지 파일 등을 첨부하세요" />
        </div>
      </StoryBlock>
    </div>
  )
}
