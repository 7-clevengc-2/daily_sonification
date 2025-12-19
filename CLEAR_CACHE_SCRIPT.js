// Chrome Console Script to Clear Cache Before Testing
// Paste this into Chrome DevTools Console (F12) before each test run

(async function() {
  console.log('Clearing cache and storage...');
  
  // Clear all caches
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('✓ Cleared Cache Storage');
  
  // Clear localStorage
  localStorage.clear();
  console.log('✓ Cleared Local Storage');
  
  // Clear sessionStorage
  sessionStorage.clear();
  console.log('✓ Cleared Session Storage');
  
  // Clear IndexedDB
  const databases = await indexedDB.databases();
  await Promise.all(databases.map(db => {
    return new Promise((resolve, reject) => {
      const deleteReq = indexedDB.deleteDatabase(db.name);
      deleteReq.onsuccess = () => resolve();
      deleteReq.onerror = () => reject(deleteReq.error);
      deleteReq.onblocked = () => resolve(); // Resolve even if blocked
    });
  }));
  console.log('✓ Cleared IndexedDB');
  
  console.log('✓ Cache clearing complete! Ready for fresh test.');
  
  // Hard reload the page
  window.location.reload(true);
})();

