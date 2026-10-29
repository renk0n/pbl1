import { useMemo, useState } from 'react'
import { TALK_PROMPTS } from '../data/actions.ts'
import type { Category } from '../data/questions.ts'
import { addPoints, getTownStage } from '../game.ts'
import { difficultyLabel, isCorrect, pointsFor, shuffle, type RoundItem } from '../quiz.ts'
import type { AnswerRecord } from '../review.ts'
import { Town } from './Town.tsx'

type Props = {
  items: RoundItem[]
  initialPoints: number // 前回の行動が「できた」ときのボーナス
  onFinish: (records: AnswerRecord[], points: number) => void
}

const TAG_CLASS: Record<Category, string> = { しくみ: 'tag-cause', 緩和: 'tag-mitigation', '適応・備え': 'tag-adaptation' }

type Feedback = { choiceIndex: number; correct: boolean; gained: number; grew: boolean }

// ゲーム本編：選ぶ → 理由の解説 → 街が育つ、をくり返す。
// 親子モードでは、こどもとおとなが交代で答え、解説のあとに「話してみよう」を出す。
export function QuizScreen({ items, initialPoints, onFinish }: Props) {
  const [index, setIndex] = useState(0)
  const [points, setPoints] = useState(initialPoints)
  const [records, setRecords] = useState<AnswerRecord[]>([])
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const item = items[index]
  const question = item?.question

  // 選択肢の並び順を問題ごとにシャッフルする（元の番号で採点する）
  const order = useMemo(() => (question ? shuffle(question.choices.map((_, i) => i)) : []), [question])

  if (!item || !question) return null

  function answer(choiceIndex: number) {
    if (!question || feedback) return
    const correct = isCorrect(question, choiceIndex)
    const gained = pointsFor(question, correct)
    const nextPoints = addPoints(points, gained)
    setFeedback({ choiceIndex, correct, gained, grew: getTownStage(nextPoints).level > getTownStage(points).level })
    setPoints(nextPoints)
    setRecords([...records, { questionId: question.id, choiceIndex, correct }])
  }

  function next() {
    if (index + 1 >= items.length) {
      onFinish(records, points)
    } else {
      setIndex(index + 1)
      setFeedback(null)
    }
  }

  const correctText = question.choices[question.answer]

  return (
    <section className="card">
      <Town points={points} />
      {item.turn && (
        <p className={`turn ${item.turn === 'こども' ? 'turn-child' : 'turn-adult'}`}>{item.turn}の番</p>
      )}
      <div className="meta">
        <span>
          {index + 1} / {items.length} 問目
        </span>
        <span className={`tag ${TAG_CLASS[question.category]}`}>{question.category}</span>
        <span className="stars" title={`難易度 ${question.difficulty}`}>
          {difficultyLabel(question.difficulty)}
        </span>
      </div>
      <h2 className="question">{question.text}</h2>
      <div className="choices">
        {order.map((i, pos) => {
          const c = question.choices[i]
          let state = ''
          if (feedback) {
            if (i === question.answer) state = 'is-correct'
            else if (i === feedback.choiceIndex) state = 'is-wrong'
          }
          return (
            <button key={c} className={`choice ${state}`} onClick={() => answer(i)} disabled={feedback !== null}>
              {String.fromCharCode(65 + pos)}. {c}
            </button>
          )
        })}
      </div>

      {feedback && (
        <div className={`explain ${feedback.correct ? 'ok' : 'ng'}`}>
          <p className="result">
            {feedback.correct ? `正解！ +${feedback.gained}pt` : `残念… 正解は「${correctText}」`}
            {feedback.grew && <span className="grew"> 街が成長した！</span>}
          </p>
          <p className="why-label">なぜ？</p>
          <p>{question.explanation}</p>
          <p className="source">出典：{question.source}</p>
          {item.turn && (
            <div className="talk">
              <p className="why-label">話してみよう</p>
              <p>{TALK_PROMPTS[question.category]}</p>
            </div>
          )}
          <button className="primary" onClick={next}>
            {index + 1 >= items.length ? 'ふり返りへ' : '次の問題へ'}
          </button>
        </div>
      )}
    </section>
  )
}
