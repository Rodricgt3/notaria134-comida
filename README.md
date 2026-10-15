# Invitación · Notaría 134

Comida de fin de año: **viernes 11 de diciembre de 2026**, **desde las 3:00 p. m.**, Hacienda las Campanas, Tlalpan, CDMX.

Sitio estático para GitHub Pages. HTML, CSS y JavaScript sin frameworks ni instalación de dependencias. Ilustraciones SVG, diseño adaptable y animaciones que respetan la preferencia de movimiento reducido. Las fuentes se descargan de Google Fonts, con fuentes del sistema como respaldo.

## Vista previa

1. Abre una terminal en esta carpeta y ejecuta `node preview.cjs`.
2. Abre <http://127.0.0.1:4173> en tu navegador.
3. Para detenerla, pulsa `Ctrl + C` en la terminal.

También puedes abrir `index.html` con doble clic para ver el diseño. Para probar el envío, usa la vista previa o GitHub Pages.

## Conectar Google Sheets, paso a paso

El código crea una hoja privada en tu cuenta. No necesitas compartirla con los invitados.

1. Entra en <https://script.google.com> con la cuenta que administrará las confirmaciones.
2. Pulsa **Nuevo proyecto** y nómbralo **Confirmaciones Notaría 134**.
3. En el archivo `Código.gs` del editor, borra el contenido inicial.
4. Abre `google-apps-script/Code.gs` de esta carpeta. Copia TODO su contenido y pégalo en Google.
5. Guarda. En el selector superior de funciones, elige **configurar** y pulsa **Ejecutar**.
6. Autoriza el acceso de tu propio proyecto a Google Sheets. Si tu cuenta empresarial bloquea la autorización, pide ayuda a su administrador.
7. En **Registro de ejecución** aparecerá **Tu hoja de confirmaciones:** seguido del enlace. Ábrelo y guárdalo. Ejecutar `configurar` otra vez reutiliza la hoja.
8. Pulsa **Implementar → Nueva implementación**. En el engranaje elige **Aplicación web**.
9. En **Ejecutar como**, selecciona **Yo**. En **Quién tiene acceso**, elige **Cualquier persona** para que los invitados no necesiten iniciar sesión. Si no aparece, puede estar restringido por tu administrador.
10. Pulsa **Implementar** y copia la **URL de la aplicación web**, terminada en `/exec`. No uses la URL `/dev`.
11. Abre `config.js` de esta carpeta y pega esa URL entre las comillas vacías de `appsScriptUrl`. Guarda. No pegues la URL de la hoja.
12. Recarga la invitación y envía un registro de prueba. Deben aparecer la pantalla de éxito y una fila en Sheets. Después elimina esa fila de prueba.

Sin conexión configurada, el sitio informa que las confirmaciones aún no están habilitadas. La integración real debe probarse después de implementar Apps Script en tu cuenta.

Si cambias Apps Script después: **Implementar → Gestionar implementaciones → Editar → Nueva versión → Implementar**. Conserva la misma URL.

Documentación oficial: <https://developers.google.com/apps-script/guides/web>

## Publicar en GitHub Pages

El repositorio de esta carpeta es `Rodricgt3/notaria134-comida`.

1. Sube estos archivos a la rama principal. Con GitHub Desktop: selecciona el repositorio, escribe **Crear invitación de fin de año** en el resumen, pulsa **Commit to main** (o el nombre de tu rama) y luego **Push origin**.
2. En GitHub, abre el repositorio y entra en **Settings → Pages**.
3. En **Build and deployment → Source**, elige **Deploy from a branch**.
4. Elige la rama donde subiste los archivos y la carpeta **/(root)**. Pulsa **Save**.
5. Espera a que GitHub muestre el enlace publicado en esa pantalla. Ábrelo y prueba desde tu celular.

GitHub Pages aloja la invitación; Apps Script escribe en Sheets. No hay contraseñas ni claves privadas en el sitio. La URL de Apps Script es pública por diseño.

## Datos y funcionamiento

Se registran fecha (Ciudad de México), nombre obligatorio, comentario opcional, estado e identificador de envío. El servidor valida longitudes, neutraliza fórmulas y bloquea escrituras simultáneas. Reintentar el mismo envío no duplica la fila. Un nuevo envío después de recargar sí puede crear otra fila; no se identifica a las personas por nombre. El campo trampa es una protección básica contra bots, no contra abuso avanzado. No hay endpoint para leer nombres o alergias desde la invitación.

Comparte la hoja solo con los organizadores y elimina los datos cuando dejen de ser necesarios. La confirmación no envía correos ni mensajes.

## Archivos

- `index.html`: textos, fecha, lugar y estructura.
- `styles.css`: diseño y animaciones.
- `app.js`: validación y envío.
- `config.js`: URL del servicio de Apps Script.
- `google-apps-script/Code.gs`: código para pegar en Apps Script.
- `preview.cjs`: servidor local opcional.

La arquitectura ilustrada es decorativa, no una representación exacta de la hacienda. El mapa usa las coordenadas del enlace proporcionado.
