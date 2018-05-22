FROM node:alpine
ADD . /home/app
WORKDIR /home/app
RUN npm install
EXPOSE 8080
CMD ["node", "index.js"]