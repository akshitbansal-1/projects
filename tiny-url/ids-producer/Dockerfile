FROM node:16

WORKDIR /src

COPY package*.json ./

RUN npm ci --production

COPY . .

CMD [ "node", "index.js" ]
