FROM node:18.17.1-alpine

WORKDIR /usr/src/mark-login

COPY ./package.json ./

RUN npm install
COPY . .

EXPOSE 10000

CMD ["npm","run","start"]