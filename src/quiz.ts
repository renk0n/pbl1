// クイズの出題と採点に関するロジック。
import { QUESTIONS, TEST_QUESTION_IDS, type Question } from './data/questions.ts'

// 0以上1未満の数を返す関数。テストでは固定値を返す関数を渡せる。
export type Random = () => number

export function shuffle<T>(items: T[], random: Random = Math.random): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const a = result[i]!
    result[i] = result[j]!
    result[j] = a
  }
  return result
}

export function findQuestion(id: number, pool: Question[] = QUESTIONS): Question {
  const q = pool.find((x) => x.id === id)
  if (!q) throw new Error(`問題が見つかりません: ${id}`)
  return q
}

export function getTestQuestions(pool: Question[] = QUESTIONS): Question[] {
  return TEST_QUESTION_IDS.map((id) => findQuestion(id, pool))
}

// 遊び方。ひとりで（10問）か、親子で交代しながら（12問）。
export type Mode = 'solo' | 'family'
export const MODE_LABELS: Record<Mode, string> = { solo: 'ひとりで', family: '親子で' }

// 親子モードで、その問題に答える人。ひとりモードでは null。
export type Turn = 'こども' | 'おとな'

export type RoundItem = { question: Question; turn: Turn | null }

export const SOLO_SIZE = 10
export const FAMILY_SIZE_PER_PERSON = 6

const byDifficulty = (a: Question, b: Question) => a.difficulty - b.difficulty

// ひとりモード：ミニテストの6問を必ず含め、残りは★1〜3からランダムに選ぶ。易しい順に出す。
export function pickSoloQuestions(
  count: number = SOLO_SIZE,
  random: Random = Math.random,
  pool: Question[] = QUESTIONS,
): Question[] {
  const tests = getTestQuestions(pool)
  const others = shuffle(
    pool.filter((q) => !TEST_QUESTION_IDS.includes(q.id) && q.difficulty <= 3),
    random,
  )
  const picked = [...tests, ...others.slice(0, Math.max(0, count - tests.length))]
  return picked.sort(byDifficulty)
}

// 親子モード：こども→おとな→こども…と交代で答える。
// こどもはミニテストの6問（★1〜2）、おとなは★3〜5から6問。
export function pickFamilyQuestions(random: Random = Math.random, pool: Question[] = QUESTIONS): RoundItem[] {
  const child = getTestQuestions(pool).sort(byDifficulty)
  const adult = shuffle(
    pool.filter((q) => !TEST_QUESTION_IDS.includes(q.id) && q.difficulty >= 3),
    random,
  )
    .slice(0, FAMILY_SIZE_PER_PERSON)
    .sort(byDifficulty)
  const items: RoundItem[] = []
  for (let i = 0; i < Math.max(child.length, adult.length); i++) {
    const c = child[i]
    const a = adult[i]
    if (c) items.push({ question: c, turn: 'こども' })
    if (a) items.push({ question: a, turn: 'おとな' })
  }
  return items
}

export function pickRound(mode: Mode, random: Random = Math.random, pool: Question[] = QUESTIONS): RoundItem[] {
  if (mode === 'family') return pickFamilyQuestions(random, pool)
  return pickSoloQuestions(SOLO_SIZE, random, pool).map((question) => ({ question, turn: null }))
}

export function isCorrect(question: Question, choiceIndex: number): boolean {
  return question.answer === choiceIndex
}

// 正解なら難易度×10ポイント。不正解は0ポイント。
export function pointsFor(question: Question, correct: boolean): number {
  return correct ? question.difficulty * 10 : 0
}

export function difficultyLabel(difficulty: number): string {
  return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty)
}
