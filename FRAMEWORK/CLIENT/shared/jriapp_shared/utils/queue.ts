﻿/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IIndexer } from "../int";
import { ERROR } from "./error";

const error = ERROR;
const MAX_NUM = 99999900000, win = window;

export interface IQueue {
    cancel: (taskId: number) => void;
    enque: (func: () => void) => number;
}

interface ITask {
    taskId: number;
    func: () => void;
}

export function createQueue(interval: number = 0): IQueue {
    let _tasks: ITask[] = [], _taskMap: IIndexer<ITask> = {},
        _timer: number = null, _newTaskId = 1;

    const res: IQueue = {
        cancel: function (taskId: number) {
            const task = _taskMap[taskId];
            if (!!task) {
                // cancel task by setting its func to null!!!
                task.func = null;
            }
        },
        enque: function (func: () => void): number {
            const taskId = _newTaskId;
            _newTaskId += 1;
            const task: ITask = { taskId: taskId, func: func };
            _tasks.push(task);
            _taskMap[taskId] = task;

            if (!_timer) {
                _timer = win.setTimeout(() => {
                    const arr = _tasks;
                    _timer = null;
                    _tasks = [];
                    // recycle generated nums if they are too big
                    if (_newTaskId > MAX_NUM) {
                        _newTaskId = 1;
                    }

                    try {
                        arr.forEach((task) => {
                            try {
                                if (!!task.func) {
                                    task.func();
                                }
                            } catch (err) {
                                error.handleError(win, err, win);
                            }
                        });
                    } finally {
                        // reset the map after all the tasks in the queue have been executed
                        // so a task can be cancelled from another task
                        _taskMap = {};
                        // add tasks which were queued while tasks were executing (from inside the tasks) to the map
                        for (let i = 0; i < _tasks.length; i += 1) {
                            _taskMap[_tasks[i].taskId] = _tasks[i];
                        };
                    }
                }, interval);
            }

            return taskId;
        }
    };

    return res;
}
