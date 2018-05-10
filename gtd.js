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

    data() {
        return this._tasks;
    }

    add_task(task) {
        this._tasks[task.id] = task;
    }

    delete_task(task) {
        delete this._tasks[task.id];
    }

    get_task_by_id(id) {
        return this._tasks[id];
    }
}

const tm = new TaskManager();

let gtd = new Vue({
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
            this.task_editor = t;
            this.display_task_editor = true;
            this.$nextTick(function() {
                this.$refs.task_editor_input_title.focus();
            });
        },
        hide_task_editor: function() {
            this.display_task_editor = false;
        },
        submit_task: function() {
            this.hide_task_editor();

            if (!this.task_editor.title) {
                alert("Task title can't be blank");
                return;
            }

            if (!this.task_editor.id) {
                Task.gen_id(this.task_editor);
                tm.add_task(this.task_editor);
            }
        },
        delete_task: function() {
            this.hide_task_editor();

            tm.delete_task(this.task_editor);
        },
    },
});
