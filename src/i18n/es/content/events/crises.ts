/**
 * Las crisis, en castellano.
 *
 * Lo importante al traducir estas: llegan porque algo ya salió mal en un sitio al que no estabas
 * mirando, y para cuando te enteras lo único que queda por decidir es cómo respondes. El tono es
 * el de un expediente que nadie quería abrir, no el de una emergencia dramática.
 */

export const strings: Record<string, string> = {
  /* ---------------------------------------------------------------- llegadas */

  'evt.crisis.inquiry.title': 'Una carta con número de expediente',
  'evt.crisis.inquiry.body':
    'Se está examinando una decisión tomada hace cuatro años. Tú no estabas, cosa que quedará establecida con todo detalle y que ayudará menos de lo que te gustaría. El mandato llega el viernes.',
  'evt.crisis.inquiry.choice.cooperate': 'Abrir los archivos y decirlo',
  'evt.crisis.inquiry.choice.cooperate.out.0':
    'Lo mandas todo, sin que te lo pidan, con una nota que enumera qué falta y por qué. Te cuesta quince días y te compra lo único que aquí vale algo: que nadie encuentre después nada que tú no mencionaras.',
  'evt.crisis.inquiry.choice.headoff': 'Averiguar quién lo ha pedido',
  'evt.crisis.inquiry.choice.headoff.out.0':
    'Tres llamadas dejan claro que esto empezó como una queja de alguien con más memoria que expediente. No desaparece, pero llega acotado a algo que un departamento puede responder de verdad.',
  'evt.crisis.inquiry.choice.headoff.out.1':
    'Tres llamadas dejan claro que ya lo sabe todo el mundo, y que se ha tomado nota de que preguntabas. El mandato llega el viernes, algo más amplio de lo que era el martes.',

  'evt.crisis.migration.title': 'La fecha de apagado',
  'evt.crisis.migration.body':
    'Once años de registros están en un sistema cuyo proveedor ha dejado de contestar, y alguien firmó una fecha que queda a cuatro meses. Quien la firmó se ha jubilado.',
  'evt.crisis.migration.choice.own': 'Asumirlo ya, mientras hay tiempo',
  'evt.crisis.migration.choice.own.out.0':
    'Pones tu nombre encima antes de que nadie te lo pida, que es la diferencia entre un proyecto y un incidente. Va a ser espantoso igualmente.',
  'evt.crisis.migration.choice.escalate': 'Ponerlo por escrito al consejo',
  'evt.crisis.migration.choice.escalate.out.0':
    'El consejo toma nota del riesgo, te agradece haberlo planteado y te pide que lideres la respuesta. Es lo que le pasa a quien plantea riesgos, y lo sabías al escribir el informe.',

  'evt.crisis.safeguarding.title': 'El expediente que se paró',
  'evt.crisis.safeguarding.body':
    'Un caso pasó por tres equipos, uno de ellos el tuyo, y se paró donde no debía. Todo esto es ahora urgente y nada de esto tiene ya arreglo.',
  'evt.crisis.safeguarding.choice.front': 'Decir claramente que fue nuestro',
  'evt.crisis.safeguarding.choice.front.out.0':
    'Lo dices antes de que nadie lo establezca, lo que te cuesta la semana y te ahorra el año. No hay ninguna versión de esto en la que alguien se sienta mejor.',
  'evt.crisis.safeguarding.choice.establish': 'Establecer primero los hechos',
  'evt.crisis.safeguarding.choice.establish.out.0':
    'Dos días de reconstrucción cuidadosa producen una cronología exacta, defendible y dos días posterior a la primera llamada de un periodista.',

  'evt.crisis.clawback.title': 'La condición que nadie leyó',
  'evt.crisis.clawback.body':
    'Una subvención llevaba una condición sobre en qué podía gastarse el dinero. Pasaron cuatro años de gasto. Un auditor ha leído ahora esa condición bastante más despacio de lo que se leyó en su momento.',
  'evt.crisis.clawback.choice.negotiate': 'Ir a hablar con quien la concedió',
  'evt.crisis.clawback.choice.negotiate.out.0':
    'No son gente poco razonable y no van a perdonar cuatro años. Lo que sacas es un procedimiento, que es mejor que un requerimiento.',
  'evt.crisis.clawback.choice.reconstruct': 'Rehacer el caso desde los archivos',
  'evt.crisis.clawback.choice.reconstruct.out.0':
    'En algún punto de cuatro años de expedientes está el argumento de que casi todo ese gasto sí cumplía la condición. Encontrarlo es trabajo de alguien, y ese alguien eres tú.',

  /* --------------------------------------------------- lo que cuesta fallarlas */

  'evt.crisis.inquiry_failed.title': 'Las conclusiones',
  'evt.crisis.inquiry_failed.body':
    'El informe se publica sin tus alegaciones dentro, porque tus alegaciones no llegaron. Y lo dice, en un párrafo que se va a citar durante unos cuantos años.',
  'evt.crisis.inquiry_failed.choice.accept': 'No hay nada que decir',
  'evt.crisis.inquiry_failed.choice.accept.out.0':
    'No hay nada que decir. Lo lees dos veces y lo guardas en el cajón donde va ese tipo de cosas.',
  'evt.crisis.inquiry_failed.choice.respond': 'Publicar una respuesta',
  'evt.crisis.inquiry_failed.choice.respond.out.0':
    'Tu respuesta es exacta, comedida y la leen once personas. Valía la pena escribirla igualmente, sobre todo por ti.',

  'evt.crisis.safeguarding_failed.title': 'La revisión',
  'evt.crisis.safeguarding_failed.body':
    'Se ha encargado una revisión independiente sobre cómo se llevó el caso, que es lo que pasa cuando la interna no llega a tiempo. Tu unidad aparece nombrada en el mandato.',
  'evt.crisis.safeguarding_failed.choice.cooperate': 'Darles todo',
  'evt.crisis.safeguarding_failed.choice.cooperate.out.0':
    'Les das todo, incluidas las partes que lo empeoran. Es lo único que queda que decidas tú.',
  'evt.crisis.safeguarding_failed.choice.protect': 'Proteger a quien lo llevaba',
  'evt.crisis.safeguarding_failed.choice.protect.out.0':
    'Haces tú las entrevistas y mantienes dos nombres fuera del resumen. Tu unidad se da cuenta, que no es poco, y la revisión también.',

  /* ------------------------------------------------ los expedientes con dientes */

  'task.crisis.inquiry.title': 'La investigación',
  'task.crisis.inquiry.desc':
    'Una decisión de hace cuatro años se examina ahora línea a línea, por gente con capacidad de requerir y sin plazo propio. Todo lo que envías es definitivo.',
  'task.crisis.migration.title': 'El sistema que no migra',
  'task.crisis.migration.desc':
    'Once años de registros, un proveedor que ha dejado de contestar y una fecha de apagado que alguien firmó por escrito antes de que tú llegaras.',
  'task.crisis.safeguarding.title': 'El caso que se pasó por alto',
  'task.crisis.safeguarding.desc':
    'Un expediente que pasó por tres equipos, uno de ellos el tuyo, y se paró donde no debía. Todo esto es ahora urgente y nada de esto tiene ya arreglo.',
  'task.crisis.clawback.title': 'El dinero que hay que devolver',
  'task.crisis.clawback.desc':
    'Una condición de subvención que nadie leyó con atención, cuatro años de gasto contra ella, y un auditor que sí la ha leído con muchísima atención.',
};
