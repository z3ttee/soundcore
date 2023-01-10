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
In its basic configuration, the docker container creates a default docker volume to store data locally on disk.

Comming soon...

## Concept Art

![Soundcore Home Page](./concept_art/Front%20page.png)

### Tech Stack
