FROM node:16

RUN mkdir -p /webapp
WORKDIR /webapp

COPY package.json package-lock.json /webapp/
RUN npm ci

RUN mkdir node_modules/.cache && chmod -R 777 node_modules/.cache

CMD ["npm", "start"]
