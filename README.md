# DEMPS app

## Recomendado

Para acceder a todas las funcionalidades del sistema, se recomienda montar un contenedor en Docker, clonando la imagen desde el repositorio de [DockerHub](https://hub.docker.com/repository/docker/arielsalgado/demps-next/general) y luego abrir el enlace [http://localhost:4173](http://localhost:4173) desde un navegador web.

## Instalación independiente

1. Instalar las dependencias:

   ```
   pnpm install --frozen-lockfile
   ```

2. Generar variables de entorno:

   ```
   pnpm svelte-kit sync
   ```

3. Generar código para producción:

   ```
   pnpm build
   ```

4. Iniciar la vista del proyecto:

   ```
   pnpm preview
   ```

5. Acceda a la aplicación en su navegador:

   Abrir [http://localhost:4173](http://localhost:4173) desde un navegador web.
