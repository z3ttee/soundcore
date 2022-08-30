## DISCLAIMER
This project is a work in progress and is far from completion. <br>
The worst experience you will get is by installing and trying to run the project as the
setup is not well documented (yet). This will all be worked out in the future to just
snap your fingers and simply run everything in a docker container (thank you modern technology). <br><br>
When it comes to the application itself, all main features are near completion and ready for beta testing.
As soon as it runs somehow stable, the setup process will be the next big construction site. So stay tuned as this project
is my largest so far!

## Prerequisites
- Redis installation (REQUIRED)
- NodeJS >= 16 (REQUIRED)
- Keycloak 16.1.1 (Included via docker-image)
- MySQL Database (REQUIRED)
- Meilisearch

Other prerequisites will be installed and configured by running `install.sh`.

## Architecture
This project contains some kind of microservice architecture. You may have noticed that for the backend, there are two types of applications: Rest API and a Satellite Node.
Satellite Nodes are applications that's only focus is processing and serving audio files and artwork images. All applications rely on REDIS under the hood to communicate their
online status and network information, so that the main API has info on where to serve audio files and images from.

## Network Configuration
TODO: Bind Address, SSL

## Meilisearch installation
```
bash -c "$(curl -sL https://raw.githubusercontent.com/TSAlliance/alliance-soundcore/main/setups/meilisearch.sh)"
```

## Notes when using Nginx as Proxy
Please do not forget to support websocket connections via proxied nginx connections.
This is done by adding these lines inside a location block (where `proxy_pass` is called):
```
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

Also Keycloak needs to be configured when using with Docker behind nginx proxy. Run following docker run command:
docker run -p 8888:8080 --env KEYCLOAK_USER="..." --env KEYCLOAK_PASSWORD="..." --env PROXY_ADDRESS_FORWARDING=true --restart=always jboss/keycloak

## Fix common issues
#### CSP
Sometimes it may occur that the frontend won't load and the console will print a CSP related error. In that case please check the 
Content-Security-Policy Header in your keycloak realm's setting. (Under Realm Settings > Security Defenses).
Make sure that the content matches the domains you are using. An example could look like this (to include subdomains):
```
frame-src *.tsalliance.eu; frame-ancestors *.tsalliance.eu ; object-src 'none';
```