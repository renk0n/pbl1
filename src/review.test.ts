import { describe, expect, it } from 'vitest'
import { QUESTIONS } from './data/questions.ts'
import {
  CSV_HEADER,
  categoriesWeakFirst,
  compareTests,
  summarizeByCategory,
  toCsvRow,
  weakestCategory,
  type AnswerRecord,
} from './review.ts'

const rec = (questionId: number, correct: boolean): AnswerRecord => ({ questionId, choiceIndex: 0, correct })

describe('ふり返り', () => {
  it('分類ごとに正答数を数える', () => {
    // 1:しくみ 5:緩和 16と38:適応・備え
    const result = summarizeByCategory([rec(1, true), rec(5, false), rec(16, true), rec(38, false)], QUESTIONS)
    expect(result).toEqual([
      { category: 'しくみ', correct: 1, total: 1 },
      { category: '緩和', correct: 0, total: 1 },
      { category: '適応・備え', correct: 1, total: 2 },
    ])
    expect(weakestCategory(result)).toBe('緩和')
  })

  it('事前と事後の正答数を比べる', () => {
    const c = compareTests([rec(1, false), rec(5, true)], [rec(1, true), rec(5, true)])
    expect(c).toEqual({ before: 1, after: 2, total: 2, gain: 1 })
  })

  it('苦手な分類を先に並べる', () => {
    expect(categoriesWeakFirst('緩和')).toEqual(['緩和', 'しくみ', '適応・備え'])
    expect(categoriesWeakFirst(null)).toEqual(['しくみ', '緩和', '適応・備え'])
  })

  it('アンケートを1行のCSVにし、自由記述のカンマや " を守る', () => {
    const row = toCsvRow({
      date: '2026/12/1 10:00:00',
      mode: 'family',
      comparison: { before: 2, after: 5, total: 6, gain: 3 },
      points: 120,
      lastAction: 'できた',
      todayAction: '部屋を出るときに電気を消す',
      survey: { respondent: '保護者', fun: 4, willAct: 5, talk: 3, unclear: '「緩和」, 「適応」', wish: '"対戦"したい' },
    })
    expect(row).toBe(
      '"2026/12/1 10:00:00",保護者,親子で,2,5,3,120,4,5,3,できた,"部屋を出るときに電気を消す","「緩和」, 「適応」","""対戦""したい"',
    )
    expect(CSV_HEADER.split(',')).toHaveLength(14)
  })
})
