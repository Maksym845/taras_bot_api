"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const https = __importStar(require("https"));
const fs_1 = require("fs");
const fs_2 = require("fs");
const path_1 = require("path");
const fs = __importStar(require("fs"));
const app = (0, express_1.default)();
const options = {
    key: fs.readFileSync((0, path_1.join)(__dirname, 'key.pem')),
    cert: fs.readFileSync((0, path_1.join)(__dirname, 'cert.pem'))
};
const server = https.createServer(options, app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "https://maksym845.github.io",
        methods: ["GET", "POST"]
    }
});
const messages = (0, fs_1.readFileSync)((0, path_1.join)(__dirname, 'api/users.json'), 'utf-8');
// console.log(JSON.parse(messages));
async function asyncWriteFile(filename, data) {
    try {
        const contentFromDb = await fs_2.promises.readFile((0, path_1.join)(__dirname, filename), 'utf-8');
        const tempData = JSON.parse(contentFromDb);
        if (tempData.length !== 0) {
            data = {
                id: tempData[tempData.length - 1].id + 1,
                ...data,
            };
        }
        else {
            data = {
                id: 0,
                ...data,
            };
        }
        tempData.push(data);
        await fs_2.promises.writeFile((0, path_1.join)(__dirname, filename), JSON.stringify(tempData), {
            flag: 'w',
        });
        // const contents = await fsPromises.readFile(
        //   join(__dirname, filename),
        //   'utf-8',
        // );
        //
        // return contents;
    }
    catch (err) {
        console.log(err);
        return 'Something went wrong';
    }
}
app.get('/', (req, res) => {
    res.send('hello World!');
    res.end();
});
io.on('connection', socket => {
    socket.emit('messages', { greeting: 'Hello blya' });
    socket.on('greeting', data => {
        console.log(data);
    });
    socket.on('messageWasSent', async (data) => {
        await asyncWriteFile('api/users.json', data);
        const contentFromDb = await fs_2.promises.readFile((0, path_1.join)(__dirname, 'api/users.json'), 'utf-8');
        io.sockets.emit('messageWasReceived', contentFromDb);
    });
});
server.listen(8000);
console.log('server http is running on 8000');
//# sourceMappingURL=index.js.map