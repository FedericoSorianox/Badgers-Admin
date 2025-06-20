# Formatos de Importación CSV

Este documento describe los formatos de archivos CSV requeridos para importar datos al sistema Badgers Admin.

## 1. Socios (socios.csv)

```csv
ci,nombre,celular,contacto_emergencia,emergencia_movil,fecha_nacimiento,tipo_cuota,enfermedades,comentarios
1234567,Juan Pérez,099123456,Maria Pérez,099654321,1990-05-15,Mensual,Diabetes,Alergia a penicilina
2345678,Ana García,098765432,Carlos García,097654321,1985-12-03,Anual,,,
```

**Campos requeridos:**
- `ci`: Cédula de identidad (único)
- `nombre`: Nombre completo del socio

**Campos opcionales:**
- `celular`: Número de teléfono
- `contacto_emergencia`: Nombre del contacto de emergencia
- `emergencia_movil`: Teléfono del contacto de emergencia
- `fecha_nacimiento`: Fecha en formato YYYY-MM-DD, DD/MM/YYYY, o DD-MM-YYYY
- `tipo_cuota`: Tipo de cuota (Mensual, Anual, etc.)
- `enfermedades`: Enfermedades o condiciones médicas
- `comentarios`: Comentarios adicionales

## 2. Pagos (pagos.csv)

```csv
ci,mes,año,monto,fecha_pago,metodo_pago
1234567,1,2025,50000,2025-01-15,Efectivo
2345678,1,2025,50000,2025-01-20,Transferencia
```

**Campos requeridos:**
- `ci`: Cédula de identidad del socio
- `mes`: Mes del pago (1-12)
- `año`: Año del pago
- `monto`: Monto del pago

**Campos opcionales:**
- `fecha_pago`: Fecha del pago (formato: YYYY-MM-DD, DD/MM/YYYY, o DD-MM-YYYY)
- `metodo_pago`: Método de pago utilizado

## 3. Productos/Inventario (productos.csv)

```csv
nombre,precio_venta,precio_costo,stock
Agua,5000,3000,100
Proteína,25000,18000,50
```

**Campos requeridos:**
- `nombre`: Nombre del producto (único)

**Campos opcionales:**
- `precio_venta`: Precio de venta al público
- `precio_costo`: Precio de costo
- `stock`: Cantidad en inventario

## 4. Ventas (ventas.csv)

```csv
producto_nombre,cantidad,fecha_venta
Agua,2,2025-01-15
Proteína,1,2025-01-16
```

**Campos requeridos:**
- `producto_nombre`: Nombre exacto del producto (debe existir en el inventario)
- `cantidad`: Cantidad vendida (debe ser mayor a 0)

**Campos opcionales:**
- `fecha_venta`: Fecha de la venta (formato: YYYY-MM-DD, DD/MM/YYYY, o DD-MM-YYYY). Si no se especifica, se usa la fecha actual.

**Notas importantes:**
- El producto debe existir previamente en el inventario
- El stock disponible debe ser suficiente para la cantidad vendida
- El total de la venta se calcula automáticamente (precio_venta × cantidad)
- El stock se actualiza automáticamente al importar

## 5. Gastos (gastos.csv)

```csv
concepto,monto,fecha,categoria,descripcion
Luz,150000,2025-01-15,Servicios,Factura de electricidad enero
Mantenimiento,75000,2025-01-20,Equipamiento,Reparación de máquinas
```

**Campos requeridos:**
- `concepto`: Descripción del gasto
- `monto`: Monto del gasto (debe ser mayor a 0)
- `fecha`: Fecha del gasto (formato: YYYY-MM-DD, DD/MM/YYYY, o DD-MM-YYYY)

**Campos opcionales:**
- `categoria`: Categoría del gasto (ej: Servicios, Equipamiento, etc.)
- `descripcion`: Descripción adicional del gasto

## Notas Generales

1. **Codificación**: Los archivos CSV deben estar codificados en UTF-8
2. **Separador**: Usar coma (,) como separador de campos
3. **Fechas**: Se aceptan múltiples formatos de fecha:
   - YYYY-MM-DD (recomendado)
   - DD/MM/YYYY
   - DD-MM-YYYY
4. **Números**: Usar punto (.) como separador decimal
5. **Campos vacíos**: Los campos opcionales pueden dejarse vacíos
6. **Validación**: El sistema validará los datos y mostrará errores específicos si los hay

## Ejemplos de Uso

### Importar Socios Nuevos
1. Crear un archivo CSV con los datos de los socios
2. Ir a la página de Administración
3. Seleccionar "Importar Socios"
4. Subir el archivo CSV
5. Revisar los resultados de la importación

### Importar Ventas Históricas
1. Crear un archivo CSV con las ventas (asegurarse de que los productos existan)
2. Ir a la página de Administración
3. Seleccionar "Importar Ventas"
4. Subir el archivo CSV
5. El sistema actualizará automáticamente el inventario

### Importar Gastos Mensuales
1. Crear un archivo CSV con los gastos del mes
2. Ir a la página de Administración
3. Seleccionar "Importar Gastos"
4. Subir el archivo CSV
5. Los gastos estarán disponibles en la página de Finanzas 