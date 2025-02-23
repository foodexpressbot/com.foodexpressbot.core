FROM node:20
ARG GITHUB_READ_TOKEN="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"

WORKDIR /foodexpressbot/com.foodexpressbot.api
COPY package*.json ./

RUN echo -e "machine github.com\n  login $GITHUB_READ_TOKEN" > ~/.netrc
#RUN npm install --only=production --force \
#  && npm cache clean --force
RUN npm install
RUN rm ~/.netrc

#RUN npm install

COPY . .

RUN npm run build

EXPOSE 3010

CMD ["npm", "start"]
