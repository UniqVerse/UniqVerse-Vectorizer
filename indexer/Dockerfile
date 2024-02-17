FROM node:20
WORKDIR /app
COPY package.json /app/package.json
RUN npm install
COPY . .
CMD npm start
