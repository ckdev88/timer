// build a timer, tasks and later a sort of agenda function for the day, connected with times, all using local storage, not needing any deployment server, just the html, js & css maybe even all in one html-file, so it's super easy to use.

// HMTL Elements
const task_new_btn = document.getElementById("task_new_btn");
const task_new_form = document.getElementById("task_new_form");
const task_new_quick = document.getElementById("task_new_quick");
const task_container = document.getElementById("task_container");
/*
html element id's:
task_new_form
task_id
new_task_name
new_task_description
new_task_interval
task_start_now
task_new_quick
task_container
*/

function newTaskSubmit() {
	task_new_form.addEventListener("submit", (e) => {
		e.preventDefault();
		var data = new FormData(document.getElementById("task_new_form"));
		// console.log(data.get('task_start_now'));
		addTask(
			data.get("task_name"),
			data.get("task_description"),
			data.get("task_interval"),
		);

		document.getElementById("new_task_name").value = "";
		document.getElementById("new_task_description").value = "";
		document.getElementById("new_task_interval").value = "";
		// data.delete('task_name');
	});
}
newTaskSubmit();

function addTask(name, description, interval) {
	if (name) {
		// get item timerTasks
		let timerArr = [];
		timerArr = JSON.parse(localStorage.getItem("timerTasks"));
		// console.log(timerArr);

		// push into item timerTasks
		timerArr.push({
			name: name,
			description: description,
			interval: interval,
			tag: "tag-" + name.replaceAll(' ', ''),
		});

		// set item timerTasks
		localStorage.setItem("timerTasks", JSON.stringify(timerArr));
		let timerArr2 = JSON.parse(localStorage.getItem("timerTasks"));
		renderTasks(timerArr2);
	}
}

function detectQuickTask() {
	if (document.getElementById("tag-Stretch")) {
		task_new_quick.className = "dnone";
	} else task_new_quick.className = "dblock";
}

let startArr = [];
localStorage.setItem("timerTasks", JSON.stringify(startArr));

let getTimerTasksArr = JSON.parse(localStorage.getItem("timerTasks"));

// ADD TASKS
let tasks = [];
// Add task
// properties:
//	id<int><auto-increment><hidden>
//	name<string><required>
//	description<string><optional>
//	start<string><HH:MM>/Now<required>, default=Now
//	interval (minutes)<int>, default=false

localStorage.setItem("taken", JSON.stringify(tasks));

// use quick add function so have a base setup, using all basic fields and characteristics
task_new_quick.addEventListener("click", () => {
	addQuickTask();
	detectQuickTask();

	// TODO: check on name if not exists to prevent duplicates
	// getTimerTasksArr.push({
	// 	name: 'stretch',
	// 	description: 'Even lopen, strekken, eten, niets superactiefs',
	// 	interval: 35,
	// });
	// localStorage.setItem('timerTasks', JSON.stringify({
	// 	getTimerTasksArr
	// }));
	// console.log(getTimerTasksArr);
	// console.log(getTimerTasksArr.length);
	//

	// TODO: verwijs naar functie die de update uitvoert, ipv bovenstaand
});

//hide quick add button when there a quickly addes task already exists

function renderTasks(getTimerTasksArr) {
	task_container.innerHTML = "";
	for (const i of getTimerTasksArr) {
		task_container.appendChild(renderTask(i));
	}
}

function renderTask(i) {
	let el = document.createElement("div");
	el.className = "task";
	i.tag !== undefined ? (el.id = i.tag) : "";
	el.appendChild(renderTaskElement("h3", "task-name", i.name));
	el.appendChild(renderTaskElement("div", "task-description", i.description));
	el.appendChild(renderTaskElement("div", "task-countdown", i.interval));
	el.appendChild(removeTaskLink(i.name.replaceAll(' ', '')));
	return el;
}

function renderTaskElement(node = "div", className, content) {
	let taskEl = document.createElement(node);
	taskEl.className = className;
	taskEl.innerHTML = content;
	return taskEl;
}

function addQuickTask() {
	// get item timerTasks
	let timerArr = [];
	timerArr = JSON.parse(localStorage.getItem("timerTasks"));
	// console.log(timerArr);

	timerArr.push({
		name: "Stretch",
		description: "Quick timer",
		interval: 35,
		tag: "tag-Stretch",
	});

	// set item timerTasks
	localStorage.setItem("timerTasks", JSON.stringify(timerArr));
	let timerArr2 = JSON.parse(localStorage.getItem("timerTasks"));
	renderTasks(timerArr2);
}

function removeTaskLink(id) {
	let el = document.createElement("button");
	el.innerHTML = "remove task";
	el.className = "text";
	el.className += " teeee";
	el.id = 'del-' + id;
	console.log(el.id);
	el.addEventListener("click", () => {
		alert('tag-' + id);
		removeTask('tag-' + id);
		// removeQuickTask();
		detectQuickTask();
	});
	return el;
}
// removeTaskLink();

function removeTask(tag) {
	let arr = JSON.parse(localStorage.getItem("timerTasks"));
	arr = arr.filter(function(el) {
		return el.tag !== tag;
	});
	localStorage.setItem("timerTasks", JSON.stringify(arr));
	renderTasks(arr);
}

// function removeQuickTask() {
// 	let arr = JSON.parse(localStorage.getItem("timerTasks"));
// 	arr = arr.filter(function(el) {
// 		return el.tag !== "tag-Stretch";
// 	});
// 	localStorage.setItem("timerTasks", JSON.stringify(arr));
// 	renderTasks(arr);
// }

function updateTasks(from, to) {
	console.log("update tasks...");
}

updateTasks(JSON.parse(localStorage.getItem("timerTasks")));

// let getTimerTasksArr = JSON.parse(localStorage.getItem("timerTasks"));

// Show tasks in a loop, constaining the following:
// - Name
// - Description (optional)
// - Countdown timer
// - Button: if interval==false: DONE, if interval==true: RESET

//console.log(getTimerTasksArr.length);

//// converting an object value to a string
localStorage.setItem("ourObject", JSON.stringify({ testKey: "testValue" }));

// Show New task-form if tasks array is empty
if (getTimerTasksArr.length === 0) task_new_form.className = "dblock";

// let button #new_task_btn toggle the form #new_task_form
task_new_btn.addEventListener("click", () => {
	!task_new_form.checkVisibility()
		? (task_new_form.className = "dblock")
		: (task_new_form.className = "dnone");
});

// create a countdown

// Remove task
//
// 024 20 90 363
