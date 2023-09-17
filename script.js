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

const getTasks = () => { return JSON.parse(localStorage.getItem('timerTasks')); }
const updateTasks = (arr) => { localStorage.setItem('timerTasks', JSON.stringify(arr)); }

function newTaskSubmit() {
	task_new_form.addEventListener("submit", (e) => {
		e.preventDefault();
		var data = new FormData(document.getElementById("task_new_form"));
		addTask(
			data.get("task_name"),
			data.get("task_description"),
			data.get("task_interval"),
		);

		document.getElementById("new_task_name").value = "";
		document.getElementById("new_task_description").value = "";
		document.getElementById("new_task_interval").value = "";
	});
}
newTaskSubmit();

function addTask(name, description, interval) {
	if (name) {
		// TODO: hier lijkt een bug, leeg maken voor er nieuw gemaakt wordt is leuk, maar als dit persistentie tegen gaat, moet er een andere oplossing komen.
		let timerArr = [];
		timerArr = getTasks();

		// push into item timerTasks
		timerArr.push({
			name: name,
			description: description,
			interval: interval,
			timepast: 0,
			task: "task-" + name.replaceAll(' ', ''),
		});

		// set item timerTasks
		updateTasks(timerArr);
		let timerArr2 = getTasks();
		renderTasks(timerArr2);
	}
}

let startArr = [];
updateTasks(startArr);


// ADD TASKS

// use quick add function so have a base setup, using all basic fields and characteristics
task_new_quick.addEventListener("click", () => {
	addQuickTask();
});

let getTimerTasksArr = getTasks();

// Show New task-form if tasks array is empty
// TODO: if localStorage isnt persistent, this is always TRUE, so fix this
const checkTasksEmpty = () => {
	if (getTasks.length === 0) {
		task_new_form.className = "dblock";
		return true;
	} else return false;
}
checkTasksEmpty();

function renderTasks(getTimerTasksArr) {
	task_container.innerHTML = "";
	for (let i = 0; i < getTimerTasksArr.length; i++) {
		task_container.appendChild(renderTask(getTimerTasksArr[i], i));
	}
}

function renderTask(i, key) {
	let el = document.createElement("div");
	el.className = "task"
	el.id = 'task-' + key;
	el.appendChild(renderTaskElement("h3", "task-name", i.name));
	el.appendChild(renderTaskElement("div", "task-description", i.description));
	el.appendChild(renderTaskElement("div", "task-countdown-total", i.interval));
	el.appendChild(renderTaskElement('div', 'task-countdown-current', countdownTimer(i.interval, key, 'countdown-task-' + key), 'countdown-' + el.id));
	el.appendChild(removeTaskLink(key));
	return el;
}

function renderTaskElement(node = "div", className, content, id = undefined) {
	let taskEl = document.createElement(node);
	taskEl.className = className;
	taskEl.innerHTML = content;
	id !== undefined ? taskEl.id = id : '';
	return taskEl;
}

function addQuickTask() {
	let timerArr = [];
	timerArr = getTasks();

	timerArr.push({
		name: "Stretch",
		description: "Quick timer",
		interval: 35,
		timepast: 0,
		// task: "task-Stretch",
	});

	// set item timerTasks
	updateTasks(timerArr);
	let timerArr2 = getTasks();
	renderTasks(timerArr2);
}

function removeTaskLink(key) {
	let el = document.createElement("button");
	el.innerHTML = "remove task";
	el.className = "text";
	el.id = 'del-' + key;
	el.addEventListener("click", () => {
		removeTask(key);
	});
	return el;
}

function removeTask(key) {
	let arr = getTasks();

	let newarr = [];
	for (let i = 0; i < arr.length; i++) {
		if (i === key) continue;
		newarr.push({
			name: arr[i].name,
			description: arr[i].description,
			interval: arr[i].interval,
			timepast: arr[i].timepast,
			// task: "task-" + arr[i].name.replaceAll(' ', ''),
		});
	}
	updateTasks(newarr);
	renderTasks(newarr);
}
function countdownTimer(limit, key, id) {
	const lb = setInterval((max = limit, id2 = id) => {
		if (document.getElementById(id)) {
			let arr = getTasks();
			if (arr[key].timepast > max) stopit();
			document.getElementById(id2).innerHTML = arr[key].timepast;
		}
	}, 1000);
	function stopit() {
		clearInterval(lb);
	}
}

function countdownAll() {
	setInterval(() => {
		let arr = getTasks();
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].timepast < arr[i].interval) arr[i].timepast++;
		}
		updateTasks(arr);
	}, 1000)

}
countdownAll();


// TODO: organize whatever is below this line
// -------------------------------------------------------------------------------------


// let button #new_task_btn toggle the form #new_task_form
task_new_btn.addEventListener("click", () => {
	!task_new_form.checkVisibility()
		? (task_new_form.className = "dblock")
		: (task_new_form.className = "dnone");
});

// - Countdown timer
// - Button: if interval==false: DONE, if interval==true: RESET

// testing with persistence
let tasks = JSON.parse(localStorage.getItem('tasks'));
if (tasks === null) {
	tasks = [];
	tasks.push(
		{
			test1: 'numero un',
			test2: 'nummer twee',
			test3: 'numero tres',
			test4: 'number four'
		});
	localStorage.setItem('tasks', JSON.stringify(tasks));
}
console.log(tasks);
