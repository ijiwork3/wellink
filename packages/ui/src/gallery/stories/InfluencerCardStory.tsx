import InfluencerCard from '../../components/InfluencerCard'
import { PageHeader, StoryBlock } from '../StoryLayout'
import CodeBlock from '../CodeBlock'

const sampleInfluencer = {
  id: 1,
  name: '김찬기',
  platform: '인스타그램/유튜브',
  followers: 85000,
  engagement: 4.2,
  authentic: 91,
  category: ['뷰티', '라이프스타일'],
}

export default function InfluencerCardStory() {
  return (
    <div>
      <PageHeader
        name="InfluencerCard"
        description="인플루언서 정보를 카드 형태로 표시. 선택(체크) 인터랙션 포함."
        importPath="@wellink/ui"
        props={[
          { name: 'influencer', type: 'Influencer', description: 'id, name, platform, followers, engagement, authentic, category 포함 객체' },
          { name: 'selected', type: 'boolean', description: '선택 상태 (체크 표시 + 테두리 강조)' },
          { name: 'onToggle', type: '() => void', description: '체크 버튼 클릭 핸들러. 없으면 체크버튼 숨김' },
          { name: 'onClick', type: '() => void', description: '카드 전체 클릭 핸들러' },
        ]}
      />

      <StoryBlock title="Default" bg="gray">
        <div className="w-72">
          <InfluencerCard influencer={sampleInfluencer} />
        </div>
      </StoryBlock>

      <StoryBlock title="Selectable" description="onToggle을 주면 체크 버튼이 나타납니다." bg="gray">
        <div className="flex gap-4">
          <div className="w-72">
            <InfluencerCard influencer={sampleInfluencer} selected={false} onToggle={() => {}} />
          </div>
          <div className="w-72">
            <InfluencerCard influencer={{ ...sampleInfluencer, id: 2, name: '이수진' }} selected={true} onToggle={() => {}} />
          </div>
        </div>
      </StoryBlock>

      <StoryBlock title="Multiple Platforms" bg="gray">
        <div className="w-72">
          <InfluencerCard influencer={{
            id: 3, name: '박지민', platform: '인스타그램/유튜브/틱톡',
            followers: 120000, engagement: 5.1, authentic: 87,
            category: ['스포츠', '건강', '뷰티'],
          }} />
        </div>
      </StoryBlock>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Usage</h3>
        <CodeBlock code={`import { InfluencerCard } from '@wellink/ui'

const influencer = {
  id: 1,
  name: '김찬기',
  platform: '인스타그램/유튜브',  // '/'로 구분
  followers: 85000,
  engagement: 4.2,
  authentic: 91,
  category: ['뷰티', '라이프스타일'],
}

// 기본
<InfluencerCard influencer={influencer} onClick={() => navigate('/...')} />

// 선택 가능
<InfluencerCard
  influencer={influencer}
  selected={isSelected}
  onToggle={() => toggleSelect(influencer.id)}
/>`} />
      </div>
    </div>
  )
}
