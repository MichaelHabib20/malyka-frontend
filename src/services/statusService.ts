import mitt from 'mitt';

// Define the type of events
type isOnlineEvent = {
  statusChanged: boolean;
};

const emitter = mitt<isOnlineEvent>(); // 👈 now TS knows statusChanged expects a boolean

let isOnline = navigator.onLine;

window.addEventListener('online', () => {
  isOnline = true;
  emitter.emit('statusChanged', true);
});

window.addEventListener('offline', () => {
  isOnline = false;
  emitter.emit('statusChanged', false);
});

export default {
  onStatusChange: (handler: (online: boolean) => void) => {
    emitter.on('statusChanged', handler);
  },
  isOnline: () => isOnline
};
