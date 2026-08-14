import type { EndingId, GameState } from '../engine/types';
import { text } from './authoring';

/**
 * The closing text for each way a career can stop.
 *
 * The Minister ending has three variants chosen from how you got there, because "you became a
 * minister" is not one story: the reformer, the operator and the survivor arrive in the same room
 * having done very different things.
 */
export interface EndingCopy {
  titleKey: string;
  bodyKey: string;
  epitaphKey: string;
}

const minister = {
  reformer: text(
    'ending.minister.body.reformer',
    'You arrive with a reputation for having said the unwelcome thing early, every time, for twenty years. It has cost you friends and two promotions and it is the entire reason you are here: they needed someone whose signature means something. The eleven decisions in the folder are the ones nobody else would sign. You start at the top.',
  ),
  operator: text(
    'ending.minister.body.operator',
    'You arrive owed favours by half the building and owing them to the other half, which is what a career looks like when it is built out of people rather than files. You know exactly which of the eleven decisions can be moved and who has to be spoken to first. It is not the career you described to that new joiner, and it works.',
  ),
  survivor: text(
    'ending.minister.body.survivor',
    'You arrive having been, at various points, both better and considerably worse than the job required, and having survived every occasion on which that was nearly discovered. The folder does not care. Eleven decisions, and the only person in the building who can take them is the one who got here.',
  ),
};

export const endingCopy: Record<EndingId, EndingCopy> = {
  minister: {
    titleKey: text('ending.minister.title', 'Minister'),
    bodyKey: minister.reformer,
    epitaphKey: text('ending.minister.epitaph', 'From a desk in Alderford to the Council of Ministers.'),
  },
  retirement_honoured: {
    titleKey: text('ending.retirement_honoured.title', 'Thirty years'),
    bodyKey: text(
      'ending.retirement_honoured.body',
      'The room is full, and the people in it mean it. Three of them tell the same story about you, which is the one where you refused to sign something, and each version is slightly wrong in a way that flatters you. What you actually leave behind is smaller and better than the story: a set of procedures that work, and four people who learned from you how to write a note that cannot be misread.',
    ),
    epitaphKey: text('ending.retirement_honoured.epitaph', 'Retired, respected, and correctly filed.'),
  },
  retirement_quiet: {
    titleKey: text('ending.retirement_quiet.title', 'A card, signed by the department'),
    bodyKey: text(
      'ending.retirement_quiet.body',
      'There is a card and a collection and a cake at three o’clock, and the director says several accurate and general things. You did the work for thirty years. Most of it was fine. Nobody is going to tell the story of any of it, and on the walk to the car park you find that you mind less than you expected.',
    ),
    epitaphKey: text('ending.retirement_quiet.epitaph', 'Thirty years of files, and the files were fine.'),
  },
  burnout: {
    titleKey: text('ending.burnout.title', 'Signed off'),
    bodyKey: text(
      'ending.burnout.body',
      'It is not dramatic. You sit down at your desk on a Tuesday and find that you cannot make yourself open the first file, and then you cannot make yourself open it on Wednesday either. The doctor is kind and unsurprised. The work continues without you, competently, which is the part that stings — and which is also, eventually, the thing that lets you stop.',
    ),
    epitaphKey: text('ending.burnout.epitaph', 'The work continued. It always does.'),
  },
  dismissed: {
    titleKey: text('ending.dismissed.title', 'A quiet conversation'),
    bodyKey: text(
      'ending.dismissed.body',
      'Nobody uses the word dismissed. There is a conversation about fit, and a phrase about the department moving in a different direction, and an arrangement that is generous enough to be signed without lawyers. The files you were carrying are redistributed by an email that does not mention you. You clear the desk on a Friday, and the pass stops working at six.',
    ),
    epitaphKey: text('ending.dismissed.epitaph', 'It simply was not working out.'),
  },
  disgrace: {
    titleKey: text('ending.disgrace.title', 'The file with your signature on it'),
    bodyKey: text(
      'ending.disgrace.body',
      'It was never one decision. It was a queue moved, a figure signed off, an opinion softened, a folder put back where you found it — each one small, each one defensible at the time, and all of them in the same file now, in order, with dates. The investigator is scrupulously polite. What strikes you, reading your own decisions laid end to end, is how obvious the pattern looks from outside and how invisible it was from the desk.',
    ),
    epitaphKey: text('ending.disgrace.epitaph', 'Small decisions, in a long line, with dates.'),
  },
};

/** Picks the Minister variant that matches how this career was actually built. */
export function ministerVariantKey(state: GameState): string {
  if (state.stats.integrity >= 60) return minister.reformer;
  if (state.stats.politicalCapital >= 70) return minister.operator;
  return minister.survivor;
}

export function endingBodyKey(ending: EndingId, state: GameState): string {
  return ending === 'minister' ? ministerVariantKey(state) : endingCopy[ending].bodyKey;
}
