FROM node:16

WORKDIR /src

COPY package*.json ./

RUN npm ci --production

COPY . .

EXPOSE 3000
CMD [ "node", "index.js" ]
