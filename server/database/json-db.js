const fs = require('fs').promises;
const path = require('path');

class JsonDatabase {
  constructor(dbPath = './data') {
    this.dbPath = dbPath;
    this.collections = {};
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(this.dbPath, { recursive: true });
      console.log('✅ JSON database initialized');
    } catch (error) {
      console.error('❌ Failed to initialize JSON database:', error);
    }
  }

  async getCollection(collectionName) {
    if (!this.collections[collectionName]) {
      this.collections[collectionName] = new JsonCollection(collectionName, this.dbPath);
    }
    return this.collections[collectionName];
  }

  async close() {
    // No connection to close for JSON files
    console.log('✅ JSON database closed');
  }
}

class JsonCollection {
  constructor(name, dbPath) {
    this.name = name;
    this.filePath = path.join(dbPath, `${name}.json`);
    this.data = [];
    this.load();
  }

  async load() {
    try {
      const fileContent = await fs.readFile(this.filePath, 'utf8');
      this.data = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist or is empty, start with empty array
      this.data = [];
      await this.save();
    }
  }

  async save() {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error(`❌ Failed to save collection ${this.name}:`, error);
    }
  }

  async insert(document) {
    const newDoc = {
      id: this.generateId(),
      ...document,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.push(newDoc);
    await this.save();
    return newDoc;
  }

  async find(query = {}) {
    return this.data.filter(doc => this.matchesQuery(doc, query));
  }

  async findOne(query = {}) {
    const results = await this.find(query);
    return results[0] || null;
  }

  async findById(id) {
    return this.data.find(doc => doc.id === id) || null;
  }

  async update(query, update) {
    const docs = await this.find(query);
    docs.forEach(doc => {
      Object.assign(doc, update, { updatedAt: new Date().toISOString() });
    });
    await this.save();
    return docs.length;
  }

  async updateById(id, update) {
    const doc = await this.findById(id);
    if (doc) {
      Object.assign(doc, update, { updatedAt: new Date().toISOString() });
      await this.save();
      return doc;
    }
    return null;
  }

  async delete(query) {
    const docsToDelete = await this.find(query);
    this.data = this.data.filter(doc => !docsToDelete.includes(doc));
    await this.save();
    return docsToDelete.length;
  }

  async deleteById(id) {
    const doc = await this.findById(id);
    if (doc) {
      this.data = this.data.filter(d => d.id !== id);
      await this.save();
      return doc;
    }
    return null;
  }

  async count(query = {}) {
    return (await this.find(query)).length;
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  matchesQuery(doc, query) {
    for (const [key, value] of Object.entries(query)) {
      if (doc[key] !== value) {
        return false;
      }
    }
    return true;
  }
}

module.exports = { JsonDatabase, JsonCollection };