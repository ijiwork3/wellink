import KPICard from '../../components/KPICard'
import { PageHeader, StoryBlock } from '../StoryLayout'
import CodeBlock from '../CodeBlock'
import { Users, Eye, TrendingUp } from 'lucide-react'

export default function KPICardStory() {
  return (
    <div>
      <PageHeader
        name="KPICard"
        description="지표 요약 카드. trend 값으로 상승/하락 표시, tooltip으로 지표 설명을 제공합니다."
        importPath="@wellink/ui"
        props={[
          { name: 'title', type: 'string', description: '지표 제목' },
          { name: 'value', type: 'string | number', description: '주요 수치' },
          { name: 'sub', type: 'string', description: '보조 텍스트 (값 아래)' },
          { name: 'trend', type: 'number', description: '전주 대비 증감률. 양수=초록, 음수=빨강' },
          { name: 'trendLabel', type: 'string', description: 'trend 옆 보조 라벨 (예: "전주 대비")' },
          { name: 'icon', type: 'ReactNode', description: '우측 상단 아이콘' },
          { name: 'valueColor', type: 'string', description: "값 색상 커스텀 (예: 'text-blue-600')" },
          { name: 'tooltip', type: 'string', description: 'Info 아이콘 hover 시 표시되는 설명' },
        ]}
      />

      <StoryBlock title="Basic" bg="gray">
        <div className="grid grid-cols-3 gap-4 w-full">
          <KPICard title="총 인플루언서" value="1,248" sub="전체 등록" trend={12.5} trendLabel="전주 대비" icon={<Users size={16} />} />
          <KPICard title="총 노출수" value="842K" sub="이번 달" trend={-3.2} trendLabel="전월 대비" icon={<Eye size={16} />} />
          <KPICard title="평균 참여율" value="4.8%" trend={0.3} trendLabel="전주 대비" icon={<TrendingUp size={16} />} />
        </div>
      </StoryBlock>

      <StoryBlock title="With Tooltip" description="Info 아이콘에 마우스를 올려보세요.">
        <div className="w-56">
          <KPICard
            title="진성 팔로워율"
            value="78.3%"
            tooltip="봇·비활성 계정을 제외한 실제 팔로워 비율"
            trend={1.2}
          />
        </div>
      </StoryBlock>

      <StoryBlock title="Custom Value Color" bg="gray">
        <div className="grid grid-cols-3 gap-4 w-full">
          <KPICard title="성공 캠페인" value="24" valueColor="text-emerald-600" />
          <KPICard title="반려 건수" value="3" valueColor="text-rose-500" />
          <KPICard title="대기 중" value="7" valueColor="text-amber-600" />
        </div>
      </StoryBlock>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Usage</h3>
        <CodeBlock code={`import { KPICard } from '@wellink/ui'
import { Users } from 'lucide-react'

<KPICard
  title="총 인플루언서"
  value="1,248"
  sub="전체 등록"
  trend={12.5}
  trendLabel="전주 대비"
  icon={<Users size={16} />}
  tooltip="플랫폼에 등록된 인플루언서 수"
/>`} />
      </div>
    </div>
  )
}
