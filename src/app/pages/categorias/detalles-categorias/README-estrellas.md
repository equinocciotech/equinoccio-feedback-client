# Estrellas de Calificación en Detalles de Categorías

## 🎯 **Descripción**

Este componente muestra las clasificaciones de una categoría específica con un sistema visual de estrellas de calificación. Cada tarjeta representa una clasificación y muestra:

- **5 estrellas** donde el número de estrellas amarillas corresponde a la puntuación
- **Colores de fondo** que cambian según la puntuación
- **Estados visuales** que indican la calidad de la clasificación
- **Información detallada** de cada clasificación

## ⭐ **Sistema de Estrellas**

### **Implementación:**
```typescript
// Método para generar estrellas basado en la puntuación
generarEstrellas(puntuacion: number): boolean[] {
  const estrellas = [];
  for (let i = 0; i < 5; i++) {
    estrellas.push(i < puntuacion);
  }
  return estrellas;
}
```

### **Visualización:**
- **Estrellas amarillas** (`text-yellow-400`): Representan la puntuación actual
- **Estrellas grises** (`text-gray-300`): Representan las estrellas no alcanzadas
- **Tamaño**: 24x24px (w-6 h-6) para buena visibilidad
- **Transiciones**: Animaciones suaves de 200ms

## 🎨 **Sistema de Colores**

### **Por Puntuación:**

| Puntuación | Color de Fondo | Color de Borde | Estado | Color de Texto |
|------------|----------------|----------------|---------|----------------|
| **5 estrellas** | `bg-green-50` | `border-green-200` | Excelente | `text-green-700` |
| **4 estrellas** | `bg-green-50` | `border-green-200` | Excelente | `text-green-700` |
| **3 estrellas** | `bg-yellow-50` | `border-yellow-200` | Bueno | `text-yellow-700` |
| **2 estrellas** | `bg-orange-50` | `border-orange-200` | Regular | `text-orange-700` |
| **1 estrella** | `bg-red-50` | `border-red-200` | Necesita mejora | `text-red-700` |

### **Implementación de Colores:**
```typescript
getColorFondo(puntuacion: number): string {
  if (puntuacion >= 4) return 'bg-green-50 border-green-200';
  if (puntuacion >= 3) return 'bg-yellow-50 border-yellow-200';
  if (puntuacion >= 2) return 'bg-orange-50 border-orange-200';
  return 'bg-red-50 border-red-200';
}
```

## 🏗️ **Estructura de la Tarjeta**

### **HTML Template:**
```html
<div *ngFor="let clasificacion of clasificaciones" 
     [class]="getColorFondo(clasificacion.puntuacion)"
     class="border-2 cursor-pointer hover:shadow-lg transition-all duration-300 rounded-lg p-5">
  
  <!-- Header con título y estado -->
  <div class="flex items-center justify-between mb-3">
    <h3 class="text-xl font-bold text-gray-800">{{ clasificacion.descripcion }}</h3>
    <span [class]="getEstadoColor(clasificacion.puntuacion)" 
          class="text-xs font-medium px-3 py-1 rounded-full bg-white border">
      {{ getEstadoTexto(clasificacion.puntuacion) }}
    </span>
  </div>

  <!-- Estrellas de calificación -->
  <div class="mb-4">
    <div class="flex items-center space-x-1">
      <div class="flex items-center">
        <div *ngFor="let estrella of generarEstrellas(clasificacion.puntuacion); let i = index" 
             class="inline-block transition-colors duration-200 w-6 h-6">
          <svg [class]="estrella ? 'text-yellow-400' : 'text-gray-300'"
               fill="currentColor" 
               viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        </div>
      </div>
      
      <!-- Puntuación numérica -->
      <span class="ml-3 text-sm font-medium text-gray-600">
        {{ clasificacion.puntuacion }}/5
      </span>
    </div>
  </div>

  <!-- Información adicional -->
  <div class="text-sm text-gray-600">
    <p class="mb-2">
      <span class="font-medium">Puntuación:</span> 
      {{ clasificacion.puntuacion }} estrellas
    </p>
    <p class="text-xs text-gray-500">
      Basado en feedback de usuarios
    </p>
  </div>
</div>
```

## 🔧 **Características Técnicas**

### **Responsive Design:**
- **Grid adaptativo**: 1 columna en móvil, 2 en tablet, 3 en desktop
- **Espaciado consistente**: Gap de 1rem entre tarjetas
- **Padding interno**: 1.25rem (p-5) para contenido equilibrado

### **Interactividad:**
- **Hover effects**: Sombra aumentada al pasar el mouse
- **Transiciones suaves**: 300ms para cambios de estado
- **Cursor pointer**: Indica que las tarjetas son interactivas

### **Accesibilidad:**
- **Contraste adecuado**: Colores que cumplen estándares WCAG
- **Texto descriptivo**: Información clara sobre cada puntuación
- **Estructura semántica**: Uso apropiado de headings y párrafos

## 📱 **Vista Móvil**

### **Adaptaciones:**
- **Grid de 1 columna**: Optimizado para pantallas pequeñas
- **Estrellas más grandes**: Mejor visibilidad en dispositivos táctiles
- **Espaciado reducido**: Padding ajustado para móviles

## 🎯 **Casos de Uso**

### **Escenarios:**
1. **Evaluación de calidad**: Ver rápidamente qué clasificaciones tienen mejor puntuación
2. **Comparación visual**: Comparar clasificaciones de una categoría
3. **Feedback de usuarios**: Mostrar la satisfacción del usuario con cada clasificación
4. **Gestión de calidad**: Identificar áreas que necesitan mejora

### **Ejemplos de Puntuaciones:**
- **5 estrellas**: Clasificación de excelente calidad
- **3 estrellas**: Clasificación de calidad aceptable
- **1 estrella**: Clasificación que necesita revisión

## 🚀 **Mejoras Futuras**

### **Posibles Extensiones:**
- **Filtros por puntuación**: Mostrar solo clasificaciones con X estrellas
- **Ordenamiento**: Ordenar por puntuación, nombre, etc.
- **Estadísticas**: Mostrar promedio de puntuación de la categoría
- **Histórico**: Mostrar evolución de puntuaciones en el tiempo
- **Comentarios**: Agregar sistema de feedback detallado

## 📋 **Requisitos**

### **Dependencias:**
- **Angular**: Framework base
- **Tailwind CSS**: Sistema de estilos
- **CommonModule**: Directivas básicas de Angular
- **RouterLink**: Navegación entre páginas

### **Datos Requeridos:**
- **clasificaciones[]**: Array con objetos que incluyan `puntuacion` y `descripcion`
- **categoria**: Objeto con información de la categoría actual
