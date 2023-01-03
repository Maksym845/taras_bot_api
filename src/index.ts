import express from 'express';
import { Server } from 'socket.io';
import * as http from "http";
import { readFileSync } from 'fs';
import { promises as fsPromises } from 'fs';
import { join } from 'path';

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://192.168.0.113:3000",
    methods: ["GET", "POST"]
  }
});

const messages = readFileSync(join(__dirname, 'api/users.json'), 'utf-8');

// console.log(JSON.parse(messages));

async function asyncWriteFile(filename: string, data: any) {
  try {
    const contentFromDb = await fsPromises.readFile(
      join(__dirname, filename),
      'utf-8',
    );

    const tempData = JSON.parse(contentFromDb);

    if (tempData.length !== 0) {
      data = {
        id: tempData[tempData.length - 1].id + 1,
        ...data,
      };
    } else {
      data = {
        id: 0,
        ...data,
      };
    }

    tempData.push(data);

    await fsPromises.writeFile(join(__dirname, filename), JSON.stringify(tempData), {
      flag: 'w',
    });

    // const contents = await fsPromises.readFile(
    //   join(__dirname, filename),
    //   'utf-8',
    // );
    //
    // return contents;
  } catch (err) {
    console.log(err);
    return 'Something went wrong';
  }
}

app.get('/', (req, res) => {
  res.send('hello World!');
  res.end();
});

io.on('connection', socket => {
  socket.emit('messages', {greeting: 'Hello blya'});

  socket.on('greeting', data => {
    console.log(data);
  });

  socket.on('messageWasSent', async (data) => {
    await asyncWriteFile('api/users.json', data);

    const contentFromDb = await fsPromises.readFile(
      join(__dirname, 'api/users.json'),
      'utf-8',
    );

    io.sockets.emit('messageWasReceived', contentFromDb);
  });
});

server.listen(5000);


console.log('server http is running on 5000');