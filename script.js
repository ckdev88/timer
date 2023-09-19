// build a timer, tasks and later a sort of agenda function for the day, connected with times, all using local storage, not needing any deployment server, just the html, js & css maybe even all in one html-file, so it's super easy to use.

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

// HMTL Elements
const task_new_btn = document.getElementById("task_new_btn");
const task_new_form = document.getElementById("task_new_form");
const task_new_quick = document.getElementById("task_new_quick");
const task_container = document.getElementById("task_container");
const settings_btn = document.getElementById('settings_btn');

// ------------- define settings ---------------
const settings_default = {
	intervalTime: 60000, // in ms
	intervalTimeUnit: '',
	countDown: true, // true: show time remaining, false: show time passed
	quickTaskInterval: 35, // totals value multiplied by value of settings.intervalTime
	quickTaskName: 'Stretch',
	quickTaskDescription: 'Eat, walk, pushup, drink, some or all.',
};
if (settings_default.intervalTime === 60000) settings_default.intervalTimeUnit = 'minute(s)';
else if (settings_default.intervalTime === 1000) settings_default.intervalTimeUnit = 'second(s)';

if (localStorage.getItem('settings') === null) {
	localStorage.setItem('settings', []);
	localStorage.setItem('settings', JSON.stringify(settings_default))
}
const settings = JSON.parse(localStorage.getItem('settings'));
console.log('settings', settings);
// ------------- /define settings --------------

const settings_form = document.getElementById('settings_form');
const settings_form_quickTaskName = document.getElementById('settings_form_quickTaskName');
settings_form_quickTaskName.setAttribute('value', settings.quickTaskName);
const settings_form_quickTaskDescription = document.getElementById('settings_form_quickTaskDescription');
settings_form_quickTaskDescription.innerText = settings.quickTaskDescription;
const settings_form_quickTaskInterval = document.getElementById('settings_form_quickTaskInterval');
settings_form_quickTaskInterval.setAttribute('value', settings.quickTaskInterval);
const settings_form_intervalTime = document.getElementById('settings_form_intervalTime');
selectOption(settings_form_intervalTime, settings.intervalTime);
const settings_form_countDown = document.getElementById('settings_form_countDown');
selectOption(settings_form_countDown, settings.countDown);
settings_form_countDown.setAttribute('value', settings.countDown);

function selectOption(el, option) {
	option = option.toString();
	for (let i = 0; i < el.options.length; i++) {
		if (el.options[i].getAttribute('value') == option) {
			el.options[i].setAttribute('selected', 'selected');
		}
	}
}
settings_form_quickTaskName.addEventListener('click', () => {
	console.log('click taskname');
});
const settingsSubmit = () => {
	settings_form.addEventListener("submit", (e) => {
		e.preventDefault();
		var data = new FormData(document.getElementById("settings_form"));

		let settings = {
			intervalTime: data.get('settings_form_intervalTime'),
			intervalTimeUnit: '',
			countDown: data.get('settings_form_countDown'), // true: show time remaining, false: show time passed
			quickTaskInterval: data.get("settings_form_quickTaskInterval"),  // totals value multiplied by value of settings.intervalTime
			quickTaskName: data.get("settings_form_quickTaskName"),
			quickTaskDescription: data.get("settings_form_quickTaskDescription"),
		};
		if (settings.intervalTime == '60000') settings.intervalTimeUnit = 'minute(s)';
		else if (settings.intervalTime == '1000') settings.intervalTimeUnit = 'second(s)';
		localStorage.setItem('settings', JSON.stringify(settings));
	});
}
settingsSubmit();

task_new_btn.addEventListener("click", () => {
	task_new_form.className == 'dblock' ? ecForm('collapse') : ecForm('expand');
});

function ecForm(what) {
	if (what == 'expand') {
		task_new_btn.classList.replace('collapsed', 'expanded');
		task_new_form.className = "dblock"
	}
	if (what === 'collapse') {
		task_new_form.className = "dnone"
		task_new_btn.classList.replace('expanded', 'collapsed');
	}
}

settings_btn.addEventListener('click', () => {
	settings_form.className == 'dblock' ? settingsForm('collapse') : settingsForm('expand');
});

function settingsForm(what) {
	if (what == 'expand') {
		settings_btn.classList.replace('collapsed', 'expanded')
		settings_form.className = 'dblock';
	}
	if (what == 'collapse') {
		settings_btn.classList.replace('expanded', 'collapsed')
		settings_form.className = 'dnone';
	}
}

const getSettings = () => { return JSON.parse(localStorage.getItem('settings')) }
const updateSettings = (arr) => { localStorage.setItem('settings', JSON.stringify(arr)); }

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
	el.appendChild(renderTaskElement(
		"div",
		"task-countdown-total",
		i.interval,
		'',
		'',
		'Interval: ',
		settings.intervalTimeUnit
	));
	el.appendChild(renderTaskElement(
		'div',
		'task-countdown-current',
		countdownTimer(
			i.interval,
			key,
			'countdown-task-' + key,
			settings.countDown
		),
		'countdown-' + el.id, key,
		(settings.countDown ? 'Time left: ' : 'Time passed: '),
		(settings.intervalTimeUnit)
	));
	el.appendChild(removeTaskLink(key));
	if (i.finished === true) el.appendChild(resetTaskLink(key));
	return el;
}

function renderTaskElement(node = "div", className, content, id = undefined, key, contentPrefix = '', contentSuffix = '') {
	let taskEl = document.createElement(node);
	taskEl.className = className;

	// TODO: make this hack neat, this hack only applies to the countdown div field
	if (content === undefined) content = (settings.countDown === true ? (getTasks()[key].interval - getTasks()[key].timepast) : getTasks()[key].timepast)

	taskEl.innerHTML = contentPrefix + content + ' ' + contentSuffix;
	id !== undefined ? taskEl.id = id : '';
	return taskEl;
}

function addQuickTask() {
	let arr = [];
	arr = getTasks();

	arr.push({
		name: settings.quickTaskName,
		description: settings.quickTaskDescription,
		interval: settings.quickTaskInterval,
		timepast: 0,
	});

	updateTasks(arr);
	let arr2 = getTasks();
	renderTasks(arr2);
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
	document.body.style.backgroundColor = 'black';
	updateTasks(arr);
	renderTasks(arr);
}

function addResetTaskLink(key) {
	el = resetTaskLink(key);
	document.getElementById('task-' + key).appendChild(el);
}

function countdownTimer(limit, key, id) {
	if (settings.countDown) contentPrefix = 'Time left: ';
	else contentPrefix = 'Time passed: ';
	const lb = setInterval((max = limit, id2 = id) => {
		if (document.getElementById(id)) {
			let arr = getTasks();
			if (arr[key].timepast === max) {
				stopit();
			}
			if (settings.countDown) document.getElementById(id2).innerHTML = contentPrefix + (max - arr[key].timepast) + ' ' + settings.intervalTimeUnit;
			else document.getElementById(id2).innerHTML = contentPrefix + arr[key].timepast + ' ' + settings.intervalTimeUnit;
		}
	}, settings.intervalTime);
	function stopit() {
		clearInterval(lb);
	}
}

function countdownAll() {
	setInterval(() => {
		let arr = getTasks();
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].timepast < arr[i].interval) {
				arr[i].timepast++;
			}
			if (arr[i].timepast == arr[i].interval && arr[i].finished !== true) {
				playSound();
				arr[i].finished = true;
				document.body.style.backgroundColor = 'red';
			}
			if (arr[i].finished == true && !document.getElementById('reset-' + i)) {
				addResetTaskLink(i);
			}
			updateTasks(arr);
		}
	}, settings.intervalTime);
}
countdownAll();

function playSound() {
	const siren = new Audio('siren1.wav');
	siren.play();
}


// TODO: organize whatever is below this line
// -------------------------------------------------------------------------------------

// - Countdown timer
// - Button: if interval==false: DONE, if interval==true: RESET

