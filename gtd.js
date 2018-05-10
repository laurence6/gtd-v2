"use strict";

const gen_task_id = function() {
    let now;
    let task_id_count;
    return () => {
        let _now = Date.now().toString();
        if (_now !== now) {
            now = _now;
            task_id_count = 1000;
        } else {
            task_id_count += 1;
        }
        return now + task_id_count.toString();
    };
}();

const Task = {
    New: (params = null) => {
        params = params || {};
        let task = {};
        Task.copy(task, params);
        return task;
    },

    copy: (dst, src) => {
        dst.id = src.id;
        dst.title = src.title;
        dst.i = src.i;
        dst.u = src.u;
        dst.tags = src.tags;
    },

    gen_id: (task) => {
        task.id = gen_task_id();
    },
}

class TaskManager {
    constructor() {
        this._tasks = {};
    }

    init() {
        return localforage.iterate((v, k, n) => {
            this._tasks[k] = v;
        });
    }

    data() {
        return this._tasks;
    }

    add_task(task) {
        this._tasks[task.id] = task;
        localforage.setItem(task.id, task);
    }

    delete_task(task) {
        delete this._tasks[task.id];
        localforage.removeItem(task.id);
    }

    update_task(task) {
        localforage.setItem(task.id, task);
    }

    get_task_by_id(id) {
        return this._tasks[id];
    }
}

const tm = new TaskManager();

const vue_opts_gtd = {
    el: "#gtd",
    data: {
        display_task_editor: false,
        task_editor: {
            id: null,
            title: null,
            i: null,
            u: null,
            tags: null,
        },
        tasks: tm.data(),
    },
    methods: {
        get_tasks_by_group: function(i, u) {
            return Object.values(this.tasks).filter(t => t.i === i && t.u === u);
        },
        show_task_editor: function(t) {
            Task.copy(this.task_editor, t);
            this.display_task_editor = true;
            this.$nextTick(function() {
                this.$refs.task_editor_input_title.focus();
            });
        },
        submit_task: function() {
            if (!this.task_editor.title) {
                alert("Task title can't be blank");
                return;
            }

            this.display_task_editor = false;

            if (!this.task_editor.id) {
                let task = Task.New(this.task_editor);
                Task.gen_id(task);
                tm.add_task(task);
            } else {
                let task = tm.get_task_by_id(this.task_editor.id);
                Task.copy(task, this.task_editor);
                tm.update_task(task);
            }
        },
        delete_task: function() {
            this.display_task_editor = false;

            tm.delete_task(this.task_editor);
        },
        discard: function() {
            if (confirm("Confirm Discard Changes\nYour changes will be lost.")) {
                this.display_task_editor = false;
            }
        },
    },
};

const gtd = tm
    .init()
    .then(() => new Vue(vue_opts_gtd))
    .catch(e => console.error(e));
