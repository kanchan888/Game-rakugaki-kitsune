import type { Stage } from '../types';
import { tutorial } from './tutorial';
import { stage01 } from './stage01';
import { stage02 } from './stage02';
import { stage03 } from './stage03';
import { stage04 } from './stage04';
import { stage05 } from './stage05';
import { stage06 } from './stage06';
import { stage07 } from './stage07';
import { stage08 } from './stage08';
import { stage09 } from './stage09';

/** 遊べるステージの一覧(順番どおりに解放される。最初はチュートリアル)。 */
export const STAGES: Stage[] = [
  tutorial,
  stage01,
  stage02,
  stage03,
  stage04,
  stage05,
  stage06,
  stage07,
  stage08,
  stage09,
];
