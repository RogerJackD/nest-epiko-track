<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Logica Backend enfocado en un sistema de gestion y seguimiento de tareas estilo Scrumban

````
typeorm - docker - ApiRest - Postgresql - passport - class validator

````

## PASOS PARA EJECUTAR BACKEND
requisitos: docker , docker-desktop, node(v22)

```bash
$ npm install
```

```variables de entorno
renonbrar el archivo .env.template a .env
```

ejecutar archivo docker-compose.yml:
````
docker-compose up -d
````
Para tener construida la esctructura de la base de datos activar "synchronize: true" en el archivo app.module.ts - solo en desarrollo  
--ubicación de archivo src/app.module.ts
````
synchronize: false 
````
#ejecutar backend:
las migraciones o la estructura de la database se ejecutaran automaticamente:
````
npm run start:dev
````

#Ingresar a su gestor de base de datos:


#ejecutar consultas SQL: datos necesario para el funcionamiento:
datos tabla area:
````
INSERT INTO "public"."area" ("id", "name", "descripcion") VALUES
(1, 'Tecnologia', 'area de tecnologia'),
(2, 'Administracion', 'area de administracion'),
(3, 'Marketing', 'area de marketing'),
(4, 'Recursos Humanos', 'area de recursos Humanos');
````

datos tabla role:
````
INSERT INTO "public"."role" ("id", "name") VALUES
(1, 'user'),
(2, 'admin'),
(3, 'manager'),
(4, 'super-admin');
````

datos tabla task_status:
````
INSERT INTO "public"."task_status" ("id", "title", "description", "sort_order") VALUES
(1, 'Por Hacer', 'tareas que estan en espera a realizarse', 1),
(2, 'En Proceso', 'tareas que ya se estan realizando', 2),
(3, 'En Revision', 'tareas que estan siendo revisados', 3),
(4, 'Completado', 'tareas que estan pasaron el filtro de revision y son aprobados', 4);
````
datos de prueba crear usuarios(con 4 roles diferentes):
````
INSERT INTO "public"."user" ("id", "firstName", "lastName", "age", "email", "createdAt", "updatedAt", "contractDate", "password", "status", "job_title", "phoneNumber", "address", "roleId", "fullName_normalized", "areaId") VALUES
('9c973e91-dd95-44d0-8551-7c9eeee330b0', 'user', 'test', 34, 'user@gmail.com', '2025-11-19 23:00:58.469688', '2025-12-05 01:21:02.689247', '2025-06-12', 'Password123', 't', 'dev frontend', '980124453', 'Peru', 1, 'undefined undefined', 1),
('af9d1b46-3ec1-4d77-9829-704a362051f9', 'super admin', 'test', 22, 'superadmin@gmail.com', '2025-11-09 01:43:23.630453', '2025-11-15 22:20:44.187386', '2025-06-12', 'Password123', 't', 'dev backend', '980104900', 'Tacna', 4, 'roger_jack', 2),
('af9d1b46-3ec1-4d77-9829-704a362058f0', 'admin', 'test', 22, 'admin@gmail.com', '2025-11-09 01:43:23.630453', '2025-11-15 22:20:44.187386', '2025-06-12', 'Password123', 't', 'adminstrador', '980104953', 'Tacna', 2, 'admin_test', 2),
('af9d1b46-3ec1-4d77-9829-704a362058f2', 'manager', 'test', 22, 'manager@gmail.com', '2025-11-09 01:43:23.630453', '2025-11-15 22:20:44.187386', '2025-06-12', 'Password123', 't', 'proyect manager', '980104918', 'Tacna', 3, 'roger_roger', 1);
````

## PUERTO API:

```
3030
base URL: http://localhost:3030/api
ejemplo POST create users: http://localhost:3030/api/auth/users
```
<img width="404" height="371" alt="image" src="https://github.com/user-attachments/assets/0fead9f6-1cd5-4e8e-9f49-a7493734058a" />




