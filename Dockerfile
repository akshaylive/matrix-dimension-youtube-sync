FROM mhart/alpine-node:14

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json yarn.lock ./

RUN yarn install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

RUN yarn build

FROM mhart/alpine-node:14

WORKDIR /app
COPY --from=0 /app .

EXPOSE 7070
CMD [ "yarn", "start" ]
