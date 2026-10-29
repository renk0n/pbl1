import { useState } from 'react'
import { QUESTIONS } from './data/questions.ts'
import { canCheck, chooseAction, dateString, reportHabit, DONE_BONUS, type Habit } from './habit.ts'
import { FAMILY_SIZE_PER_PERSON, SOLO_SIZE, getTestQuestions, pickRound, type Mode, type RoundItem } from './quiz.ts'
import { CSV_HEADER, type AnswerRecord, type LastAction } from './review.ts'
import { clearResults, loadHabit, loadResults, saveHabit } from './storage.ts'
import { QuizScreen } from './components/QuizScreen.tsx'
import { ResultScreen } from './components/ResultScreen.tsx'
import { ReviewScreen } from './components/ReviewScreen.tsx'
import { TestScreen } from './components/TestScreen.tsx'

type Phase = 'title' | 'pretest' | 'quiz' | 'review' | 'posttest' | 'result' | 'records'

export default function App() {
  const [phase, setPhase] = useState<Phase>('title')
  const [mode, setMode] = useState<Mode>('solo')
  const [items, setItems] = useState<RoundItem[]>([])
  const [preRecords, setPreRecords] = useState<AnswerRecord[]>([])
  const [quizRecords, setQuizRecords] = useState<AnswerRecord[]>([])
  const [postRecords, setPostRecords] = useState<AnswerRecord[]>([])
  const [points, setPoints] = useState(0)
  const [habit, setHabit] = useState<Habit | null>(() => loadHabit())
  const [bonus, setBonus] = useState(0)
  const [lastAction, setLastAction] = useState<LastAction>('')
  const [todayAction, setTodayAction] = useState('')
  const testQuestions = getTestQuestions()
  const isFamily = mode === 'family'

  function start(m: Mode) {
    setMode(m)
    setItems(pickRound(m))
    setPreRecords([])
    setQuizRecords([])
    setPostRecords([])
    setPoints(0)
    setPhase('pretest')
  }

  // 前回の行動が「できた／まだ」の答えを記録する
  function answerHabit(done: boolean) {
    if (!habit) return
    const r = reportHabit(habit, done)
    setHabit(r.habit)
    saveHabit(r.habit)
    setBonus(r.bonus)
    setLastAction(done ? 'できた' : 'まだ')
  }

  function decideAction(action: string) {
    const next = chooseAction(habit, action, dateString())
    setHabit(next)
    saveHabit(next)
    setTodayAction(action)
    setPhase('posttest')
  }

  function backToTitle() {
    setBonus(0)
    setLastAction('')
    setPhase('title')
  }

  return (
    <main className="app">
      <header className="header">
        <h1>エコタウン・クイズ</h1>
        <p>親子で答えて、理由を知って、街を育てよう</p>
      </header>

      {phase === 'title' && (
        <section className="card">
          <HabitCard habit={habit} lastAction={lastAction} onAnswer={answerHabit} />
          <p className="lead">
            気候変動のクイズに答えて、環境ポイントで街を育てるゲームです。答えるたびに「なぜそうなのか」の解説が出ます。最後に「今日からやること」を1つ決めます。
          </p>
          <ol className="steps">
            <li>事前テスト（6問）</li>
            <li>クイズで街を育てる</li>
            <li>ふり返りと「今日からやること」えらび</li>
            <li>事後テスト（6問）とアンケート</li>
          </ol>
          <div className="modes">
            <button className="mode" onClick={() => start('solo')}>
              <span className="mode-name">ひとりで遊ぶ</span>
              <span className="mode-desc">クイズ{SOLO_SIZE}問・約10分</span>
            </button>
            <button className="mode" onClick={() => start('family')}>
              <span className="mode-name">親子で遊ぶ</span>
              <span className="mode-desc">
                こどもとおとなで交代して{FAMILY_SIZE_PER_PERSON * 2}問・約15分
              </span>
            </button>
          </div>
          <p className="hint">問題は全{QUESTIONS.length}問の中から出ます。</p>
          <button className="link" onClick={() => setPhase('records')}>
            体験会の記録を見る
          </button>
        </section>
      )}

      {phase === 'pretest' && (
        <TestScreen
          key="pretest"
          title="事前テスト"
          lead={
            isFamily
              ? 'こどもが答えてください（おとなはヒントを出さないでね）。正解はあとで分かります。'
              : '今の知識で答えてください。正解はあとで分かります。'
          }
          questions={testQuestions}
          onFinish={(r) => {
            setPreRecords(r)
            setPhase('quiz')
          }}
        />
      )}

      {phase === 'quiz' && (
        <QuizScreen
          items={items}
          initialPoints={bonus}
          onFinish={(r, p) => {
            setQuizRecords(r)
            setPoints(p)
            setPhase('review')
          }}
        />
      )}

      {phase === 'review' && <ReviewScreen items={items} records={quizRecords} points={points} onNext={decideAction} />}

      {phase === 'posttest' && (
        <TestScreen
          key="posttest"
          title="事後テスト"
          lead={isFamily ? '最初と同じ問題です。もう一度、こどもが答えてください。' : '最初と同じ問題です。もう一度答えてください。'}
          questions={testQuestions}
          onFinish={(r) => {
            setPostRecords(r)
            setPhase('result')
          }}
        />
      )}

      {phase === 'result' && (
        <ResultScreen
          mode={mode}
          before={preRecords}
          after={postRecords}
          points={points}
          lastAction={lastAction}
          todayAction={todayAction}
          onRestart={backToTitle}
        />
      )}

      {phase === 'records' && <RecordsScreen onBack={() => setPhase('title')} />}
    </main>
  )
}

type HabitCardProps = { habit: Habit | null; lastAction: LastAction; onAnswer: (done: boolean) => void }

// タイトル画面で、前回きめた行動ができたかを聞く。
function HabitCard({ habit, lastAction, onAnswer }: HabitCardProps) {
  if (!habit) return null
  const count = habit.doneCount > 0 && <p className="hint">これまでに「できた」回数：{habit.doneCount}回</p>

  if (lastAction !== '') {
    return (
      <div className="habit">
        <p>
          {lastAction === 'できた'
            ? `すごい！ボーナス +${DONE_BONUS}pt の街から始まるよ。`
            : 'だいじょうぶ。今日もう一度えらんでみよう。'}
        </p>
        {count}
      </div>
    )
  }

  if (canCheck(habit, dateString())) {
    return (
      <div className="habit">
        <p className="why-label">前回きめた「{habit.action}」はできた？</p>
        <div className="habit-buttons">
          <button className="primary" onClick={() => onAnswer(true)}>
            できた！
          </button>
          <button className="secondary" onClick={() => onAnswer(false)}>
            まだ
          </button>
        </div>
        {count}
      </div>
    )
  }

  return (
    <div className="habit">
      <p>きめたこと：「{habit.action}」</p>
      {count}
    </div>
  )
}

// 体験会でこの端末に保存した結果を、CSVとしてコピーできる画面。
function RecordsScreen({ onBack }: { onBack: () => void }) {
  const [rows, setRows] = useState(loadResults())
  const [copied, setCopied] = useState(false)
  const csv = [CSV_HEADER, ...rows].join('\n')

  async function copy() {
    try {
      await navigator.clipboard.writeText(csv)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="card">
      <p className="eyebrow">体験会の記録（{rows.length}件）</p>
      <textarea className="csv" readOnly value={csv} />
      <button className="primary" onClick={copy}>
        {copied ? 'コピーしました' : 'CSVをコピー'}
      </button>
      <button
        className="secondary"
        onClick={() => {
          if (window.confirm('この端末の記録をすべて消しますか？')) {
            clearResults()
            setRows([])
          }
        }}
      >
        記録を消す
      </button>
      <button className="link" onClick={onBack}>
        もどる
      </button>
    </section>
  )
}
