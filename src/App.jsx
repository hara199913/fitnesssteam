import { useState } from 'react';

const FOOD_DB = {
  '白米(炊いた)': 1.68, '玄米(炊いた)': 1.65, '食パン': 2.64, 'うどん(茹で)': 1.05, 'そば(茹で)': 1.32, 'パスタ(茹で)': 1.49,
  '鶏胸肉(皮なし)': 1.16, '鶏もも肉(皮なし)': 1.27, '鶏ささみ': 1.09, '豚ロース': 2.63, '豚バラ': 3.95, '牛もも肉': 2.09, '牛ロース': 3.80,
  '卵': 1.51, '木綿豆腐': 0.72, '絹豆腐': 0.56, '納豆': 2.00, 'サーモン': 2.09, 'まぐろ(赤身)': 1.25, 'さば': 2.47, 'えび': 0.91,
  'ブロッコリー': 0.37, 'キャベツ': 0.23, 'ほうれん草': 0.20, 'トマト': 0.19, 'きゅうり': 0.14, '玉ねぎ': 0.37, 'にんじん': 0.39, 'じゃがいも': 0.76,
  'バナナ': 0.93, 'りんご': 0.54, 'みかん': 0.49, 'いちご': 0.34,
  '牛乳': 0.67, 'ヨーグルト(無糖)': 0.62, 'チーズ(プロセス)': 3.13,
  'オリーブオイル': 9.21, 'バター': 7.45, 'マヨネーズ': 7.03,
  'アーモンド': 6.08, 'くるみ': 6.93, 'ピーナッツ': 5.62,
  'プロテイン(ホエイ)': 3.80, 'オートミール': 3.80,
};

const CAT_CONFIG = {
  '胸':     { color: '#e53935', bg: '#fff0f0', light: '#ffcdd2', icon: '💓' },
  '背中':   { color: '#1565c0', bg: '#f0f4ff', light: '#bbdefb', icon: '⬅️' },
  '肩':     { color: '#f9a825', bg: '#fffde7', light: '#fff9c4', icon: '↔️' },
  '三頭筋': { color: '#6a1b9a', bg: '#f9f0ff', light: '#e1bee7', icon: '💪' },
  '二頭筋': { color: '#00838f', bg: '#e0f7fa', light: '#b2ebf2', icon: '💪' },
  '足':     { color: '#2e7d32', bg: '#f0fff4', light: '#c8e6c9', icon: '🏃' },
  '有酸素': { color: '#e65100', bg: '#fff3e0', light: '#ffe0b2', icon: '🚶' },
  'その他': { color: '#546e7a', bg: '#f5f7f8', light: '#cfd8dc', icon: '⋯' },
};
const CATEGORIES = Object.keys(CAT_CONFIG);
const WEIGHTS = Array.from({ length: 41 }, (_, i) => i * 5);
const CAT_MET = { '胸': 3.5, '背中': 3.5, '肩': 3.0, '三頭筋': 3.0, '二頭筋': 3.0, '足': 4.0, '有酸素': 7.0, 'その他': 3.0 };

const kcalToKg = (kcal) => (kcal / 7200).toFixed(2);
const calcBurnKcal = (cat, sets, reps, weight) => {
  const met = CAT_MET[cat] || 3.0;
  const vol = sets * reps * (weight > 0 ? weight : 1);
  const minutes = Math.max(1, vol / 200);
  return Math.round(met * minutes);
};
const todayStr = () => new Date().toISOString().slice(0, 10);
const weekStart = (d) => { const dt = new Date(d); dt.setDate(dt.getDate() - dt.getDay()); return dt.toISOString().slice(0, 10); };
const fmtMonth = (y, m) => `${y}年${m + 1}月`;

function useLS(key, def) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : def; } catch { return def; }
  });
  const set = (val) => {
    const nv = typeof val === 'function' ? val(v) : val;
    setV(nv);
    localStorage.setItem(key, JSON.stringify(nv));
  };
  return [v, set];
}

const gs = `
  *{box-sizing:border-box;margin:0;padding:0}
  html,body,#root{min-height:100%;width:100%}
  body{font-family:'Noto Sans JP',sans-serif;background:#f7f7f7;color:#111}
  button,input,select{font:inherit;outline:none}
  input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
  .inp{width:100%;padding:12px 14px;border-radius:10px;border:1.5px solid #ddd;background:#fff;font-size:15px;font-weight:700;color:#111}
  .inp:focus{border-color:#111}
  .inp::placeholder{color:#bbb;font-weight:400}
  .sel{width:100%;padding:12px 14px;border-radius:10px;border:1.5px solid #ddd;background:#fff;font-size:15px;font-weight:700;color:#111;cursor:pointer}
  .btn-black{width:100%;padding:14px;border-radius:12px;border:none;background:#111;color:#fff;font-size:15px;font-weight:900;cursor:pointer}
  .btn-black:hover{background:#333}
  .btn-outline{padding:10px 18px;border-radius:10px;border:1.5px solid #222;background:#fff;color:#111;font-size:14px;font-weight:700;cursor:pointer}
  .btn-outline:hover{background:#f0f0f0}
  .back-btn{background:none;border:none;color:#666;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px;padding:0;margin-bottom:20px}
  .suggest-row:hover{background:#f5f5f5}
  .hist-row:hover{background:#f9f9f9}
  .overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.45);display:flex;align-items:flex-end;justify-content:center;z-index:100}
  .sheet{background:#fff;border-radius:20px 20px 0 0;padding:20px 16px;width:100%;max-width:460px;max-height:75vh;overflow-y:auto}
`;

export default function App() {
  const [screen, setScreen] = useState('home');
  const [trainingCat, setTrainingCat] = useState(null);
  const [workouts, setWorkouts] = useLS('workouts_v5', {});
  const [meals, setMeals] = useLS('meals_v5', {});
  const [showCalendar, setShowCalendar] = useState(false);
  const [trCalMonth, setTrCalMonth] = useState(() => { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() }; });
  const [mealCalMonth, setMealCalMonth] = useState(() => { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() }; });
  const [showHistory, setShowHistory] = useState(false);
  const [exercise, setExercise] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState(0);
  const [sets, setSets] = useState('');
  const [foodQuery, setFoodQuery] = useState('');
  const [foodSugg, setFoodSugg] = useState([]);
  const [selectedFood, setSelectedFood] = useState('');
  const [grams, setGrams] = useState('');

  const td = todayStr();
  const ws = weekStart(td);

  const getDayData = (d) => {
    const ms = meals[d] || [];
    const intake = ms.filter(m => m.type !== 'burn').reduce((a, m) => a + m.kcal, 0);
    const burn = ms.filter(m => m.type === 'burn').reduce((a, m) => a + m.kcal, 0);
    return { intake, burn, net: intake - burn };
  };

  const todayData = getDayData(td);

  const weekData = (() => {
    let intake = 0, burn = 0;
    for (let i = 0; i < 7; i += 1) {
      const dt = new Date(ws);
      dt.setDate(dt.getDate() + i);
      const d = dt.toISOString().slice(0, 10);
      if (d > td) break;
      const dd = getDayData(d);
      intake += dd.intake;
      burn += dd.burn;
    }
    return { intake, burn, net: intake - burn };
  })();

  const getPastExercises = (cat) => {
    const seen = new Set();
    const result = [];
    Object.values(workouts).flat().forEach((w) => {
      if (w.cat === cat && !seen.has(w.exercise)) {
        seen.add(w.exercise);
        result.push(w);
      }
    });
    return result;
  };

  const addMeal = () => {
    if (!selectedFood || !grams || isNaN(grams)) return;
    const kcal = Math.round(FOOD_DB[selectedFood] * parseFloat(grams));
    setMeals((p) => ({
      ...p,
      [td]: [
        ...(p[td] || []),
        { id: Date.now(), type: 'food', food: selectedFood, grams: parseFloat(grams), kcal },
      ],
    }));
    setFoodQuery('');
    setSelectedFood('');
    setGrams('');
    setFoodSugg([]);
  };

  const removeMeal = (id) => setMeals((p) => ({
    ...p,
    [td]: (p[td] || []).filter((m) => m.id !== id),
  }));

  const addWorkout = (ex = exercise, s = sets, r = reps, w = weight) => {
    if (!ex || !trainingCat) return;
    const setCount = parseInt(s, 10) || 1;
    const repCount = parseInt(r, 10) || 0;
    const burnKcal = calcBurnKcal(trainingCat, setCount, repCount, Number(w));
    const workoutId = Date.now();
    setWorkouts((p) => ({
      ...p,
      [td]: [
        ...(p[td] || []),
        {
          id: workoutId,
          cat: trainingCat,
          exercise: ex,
          reps: repCount,
          weight: Number(w),
          sets: setCount,
          burnKcal,
        },
      ],
    }));
    setMeals((p) => ({
      ...p,
      [td]: [
        ...(p[td] || []),
        {
          id: workoutId + 1,
          type: 'burn',
          food: `${trainingCat}(${ex})`,
          kcal: burnKcal,
          linkedId: workoutId,
        },
      ],
    }));
    setExercise('');
    setReps('');
    setSets('');
    setWeight(0);
    setShowHistory(false);
  };

  const addFromHistory = (w) => {
    setExercise(w.exercise);
    setSets(String(w.sets));
    setReps(String(w.reps));
    setWeight(w.weight);
    setShowHistory(false);
  };

  const removeWorkout = (id) => {
    setWorkouts((p) => ({
      ...p,
      [td]: (p[td] || []).filter((x) => x.id !== id),
    }));
    setMeals((p) => ({
      ...p,
      [td]: (p[td] || []).filter((m) => m.type !== 'burn' || m.linkedId !== id),
    }));
  };

  const handleFoodQuery = (q) => {
    setFoodQuery(q);
    setSelectedFood('');
    setFoodSugg(q.length < 1 ? [] : Object.keys(FOOD_DB).filter((k) => k.includes(q)).slice(0, 6));
  };

  const getCalData = (monthState, source) => {
    const { y, m } = monthState;
    const days = new Date(y, m + 1, 0).getDate();
    const firstDow = new Date(y, m, 1).getDay();
    const cells = [];
    for (let i = 0; i < firstDow; i += 1) cells.push(null);
    for (let d = 1; d <= days; d += 1) {
      const ds = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (source === 'meal') {
        const dd = getDayData(ds);
        cells.push({ d, ds, ...dd });
      } else {
        const cats = [...new Set((workouts[ds] || []).map((w) => w.cat))];
        cells.push({ d, ds, cats });
      }
    }
    return cells;
  };

  const page = { maxWidth: 460, margin: '0 auto', padding: '20px 16px', background: '#f7f7f7', minHeight: '100vh' };
  const card = { background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 16, padding: '18px 16px', marginBottom: 14 };
  const lbl = { fontSize: 13, fontWeight: 700, color: '#555', display: 'block', marginBottom: 6 };

  if (screen === 'home') return (
    <>
      <style>{gs}</style>
      <div style={page}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#999', letterSpacing: 2, marginBottom: 4 }}>MY FITNESS</p>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111', marginBottom: 4 }}>Dashboard</h1>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#aaa', marginBottom: 24 }}>{td}</p>

        <div style={{ ...card, background: '#111', border: 'none', marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#aaa', letterSpacing: 1, marginBottom: 12 }}>WEEKLY SUMMARY</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '10px 12px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 3 }}>🍚 摂取</p>
              <p style={{ fontSize: 17, fontWeight: 900, color: '#fff' }}>{weekData.intake.toLocaleString()}<span style={{ fontSize: 11 }}> kcal</span></p>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '10px 12px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 3 }}>💪 消費</p>
              <p style={{ fontSize: 17, fontWeight: 900, color: '#4fc3f7' }}>{weekData.burn.toLocaleString()}<span style={{ fontSize: 11 }}> kcal</span></p>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '10px 12px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 3 }}>週間収支</p>
              <p style={{ fontSize: 17, fontWeight: 900, color: weekData.net > 0 ? '#ef9a9a' : '#a5d6a7' }}>
                {weekData.net > 0 ? '+' : ''}{weekData.net.toLocaleString()}<span style={{ fontSize: 11 }}> kcal</span>
              </p>
              <p style={{ fontSize: 10, fontWeight: 700, color: weekData.net > 0 ? '#ef9a9a' : '#a5d6a7' }}>
                ({weekData.net > 0 ? '+' : ''}{kcalToKg(weekData.net)} kg)
              </p>
            </div>
          </div>
        </div>

        <div onClick={() => setScreen('training')} style={{ ...card, borderLeft: '5px solid #111', cursor: 'pointer', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>💪</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 900, fontSize: 17, color: '#111' }}>トレーニング</p>
              <p style={{ fontWeight: 700, fontSize: 13, color: '#888' }}>今日: {(workouts[td] || []).length}種目記録済み</p>
            </div>
            <span style={{ color: '#ccc', fontSize: 20 }}>›</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CATEGORIES.map((c) => {
              const cnt = (workouts[td] || []).filter((w) => w.cat === c).length;
              const cfg = CAT_CONFIG[c];
              return cnt > 0 ? (
                <span key={c} style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color, border: `1.5px solid ${cfg.light}` }}>{c} {cnt}</span>
              ) : null;
            })}
          </div>
        </div>

        <div onClick={() => setScreen('meal')} style={{ ...card, borderLeft: '5px solid #555', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🍚</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 900, fontSize: 17, color: '#111' }}>食事管理</p>
              <p style={{ fontWeight: 700, fontSize: 13, color: '#888' }}>今日の収支: {todayData.net > 0 ? '+' : ''}{todayData.net.toLocaleString()} kcal ({todayData.net > 0 ? '+' : ''}{kcalToKg(todayData.net)} kg)</p>
            </div>
            <span style={{ color: '#ccc', fontSize: 20 }}>›</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, background: '#f7f7f7', borderRadius: 10, padding: '10px 14px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#999', marginBottom: 2 }}>🍚 摂取</p>
              <p style={{ fontSize: 18, fontWeight: 900, color: '#111' }}>{todayData.intake.toLocaleString()}<span style={{ fontSize: 11, fontWeight: 700 }}> kcal</span></p>
            </div>
            <div style={{ flex: 1, background: '#e8f4fd', borderRadius: 10, padding: '10px 14px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#1565c0', marginBottom: 2 }}>💪 消費</p>
              <p style={{ fontSize: 18, fontWeight: 900, color: '#1565c0' }}>{todayData.burn.toLocaleString()}<span style={{ fontSize: 11, fontWeight: 700 }}> kcal</span></p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (screen === 'training') return (
    <>
      <style>{gs}</style>
      <div style={page}>
        <button className="back-btn" onClick={() => setScreen('home')}>← ホームへ</button>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#111', marginBottom: 20 }}>💪 トレーニング</h2>

        <p style={{ fontSize: 13, fontWeight: 700, color: '#555', marginBottom: 10 }}>カテゴリを選択</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {CATEGORIES.map((c) => {
            const cfg = CAT_CONFIG[c];
            const active = trainingCat === c;
            return (
              <button key={c} onClick={() => setTrainingCat(c)} style={{ padding: '9px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 14, fontWeight: 700, border: `2px solid ${active ? cfg.color : cfg.light}`, background: active ? cfg.color : cfg.bg, color: active ? '#fff' : cfg.color, transition: 'all 0.15s' }}>{c}</button>
            );
          })}
        </div>

        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontSize: 15, fontWeight: 900, color: '#111' }}>トレーニングカレンダー</p>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button className="btn-outline" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => setTrCalMonth((p) => { const d = new Date(p.y, p.m - 1, 1); return { y: d.getFullYear(), m: d.getMonth() }; })}>‹</button>
              <span style={{ fontWeight: 900, fontSize: 14, minWidth: 80, textAlign: 'center' }}>{fmtMonth(trCalMonth.y, trCalMonth.m)}</span>
              <button className="btn-outline" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => setTrCalMonth((p) => { const d = new Date(p.y, p.m + 1, 1); return { y: d.getFullYear(), m: d.getMonth() }; })}>›</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 4 }}>
            {['日', '月', '火', '水', '木', '金', '土'].map((d) => <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#aaa', padding: '3px 0' }}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
            {getCalData(trCalMonth, 'training').map((cell, i) => (
              <div key={i} style={{ borderRadius: 8, padding: '5px 3px', textAlign: 'center', minHeight: 58, background: cell && cell.cats && cell.cats.length > 0 ? '#f8f8f8' : '#fafafa', border: '1px solid #eee' }}>
                {cell && (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 700, color: cell.ds === td ? '#e53935' : '#333', marginBottom: 3 }}>{cell.d}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', marginBottom: 2 }}>
                      {(cell.cats || []).map((c) => <div key={c} title={c} style={{ width: 8, height: 8, borderRadius: '50%', background: CAT_CONFIG[c]?.color || '#999' }}></div>)}
                    </div>
                    {cell.cats && cell.cats.length > 0 && <div style={{ fontSize: 9, fontWeight: 700, color: '#999', lineHeight: 1.3 }}>{cell.cats.join(' ')}</div>}
                  </>
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {CATEGORIES.map((c) => <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: CAT_CONFIG[c].color }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: CAT_CONFIG[c].color }}></div>{c}</div>)}
          </div>
        </div>

        {trainingCat && (
          <div style={{ ...card, borderTop: `4px solid ${CAT_CONFIG[trainingCat].color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: CAT_CONFIG[trainingCat].bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 18 }}>{CAT_CONFIG[trainingCat].icon}</span>
                </div>
                <p style={{ fontSize: 16, fontWeight: 900, color: '#111' }}>{trainingCat} — 記録追加</p>
              </div>
              {getPastExercises(trainingCat).length > 0 && (
                <button onClick={() => setShowHistory(true)} style={{ padding: '7px 12px', borderRadius: 8, border: `1.5px solid ${CAT_CONFIG[trainingCat].color}`, background: CAT_CONFIG[trainingCat].bg, color: CAT_CONFIG[trainingCat].color, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 14 }}>⏱</span> 履歴
                </button>
              )}
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>種目名</label>
              <input className="inp" value={exercise} onChange={(e) => setExercise(e.target.value)} placeholder="例: ベンチプレス" />
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <div style={{ flex: 1 }}><label style={lbl}>セット</label><input className="inp" type="number" value={sets} onChange={(e) => setSets(e.target.value)} placeholder="3" /></div>
              <div style={{ flex: 1 }}><label style={lbl}>回数</label><input className="inp" type="number" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="10" /></div>
              <div style={{ flex: 1 }}><label style={lbl}>重量(kg)</label><select className="sel" value={weight} onChange={(e) => setWeight(Number(e.target.value))}>{WEIGHTS.map((w) => <option key={w} value={w}>{w}</option>)}</select></div>
            </div>
            {exercise && sets && reps && (
              <div style={{ background: '#e8f4fd', borderRadius: 10, padding: '10px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>🔥</span>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1565c0' }}>推定消費: 約 {calcBurnKcal(trainingCat, parseInt(sets, 10) || 1, parseInt(reps, 10) || 0, weight)} kcal</p>
              </div>
            )}
            <button className="btn-black" onClick={() => addWorkout()}>+ 追加する</button>
          </div>
        )}

        {trainingCat && (workouts[td] || []).filter((w) => w.cat === trainingCat).length > 0 && (
          <>
            <p style={{ fontSize: 14, fontWeight: 900, color: '#555', marginBottom: 10 }}>本日の記録 — {trainingCat}</p>
            {(workouts[td] || []).filter((w) => w.cat === trainingCat).map((w, i) => (
              <div key={w.id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${CAT_CONFIG[trainingCat].color}`, padding: '14px 16px', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: CAT_CONFIG[trainingCat].bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: CAT_CONFIG[trainingCat].color }}>{i + 1}</div>
                  <div>
                    <p style={{ fontWeight: 900, fontSize: 15, color: '#111', marginBottom: 2 }}>{w.exercise}</p>
                    <p style={{ fontWeight: 700, fontSize: 13, color: '#666' }}>{w.sets}s × {w.reps}rep <span style={{ color: CAT_CONFIG[trainingCat].color, fontWeight: 900 }}>/ {w.weight}kg</span><span style={{ color: '#1565c0', fontWeight: 700, marginLeft: 8 }}>🔥{w.burnKcal || 0}kcal</span></p>
                  </div>
                </div>
                <button onClick={() => removeWorkout(w.id)} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 20, padding: '4px 8px' }}>×</button>
              </div>
            ))}
          </>
        )}
      </div>

      {showHistory && trainingCat && (
        <div className="overlay" onClick={() => setShowHistory(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <p style={{ fontSize: 17, fontWeight: 900, color: '#111' }}>{trainingCat} — 過去の種目</p>
              <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', fontSize: 22, color: '#aaa', cursor: 'pointer' }}>×</button>
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#aaa', marginBottom: 12 }}>タップでフォームに入力 / 「すぐ追加」で即記録</p>
            {getPastExercises(trainingCat).map((w) => (
              <div key={w.exercise} className="hist-row" onClick={() => addFromHistory(w)} style={{ padding: '12px 14px', borderRadius: 10, border: '1.5px solid #eee', marginBottom: 8, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                <div>
                  <p style={{ fontWeight: 900, fontSize: 15, color: '#111', marginBottom: 2 }}>{w.exercise}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#888' }}>{w.sets}s × {w.reps}rep / {w.weight}kg</p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button onClick={(e) => { e.stopPropagation(); addWorkout(w.exercise, w.sets, w.reps, w.weight); }} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: CAT_CONFIG[trainingCat].color, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>すぐ追加</button>
                  <span style={{ color: '#ccc', fontSize: 16 }}>›</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  if (screen === 'meal') return (
    <>
      <style>{gs}</style>
      <div style={page}>
        <button className="back-btn" onClick={() => { setShowCalendar(false); setScreen('home'); }}>← ホームへ</button>

        {!showCalendar ? (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#111', marginBottom: 16 }}>🍚 食事管理</h2>

            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1, ...card, textAlign: 'center', padding: '14px 10px', marginBottom: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#999', marginBottom: 4 }}>🍚 摂取</p>
                <p style={{ fontSize: 20, fontWeight: 900, color: '#111' }}>{todayData.intake.toLocaleString()}<span style={{ fontSize: 12, fontWeight: 700 }}> kcal</span></p>
              </div>
              <div style={{ flex: 1, background: '#e8f4fd', border: '1.5px solid #bbdefb', borderRadius: 16, padding: '14px 10px', textAlign: 'center' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#1565c0', marginBottom: 4 }}>💪 消費</p>
                <p style={{ fontSize: 20, fontWeight: 900, color: '#1565c0' }}>{todayData.burn.toLocaleString()}<span style={{ fontSize: 12, fontWeight: 700 }}> kcal</span></p>
              </div>
            </div>

            <div style={{ ...card, background: todayData.net > 0 ? '#fff5f5' : '#f0fff4', border: `1.5px solid ${todayData.net > 0 ? '#ffcdd2' : '#c8e6c9'}`, padding: '14px 18px', marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 4 }}>今日の収支</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <p style={{ fontSize: 26, fontWeight: 900, color: todayData.net > 0 ? '#e53935' : '#2e7d32' }}>
                  {todayData.net > 0 ? '+' : ''}{todayData.net.toLocaleString()} kcal
                </p>
                <p style={{ fontSize: 15, fontWeight: 700, color: todayData.net > 0 ? '#e53935' : '#2e7d32' }}>
                  ({todayData.net > 0 ? '+' : ''}{kcalToKg(todayData.net)} kg)
                </p>
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#aaa', marginTop: 4 }}>{todayData.net > 0 ? '摂取超過 — カロリー消費を増やしましょう' : '消費超過 — 良い調子です！'}</p>
            </div>

            <button className="btn-outline" onClick={() => setShowCalendar(true)} style={{ width: '100%', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px' }}>📅 カレンダーで確認</button>

            <div style={card}>
              <p style={{ fontSize: 16, fontWeight: 900, color: '#111', marginBottom: 14 }}>食事を追加</p>
              <div style={{ marginBottom: 12, position: 'relative' }}>
                <label style={lbl}>食材名で検索</label>
                <input className="inp" value={foodQuery} onChange={(e) => handleFoodQuery(e.target.value)} placeholder="例: 鶏胸肉" />
                {foodSugg.length > 0 && (
                  <div style={{ position: 'absolute', zIndex: 10, background: '#fff', border: '1.5px solid #ddd', borderRadius: 10, width: '100%', overflow: 'hidden', top: '100%', marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    {foodSugg.map((f) => (
                      <div key={f} className="suggest-row" onClick={() => { setSelectedFood(f); setFoodQuery(f); setFoodSugg([]); }} style={{ padding: '11px 14px', cursor: 'pointer', fontSize: 14, fontWeight: 700, borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', color: '#111' }}>
                        <span>{f}</span><span style={{ color: '#aaa', fontWeight: 400 }}>{FOOD_DB[f]} kcal/g</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selectedFood && (
                <div style={{ marginBottom: 12 }}>
                  <label style={lbl}>グラム数</label>
                  <input className="inp" type="number" value={grams} onChange={(e) => setGrams(e.target.value)} placeholder="100" />
                  {grams && <p style={{ fontSize: 14, fontWeight: 900, color: '#2e7d32', marginTop: 6 }}>→ {Math.round(FOOD_DB[selectedFood] * parseFloat(grams))} kcal</p>}
                </div>
              )}
              <button className="btn-black" onClick={addMeal} disabled={!selectedFood || !grams}>+ 追加する</button>
            </div>

            {(meals[td] || []).filter((m) => m.type !== 'burn').length > 0 && (
              <>
                <p style={{ fontSize: 14, fontWeight: 900, color: '#555', marginBottom: 10 }}>本日の食事内訳</p>
                {(meals[td] || []).filter((m) => m.type !== 'burn').map((m) => (
                  <div key={m.id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: '13px 16px' }}>
                    <div>
                      <p style={{ fontWeight: 900, fontSize: 15, color: '#111', marginBottom: 2 }}>{m.food}</p>
                      <p style={{ fontWeight: 700, fontSize: 13, color: '#888' }}>{m.grams}g <span style={{ color: '#2e7d32', fontWeight: 900 }}>→ {m.kcal} kcal</span></p>
                    </div>
                    <button onClick={() => removeMeal(m.id)} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 20 }}>×</button>
                  </div>
                ))}
              </>
            )}

            {(meals[td] || []).filter((m) => m.type === 'burn').length > 0 && (
              <>
                <p style={{ fontSize: 14, fontWeight: 900, color: '#1565c0', marginBottom: 10 }}>💪 消費カロリー内訳</p>
                {(meals[td] || []).filter((m) => m.type === 'burn').map((m) => (
                  <div key={m.id} style={{ background: '#e8f4fd', border: '1.5px solid #bbdefb', borderRadius: 12, padding: '13px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 900, fontSize: 15, color: '#1565c0', marginBottom: 2 }}>{m.food}</p>
                      <p style={{ fontWeight: 700, fontSize: 13, color: '#1976d2' }}>消費 {m.kcal} kcal</p>
                    </div>
                    <button onClick={() => removeMeal(m.id)} style={{ background: 'none', border: 'none', color: '#aac', cursor: 'pointer', fontSize: 20 }}>×</button>
                  </div>
                ))}
              </>
            )}
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <button className="back-btn" style={{ marginBottom: 0 }} onClick={() => setShowCalendar(false)}>← 戻る</button>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#111' }}>カロリーカレンダー</h2>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 10, fontSize: 12, fontWeight: 700 }}>
              <span>🍚 緑 = 摂取kcal</span>
              <span>💪 青 = 消費kcal</span>
              <span>収支 = ± kg</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <button className="btn-outline" style={{ padding: '8px 14px' }} onClick={() => setMealCalMonth((p) => { const d = new Date(p.y, p.m - 1, 1); return { y: d.getFullYear(), m: d.getMonth() }; })}>‹</button>
              <span style={{ flex: 1, textAlign: 'center', fontWeight: 900, fontSize: 15 }}>{fmtMonth(mealCalMonth.y, mealCalMonth.m)}</span>
              <button className="btn-outline" style={{ padding: '8px 14px' }} onClick={() => setMealCalMonth((p) => { const d = new Date(p.y, p.m + 1, 1); return { y: d.getFullYear(), m: d.getMonth() }; })}>›</button>
            </div>
            <div style={{ background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 16, padding: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 4 }}>
                {['日', '月', '火', '水', '木', '金', '土'].map((d) => <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#aaa', padding: '3px 0' }}>{d}</div>)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
                {getCalData(mealCalMonth, 'meal').map((cell, i) => {
                  const hasData = cell && (cell.intake > 0 || cell.burn > 0);
                  const netKg = cell ? parseFloat(kcalToKg(cell.net)) : 0;
                  return (
                    <div key={i} style={{ borderRadius: 8, padding: '5px 2px', textAlign: 'center', minHeight: 72, background: '#fafafa', border: '1px solid #eee' }}>
                      {cell && (
                        <>
                          <div style={{ fontSize: 11, fontWeight: 700, color: cell.ds === td ? '#e53935' : '#333', marginBottom: 2 }}>{cell.d}</div>
                          {cell.intake > 0 && <div style={{ fontSize: 9, fontWeight: 900, color: '#2e7d32', background: '#f0fff4', borderRadius: 3, padding: '1px 2px', marginBottom: 2 }}>{cell.intake.toLocaleString()}</div>}
                          {cell.burn > 0 && <div style={{ fontSize: 9, fontWeight: 900, color: '#1565c0', background: '#e8f4fd', borderRadius: 3, padding: '1px 2px', marginBottom: 2 }}>{cell.burn.toLocaleString()}</div>}
                          {(cell.intake > 0 || cell.burn > 0) && (
                            <div style={{ fontSize: 9, fontWeight: 900, color: netKg > 0 ? '#e53935' : '#2e7d32', background: netKg > 0 ? '#fff0f0' : '#f0fff4', borderRadius: 3, padding: '1px 2px' }}>
                              {netKg > 0 ? '+' : ''}{netKg}kg
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#aaa', marginTop: 10, textAlign: 'center' }}>緑=摂取 青=消費 赤/緑=±kg収支</p>
          </>
        )}
      </div>
    </>
  );

  return null;
}
