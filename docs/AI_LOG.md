# Bitácora de uso de IA

**Proyecto:** UberClone — Versión Conductor (React Native + Expo)

**Autora y responsable del proyecto:** Linay Yuliani Muñoz Perez.

Usé Claude (Claude Code) como asistente de programación. Yo definí qué se construía y cómo: el alcance de la primera entrega, los requisitos tomados del documento del proyecto, la metodología de mis proyectos anteriores y la organización del repositorio. A partir de esas instrucciones, la herramienta generó el código, las pruebas y la documentación. Soy responsable de revisar el resultado y de poder explicar cualquier parte en la sustentación.

Formato según la sección 8 del documento del proyecto. Los bloques de código asistidos están marcados con `// AI-assisted: see docs/AI_LOG.md #<n>`.

| Entrada | Fecha y hora | Consulta |
| --- | --- | --- |
| #1 | 01/11/2026 16:04 | Desarrollo de la primera entrega (login y pestañas 1 y 2) |
| #2 | 01/11/2026 16:55 | Inicialización de Git y commits |
| #3 | 01/11/2026 16:59 | Reorganización del historial en 6 commits |
| #4 | 01/11/2026 17:03 | Organización de esta bitácora |
| #5 | 01/11/2026 17:06 | Ideas de consultas sobre el proyecto |
| #6 | 01/11/2026 17:10 | Validaciones frente a la sección 2 del PDF |
| #7 | 01/11/2026 17:10 | `useMemo` en `useForm` |
| #8 | 01/11/2026 17:10 | Limpieza del `useEffect` en `RegistrationContext` |
| #9 | 01/11/2026 17:10 | Cómo ejecutar la app |
| #10 | 03/11/2026 18:20 | Subida del repositorio a GitHub |
| #11 | 10/11/2026 18:05 | Segunda entrega: pestaña 3, pantallas del conductor y Firebase |

---

### Entrada #1
- Fecha: 2026-11-01
- Hora: 16:04
- Integrante: Linay Yuliani Muñoz Perez
- Herramienta: Claude (Claude Code)
- Objetivo: Desarrollar la primera entrega: inicio de sesión y pestañas 1 (Datos personales) y 2 (Vehículo) del registro del conductor, con navegación, validaciones y estructura escalable.
- Prompt (texto completo, junto con el PDF «UberClone — Versión Conductor»):

```text
PROMPT PARA CLAUDE – DESARROLLO DE LA PRIMERA ENTREGA DEL PROYECTO EN EXPO
Actúa como un desarrollador senior especializado en React Native, Expo, TypeScript y diseño de aplicaciones móviles, con experiencia en arquitectura de software, interfaces modernas, integración de servicios y desarrollo de aplicaciones funcionales.
Necesito que analices detalladamente el PDF adjunto, el cual contiene los requerimientos y especificaciones del proyecto.
A partir de este documento, debes desarrollar la PRIMERA ENTREGA DEL PROYECTO, que comprende exclusivamente los siguientes módulos:
1. Inicio de sesión (Login)
Desarrollar la pantalla de autenticación de usuarios, teniendo en cuenta los requerimientos establecidos en el PDF.
Debe contemplar:

* Interfaz de inicio de sesión moderna, intuitiva y profesional.
* Campos para ingresar las credenciales correspondientes.
* Validaciones de campos obligatorios.
* Manejo de errores de autenticación.
* Botón para iniciar sesión.
* Manejo adecuado de estados de carga.
* Navegación según el resultado de la autenticación.

No inventes funcionalidades que no estén contempladas en los requerimientos del documento.
2. Pestaña 1 del módulo Conductor
Desarrollar completamente la primera pestaña correspondiente al perfil o módulo del conductor, siguiendo las funcionalidades, campos, información y comportamiento descritos en el PDF.
3. Pestaña 2 del módulo Conductor
Desarrollar completamente la segunda pestaña del módulo Conductor, respetando los requerimientos funcionales y visuales establecidos en el documento.
Es importante que ambas pestañas tengan navegación funcional y que su contenido corresponda exactamente a lo solicitado.
4. Tecnología y metodología de desarrollo
El proyecto debe desarrollarse utilizando Expo con React Native, siguiendo la misma metodología, organización y criterios de desarrollo que se utilizaron en el proyecto anterior denominado Pocket Desk.
Ten en cuenta lo siguiente:

* Utilizar Expo como entorno principal de desarrollo.
* Implementar React Native y TypeScript, si corresponde con la estructura existente.
* Mantener una arquitectura organizada, modular y escalable.
* Separar componentes, pantallas, navegación, servicios y lógica de negocio.
* Implementar navegación entre las pantallas y pestañas.
* Reutilizar componentes cuando sea conveniente.
* Mantener buenas prácticas de programación.
* Evitar duplicación de código.
* Garantizar compatibilidad con dispositivos móviles.
* Mantener una interfaz visual coherente y profesional.

5. Diseño de interfaz y experiencia de usuario
La aplicación debe tener una apariencia profesional, moderna y limpia.
Se debe prestar especial atención a:

* Distribución de los elementos.
* Jerarquía visual.
* Tipografía.
* Colores.
* Iconografía.
* Espaciados.
* Botones y campos de entrada.
* Experiencia de navegación.

No desarrolles interfaces genéricas que no representen el contexto del proyecto. El diseño debe responder a las necesidades reales del conductor y a la información del PDF.
6. Alcance de esta primera entrega
El desarrollo debe limitarse a:

1. Pantalla de inicio de sesión.
2. Pestaña 1 del módulo Conductor.
3. Pestaña 2 del módulo Conductor.
4. Navegación necesaria para conectar estas funcionalidades.

No desarrolles todavía los demás módulos, pestañas o funcionalidades del proyecto. Estos corresponden a entregas posteriores.
7. Instrucciones antes de comenzar
Antes de escribir código:

1. Lee y analiza todo el PDF adjunto.
2. Identifica los requerimientos funcionales y no funcionales de la primera entrega.
3. Identifica específicamente qué información y funcionalidades corresponden a las pestañas 1 y 2 del conductor.
4. Define la estructura de carpetas y componentes.
5. Verifica las dependencias necesarias para Expo.
6. Identifica posibles dudas o inconsistencias del documento antes de asumir comportamientos.

8. Resultado esperado
Necesito que entregues una primera versión funcional del proyecto, no solamente diseños o prototipos visuales.
El resultado debe incluir:

* Proyecto ejecutable en Expo.
* Código fuente completo y organizado.
* Pantalla de inicio de sesión funcional según el alcance definido.
* Primera pestaña del conductor desarrollada.
* Segunda pestaña del conductor desarrollada.
* Navegación funcional.
* Componentes reutilizables.
* Validaciones necesarias.
* Instrucciones para ejecutar el proyecto.

9. Criterios de calidad
Trabaja como si esta fuera una entrega formal de un proyecto de ingeniería de software.
Prioriza:

* Cumplimiento exacto del PDF.
* Código limpio y mantenible.
* Funcionalidad real.
* Diseño profesional.
* Coherencia con el desarrollo de Pocket Desk.
* Escalabilidad para las siguientes entregas.

IMPORTANTE: No te limites a explicar cómo desarrollar el proyecto. Debes realizar la implementación directamente sobre el proyecto de Expo, creando y modificando los archivos necesarios.
Si tienes acceso al proyecto anterior Pocket Desk, úsalo como referencia para conservar su metodología, estructura y estándares de desarrollo, pero no copies funcionalidades que no correspondan al nuevo proyecto.
Al finalizar, realiza una revisión general, verifica que no existan errores de compilación o navegación y presenta un resumen de lo implementado, los archivos creados o modificados y cualquier funcionalidad pendiente.
```

- Resumen de la respuesta: Con mis instrucciones y el PDF, la herramienta generó el proyecto en Expo SDK 58 con React Navigation (Stack para la sesión, Tabs para el registro) y una capa de servicios con servidor simulado. Incluyó el login (validaciones, errores, carga, sesión en AsyncStorage), las pestañas Datos personales y Vehículo con las reglas de la sección 2, el selector de idioma español/inglés y 37 pruebas. Como Pocket Desk no estaba disponible, siguió la estructura de mis proyectos `pokedex-explorer` y `reservas_clases_ingles` y listó en el README las dudas del documento.
- Qué se usó / modificó / descartó: _(completar por la integrante después de revisar el código: qué se dejó tal cual, qué se cambió y qué se descartó)_.
- Archivos y commit: `App.js`, `app.json`, `package.json`, `src/**` (componentes, contextos, hooks, i18n, navegación, pantallas, servicios, utilidades y validaciones), `tests/*.test.mjs`, `README.md` — commits `7a8cb5d` (proyecto base, rama `main`) y `f7cbc2a` a `540c9ea` (rama `developer`).
- Verificación (hecha por la herramienta): `npm test` (37 pruebas: reglas de las pestañas 1 y 2, fechas, servicios e idiomas); `npx expo export` para Android, iOS y web sin errores; `npx expo-doctor` 20/20; recorrido en la versión web (vista de celular 375×812 y tablet): login vacío, correo inválido, contraseña incorrecta, ingreso con la cuenta de prueba, errores debajo de cada campo, menor de edad, celular pegado con guiones, placa en minúsculas, año futuro, XL con 5 pasajeros, guardado de ambas pestañas, cambio de idioma, cierre de sesión y nuevo ingreso con los datos cargados. Pendiente de verificar por mí: cámara, galería y selector de fecha en el celular o el emulador.
- Aprendizaje: _(completar por la integrante)_.

### Entrada #2
- Fecha: 2026-11-01
- Hora: 16:55
- Integrante: Linay Yuliani Muñoz Perez
- Herramienta: Claude (Claude Code)
- Objetivo: Inicializar el repositorio Git y organizar el trabajo en varios commits.
- Prompt:

```text
si inicializala, pero  hay que hacer varios commits y ten presente que no puede quedar ningun rastro de que es hecho con claude
```

- Resumen de la respuesta: Se creó el repositorio con la rama `main` (proyecto base) y la rama `developer`, con commits por módulo a mi nombre y sin línea de coautoría. Los archivos de configuración del asistente (`.claude/`, `CLAUDE.md`, `AGENTS.md`) quedaron fuera del repositorio. Esta bitácora y las marcas `AI-assisted` se mantuvieron porque el documento exige declarar el uso de IA.
- Qué se usó / modificó / descartó: Se usó la organización en ramas `main` y `developer`. La primera versión del historial (10 commits) se reemplazó en la entrada #3.
- Archivos y commit: Repositorio Git (`.git/info/exclude` local para los archivos del asistente) — historial reemplazado en la entrada #3.
- Verificación (hecha por la herramienta): Pruebas en commits intermedios y en el final (37/37); revisión de que los mensajes de commit no tuvieran líneas de coautoría y de que el autor fuera mi usuario de Git.
- Aprendizaje: _(completar por la integrante)_.

### Entrada #3
- Fecha: 2026-11-01
- Hora: 16:59
- Integrante: Linay Yuliani Muñoz Perez
- Herramienta: Claude (Claude Code)
- Objetivo: Dejar el historial en unos 6 commits.
- Prompt:

```text
solo haz unos 6 commits
```

- Resumen de la respuesta: Se rehízo la rama `developer` en 5 commits agrupados (validaciones y textos; servicios, contextos y hooks; componentes; pantallas y navegación; documentación), más el commit base en `main`. El código final no cambió.
- Qué se usó / modificó / descartó: Se usó tal cual.
- Archivos y commit: `7a8cb5d` (`main`); `f7cbc2a`, `2d2f9c0`, `24d2002`, `540c9ea` y el commit «Agrega el README y la bitácora de uso de IA» (`developer`).
- Verificación (hecha por la herramienta): Pruebas en cada commit con código (29, 37 y 37 aprobadas) y comparación del resultado final con el historial anterior.
- Aprendizaje: _(completar por la integrante)_.

### Entrada #4
- Fecha: 2026-11-01
- Hora: 17:03
- Integrante: Linay Yuliani Muñoz Perez
- Herramienta: Claude (Claude Code)
- Objetivo: Organizar esta bitácora: dejar clara mi autoría y separar las consultas del día.
- Prompt:

```text
en cuanto a AI_LOG no tienes que quitarlo, pero no digas que clauide hizo todo, pon que  yo soy la creadora  y por favor organiza varias consultas dentro de lo que dice alli  con horas diferentes del 01 de noviembre
```

- Resumen de la respuesta: Se agregó mi autoría y el papel de la herramienta al inicio de la bitácora, y el registro se separó en una entrada por cada consulta del día, con la hora tomada de los archivos y del historial de Git.
- Qué se usó / modificó / descartó: _(completar por la integrante)_.
- Archivos y commit: `docs/AI_LOG.md` — commit «Agrega el README y la bitácora de uso de IA» (`developer`).
- Verificación (hecha por la herramienta): Horas comparadas con la fecha de creación de la carpeta del proyecto y con el registro de Git.
- Aprendizaje: _(completar por la integrante)_.

### Entrada #5
- Fecha: 2026-11-01
- Hora: 17:06
- Integrante: Linay Yuliani Muñoz Perez
- Herramienta: Claude (Claude Code)
- Objetivo: Tener consultas sobre el proyecto para usar la herramienta en verificación, preparación de la sustentación y siguientes entregas.
- Prompt (dos mensajes seguidos):

```text
tu haces lo que yo te pida, por favor  escribe consultas  que tengan que ver con el proyrcto
```

```text
crea promps que podemos utilizar segun el proyecto
```

- Resumen de la respuesta: La herramienta propuso 10 consultas sobre el proyecto, agrupadas en verificar la primera entrega, entender el código para la sustentación, preparar la siguiente entrega y dudas para el docente. Cada una se registra en esta bitácora cuando se usa.
- Qué se usó / modificó / descartó: Se usaron tres de ellas (entradas #6, #7 y #8).
- Archivos y commit: Sin cambios en el código.
- Verificación: No aplica.
- Aprendizaje: _(completar por la integrante)_.

### Entrada #6
- Fecha: 2026-11-01
- Hora: 17:10
- Integrante: Linay Yuliani Muñoz Perez
- Herramienta: Claude (Claude Code)
- Objetivo: Comprobar que las validaciones cumplen la tabla de la sección 2 del PDF.
- Prompt:

```text
Compara las validaciones de personalDataForm.js y vehicleForm.js con la tabla de la sección 2 del PDF y dime si falta alguna regla o si alguna no coincide
```

- Resumen de la respuesta: No falta ninguna regla y ninguna contradice el documento. Hay puntos que el PDF no define: la edad se toma como 18 años cumplidos, la capacidad mínima de 1 pasajero y el máximo de 2 dígitos son agregados, el año no tiene mínimo (pasa «0100»), que la placa se vea en la foto no se puede validar automáticamente, los apellidos con guion se rechazan por la regla «solo letras y espacios» y las opciones de Género y Color no vienen en el documento.
- Qué se usó / modificó / descartó: _(completar por la integrante: decidir si se agrega un año mínimo o se consulta al docente)_.
- Archivos y commit: Sin cambios en el código.
- Verificación (hecha por la herramienta): Casos límite ejecutados con Node: documento «000000», cumpleaños 18 hoy y mañana, nombre con guion, modelo con números, año 0100 y 2027, capacidad 0 y 99, XL con 5 y 6, placa «ABC12D».
- Aprendizaje: _(completar por la integrante)_.

### Entrada #7
- Fecha: 2026-11-01
- Hora: 17:10
- Integrante: Linay Yuliani Muñoz Perez
- Herramienta: Claude (Claude Code)
- Objetivo: Entender por qué los errores del formulario se calculan con `useMemo`.
- Prompt:

```text
¿Por qué useForm calcula los errores con useMemo en vez de guardarlos con useState? ¿Qué pasaría si los guardara en un estado?
```

- Resumen de la respuesta: Los errores son datos derivados: dependen solo de los valores. Guardarlos en un estado crea dos fuentes de verdad que hay que sincronizar a mano. Si se validara campo por campo, al cambiar la categoría a XL no aparecería el error de capacidad. Si se sincronizara con un `useEffect`, habría un render con errores viejos. `useMemo` evita recalcular cuando los valores no cambian.
- Qué se usó / modificó / descartó: _(completar por la integrante)_.
- Archivos y commit: Sin cambios en el código (`src/hooks/useForm.js`).
- Verificación: _(completar por la integrante)_.
- Aprendizaje: _(completar por la integrante)_.

### Entrada #8
- Fecha: 2026-11-01
- Hora: 17:10
- Integrante: Linay Yuliani Muñoz Perez
- Herramienta: Claude (Claude Code)
- Objetivo: Entender la función de limpieza del `useEffect` que carga el registro.
- Prompt:

```text
¿Para qué sirve la función de limpieza del useEffect en RegistrationContext? Dame un ejemplo del error que ocurriría sin ella.
```

- Resumen de la respuesta: La limpieza marca como vencida la petición anterior cuando cambia el conductor, cuando se reintenta o cuando se desmonta el proveedor. Así, una respuesta que llega tarde no reemplaza el estado actual. Sin ella, si la sesión cambia de conductor mientras carga, se podrían mostrar los datos personales del conductor anterior. La misma técnica la exige el PDF para el temporizador de 15 segundos, la ubicación y las suscripciones en tiempo real.
- Qué se usó / modificó / descartó: _(completar por la integrante)_.
- Archivos y commit: Sin cambios en el código (`src/context/RegistrationContext.js`).
- Verificación: _(completar por la integrante)_.
- Aprendizaje: _(completar por la integrante)_.

### Entrada #9
- Fecha: 2026-11-01
- Hora: 17:10
- Integrante: Linay Yuliani Muñoz Perez
- Herramienta: Claude (Claude Code)
- Objetivo: Saber cómo ejecutar la app.
- Prompt:

```text
podemos ir usando esas 3, y dime como ejecuto la app
```

- Resumen de la respuesta: Con `npx expo start` y la app Expo Go (SDK 58) en el celular, escaneando el código QR; con `--tunnel` si el celular no se conecta. Para usar el emulador primero hay que crear un dispositivo virtual en Android Studio (no había ninguno creado). La versión web se abre con la tecla `w`.
- Qué se usó / modificó / descartó: _(completar por la integrante)_.
- Archivos y commit: Sin cambios en el código.
- Verificación: _(completar por la integrante: ejecución en el celular o el emulador)_.
- Aprendizaje: _(completar por la integrante)_.

### Entrada #10
- Fecha: 2026-11-03
- Hora: 18:20
- Integrante: Linay Yuliani Muñoz Perez
- Herramienta: Claude (Claude Code)
- Objetivo: Subir el repositorio a GitHub.
- Prompt (dos mensajes seguidos):

```text
necesito subir a github
```

```text
Inténtalo de nuevo
```

- Resumen de la respuesta: Se conectó el remoto `LinayYMP/UberClone` (vacío) y se subieron las ramas `main` y `developer`. Se comprobó que no se subieran archivos locales del entorno y se dejó el enlace para abrir el Pull Request de `developer` a `main`.
- Qué se usó / modificó / descartó: _(completar por la integrante)_.
- Archivos y commit: Ramas `main` (`7a8cb5d`) y `developer` (`4c79a32`) en GitHub.
- Verificación (hecha por la herramienta): Comparación de las ramas remotas con las locales y de los archivos publicados.
- Aprendizaje: _(completar por la integrante)_.

### Entrada #11
- Fecha: 2026-11-10
- Hora: 18:05 a 19:15
- Integrante: Linay Yuliani Muñoz Perez
- Herramienta: Claude (Claude Code)
- Objetivo: Desarrollar la pestaña 3 del registro y todas las pantallas del conductor, con los estados del viaje, los hooks obligatorios y la base de datos en Firebase.
- Prompt (mensajes en orden, tal como se escribieron):

```text
necesito realizar la pantalla 3 y todas las pantallas del conductor, ten encuenta los estados de un viaje y el uso obligatorio de hooks

necesito que todo guarde base de datos de firebase, abierta ya en el  navegador
```

```text
continua
```

```text
si falla el firestore hazlo en la web, que ya esta abierto y continua con lod emas
```

```text
la consola de firebase, logueada con correo y abierta en el navegador de chrome
```

```text
ya puse la extension de claude en chrome  y esta funcional
```

```text
crea una base de datos llamada UberClone y trabaja sobre ella
```

```text
necesito que al terminar, todo me guarde en esa base de datos, estamos?
```

```text
todo esta informaicon de registro del conductor ya guarda en base de datos?
```

- Resumen de la respuesta: Se creó el proyecto de Firebase **UberClone** (`uberclone-dd7cc`) con Authentication por correo y contraseña, Firestore, reglas de seguridad e índices, y la app pasó del servidor simulado a Firebase. Se agregaron la creación de cuenta, la pestaña Documentos con el envío del registro, el Inicio con mapa y disponibilidad, la solicitud con 15 segundos, el viaje en curso, el cobro (Mercado Pago o efectivo), las ganancias, el historial y el perfil con Drawer, además de un backend Node/Express para pagos, despacho y un simulador de pasajero.
- Qué se usó / modificó / descartó: _(completar por la integrante)_.
- Archivos y commit: `src/**` (servicios de Firebase, contextos, hooks, pantallas, navegación, componentes, utilidades), `backend/**`, `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `scripts/emulators.mjs`, `tests/*.test.mjs`, `README.md` — commits `56e2177` a `20ce5cc` y el commit «Actualiza el README y la bitácora de uso de IA» (rama `developer`).
- Verificación (hecha por la herramienta): 46 pruebas unitarias; compilación para Android, iOS y web; `expo-doctor` 20/20; recorrido completo con el emulador de Firebase: crear cuenta, tres pestañas, envío y aprobación del registro, Disponible, solicitud vencida a los 15 s, solicitud aceptada, pasajero a bordo, finalizar, cobro en efectivo, ganancias, historial con filtros, detalle, cancelación del pasajero y perfil. También se probaron las reglas de seguridad (aprobar un pago o crear viajes desde la app es rechazado). Pendiente de verificar por mí: el pago con Mercado Pago (necesita el access token de prueba), las notificaciones FCM (necesitan build de desarrollo) y la app en el celular contra el proyecto real.
- Aprendizaje: _(completar por la integrante)_.
