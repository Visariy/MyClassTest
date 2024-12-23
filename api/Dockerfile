FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

COPY tsconfig.json ./

COPY . .

RUN apt-get update && apt-get install -y net-tools

RUN npm ci

RUN npm run build

CMD ["npm", "run", "start"]

