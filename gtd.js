"use strict";

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("/sw.js")
            .catch(err => { console.error("ServiceWorker registration failed: ", err); });
    });
}

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
};

const DB_STORES = Object.freeze({
    TASK: "task",
});
const DB_STORES_OPTIONS = Object.freeze({
    TASK: { autoIncrement: true, keyPath: "id" },
});
const DB = idb.open("gtd", 1, upgrade_db => {
    for (const store in DB_STORES) {
        if (!upgrade_db.objectStoreNames.contains(DB_STORES[store])) {
            upgrade_db.createObjectStore(DB_STORES[store], DB_STORES_OPTIONS[store]);
        }
    }
});

const TaskManager = {
    data: {},

    read_data: function() {
        return DB.then(db => {
            return db
                .transaction(DB_STORES.TASK, "readonly")
                .objectStore(DB_STORES.TASK)
                .getAll()
                .then(rows => { rows.forEach(r => {
                    Vue.set(this.data, r.id, r);
                });});
            ;
        });
    },

    put_task: function(task) {
        if (!task.id) {
            delete task.id;
        }
        return DB.then(db => {
            return db
                .transaction(DB_STORES.TASK, "readwrite")
                .objectStore(DB_STORES.TASK)
                .put(task);
        }).then(id => {
            task.id = id;
            Vue.set(this.data, task.id, task);
        });
    },

    delete_task: function(task) {
        return DB.then(db => {
            return db
                .transaction(DB_STORES.TASK, "readwrite")
                .objectStore(DB_STORES.TASK)
                .delete(task.id);
        }).then(() => {
            Vue.delete(this.data, task.id);
        });
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
        tasks: TaskManager.data, // read only
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

            let task = Task.New(this.task_editor);
            TaskManager.put_task(task)
                .then(() => { this.display_task_editor = false; })
                .catch(err => { console.error(err); });
        },

        delete_task: function() {
            this.display_task_editor = false;

            TaskManager.delete_task(this.task_editor)
                .catch(err => { console.error(err); });
        },

        discard: function() {
            if (!this.task_editor_changed || confirm("Confirm Discard Changes\nYour changes will be lost.")) {
                this.display_task_editor = false;
            }
        },
    },
};

const gtd = TaskManager
    .read_data()
    .then(() => new Vue(vue_opts_gtd))
    .catch(err => { console.error(err); });
