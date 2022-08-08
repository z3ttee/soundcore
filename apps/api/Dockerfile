FROM node:16.15-alpine
LABEL maintainer="Cedric Zitzmann <cedric.zitzmann@gmail.com>"
LABEL repository="https://github.com/TSAlliance/alliance-soundcore"

# Create app root directory
ARG DIR=/opt/soundcore/api
RUN mkdir -p ${DIR}
WORKDIR ${DIR}

# Copy required files for build steps
COPY dist ${DIR}

# Install deps
RUN npm install --location=global @nestjs/cli
RUN npm install

# Expose port and set 
# script to execute upon startup
EXPOSE 3001/tcp
ENTRYPOINT [ "node", "main.js" ]