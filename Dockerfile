FROM node:alpine

WORKDIR /app/sgc_project

COPY package.json .

RUN npm install

COPY . .

RUN npm run migrate

EXPOSE 8888

CMD [ "npm", "run", "start" ]