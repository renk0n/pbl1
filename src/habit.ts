// 「今日からやること」を続けるしくみ。
// ふり返りで行動を1つ決め、次に遊ぶときに「できた？」と聞く。できたらボーナスで街が育った状態から始まる。

export type Habit = {
  action: string // 決めた行動
  date: string // 決めた日
  doneCount: number // これまでに「できた」と答えた回数
  checked: boolean // この行動について「できた？」にもう答えたか
}

export const DONE_BONUS = 20

// 新しい行動を決める。できた回数は引きつぐ。
export function chooseAction(prev: Habit | null, action: string, date: string): Habit {
  return { action, date, doneCount: prev?.doneCount ?? 0, checked: false }
}

// 「できた？」への答えを記録する。同じ行動で2回はボーナスをもらえない。
export function reportHabit(habit: Habit, done: boolean): { habit: Habit; bonus: number } {
  if (habit.checked) return { habit, bonus: 0 }
  return {
    habit: { ...habit, checked: true, doneCount: habit.doneCount + (done ? 1 : 0) },
    bonus: done ? DONE_BONUS : 0,
  }
}

// 日付を「2026-10-28」の形にする（その端末の時刻で）。
export function dateString(now: Date = new Date()): string {
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${m}-${d}`
}

// 「できた？」と聞くのは、まだ答えておらず、決めた日の翌日以降のとき。
// 同じ日に聞かないのは、体験会で同じ端末を次の人が使うときに前の人の行動を聞かないため。
export function canCheck(habit: Habit | null, today: string): boolean {
  return habit !== null && !habit.checked && habit.date !== today
}
