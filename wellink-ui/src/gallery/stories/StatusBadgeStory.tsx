import StatusBadge from '../../components/StatusBadge'
import { PageHeader, StoryBlock } from '../StoryLayout'
import CodeBlock from '../CodeBlock'

export default function StatusBadgeStory() {
  const allStatuses = [
    '모집중', '진행중',
    '대기중', '신청완료', '콘텐츠대기',
    '검수중',
    '완료', '종료', '마감', '게시완료', '포인트지급',
    '반려', '마감임박',
  ]

  return (
    <div>
      <PageHeader
        name="StatusBadge"
        description="캠페인·인플루언서 상태를 시각화하는 배지. 5가지 시맨틱 그룹으로 분류되며 원색 사용을 금지합니다."
        importPath="@wellink/ui"
        props={[
          { name: 'status', type: 'string', description: '상태 텍스트 (한국어). 매핑되지 않으면 slate 기본값' },
          { name: 'size', type: "'sm' | 'md'", default: "'sm'", description: '배지 크기' },
          { name: 'dot', type: 'boolean', default: 'true', description: '앞쪽 상태 점 표시 여부' },
          { name: 'className', type: 'string', description: '추가 Tailwind 클래스' },
        ]}
      />

      {/* 5그룹 전체 */}
      <StoryBlock title="5-Group Color Policy" description="상태를 맥락별로 5개 그룹으로 분류합니다.">
        <div className="w-full space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-gray-400 w-20 shrink-0">active</span>
            <StatusBadge status="모집중" />
            <StatusBadge status="진행중" />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-gray-400 w-20 shrink-0">pending</span>
            <StatusBadge status="대기중" />
            <StatusBadge status="신청완료" />
            <StatusBadge status="콘텐츠대기" />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-gray-400 w-20 shrink-0">review</span>
            <StatusBadge status="검수중" />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-gray-400 w-20 shrink-0">done</span>
            <StatusBadge status="완료" />
            <StatusBadge status="종료" />
            <StatusBadge status="마감" />
            <StatusBadge status="게시완료" />
            <StatusBadge status="포인트지급" />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-gray-400 w-20 shrink-0">alert</span>
            <StatusBadge status="반려" />
            <StatusBadge status="마감임박" />
          </div>
        </div>
      </StoryBlock>

      {/* size 비교 */}
      <StoryBlock title="Size" description="sm(기본) / md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <StatusBadge status="모집중" size="sm" />
            <span className="text-xs text-gray-400">sm</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status="모집중" size="md" />
            <span className="text-xs text-gray-400">md</span>
          </div>
        </div>
      </StoryBlock>

      {/* dot 옵션 */}
      <StoryBlock title="Dot Option">
        <StatusBadge status="진행중" dot={true} />
        <StatusBadge status="진행중" dot={false} />
      </StoryBlock>

      {/* 전체 목록 */}
      <StoryBlock title="All States" bg="gray">
        {allStatuses.map(s => <StatusBadge key={s} status={s} />)}
      </StoryBlock>

      {/* 코드 */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Usage</h3>
        <CodeBlock code={`import { StatusBadge } from '@wellink/ui'

// 기본
<StatusBadge status="모집중" />

// 크기
<StatusBadge status="검수중" size="md" />

// 점 없이
<StatusBadge status="완료" dot={false} />`} />
      </div>
    </div>
  )
}
