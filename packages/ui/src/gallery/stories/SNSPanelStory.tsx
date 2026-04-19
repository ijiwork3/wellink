import SNSPanel from '../../components/SNSPanel'
import { PageHeader, StoryBlock } from '../StoryLayout'
import CodeBlock from '../CodeBlock'

export default function SNSPanelStory() {
  return (
    <div>
      <PageHeader
        name="SNSPanel"
        description="인플루언서의 SNS 계정 연결 상태를 표시. 연결된 계정은 핸들과 상태 표시, 미연결은 연결하기 버튼."
        importPath="@wellink/ui"
        props={[
          { name: 'platforms', type: 'PlatformConfig[]', default: 'all disconnected', description: '{ id, connected, handle? } 배열' },
          { name: 'onConnectClick', type: '(id: string) => void', description: '연결하기 버튼 클릭 핸들러' },
        ]}
      />

      <StoryBlock title="Partially Connected" description="일부 연결된 상태" bg="gray">
        <div className="w-72">
          <SNSPanel
            platforms={[
              { id: 'naver', connected: false },
              { id: 'instagram', connected: true, handle: 'chanstyler' },
              { id: 'youtube', connected: false },
            ]}
            onConnectClick={(p) => alert(`${p} 연결 페이지로 이동`)}
          />
        </div>
      </StoryBlock>

      <StoryBlock title="All Connected" bg="gray">
        <div className="w-72">
          <SNSPanel
            platforms={[
              { id: 'naver', connected: true, handle: 'chan_health' },
              { id: 'instagram', connected: true, handle: 'chanstyler' },
              { id: 'youtube', connected: true, handle: 'ChanHealthTV' },
            ]}
          />
        </div>
      </StoryBlock>

      <StoryBlock title="All Disconnected" bg="gray">
        <div className="w-72">
          <SNSPanel onConnectClick={(p) => alert(`${p} 연결`)} />
        </div>
      </StoryBlock>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Usage</h3>
        <CodeBlock code={`import { SNSPanel } from '@wellink/ui'
import { useNavigate } from 'react-router-dom'

function ProfilePage() {
  const navigate = useNavigate()
  return (
    <SNSPanel
      platforms={[
        { id: 'naver', connected: false },
        { id: 'instagram', connected: true, handle: 'chanstyler' },
        { id: 'youtube', connected: false },
      ]}
      onConnectClick={(platform) => {
        navigate(\`/media?connect=\${platform}\`)
      }}
    />
  )
}`} />
      </div>
    </div>
  )
}
