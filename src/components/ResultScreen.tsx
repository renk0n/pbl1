import { useState } from 'react'
import type { Mode } from '../quiz.ts'
import {
  RESPONDENTS,
  compareTests,
  toCsvRow,
  type AnswerRecord,
  type LastAction,
  type Respondent,
} from '../review.ts'
import { saveResult } from '../storage.ts'

type Props = {
  mode: Mode
  before: AnswerRecord[]
  after: AnswerRecord[]
  points: number
  lastAction: LastAction
  todayAction: string
  onRestart: () => void
}

const SCALE = [1, 2, 3, 4, 5]

type ScaleProps = { label: string; value: number; onChange: (n: number) => void }

function ScaleQuestion({ label, value, onChange }: ScaleProps) {
  return (
    <>
      <p>{label}</p>
      <div className="scale">
        {SCALE.map((n) => (
          <button key={n} className={value === n ? 'scale-on' : ''} onClick={() => onChange(n)}>
            {n}
          </button>
        ))}
      </div>
    </>
  )
}

// 事前・事後テストの比較と、体験会用のアンケート。
// 親子で遊んだときは、こどもと保護者が続けて1人ずつ回答できる。
export function ResultScreen({ mode, before, after, points, lastAction, todayAction, onRestart }: Props) {
  const comparison = compareTests(before, after)
  const [respondent, setRespondent] = useState<Respondent | null>(null)
  const [fun, setFun] = useState(0)
  const [willAct, setWillAct] = useState(0)
  const [talk, setTalk] = useState(0)
  const [unclear, setUnclear] = useState('')
  const [wish, setWish] = useState('')
  const [savedCount, setSavedCount] = useState(0)
  const [editing, setEditing] = useState(true)

  const ready = respondent !== null && fun > 0 && willAct > 0 && talk > 0

  function save() {
    if (respondent === null) return
    const date = new Date().toLocaleString('ja-JP')
    saveResult(
      toCsvRow({
        date,
        mode,
        comparison,
        points,
        lastAction,
        todayAction,
        survey: { respondent, fun, willAct, talk, unclear, wish },
      }),
    )
    setSavedCount(savedCount + 1)
    setEditing(false)
  }

  // 次の人が回答できるように、入力を空にする
  function nextPerson() {
    setRespondent(null)
    setFun(0)
    setWillAct(0)
    setTalk(0)
    setUnclear('')
    setWish('')
    setEditing(true)
  }

  return (
    <section className="card">
      <p className="eyebrow">結果</p>
      <div className="compare">
        <div>
          <p className="compare-label">事前テスト</p>
          <p className="compare-num">
            {comparison.before}/{comparison.total}
          </p>
        </div>
        <p className="compare-arrow">→</p>
        <div>
          <p className="compare-label">事後テスト</p>
          <p className="compare-num">
            {comparison.after}/{comparison.total}
          </p>
        </div>
      </div>
      <p className="lead">
        {comparison.gain > 0
          ? `プレイ前より ${comparison.gain} 問多く正解できた！`
          : comparison.gain === 0
            ? 'プレイ前と同じ正答数だった。'
            : `プレイ前より ${-comparison.gain} 問少なかった。`}
      </p>
      <div className="action">
        <p className="why-label">今日からやること</p>
        <p>{todayAction}</p>
      </div>

      {editing ? (
        <div className="survey">
          <p className="why-label">アンケート（体験会用・名前は書きません）</p>
          <p>あなたは？</p>
          <div className="respondent">
            {RESPONDENTS.map((r) => (
              <button key={r} className={respondent === r ? 'scale-on' : ''} onClick={() => setRespondent(r)}>
                {r}
              </button>
            ))}
          </div>
          <ScaleQuestion label="楽しかった？" value={fun} onChange={setFun} />
          <ScaleQuestion label="今日の行動を、家でもやってみたいと思った？" value={willAct} onChange={setWillAct} />
          <ScaleQuestion label="今日の内容を、家族と話してみたいと思った？" value={talk} onChange={setTalk} />
          <p className="hint">1＝まったくそう思わない　5＝とてもそう思う</p>
          <p>わかりにくかった言葉や問題は？</p>
          <textarea value={unclear} onChange={(e) => setUnclear(e.target.value)} placeholder="例：「緩和」の意味がわからなかった" />
          <p>つまらなかったところ・あったらいい機能は？</p>
          <textarea value={wish} onChange={(e) => setWish(e.target.value)} placeholder="例：問題を読むのが長い、友だちと対戦したい" />
          <button className="primary" onClick={save} disabled={!ready}>
            回答を保存する
          </button>
        </div>
      ) : (
        <>
          <p className="lead">回答を保存しました（{savedCount}人分）。ありがとうございました！</p>
          <button className="secondary" onClick={nextPerson}>
            続けてもう1人回答する（保護者の方など）
          </button>
        </>
      )}

      <button className="secondary" onClick={onRestart}>
        最初にもどる
      </button>
    </section>
  )
}
