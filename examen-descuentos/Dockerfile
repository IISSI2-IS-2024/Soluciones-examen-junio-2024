FROM node:18-alpine as base

WORKDIR /src
COPY package*.json /
EXPOSE 3000 9229

ENV WAIT_VERSION 2.7.2
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/$WAIT_VERSION/wait /wait
RUN chmod +x /wait

FROM base as production
ENV NODE_ENV=production
RUN npm ci
COPY . /
CMD ["node", "bin/www"]

FROM base as dev
ENV NODE_ENV=development
COPY . /
RUN npm run copy:env:bash && npm run install:backend
CMD ["nodemon", "bin/www"]