/**
 * The Spanish dictionaries as one chunk.
 *
 * Nothing but `loadLocale` imports this file, and that import is dynamic, which is what makes the
 * bundler emit it as a separate chunk rather than folding it into the main one.
 */

import { ES_STRINGS } from './content';
import { uiStrings } from './ui';

export const dictionaries: Record<string, string>[] = [uiStrings, ES_STRINGS];
