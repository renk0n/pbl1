import { useState } from 'react'
import type { Question } from '../data/questions.ts'
import { isCorrect } from '../quiz.ts'
import type { AnswerRecord } from '../review.ts'

type Props = {
  title: string
  lead: string
  questions: Question[]
  onFinish: (records: AnswerRecord[]) => void
}

// 事前テスト・事後テスト。正解は表示せず、順番に答えるだけ。
export function TestScreen({ title, lead, questions, onFinish }: Props) {
  const [index, setIndex] = useState(0)
  const [records, setRecords] = useState<AnswerRecord[]>([])
  const question = questions[index]
  if (!question) return null

  function answer(choiceIndex: number) {
    if (!question) return
    const next = [...records, { questionId: question.id, choiceIndex, correct: isCorrect(question, choiceIndex) }]
    if (index + 1 >= questions.length) {
      onFinish(next)
    } else {
      setRecords(next)
      setIndex(index + 1)
    }
  }

  return (
    <section className="card">
      <p className="eyebrow">{title}</p>
      <p className="lead">{lead}</p>
      <p className="progress">
        {index + 1} / {questions.length} 問目
      </p>
      <h2 className="question">{question.text}</h2>
      <div className="choices">
        {question.choices.map((c, i) => (
          <button key={c} className="choice" onClick={() => answer(i)}>
            {String.fromCharCode(65 + i)}. {c}
          </button>
        ))}
      </div>
    </section>
  )
}
