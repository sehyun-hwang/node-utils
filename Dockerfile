FROM node:alpine

WORKDIR /mnt

COPY utils/package.json utils/
COPY package.json pnpm-*.yaml ./
RUN corepack enable pnpm \
    && pnpm i --force --frozen-lockfile \
    && pnpm store prune

COPY . .

ENV AWS_REGION=ap-northeast-2
CMD ["node", "Server.js"]
