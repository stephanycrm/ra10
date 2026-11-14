# XR CIRCUIT LAB EDU

Laboratorio educativo para primaria en Colombia: componentes eléctricos en 3D, actividad sobre LED, cámara con superposición de modelos, seguimiento de manos con MediaPipe y RV inmersiva cuando WebXR lo permite.

## Estructura

- `index.html`: interfaz y contenido pedagógico.
- `styles.css`: estilos adaptables.
- `script.js`: modelos geométricos, visor Three.js, cámara, MediaPipe, RV y actividades.

## Ejecutar

Necesita conexión a internet para cargar Three.js y MediaPipe desde CDN. Sirva los archivos desde un servidor web (no abra `index.html` mediante `file://`, porque los módulos ES pueden bloquearse):

```bash
python -m http.server 8000
```

Abra `http://localhost:8000` en el computador. Para cámara en teléfonos, publique mediante HTTPS; un servidor HTTP en la red local no es contexto seguro.

## Publicar en GitHub Pages

Cree un repositorio, suba los tres archivos y este README a la raíz. En Settings > Pages seleccione Deploy from a branch, `main` y `/ (root)`. Espere la publicación HTTPS. Abra la URL desde el teléfono y autorice la cámara solo al pulsar los botones correspondientes.

## Probar

1. Abra el sitio en computadora y celular, seleccione las diez piezas, rote y haga zoom.
2. Pulse «RA con cámara» y autorice el acceso; verá el modelo superpuesto sobre el video. **No hay anclaje a superficies ni seguimiento espacial.**
3. Pulse «Activar manos»: índice en movimiento para rotar, pinza para acercar, palma abierta para pausar. La precisión depende de luz, cámara, potencia del equipo y posición de la mano.
4. Pulse «Entrar en RV» en un dispositivo con WebXR `immersive-vr` compatible y HTTPS. En otros equipos seguirá disponible el modo 3D.
5. Complete la misión del LED; genere y descargue la guía docente.
6. Pruebe con teclado, pantalla pequeña y permiso de cámara denegado.

## Modelos

Los diez modelos iniciales son **representaciones geométricas educativas originales** creadas en `build(type)` dentro de `script.js`, sin descargas de modelos de terceros. No representan planos eléctricos de montaje. Para sustituir un modelo inicial por un GLB propio, puede modificar `choose()` y `loadGLB()` para cargar una ruta local (por ejemplo `models/mi-modelo.glb`), conservando el archivo en el repositorio. El botón «Importar modelo 3D» acepta GLB autocontenido de hasta 50 MB y solo conserva los modelos durante la sesión; los Object URLs se liberan al cerrar la página. La importación de `.gltf` con recursos separados no está implementada. Para persistencia entre visitas, agregue los archivos GLB al repositorio y regístrelos en el código.

Use solo modelos para los que tenga permiso; documente autor, título, licencia y enlace de origen en el sitio. No se incluyen modelos USDZ ni enlaces externos no verificados.

## Bibliotecas y privacidad

- Three.js `0.170.0` (ES Modules) y GLTFLoader desde jsDelivr.
- MediaPipe Tasks Vision `0.10.22` desde jsDelivr; modelo `hand_landmarker.task` desde el almacenamiento público de MediaPipe.
- WebXR a través de Three.js; depende de navegador y dispositivo.
- Web Speech API integrada en el navegador, si está disponible.

El procesamiento de cámara y gestos ocurre en el navegador; el código no envía imágenes a un servidor propio. Las bibliotecas y el archivo de modelo de MediaPipe sí se descargan desde proveedores externos. La cámara no se solicita al cargar la página.

## Límites y seguridad

El modo «RA con cámara» es composición visual de video + 3D, **no RA espacial** con detección de superficies. El modo RV necesita un dispositivo compatible y HTTPS. Los gestos son controles heurísticos de una sola mano; no permiten agarrar piezas individuales ni conectarlas físicamente. Los modelos son demostrativos. La misión del LED es conceptual, no un esquema eléctrico listo para construir.

No conectar nada a la red eléctrica doméstica. Cualquier experimento físico debe realizarse con materiales de bajo voltaje adecuados y supervisión adulta.

## Constructor interactivo de circuito (versión mejorada)

La sección **Construye tu circuito LED** permite seleccionar piezas y colocarlas en tres casillas mediante clic, teclado o arrastrar y soltar. La actividad comprueba la pila, la resistencia y el LED, muestra progreso y exige cerrar el interruptor para iluminar el LED virtual. Es una simulación conceptual, no un simulador físico de corriente o conexiones reales.

## Control gestual MediaPipe (integrado)

1. Publica la web con HTTPS (o abre en localhost con servidor local).
2. Pulsa **Activar manos** y acepta el permiso de cámara.
3. Mueve el dedo índice para girar el modelo; haz una pinza para acercarlo; abre la palma para pausar; muestra índice y corazón en V para cambiar al siguiente componente.
4. Pulsa **Desactivar manos** o **Detener cámara** para finalizar.

MediaPipe detecta puntos de la mano localmente mediante Tasks Vision; la biblioteca y el modelo de inferencia se descargan desde CDN y Google Storage. Los gestos pueden requerir buena iluminación y ajustes según el equipo. No se garantiza compatibilidad universal ni anclaje espacial en RA.

## Diagnóstico MediaPipe (versión corregida)

Esta versión intenta primero MediaPipe con CPU, evitando posibles conflictos con el contexto WebGL de Three.js. Si falla, prueba GPU; también intenta otra versión de la biblioteca. Si no logra inicializar, muestra el detalle técnico en pantalla y en la consola (F12 > Console). Los CDN y el modelo deben poder descargarse; el sitio requiere HTTPS o localhost para acceder a la cámara. Si ya publicaste una versión anterior en GitHub Pages, sube los archivos nuevos y fuerza recarga con Ctrl+F5.


## Versión con niveles y ensamblaje gestual

Autora: **Stephany Ramírez**. Uso exclusivamente educativo. La portada aparece al entrar al laboratorio y se cierra con el botón «Entrar al laboratorio».

### Cuatro niveles

1. Luz de explorador (inicial): pila, resistencia y LED.
2. Linterna con interruptor (básico): pila, interruptor, resistencia y LED.
3. Alarma sonora (intermedio): pila, interruptor y zumbador.
4. Ventilador pequeño (avanzado): pila, interruptor y motor.

Al ubicar correctamente todas las piezas y cerrar el interruptor se desbloquea el siguiente nivel. El desbloqueo se guarda mediante localStorage en el navegador, sin cuentas ni servidores. No se simula corriente, voltaje ni polaridad física: es una **representación conceptual**.

### MediaPipe en el ensamblaje

En la sección «Academia de circuitos» pulsa **Ensamblar con MediaPipe** y autoriza la cámara. El dedo índice controla un cursor sobre el panel de ensamblaje y la pinza entre pulgar e índice hace clic en la pieza o casilla apuntada. Se selecciona una pieza con una pinza y se coloca en una casilla con otra pinza. Para cerrar el interruptor se apunta al botón y se hace pinza. Hay un retardo breve entre acciones para evitar pulsaciones involuntarias. Si falla MediaPipe, usa el ratón, el teclado o la pantalla táctil.

La cámara y los modelos de MediaPipe requieren HTTPS o localhost y acceso a Internet para cargar bibliotecas y recursos remotos. El seguimiento de mano en cámara es una interacción gestual con superposición visual, **no anclaje espacial WebXR**.

### Publicación

Sube index.html, styles.css y script.js a la raíz del repositorio de GitHub Pages. Haz recarga forzada para evitar archivos en caché.

## Novedad: protoboard tridimensional interactiva

En **Academia de circuitos** hay una protoboard 3D con piezas geométricas originales. Haz clic en una pieza de la bandeja tridimensional y luego en una posición resaltada de la placa. También puedes girar la vista arrastrando el fondo y centrarla con **Centrar placa**. Los controles de botones situados debajo siguen disponibles para teclado y tacto.

Para utilizar MediaPipe, pulsa **Ensamblar con MediaPipe**. Mueve el índice para señalar una pieza 3D y haz una pinza con índice y pulgar para seleccionarla; suelta y vuelve a hacer pinza sobre una posición para colocarla. La precisión depende de la cámara, iluminación y tamaño de pantalla. También puedes utilizar los botones de ensamblaje con gestos.

**Alcance técnico:** La protoboard es una representación 3D conceptual con posiciones de montaje simplificadas. No modela eléctricamente filas, rieles, contactos, polaridad, tensión, intensidad ni resistencia. Los niveles verifican una secuencia pedagógica predefinida, no la viabilidad física del circuito. La RA de cámara superpone un modelo sobre el vídeo y no ofrece anclaje espacial. La RV depende de WebXR y del dispositivo.

**Pruebas realizadas:** validación sintáctica de JavaScript y estructura de los archivos. No se ha comprobado el reconocimiento gestual en una cámara real ni se garantiza compatibilidad universal. Publicar mediante HTTPS en GitHub Pages, probar MediaPipe y revisar la consola del navegador si surge un error. Las bibliotecas Three.js y MediaPipe se cargan desde internet.


## Reparaciones de esta versión
- Corregido un error de inicialización: el nivel inicial se intentaba crear antes de que existiera la escena 3D de la protoboard, deteniendo el JavaScript y los controles MediaPipe.
- Agregado importmap para resolver correctamente el módulo Three.js usado por GLTFLoader.
- Portada a pantalla completa sin scroll interno, con avatar local y atribución a Stephany Ramírez.
- Se mantiene el intento de inicialización MediaPipe por CPU y después GPU; requiere conexión para descargar la biblioteca y el modelo, además de HTTPS/localhost.
- Para probar: publica todos los archivos (incluyendo assets/) en GitHub Pages, recarga con Ctrl+F5, abre consola F12 si aparece un error.
- La interacción gestual se debe validar con cámara real; las comprobaciones de sintaxis no sustituyen pruebas en el navegador.


## Portada y guía de gestos (versión actualizada)

- El avatar está incrustado como imagen PNG dentro de `index.html` (data URI), así que **no depende** de que se suba la carpeta `assets/` a GitHub Pages.
- La sección **Guía interactiva de gestos** explica índice, pinza, palma y V, y tiene accesos directos al visor y al ensamblaje.
- En el visor, pulsa **Activar manos**; en el ensamblaje, pulsa **Ensamblar con MediaPipe**. Son modos de interacción distintos.
- MediaPipe necesita cámara, HTTPS (o localhost), conexión para obtener dependencias y permiso del navegador. El seguimiento gestual requiere probarse en un dispositivo real.
- La protoboard es una actividad conceptual; no simula continuidad eléctrica real ni sustituye esquemas físicos.

### Diagnóstico de errores

Si MediaPipe no inicia, abre las herramientas de desarrollo (F12 > Consola), anota el error completo y verifica los recursos CDN, el permiso de cámara y que la URL sea HTTPS. Evita tener otra aplicación usando la cámara.
