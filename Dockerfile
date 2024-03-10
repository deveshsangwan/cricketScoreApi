FROM node:alpine

ENV NODE_VERSION 18.16.0

WORKDIR /usr/app
COPY ./ /usr/app

RUN apk --no-cache add bash
RUN apk --no-cache --virtual build-dependencies add
RUN npm cache clean --force
RUN npm install
RUN apk del build-dependencies

ENV NODE_PORT 3000
ENV NODE_ENV production

EXPOSE $NODE_PORT

CMD [ "npm", "start" ]