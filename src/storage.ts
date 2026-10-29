// ブラウザ（localStorage）への保存。
// 体験会の結果：同じ端末で何人か遊んでもらい、最後にまとめてCSVでコピーできる。
// 今日からやること：次に遊ぶときに「できた？」と聞くために保存する。
import type { Habit } from './habit.ts'

const RESULTS_KEY = 'eco-town-results'
const HABIT_KEY = 'eco-town-habit'

export function loadResults(): string[] {
  try {
    const raw = localStorage.getItem(RESULTS_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function saveResult(row: string): void {
  try {
    localStorage.setItem(RESULTS_KEY, JSON.stringify([...loadResults(), row]))
  } catch {
    // 保存できない環境（プライベートモードなど）では何もしない
  }
}

export function clearResults(): void {
  try {
    localStorage.removeItem(RESULTS_KEY)
  } catch {
    // 何もしない
  }
}

function isHabit(x: unknown): x is Habit {
  if (typeof x !== 'object' || x === null) return false
  const h = x as Record<string, unknown>
  return (
    typeof h.action === 'string' &&
    typeof h.date === 'string' &&
    typeof h.doneCount === 'number' &&
    typeof h.checked === 'boolean'
  )
}

export function loadHabit(): Habit | null {
  try {
    const raw = localStorage.getItem(HABIT_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    return isHabit(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveHabit(habit: Habit): void {
  try {
    localStorage.setItem(HABIT_KEY, JSON.stringify(habit))
  } catch {
    // 何もしない
  }
}
