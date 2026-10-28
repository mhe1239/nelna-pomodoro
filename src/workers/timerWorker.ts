// timerWorker.ts
let interval: ReturnType<typeof setInterval> | null = null;
let targetTime: number | null = null;

self.onmessage = (e: MessageEvent) => {
  const { action, durationMs } = e.data;

  if (action === 'start') {
    if (interval) clearInterval(interval);
    targetTime = Date.now() + durationMs;
    
    interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, (targetTime || 0) - now);
      
      self.postMessage({ type: 'tick', remaining });
      
      if (remaining <= 0) {
        clearInterval(interval as any);
        interval = null;
      }
    }, 1000);
  } else if (action === 'stop') {
    if (interval) clearInterval(interval);
    interval = null;
    targetTime = null;
  }
};
