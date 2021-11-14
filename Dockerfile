FROM node:lts-alpine

WORKDIR /api

COPY package*.json ./

COPY . .

RUN npm install --only=production

RUN npm install pm2 -g

USER node

CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]

EXPOSE 8000