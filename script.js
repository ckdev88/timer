// build a timer, tasks and later a sort of agenda function for the day, connected with times, all using local storage, not needing any deployment server, just the html, js & css maybe even all in one html-file, so it's super easy to use.

// HMTL Elements
const task_new_btn = document.getElementById("task_new_btn");
const task_new_form = document.getElementById("task_new_form");
const task_new_quick = document.getElementById("task_new_quick");
const task_container = document.getElementById("task_container");
/*
task_new_form
task_id
task_name
task_description
task_interval
task_start_now
task_new_quick
task_container
*/

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

function renderTasks(getTimerTasksArr) {
	console.log(getTimerTasksArr.length);
	task_container.innerHTML = "";
	for (i = 0; i < getTimerTasksArr.length; i += 1) {
		let el = document.createElement("div");
		let elName = document.createElement("div");
		let elDescription = document.createElement("div");
		el.className = "task";
		elName.className = "task-name";
		elName.innerHTML = getTimerTasksArr[i].name;
		elDescription.className = "task-description";
		elDescription.innerHTML += getTimerTasksArr[i].description;
		el.appendChild(elName);
		el.appendChild(elDescription);
		task_container.appendChild(el);
	}
}

function addQuickTask() {
	// get item timerTasks
	let timerArr = [];
	timerArr = JSON.parse(localStorage.getItem("timerTasks"));
	console.log(timerArr);

	// push into item timerTasks
	timerArr.push({
		name: "stretch",
		description: "Even lopen, strekken, eten, niets superactiefs",
		interval: 35,
	});

	// set item timerTasks
	localStorage.setItem("timerTasks", JSON.stringify(timerArr));

	let timerArr2 = JSON.parse(localStorage.getItem("timerTasks"));

	renderTasks(timerArr2);
}

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
console.log(getTimerTasksArr.length);

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

// Remove task
//
