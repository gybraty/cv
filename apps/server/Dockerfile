FROM node:20-alpine

WORKDIR /usr/src/app

COPY apps/server/package*.json ./

RUN npm install

COPY apps/server .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
