const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));
app.get('/health', (req, res) => res.json({ ok: true }));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


let sessions = {};
function makeCode(){ const c='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s=''; for(let i=0;i<4;i++) s+=c[Math.floor(Math.random()*c.length)]; return s; }

io.on('connection', (socket) => {
  socket.on('createSession', () => {
    const code = makeCode();
    sessions[code] = { performer: socket.id };
    socket.join(code);
    socket.emit('sessionCreated', code);
  });
  socket.on('joinSession', (code) => {
    if (sessions[code]) { socket.join(code); socket.emit('sessionJoined', code); }
    else socket.emit('errorMessage', 'Session not found');
  });
  socket.on('selectMovie', ({ code, movie }) => io.to(code).emit('movieSelected', movie));
  socket.on('disconnect', () => {
    for (const code in sessions) if (sessions[code].performer === socket.id) delete sessions[code];
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log('Server running on port ' + PORT));
