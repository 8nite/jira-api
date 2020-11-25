FROM mhart/alpine-node
RUN apk add --update git && \
  rm -rf /tmp/* /var/cache/apk/*
RUN npm install -g yarn && \
  npm install -g npm-run-all && \
  npm install -g forever
RUN mkdir /app && \
  cd /app && \
  git clone https://github.com/herberttung/jira-api.git
RUN cd /app/jira-api && \
  git checkout master
RUN cd /app/jira-api && \
  yarn install && \
  yarn build
WORKDIR /app/jira-api/
EXPOSE 0.0.0.0:3000:3000
ENV LD_LIBRARY_PATH /opt/oracle/instantclient_19_6 && node ./dist-server/app
CMD ["npm", "start"]