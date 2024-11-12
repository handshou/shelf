---
title: Data tables
pubDate: 2024-11-10T16:00:00.000Z
description: TanStack react table
---

In September 2020, I started work with EM Services. With 5 teammates, 1 whom was comfortable writing in Javascript and 4 who wanted to learn on this project. The project ended on December 2020 after development and meetings for just over 12 weeks.

Ka Yi, Joel, Daniel, Raymond, Yee Qing.

![](https://res.cloudinary.com/dbifqlg1w/image/upload/v1731333811/posts/file_kwnmgb.png)

## Understanding business needs: Many types of forms

Project management documents are sometimes in paper form, filed in binders. 

The first step of data transformation has happened and documents have been saved in Excel spreadsheets (exportable as csv). 

The second step is us. Centralisation of data in databases to:

* perform various calculations
* project information at a glance such as number of on-going projects
* total cost incurred
* pending work

We want to consolidate all project data for product dashboard projection.

### Challenge 1: Data adheres to project types

Data is scattered in different formats, each project has its own type of form. One form may have section headers and columns of items, and another form may opt for two nested layers of section headers (for reasons such as separation by Singapore districts) and include different column headers for its items.

### Challenge 2: External vendors have non-standard forms

One reason for the mini explosion of form types is the work with multiple external teams, and no requirement to standardise data formats. This means flexibility of our data ingestion is important, which will affect database design, trade-offs. 

### Database design

Two approaches: A, B. 

A, Model the database to separate project types - Project 1 and 2 has Class X and Class Y.

B, Model the project types to fit a generic flexible class, Project 3 and 4 have the same Class. But the differences in Project 3 and 4 are built into the frontend. There will be additional layers of complexity on the frontend to match differences in Project 3 and Project 4.

### Tradeoff

Approach A will have a harder time performing calculations, trading complexity in calculations for a simpler way for user data input (just upload existing formats).

Approach B is flipping the approach, using frontend to accomodate similar data input styles, but standardising how data is stored across all project types. This means shifting development from backend complexity to the frontend designs, or the middle layer handling data will grow in complexity with data transformations.

### We chose Approach B

## Big picture

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
