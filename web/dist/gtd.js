"use strict";(function(){"serviceWorker"in navigator&&window.addEventListener("load",function(){navigator.serviceWorker.register("/sw.js").catch(function(a){console.error("ServiceWorker registration failed: ",a)})});var a={New:function d(){var b=0<arguments.length&&void 0!==arguments[0]?arguments[0]:null;b=b||{};var c={};return a.copy(c,b),c},copy:function c(a,b){a.id=b.id,a.title=b.title,a.i=b.i,a.u=b.u,a.tags=b.tags}},b=Object.freeze({TASK:"task"}),c=Object.freeze({TASK:{autoIncrement:!0,keyPath:"id"}}),d=idb.open("gtd",1,function(a){for(var d in b)a.objectStoreNames.contains(b[d])||a.createObjectStore(b[d],c[d])}),e={data:{},read_data:function c(){var a=this;return d.then(function(c){return c.transaction(b.TASK,"readonly").objectStore(b.TASK).getAll().then(function(b){b.forEach(function(b){Vue.set(a.data,b.id,b)})})})},put_task:function e(a){var c=this;return a.id||delete a.id,d.then(function(c){return c.transaction(b.TASK,"readwrite").objectStore(b.TASK).put(a)}).then(function(b){a.id=b,Vue.set(c.data,a.id,a)})},delete_task:function e(a){var c=this;return d.then(function(c){return c.transaction(b.TASK,"readwrite").objectStore(b.TASK).delete(a.id)}).then(function(){Vue.delete(c.data,a.id)})}},f={el:"#gtd",data:{task_editor:{id:null,title:null,i:null,u:null,tags:null},display_task_editor:!1,task_editor_changed:!1,tasks:e.data},watch:{task_editor:{handler:function a(){this.task_editor_changed=!0},deep:!0}},methods:{get_tasks_by_group:function c(a,b){return Object.values(this.tasks).filter(function(c){return c.i===a&&c.u===b})},show_task_editor:function c(b){a.copy(this.task_editor,b),this.display_task_editor=!0,this.$nextTick(function(){this.task_editor_changed=!1,this.$refs.task_editor_input_title.focus()})},submit_task:function d(){var b=this;if(!this.task_editor.title)return void alert("Task title can't be blank");var c=a.New(this.task_editor);e.put_task(c).then(function(){b.display_task_editor=!1}).catch(function(a){console.error(a)})},delete_task:function a(){this.display_task_editor=!1,e.delete_task(this.task_editor).catch(function(a){console.error(a)})},discard:function a(){(!this.task_editor_changed||confirm("Confirm Discard Changes\nYour changes will be lost."))&&(this.display_task_editor=!1)}}},g=e.read_data().then(function(){return new Vue(f)}).catch(function(a){console.error(a)})})();