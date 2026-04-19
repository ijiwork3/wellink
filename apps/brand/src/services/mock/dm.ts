// Mock data — replace with API calls when backend is ready

export interface Message {
  id: number
  from: 'me' | 'them'
  text: string
  time: string
}

export interface Conversation {
  id: number
  name: string
  avatar: string
  lastMsg: string
  time: string
  unread: number
  messages: Message[]
}

export const mockConversations: Conversation[] = [
  {
    id: 1,
    name: '이창민',
    avatar: 'bg-pink-200',
    lastMsg: '네, 콘텐츠 가이드 확인했습니다!',
    time: '5분 전',
    unread: 2,
    messages: [
      { id: 1, from: 'me', text: '안녕하세요, 봄 요가 프로모션 관련해서 연락드립니다.', time: '10:30' },
      { id: 2, from: 'them', text: '안녕하세요! 말씀해 주세요 😊', time: '10:32' },
      { id: 3, from: 'me', text: '캠페인 가이드라인 공유드립니다. 검토 부탁드려요.', time: '10:34' },
      { id: 4, from: 'them', text: '네, 콘텐츠 가이드 확인했습니다!', time: '10:40' },
    ],
  },
  {
    id: 2,
    name: '김가애',
    avatar: 'bg-yellow-200',
    lastMsg: '언제까지 원고 제출해야 하나요?',
    time: '1시간 전',
    unread: 1,
    messages: [
      { id: 1, from: 'them', text: '안녕하세요, 캠페인 참여 확정됐다고 연락받았어요!', time: '09:00' },
      { id: 2, from: 'me', text: '네, 반갑습니다! 잘 부탁드립니다 🙂', time: '09:05' },
      { id: 3, from: 'them', text: '언제까지 원고 제출해야 하나요?', time: '09:20' },
    ],
  },
  {
    id: 3,
    name: '박리나',
    avatar: 'bg-purple-200',
    lastMsg: '알겠습니다, 수정해서 다시 보낼게요.',
    time: '어제',
    unread: 0,
    messages: [
      { id: 1, from: 'me', text: '콘텐츠 검토 완료했습니다. 해시태그 추가 부탁드려요.', time: '어제 14:00' },
      { id: 2, from: 'them', text: '알겠습니다, 수정해서 다시 보낼게요.', time: '어제 14:30' },
    ],
  },
]
