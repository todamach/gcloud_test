FROM node:erbium-alpine3.14 as build

WORKDIR /app

COPY package.json .

RUN npm i

COPY . .

RUN npm build

ENV PORT=3000

EXPOSE ${PORT}
CMD [ "node", "dist/main"]