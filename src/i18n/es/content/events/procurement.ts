export const strings: Record<string, string> = {
  'evt.procurement.shared_address.title': 'Dos licitadores, una dirección',
  'evt.procurement.shared_address.body':
    'Revisando la documentación de una licitación de cuatrocientos mil euros, notas que dos de los tres licitadores están registrados en la misma dirección. Sus ofertas son lo bastante distintas para parecer competitivas y lo bastante parecidas para haberlas escrito la misma persona.',
  'evt.procurement.shared_address.choice.suspend': 'Suspender el procedimiento y remitirlo',
  'evt.procurement.shared_address.choice.suspend.out.0':
    'Detienes la licitación y reportas una posible colusión a la autoridad de competencia. Lleva catorce meses, las obras se retrasan un año, y dos personas a las que nunca conocerás acaban sancionadas.',
  'evt.procurement.shared_address.choice.exclude': 'Excluir a ambos y adjudicar al tercero',
  'evt.procurement.shared_address.choice.exclude.out.0':
    'Limpio, rápido, y defendible bajo las causas de exclusión. La tercera oferta es un nueve por ciento más cara. Nadie investiga a los otros dos, que vuelven a licitar el año que viene.',
  'evt.procurement.shared_address.choice.proceed': 'Anotarlo y seguir adelante',
  'evt.procurement.shared_address.choice.proceed.out.0':
    'Compartir dirección no es prueba de nada, y el plazo vence el viernes. Escribes una línea en el expediente que registra que te diste cuenta, que es la parte en la que pensarás después.',

  'evt.procurement.tailored_spec.title': 'Un requisito muy específico',
  'evt.procurement.tailored_spec.body':
    'El departamento técnico ha enviado sus requisitos para el sistema nuevo. Uno de ellos —una certificación concreta que, hasta donde puedes averiguar, tiene un único proveedor en el país— no parece obviamente necesario para nada.',
  'evt.procurement.tailored_spec.choice.strip': 'Retirarlo y pedirles que lo justifiquen',
  'evt.procurement.tailored_spec.choice.strip.out.0':
    'No pueden justificarlo. Venía del folleto del propio proveedor, copiado de buena fe por alguien que no sabía más. Ahora cualifican cuatro licitadores en vez de uno.',
  'evt.procurement.tailored_spec.choice.equivalent': 'Añadir "o equivalente" y seguir adelante',
  'evt.procurement.tailored_spec.choice.equivalent.out.0':
    'El arreglo estándar, correctamente aplicado. En la práctica los licitadores leen el requisito y no la salvedad, y dos deciden no presentarse.',
  'evt.procurement.tailored_spec.choice.keep': 'Publicarlo tal como lo redactaron',
  'evt.procurement.tailored_spec.choice.keep.out.0':
    'Son los expertos técnicos y es su pliego. Se recibe una oferta. Cumple los requisitos, y es cara.',

  'evt.procurement.committee_pressure.title': 'Un miembro de la mesa tiene una opinión',
  'evt.procurement.committee_pressure.body':
    'En la reunión de evaluación, un vocal defiende con fuerza una oferta que quedó tercera en calidad. Sus argumentos no son irrazonables. También resulta, y tú lo sabes, que fue compañero del director de proyecto de esa empresa.',
  'evt.procurement.committee_pressure.choice.declare': 'Pedir a todos que reiteren sus conflictos de intereses',
  'evt.procurement.committee_pressure.choice.declare.out.0':
    'Lo planteas a toda la mesa, con neutralidad, como trámite de procedimiento. Él declara la relación. También se abstiene, molesto, y las puntuaciones se mantienen.',
  'evt.procurement.committee_pressure.choice.record': 'Recoger sus argumentos en el acta, literalmente',
  'evt.procurement.committee_pressure.choice.record.out.0':
    'Cada palabra, atribuida. La mesa vota las puntuaciones tal como están. Él deja de discutir en cuanto ve a quien levanta el acta escribiendo.',
  'evt.procurement.committee_pressure.choice.concede': 'Dejar que la mesa se deje convencer',
  'evt.procurement.committee_pressure.choice.concede.out.0':
    'Las puntuaciones se revisan "por coherencia" y la tercera oferta pasa a ser la primera. Todo queda documentado. Nada es defendible si alguien llega a leerlo con atención.',

  'evt.procurement.genuine_emergency.title': 'Ha fallado la calefacción',
  'evt.procurement.genuine_emergency.body':
    'En una residencia de mayores, en enero. Una licitación completa lleva once semanas. Las previsiones de emergencia permiten una adjudicación directa, y el único contratista que puede empezar el lunes es uno que la administración ya ha usado, sin licitar, tres veces antes.',
  'evt.procurement.genuine_emergency.choice.direct': 'Adjudicación directa, completamente documentada',
  'evt.procurement.genuine_emergency.choice.direct.out.0':
    'Redactas con cuidado la justificación —la emergencia, el plazo, la ausencia de alternativas— y adjudicas. Es exactamente para lo que existe la excepción, y el expediente lo demuestra.',
  'evt.procurement.genuine_emergency.choice.quotes': 'Tres presupuestos en cuarenta y ocho horas',
  'evt.procurement.genuine_emergency.choice.quotes.out.0':
    'Te pasas un fin de semana al teléfono. Otros dos contratistas pueden empezar el miércoles. Cuesta a la residencia tres días fríos y produce un procedimiento que nadie puede criticar, y un precio un doce por ciento más bajo.',
  'evt.procurement.genuine_emergency.choice.usual': 'Llamar al contratista habitual',
  'evt.procurement.genuine_emergency.choice.usual.out.0':
    'Empiezan el lunes. La justificación se escribe después, endeble. Es la cuarta adjudicación directa a la misma empresa y el patrón ya es un patrón.',

  'evt.procurement.incumbent.title': 'El proveedor actual conoce el edificio',
  'evt.procurement.incumbent.body':
    'El proveedor actual lleva este contrato nueve años. Conoce cada particularidad del sistema, lo cual lo hace genuinamente mejor en el trabajo y hace que su oferta esté genuinamente mejor informada de lo que podría estar la de cualquier otro.',
  'evt.procurement.incumbent.choice.level': 'Publicar todo lo que sabe el proveedor actual',
  'evt.procurement.incumbent.choice.level.out.0':
    'Te pasas dos semanas documentando bien el sistema y lo incluyes todo en el pliego. Cinco licitadores en vez de dos. El proveedor actual gana igual, por mérito, a un precio un ocho por ciento más bajo.',
  'evt.procurement.incumbent.choice.standard': 'Aplicar el procedimiento estándar',
  'evt.procurement.incumbent.choice.standard.out.0':
    'Dos ofertas. Gana el proveedor actual. Todo fue correcto y el resultado lo sabía de antemano todo el mundo, incluido el otro licitador.',
  'evt.procurement.incumbent.choice.handicap': 'Ponderar la puntuación en contra del proveedor actual',
  'evt.procurement.incumbent.choice.handicap.out.0':
    'Un intento defendible de abrir el mercado que produce un proveedor nuevo, una transición difícil, y dieciocho meses de problemas que el anterior no habría tenido.',

  'evt.procurement.lunch.title': 'Solo una comida',
  'evt.procurement.lunch.body':
    'El delegado regional de un proveedor propone comer para "entender mejor la dirección de la administración". No hay ninguna licitación en curso. Es buena compañía y genuinamente conocedor, y dentro de ocho meses habrá una licitación en curso.',
  'evt.procurement.lunch.choice.decline': 'Rechazarlo',
  'evt.procurement.lunch.choice.decline.out.0':
    'Sugieres que lo que quiera decirte puede decirlo en la oficina, con una nota en el expediente. No vuelve a insistir. Tampoco, después, la oferta de su empresa.',
  'evt.procurement.lunch.choice.office': 'Reunirte en la oficina y levantar acta',
  'evt.procurement.lunch.choice.office.out.0':
    'Una reunión registrada, una nota en el expediente, una copia a los demás proveedores si la piden. Él queda algo desinflado y tú te enteras de todo lo útil que tenía que decir.',
  'evt.procurement.lunch.choice.go': 'Ir a comer',
  'evt.procurement.lunch.choice.go.out.0':
    'Es genuinamente útil y del todo agradable y paga él. Dentro de ocho meses, leyendo la oferta de su empresa, notarás que te esfuerzas un poco más en ser justo con ella que con las demás.',

  'evt.procurement.late_bid.title': 'Cuatro minutos',
  'evt.procurement.late_bid.body':
    'La mejor oferta, con diferencia, llegó cuatro minutos después del plazo, porque su mensajero se quedó retenido en el control de seguridad de abajo. La norma es que las ofertas tardías se excluyen. La norma no tiene excepción para el control de seguridad.',
  'evt.procurement.late_bid.choice.exclude': 'Excluirla',
  'evt.procurement.late_bid.choice.exclude.out.0':
    'La excluyes, y adjudicas a una oferta que es peor y en nada más barata. Es la decisión correcta según las normas, y las normas existen precisamente para que esta decisión no dependa de cómo te sientas.',
  'evt.procurement.late_bid.choice.accept': 'Aceptarla — el retraso fue culpa de la administración',
  'evt.procurement.late_bid.choice.accept.out.0':
    'Documentas el retraso en el control de seguridad y lo reconoces. Nadie impugna. La administración se queda con la mejor oferta, y has creado un precedente que no puedes controlar.',
  'evt.procurement.late_bid.choice.accept.out.1':
    'Un licitador que pierde impugna en la semana. Se anula la adjudicación, el proceso se repite, y los cuatro minutos cuestan once semanas.',
  'evt.procurement.late_bid.choice.cancel': 'Cancelar y repetir la licitación',
  'evt.procurement.late_bid.choice.cancel.out.0':
    'Nadie queda excluido por un tecnicismo y nadie sale favorecido. Cuesta siete semanas y mucha buena voluntad de todos los licitadores, y es intachable.',

  'evt.procurement.local_firm.title': 'La empresa local',
  'evt.procurement.local_firm.body':
    'Una empresa que emplea a cuarenta personas en el pueblo ha licitado contra una multinacional. La oferta de la multinacional es mejor en todos los criterios publicados y un once por ciento más barata. Tres concejales han mencionado por separado "apoyar el comercio local" esta semana.',
  'evt.procurement.local_firm.choice.award': 'Adjudicar según los criterios publicados',
  'evt.procurement.local_firm.choice.award.out.0':
    'Gana la multinacional porque los criterios así lo dicen. La empresa local pierde nueve empleos a lo largo del año siguiente. Hiciste lo único que permitía la ley y no es un mes cómodo.',
  'evt.procurement.local_firm.choice.future': 'Adjudicar correctamente, y cambiar el próximo pliego',
  'evt.procurement.local_firm.choice.future.out.0':
    'Este va a la multinacional. Después reescribes el acuerdo marco para incluir criterios sociales y ambientales legales, publicados con antelación, aplicables a todos. El próximo contrato es genuinamente competitivo en lo que le importa al pueblo.',
  'evt.procurement.local_firm.choice.bend': 'Buscar la manera de llegar a la empresa local',
  'evt.procurement.local_firm.choice.bend.out.0':
    'Una lectura generosa de un criterio cualitativo cierra una diferencia del once por ciento. Cuarenta empleos se quedan en el pueblo. La hoja de puntuación no sobrevivirá a una impugnación y todos esperan que no la haya.',
};
