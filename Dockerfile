ARG NODE_IMAGE=node:22.0.0-alpine

FROM $NODE_IMAGE AS base
RUN apk --no-cache add dumb-init  #  Dumb-init is lightweight init system which will properly spawn Node.js runtime process with signals support
RUN mkdir -p /home/node/app && chown node:node /home/node/app
WORKDIR /home/node/app
USER node
RUN mkdir tmp

# only copy package.json so docker can cache this stage, get all dependencies
FROM base AS dependencies
COPY --chown=node:node ./package*.json ./
RUN npm ci
COPY --chown=node:node . .

# from base image, install prod dependencies, copy the build and serve
FROM base AS production
COPY --chown=node:node ./package*.json ./
RUN npm ci --omit=dev
COPY --chown=node:node ./ .
CMD [ "dumb-init", "node", "hopper.js" ]
