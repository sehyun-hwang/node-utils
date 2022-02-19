FROM node:alpine

WORKDIR /mnt

COPY utils/package.json utils/
COPY package.json .

RUN yarn

COPY . .

CMD ["node", "Server.js"]