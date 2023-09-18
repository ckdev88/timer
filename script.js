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
if (getTasks() === null) updateTasks([]);

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
		let timerArr = getTasks();

		timerArr.push({
			name: name,
			description: description,
			interval: interval,
			timepast: 0,
		});

		updateTasks(timerArr);
		let timerArr2 = getTasks();
		renderTasks(timerArr2);
	}
}


// ADD TASKS

// use quick add function so have a base setup, using all basic fields and characteristics
task_new_quick.addEventListener("click", () => {
	addQuickTask();
});

let getTimerTasksArr = getTasks();

// Show New task-form if tasks array is empty
const checkTasksEmpty = () => {
	if (!getTasks()) updateTasks([]); // if array doesnt exist at all, create it
	if (getTasks().length === 0) {
		return true;
	} else {
		return false;
	}
}
// if (checkTasksEmpty() === true) task_new_form.className = "dblock";

function renderTasks(arr) {
	task_container.innerHTML = "";
	for (let i = 0; i < arr.length; i++) {
		task_container.appendChild(renderTask(arr[i], i));
	}
}
renderTasks(getTasks());

function renderTask(i, key) {
	let el = document.createElement("div");
	el.className = "task"
	el.id = 'task-' + key;
	el.appendChild(renderTaskElement("h3", "task-name", i.name));
	el.appendChild(renderTaskElement("div", "task-description", i.description));
	el.appendChild(renderTaskElement("div", "task-countdown-total", i.interval));
	el.appendChild(renderTaskElement('div', 'task-countdown-current', countdownTimer(i.interval, key, 'countdown-task-' + key), 'countdown-' + el.id));
	el.appendChild(removeTaskLink(key));
	// el.appendChild(resetTaskLink(key));
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
	});

	// set item timerTasks
	updateTasks(timerArr);
	let timerArr2 = getTasks();
	renderTasks(timerArr2);
}

function removeTaskLink(key) {
	let el = document.createElement("button");
	el.innerHTML = "remove task";
	el.className = "text ctacolor2";
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
		});
	}
	updateTasks(newarr);
	renderTasks(newarr);
}
function resetTaskLink(key) {
	let el = document.createElement('button');
	el.innerHTML = 'reset';
	el.className = 'text';
	el.id = 'reset-' + key;
	el.addEventListener('click', () => {
		resetTask(key);
	});
	return el;
}
function resetTask(key) {
	let arr = getTasks();
	arr[key].timepast = 0;
	arr[key].finished = false;
	updateTasks(arr);
	renderTasks(arr);
}

function addResetTaskLink(key) {
	el = resetTaskLink(key);
	document.getElementById('task-' + key).appendChild(el);
}

function countdownTimer(limit, key, id) {
	const lb = setInterval((max = limit, id2 = id) => {
		if (document.getElementById(id)) {
			let arr = getTasks();
			if (arr[key].timepast === max) {
				stopit();
				addResetTaskLink(key);
			}
			document.getElementById(id2).innerHTML = arr[key].timepast;
		}
	}, 1000);
	function stopit() {
		console.log('run stopit()')
		clearInterval(lb);
	}
}

function countdownAll() {
	setInterval(() => {
		let arr = getTasks();
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].timepast < arr[i].interval) {
				arr[i].timepast++;
				if (arr[i].timepast == arr[i].interval) playSound();
			}
			else arr[i].finished = true;
		}
		updateTasks(arr);
	}, 1000)

}
countdownAll();

function playSound() {
	const siren = new Audio('siren1.wav');
	siren.play();
	console.log('play sound');
}


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

