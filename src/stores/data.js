import {Network} from './networkStore'

export class DataStore {
    static getInstance(type) {
        let store;
        switch (type) {
            default:
                store = new Network();
        }
        return store;
    }
}