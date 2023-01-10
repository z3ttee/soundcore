# Soundcore Monorepo 

This monorepo contains all project files to build the Soundcore application.

## Apps
- [Soundcore Api](/apps/api/README.md)
- [Soundcore App](/apps/app/README.md)

## Packages
- [@soundcore/bootstrap](/packages/bootstrap/README.md)
- [@soundcore/constants](/packages/constants/README.md)
- [@soundcore/common](/packages/common/README.md)
- [@soundcore/queue](/packages/queue/README.md)
- [@soundcore/cdk](/packages/soundcore-cdk/README.md)
- [@soundcore/sdk](/packages/soundcore-sdk/README.md)
- [@soundcore/ngx](/packages/soundcore-ngx/README.md)
- [@soundcore/sso](/packages/soundcore-sso/README.md)

## Status
[![Soundcore Image Build](https://github.com/z3ttee/soundcore/actions/workflows/docker-image.yml/badge.svg)](https://github.com/z3ttee/soundcore/actions/workflows/docker-image.yml)

## Requirements
Before using the application, there are some things to consider.
For running the service, you would need to have a running **MariaDB** (not MySQL, as the service relies on MariaDB specific features) installed on your system.
Please see the full list of required applications:
- MariaDB
- Meilisearch >=0.29.0
- Keycloak >= 20.0.0

Keycloak is used for authentication. Later updates will implement support for more authentication providers, such as social login and basic username/password authentication.

## Installation
An official docker image is automatically build upon new releases on GitHub. You can use that image instead of building
the project yourself. Please follow these instructions for quick setup:

```bash
# Download the image to your local storage
docker pull zettee/soundcore

# Running the container named "soundcore" with port "3002" exposed to "3000"
docker run --name soundcore -p "3000:3002" zettee/soundcore
```

This is all that needs to be done. After the setup was successful, the API service should be available in your browser via ``http://localhost:3000``.
Currently, the application does not support SSL encryption (will be added in future updates). Therefore it is advised to make the application available only via a reverse proxy like `nginx`.

### API Service Configuration
In its basic configuration, the docker container creates a default docker volume to store data locally on disk. This is not ideal and you may
want to configure the service so it can actually connect to a database. There are two possible solutions for configuring the application. One is to provide
environment variables directly when executing the `docker run` command or you can use the `docker-compose.yml` file explained in the following lines:

```YAML
version: '3.9'
services:
  database:
    image: mariadb
    restart: always
    environment:
      MARIADB_ROOT_PASSWORD: root
    ports:
      - "3306:3306"
    # Make sure the containers are all in the same network to be available  
    networks:
      - soundcore_prod

  phpmyadmin:
    image: phpmyadmin
    restart: always
    depends_on:
      - database
    ports:
      - "8080:80"
    environment:
      - MYSQL_ROOT_PASSWORD=root
      - PMA_HOST=database
    # Make sure the containers are all in the same network to be available 
    networks:
      - soundcore_prod

  meilisearch:
    image: getmeili/meilisearch
    restart: always
    ports:
      - "7700:7700"
    environment:
      # Set master key. Please see meilisearch documentation for reference
      - MEILI_MASTER_KEY=super_secret_master_key
    entrypoint: ["meilisearch", "--env=production"]
    # Make sure the containers are all in the same network to be available 
    networks:
      - soundcore_prod

  soundcore:
    image: soundcore:latest
    ports:
      - "3002:3002"
    depends_on:
      # Start soundcore after the database has started
      - database
    environment:
      # Configure the connection options to the MariaDB instance
      - DB_HOST=database
      - DB_USER=root
      - DB_PASS=root
      - DB_NAME=soundcore
      # Configure options for reaching the keycloak instance
      - OIDC_ISSUER=http://localhost/realms/example
      - OIDC_CLIENT_ID=<client_id>
      - OIDC_CLIENT_SECRET=<client_secret>
      # Define connection options for meilisearch
      - MEILISEARCH_HOST=meilisearch # If you just copy/paste this file, keep this as it refers to the meilisearch service name and is used as DNS name
      - MEILISEARCH_PORT=7700
      - MEILISEARCH_KEY=<super_secret_master_key>
    # Make sure the containers are all in the same network to be available
    networks:
      - soundcore_prod
    volumes:
      # Mount the data volume, so you can actually edit artworks and files
      # Before the : is the path on your system. After the : is the path inside the container
      - /home/soundcore:/data
      # You can also mount additional directories just for your music files.
      # Note: All these must be mounted inside /mnt/<folder>. Please read more in the 'Setup Mounts' section
      - /media/music:/mnt/music01
      - /media/more-music:/mnt/music02

networks:
  soundcore_prod:
```

Comming soon...

## Concept Art

![Soundcore Home Page](./concept_art/Front%20page.png)

### Tech Stack
