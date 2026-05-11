/**
 * 광고주 — 바이럴 지표 (`/analytics/viral`) 데이터·타입·상수 단일 출처
 *
 * 분할 이전: `apps/brand/src/pages/ViralMetrics.tsx` 내 인라인.
 * Instagram Graph API 실연동 시 본 모듈의 const를 fetch 결과로 대체.
 */

import type { DatePeriod } from '@wellink/ui'

// ── 기간별 KPI 데이터 (data-policy-v1 §4-3: 바이럴 계수 x배, 나머지 fmtNumber) ─
export const kpiByMode: Record<DatePeriod, { reach: number; shares: number; saves: number; viral: number }> = {
  일간: { reach: 4200,   shares: 82,    saves: 312,   viral: 2.1 },
  주간: { reach: 18700,  shares: 410,   saves: 1820,  viral: 2.3 },
  월간: { reach: 48200,  shares: 1240,  saves: 3890,  viral: 2.4 },
  연간: { reach: 578000, shares: 14880, saves: 46680, viral: 2.6 },
}

// ── 콘텐츠 타입 정의 (정책 § 2-3, 2-4) ──────────────────────────────────────
export type ViralContentType = '릴스' | '피드' | '스토리' | '영상' | '쇼츠'
export type ContentGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'processing'
export type ViralPlatform = 'instagram' | 'youtube' | 'tiktok'
export type ViralContent = {
  id: string
  title: string
  influencer: string
  platform: ViralPlatform
  type: ViralContentType
  reach: number
  likes: number
  comments: number
  saves: number
  shares: number
  viralScore: number
  performanceScore: number
  momentumScore: number
  grade: ContentGrade
  createdAt: string
}

// ── 등급 계산 — 원본 getPerformanceGrade ────────────────────────────────────
// ⚠️ 색상 임계값(50, ViralMetrics.tsx 테이블)과 등급 경계(60)가 어긋남 — Tier 0 결정 항목
export const calcGrade = (score: number): ContentGrade => {
  if (score >= 80) return 'A'
  if (score >= 60) return 'B'
  if (score >= 40) return 'C'
  if (score >= 20) return 'D'
  return 'E'
}

// ── 바이럴 콘텐츠 더미 (100개) ──────────────────────────────────────────────
const VC_TITLES = [
  '봄맞이 요가 루틴 5분 챌린지', '비건 프로틴 바 솔직 후기', '주말 홈트 브이로그', '웰링크 제품 언박싱', '건강간식 추천 TOP3',
  '신상 앰플 일주일 사용기', '러닝화 100km 신어보기', '다이어트 도시락 일주일 기록', '아침 요가 루틴 추천', '필라테스 입문 한 달 변화',
  '비타민C 앰플 비교 리뷰', '스트레칭 루틴 따라해봤어요', '단백질 보충제 솔직 시식', '레깅스 코디 추천', '저당 디저트 만들기',
  '홈카페 굿즈 언박싱', '미니멀 인테리어 챌린지', '캠핑 장비 추천템', '노티드 도넛 후기', '강남 맛집 투어',
]
const VC_INFLUENCERS = [
  '@yoga_jimin', '@fitfoodie_kr', '@daily_hana', '@beauty_sora', '@snack_master',
  '@runner_kim', '@diet_diary', '@yoga_morning', '@pilates_world', '@vitamin_review',
  '@stretch_daily', '@protein_kim', '@leggings_lover', '@low_sugar', '@homecafe_master',
  '@minimal_int', '@camping_pick', '@notted_kr', '@gangnam_food', '@beauty_lab',
]
const VC_TYPES: ViralContentType[] = ['릴스', '피드', '스토리', '영상', '쇼츠']

export const viralContentData: ViralContent[] = Array.from({ length: 100 }, (_, i) => {
  const isProcessing = i % 19 === 18  // 5%는 점수 산정 중
  const viralScore = isProcessing ? 0 : Math.max(8, Math.min(98, 30 + (i * 7) % 70))
  const performanceScore = isProcessing ? 0 : Math.max(0, viralScore - 5 + (i % 9))
  const momentumScore = isProcessing ? 0 : Math.max(0, viralScore - 8 + (i % 13))
  const grade: ContentGrade = isProcessing ? 'processing' : calcGrade(performanceScore)
  const reach = isProcessing ? 0 : 1000 + (i * 511) % 30000
  const likes = isProcessing ? 0 : Math.floor(reach * (0.06 + (i % 7) * 0.005))
  const comments = isProcessing ? 0 : Math.floor(likes * (0.08 + (i % 5) * 0.01))
  const saves = isProcessing ? 0 : Math.floor(likes * (0.3 + (i % 4) * 0.05))
  const shares = isProcessing ? 0 : Math.floor(likes * (0.15 + (i % 6) * 0.02))
  const monthIdx = (i * 7) % 4 + 1
  const dayIdx = ((i * 11) % 28) + 1
  const type = VC_TYPES[i % VC_TYPES.length]
  const platform: ViralPlatform = type === '영상'
    ? 'youtube'
    : type === '쇼츠'
      ? (i % 2 === 0 ? 'youtube' : 'tiktok')
      : 'instagram'
  return {
    id: `v-${i + 1}`,
    title: i < VC_TITLES.length ? VC_TITLES[i] : `${VC_TITLES[i % VC_TITLES.length]} #${Math.floor(i / VC_TITLES.length) + 1}`,
    influencer: VC_INFLUENCERS[i % VC_INFLUENCERS.length],
    platform,
    type,
    reach, likes, comments, saves, shares,
    viralScore,
    performanceScore,
    momentumScore,
    grade,
    createdAt: `2026-${String(monthIdx).padStart(2, '0')}-${String(dayIdx).padStart(2, '0')}`,
  }
})

// ── 캠페인 매칭 더미 데이터 — 콘텐츠 index % 3 === 0 항목에 배지 노출 (immutable 빌드) ─
const CAMPAIGN_MATCH_NAMES = [
  '봄 시즌 릴스 캠페인', '비건 프로틴 체험단', '홈케어 루틴 챌린지',
  '여름 한정 시딩', '신제품 언박싱 캠페인', '웰니스 라이프 콜라보',
] as const

export const CAMPAIGN_MATCH_MAP: Record<string, { campaignId: string; campaignName: string; uploadPeriodLabel: string }> =
  Object.fromEntries(
    viralContentData.flatMap((item, i) =>
      i % 3 === 0
        ? [[item.id, {
            campaignId: `camp-${(i % 6) + 1}`,
            campaignName: CAMPAIGN_MATCH_NAMES[i % CAMPAIGN_MATCH_NAMES.length],
            uploadPeriodLabel: `${item.createdAt} 등록`,
          }]]
        : []
    )
  )
