export const TIMER_MS = {
  /** Toast 자동 닫힘 */
  TOAST_AUTO_CLOSE: 3000,
  /** 클립보드 복사 피드백 지속 시간 */
  CLIPBOARD_FEEDBACK: 1500,
  /** 상태 피드백 (에러/성공 표시 후 리셋) */
  STATE_FEEDBACK: 1500,
  /** 폼 제출 / 로그인 시뮬레이션 지연 */
  FORM_SUBMIT: 800,
  /** 스크린샷 등 긴 작업 완료 표시 */
  LONG_TASK_FEEDBACK: 1800,
  /** 하트 애니메이션 */
  HEART_ANIMATION: 300,
  /** 자동 저장 피드백 */
  AUTO_SAVE_FEEDBACK: 2000,
  /** 페이지 로딩 스켈레톤 */
  SKELETON_LOADING: 800,
  /** 성공 모달 자동 닫힘 */
  SUCCESS_MODAL_CLOSE: 2500,
  /** 로그아웃 후 리다이렉트 */
  LOGOUT_REDIRECT: 1000,
  /** 네비게이션 지연 (토스트 표시 후) */
  NAV_DELAY: 1500,
  /** 인증 코드 재발송 쿨다운 (초 단위) */
  RESEND_COOLDOWN_SEC: 60,
  /** QA 스냅샷 상태 복원 */
  QA_STATE_RESET: 1200,
  /** 모의 API 연결 시뮬레이션 */
  MOCK_CONNECT: 2000,
  /** 모의 제안/전송 시뮬레이션 */
  MOCK_SEND: 1200,
  /** 구독 플랜 변경 확인 시뮬레이션 */
  MOCK_PLAN_CHANGE: 1200,
  /** 자동 응답 DM 시뮬레이션 */
  MOCK_AUTO_REPLY: 1000,
  /** AI 분석 시뮬레이션 */
  MOCK_AI_ANALYZE: 2200,
  /** 회원가입 제출 시뮬레이션 */
  MOCK_SIGNUP: 500,
  /** 로그인 제출 시뮬레이션 (인플루언서) */
  MOCK_LOGIN: 700,
} as const
