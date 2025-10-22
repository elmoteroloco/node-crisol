# Backend para Proyecto E-commerce - Crisol

Este repositorio contiene el código fuente del servidor backend, desarrollado en Node.js, que da servicio a la aplicación de e-commerce [tpf-crisol](https://github.com/elmoteroloco/tpf-crisol).

**Importante:** Este proyecto tiene una finalidad puramente académica y de demostración. No representa una entidad comercial real.

---

## Tecnologías Utilizadas

*   **Node.js:** Entorno de ejecución para JavaScript del lado del servidor.
*   **Express.js:** Framework minimalista para la creación de la API RESTful y la gestión de rutas.
*   **Firebase Admin SDK:** Para la integración con los servicios de Google Firebase:
    *   **Firestore:** Como base de datos NoSQL para la persistencia de productos y categorías.
    *   **Authentication:** Para la verificación de tokens de ID y la validación de roles de administrador a través de *custom claims*.
*   **CORS:** Middleware para habilitar y configurar el Intercambio de Recursos de Origen Cruzado, permitiendo que el frontend (hosteado en Vercel) se comunique con este servidor.
*   **Dotenv:** Para la gestión de variables de entorno, separando la configuración del código.

## Características Principales

*   **API RESTful:** Endpoints para operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre las colecciones de `productos` y `categorías`.
*   **Rutas Protegidas:** Middleware para verificar la validez del token de Firebase del usuario y asegurar que posea el rol de `admin` para acceder a los endpoints de escritura (POST, PUT, DELETE).
*   **Modo Simulación (Dry Run):** Una variable de entorno (`SIMULATION_MODE`) permite ejecutar el backend en un modo "solo lectura" para usuarios administradores que no sean `superAdmin`. En este modo, las peticiones de escritura son interceptadas y devuelven una respuesta exitosa simulada, sin modificar la base de datos. Esto es ideal para demostraciones y revisiones.
*   **Configuración para Despliegue:** El servidor está preparado para ser desplegado en plataformas como Render, manejando las credenciales de Firebase a través de variables de entorno.

## Endpoints de la API

*   `GET /`: Endpoint de prueba para verificar que el servidor está en línea.
*   `GET /products`: Obtiene la lista completa de productos.
*   `GET /categories`: Obtiene la lista completa de categorías.
*   `POST /products`: (Admin) Agrega un nuevo producto.
*   `PUT /products/:id`: (Admin) Actualiza un producto existente.
*   `DELETE /products/:id`: (Admin) Elimina un producto.
*   `POST /categories`: (Admin) Agrega una nueva categoría.
*   `DELETE /categories/:name`: (Admin) Elimina una categoría por su nombre.

---
---

# Backend for E-commerce Project - Crisol

This repository contains the source code for the backend server, developed in Node.js, which serves the tpf-crisol e-commerce application.

**Important:** This project is for academic and demonstration purposes only. It does not represent a real commercial entity.

---

## Technologies Used

*   **Node.js:** JavaScript runtime environment for the server-side.
*   **Express.js:** Minimalist framework for creating the RESTful API and managing routes.
*   **Firebase Admin SDK:** For integration with Google Firebase services:
    *   **Firestore:** As the NoSQL database for persisting products and categories.
    *   **Authentication:** For verifying ID tokens and validating administrator roles through custom claims.
*   **CORS:** Middleware to enable and configure Cross-Origin Resource Sharing, allowing the frontend (hosted on Vercel) to communicate with this server.
*   **Dotenv:** For managing environment variables, separating configuration from code.

## Main Features

*   **RESTful API:** Endpoints for CRUD (Create, Read, Update, Delete) operations on the `products` and `categories` collections.
*   **Protected Routes:** Middleware to verify the validity of the user's Firebase token and ensure they have the `admin` role to access write endpoints (POST, PUT, DELETE).
*   **Simulation Mode (Dry Run):** An environment variable (`SIMULATION_MODE`) allows the backend to run in a "read-only" mode for admin users who are not `superAdmin`. In this mode, write requests are intercepted and return a simulated success response without modifying the database. This is ideal for demonstrations and reviews.
*   **Deployment-Ready Configuration:** The server is prepared for deployment on platforms like Render, handling Firebase credentials through environment variables.

## API Endpoints

*   `GET /`: Health check endpoint to verify that the server is online.
*   `GET /products`: Retrieves the complete list of products.
*   `GET /categories`: Retrieves the complete list of categories.
*   `POST /products`: (Admin) Adds a new product.
*   `PUT /products/:id`: (Admin) Updates an existing product.
*   `DELETE /products/:id`: (Admin) Deletes a product.
*   `POST /categories`: (Admin) Adds a new category.
*   `DELETE /categories/:name`: (Admin) Deletes a category by its name.
