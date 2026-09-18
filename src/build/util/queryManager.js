import fs from "fs/promises"
import { Query } from "startgg-helper-node";

const DEFAULT_RETRIES = 3;

/**
 * Holds a <string, Query> map, handling creating the query from a Graphql document's path if needed
 */
export class QueryManager {
    /**@type {Map<string, Query>} */
    #queries = new Map;

    /**
     * Returns the Query  identified by `name`, creating it from the GraphQL document at `path` if it had not been done before.
     * @param {string} name 
     * @param {PathLike | fs.FileHandle} path 
     * @param {{logs?: {query: (params: {}) => string, error: (params: {}) => string}, retries?: number}} queryOptions 
     */
    async try(name, path, queryOptions = {}){
        let query = this.#queries.get(name);

        if (!query){
            try {
                const document = await fs.readFile(path).then(buf => buf.toString('utf-8'));
                query = new Query(document, queryOptions.retries ?? DEFAULT_RETRIES);
                if (queryOptions.logs) query.log = queryOptions.logs;
                this.#queries.set(name, query);
            } catch (err){
                throw new Error("Couldn't load query " + name, {cause: err});
            }
        }

        return query;
    }
}