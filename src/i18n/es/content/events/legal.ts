export const strings: Record<string, string> = {
  'evt.legal.opinion_pressure.title': 'La respuesta que quería',
  'evt.legal.opinion_pressure.body':
    'Tu dictamen dice que la propuesta no puede seguir adelante tal como está. El director lo ha leído, y pregunta —con amabilidad, dos veces— si hay "alguna forma de escribir esto que nos lleve a un sí".',
  'evt.legal.opinion_pressure.choice.hold': 'El dictamen se mantiene',
  'evt.legal.opinion_pressure.choice.hold.out.0':
    'No cambias ni una palabra. La propuesta se rediseña en seis semanas y avanza conforme a derecho. Nadie te agradece las seis semanas.',
  'evt.legal.opinion_pressure.choice.soften': 'Suavizar el lenguaje',
  'evt.legal.opinion_pressure.choice.soften.out.0':
    'La conclusión sobrevive; el énfasis no. Ahora se lee como una advertencia y no como un impedimento, y la propuesta avanza apoyándose precisamente en tu advertencia.',
  'evt.legal.opinion_pressure.choice.route': 'Ofrecer una vía legal para el mismo objetivo',
  'evt.legal.opinion_pressure.choice.route.out.0':
    'Te pasas un fin de semana buscando la versión que funciona. Es más lenta, más limitada, y jurídicamente sólida. Él consigue casi todo lo que quería y sabe exactamente quién lo encontró.',

  'evt.legal.fatal_flaw.title': 'Una cláusula que no debería estar ahí',
  'evt.legal.fatal_flaw.body':
    'Leyendo un contrato firmado por otro motivo, notas que los criterios de adjudicación se cambiaron después de cerrarse la licitación. No es una zona gris. Si alguien lo impugna, se anulará, y las obras están a medio construir.',
  'evt.legal.fatal_flaw.choice.flag': 'Ponerlo por escrito de inmediato',
  'evt.legal.fatal_flaw.choice.flag.out.0':
    'Escribes la nota. Se recibe como se reciben esas notas. La administración empieza, dolorosamente, a arreglarlo antes de que nadie de fuera lo note, que es el mejor resultado disponible y no se siente como ninguno.',
  'evt.legal.fatal_flaw.choice.quiet': 'Comentárselo solo verbalmente a tu director',
  'evt.legal.fatal_flaw.choice.quiet.out.0':
    'Te da las gracias y dice que lo mirará. Nada entra en el expediente. Pase lo que pase después, ahora no hay registro de que lo sabías.',
  'evt.legal.fatal_flaw.choice.ignore': 'No es tu expediente',
  'evt.legal.fatal_flaw.choice.ignore.out.0':
    'Lo cierras y vuelves a tu propio trabajo. Las obras continúan. La cláusula sigue ahí.',

  'evt.legal.statutory_clock.title': 'Veinte días',
  'evt.legal.statutory_clock.body':
    'El recurso debe responderse en veinte días o se estima por silencio. Es el día catorce, el expediente está incompleto, y el departamento que tiene la prueba que falta no responde.',
  'evt.legal.statutory_clock.choice.chase': 'Ir en persona a su oficina',
  'evt.legal.statutory_clock.choice.chase.out.0':
    'Bajas dos plantas y no te vas hasta tener los documentos. Te lleva una tarde y te cuesta algo de buena voluntad y nada más.',
  'evt.legal.statutory_clock.choice.partial': 'Responder con lo que tienes',
  'evt.legal.statutory_clock.choice.partial.out.0':
    'La respuesta se presenta a tiempo y es más débil de lo que debería. Se sostiene, por poco, y sabes exactamente por dónde no se habría sostenido.',
  'evt.legal.statutory_clock.choice.extension': 'Solicitar una prórroga',
  'evt.legal.statutory_clock.choice.extension.out.0':
    'Concedida, al cuarto intento, con una nota en el expediente sobre la coordinación interna de la administración. El abogado del recurrente ya sabe que el departamento está desorganizado.',

  'evt.legal.external_counsel.title': 'Han contratado a un despacho',
  'evt.legal.external_counsel.body':
    'Sin consultarte, el departamento ha contratado un despacho externo para un asunto que llevas gestionando un año. Su primera nota repite tu propio dictamen, a cuatrocientos euros la hora, con más aplomo y menos precisión.',
  'evt.legal.external_counsel.choice.correct': 'Corregir su nota por escrito',
  'evt.legal.external_counsel.choice.correct.out.0':
    'Identificas tres errores, con cortesía e incontestablemente. El despacho reconoce dos. Tu director lee el intercambio y saca la conclusión obvia.',
  'evt.legal.external_counsel.choice.cooperate': 'Trabajar con ellos',
  'evt.legal.external_counsel.choice.cooperate.out.0':
    'Les pones bien al día, y el dictamen conjunto es mejor de lo que habría sido cualquiera de los dos por separado. La factura sigue siendo absurda, y el mérito se comparte.',
  'evt.legal.external_counsel.choice.step_back': 'Cedérselo por completo',
  'evt.legal.external_counsel.choice.step_back.out.0':
    'Si están pagando por asesoramiento, que tengan asesoramiento. Recuperas cuatro semanas de tu vida y una nota discreta en tu expediente sobre desvinculación.',

  'evt.legal.precedent.title': 'El primero de muchos',
  'evt.legal.precedent.body':
    'Este es un caso pequeño con hechos poco habituales. Como sea que lo decidas, la decisión se citará internamente durante años, y se aplicará a personas cuyas circunstancias ahora no puedes imaginar.',
  'evt.legal.precedent.choice.narrow': 'Decidirlo del modo más limitado posible',
  'evt.legal.precedent.choice.narrow.out.0':
    'Resuelves este caso sin vincular nada más. Es un ejercicio jurídico disciplinado, y dentro de tres años alguien se quejará de que el departamento no tiene un criterio claro.',
  'evt.legal.precedent.choice.principle': 'Exponer el principio general',
  'evt.legal.precedent.choice.principle.out.0':
    'Redactas bien el razonamiento y el departamento obtiene una regla que puede aplicar. Se cita durante una década, correctamente.',
  'evt.legal.precedent.choice.principle.out.1':
    'El principio es limpio y, aplicado a un caso que no previste, produce un resultado claramente injusto. Te lo citan, en una vista, cuatro años después.',

  'evt.legal.anonymous_letter.title': 'Una carta anónima',
  'evt.legal.anonymous_letter.body':
    'Dos páginas, sin firmar, que alegan que un jefe de otro departamento lleva tiempo aprobando facturas de una empresa propiedad de su cuñado. Es lo bastante detallada para ser bien informada o malintencionada, y solo te la han enviado a ti.',
  'evt.legal.anonymous_letter.choice.formal': 'Registrarla y remitirla formalmente',
  'evt.legal.anonymous_letter.choice.formal.out.0':
    'La registras, la remites a control interno, y te apartas. El proceso avanza despacio. Pase lo que pase, al menos es la decisión de la organización y no la tuya.',
  'evt.legal.anonymous_letter.choice.verify': 'Comprobar antes el registro mercantil',
  'evt.legal.anonymous_letter.choice.verify.out.0':
    'Quince minutos de registros públicos. La titularidad es cierta; las aprobaciones no son suyas. Remites una preocupación mucho más limitada y mucho mejor fundada, y no le destruye la vida a nadie una carta sin firmar.',
  'evt.legal.anonymous_letter.choice.bin': 'Las cartas anónimas van a la papelera',
  'evt.legal.anonymous_letter.choice.bin.out.0':
    'Es una política defendible, aplicada con coherencia. También es, esta vez, un error.',

  'evt.legal.hearing.title': 'Eres tú quien va',
  'evt.legal.hearing.body':
    'El tribunal contencioso-administrativo quiere un representante capaz de responder preguntas sobre la decisión. Eres tú. La jueza tiene fama de hacer la pregunta que el expediente no responde.',
  'evt.legal.hearing.choice.prepare': 'Prepararte durante tres días',
  'evt.legal.hearing.choice.prepare.out.0':
    'Hace la pregunta. Tienes la respuesta, con el documento, señalado. La administración gana y la sentencia cita tu testimonio.',
  'evt.legal.hearing.choice.prepare.out.1':
    'Hace una pregunta distinta, sobre una decisión tomada antes de que llegaras, y la respuesta honesta es que nadie sabe por qué. La administración pierde solo por ese punto.',
  'evt.legal.hearing.choice.wing': 'Leer el expediente en el tren',
  'evt.legal.hearing.choice.wing.out.0':
    'Reaccionas con rapidez y casi se nota. El caso sobrevive. Te pasas el viaje de vuelta enumerando lo que habrías dicho.',
  'evt.legal.hearing.choice.wing.out.1':
    'Te pillan sin saber algo que deberías saber, en público, para el acta. Son veinte minutos malos que te siguen hasta casa.',

  'evt.legal.verbal_cover.title': '"Solo dime que está bien"',
  'evt.legal.verbal_cover.body':
    'Un jefe de departamento te para junto al ascensor. Necesita saber si puede hacer algo hoy. No quiere una nota, quiere que le digas que sí, y dice explícitamente que pregunta de manera informal para que no quede nada por escrito.',
  'evt.legal.verbal_cover.choice.written': 'Ofrecerte a ponerlo por escrito esta tarde',
  'evt.legal.verbal_cover.choice.written.out.0':
    'No lo quiere y lo dice. Envías la nota de todos modos, breve y neutral. Sigue adelante, correctamente, y te encuentra ligeramente agotador.',
  'evt.legal.verbal_cover.choice.verbal_yes': 'Decirle que probablemente esté bien',
  'evt.legal.verbal_cover.choice.verbal_yes.out.0':
    'Probablemente lo esté. Si no lo está, no hay registro del asesoramiento, lo cual te protege a ti y lo deja expuesto a él, y los dos lo sabíais cuando lo dijiste.',
  'evt.legal.verbal_cover.choice.refuse': 'Negarte a asesorar de manera informal',
  'evt.legal.verbal_cover.choice.refuse.out.0':
    'Le dices, sin aspereza, que el asesoramiento jurídico informal es cómo las administraciones acaban en los tribunales. Espera dos días la nota. Tiene razón en que fue inconveniente; tú tienes razón en que era necesario.',
};
