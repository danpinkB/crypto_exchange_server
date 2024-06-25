FROM node:19-alpine AS builder

WORKDIR .

COPY package*.json ./

COPY ./src ./src
COPY ./prisma ./prisma
COPY ./external ./external
COPY ./tsconfig.json ./tsconfig.json
RUN npm install pnpm -g
RUN npm install
RUN npm run docker_build

FROM node:19-alpine

WORKDIR .

COPY package*.json ./
COPY ./static ./static
COPY ./external ./external
COPY --from=builder ./dist /dist
COPY --from=builder ./node_modules ./node_modules