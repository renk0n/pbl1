import { TOWN_STAGES, getTownStage, pointsToNextStage } from '../game.ts'

type Props = { points: number }

export function Town({ points }: Props) {
  const stage = getTownStage(points)
  const next = pointsToNextStage(points)
  return (
    <div className="town">
      <div className="town-emoji" aria-hidden="true">{stage.emoji}</div>
      <div>
        <p className="town-name">
          {stage.name}（段階 {stage.level + 1}/{TOWN_STAGES.length}）
        </p>
        <p className="town-desc">{stage.description}</p>
        <p className="town-points">
          環境ポイント：{points}pt{next !== null ? `／次の段階まであと ${next}pt` : '／最終段階！'}
        </p>
      </div>
    </div>
  )
}
