---
title: React table
pubDate: 2024-11-10T16:00:00.000Z
description: data tables
---

![](https://res.cloudinary.com/dbifqlg1w/image/upload/v1731333811/posts/file_kwnmgb.png)![](https://res.cloudinary.com/dbifqlg1w/image/upload/v1731140374/posts/file_salbnu.png)![](https://res.cloudinary.com/dbifqlg1w/image/upload/v1731140396/posts/file_xb4rb1.png)![](https://res.cloudinary.com/dbifqlg1w/image/upload/v1731140379/posts/file_ejwb1t.jpg)

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
