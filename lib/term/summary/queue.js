const updateQueue = (renderer, snapshot) => {

  renderer.queue.updateStatus(snapshot.state.status || 'unknown', snapshot.state.status === 'ACTIVE' ? 'green' : 'red');
  renderer.queue.updateFirstRun(snapshot.state.firstRun ? 'yes' : 'no');
  renderer.queue.updateQueued(String(snapshot.queue.queued.length) || '0');
  renderer.queue.updateProcessing(String(snapshot.queue.processing.length) || '0');
  renderer.queue.updateDone(String(snapshot.queue.done.length) || '0');

};

module.exports = { updateQueue };
