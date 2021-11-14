FROM node:lts-alpine

WORKDIR /api

COPY package*.json ./

COPY . .

RUN npm install --only=production

RUN npm install pm2 -g

USER node

CMD [ "pm2-runtime", "npm", "--", "start" ]

EXPOSE 8000