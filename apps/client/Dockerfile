FROM node:20-alpine

WORKDIR /usr/src/app

COPY apps/client/package*.json ./

RUN npm install

COPY apps/client .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
