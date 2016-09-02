/**
 *  IndexedDB helper functions.
 *
 *  Make saving transmissions to an IndexedDB object store by providing a
 *  Promise-based interface to an IndexedDB database instance.
 *
 *  Note that these functions are specific to managing transmissions only. If
 *  additional object stores need to be managed, helper functions for those
 *  will still have to be written.
 **/

var db = null;


function getIndexedDatabase() {
    if (db !== null) {
        return Promise.resolve(db);
    }
    return new Promise(function(resolve, reject) {
        var request = indexedDB.open('starwarspwa', 1);

        request.onupgradeneeded = function(e) {
            db = e.target.result;
            db.createObjectStore('transmissions', { autoIncrement: true });
        };

        request.onsuccess = function(e) {
            db = e.target.result;
            resolve(db);
        };

        request.onerror = reject;
    });
}


function saveTransmissionToIndexedDB(transmission) {
    return getIndexedDatabase().then(function(db) {
        var objectStore = db.transaction('transmissions', 'readwrite')
            .objectStore('transmissions');

        return new Promise(function(resolve, reject) {
            var operation = objectStore.add(transmission);
            operation.onsuccess = resolve;
            operation.onerror = reject;
        });
    });
}


function getAllTransmissionsFromIndexedDB() {
    return getIndexedDatabase().then(function(db) {
        var objectStore = db.transaction('transmissions')
            .objectStore('transmissions');

        return new Promise(function(resolve, reject) {
            var transmissions = [];
            var operation = objectStore.openCursor();

            operation.onsuccess = function(e) {
                var cursor = e.target.result;
                if (cursor) {
                    transmissions.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(transmissions);
                }
            };

            operation.onerror = reject;
        });
    });
}


function deleteAllTransmissionsFromIndexedDB() {
    return getIndexedDatabase().then(function(db) {
        var objectStore = db.transaction('transmissions', 'readwrite')
            .objectStore('transmissions');

        return new Promise(function(resolve, reject) {
            var operation = objectStore.clear();
            operation.onsuccess = resolve;
            operation.onerror = reject;
        });
    });
}
