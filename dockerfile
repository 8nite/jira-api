FROM mhart/alpine-node
RUN apk add --update git && \
  rm -rf /tmp/* /var/cache/apk/*
RUN npm install -g yarn && \
  npm install -g npm-run-all
RUN mkdir /app && \
  cd /app && \
  git clone https://0206a657b317ae155248d53becfedaccc14c0859@github.com/herberttung/jira-api.git && \
  cd /app/jira-api && \
  yarn install
WORKDIR /app/jira-api/
EXPOSE 3000
COPY .env .
CMD ["yarn", "start"]