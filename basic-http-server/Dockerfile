FROM arm64v8/node
COPY app.js /app/
COPY package*.json /app/

WORKDIR "/app"

RUN npm install

CMD ["node", "app.js"]
