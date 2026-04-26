# legocoleccion: una libreta, un paseo y la app que llevaban dos años queriendo

*Subtítulo sugerido: Cómo Claude Code hace que de pronto tenga sentido escribir software para una sola pareja*

---

Mis primos Julia y Víctor coleccionan LEGO. Bien.

No me refiero a "tienen un par de cajas". Me refiero al tipo de coleccionismo en el que cada caja tiene su propio destino. Unas se montan; otras no se abren nunca. Unas viven en exposición y rotan según la temporada. Sabes cuál estaba descatalogada cuando la compraste, cuál era una edición limitada que pillaste en Alemania, cuál se la regalasteis al sobrino y volvió hecha trizas. Hay un orden detrás. Lo que pasa es que vive en una libreta.

Buscan por todas partes. Una vez los acompañé a una tienda de Prosperidad —mi viejo barrio de Madrid— y encontramos algo que ninguno de los tres supo cómo clasificar. Lo apuntaron como pudieron y siguieron.

Este sábado paseando me lo vuelven a contar, y esta vez Víctor saca la libreta. Una libreta de verdad, de papel. Llevan dos años apuntando ahí cada set: código, nombre, si está la caja, si faltan piezas, cuánto costó, si está descatalogado. Cada copia una entrada. Cada entrada con su matiz.

Les pregunto por qué no lo meten en una app. Y empieza la lista. Las que hay están en inglés. Son para vender en BrickLink. Exigen darte de alta como si fueras un comerciante. Tratan a cada set como un objeto en un mercado, no como una pieza de tu colección. No te dejan poner una nota como la que ellos quieren —*"el de Prosperidad: no sabemos qué set es exactamente"*— porque eso no es un campo en su esquema. En general están pensadas para una relación con LEGO que ellos no tienen.

Ellos no quieren vender nada. Quieren saber qué tienen.

Les digo: dadme el sábado noche.

Se ríen.

## Lo que sale el domingo a las 10am

[CAPTURA: home con varias copias en grid, filtros visibles]

**legocoleccion.vercel.app**. Una web personal, en castellano, en estética oscura con cuatro colores tomados de la paleta de EsadeEcPol y un amarillo cálido que terminé eligiendo a hex porque el primero que probé "no era cálido". Tres páginas: la colección, el formulario de alta, una API de export.

La vista de colección lista cada copia física como una tarjeta —portada del set, badges solo cuando hay algo que destacar (faltan piezas, caja abierta, descatalogado), nombre y meta debajo. Filtros por tema, estado de caja, completitud, descatalogado, rango de año. Búsqueda por código o nombre dentro de la colección, debounced. Ordenable por año LEGO, por precio, por nombre. Toggle grid/lista. Click en cualquier tarjeta abre un drawer lateral con todos los campos editables.

[CAPTURA: drawer abierto con un set seleccionado]

El formulario de alta es lo que lleva la mayor parte del trabajo. Un solo campo combinado de búsqueda —código o nombre indistintamente—, autocomplete que aparece a los 250ms, sugerencias con la portada en miniatura. Eliges una y se autorrellenan los datos oficiales (nombre, tema, año, número de piezas). El resto lo metes tú: tres checkboxes con tinte rojo para los estados malos —caja abierta, faltan piezas, descatalogado—, precio, mes de compra (autorrellenado con el mes actual), notas. Un botón **"Guardar y añadir otra"** que vacía el form para que puedas meter veinte cosas seguidas sin levantar la mano del teclado.

[CAPTURA: alta con typeahead desplegado mostrando portadas]

## El catálogo: 26.533 sets que viven en un Postgres en Frankfurt

La parte que parecía complicada y resultó no serlo. Rebrickable, una base de datos comunitaria de LEGO, publica dumps semanales en CSV. Un script descarga `sets.csv.gz` y `themes.csv.gz`, los descomprime, resuelve la jerarquía de temas (porque "Star Wars / Episodio I" no viene como cadena sino como `theme_id` que apunta a un padre que apunta a otro), y hace upsert en lotes de 500. Tarda dos minutos largos. **Esos dos minutos los pasé cenando.**

El resultado: 26.533 sets oficiales en local, desde 1949 hasta esta semana. El typeahead consulta ese Postgres directamente —SQL local, sin red, instantáneo. Para los sets que no estén (los que LEGO ha lanzado entre el último dump y ahora), hay un fallback automático a la API REST de Rebrickable con caché de 1h. Para los MOCs, polybags raros y sets promocionales que ni siquiera Rebrickable tiene catalogados, hay un escape hatch: un panel "**Añadirlo a mano +**" que aparece cuando ambas búsquedas vuelven vacías. Tú metes código, nombre, tema, año, piezas. Se guarda como un set más. Listo.

## La conversación es la spec

Lo más interesante no es el código. Es lo que pasa entre cada deploy.

Empiezas con un concepto en un MD —campos del modelo, vistas propuestas, paleta— y lo iteras antes de escribir una línea. Decides que cada copia física es una fila (no "set + contador"), porque dos copias del mismo set pueden tener estados independientes. Decides Vercel + Neon en vez de SQLite local porque querían acceder desde el móvil. Decides cachear los dumps en local en vez de pegar a la API en cada keystroke. Cada decisión, una línea en el MD.

Luego construyes y empiezan los toques.

> *—La estética no me gusta nada. Es feísima. Vamos a fondo negro y rojo, amarillo, verde y azul encima. Coge la paleta de EsadeEcPol, que la tienes en skills.*

Recoges la paleta. Reescribes la hoja de estilos. Cambias todos los `bg-lego-yellow` chunky a tonal suave. Vuelves a desplegar.

> *—El amarillo no me gusta. Quiero #eba605. Y los colores en los badges son random. Caja abierta gris, caja cerrada azul. Pon todo lo malo en rojo suave y todo lo bueno en verde suave.*

Cambias dos hex. Refactorizas el componente de badges a variantes semánticas (`good`, `bad`, `theme`, `info`, `neutral`) en vez de literales (`yellow`, `red`). Cada estado se mapea según lo que significa, no según un color que se me ocurrió. Un código de set perfecto enseña solo el badge del tema; uno con problemas, los que toquen.

> *—Lo de "faltan piezas" debería ser un check, como caja abierta y descatalogado. Y ese tipo de checks que tengan algo de rojito para distinguirse.*

Conviertes el select de tres opciones (`complete`/`missing_pieces`/`unknown`) en un checkbox. Los tres checkboxes "negativos" comparten una fila con tinte rojo al 8% de opacidad. El mensaje es claro de un vistazo: "marca lo que esté mal".

[CAPTURA: el form con los tres checks rojos y el campo de precio]

Cada uno de estos toques cuesta entre cinco y quince minutos. Detectarlos —saber que el azul no comunica nada y que un select tri-estado es un select de más— es lo que cuesta. Lo otro lo escribe Claude.

## Lo que aprendí (otra vez)

Tres cosas que ya sabía pero que esta tarde han quedado más claras.

**El criterio es la constante.** El #eba605 lo elige Víctor mentalmente. La idea de "rojo para lo malo, verde para lo bueno" la articula Julia. La decisión de partir el modelo en `lego_sets` y `owned_copies` la tomo yo en cinco minutos porque sé qué problemas vienen después si no lo haces. Ningún prompt sustituye esos cinco minutos.

**El trabajo desatendido es regalo puro.** De las cinco horas que pasaron entre que empecé el sábado noche y la app quedó publicada el domingo a media mañana, mi tiempo dedicado real fueron entre 30 y 45 minutos. Lo demás es el script de Rebrickable corriendo mientras duermes, Vercel construyendo mientras desayunas, las migraciones aplicándose mientras te duchas. La pieza que más tarda —la sincronización del catálogo entero— **no necesita que estés delante**. Cuando vuelves, ya está.

**Hacer software para una persona ahora compensa.** Esta app no vale para nadie más que para Julia y Víctor (y para mí, el día que empiece a coleccionar; y para los que se la enseñe y digan "yo también haría algo así"). El amarillo es el suyo. El idioma es el suyo. La nota del "set de Prosperidad" cabe en el campo abierto sin que ningún esquema le diga que se equivoca de formato. **Antes esto no compensaba.** El coste de construirlo era demasiado alto para el alcance de una persona o dos. Ahora cae a la altura de "una sobremesa entre cena y café", que es exactamente la magnitud correcta para regalárselo a unos primos.

## La cuenta final

- **Sábado, paseo de tarde**: conversación con Julia y Víctor. Ven la libreta.
- **Sábado, 22:30**: empiezo. MD de concepto, decisiones, plan en sprints.
- **Sábado, 23:00–01:00**: scaffolding, Vercel, Neon, schema en Drizzle, primer deploy en blanco. Sync de Rebrickable lanzado y dejado corriendo.
- **Domingo, 09:30**: café, retomo. Vista de colección, drawer, formulario de alta.
- **Domingo, 10:00**: app desplegada con todo lo importante, lista para que metan la libreta.

30-45 minutos de trabajo dedicado real. 4-5 horas de procesos corriendo solos. Y dos años de libreta, ahora con un sitio donde aterrizar.

La próxima fase es transcribirla. Me van a mandar fotos de las páginas y yo las paso a la base de datos —yo, claro, con Claude transcribiendo y yo verificando. Eso tampoco compensaba antes.

---

*legocoleccion es un proyecto personal construido en una tarde con Claude Code (Opus), Next.js 16, Drizzle, Postgres en Neon, dumps de Rebrickable y la API REST como fallback. Vive en `legocoleccion.vercel.app`. El código está en GitHub; los datos son privados y propiedad de Julia y Víctor.*

[CAPTURA FINAL: vista general de la home con varias tarjetas y filtros visibles]
