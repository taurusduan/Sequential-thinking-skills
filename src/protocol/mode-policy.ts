import type { SessionMode, StepPolicy, TotalSteps } from '../types/session.js';

const phaseHints: Record<SessionMode, { early: string; middle: string; converge: string; conclude: string }> = {
  explore: {
    early: '继续拆解问题边界、关键变量与未知项，先澄清问题本身。',
    middle: '继续识别主矛盾、候选方向与高风险未知项，避免过早下结论。',
    converge: '如果关键未知项已足够清晰，请开始收敛到结论、风险与下一步建议。',
    conclude: '现在必须收敛，输出明确结论、主要风险与下一步动作。'
  },
  branch: {
    early: '先定义比较对象与比较维度，不要急着扩展更多路径。',
    middle: '继续围绕有限候选路径做对比，强调复杂度、收益、风险与可逆性。',
    converge: '如果比较维度已足够，请停止扩展新路径，开始收敛到推荐方案。',
    conclude: '现在必须收敛，给出推荐路径或明确排序，不要停留在“各有优劣”。'
  },
  audit: {
    early: '先确认被审视对象、已有判断与证据来源，不要重新发散问题。',
    middle: '继续识别漏洞、跳步、证据不足与隐含假设，聚焦缺陷而不是重想一遍。',
    converge: '如果主要缺陷已识别，请开始收敛到风险结论与修正建议。',
    conclude: '现在必须收敛，输出审计结论、风险等级与修正建议。'
  }
};

function getConvergeStart(totalSteps: TotalSteps): number {
  return totalSteps === 5 ? 4 : 6;
}

export function getStepPolicy(mode: SessionMode, stepNumber: number, totalSteps: TotalSteps): StepPolicy {
  if (stepNumber < 1 || stepNumber > totalSteps) {
    throw new Error(`stepNumber must be between 1 and ${totalSteps}`);
  }

  const convergeStart = getConvergeStart(totalSteps);
  const mustConclude = stepNumber === totalSteps;
  const shouldConverge = stepNumber >= convergeStart;
  const phase = phaseHints[mode];

  if (mustConclude) {
    return {
      phaseHint: phase.conclude,
      shouldConverge: true,
      mustConclude: true
    };
  }

  if (shouldConverge) {
    return {
      phaseHint: phase.converge,
      shouldConverge: true,
      mustConclude: false
    };
  }

  const midpoint = Math.ceil(totalSteps / 2);

  return {
    phaseHint: stepNumber < midpoint ? phase.early : phase.middle,
    shouldConverge: false,
    mustConclude: false
  };
}
