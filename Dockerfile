# Define base image for build-stage
FROM node:lts-alpine as BUILDER

# Required for turborepo
RUN apk add --no-cache libc6-compat
RUN apk update

# Set working directory
ARG CWD=/opt/soundcore
WORKDIR ${CWD}

# Install yarn and nestjs-cli globally
RUN yarn global add turbo @nestjs/cli typescript

# Copy root package.json
COPY package.json package.json
COPY yarn.lock yarn.lock
COPY turbo.json turbo.json

# Copy all packages into container
WORKDIR ${CWD}
COPY packages/ ./packages
COPY config/ ./config
COPY apps/api/ ./apps/api

# Install package's deps
RUN yarn install
# Build api-packages
RUN yarn build:api

# Build stage completed, begin with new base image
# Remember, copy previously built files into the new image
FROM node:lts-alpine AS DEPLOY

# Set workdir
ARG CWD=/opt/soundcore
WORKDIR ${CWD}

# Create volume to persist instance info
VOLUME [ "/data", "/mnt" ]

# Copy compile output of backend application
COPY --from=BUILDER ${CWD}/apps/api/dist ${CWD}/apps/api

# Copy compile output for packages
COPY --from=BUILDER ${CWD}/packages/bootstrap/dist ${CWD}/packages/bootstrap/dist
COPY --from=BUILDER ${CWD}/packages/bootstrap/package.json ${CWD}/packages/bootstrap/package.json

COPY --from=BUILDER ${CWD}/packages/common/dist ${CWD}/packages/common/dist
COPY --from=BUILDER ${CWD}/packages/common/package.json ${CWD}/packages/common/package.json

COPY --from=BUILDER ${CWD}/packages/constants/dist ${CWD}/packages/constants/dist
COPY --from=BUILDER ${CWD}/packages/constants/package.json ${CWD}/packages/constants/package.json

COPY --from=BUILDER ${CWD}/packages/queue/dist ${CWD}/packages/queue/dist
COPY --from=BUILDER ${CWD}/packages/queue/package.json ${CWD}/packages/queue/package.json

COPY --from=BUILDER ${CWD}/packages/pipelines/dist ${CWD}/packages/pipelines/dist
COPY --from=BUILDER ${CWD}/packages/pipelines/package.json ${CWD}/packages/pipelines/package.json

COPY --from=BUILDER ${CWD}/packages/meilisearch/dist ${CWD}/packages/meilisearch/dist
COPY --from=BUILDER ${CWD}/packages/meilisearch/package.json ${CWD}/packages/meilisearch/package.json

# Copy root package.json because it contains workspace
# configuration to install production deps
COPY package.json package.json

# Set env variables that can be utilized by the backend
# DOCKERIZED is used to register all volumes mounted in the /mnt/ folder
# as a mount for soundcore.
ENV NODE_ENV=production
ENV DOCKERIZED=true

# Install only production deps
RUN yarn install

EXPOSE 3002

ENTRYPOINT ["node", "apps/api/main.js"]