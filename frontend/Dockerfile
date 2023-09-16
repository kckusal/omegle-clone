FROM node:18.17.1-alpine

ENV NODE_ENV development

# Set working directory
WORKDIR /app

# Install app dependencies
# COPY  ["yarn.lock", "package.json"]

# Copy source files
# !Maybe Unnecessary in case volume mount in docker-compose will provide all this.
COPY . .

# Install app dependencies
RUN yarn install --frozen-lockfile

EXPOSE 3000

CMD ["yarn", "dev:docker"]
