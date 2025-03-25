##  Uso con Docker

###  Construcción y levantamiento de los servicios

Para construir los contenedores e iniciar toda la aplicación (API, servicio de autenticación, base de datos, etc.):

```docker
docker-compose up --build
```

###  Pruebas de cobertura

El proyecto cuenta con pruebas automatizadas separadas para el servicio de autenticación y la API principal. A continuación se presentan los comandos necesarios para ejecutarlas

#### Servición de autenticación

Para realizar las pruebas del servicio de autenticación, primero construya el contenedor específico:

```docker
docker-compose build auth_test_runner
```
Luego, ejecute las pruebas con cobertura:

```docker
docker-compose --profile test up auth_test_runner
```
#### API Principal

Para realizar las pruebas de la API principal, primero construya el contenedor específico:

```docker
docker-compose build test_runner
```

Luego, ejecute las pruebas con cobertura:

```docker
docker-compose --profile test up test_runner
```

### Reinicio completo del entorno

Si desea eliminar todos los contenedores, redes y volúmenes (incluyendo la base de datos), ejecute:

```docker
docker-compose down -v
```
Esto restablecerá completamente el entorno y eliminará todos los datos almacenados hasta el momento.

Autor: Pani
Última actualización: *`25/3/2025`*
