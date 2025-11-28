// src/utils/format.ts
// ✅ 공통 포맷 / 계산 유틸 함수 모음

// 가격 포맷 (12300 → "12,300원")
export function formatPrice(price: number): string {
  return `${price.toLocaleString()}원`;
}

// "현재 인원 / 임계 인원" 텍스트 (6, 10 → "6 / 10명")
export function formatJoinStatus(current: number, threshold: number = 10): string {
  return `${current} / ${threshold}명`;
}

// 진행률 (0~1 사이 값) 계산 (ex. progress bar에 사용)
export function calcProgress(current: number, threshold: number = 10): number {
  if (threshold <= 0) return 0;
  const ratio = current / threshold;
  return Math.max(0, Math.min(1, ratio));
}

// 오전/오후 라벨 (UI 표시용)
export function formatTimeSlot(slot: 'AM' | 'PM'): string {
  return slot === 'AM' ? '오전' : '오후';
}