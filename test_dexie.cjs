const Dexie = require('dexie');
const { indexedDB, IDBKeyRange } = require('fake-indexeddb');

const db = new Dexie('test', { indexedDB, IDBKeyRange });
db.version(1).stores({
    records: 'id, name' // id is primary key, name is indexed
});

async function run() {
    await db.records.put({ id: 1, name: 'Alice', extra_column_foo: 'bar' });
    const records = await db.records.toArray();
    console.log("Records from Dexie:", records);
}

run().catch(console.error);
