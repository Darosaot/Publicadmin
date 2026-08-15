export const strings: Record<string, string> = {
  'evt.followup.ombudsman.title': 'El defensor del pueblo ha aceptado el caso',
  'evt.followup.ombudsman.body':
    'La queja que cerraste se ha elevado, y admitido a trámite. La oficina del defensor escribe con la cortesía particular de una institución que no necesita tu colaboración para llegar a una conclusión.',
  'evt.followup.ombudsman.choice.concede_early': 'Reconocer el punto ahora y remediarlo',
  'evt.followup.ombudsman.choice.concede_early.out.0':
    'Aplicas el remedio antes de que se redacte la resolución. El informe deja constancia de que la administración se corrigió sola en cuanto se examinó el asunto como es debido, que es la mejor frase disponible en esta fase.',
  'evt.followup.ombudsman.choice.defend': 'Defender la decisión original',
  'evt.followup.ombudsman.choice.defend.out.0':
    'La decisión se sostiene. No se aprecia mala administración y el expediente se cierra con una nota de que se siguió el procedimiento. Ha costado cuatro meses de correspondencia demostrarlo.',
  'evt.followup.ombudsman.choice.defend.out.1':
    'Se aprecia mala administración, se recomienda un remedio, y el informe se publica nombrando a la administración. El párrafo que se cita es el de la respuesta inicial a la queja.',
  'evt.followup.ombudsman.choice.systemic': 'Tratarlo como una cuestión sistémica, no un caso aislado',
  'evt.followup.ombudsman.choice.systemic.out.0':
    'Sales a buscar los demás casos gestionados igual. Hay diecinueve. Pones los diecinueve delante del defensor del pueblo antes de que te lo pidan, y la resolución se convierte en una recomendación que adopta toda la administración.',

  'evt.followup.court_ruling.title': 'El tribunal ha resuelto',
  'evt.followup.court_ruling.body':
    'Dieciocho meses después de darse el dictamen, el punto está decidido. La sentencia tiene cuarenta páginas y el fundamento 61 describe el razonamiento jurídico de la administración en términos que citarán otros tribunales.',
  'evt.followup.court_ruling.choice.circulate': 'Difundirlo internamente con lo que significa para nosotros',
  'evt.followup.court_ruling.choice.circulate.out.0':
    'Escribes cuatro páginas: qué decidió el tribunal, qué prácticas del departamento son ahora ilegales, y qué debe cambiar y para cuándo. No gusta, y se usa como documento de trabajo durante dos años.',
  'evt.followup.court_ruling.choice.narrow_reading': 'Informar de que se limita a sus propios hechos',
  'evt.followup.court_ruling.choice.narrow_reading.out.0':
    'Puede sostenerse que se limita a sus propios hechos, y la administración sigue sin cambios durante tres años sin que nadie la contradiga.',
  'evt.followup.court_ruling.choice.narrow_reading.out.1':
    'No se limita a sus propios hechos. Un segundo demandante lo demuestra en menos de un año, a mayor coste, y tu nota recomendando la lectura restrictiva se divulga en ese procedimiento.',
  'evt.followup.court_ruling.choice.appeal': 'Recomendar recurrir',
  'evt.followup.court_ruling.choice.appeal.out.0':
    'Otros dos años y una gran cantidad de dinero para poner a prueba algo que el departamento ya ha perdido una vez. Se deniega por razones de costas y la denegación es el momento en que la práctica cambia de verdad.',

  'evt.followup.funder_suspension.title': 'Se suspenden los pagos',
  'evt.followup.funder_suspension.body':
    'La autoridad gestora ha suspendido todos los pagos al programa a la espera de examinar el proceso de certificación. La administración soporta seis meses de costes que no puede reclamar, y la carta nombra a tu departamento.',
  'evt.followup.funder_suspension.choice.action_plan': 'Presentar un plan de corrección en el plazo de un mes',
  'evt.followup.funder_suspension.choice.action_plan.out.0':
    'Sesenta páginas en tres semanas: qué falló, qué ha cambiado, y qué se ha vuelto a comprobar. La suspensión se levanta en verano con una corrección parcial, y el plan se difunde a otros organismos como ejemplo.',
  'evt.followup.funder_suspension.choice.action_plan.out.1':
    'El plan se acepta en principio y la suspensión se mantiene otros dos trimestres mientras se amplía la muestra. La administración pide un anticipo para cubrir el desfase.',
  'evt.followup.funder_suspension.choice.contest': 'Impugnar la suspensión por desproporcionada',
  'evt.followup.funder_suspension.choice.contest.out.0':
    'Una carta bien argumentada sobre proporcionalidad, que se responde cuatro meses después, en sentido negativo, por gente que se dedica a suspender pagos. El retraso cuesta más de lo que habría costado la corrección.',
  'evt.followup.funder_suspension.choice.withdraw_claims': 'Retirar los gastos afectados y volver a certificar desde cero',
  'evt.followup.funder_suspension.choice.withdraw_claims.out.0':
    'Devuelves el gasto dudoso antes de que nadie lo exija y reconstruyes la pista de certificación en cinco meses. La administración pierde una suma considerable y conserva el programa.',

  'evt.followup.recovery_order.title': 'Una corrección financiera',
  'evt.followup.recovery_order.body':
    'La cifra figura en el segundo párrafo y tiene muchos ceros. Es una corrección a tanto alzado aplicada a todo el programa, porque el fallo se consideró sistémico y no aislado.',
  'evt.followup.recovery_order.choice.accept_and_reform': 'Aceptarla y reconstruir el sistema de control',
  'evt.followup.recovery_order.choice.accept_and_reform.out.0':
    'Pagas, y luego te pasas un año con los controles que deberían haber existido. El siguiente periodo del programa pasa la auditoría con dos observaciones, y alguien en la sala recuerda quién lo hizo.',
  'evt.followup.recovery_order.choice.negotiate_rate': 'Negociar a la baja el tipo a tanto alzado',
  'evt.followup.recovery_order.choice.negotiate_rate.out.0':
    'Demuestras, expediente por expediente, que el fallo se limitaba a una sola medida. El tipo baja del diez por ciento al dos, lo cual son cuatro meses de trabajo y una cantidad enorme de dinero.',
  'evt.followup.recovery_order.choice.negotiate_rate.out.1':
    'La muestra que amplían para demostrar tu argumento demuestra lo contrario. El tipo sube.',
  'evt.followup.recovery_order.choice.push_it_down': 'Recuperarlo de los beneficiarios',
  'evt.followup.recovery_order.choice.push_it_down.out.0':
    'La corrección se traslada a cuarenta entidades que siguieron las instrucciones que les diste. Es legal, es lo que contemplan las normas, y once de ellas no lo sobrevivirán.',

  'evt.followup.contractor_claim.title': 'La reclamación',
  'evt.followup.contractor_claim.body':
    'El contratista ha presentado una reclamación de indemnización con nueve conceptos y una cifra de aproximadamente un tercio del valor original del contrato. La mayor parte es oportunista. Dos conceptos son completamente justificados, y ambos derivan de decisiones tomadas en este departamento.',
  'evt.followup.contractor_claim.choice.split': 'Reconocer los dos buenos, resistir el resto',
  'evt.followup.contractor_claim.choice.split.out.0':
    'Se acuerda en once semanas por una quinta parte de la reclamación, con los conceptos justificados pagados en su totalidad y el resto abandonado. Es la negociación más limpia que haces ese año.',
  'evt.followup.contractor_claim.choice.split.out.1':
    'No aceptan dividirlo, y todo va a arbitraje. El laudo se acerca a lo que ofreciste y llega catorce meses después, habiendo costado en honorarios casi toda la diferencia.',
  'evt.followup.contractor_claim.choice.reject_all': 'Rechazar la reclamación en su totalidad',
  'evt.followup.contractor_claim.choice.reject_all.out.0':
    'Una carta contundente que no reconoce los dos conceptos justificados. Es la postura que adopta la administración por defecto, y convierte una negociación en un litigio que acaba perdiendo por esos dos conceptos.',
  'evt.followup.contractor_claim.choice.pay_to_close': 'Liquidar toda la reclamación rápidamente',
  'evt.followup.contractor_claim.choice.pay_to_close.out.0':
    'Se paga en seis semanas con una cláusula de confidencialidad, porque la alternativa son dos años de que el director de hacienda pregunte por ello. El contratista le cuenta al resto del mercado lo que ha pasado aquí.',

  'evt.followup.team_exodus.title': 'Tres dimisiones en cinco semanas',
  'evt.followup.team_exodus.body':
    'La primera fue una sorpresa. La tercera no. Entre las tres se llevan once años de saber cómo funciona de verdad esta administración, y las entrevistas de salida las está haciendo recursos humanos con una plantilla.',
  'evt.followup.team_exodus.choice.own_it': 'Hacer tú mismo las conversaciones de salida y reportar lo que digan',
  'evt.followup.team_exodus.choice.own_it.out.0':
    'Preguntas, en serio, y te lo dicen: dos de las tres se van por decisiones que tomaste tú. Lo escribes, sin editar, y pones tu nombre en ello. Es el documento más útil que lee la dirección general ese año y trata sobre ti.',
  'evt.followup.team_exodus.choice.own_it.out.1':
    'Se van sobre todo por dinero y un trayecto más corto, y una de ellas por razones que no te va a dar. El informe es honesto y menos dramático que la versión de pasillo.',
  'evt.followup.team_exodus.choice.backfill': 'No decir nada y cubrir los puestos deprisa',
  'evt.followup.team_exodus.choice.backfill.out.0':
    'Tres procesos de selección en ocho semanas y la plantilla está completa otra vez en otoño. Nadie pregunta por qué se fueron, así que la razón sigue en la sala con la gente nueva.',
  'evt.followup.team_exodus.choice.ask_the_rest': 'Preguntar a quienes se quedaron qué les haría quedarse',
  'evt.followup.team_exodus.choice.ask_the_rest.out.0':
    'Ocho conversaciones, una hora cada una, y una lista de nueve cosas. Cuatro están en tu mano y las haces las cuatro en un mes. No deshace las tres bajas, y frena la cuarta.',

  'evt.followup.whistleblower.title': 'Alguien acudió fuera',
  'evt.followup.whistleblower.body':
    'Se ha presentado una denuncia protegida ante la autoridad externa. Se refiere a una decisión tuya, es precisa, y la hizo alguien que se sentaba a veinte metros de ti y no acudió a ti primero.',
  'evt.followup.whistleblower.choice.cooperate': 'Cooperar plenamente y proteger a quien denunció',
  'evt.followup.whistleblower.choice.cooperate.out.0':
    'Le das a la autoridad todo, y dejas claro dentro del edificio, sin lugar a dudas, que quien busque a quien hizo la denuncia responderá ante ti. La resolución te es desfavorable y el modo en que lo gestionaste no.',
  'evt.followup.whistleblower.choice.cooperate.out.1':
    'Cooperas plenamente, y el examen concluye que la decisión estaba dentro de tu competencia y mal registrada. Quien denunció se queda, y algo entre vosotros no se recupera.',
  'evt.followup.whistleblower.choice.find_them': 'Averiguar quién fue',
  'evt.followup.whistleblower.choice.find_them.out.0':
    'Te lleva cuatro días y dos conversaciones. No haces nada con ello, cosa que te dices a ti mismo que es lo mismo que no haberlo averiguado. Toda la unidad sabe que buscaste.',
  'evt.followup.whistleblower.choice.lawyer_up': 'Responder solo a través de los abogados de la administración',
  'evt.followup.whistleblower.choice.lawyer_up.out.0':
    'Correcto, cauto, y convierte una denuncia en un litigio. La autoridad tarda once meses en vez de tres y el departamento se pasa el año siendo representado en vez de explicarse.',

  'evt.followup.power_returns.title': 'La potestad se está usando para otra cosa',
  'evt.followup.power_returns.body':
    'El instrumento redactado con prisas durante la emergencia se está invocando para un fin que nadie en aquella sala contempló. Por su literalidad, admite perfectamente ese significado. Lo sabes porque tú dejaste pasar esas palabras.',
  'evt.followup.power_returns.choice.say_so': 'Informar por escrito de que nunca se pensó para esto',
  'evt.followup.power_returns.choice.say_so.out.0':
    'Expones el historial de redacción, incluida tu propia parte en él. Se abandona ese uso, el instrumento se acota en la siguiente ocasión, y tu nota es la razón de que ocurran ambas cosas.',
  'evt.followup.power_returns.choice.the_words_are_the_words': 'Informar de que las palabras lo permiten',
  'evt.followup.power_returns.choice.the_words_are_the_words.out.0':
    'Y lo permiten. Es la respuesta jurídica correcta a la pregunta planteada, y no es la respuesta a la pregunta que importa, y eres la única persona que sabe distinguirlas.',
  'evt.followup.power_returns.choice.sunset_now': 'Proponer derogarla de inmediato',
  'evt.followup.power_returns.choice.sunset_now.out.0':
    'Consigues que se derogue en el plazo de un año argumentando que la emergencia terminó. Es un servicio público pequeño, invisible y completamente real.',
  'evt.followup.power_returns.choice.sunset_now.out.1':
    'Nadie deroga una potestad útil. La propuesta se anota, se agradece, y no avanza, y sigue en vigor cuando te jubilas.',

  'evt.followup.successor_letter.title': 'Un mensaje de alguien que hace tu antiguo trabajo',
  'evt.followup.successor_letter.body':
    'Un funcionario al que nunca has conocido ha revisado el archivo y ha encontrado la decisión. No te acusa de nada. Querría entender por qué se hizo así, porque tiene que volver a hacerlo y el expediente no lo dice.',
  'evt.followup.successor_letter.choice.tell_them': 'Contarle exactamente qué pasó, incluida la parte que estuvo mal',
  'evt.followup.successor_letter.choice.tell_them.out.0':
    'Escribes dos páginas que no habrías escrito en su momento: la presión, el razonamiento, lo que harías de otro modo. Las incorporan al expediente. Es el documento más útil que contiene.',
  'evt.followup.successor_letter.choice.official_version': 'Dar la versión que ya consta',
  'evt.followup.successor_letter.choice.official_version.out.0':
    'Precisa, completa, y no explica nada que no pudieran haber leído por sí mismos. Te lo agradecen con educación y toman la misma decisión por las mismas razones sin examinar.',
  'evt.followup.successor_letter.choice.no_time': 'No tienes tiempo para esto',
  'evt.followup.successor_letter.choice.no_time.out.0':
    'Es un correo educado de un desconocido sobre algo de hace años y hay cuarenta de hoy en la bandeja de entrada. No respondes, y la memoria institucional de esa decisión termina ahí.',
};
