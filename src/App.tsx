import { useState } from "react";
import {
  POINTS_PER_ACTION,
  addPoints,
  getTownStage,
  pointsToNextStage,
} from "./game";
import "./App.css";

function App() {
  // ゲームの「状態」はポイントだけ。段階はポイントから毎回計算する
  const [points, setPoints] = useState(0);

  const stage = getTownStage(points);
  const remaining = pointsToNextStage(points);

  function handleEcoAction() {
    setPoints((prev) => addPoints(prev, POINTS_PER_ACTION));
  }

  function handleReset() {
    setPoints(0);
  }

  return (
    <main className="game">
      <h1>エコタウン育成</h1>

      <section className="town">
        <div className="town-emoji">{stage.emoji}</div>
        <p>
          レベル {stage.level}：{stage.name}
        </p>
      </section>

      <p className="points">環境ポイント：{points} pt</p>
      <p>
        {remaining === null
          ? "最大まで成長しました！"
          : `次の成長まであと ${remaining} pt`}
      </p>

      <button onClick={handleEcoAction}>
        マイバッグを使った！（+{POINTS_PER_ACTION} pt）
      </button>
      <button onClick={handleReset}>リセット</button>
    </main>
  );
}

export default App;
