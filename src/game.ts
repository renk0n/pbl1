// ゲームのルール（計算・判定）だけを書くファイル。
// React や画面のことは書かない「純粋関数」にしておく。

/** 街の成長段階の定義（1段階 = 1行） */
export type TownStage = {
  level: number; // 段階の番号（0から）
  name: string; // 段階の名前
  emoji: string; // 画面に出す絵文字
  minPoints: number; // この段階になるのに必要なポイント
};

/** 最初の段階（0 pt のとき） */
const FIRST_STAGE: TownStage = {
  level: 0,
  name: "あれ地",
  emoji: "🏜️",
  minPoints: 0,
};

/** 成長段階の一覧（minPoints の小さい順に並べること） */
export const TOWN_STAGES: readonly TownStage[] = [
  FIRST_STAGE,
  { level: 1, name: "草が生えた", emoji: "🌱", minPoints: 10 },
  { level: 2, name: "木が育った", emoji: "🌳🌳", minPoints: 30 },
  { level: 3, name: "小さな村", emoji: "🏡🌳🌻", minPoints: 60 },
  { level: 4, name: "エコな街", emoji: "🏙️🌳🚲☀️", minPoints: 100 },
];

/** 1回のエコ行動でもらえるポイント */
export const POINTS_PER_ACTION = 10;

/**
 * ポイントを加算する。
 * 元の値は変えず「新しい値」を返す（React の state と相性がよい）。
 * マイナスや小数になったら 0 以上の整数に丸める。
 */
export function addPoints(current: number, amount: number): number {
  const next = current + amount;
  return Math.max(0, Math.floor(next));
}

/** 今のポイントに対応する成長段階を返す */
export function getTownStage(points: number): TownStage {
  // 最初の段階（あれ地）からスタートし、条件を満たすたびに上書きしていく
  let result = FIRST_STAGE;
  for (const stage of TOWN_STAGES) {
    if (points >= stage.minPoints) {
      result = stage;
    }
  }
  return result;
}

/** 次の段階まであと何ポイントか。最大段階なら null */
export function pointsToNextStage(points: number): number | null {
  const current = getTownStage(points);
  const next = TOWN_STAGES[current.level + 1];
  if (next === undefined) return null;
  return next.minPoints - points;
}
