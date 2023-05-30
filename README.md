<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Teslo API

1. Crear el archivo de configuración de base de datos PostgreSQL en la raiz del proyecto ```docker-compose.yaml```
```yaml
version: '3.8'
services:

  postgres:
    image: postgres
    restart: always
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - ./postgres_data:/var/lib/postgresql/data
    ports:
      - 5432:5432
```

2. To start the database, run the following command in the root of the project
```
docker-compose up -d
```
