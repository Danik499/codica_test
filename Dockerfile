FROM node:16.19.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

COPY /dist /dist

CMD ["npm", "run", "start:dev"]