FROM node:erbium-alpine3.14 as build

WORKDIR /app

COPY package.json .

RUN npm i

COPY . .

RUN npm build
COPY --from=build /app/dist ./dist

ENV PORT=3000

EXPOSE ${PORT}
CMD [ "npm", "run", "start:prod" ]