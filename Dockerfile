# Use multi-stage build
FROM node:alpine

ENV NODE_VERSION 20.11.0

WORKDIR /usr/app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Set NODE_ENV to production before running npm install
ENV NODE_ENV production

# Install bash
RUN apk add --no-cache bash

RUN npm cache clean --force
RUN npm install

# Copy the rest of the application code
COPY ./ .

ENV NODE_PORT 3000
ENV NODE_ENV production

EXPOSE $NODE_PORT

CMD [ "npm", "start" ]