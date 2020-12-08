FROM oraclelinux:7-slim

RUN  yum -y install oracle-release-el7 oracle-nodejs-release-el7 && \
     yum-config-manager --disable ol7_developer_EPEL && \
     yum -y install oracle-instantclient19.3-basiclite nodejs && \
     rm -rf /var/cache/yum
RUN yum -y install git && \
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
CMD ["npm", "start"]