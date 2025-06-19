# Bicimex Product Feedback App

Una aplicación web interactiva que permite a los usuarios sugerir nuevas funcionalidades, votar, comentar, responder y hacer seguimiento del estado de desarrollo de las solicitudes de producto, basada en el diseño de Frontend Mentor.

🔗 [Ver sitio en vivo](https://c-arthurcruz.github.io/bicimex-app/)

---

## Funciones Principales

### Página principal (Sugerencias)
Muestra las sugerencias disponibles con filtros por categoría, ordenamiento, opción de votar y contador de comentarios.

### Hoja de ruta (Roadmap)
Organiza el feedback por estado: **Planned**, **In-Progress**, **Live**.

### Vista de detalle
Permite ver detalles del feedback, comentar y responder (replies), así como editar la solicitud.

---

## 🚀 Funcionalidades

✅ **Página de sugerencias**  
- Muestra solo feedback con estado `suggestion`.  
- Permite filtrar por categoría y ordenar por votos o comentarios.  
- Soporte para votos positivos.

✅ **Hoja de ruta (Roadmap)**  
- Muestra solicitudes con estado `planned`, `in-progress` y `live`.  
- Cada columna ordenada por votos descendentes.  
- Diseño responsivo tipo tablero.

✅ **Creación de comentarios**  
- Se puede añadir nuevo feedback con título, categoría y descripción.  
- La ID se autogenera.  
- El estado por defecto es `suggestion`.

✅ **Edición de comentarios**  
- Se puede actualizar el título, descripción, categoría y estado.  
- Si se cambia el estado, se mueve automáticamente a la sección correspondiente.

✅ **Comentarios y respuestas**  
- Los usuarios pueden comentar y responder a otros comentarios.  
- Límite de 250 caracteres por comentario o respuesta.  
- Uso del `currentUser` del JSON para firmar las publicaciones.  
- Se actualiza todo en vivo sin recargar.

✅ **Persistencia de datos**  
- Los cambios se almacenan en `localStorage`.

---

## 🧪 Tecnologías usadas

- **HTML**, **CSS**, **JavaScript**
- Diseño responsivo y estilo inspirado en Frontend Mentor
- Almacenamiento en `localStorage` para persistencia
- Datos iniciales cargados desde `data.json`

---

## 🗂 Estructura del proyecto

bicimex-app/
│
├── assets/
│ └── user-images/
│
├── data.json # Datos iniciales del proyecto
├── index.html # Página principal
├── styles.css # Estilos personalizados
├── main.js # Lógica principal
└── README.md # Este archivo

## 🚧 Mejoras que se le podrian hacer

- Agregar validación de formularios más robusta.
- Agregar backend real para persistencia de datos entre sesiones y usuarios.
- Soporte para usuarios múltiples con login/logout.

📬 Contacto
Desarrollado por Carlos Arturo Cruz Domínguez
Email: carturo.cruzd@gmail.com

📝 Licencia
Este proyecto es libre de uso personal. El diseño base fue tomado como inspiración del reto de Frontend Mentor.