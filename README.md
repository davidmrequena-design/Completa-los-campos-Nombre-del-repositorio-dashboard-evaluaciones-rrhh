# Dashboard de Evaluaciones RRHH · Cruz Roja Madrid

Dashboard interactivo para la gestión y visualización de evaluaciones de desempeño del personal de Cruz Roja Madrid.

---

## 📋 Descripción

Esta aplicación web permite al departamento de Recursos Humanos consultar, filtrar y analizar las evaluaciones de desempeño del personal de forma visual e intuitiva, sin necesidad de instalar ninguna dependencia externa.

## ✨ Funcionalidades

- **Indicadores KPI** en tiempo real: total de evaluados, puntuación media y distribución por estado.
- **Gráfico de barras** con la puntuación media por departamento.
- **Gráfico donut** con la distribución del personal según su estado de evaluación.
- **Tabla interactiva** con ordenación por columnas y filtros por departamento, estado y búsqueda libre.
- **Modal de detalle** con el desglose de las 5 competencias evaluadas y comentarios del evaluador.
- **Diseño responsivo** adaptado a escritorio y dispositivos móviles.
- Accesibilidad (roles ARIA, navegación por teclado).

## 🗂️ Estructura del proyecto

```
dashboard-evaluaciones-rrhh/
├── index.html          # Página principal del dashboard
├── styles.css          # Hoja de estilos (sin dependencias externas)
├── app.js              # Lógica JavaScript de la aplicación
├── data/
│   └── employees.json  # Datos de evaluaciones del personal
├── .gitignore
├── LICENSE
└── README.md
```

## 🚀 Puesta en marcha

### Opción 1 – Servidor de desarrollo local (recomendado)

```bash
# Con Python 3
python3 -m http.server 8080

# Con Node.js (npx)
npx serve .

# Con PHP
php -S localhost:8080
```

Abre el navegador en `http://localhost:8080`.

### Opción 2 – Extensión Live Server (VS Code)

Instala la extensión **Live Server** de Ritwick Dey y haz clic en _"Go Live"_.

> **Nota:** La aplicación carga los datos mediante `fetch()`, por lo que **no funciona** abriendo `index.html` directamente como archivo local (`file://`). Usa siempre un servidor HTTP.

## 📊 Datos de evaluación

Los datos se almacenan en `data/employees.json`. Cada registro contiene:

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | number | Identificador único |
| `nombre` | string | Nombre completo |
| `departamento` | string | Área organizativa |
| `cargo` | string | Puesto de trabajo |
| `fechaEvaluacion` | string (ISO 8601) | Fecha de la evaluación |
| `puntuacion` | number (0-100) | Puntuación global |
| `competencias` | object | Desglose de las 5 competencias |
| `estado` | string | `excelente` / `bueno` / `mejorable` / `insuficiente` |
| `comentarios` | string | Observaciones del evaluador |

### Competencias evaluadas

1. **Liderazgo**
2. **Comunicación**
3. **Trabajo en Equipo**
4. **Iniciativa**
5. **Cumplimiento de Objetivos**

## 🛠️ Tecnologías utilizadas

- **HTML5** – Estructura semántica y accesible
- **CSS3** – Estilos con variables CSS y diseño responsivo (sin frameworks)
- **JavaScript (ES2017+)** – Lógica de la aplicación (vanilla JS, sin dependencias)

## 📦 Configuración del repositorio

```bash
# Clonar el repositorio
git clone https://github.com/davidmrequena-design/dashboard-evaluaciones-rrhh.git
cd dashboard-evaluaciones-rrhh

# Lanzar el servidor de desarrollo
python3 -m http.server 8080
```

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más información.

---

*Uso exclusivo del departamento de Recursos Humanos · Cruz Roja Madrid*
