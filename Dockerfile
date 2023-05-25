FROM node:alpine

ENV NODE_VERSION 18.16.0

RUN apk --no-cache add bash \
    && apk --no-cache --virtual build-dependencies add \
    && npm cache clean --force \	
    && npm install \
    && npm install -g nodemon \
    && apk del build-dependencies

ENV NODE_PORT 3000

EXPOSE $NODE_PORT

CMD [ "npm", "start" ]