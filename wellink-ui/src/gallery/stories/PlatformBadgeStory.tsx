import PlatformBadge from '../../components/PlatformBadge'
import { PageHeader, StoryBlock } from '../StoryLayout'
import CodeBlock from '../CodeBlock'

export default function PlatformBadgeStory() {
  return (
    <div>
      <PageHeader
        name="PlatformBadge"
        description="SNS 플랫폼을 시각화하는 배지. 인스타그램 / 유튜브 / 블로그 / 틱톡을 지원하며 한국어·영어 모두 입력 가능합니다."
        importPath="@wellink/ui"
        props={[
          { name: 'platform', type: 'string', description: "'instagram' | '인스타그램' | 'youtube' | '유튜브' | 'blog' | '블로그' | 'tiktok' | '틱톡'" },
          { name: 'className', type: 'string', description: '추가 Tailwind 클래스' },
        ]}
      />

      <StoryBlock title="All Platforms">
        <PlatformBadge platform="instagram" />
        <PlatformBadge platform="youtube" />
        <PlatformBadge platform="blog" />
        <PlatformBadge platform="tiktok" />
      </StoryBlock>

      <StoryBlock title="Korean Input" description="한국어 플랫폼명도 동일하게 처리됩니다.">
        <PlatformBadge platform="인스타그램" />
        <PlatformBadge platform="유튜브" />
        <PlatformBadge platform="블로그" />
        <PlatformBadge platform="틱톡" />
      </StoryBlock>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Usage</h3>
        <CodeBlock code={`import { PlatformBadge } from '@wellink/ui'

<PlatformBadge platform="instagram" />
<PlatformBadge platform="유튜브" />
<PlatformBadge platform="blog" />`} />
      </div>
    </div>
  )
}
