// ルールの一覧と、reducer・画面が使う共通の入口
// 各ルールは「○✕が押されたら全員の状態をどう変えるか」を返す純粋な関数を持つ（docs/plan-rules.md）
import freeScore from './freeScore.js';
import freeCircle from './freeCircle.js';
import plusMinus from './plusMinus.js';
import updown from './updown.js';
import mnCross from './mnCross.js';
import tenByTen from './tenByTen.js';
import pass from './pass.js';
import survival from './survival.js';
import zaa from './zaa.js';
import {
  PLAY_FIELDS,
  BASE_PLAY_VALUES,
  FINISH_NONE,
  FINISH_WON,
  FINISH_OUT,
  FINISH_VALUES,
  isActive,
} from './helpers.js';

export { PLAY_FIELDS, BASE_PLAY_VALUES, FINISH_NONE, FINISH_WON, FINISH_OUT, FINISH_VALUES, isActive };

export const RULES = [freeScore, freeCircle, plusMinus, updown, mnCross, tenByTen, pass, survival, zaa];

export const DEFAULT_RULE_ID = freeScore.id;

const RULES_BY_ID = Object.fromEntries(RULES.map((r) => [r.id, r]));

export function getRule(id) {
  return RULES_BY_ID[id] ?? RULES_BY_ID[DEFAULT_RULE_ID];
}

export function isKnownRuleId(id) {
  return Object.hasOwn(RULES_BY_ID, id);
}

// params をルールの定義どおりにそろえる。足りない・おかしい値は既定値で埋める
export function normalizeParams(id, params) {
  const rule = getRule(id);
  const src = params && typeof params === 'object' ? params : {};
  const out = {};
  for (const def of rule.params) {
    const v = src[def.key];
    if (def.type === 'choice') {
      out[def.key] = def.options.some((o) => o.value === v) ? v : def.default;
    } else {
      out[def.key] = Number.isInteger(v) && v >= (def.min ?? 0) ? v : def.default;
    }
  }
  return out;
}

export function normalizeRule(rule) {
  const id = isKnownRuleId(rule?.id) ? rule.id : DEFAULT_RULE_ID;
  return { id, params: normalizeParams(id, rule?.params) };
}

export function defaultRule(id = DEFAULT_RULE_ID) {
  return normalizeRule({ id, params: {} });
}

// ルールの「最初の値」。切り替え・リセット・途中でのプレイヤー追加に使う
export function initialPlayFields(rule) {
  const def = getRule(rule.id);
  return { ...BASE_PLAY_VALUES, ...(def.initialPlayer?.(rule.params) ?? {}) };
}

// 押された○✕をルールに渡し、変えたあとの全員と問題の数を返す。受け付けないときは null
// 勝ち負けの決まった人の○✕は受け付けない（ロックは見ない。ボタン側で止める）
export function applyAnswer(rule, players, questionNo, playerId, result) {
  if (result !== 'correct' && result !== 'wrong') return null;
  const me = players.find((p) => p.id === playerId);
  if (!me || !isActive(me)) return null;

  const def = getRule(rule.id);
  const next = def.answer(players, playerId, result, rule.params);

  // 勝ち抜け・失格が決まった人に順番を付ける。同時に決まった人は同じ番号
  // 済んだ人を削除しても番号が重ならないよう、人数と付いている最大の番号の大きい方から続ける
  const counts = {};
  for (const f of [FINISH_WON, FINISH_OUT]) {
    const done = players.filter((p) => p.finish === f);
    counts[f] = Math.max(done.length, ...done.map((p) => p.finishOrder ?? 0));
  }
  const beforeById = new Map(players.map((p) => [p.id, p]));
  const numbered = next.map((p) => {
    const before = beforeById.get(p.id);
    if (before?.finish === FINISH_NONE && p.finish !== FINISH_NONE) {
      return { ...p, finishOrder: counts[p.finish] + 1 };
    }
    return p;
  });

  return {
    players: numbered,
    questionNo: result === 'correct' ? questionNo + 1 : questionNo,
  };
}

// 「得点順」の並び: 勝ち抜けた順 → ルールごとの成績 → 失格（後に落ちた人が上）
export function comparePlayers(rule, a, b) {
  const rank = (p) => (p.finish === FINISH_WON ? 0 : p.finish === FINISH_NONE ? 1 : 2);
  const diff = rank(a) - rank(b);
  if (diff !== 0) return diff;
  if (a.finish === FINISH_WON) return a.finishOrder - b.finishOrder;
  if (a.finish === FINISH_OUT) return b.finishOrder - a.finishOrder;
  return getRule(rule.id).compare(a, b, rule.params);
}

export function playerView(rule, player, players) {
  const v = getRule(rule.id).view(player, rule.params, players);
  return { sub: null, badges: [], ...v };
}
