import { describe, expect, it } from 'vitest'
import { DONE_BONUS, canCheck, chooseAction, dateString, reportHabit } from './habit.ts'

describe('今日からやること', () => {
  it('新しい行動を決めても、できた回数は引きつぐ', () => {
    const first = chooseAction(null, '電気を消す', '2026-11-01')
    expect(first).toEqual({ action: '電気を消す', date: '2026-11-01', doneCount: 0, checked: false })
    const second = chooseAction({ ...first, doneCount: 2, checked: true }, 'プラグを抜く', '2026-11-05')
    expect(second).toEqual({ action: 'プラグを抜く', date: '2026-11-05', doneCount: 2, checked: false })
  })

  it('できたらボーナス、まだならボーナスなし。2回目は増えない', () => {
    const habit = chooseAction(null, '電気を消す', '2026-11-01')
    const done = reportHabit(habit, true)
    expect(done.bonus).toBe(DONE_BONUS)
    expect(done.habit.doneCount).toBe(1)
    expect(reportHabit(done.habit, true).bonus).toBe(0)

    const notYet = reportHabit(habit, false)
    expect(notYet.bonus).toBe(0)
    expect(notYet.habit.doneCount).toBe(0)
    expect(notYet.habit.checked).toBe(true)
  })

  it('決めた日と同じ日は「できた？」と聞かない', () => {
    const habit = chooseAction(null, '電気を消す', '2026-11-01')
    expect(canCheck(habit, '2026-11-01')).toBe(false)
    expect(canCheck(habit, '2026-11-02')).toBe(true)
    expect(canCheck(reportHabit(habit, true).habit, '2026-11-02')).toBe(false)
    expect(canCheck(null, '2026-11-02')).toBe(false)
  })

  it('日付を年-月-日の形にする', () => {
    expect(dateString(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})
