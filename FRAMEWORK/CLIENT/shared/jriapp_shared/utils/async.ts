﻿/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IThenable, ITaskQueue } from "../shared";
import {
    IPromise, IDeferred, create as createDefer,
    createSync as createSyncDefer, whenAll, getTaskQueue
} from "./deferred";
export {
    IPromise, IPromiseState, IAbortablePromise, PromiseState,
    IDeferred, whenAll, AbortablePromise
} from "./deferred";
import { Checks } from "./checks";

const checks = Checks;

export class AsyncUtils {
    static createDeferred<T>(): IDeferred<T> {
        return createDefer<T>();
    }
    //immediate resolve and reject without setTimeout
    static createSyncDeferred<T>(): IDeferred<T> {
        return createSyncDefer<T>();
    }
    static whenAll<T>(args: Array<T | IThenable<T>>): IPromise<T[]> {
        return whenAll(args);
    }
    static getTaskQueue(): ITaskQueue {
        return getTaskQueue();
    }
    static delay<T>(func: () => T, time?: number): IPromise<T> {
        let deferred = createDefer<T>();
        setTimeout(() => {
            try {
                deferred.resolve(func());
            }
            catch (err) {
                deferred.reject(err);
            }
        }, !time ? 0 : time);

        return deferred.promise();
    }
    static parseJSON(res: string | any): IPromise<any> {
        return AsyncUtils.delay(() => {
            let parsed: any = null;
            if (checks.isString(res))
                parsed = JSON.parse(res);
            else
                parsed = res;

            return parsed;
        });
    }
}