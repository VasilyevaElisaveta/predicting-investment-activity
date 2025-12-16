FROM node:24

WORKDIR /frontend

COPY package.json vite.config.js  /frontend/

RUN npm install

COPY . /frontend/

RUN npm run build

CMD ["sleep", "1m"]