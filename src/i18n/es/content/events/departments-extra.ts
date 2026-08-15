export const strings: Record<string, string> = {
  /* ---------------------------------------------------------------- legal */
  'evt.legal.retrospective.title': 'Hacerlo legal desde marzo pasado',
  'evt.legal.retrospective.body':
    'Un programa lleva once meses funcionando sin la base legal que todos daban por hecha. Te preguntan si puede regularizarse con carácter retroactivo.',
  'evt.legal.retrospective.choice.can_be_done': 'Exponer con precisión qué puede arreglar la retroactividad y qué no',
  'evt.legal.retrospective.choice.can_be_done.out.0':
    'Dos páginas que distinguen lo que se puede validar de lo que no. La mitad del problema se disuelve; la otra mitad se convierte en una decisión de alguien más importante, correctamente.',
  'evt.legal.retrospective.choice.just_do_it': 'Redactar el instrumento de validación y seguir adelante',
  'evt.legal.retrospective.choice.just_do_it.out.0':
    'Se firma en seis semanas y nadie examina los once meses. En algún sitio hay gente afectada por un programa que no tenía base, y ningún registro de que se les tuviera en cuenta.',
  'evt.legal.retrospective.choice.refuse': 'Informar de que debe pararse hasta que sea legal',
  'evt.legal.retrospective.choice.refuse.out.0':
    'El programa se detiene nueve semanas y cuatrocientas personas sufren las molestias de que tu consejo fuera correcto. No te lo agradecen y tenías razón.',

  'evt.legal.junior_counsel.title': 'La júnior ha encontrado algo',
  'evt.legal.junior_counsel.body':
    'Una becaria con dos años en el puesto ha detectado un problema en un dictamen que visó el jefe de jurídico hace cuatro años. Está nerviosa, tentativa, y —lo compruebas dos veces— tiene razón.',
  'evt.legal.junior_counsel.choice.back_her': 'Poner su nombre en la corrección',
  'evt.legal.junior_counsel.choice.back_her.out.0':
    'La haces redactarlo y se lo llevas con ella. El jefe de jurídico se lo toma bien, en general, y a partir de esa semana es una abogada distinta.',
  'evt.legal.junior_counsel.choice.own_name': 'Plantearlo con tu propio nombre',
  'evt.legal.junior_counsel.choice.own_name.out.0':
    'Más seguro para ella y más sencillo para ti. Ella se da cuenta, no dice nada, y lo archiva con todo lo demás que está aprendiendo sobre cómo funciona esto.',
  'evt.legal.junior_counsel.choice.sit_on_it': 'Cuatro años son cuatro años',
  'evt.legal.junior_counsel.choice.sit_on_it.out.0':
    'Todavía no ha pasado nada malo. Le dices que es un buen hallazgo y que rara vez merece la pena reabrir estas cosas, y la ves decidir qué clase de departamento es este.',

  'evt.legal.settle_or_fight.title': 'Acordar o litigar',
  'evt.legal.settle_or_fight.body':
    'La administración probablemente ganará, a un coste de nueve meses y mucho tiempo de personal. El demandante aceptaría hoy una quinta parte de lo que pide.',
  'evt.legal.settle_or_fight.choice.settle': 'Acordar',
  'evt.legal.settle_or_fight.choice.settle.out.0':
    'Más barato que ganar, que es la aritmética que decide la mayoría de los litigios. También significa que el punto nunca se pone a prueba, y el próximo demandante tiene el mismo argumento.',
  'evt.legal.settle_or_fight.choice.fight': 'Litigar',
  'evt.legal.settle_or_fight.choice.fight.out.0':
    'Nueve meses y una sentencia que zanja el punto para todos los casos futuros. Caro, correcto, y ahorra una fortuna durante la década siguiente.',
  'evt.legal.settle_or_fight.choice.fight.out.1':
    'Nueve meses y una derrota en un punto que nadie previó. La oferta de acuerdo era una quinta parte de lo que la administración acaba pagando.',

  'evt.legal.plain_language.title': 'Nadie entiende las cartas',
  'evt.legal.plain_language.body':
    'La carta de notificación estándar es jurídicamente impecable y, a juzgar por cuatrocientas llamadas al mes, incomprensible. Reescribirla significa aceptar algo más de riesgo jurídico a cambio de que la gente entienda qué le ha pasado.',
  'evt.legal.plain_language.choice.rewrite': 'Reescribirlas en lenguaje claro',
  'evt.legal.plain_language.choice.rewrite.out.0':
    'Seis semanas de trabajo y las llamadas se reducen a la mitad. Dos años después un tribunal critica una frase que simplificaste, y volverías a hacer el mismo cambio.',
  'evt.legal.plain_language.choice.keep': 'Mantener la redacción que nunca ha perdido',
  'evt.legal.plain_language.choice.keep.out.0':
    'Defendible, sin cambios, y cuatrocientas llamadas al mes de gente intentando averiguar si le han denegado algo.',
  'evt.legal.plain_language.choice.both': 'Enviar las dos versiones',
  'evt.legal.plain_language.choice.both.out.0':
    'La resolución formal, y una nota de acompañamiento clara que la explica. El doble de papel, la mitad de confusión, y jurídicamente intachable porque no se quitó nada.',

  'evt.legal.conflicting_advice.title': 'El despacho externo no está de acuerdo contigo',
  'evt.legal.conflicting_advice.body':
    'Un despacho ha asesorado justo lo contrario de tu dictamen en un asunto en curso. Uno de los dos se equivoca. Cobran cuatrocientos la hora y no son obviamente mejores que tú.',
  'evt.legal.conflicting_advice.choice.test_it': 'Exponer las dos posturas a quien decide',
  'evt.legal.conflicting_advice.choice.test_it.out.0':
    'Escribes la versión honesta: esta es mi opinión, esta es la suya, aquí es donde divergen y qué depende de ello. Quien decide elige con los ojos abiertos, que es todo el trabajo.',
  'evt.legal.conflicting_advice.choice.defer': 'Ceder ante el despacho',
  'evt.legal.conflicting_advice.choice.defer.out.0':
    'Son los especialistas y es la respuesta institucional segura. Dieciocho meses después el punto se litiga y el tribunal adopta tu opinión original.',
  'evt.legal.conflicting_advice.choice.insist': 'Mantener tu propia opinión',
  'evt.legal.conflicting_advice.choice.insist.out.0':
    'Te mantienes, por escrito, con razones. Tienes razón, y el departamento deja de encargar a ese despacho este tipo de cuestión.',
  'evt.legal.conflicting_advice.choice.insist.out.1':
    'Te mantienes y te equivocas, por escrito, extensamente. Es un tipo de bochorno concreto y memorable.',

  'evt.legal.emergency_powers.title': 'Las potestades son más amplias de lo necesario',
  'evt.legal.emergency_powers.body':
    'Se está redactando con prisas un instrumento de emergencia. Tal como está escrito, la potestad que crea es considerablemente más amplia de lo que exige la emergencia, y nadie en la sala está pidiendo que se limite.',
  'evt.legal.emergency_powers.choice.narrow': 'Insistir en limitarla, con cláusula de caducidad',
  'evt.legal.emergency_powers.choice.narrow.out.0':
    'Añades los límites y la fecha de caducidad, contra la objeción de quienes señalan, correctamente, que es más lento. La potestad caduca según lo previsto dos años después, algo que casi nunca ocurre.',
  'evt.legal.emergency_powers.choice.as_drafted': 'Dejarla como está redactada; es una emergencia',
  'evt.legal.emergency_powers.choice.as_drafted.out.0':
    'Es una emergencia, y la potestad se usa proporcionadamente, y once años después sigue en el ordenamiento usándose para cosas que nadie en esa sala imaginó.',

  /* ------------------------------------------------------------ projects */
  'evt.projects.partner_collapse.title': 'Un socio ha entrado en concurso',
  'evt.projects.partner_collapse.body':
    'La organización que ejecutaba un tercio del proyecto dejó de operar el martes. Su paquete de trabajo está a la mitad, su personal se ha ido, y el plazo del financiador no se ha movido.',
  'evt.projects.partner_collapse.choice.absorb': 'Asumir el paquete de trabajo internamente',
  'evt.projects.partner_collapse.choice.absorb.out.0':
    'Reconstruyes un tercio del proyecto dentro de tu propia administración en cuatro meses. Es lo más difícil que haces ese año y el proyecto llega a buen puerto.',
  'evt.projects.partner_collapse.choice.descope': 'Reducir formalmente el proyecto',
  'evt.projects.partner_collapse.choice.descope.out.0':
    'Negocias un alcance reducido con el financiador, con honestidad y a tiempo. El proyecto entrega dos tercios de lo prometido, a tiempo, sin que nadie se sorprenda.',
  'evt.projects.partner_collapse.choice.report_late': 'Reportarlo en el próximo hito programado',
  'evt.projects.partner_collapse.choice.report_late.out.0':
    'Once semanas después, cuando vence el informe. Para entonces las opciones se han reducido a una, y la primera pregunta del financiador es desde cuándo lo sabías.',

  'evt.projects.evaluation_inconvenient.title': 'La evaluación no es favorable',
  'evt.projects.evaluation_inconvenient.body':
    'La evaluación independiente de tu proyecto insignia concluye que logró más o menos la mitad de lo que se afirmaba, por razones en su mayoría fuera del control de nadie. La publicación queda a tu criterio.',
  'evt.projects.evaluation_inconvenient.choice.publish': 'Publicarla completa',
  'evt.projects.evaluation_inconvenient.choice.publish.out.0':
    'Es incómoda durante dos semanas. También la citan tres administraciones que diseñan cosas parecidas, ninguna de las cuales comete ya el mismo error.',
  'evt.projects.evaluation_inconvenient.choice.summary': 'Publicar un resumen',
  'evt.projects.evaluation_inconvenient.choice.summary.out.0':
    'El resumen es preciso y no contiene ninguna de las cifras que importan. Alguien pide el informe completo por transparencia unos cuatro meses después.',
  'evt.projects.evaluation_inconvenient.choice.shelve': 'No publicarla',
  'evt.projects.evaluation_inconvenient.choice.shelve.out.0':
    'Queda en una unidad compartida. El próximo proyecto lo diseña gente que nunca la lee y repite dos de los tres fallos.',

  'evt.projects.beneficiary_fraud.title': 'Los recibos son demasiado perfectos',
  'evt.projects.beneficiary_fraud.body':
    'La reclamación de un beneficiario es impecable: números de factura correlativos, cifras redondas, un proveedor registrado tres semanas antes de la primera factura. Nada es demostrablemente irregular.',
  'evt.projects.beneficiary_fraud.choice.investigate': 'Remitirlo a investigación',
  'evt.projects.beneficiary_fraud.choice.investigate.out.0':
    'Es fraude, y bastante amateur. La recuperación lleva dos años y el traslado es exactamente para lo que existe el marco antifraude.',
  'evt.projects.beneficiary_fraud.choice.investigate.out.1':
    'Es una organización pequeña con un contable que hace todo en números redondos. La investigación casi los cierra y no encuentra nada.',
  'evt.projects.beneficiary_fraud.choice.query': 'Consultárselo directamente a ellos primero',
  'evt.projects.beneficiary_fraud.choice.query.out.0':
    'Pides la documentación de base antes de remitir nada. Lo que llega lo aclara en un sentido u otro en dos semanas, sin destruir a nadie que no hizo nada malo.',
  'evt.projects.beneficiary_fraud.choice.certify': 'No hay nada demostrablemente irregular',
  'evt.projects.beneficiary_fraud.choice.certify.out.0':
    'Lo certificas. La reclamación es una de seiscientas y tienes cuatro días. Es la decisión razonable y no la crees del todo.',

  'evt.projects.co_financing_gap.title': 'La cofinanciación no ha aparecido',
  'evt.projects.co_financing_gap.body':
    'El programa paga el sesenta por ciento; la administración debía aportar el resto. El resto se ha retirado discretamente del presupuesto del año que viene por alguien que no se dio cuenta de que sostenía el conjunto.',
  'evt.projects.co_financing_gap.choice.escalate': 'Escalarlo de inmediato y con contundencia',
  'evt.projects.co_financing_gap.choice.escalate.out.0':
    'Dejas del todo claro, por escrito, que retirar la aportación pierde cuatro veces esa cantidad en fondos externos. La partida se restituye en dos semanas y alguien pasa vergüenza.',
  'evt.projects.co_financing_gap.choice.find_it': 'Encontrar el dinero en otro sitio',
  'evt.projects.co_financing_gap.choice.find_it.out.0':
    'Tres departamentos aportan una parte a cambio de una mención en los resultados. Se sostiene con buena voluntad y funciona.',
  'evt.projects.co_financing_gap.choice.shrink': 'Reducir el proyecto a lo que se puede cofinanciar',
  'evt.projects.co_financing_gap.choice.shrink.out.0':
    'Honesto, ordenado, y la administración devuelve dos millones de euros que podría haber gastado. La decisión es correcta y queda mal en la memoria anual.',

  'evt.projects.visibility_rules.title': 'El logotipo tiene el tamaño equivocado',
  'evt.projects.visibility_rules.body':
    'Los requisitos de visibilidad del programa especifican el emblema del financiador con una proporción definida en cada material. Un auditor ha encontrado once incumplimientos en dos años, todos triviales, todos técnicamente gasto no elegible.',
  'evt.projects.visibility_rules.choice.contest': 'Impugnar la proporcionalidad',
  'evt.projects.visibility_rules.choice.contest.out.0':
    'Argumentas proporcionalidad con pruebas de la visibilidad realmente lograda. La corrección se reduce a cero. Lleva cinco meses de correspondencia sobre un logotipo.',
  'evt.projects.visibility_rules.choice.contest.out.1':
    'La norma es la norma. La corrección se mantiene, y el expediente pasa a quien aplica correcciones a programas enteros y no a resultados sueltos.',
  'evt.projects.visibility_rules.choice.accept': 'Aceptar la corrección y arreglar las plantillas',
  'evt.projects.visibility_rules.choice.accept.out.0':
    'La pagas, y luego te pasas una tarde haciendo las plantillas imposibles de hacer mal. Nadie del departamento vuelve a incumplirlo, lo cual vale más de lo que costó la corrección.',

  'evt.projects.pilot_scaling.title': 'El piloto funcionó',
  'evt.projects.pilot_scaling.body':
    'Un pequeño piloto ha dado resultados genuinamente buenos en un pueblo. Todos quieren escalarlo a nivel nacional para la primavera. Los resultados dependieron sustancialmente de una persona excepcional que lo dirigió.',
  'evt.projects.pilot_scaling.choice.honest_caveat': 'Escalarlo, y decir públicamente de qué dependía',
  'evt.projects.pilot_scaling.choice.honest_caveat.out.0':
    'Lo escalas con la advertencia adjunta a cada documento. Dos regiones reproducen bien las condiciones y obtienen los resultados; las demás no, y saben por qué.',
  'evt.projects.pilot_scaling.choice.scale_fast': 'Escalarlo tan rápido como quieren',
  'evt.projects.pilot_scaling.choice.scale_fast.out.0':
    'A nivel nacional para la primavera, y para el otoño los resultados son un tercio de los del piloto en todas partes salvo en el pueblo original. La evaluación culpa a la "fidelidad de implementación", una frase que significa esto.',
  'evt.projects.pilot_scaling.choice.second_pilot': 'Hacer primero un segundo piloto en un sitio corriente',
  'evt.projects.pilot_scaling.choice.second_pilot.out.0':
    'Seis meses de retraso para averiguar si funciona sin una persona excepcional. Funciona a medias, que es el hallazgo más útil que produce nadie ese año.',

  /* -------------------------------------------------------------- finance */
  'evt.finance.creative_classification.title': 'Capital o corriente',
  'evt.finance.creative_classification.body':
    'Novecientos mil euros de gasto podrían, con una lectura generosa, clasificarse como capital. Clasificados como corriente, incumplen un límite. La lectura generosa no es obviamente errónea.',
  'evt.finance.creative_classification.choice.revenue': 'Clasificarlo como lo que es',
  'evt.finance.creative_classification.choice.revenue.out.0':
    'Corriente, incumplimiento declarado, una reunión incómoda, y unas cuentas que dicen lo que dicen.',
  'evt.finance.creative_classification.choice.capital': 'Adoptar la lectura generosa',
  'evt.finance.creative_classification.choice.capital.out.0':
    'Sobrevive a la auditoría externa, porque es defendible. También es la primera de una serie de lecturas generosas que adoptará gente que la aprendió de esta.',
  'evt.finance.creative_classification.choice.ask': 'Preguntarle antes a los auditores',
  'evt.finance.creative_classification.choice.ask.out.0':
    'Les planteas la pregunta antes de decidir, por escrito. Dicen corriente. Te cuesta la opción y te compra un expediente que nadie puede criticar jamás.',

  'evt.finance.grant_clawback.title': 'La asociación no puede devolverlo',
  'evt.finance.grant_clawback.body':
    'Una asociación vecinal debe devolver cuarenta mil euros de subvención mal aplicada. No los robaron; los gastaron en la partida equivocada de un formulario demasiado complicado. Recuperarlos la cerrará.',
  'evt.finance.grant_clawback.choice.recover': 'Recuperarlo como exigen las normas',
  'evt.finance.grant_clawback.choice.recover.out.0':
    'Cierran en septiembre. Once empleos a tiempo parcial y un servicio para unas doscientas personas, terminado por un formulario. Cada paso que diste fue correcto.',
  'evt.finance.grant_clawback.choice.reschedule': 'Encontrar una vía legal para suavizarlo',
  'evt.finance.grant_clawback.choice.reschedule.out.0':
    'Un calendario de devolución a cuatro años, una pequeña baja dentro de tu competencia delegada, y un formulario reescrito. Te lleva dos semanas de ingenio y sobreviven.',
  'evt.finance.grant_clawback.choice.quietly_drop': 'Dejar que prescriba',
  'evt.finance.grant_clawback.choice.quietly_drop.out.0':
    'Permites que la recuperación caduque sin que nadie firme una decisión. Sobreviven, el dinero desaparece, y no hay registro de por qué.',

  'evt.finance.pension_liability.title': 'La cifra al final de las cuentas',
  'evt.finance.pension_liability.body':
    'El pasivo por pensiones se ha reformulado y ahora es considerablemente mayor que el presupuesto anual de la administración. Es una obligación real, está a décadas de distancia, y nadie la quiere en el resumen.',
  'evt.finance.pension_liability.choice.front': 'Incluirla en el resumen con una explicación',
  'evt.finance.pension_liability.choice.front.out.0':
    'Un párrafo que explica qué es y qué no es la cifra. Dos concejales la entienden por primera vez en una década, y el pánico que todos predijeron no ocurre.',
  'evt.finance.pension_liability.choice.note': 'Dejarla en la nota 27, donde corresponde',
  'evt.finance.pension_liability.choice.note.out.0':
    'Colocación técnicamente correcta, del todo convencional, y es la nota 27 precisamente porque nadie lee la nota 27.',

  'evt.finance.late_payment_penalty.title': 'Se acumulan intereses',
  'evt.finance.late_payment_penalty.body':
    'La administración paga tantas facturas con retraso que los intereses de demora se han convertido en una partida presupuestaria. Arreglarlo significa que el equipo de pagos duplique su rendimiento o que la cadena de aprobación pierda dos pasos.',
  'evt.finance.late_payment_penalty.choice.cut_approvals': 'Eliminar dos pasos de aprobación',
  'evt.finance.late_payment_penalty.choice.cut_approvals.out.0':
    'Los plazos de pago se reducen a la mitad, los intereses desaparecen, y no pasa nada malo porque los dos pasos comprobaban cosas ya comprobadas.',
  'evt.finance.late_payment_penalty.choice.cut_approvals.out.1':
    'Los plazos de pago se reducen a la mitad y un pago duplicado de sesenta mil euros sale cuatro meses después, porque uno de esos pasos sí hacía algo.',
  'evt.finance.late_payment_penalty.choice.more_people': 'Solicitar más personal para el equipo de pagos',
  'evt.finance.late_payment_penalty.choice.more_people.out.0':
    'Una propuesta con costes que demuestra que los intereses superan al salario. Tarda nueve meses en aprobarse y se aprueba, algo que casi nunca le pasa a una petición de puestos de retaguardia.',
  'evt.finance.late_payment_penalty.choice.absorb': 'Presupuestar los intereses',
  'evt.finance.late_payment_penalty.choice.absorb.out.0':
    'Lo incluyes en el presupuesto como una partida llamada "intereses de demora" y se aprueba sin comentarios, lo cual dice algo sobre cómo se leen los presupuestos.',

  'evt.finance.reserves_raid_again.title': 'El tercer año usando reservas para gasto corriente',
  'evt.finance.reserves_raid_again.body':
    'El presupuesto solo cuadra porque las reservas cubren gasto ordinario por tercer año consecutivo. Al ritmo actual, las reservas se agotan en unos cuatro años, y nadie quiere esa frase en un documento público.',
  'evt.finance.reserves_raid_again.choice.state_it': 'Incluir la cifra a cuatro años en el informe presupuestario',
  'evt.finance.reserves_raid_again.choice.state_it.out.0':
    'Una frase, un gráfico. Provoca un debate genuinamente difícil y el presupuesto del año siguiente es el primero en una década que no depende de las reservas.',
  'evt.finance.reserves_raid_again.choice.technical_note': 'Incluirlo como anexo técnico',
  'evt.finance.reserves_raid_again.choice.technical_note.out.0':
    'Se declara, formal y completamente, en un lugar calibrado para declararse en vez de para leerse. Te has cubierto y no has cambiado nada.',
  'evt.finance.reserves_raid_again.choice.silent': 'Cuadrar el presupuesto y no decir nada',
  'evt.finance.reserves_raid_again.choice.silent.out.0':
    'Cuadra. La situación de las reservas está en las cuentas para quien quiera mirarla. Cuatro años quedan lejos y quizá no estés aquí.',

  'evt.finance.systems_migration.title': 'El nuevo sistema contable se activa el lunes',
  'evt.finance.systems_migration.body':
    'Dos años de implementación. Las pruebas fueron aceptables más que buenas, el plan de contingencia es "revertir", y revertir después del primer mes de asientos no es en realidad posible.',
  'evt.finance.systems_migration.choice.delay': 'Retrasarlo un trimestre',
  'evt.finance.systems_migration.choice.delay.out.0':
    'Aceptas la crítica por un retraso de tres meses y usas el tiempo en las pruebas que deberían haberse hecho. Se activa en abril sin incidentes, y nadie lo nota.',
  'evt.finance.systems_migration.choice.go': 'Activarlo tal como estaba previsto',
  'evt.finance.systems_migration.choice.go.out.0':
    'Funciona. Dos semanas difíciles y luego un sistema mejor, según lo previsto, y nunca mencionas lo escasas que fueron las pruebas.',
  'evt.finance.systems_migration.choice.go.out.1':
    'Seis semanas en las que la administración no puede decir con fiabilidad qué ha gastado. Se arregla en agosto a un coste que supera la implementación.',
  'evt.finance.systems_migration.choice.parallel': 'Mantener los dos sistemas en paralelo un trimestre',
  'evt.finance.systems_migration.choice.parallel.out.0':
    'El doble de trabajo durante tres meses, y cada discrepancia detectada antes de que importe. El equipo queda agotado y la migración es la única que recuerda nadie que saliera bien.',

  /* --------------------------------------------------------- procurement */
  'evt.procurement.single_bid.title': 'Una sola oferta',
  'evt.procurement.single_bid.body':
    'La licitación cerró con una sola respuesta, del proveedor actual, a un precio un once por ciento por encima del presupuesto estimado. Cumple los requisitos. Adjudicarla es legal y adjudicarla dice algo.',
  'evt.procurement.single_bid.choice.award': 'Adjudicarla',
  'evt.procurement.single_bid.choice.award.out.0':
    'Conforme, defendible, y un once por ciento por encima del presupuesto. El mercado ha aprendido que esta administración adjudicará con una sola oferta, que es la parte cara.',
  'evt.procurement.single_bid.choice.find_out_why': 'Averiguar por qué no ha ofertado nadie más',
  'evt.procurement.single_bid.choice.find_out_why.out.0':
    'Seis llamadas establecen que el calendario era imposible en verano y que dos requisitos eran incomprensibles. La repites bien y consigues cuatro ofertas, la más barata un nueve por ciento por debajo del presupuesto.',
  'evt.procurement.single_bid.choice.find_out_why.out.1':
    'El mercado sencillamente es escaso: tres empresas en todo el país, dos de ellas ocupadas. Adjudicas la única oferta, tras comprobar que era la única disponible.',
  'evt.procurement.single_bid.choice.negotiate': 'Negociar antes el precio a la baja',
  'evt.procurement.single_bid.choice.negotiate.out.0':
    'Permitido en estas circunstancias, y logra bajarlo un cuatro por ciento. Sabían que eran la única oferta y los dos sabíais que lo sabían.',

  'evt.procurement.abnormally_low.title': 'Un cuarenta por ciento por debajo de todos',
  'evt.procurement.abnormally_low.body':
    'La oferta más baja está un cuarenta por ciento por debajo de la siguiente. O han encontrado algo que a todos los demás se les ha escapado, o piensan recuperarlo con modificados. La ley te obliga a preguntar.',
  'evt.procurement.abnormally_low.choice.interrogate': 'Interrogar el precio a fondo',
  'evt.procurement.abnormally_low.choice.interrogate.out.0':
    'Su explicación no sobrevive a cuatro preguntas. Excluyes la oferta, documentas por qué, y el contrato va a un precio que de verdad será el precio.',
  'evt.procurement.abnormally_low.choice.interrogate.out.1':
    'Su explicación es excelente: un método genuinamente mejor. Adjudicas, y entregan al precio ofertado, y el sector habla de ello durante un año.',
  'evt.procurement.abnormally_low.choice.take_it': 'Quedarte con el ahorro',
  'evt.procurement.abnormally_low.choice.take_it.out.0':
    'Se anuncia el ahorro destacado. Dieciocho meses y nueve modificados después, el coste final supera a la segunda oferta, y el anuncio es lo que recuerda todo el mundo.',

  'evt.procurement.contract_management.title': 'Nadie gestiona el contrato',
  'evt.procurement.contract_management.body':
    'El contrato de once millones de euros que adjudicaste hace dos años no tiene responsable designado. El proveedor lleva facturando contra hitos que nadie verifica. Es muy posible que lo esté haciendo todo bien.',
  'evt.procurement.contract_management.choice.assign': 'Asignar un responsable y auditar los dos últimos años',
  'evt.procurement.contract_management.choice.assign.out.0':
    'La auditoría encuentra trescientos mil euros de hitos facturados y no entregados. Se recupera. El contrato funciona correctamente durante los tres años que le quedan.',
  'evt.procurement.contract_management.choice.assign.out.1':
    'La auditoría concluye que el proveedor ha sido escrupuloso todo el tiempo. Dos meses de trabajo para establecer que no había nada mal, que es lo que cuesta la garantía.',
  'evt.procurement.contract_management.choice.from_now': 'Asignar un responsable solo de aquí en adelante',
  'evt.procurement.contract_management.choice.from_now.out.0':
    'Sensato, con vista al futuro, y traza una línea bajo dos años que ya nadie examinará. El proveedor nota la línea con la misma claridad que tú, y ajusta el precio del resto del contrato en consecuencia.',

  'evt.procurement.social_value.title': 'Diez por ciento por valor social',
  'evt.procurement.social_value.body':
    'La evaluación incluye un diez por ciento por valor social. Todos los licitadores han prometido contratos de formación. Ninguna promesa es vinculante contractualmente, y ninguno de los tres últimos ganadores cumplió las suyas.',
  'evt.procurement.social_value.choice.make_binding': 'Incorporar las promesas al contrato',
  'evt.procurement.social_value.choice.make_binding.out.0':
    'Los compromisos se convierten en entregables con penalizaciones asociadas. Dos licitadores reducen sus ofertas a algo que de verdad pueden cumplir, que es la primera puntuación honesta de valor social que se ha visto aquí.',
  'evt.procurement.social_value.choice.score_as_is': 'Puntuarlas tal como se presentaron',
  'evt.procurement.social_value.choice.score_as_is.out.0':
    'Un diez por ciento de un contrato importante decidido por promesas que nadie va a comprobar. Es lo que dice el marco que hay que hacer.',
  'evt.procurement.social_value.choice.drop': 'Retirar el criterio por no ser medible',
  'evt.procurement.social_value.choice.drop.out.0':
    'Defendible y algo cobarde. La evaluación se vuelve honesta al volverse más estrecha, y los contratos de formación que nunca iban a ocurrir dejan de fingirse.',

  'evt.procurement.framework_expiry.title': 'El acuerdo marco vence en seis semanas',
  'evt.procurement.framework_expiry.body':
    'Once servicios se compran a través de él. Sustituirlo correctamente lleva cinco meses. Las opciones son una prórroga ilegal, una adjudicación directa de emergencia, u once servicios que se paran.',
  'evt.procurement.framework_expiry.choice.emergency': 'Adjudicaciones de emergencia, documentadas, con fecha límite',
  'evt.procurement.framework_expiry.choice.emergency.out.0':
    'Seis meses de adjudicaciones directas correctamente justificadas mientras corre la sustitución. Es el uso honesto de la excepción, es caro, y cada paso está en el expediente.',
  'evt.procurement.framework_expiry.choice.extend': 'Prorrogar el acuerdo marco',
  'evt.procurement.framework_expiry.choice.extend.out.0':
    'Una modificación que nadie cuestionará, que no es lo mismo que legal. Once servicios continúan y ahora hay un documento con tu nombre que no sobreviviría a una impugnación.',
  'evt.procurement.framework_expiry.choice.blame_upward': 'Reportar que el departamento no lo planificó',
  'evt.procurement.framework_expiry.choice.blame_upward.out.0':
    'Cierto: se sabía hace dieciocho meses y nadie actuó. Lo pones por escrito junto a las opciones, lo cual convierte la emergencia en una decisión y no en un accidente.',

  'evt.procurement.debrief.title': 'El licitador que perdió quiere saber por qué',
  'evt.procurement.debrief.body':
    'Una pequeña empresa ha pedido una devolución de motivos. Quedaron cuartos de cuatro y su oferta era genuinamente mala. Una explicación completa y franca les sería útil y les daría todo lo necesario para impugnar.',
  'evt.procurement.debrief.choice.full': 'Darles una devolución de motivos real',
  'evt.procurement.debrief.choice.full.out.0':
    'Una hora, concreta y a veces directa. Vuelven a licitar en dieciocho meses, mucho mejor, y ganan. Cuentan que merece la pena presentarse a esta administración.',
  'evt.procurement.debrief.choice.minimum': 'El mínimo legal',
  'evt.procurement.debrief.choice.minimum.out.0':
    'Puntuaciones, razones generales, nada accionable. Del todo conforme, y no vuelven a licitar, ni tampoco las dos empresas con las que hablan. Una de ellas acude al defensor del pueblo en su lugar.',

  /* -------------------------------------------------------------- policy */
  'evt.policy.commissioned_research.title': 'La investigación que encargaste te contradice',
  'evt.policy.commissioned_research.body':
    'El instituto al que financiaste para examinar la cuestión ha respondido, con detalle, en sentido contrario a la posición establecida del departamento. Su metodología es sólida.',
  'evt.policy.commissioned_research.choice.publish_engage': 'Publicarla y responder al hallazgo',
  'evt.policy.commissioned_research.choice.publish_engage.out.0':
    'La publicas junto a una respuesta que expone qué acepta el departamento y qué discute, con razones. Es un modelo de cómo debería hacerse y es genuinamente incómodo.',
  'evt.policy.commissioned_research.choice.methodology': 'Encargar una crítica de la metodología',
  'evt.policy.commissioned_research.choice.methodology.out.0':
    'Un segundo instituto encuentra tres debilidades discutibles. Existen los dos informes, ninguno prevalece, y la cuestión pasa de resuelta a controvertida.',
  'evt.policy.commissioned_research.choice.change_position': 'Cambiar la posición del departamento',
  'evt.policy.commissioned_research.choice.change_position.out.0':
    'Te tomas el hallazgo lo bastante en serio como para moverte, y llevas al departamento contigo a lo largo de ocho meses. Es lo más trascendente que haces nunca.',
  'evt.policy.commissioned_research.choice.change_position.out.1':
    'Propones el cambio y te desautorizan quienes ya consideran la posición establecida un compromiso. La investigación se publica y la posición no se mueve.',

  'evt.policy.select_committee_request.title': 'La comisión quiere las alegaciones',
  'evt.policy.select_committee_request.body':
    'Una comisión ha pedido todas las alegaciones recibidas durante una consulta, incluidas cuatro de empresas que escribieron con el entendimiento expreso de que sus respuestas eran confidenciales.',
  'evt.policy.select_committee_request.choice.provide_all': 'Entregarlo todo',
  'evt.policy.select_committee_request.choice.provide_all.out.0':
    'La comisión tiene la potestad y cumples íntegramente. Cuatro empresas nunca más volverán a escribir con franqueza a este departamento, y la próxima consulta queda notablemente más vacía.',
  'evt.policy.select_committee_request.choice.negotiate': 'Entregarlas, tras avisar antes a las cuatro',
  'evt.policy.select_committee_request.choice.negotiate.out.0':
    'Avisas a cada una, explicas que no tienes elección, y les das una semana. Dos retiran y vuelven a presentar en una forma con la que pueden vivir. Cuesta una semana y conserva la relación.',
  'evt.policy.select_committee_request.choice.redact': 'Entregarlas con partes tachadas',
  'evt.policy.select_committee_request.choice.redact.out.0':
    'Las tachaduras se cuestionan en dos semanas y se revocan en su mayoría. Has retrasado la divulgación y añadido una noticia sobre un departamento que oculta cosas.',

  'evt.policy.two_ministers.title': 'Dos responsables políticos, una sola política',
  'evt.policy.two_ministers.body':
    'Dos partes del gobierno quieren cosas opuestas de la misma medida, y cada una cree que el departamento trabaja para su versión. Un único documento tiene que ir a las dos.',
  'evt.policy.two_ministers.choice.name_it': 'Poner el desacuerdo por escrito y planteárselo a ambos',
  'evt.policy.two_ministers.choice.name_it.out.0':
    'Una página que expone las dos posturas y qué depende de la diferencia. Fuerza una decisión que se ha evitado durante cuatro meses, y los dos gabinetes se enfadan brevemente contigo.',
  'evt.policy.two_ministers.choice.ambiguous': 'Redactarlo para que cada uno lo lea a su manera',
  'evt.policy.two_ministers.choice.ambiguous.out.0':
    'Un ejercicio genuinamente hábil de redacción que no resuelve nada. Se aprueba en dos semanas y la contradicción sale a la luz en la implementación, donde cuesta diez veces más.',
  'evt.policy.two_ministers.choice.pick_a_side': 'Redactarlo para el que tiene más autoridad',
  'evt.policy.two_ministers.choice.pick_a_side.out.0':
    'Respaldas al gabinete más fuerte, que es como suelen resolverse estas cosas, y el otro lo recuerda. Se zanja rápido y una relación queda gastada.',

  'evt.policy.lived_experience.title': 'Las personas a quienes se aplica',
  'evt.policy.lived_experience.body':
    'La consulta ha producido mil cien respuestas de organizaciones y casi ninguna de las personas a las que realmente afecta la política, que no están organizadas y no leen documentos de consulta.',
  'evt.policy.lived_experience.choice.go_out': 'Ir a hablar con ellas',
  'evt.policy.lived_experience.choice.go_out.out.0':
    'Cuatro semanas, seis localidades, y unas noventa conversaciones. Dos supuestos centrales de la política resultan erróneos de maneras que ninguna organización había mencionado.',
  'evt.policy.lived_experience.choice.proxy': 'Confiar en las organizaciones que las representan',
  'evt.policy.lived_experience.choice.proxy.out.0':
    'Están bien informadas, son profesionales, y representan a los socios que tienen. La política se diseña en torno a la gente lo bastante organizada para estar representada.',
  'evt.policy.lived_experience.choice.commission': 'Encargar una investigación sobre sus opiniones',
  'evt.policy.lived_experience.choice.commission.out.0':
    'Once meses y treinta mil euros para producir un informe que llega después de la decisión. Es excelente e informa la revisión dentro de cuatro años.',

  'evt.policy.announcement_reversal.title': 'Quieren desanunciarlo',
  'evt.policy.announcement_reversal.body':
    'Una medida anunciada hace ocho semanas se va a retirar. Te piden que redactes la comunicación, y que lo hagas de manera que no se lea como una marcha atrás.',
  'evt.policy.announcement_reversal.choice.plain': 'Decir que se ha retirado, y por qué',
  'evt.policy.announcement_reversal.choice.plain.out.0':
    'Cuatro frases: qué se anunció, qué cambió, qué pasa ahora. Se reporta como un giro de ciento ochenta grados durante dos días y después como un departamento que dice lo que hace.',
  'evt.policy.announcement_reversal.choice.evolved': '"El enfoque ha evolucionado"',
  'evt.policy.announcement_reversal.choice.evolved.out.0':
    'Una obra maestra del género. Nadie se engaña, varios periodistas la citan como ejemplo, y la frase se le queda pegada al departamento durante un año.',
  'evt.policy.announcement_reversal.choice.bury': 'Publicarlo la tarde de algo más grande',
  'evt.policy.announcement_reversal.choice.bury.out.0':
    'Sale, técnicamente, un día en que nadie mira. Dos años después alguien reúne una lista de cosas publicadas en tardes así, y esta está en ella.',

  'evt.policy.long_grass.title': 'Una revisión ayudaría',
  'evt.policy.long_grass.body':
    'Ha llegado una pregunta políticamente incómoda. La respuesta sugerida es una revisión, que reportará dentro de dieciocho meses, momento en el que la cuestión será de otra persona.',
  'evt.policy.long_grass.choice.real_review': 'Montar una revisión que de verdad la decida',
  'evt.policy.long_grass.choice.real_review.out.0':
    'Seis meses, un presidente con nombre y una reputación que proteger, y unos términos de referencia que exigen una recomendación. Reporta a tiempo y la recomendación se aplica.',
  'evt.policy.long_grass.choice.long_grass': 'Que sean dieciocho meses',
  'evt.policy.long_grass.choice.long_grass.out.0':
    'Redactas los términos de referencia de modo que reportar en dieciocho meses sea inevitable. Es un trabajo profesional al servicio de que no pase nada.',
  'evt.policy.long_grass.choice.answer_now': 'Informar de que la pregunta se puede responder ya',
  'evt.policy.long_grass.choice.answer_now.out.0':
    'Expones la respuesta, las pruebas que la sostienen, y el hecho de que una revisión no establecería nada nuevo. Se rechaza, y la nota está en el expediente cuando la revisión reporta exactamente eso dieciocho meses después.',
};
