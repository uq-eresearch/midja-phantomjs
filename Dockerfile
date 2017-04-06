FROM docker.io/node:onbuild

RUN npm install

EXPOSE 3333
CMD npm start
