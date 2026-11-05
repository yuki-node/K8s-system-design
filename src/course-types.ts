export type Relation = 'request' | 'data' | 'control' | 'check' | 'reject' | 'lost' | 'local' | 'compare';
export type Frame = [title: string, from: number, to: number, event: string, explanation: string, state: string, relation: Relation];
export interface ParticipantGroup { label: string; nodes: number[] }
export interface Milestone { step: number; node: number; status: 'pending' | 'running' | 'ready' | 'failed' | 'removed' }
export interface Example {
  title: string;
  language: 'sh' | 'yaml';
  prerequisite: string;
  code: string;
  expected: string;
  filename?: string;
}
export interface Scenario {
  nodes: string[];
  steps: Frame[];
  groups?: ParticipantGroup[];
  milestones?: Milestone[];
  code: string[];
  example: Example;
}
export interface Lesson extends Scenario {
  id: string;
  group: 0 | 1 | 2;
  title: string;
  en: string;
  summary: string;
  principle: string;
  tradeoff: string;
  pitfall: string;
  sections: [{title: string; body: string}, {title: string; body: string}, {title: string; body: string}];
  sources: string[];
  related: string[];
  fault: Scenario & { name: string };
}
export function sh(title: string, prerequisite: string, code: string, expected: string): Example {
  return { title, language: 'sh', prerequisite, code: code.trim(), expected };
}
export function yaml(title: string, prerequisite: string, filename: string, code: string, expected: string): Example {
  return { title, language: 'yaml', prerequisite, filename, code: code.trim(), expected };
}
