import { useState } from 'react'
import { DAILY_ACTIONS } from '../data/actions.ts'
import { CATEGORY_NOTES, type Category } from '../data/questions.ts'
import type { RoundItem, Turn } from '../quiz.ts'
import { categoriesWeakFirst, countCorrect, summarizeByCategory, weakestCategory, type AnswerRecord } from '../review.ts'
import { Town } from './Town.tsx'

type Props = {
  items: RoundItem[]
  records: AnswerRecord[]
  points: number
  onNext: (todayAction: string) => void
}

const TURNS: Turn[] = ['こども', 'おとな']

// ふり返り：分類ごとの正答数、まちがえた問題の解説、「今日からやること」を1つ決める。
export function ReviewScreen({ items, records, points, onNext }: Props) {
  const [chosen, setChosen] = useState('')
  const questions = items.map((i) => i.question)
  const summary = summarizeByCategory(records, questions)
  const weak = weakestCategory(summary)
  const wrong = records.filter((r) => !r.correct)
  const isFamily = items.some((i) => i.turn !== null)
  const [first = 'しくみ', ...rest] = categoriesWeakFirst(weak)

  const recordsOf = (turn: Turn) =>
    records.filter((r) => items.find((i) => i.question.id === r.questionId)?.turn === turn)

  return (
    <section className="card">
      <p className="eyebrow">ふり返り</p>
      <Town points={points} />
      {isFamily && (
        <div className="turn-score">
          {TURNS.map((t) => (
            <p key={t}>
              {t}：{countCorrect(recordsOf(t))} / {recordsOf(t).length} 問正解
            </p>
          ))}
        </div>
      )}
      <table className="summary">
        <thead>
          <tr>
            <th>分類</th>
            <th>内容</th>
            <th>正解</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((s) => (
            <tr key={s.category}>
              <td>{s.category}</td>
              <td>{CATEGORY_NOTES[s.category]}</td>
              <td>
                {s.correct} / {s.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {wrong.length > 0 && (
        <details className="wrong-list">
          <summary>まちがえた問題をもう一度読む（{wrong.length}問）</summary>
          {wrong.map((r) => {
            const q = questions.find((x) => x.id === r.questionId)
            if (!q) return null
            return (
              <div key={q.id} className="wrong-item">
                <p className="wrong-q">{q.text}</p>
                <p>正解：{q.choices[q.answer]}</p>
                <p>{q.explanation}</p>
              </div>
            )
          })}
        </details>
      )}

      <div className="action">
        <p className="why-label">今日からやることを1つえらぼう</p>
        <p className="hint">次に遊ぶとき「できた？」と聞きます。できたら街がボーナスで育った状態から始まります。</p>
        <ActionGroup category={first} recommended={weak !== null} chosen={chosen} onChoose={setChosen} />
        <details className="more-actions">
          <summary>ほかの行動からえらぶ</summary>
          {rest.map((category) => (
            <ActionGroup key={category} category={category} recommended={false} chosen={chosen} onChoose={setChosen} />
          ))}
        </details>
      </div>

      <button className="primary" onClick={() => onNext(chosen)} disabled={chosen === ''}>
        これにきめて事後テストへ
      </button>
    </section>
  )
}

type GroupProps = {
  category: Category
  recommended: boolean
  chosen: string
  onChoose: (action: string) => void
}

function ActionGroup({ category, recommended, chosen, onChoose }: GroupProps) {
  return (
    <div className="action-group">
      <p className="action-cat">
        {category}
        {recommended && <span className="badge">おすすめ</span>}
      </p>
      {DAILY_ACTIONS[category].map((a) => (
        <button key={a} className={`action-choice ${chosen === a ? 'is-chosen' : ''}`} onClick={() => onChoose(a)}>
          {a}
        </button>
      ))}
    </div>
  )
}
