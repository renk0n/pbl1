// ふり返りとミニテストの集計、体験会アンケートのCSV。
import { CATEGORIES, type Category, type Question } from './data/questions.ts'
import { MODE_LABELS, type Mode } from './quiz.ts'

export type AnswerRecord = {
  questionId: number
  choiceIndex: number
  correct: boolean
}

export type CategoryResult = {
  category: Category
  correct: number
  total: number
}

export function summarizeByCategory(records: AnswerRecord[], questions: Question[]): CategoryResult[] {
  return CATEGORIES.map((category) => {
    const inCategory = records.filter((r) => questions.find((q) => q.id === r.questionId)?.category === category)
    return {
      category,
      correct: inCategory.filter((r) => r.correct).length,
      total: inCategory.length,
    }
  })
}

export function countCorrect(records: AnswerRecord[]): number {
  return records.filter((r) => r.correct).length
}

// いちばん正答率が低い分類（同じなら先の分類）。問題がなければ null。
export function weakestCategory(results: CategoryResult[]): Category | null {
  let weakest: CategoryResult | null = null
  for (const r of results) {
    if (r.total === 0) continue
    if (weakest === null || r.correct / r.total < weakest.correct / weakest.total) weakest = r
  }
  return weakest ? weakest.category : null
}

// 「今日からやること」を選ぶときに、苦手な分類を先に見せる。
export function categoriesWeakFirst(weak: Category | null): Category[] {
  if (weak === null) return [...CATEGORIES]
  return [weak, ...CATEGORIES.filter((c) => c !== weak)]
}

export type TestComparison = {
  before: number
  after: number
  total: number
  gain: number
}

export function compareTests(before: AnswerRecord[], after: AnswerRecord[]): TestComparison {
  const b = countCorrect(before)
  const a = countCorrect(after)
  return { before: b, after: a, total: after.length, gain: a - b }
}

export type Respondent = '小学生' | '中学生' | '高校生以上' | '保護者'
export const RESPONDENTS: Respondent[] = ['小学生', '中学生', '高校生以上', '保護者']

// 前回きめた行動ができたか。前回がなければ空。
export type LastAction = 'できた' | 'まだ' | ''

export type SurveyAnswers = {
  respondent: Respondent
  fun: number // 楽しかった（1〜5）
  willAct: number // 家でもやってみたい（1〜5）
  talk: number // 家族と話してみたい（1〜5）
  unclear: string // わかりにくかった言葉や問題
  wish: string // つまらなかったところ・あったらいい機能
}

export type ResultRow = {
  date: string
  mode: Mode
  comparison: TestComparison
  points: number
  lastAction: LastAction
  todayAction: string
  survey: SurveyAnswers
}

// 自由記述はカンマや改行が入ってもよいように "..." で囲み、" は "" にする。
function csvText(text: string): string {
  return `"${text.replaceAll('"', '""')}"`
}

// 体験会の集計用に、1人分の結果を1行のCSVにする。
export function toCsvRow(row: ResultRow): string {
  const { survey, comparison } = row
  return [
    csvText(row.date),
    survey.respondent,
    MODE_LABELS[row.mode],
    comparison.before,
    comparison.after,
    comparison.gain,
    row.points,
    survey.fun,
    survey.willAct,
    survey.talk,
    row.lastAction,
    csvText(row.todayAction),
    csvText(survey.unclear),
    csvText(survey.wish),
  ].join(',')
}

export const CSV_HEADER =
  '日時,回答者,モード,事前テスト正答数,事後テスト正答数,伸び,獲得ポイント,楽しさ(1-5),家でやってみたい(1-5),家族と話したい(1-5),前回の行動,今日からやること,わかりにくかった言葉や問題,つまらなかったところ・あったらいい機能'
