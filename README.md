# Popups

### Definición de Tipos

- `InputPopupField`: Para campos de entrada estándar (texto, número, color, etc.)
- `SelectPopupField`: Para campos de selección con opciones predefinidas
- `PopupFields`: Es un objeto que contiene todos los campos del formulario.

```typescript
type InputPopupField = {
	type: HTMLInputTypeAttribute;
	defaultValue: string | number | boolean;
	attributes: HTMLInputAttributes;
};

type SelectPopupField = {
	type: 'select';
	defaultValue: string | number;
	attributes: HTMLSelectAttributes;
	options: string[];
};

type PopupFields = Record<string, InputPopupField | SelectPopupField>;
```

## Configuración de Campos

Los campos del formulario se definen en el objeto `popupFields`. Cada campo tiene una clave única y una configuración específica. Por ejemplo:

```typescript
const popupFields = {
	nameID: {
		type: 'text',
		defaultValue: '',
		attributes: {}
	},
    'fill-opacity': {
		type: 'number',
		defaultValue: 0.2,
		attributes: {
			min: 0,
			max: 1,
			step: 0.1
		}
	}
	zoneType: {
		type: 'select',
		defaultValue: '',
		attributes: {},
		options: ['initial', 'flood', 'safe']
	}
} satisfies PopupFields;
```

### Explicación de los Campos

**nameID**:

- Tipo: texto
- Valor por defecto: cadena vacía
- Sin atributos especiales

**fill-opacity**:

- Tipo: número
- Valor por defecto: 0.2
- Atributos:
  - Valor mínimo: 0
  - Valor máximo: 1
  - Incremento: 0.1

**zoneType**:

- Tipo: selección (dropdown)
- Valor por defecto: cadena vacía
- Opciones: 'initial', 'flood', 'safe'

## Cómo Modificar el Formulario

Para añadir, modificar o eliminar campos en el formulario:

1. Localizar la variable `popupFields` en `src/lib/config.ts`.
2. Para añadir un nuevo campo, agregar una nueva entrada siguiendo el formato existente.
3. Para modificar un campo, cambiar los valores de `type`, `defaultValue`, `attributes`, u `options` (para campos de tipo 'select').
4. Para eliminar un campo, simplemente borrar la entrada correspondiente.

Ejemplo de cómo añadir un nuevo campo:

```typescript
const popupFields = {
	// ... campos existentes ...
	newField: {
		type: 'text',
		defaultValue: 'Nuevo campo',
		attributes: {
			placeholder: 'Ingrese un valor'
		}
	}
} satisfies PopupFields;
```

Después de hacer cambios, debe asegurarse de que la variable `popupFields` siga cumpliendo con el formato de `PopupFields`.
