import { Server } from 'socket.io';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// Module-level variables
let io;
let server;
const connectedAgents = {};

// Initialize the server
export function createMindServer(port = 8081) {
    return new Promise((resolve) => {
        const app = express();
        server = http.createServer(app);
        io = new Server(server);

        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        app.use(express.static(path.join(__dirname, 'public')));

        io.on('connection', (socket) => {
            console.log('Client connected');
            socket.emit('agents-update', Object.keys(connectedAgents));

            socket.on('register-agent', (agentName) => {
                console.log('Agent registered:', agentName);
                connectedAgents[agentName] = socket;
                io.emit('agents-update', Object.keys(connectedAgents));
            });

            socket.on('agent-end-goal', (agentName) => 
                {
                    console.log('Agent ended goal:', agentName);
                    //broadcast to all agents that the agent has ended its goal
                    socket.broadcast.emit('agent-end-goal', agentName);
                }
            );

            socket.on('disconnect', () => {
                console.log('Client disconnected');
                delete connectedAgents[socket.id];
                io.emit('agents-update', Object.keys(connectedAgents));
            });

            socket.on('server-message', (message) => {
                //console.log('Received server message:', message);
                //socket.broadcast.emit('server-message', message);
            });
        });

        server.listen(port, 'localhost', () => {
            console.log(`MindServer running on port ${port}`);
            resolve(server); // Server is ready
        });
    });
}

// Optional: export these if you need access to them from other files
export const getIO = () => io;
export const getServer = () => server;
export const getConnectedAgents = () => connectedAgents; 