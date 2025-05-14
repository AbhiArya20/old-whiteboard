export class IndexedDB {
    constructor(name, store, key = 'id') {
        this.name = name;
        this.store = store;
        this.key = key;
        this.db = null;
    }

    openDatabase(version = 1) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.name, version);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.store)) {
                    const store = db.createObjectStore(this.store, { key: this.key });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onerror = (event) => {
                reject(`Error opening database: ${event.target.error}`);
            };
        });
    }

    saveData(data) {
        return new Promise((resolve, reject) => {
            data.timestamp = Date.now();

            const transaction = this.db.transaction([this.store], 'readwrite');
            const store = transaction.objectStore(this.store);
            const request = store.put(data);

            request.onsuccess = () => {
                resolve('Data added/updated successfully!');
            };

            request.onerror = (event) => {
                reject(`Error saving data: ${event.target.error}`);
            };
        });
    }

    getData(key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.store], 'readonly');
            const store = transaction.objectStore(this.store);
            const request = store.get(key);

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                reject(`Error retrieving data: ${event.target.error}`);
            };
        });
    }

    getAllDataSorted(userId, roomId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.store], 'readonly');
            const store = transaction.objectStore(this.store);
            const index = store.index('timestamp');

            const request = index.openCursor();
            const data = [];

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    const value = cursor.value;
                    if (value.userId === userId && value.roomId === roomId) {
                        data.push(cursor.value);
                    }
                    cursor.continue();
                } else {
                    resolve(data);
                }
            };

            request.onerror = (event) => {
                reject(`Error retrieving all data: ${event.target.error}`);
            };
        });
    }
    
    deleteData(key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.store], 'readwrite');
            const store = transaction.objectStore(this.store);
            const request = store.delete(key);

            request.onsuccess = () => {
                resolve('Data deleted successfully!');
            };

            request.onerror = (event) => {
                reject(`Error deleting data: ${event.target.error}`);
            };
        });
    }
}
