---
title: React table
pubDate: 2024-11-10T16:00:00.000Z
description: Data tables
---

In September 2020, I started work with EM Services. With 5 teammates, 1 whom was comfortable writing in Javascript and 4 who wanted to learn on this project. The project ended on December 2020 after development and meetings for just over 12 weeks.

Ka Yi, Joel, Daniel, Raymond, Yee Qing.

![](https://res.cloudinary.com/dbifqlg1w/image/upload/v1731333811/posts/file_kwnmgb.png)

We built two client-server systems to support the company's internal and external project management processes. Frontend is in React libraries while backend serves an Express.js restful API with a connection to postgresql. React was a natural choice to build modern components, especially coming from Java Enterprise, Bootstrap UI coursework.

Here is a mock up of one type of form, and the interface of another type of form.![](https://res.cloudinary.com/dbifqlg1w/image/upload/v1731140374/posts/file_salbnu.png)Above is the internal system of type-A forms.

![](https://res.cloudinary.com/dbifqlg1w/image/upload/v1731140396/posts/file_xb4rb1.png)Above is the external system of type-R forms.

A fair amount of sections of data grouped by "project items" such as "Preliminary work and handling" and "excavation work". Each section is accompanied by the price, weights and progress of work.

![](https://res.cloudinary.com/dbifqlg1w/image/upload/v1731140379/posts/file_ejwb1t.jpg)

```dockerfile
version: '3.8'
services:
  # Database service
  postgres:
    image: postgres:latest
    environment:
      POSTGRES_DB: emservices
      POSTGRES_USER: h
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./emservices-internal/server/scripts:/docker-entrypoint-initdb.d/
    networks:
      - mynetwork
    expose:
      - 5432

  # Internal server
  internal_server:
    build:
      context: ./emservices-internal/server
    ports:
      - "5000:5000"
    depends_on:
      - postgres
    networks:
      - mynetwork
    volumes:
      - ./emservices-internal/server:/app
      - /app/node_modules

  # Internal client
  internal_client:
    build:
      context: ./emservices-internal/client
    ports:
      - "3000:3000"
    depends_on:
      - internal_server
    networks:
      - mynetwork
    volumes:
      - ./emservices-internal/client:/app
      - /app/node_modules

  # External server
  external_server:
    build:
      context: ./emservices-external/server
    ports:
      - "5001:5001"
    depends_on:
      - postgres
    networks:
      - mynetwork
    volumes:
      - ./emservices-external/server:/app
      - /app/node_modules

  # External client
  external_client:
    build:
      context: ./emservices-external/client
    ports:
      - "3001:3001"
    depends_on:
      - external_server
    networks:
      - mynetwork
    volumes:
      - ./emservices-external/client:/app
      - /app/node_modules

networks:
  mynetwork:
    driver: bridge

volumes:
  postgres_data:


```

```dockerfile
FROM --platform = linux / amd64 node: 12

# Install nodemon and node - pre - gyp globally
RUN npm install - g nodemon node - pre - gyp 
RUN npm rebuild bcrypt--build - from - source

# Set the working directory
WORKDIR / app

# Copy the package files and install dependencies
COPY package *.json./
  RUN npm install

# Copy the rest of the application code
COPY. .

# Expose port for internal server
EXPOSE 5000

# Command to run the server
CMD["npm", "start"]


```
