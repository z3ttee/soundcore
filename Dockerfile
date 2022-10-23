# Define environment
FROM node:alpine AS builder

ARG CWD=/opt/soundcore/api

RUN apk add --no-cache libc6-compat
RUN apk update

# Set working directory
WORKDIR ${CWD}



# Set yarn version to use yarn2
# RUN yarn set version berry

# Install yarn and nestjs-cli globally
RUN yarn global add turbo @nestjs/cli typescript

# Copy root package.json
COPY package.json package.json
COPY yarn.lock yarn.lock
# COPY .yarnrc.yml .yarnrc.yml
COPY turbo.json turbo.json

# Copy yarn2
# COPY .yarn .yarn

# RUN turbo prune --docker

# Copy all packages into container
WORKDIR ${CWD}
COPY packages/ ./packages
COPY config/ ./config
COPY apps/api/ ./apps/api

# Install package's deps
RUN yarn install
# Build api-packages
RUN yarn build:api

# Set env
# ENV NODE_ENV=production
ENV DOCKERIZED=true

# Install deps, but only production
# RUN yarn install

ENTRYPOINT ["node", "apps/api/dist/main.js"]