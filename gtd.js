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

const TaskManager = {
    data: {},

    init: function() {
        return localforage.iterate((v, k, n) => this.data[k] = v);
    },

    add_task: function(task) {
        this.data[task.id] = task;
        localforage.setItem(task.id, task);
    },

    delete_task: function(task) {
        delete this.data[task.id];
        localforage.removeItem(task.id);
    },

    update_task: function(task) {
        localforage.setItem(task.id, task);
    },

    get_task_by_id: function(id) {
        return this.data[id];
    },
};

const vue_opts_gtd = {
    el: "#gtd",
    data: {
        task_editor: {
            id: null,
            title: null,
            i: null,
            u: null,
            tags: null,
        },
        display_task_editor: false,
        task_editor_changed: false,
        tasks: TaskManager.data,
    },
    watch: {
        task_editor: {
            handler: function() {
                this.task_editor_changed = true;
            },
            deep: true,
        },
    },
    methods: {
        get_tasks_by_group: function(i, u) {
            return Object.values(this.tasks).filter(t => t.i === i && t.u === u);
        },
        show_task_editor: function(t) {
            Task.copy(this.task_editor, t);
            this.display_task_editor = true;
            this.$nextTick(function() {
                this.task_editor_changed = false;
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
                TaskManager.add_task(task);
            } else {
                let task = TaskManager.get_task_by_id(this.task_editor.id);
                Task.copy(task, this.task_editor);
                TaskManager.update_task(task);
            }
        },
        delete_task: function() {
            this.display_task_editor = false;

            TaskManager.delete_task(this.task_editor);
        },
        discard: function() {
            if (!this.task_editor_changed || confirm("Confirm Discard Changes\nYour changes will be lost.")) {
                this.display_task_editor = false;
            }
        },
    },
};

const gtd = TaskManager
    .init()
    .then(() => new Vue(vue_opts_gtd))
    .catch(e => console.error(e));
