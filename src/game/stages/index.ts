import type { Stage } from '../types';
import { tutorial } from './tutorial';
import { stage01 } from './stage01';
import { stage02 } from './stage02';

/** 遊べるステージの一覧(順番どおりに解放される。最初はチュートリアル)。 */
export const STAGES: Stage[] = [tutorial, stage01, stage02];
