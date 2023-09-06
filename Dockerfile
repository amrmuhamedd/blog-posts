FROM node:18.16.0

WORKDIR /app

COPY package*.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

EXPOSE 3000


CMD ["node", "dist/app.js"]
