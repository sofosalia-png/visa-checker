FROM mcr.microsoft.com/playwright:v1.59.0-jammy

WORKDIR /app
COPY . .

RUN npm install

CMD ["node", "check.js"]
