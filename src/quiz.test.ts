import { describe, expect, it } from 'vitest'
import { CATEGORIES, QUESTIONS, TEST_QUESTION_IDS } from './data/questions.ts'
import { getTestQuestions, isCorrect, pickFamilyQuestions, pickRound, pickSoloQuestions, pointsFor, shuffle } from './quiz.ts'

describe('問題データ', () => {
  it('IDが重複していない', () => {
    const ids = QUESTIONS.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('正解の番号が選択肢の範囲内で、解説と出典がある', () => {
    for (const q of QUESTIONS) {
      expect(q.answer).toBeGreaterThanOrEqual(0)
      expect(q.answer).toBeLessThan(q.choices.length)
      expect(q.explanation.length).toBeGreaterThan(10)
      expect(q.source.length).toBeGreaterThan(0)
    }
  })

  it('ミニテストは分類ごとに2問ずつで、小中学生向けの★1〜2', () => {
    const tests = getTestQuestions()
    expect(tests).toHaveLength(6)
    for (const c of CATEGORIES) {
      expect(tests.filter((q) => q.category === c)).toHaveLength(2)
    }
    for (const q of tests) expect(q.difficulty).toBeLessThanOrEqual(2)
  })
})

describe('出題と採点', () => {
  it('シャッフルしても中身は同じ', () => {
    const r = shuffle([1, 2, 3, 4], () => 0.3)
    expect([...r].sort()).toEqual([1, 2, 3, 4])
  })

  it('ひとりモード：10問にミニテストの問題が全部入り、★3まで、易しい順に並ぶ', () => {
    const round = pickSoloQuestions(10, () => 0.5)
    expect(round).toHaveLength(10)
    for (const id of TEST_QUESTION_IDS) {
      expect(round.some((q) => q.id === id)).toBe(true)
    }
    for (const q of round) expect(q.difficulty).toBeLessThanOrEqual(3)
    for (let i = 1; i < round.length; i++) {
      expect(round[i]!.difficulty).toBeGreaterThanOrEqual(round[i - 1]!.difficulty)
    }
  })

  it('親子モード：こどもとおとなが交代で6問ずつ。こどもはミニテスト、おとなは★3以上', () => {
    const items = pickFamilyQuestions(() => 0.5)
    expect(items).toHaveLength(12)
    items.forEach((item, i) => {
      expect(item.turn).toBe(i % 2 === 0 ? 'こども' : 'おとな')
    })
    const child = items.filter((i) => i.turn === 'こども').map((i) => i.question.id)
    expect([...child].sort((a, b) => a - b)).toEqual([...TEST_QUESTION_IDS].sort((a, b) => a - b))
    for (const item of items.filter((i) => i.turn === 'おとな')) {
      expect(item.question.difficulty).toBeGreaterThanOrEqual(3)
      expect(TEST_QUESTION_IDS).not.toContain(item.question.id)
    }
    expect(new Set(items.map((i) => i.question.id)).size).toBe(12)
  })

  it('ひとりモードでは番の表示がない', () => {
    const items = pickRound('solo', () => 0.5)
    expect(items).toHaveLength(10)
    expect(items.every((i) => i.turn === null)).toBe(true)
  })

  it('正解なら難易度×10ポイント', () => {
    const q = QUESTIONS.find((x) => x.difficulty === 3)!
    expect(isCorrect(q, q.answer)).toBe(true)
    expect(pointsFor(q, true)).toBe(30)
    expect(pointsFor(q, false)).toBe(0)
  })
})
