# Define environment
FROM node:18-alpine

ARG CWD=/opt/soundcore/api

# Required for turborepo
RUN apk add --no-cache libc6-compat
RUN apk update

# Set working directory
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

# Set env
ENV NODE_ENV=production
ENV DOCKERIZED=true

# Remove installed node_modules from all subfolders
RUN find . -type d -name node_modules -prune -exec rm -rf {} \;
# Delete source files needed for compilation
RUN find . -type d -name src -prune -exec rm -rf {} \;

# Delete bundle helpers used whilst compiling
RUN rm -rf apps/api/bundle

# Delete files of packages that were needed for bundling
RUN rm -rf config/

RUN yarn install --production

ENTRYPOINT ["node", "apps/api/dist/main.js"]