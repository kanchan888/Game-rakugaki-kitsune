import type { Stage } from '../types';
import { stage01 } from './stage01';
import { stage02 } from './stage02';

/** 遊べるステージの一覧(順番どおりに解放される)。 */
export const STAGES: Stage[] = [stage01, stage02];
