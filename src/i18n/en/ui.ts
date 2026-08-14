/**
 * Interface strings.
 *
 * Narrative strings are not here — those are generated from `src/content/` at import time. This
 * file is the chrome: buttons, labels, stat names and the month log.
 */
export const uiStrings: Record<string, string> = {
  /* ------------------------------------------------------------- general */
  'app.title': 'Public Service Story',
  'app.tagline': 'From the intern desk to the minister’s office.',

  'action.continue': 'Continue',
  'action.new_game': 'New game',
  'action.start': 'Take the job',
  'action.back': 'Back',
  'action.end_turn': 'End the month',
  'action.next_month': 'Next month',
  'action.accept': 'Accept',
  'action.decline': 'Decline',
  'action.career': 'Career',
  'action.dashboard': 'Desk',
  'action.abandon': 'Abandon this career',
  'action.play_again': 'Start a new career',

  /* --------------------------------------------------------------- title */
  'title.subtitle':
    'You are about to join a small city council. What happens next is thirty years of decisions.',
  'title.continue_hint': 'A career is in progress.',
  'title.save_broken': 'The saved career could not be read, so it has been cleared.',

  /* ------------------------------------------------------------ new game */
  'newgame.heading': 'A new career',
  'newgame.name_label': 'Your name',
  'newgame.name_placeholder': 'Alex Moreau',
  'newgame.department_label': 'Choose a department',
  'newgame.department_hint': 'This choice is permanent. It shapes your work, your trouble, and one crisis you cannot see yet.',
  'newgame.starting_at': 'Starting post',
  'newgame.adjust_label': 'You begin with',

  /* --------------------------------------------------------------- stats */
  'stat.reputation': 'Reputation',
  'stat.performance': 'Performance',
  'stat.politicalCapital': 'Political capital',
  'stat.integrity': 'Integrity',
  'stat.stress': 'Stress',
  'stat.salary': 'Salary',

  'stat.reputation.help': 'How you are regarded outside your own office. Promotions and job offers depend on it.',
  'stat.performance.help': 'The rolling quality of your department’s output. It drives your reviews.',
  'stat.politicalCapital.help': 'Favours owed to you, and people who take your call.',
  'stat.integrity.help': 'Your ethical record. It closes off shortcuts and protects you when investigators arrive.',
  'stat.stress.help': 'Accumulated load. Reach 100 and you burn out.',

  /* ----------------------------------------------------------- dashboard */
  'dash.month': 'Month {turn}',
  'dash.of_max': 'of {max}',
  'dash.effort_remaining': '{remaining} of {total} effort points left',
  'dash.overtime': 'Work overtime',
  'dash.overtime_hint': '+{points} points, +{stress} stress',
  'dash.board_heading': 'On your desk',
  'dash.personal_heading': 'Your own time',
  'dash.empty_board': 'Nothing on the desk this month. It will not last.',
  'dash.rest': 'Rest',
  'dash.rest_desc': 'An evening that is yours. Each point spent here takes {amount} off your stress.',
  'dash.networking': 'Networking',
  'dash.networking_desc': 'Coffee, corridors and committees. Each point spent here is {amount} political capital.',
  'dash.log_heading': 'Recent months',
  'dash.log_empty': 'Nothing has happened yet.',
  'dash.due_now': 'Due this month',
  'dash.due_in': 'Due in {turns} months',
  'dash.due_next': 'Due next month',
  'dash.progress': '{progress} of {required}',
  'dash.difficulty': 'Difficulty',
  'dash.add_effort': 'Add a point to {task}',
  'dash.remove_effort': 'Take a point off {task}',
  'dash.offer_waiting': 'You have an offer waiting.',

  /* --------------------------------------------------------------- event */
  'event.choose': 'What do you do?',
  'event.locked': 'Not available: {reason}',
  'event.locked.stat_min': 'needs {stat} of at least {required}',
  'event.locked.stat_max': 'needs {stat} of at most {required}',
  'event.locked.level': 'needs a more senior post',
  'event.locked.other': 'not available to you',

  /* -------------------------------------------------------------- report */
  'report.heading': 'Month {turn}',
  'report.completed': 'Finished',
  'report.failed': 'Missed',
  'report.nothing_finished': 'Nothing was finished this month.',
  'report.changes': 'How the month left you',
  'report.salary_paid': 'Salary',
  'report.review_heading': 'Performance review',
  'report.new_offer': 'An offer has arrived from {org}.',
  'report.quality.excellent': 'Excellent',
  'report.quality.good': 'Good',
  'report.quality.poor': 'Poor',

  'review.outstanding': 'Outstanding',
  'review.solid': 'Solid',
  'review.adequate': 'Adequate',
  'review.concerning': 'Concerning',
  'review.outstanding.note': 'The department noticed. So did the level above it.',
  'review.solid.note': 'A good year, recorded as a good year.',
  'review.adequate.note': 'Nothing to correct and nothing to celebrate.',
  'review.concerning.note': 'The conversation was not a comfortable one.',

  /* -------------------------------------------------------------- career */
  'career.heading': 'Your career',
  'career.current': 'Current post',
  'career.since': 'In post {turns} months',
  'career.offers_heading': 'On the table',
  'career.no_offers': 'No offers at the moment. Build a reputation and they will come.',
  'career.offer_title': '{title}, {org}',
  'career.offer_salary': '{salary} a month',
  'career.offer_expires': 'Expires in {turns} months',
  'career.offer_expires_now': 'Expires at the end of this month',
  'career.requirements_heading': 'To be offered {title}',
  'career.requirement_met': 'met',
  'career.requirement_short': '{current} of {required}',
  'career.requirement_months': '{current} of {required} months',
  'career.requirement_time': 'Months in post',
  'career.qualified': 'You meet the requirements. An offer can arrive in any month now — they do not come automatically.',
  'career.top_of_ladder': 'There is no higher post to be appointed to. What is left is politics.',
  'career.ladder_heading': 'The ladder',
  'career.level_reached': 'Reached',
  'career.level_current': 'You are here',
  'career.level_future': 'Ahead of you',

  /* -------------------------------------------------------------- ending */
  'ending.heading': 'The end of a career',
  'ending.stats_heading': 'Where you finished',
  'ending.timeline_heading': 'Your career',
  'ending.months': '{turns} months in the public service',
  'ending.final_post': 'Final post',

  /* ----------------------------------------------------------------- log */
  'log.career_started': 'Started at {org}, {department} department.',
  'log.task_excellent': '{task} — finished excellently.',
  'log.task_good': '{task} — finished.',
  'log.task_poor': '{task} — finished poorly.',
  'log.task_failed': '{task} — missed the deadline.',
  'log.review_outstanding': 'Performance review: outstanding.',
  'log.review_solid': 'Performance review: solid.',
  'log.review_adequate': 'Performance review: adequate.',
  'log.review_concerning': 'Performance review: concerning.',
  'log.offer_received': 'An offer arrived from {org}.',
  'log.took_post': 'Took the post of {title} at {org}.',
  'log.staff_left': '{name} resigned.',
  'log.staff_joined': '{name} joined the unit.',
  'log.budget_overspent': 'The budget year closed overspent.',
  'log.budget_underspent': 'The budget year closed underspent — next year’s allocation is cut.',
};
