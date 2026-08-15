export const strings: Record<string, string> = {
  'evt.followup.audit_letter.title': 'Una carta de la autoridad de auditoría',
  'evt.followup.audit_letter.body':
    'Dos páginas, correctas, con una lista de documentos que aportar en veinte días hábiles. Han elegido un expediente que tú no habrías elegido para ellos.',
  'evt.followup.audit_letter.choice.full': 'Darles todo, correctamente indexado',
  'evt.followup.audit_letter.choice.full.out.0':
    'Te pasas dos semanas montando una respuesta completa e indexada. El hallazgo es una observación menor sin corrección financiera. La nota de cierre del auditor usa la palabra "ejemplar" sobre la gestión del expediente.',
  'evt.followup.audit_letter.choice.full.out.1':
    'El expediente es tan débil como temías. Se propone una corrección y el asunto se remite para una revisión más amplia.',
  'evt.followup.audit_letter.choice.minimum': 'Responder exactamente a lo pedido',
  'evt.followup.audit_letter.choice.minimum.out.0':
    'Una respuesta limitada y correcta. Cierran el expediente con una observación. No se pide nada más.',
  'evt.followup.audit_letter.choice.minimum.out.1':
    'La limitación misma se nota. Llega una segunda lista, más larga, de documentos cuatro semanas después.',
  'evt.followup.audit_letter.choice.delay': 'Pedir una prórroga y esperar que se olvide',
  'evt.followup.audit_letter.choice.delay.out.0':
    'Concedida una vez. Las auditorías no se olvidan; se ralentizan. La misma solicitud llega en primavera con una frase final más firme.',

  'evt.followup.investigation.title': 'Esto ya es un asunto formal',
  'evt.followup.investigation.body':
    'El expediente se ha remitido a una investigación formal. No eres su objeto, en el sentido de que nadie lo ha dicho. Te han pedido un relato por escrito de tu participación, y que la petición se mantenga confidencial.',
  'evt.followup.investigation.choice.full_account': 'Escribir un relato completo y honesto',
  'evt.followup.investigation.choice.full_account.out.0':
    'Expones qué sabías, cuándo, y qué hiciste al respecto. La investigación concluye que los fallos eran sistémicos y anteriores a ti. Tu relato se cita en las recomendaciones.',
  'evt.followup.investigation.choice.full_account.out.1':
    'Tu relato es completo, honesto, y contiene la frase que demuestra que lo sabías. La conclusión es que actuaste dentro de tu competencia y por debajo del estándar exigido.',
  'evt.followup.investigation.choice.minimal': 'Dar un relato cuidadoso y limitado',
  'evt.followup.investigation.choice.minimal.out.0':
    'Preciso, poco útil, e intachable. La investigación pasa a gente que escribió con más soltura.',
  'evt.followup.investigation.choice.minimal.out.1':
    'La brevedad se contrasta, en el informe, con los relatos de dos compañeros. No se alega nada. El contraste es el hallazgo.',
  'evt.followup.investigation.choice.lawyer': 'Pedir asesoramiento antes de responder nada',
  'evt.followup.investigation.choice.lawyer.out.0':
    'Sensato, caro, y completamente correcto. También lleva seis semanas y todo el edificio sabe que lo hiciste.',

  'evt.followup.annulment.title': 'Se ha anulado el contrato',
  'evt.followup.annulment.body':
    'La cláusula que detectaste la ha detectado también otra persona. El tribunal ha anulado la adjudicación. Las obras están al setenta por ciento, el contratista reclama, y el expediente deja constancia de que el defecto era identificable desde el principio.',
  'evt.followup.annulment.choice.own_it': 'Dejar constancia de que lo detectaste y qué hiciste',
  'evt.followup.annulment.choice.own_it.out.0':
    'Presentas la nota, la fecha, y a quién se la diste. El fallo se sitúa donde corresponde, que no es contigo, y la administración aprende algo caro.',
  'evt.followup.annulment.choice.own_it.out.1':
    'Dices que lo advertiste. No hay nota, porque tuviste cuidado de no dejar una, y la conversación que describes la recuerda de otra manera la única otra persona presente.',
  'evt.followup.annulment.choice.quiet': 'No decir nada sobre haberlo visto',
  'evt.followup.annulment.choice.quiet.out.0':
    'La investigación establece que nadie en el departamento jurídico detectó el defecto. Esa conclusión ya es permanente, y no es cierta, y eres la única persona que sabe ambas cosas.',
  'evt.followup.annulment.choice.fix_forward': 'Centrarte por completo en limitar el daño',
  'evt.followup.annulment.choice.fix_forward.out.0':
    'Te pasas dos meses con el acuerdo, la nueva licitación y la reclamación del contratista, y reduces el coste para la administración en una cifra muy considerable. Nadie pregunta quién sabía qué, porque te has hecho imprescindible para la limpieza.',

  'evt.followup.supplier_challenge.title': 'Una impugnación formal',
  'evt.followup.supplier_challenge.body':
    'Han escrito los abogados de un proveedor. Impugnan el procedimiento, han identificado una irregularidad real, y han pedido todos los documentos relativos a la decisión.',
  'evt.followup.supplier_challenge.choice.concede': 'Reconocer el punto y repetir la licitación',
  'evt.followup.supplier_challenge.choice.concede.out.0':
    'Cuesta once semanas y algo de reputación, y cierra el asunto por completo. El procedimiento repetido es el más limpio que ha producido el departamento en años.',
  'evt.followup.supplier_challenge.choice.defend': 'Defender el procedimiento',
  'evt.followup.supplier_challenge.choice.defend.out.0':
    'La irregularidad resulta ser intrascendente y la impugnación fracasa. La decisión del departamento se mantiene y el proveedor paga sus propias costas.',
  'evt.followup.supplier_challenge.choice.defend.out.1':
    'La impugnación prospera. Se anula la adjudicación, se acuerda una indemnización, y la sentencia dedica tres párrafos a la práctica de evaluación de la administración.',
  'evt.followup.supplier_challenge.choice.settle': 'Llegar a un acuerdo discreto',
  'evt.followup.supplier_challenge.choice.settle.out.0':
    'Un pago, una cláusula de confidencialidad, y ningún reconocimiento de nada. Se cierra antes de fin de mes y queda en el expediente durante diez años.',

  'evt.followup.press_question.title': 'Una lista de once preguntas',
  'evt.followup.press_question.body':
    'Un periodista ha enviado once preguntas numeradas a la oficina de prensa. Nueve son fáciles. Dos son lo bastante concretas como para que alguien haya hablado, y ambas son sobre una decisión tuya.',
  'evt.followup.press_question.choice.answer_fully': 'Responder bien a las once',
  'evt.followup.press_question.choice.answer_fully.out.0':
    'El artículo es justo. Las dos respuestas difíciles se citan íntegras, que es lo que lo hace justo, y la historia muere en una semana.',
  'evt.followup.press_question.choice.answer_fully.out.1':
    'El artículo es justo con la administración y duro contigo personalmente, porque la respuesta honesta a la pregunta siete es que tomaste una decisión de criterio y fue un error.',
  'evt.followup.press_question.choice.nine': 'Responder a las nueve, esquivar las dos',
  'evt.followup.press_question.choice.nine.out.0':
    '"La administración no comenta casos individuales." Publica la evasiva literalmente, dos veces, lo cual es más dañino que cualquiera de las dos respuestas.',
  'evt.followup.press_question.choice.nothing': 'Remitirlo todo a la oficina de prensa e irte a casa',
  'evt.followup.press_question.choice.nothing.out.0':
    'La oficina de prensa responde, de forma aceptable, sin conocer las dos cosas que importaban. El artículo señala que el responsable no estuvo disponible.',

  'evt.followup.councillor_question.title': 'Una pregunta en el orden del día del pleno',
  'evt.followup.councillor_question.body':
    'Punto catorce: una pregunta por escrito sobre cómo ha gestionado tu departamento el asunto. La presenta una concejala que se ha leído el expediente con más atención que casi nadie del edificio.',
  'evt.followup.councillor_question.choice.brief_fully': 'Informar al presidente con el cuadro completo',
  'evt.followup.councillor_question.choice.brief_fully.out.0':
    'Le das todo, incluido lo que salió mal. La respuesta dada en el pleno es precisa y sobrevive a la pregunta de repregunta, que es la única prueba que importa.',
  'evt.followup.councillor_question.choice.minimal_brief': 'Informar lo mínimo que responde a la pregunta',
  'evt.followup.councillor_question.choice.minimal_brief.out.0':
    'La respuesta es técnicamente completa y la repregunta no llega. El punto quince se alcanza a las ocho y veinte.',
  'evt.followup.councillor_question.choice.minimal_brief.out.1':
    'La repregunta llega, y el presidente no tiene la respuesta, y descubre en público que no se le contó todo.',
  'evt.followup.councillor_question.choice.lobby': 'Conseguir que se retire la pregunta',
  'evt.followup.councillor_question.choice.lobby.out.0':
    'Dos conversaciones y el punto sale del orden del día antes de la reunión. Te cuesta un favor que preferirías haber conservado, y la concejala sabe exactamente qué ha pasado.',

  'evt.followup.complaint.title': 'Una queja formal',
  'evt.followup.complaint.body':
    'Un ciudadano se ha quejado, por escrito, de cómo se gestionó su expediente. Leyéndola, la mayor parte es un malentendido del procedimiento y un párrafo tiene toda la razón.',
  'evt.followup.complaint.choice.uphold_part': 'Estimar la parte que tiene razón',
  'evt.followup.complaint.choice.uphold_part.out.0':
    'Explicas las ocho cosas que se hicieron bien y reconoces la que no, con una disculpa y una solución. Te escriben de vuelta diciendo que nadie lo había hecho así antes.',
  'evt.followup.complaint.choice.reject': 'Desestimarla en su totalidad',
  'evt.followup.complaint.choice.reject.out.0':
    'Una carta cuidadosa y defendible que no reconoce el párrafo que tenía razón. Se eleva al defensor del pueblo, donde se encuentra el mismo párrafo otra vez, por alguien con más autoridad.',
  'evt.followup.complaint.choice.delegate': 'Pasarla a la unidad de reclamaciones',
  'evt.followup.complaint.choice.delegate.out.0':
    'La gestionan con competencia y de forma genérica. El párrafo correcto se responde con una plantilla. Nada cambia.',

  'evt.followup.internal_review.title': 'Revisión interna',
  'evt.followup.internal_review.body':
    'Alguien ha pedido a la unidad de control interno que revise cómo se gestionó el expediente. Es rutinario, en el sentido de que nada en ello es inusual y todos los implicados se comportan como si lo fuera.',
  'evt.followup.internal_review.choice.cooperate': 'Cooperar plenamente y ofrecer los puntos débiles',
  'evt.followup.internal_review.choice.cooperate.out.0':
    'Les dices qué habrías hecho de otro modo antes de que lo encuentren. El informe contiene tres recomendaciones, todas las cuales ya habías planteado tú, y una frase que señala tu franqueza.',
  'evt.followup.internal_review.choice.defend': 'Defender que la gestión fue correcta en todo momento',
  'evt.followup.internal_review.choice.defend.out.0':
    'Lo fue, a grandes rasgos, todo el tiempo. La revisión cierra sin hallazgos y te has pasado tres semanas demostrando algo que ya sabías.',
  'evt.followup.internal_review.choice.defend.out.1':
    'La revisión encuentra dos cosas que habías defendido como correctas y no lo eran. Una defensa que falla cuesta más que una admisión que nunca se hizo.',

  'evt.followup.reprimand.title': 'Una conversación con la puerta cerrada',
  'evt.followup.reprimand.body':
    'Tu director querría hablar. La conversación es sobre lo que llegó tarde, y se está teniendo con la formalidad suficiente para que quede constancia por escrito.',
  'evt.followup.reprimand.choice.accept': 'Aceptarlo y explicar cómo evitar que se repita',
  'evt.followup.reprimand.choice.accept.out.0':
    'No discutes, explicas la causa, y sales con un plan. La nota registra el plan junto al fallo, que es la mejor versión posible de esta conversación.',
  'evt.followup.reprimand.choice.context': 'Explicar la carga de trabajo que lo causó',
  'evt.followup.reprimand.choice.context.out.0':
    'Escucha, comprueba, y descubre que la unidad tiene dos vacantes. La nota se redacta de otra manera y una de las vacantes se cubre ese mismo trimestre.',
  'evt.followup.reprimand.choice.context.out.1':
    'Lo oye como una excusa, lo dice, y la nota queda más larga de lo que habría sido.',
  'evt.followup.reprimand.choice.blame': 'Señalar al departamento que te retrasó',
  'evt.followup.reprimand.choice.blame.out.0':
    'Es cierto y es irrebatible y te gana la enemistad de un jefe de departamento que seguirá en tu vida profesional otra década.',

  'evt.followup.union_grievance.title': 'Una reclamación',
  'evt.followup.union_grievance.body':
    'Alguien de tu equipo ha presentado una reclamación formal sobre el proceso de evaluación. La delegada sindical está tranquila, es minuciosa, y ha identificado un trámite que, en efecto, se saltó.',
  'evt.followup.union_grievance.choice.concede': 'Reconocer el defecto de forma y repetirlo',
  'evt.followup.union_grievance.choice.concede.out.0':
    'Repites el trámite correctamente, con la delegada presente. El resultado no cambia y el proceso ya es sólido, y el equipo ha visto que una queja contra ti produjo un resultado justo.',
  'evt.followup.union_grievance.choice.defend': 'Defender la evaluación',
  'evt.followup.union_grievance.choice.defend.out.0':
    'El fondo se sostiene, la forma no, y la reclamación se estima solo por el motivo técnico. El equipo oye "estimada".',
  'evt.followup.union_grievance.choice.hr': 'Pasarle todo el asunto a recursos humanos',
  'evt.followup.union_grievance.choice.hr.out.0':
    'Se resuelve en cuatro meses gente que no os conoce a ninguno de los dos. Nadie queda satisfecho y no se repite, porque nadie querrá arriesgarse de nuevo con una conversación de evaluación.',

  'evt.followup.minister_hearing.title': 'La comparecencia',
  'evt.followup.minister_hearing.body':
    'La comisión parlamentaria dispone de tres horas. Tienen tu carrera delante: cada expediente, cada decisión, cada nota que escribiste y cada una que no. Las preguntas las hace gente que se ha preparado.',
  'evt.followup.minister_hearing.choice.record': 'Apoyarte en tu trayectoria',
  'evt.followup.minister_hearing.choice.record.out.0':
    'Respondes a todo, incluidas las dos preguntas que duelen. El informe de la comisión señala que no evadiste nada, y que tu relato de las decisiones difíciles coincidía con los documentos.',
  'evt.followup.minister_hearing.choice.record.out.1':
    'Han encontrado tres. No las tres peores, pero tres, y tus respuestas son cuidadosas de un modo que en televisión se lee como calculado.',
  'evt.followup.minister_hearing.choice.allies': 'Dejar que tus aliados gestionen la comisión',
  'evt.followup.minister_hearing.choice.allies.out.0':
    'Las preguntas difíciles las hace gente que ha acordado de antemano cómo se responderán. Son tres horas poco edificantes y funciona por completo.',
  'evt.followup.minister_hearing.choice.withdraw': 'Retirar tu nombre',
  'evt.followup.minister_hearing.choice.withdraw.out.0':
    'Escribes dos párrafos diciendo que al departamento le sirve mejor alguien que no haya tomado las decisiones que tú tomaste. Se lee como dignidad o como miedo, según quién lo lea.',

  'evt.followup.minister_appointment.title': 'El nombramiento',
  'evt.followup.minister_appointment.body':
    'Está hecho. El decreto se firma un jueves y te llevan a un edificio que has visitado cincuenta veces y al que, hasta ahora, entrabas por otra puerta. Hay una carpeta sobre la mesa con once decisiones dentro que llevaban esperando a un ministro.',
  'evt.followup.minister_appointment.choice.open_folder': 'Abrir la carpeta',
  'evt.followup.minister_appointment.choice.open_folder.out.0':
    'Empiezas por arriba. Hace veintidós años llevabas tres días en un puesto en Alderford, preguntándote si algo de aquello importaba, y ahora la respuesta a esa pregunta está en tus manos y pesa más de lo que esperabas.',
};
