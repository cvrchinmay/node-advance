const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisUrl = 'redis://127.0.0.1:6379';

// create a redis client
const client = redis.createClient(redisUrl);

// promisify takes any function and returns promise for that
client.get = util.promisify(client.get);
client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

// appending some custom value when query should cache
mongoose.Query.prototype.cache = function(options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');

    return this;                    // it makes function chaianable
}

// override the exec function
mongoose.Query.prototype.exec = async function () {

    if(!this.useCache){
        return exec.apply(this, arguments);
    }

    const cacheKey = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }));

    // already cached
    const cacheValue = await client.hget(this.hashKey, cacheKey);

    // yes
    if(cacheValue){
        const cachedDoc = JSON.parse(cacheValue);
        return Array.isArray(cachedDoc)                               // converted to mongoose model 
            ? cachedDoc.map( d => new this.model(d))
            : new this.model(cachedDoc);
    }

    // no
    const result = await exec.apply(this, arguments);                 // this is mongoose model and not the json
    client.hset(this.hashKey, cacheKey, JSON.stringify(result), 'EX', 10);           // cache the result with expire time

    return result;
}

module.exports = {
    clearHash(hashKey){
        client.del(JSON.stringify(hashKey));
    }
}