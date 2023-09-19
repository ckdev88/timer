// build a timer, tasks and later a sort of agenda function for the day, connected with times, all using local storage, not needing any deployment server, just the html, js & css maybe even all in one html-file, so it's super easy to use.

// TODO: make intervalTime, intervalTimeUnit a task-specific thing

/*
html element id's:
task_new_form
task_id
new_task_name
new_task_descr
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
	quickTaskDescr: 'Eat, walk, pushup, drink, some or all.',
};
if (settings_default.intervalTime === 60000) settings_default.intervalTimeUnit = 'minute(s)';
else if (settings_default.intervalTime === 1000) settings_default.intervalTimeUnit = 'second(s)';

if (localStorage.getItem('settings') === null) {
	localStorage.setItem('settings', []);
	localStorage.setItem('settings', JSON.stringify(settings_default))
}
const settings = JSON.parse(localStorage.getItem('settings'));
// ------------- /define settings --------------
function viewSettings() {
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
	function settingsFormDefaults() {
		document.getElementById('settings_form_quickTaskName').setAttribute('value', settings.quickTaskName);
		document.getElementById('settings_form_quickTaskDescr').innerText = settings.quickTaskDescr;
		document.getElementById('settings_form_quickTaskInterval').setAttribute('value', settings.quickTaskInterval);
		selectOption(document.getElementById('settings_form_intervalTime'), settings.intervalTime);
		selectOption(document.getElementById('settings_form_countDown'), settings.countDown);
	}
	settingsFormDefaults();
}
viewSettings();

const settings_form = document.getElementById('settings_form');
settings_form.addEventListener("submit", (e) => {
	e.preventDefault();
	let data = new FormData(settings_form);
	settingsFormSubmit(data);
});

function settingsFormSubmit(data) {
	let settings = {
		intervalTime: data.get('settings_form_intervalTime'),
		intervalTimeUnit: '',
		countDown: data.get('settings_form_countDown'), // true: show time remaining, false: show time passed
		quickTaskInterval: data.get("settings_form_quickTaskInterval"),  // totals value multiplied by value of settings.intervalTime
		quickTaskName: data.get("settings_form_quickTaskName"),
		quickTaskDescr: data.get("settings_form_quickTaskDescr"),
	};
	if (settings.intervalTime == '60000') settings.intervalTimeUnit = 'minute(s)';
	else if (settings.intervalTime == '1000') settings.intervalTimeUnit = 'second(s)';
	localStorage.setItem('settings', JSON.stringify(settings));

	// TODO: re-render page & variables
}

function selectOption(el, option) {
	option = option.toString();
	for (let i = 0; i < el.options.length; i++) {
		if (el.options[i].getAttribute('value') == option) {
			el.options[i].setAttribute('selected', 'selected');
		}
	}
}
const getSettings = () => { return JSON.parse(localStorage.getItem('settings')) }
const updateSettings = (arr) => { localStorage.setItem('settings', JSON.stringify(arr)); }
// ---------------------- /settings form


// ---------------------- new task form
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

const getTasks = () => { return JSON.parse(localStorage.getItem('timerTasks')); }
const updateTasks = (arr) => { localStorage.setItem('timerTasks', JSON.stringify(arr)); }
if (getTasks() === null) updateTasks([]);

// TODO: split newTaskSubmit in 3 functions...
// TODO: ... 1 with listener ...
// TODO: ... the other with adding the task ...
// TODO: ... (and one to empty form fields (& place focus on first field?))
function newTaskSubmit() {
	task_new_form.addEventListener("submit", (e) => {
		e.preventDefault();
		var data = new FormData(document.getElementById("task_new_form"));
		addTask(
			data.get("task_name"),
			data.get("task_descr"),
			data.get("task_interval"),
		);
		document.getElementById("new_task_name").value = "";
		document.getElementById("new_task_descr").value = "";
		document.getElementById("new_task_interval").value = "";
	});
}

function addTask(name, descr, interval) {
	if (name) {
		let timerArr = getTasks();

		// TODO: add task specific intervalTime (& intervalTimeUnit)
		timerArr.push({
			name: name,
			descr: descr,
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
	el.appendChild(renderTaskElement("div", "task-descr", i.descr));
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
		descr: settings.quickTaskDescr,
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
			descr: arr[i].descr,
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
