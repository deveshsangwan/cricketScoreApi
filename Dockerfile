FROM alpine:3.16

ENV NODE_VERSION 18.16.0

RUN apk --no-cache add bash \
    ghostscript \
    qpdf \
    && apk --no-cache --virtual build-dependencies add \
    python \
    make \
    g++ \
    && npm cache clean --force \	
    && npm install \
    && npm install -g nodemon \
    && apk del build-dependencies

ENV NODE_PORT 3000

EXPOSE $NODE_PORT

CMD [ "npm", "start" ]