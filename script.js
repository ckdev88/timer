// Why this? To build a timer, tasks and later a sort of agenda function for the day, connected with times, all using local storage, not needing any deployment server, just the html, js & css maybe even all in one html-file, so it's super easy to use.

// ----------------------------- GLOBAL CONSTANTS

const d = document;// abstraction for loading speed & less code

// HMTL Elements
const task_new_btn = d.getElementById("task_new_btn");
const task_new_form = d.getElementById("task_new_form");
const task_new_quick = d.getElementById("task_new_quick");
const task_container = d.getElementById("task_container");
const settings_btn = d.getElementById('settings_btn');
const settings_form = d.getElementById('settings_form');

function getTasks() { return JSON.parse(localStorage.getItem('timerTasks')) }
function updateTasks(arr) {
	localStorage.setItem('timerTasks', JSON.stringify(arr))
	if (detectAnyActive() === true && localStorage.getItem('countDownAllStatus') == 'stopped') {
		countdownAll();
		localStorage.setItem('countDownAllStatus', 'active');
	}
}
if (getTasks() === null) updateTasks([]);

if (detectAnyActive() === true) {
	countdownAll();
	localStorage.setItem('countDownAllStatus', 'active');
} else if (getTasks().length !== 0) setBgStatus('alert');

// ----------------------------- SETUP DEFAULTS & SETTINGS

const settings_d = {
	intervalUnit: 60, // in seconds
	intervalUnitName: '',
	countDown: true, // true: show time remaining, false: show time passed
	quickTaskInterval: 35 * 60, // totals value multiplied by value of settings.intervalUnit
	quickTaskName: 'Stretch',
	quickTaskDescr: 'Eat, walk, pushup, drink, some or all.',
};
if (settings_d.intervalUnit === 60) settings_d.intervalUnitName = 'minute(s)';
else if (settings_d.intervalUnit === 1) settings_d.intervalUnitName = 'second(s)';

if (localStorage.getItem('settings') === null) {
	localStorage.setItem('settings', []);
	localStorage.setItem('settings', JSON.stringify(settings_d))
}
const getSettings = () => JSON.parse(localStorage.getItem('settings'));
const settings = getSettings();


// ----------------------------- CONFIGURE SETTINGS

settings_btn.addEventListener('click', () => {
	settings_form.className == 'dblock' ? settingsForm('collapse') : settingsForm('expand');
});

function settingsForm(what) {
	if (what == 'expand') {
		settings_btn.classList.replace('collapsed2', 'expanded2')
		settings_form.className = 'dblock';
	}
	if (what == 'collapse') {
		settings_btn.classList.replace('expanded2', 'collapsed2')
		settings_form.className = 'dnone';
	}
}

function settingsFormDefaults() {
	d.getElementById('settings_form_quickTaskName').setAttribute('value', settings.quickTaskName);
	d.getElementById('settings_form_quickTaskDescr').innerText = settings.quickTaskDescr;
	d.getElementById('settings_form_quickTaskInterval').setAttribute('value', (settings.quickTaskInterval / settings.intervalUnit));
	selectOption(d.getElementById('settings_form_intervalUnit'), settings.intervalUnit);
	selectOption(d.getElementById('settings_form_countDown'), String(settings.countDown));
}
settingsFormDefaults();

settings_form.addEventListener("submit", (e) => {
	e.preventDefault();
	let data = new FormData(settings_form);
	settingsFormSubmit(data);
});

function settingsFormSubmit(data) {
	let settings = {
		intervalUnit: Number(data.get('settings_form_intervalUnit')),
		intervalUnitName: '',
		countDown: Boolean(data.get('settings_form_countDown')), // true: time remaining, false: show time passed
		quickTaskInterval:
			Number(data.get("settings_form_quickTaskInterval"))
			* Number(data.get('settings_form_intervalUnit')),
		quickTaskName: data.get("settings_form_quickTaskName"),
		quickTaskDescr: data.get("settings_form_quickTaskDescr"),
	};
	if (settings.intervalUnit === 60) settings.intervalUnitName = 'minute(s)';
	else if (settings.intervalUnit === 1) settings.intervalUnitName = 'second(s)';
	updateSettings(settings);
}

function selectOption(el, option) {
	option = option.toString();
	for (let i = 0; i < el.options.length; i++) {
		if (el.options[i].getAttribute('value') == option) {
			el.options[i].setAttribute('selected', 'selected');
		}
	}
}

function updateSettings(arr) {
	localStorage.setItem('settings', JSON.stringify(arr));
	taskFormRenderTweaks();
	if (detectAnyActive() === true && localStorage.getItem('countDownAllStatus') == 'stopped') {
		countdownAll();
		localStorage.setItem('countDownAllStatus', 'active');
	}
}

// ----------------------------- ADD TASKS - FORM

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

function taskFormRenderTweaks() {
	d.getElementById('new_task_interval').setAttribute('placeholder', 'Interval time in ' + getSettings().intervalUnitName + '...');
}
taskFormRenderTweaks();

task_new_form.addEventListener("submit", (e) => {
	e.preventDefault();
	var data = new FormData(task_new_form);
	taskFormSubmit(data);
});

function taskFormSubmit(data) {
	addTask(
		data.get('task_name'),
		data.get('task_description'),
		(data.get('task_interval') * getSettings().intervalUnit)
	);
	cleanForm();
}

function cleanForm() {
	d.getElementById("new_task_name").value = "";
	d.getElementById("new_task_description").value = "";
	d.getElementById("new_task_interval").value = "";
	d.getElementById("new_task_name").focus();
}

task_new_quick.addEventListener("click", () => {
	addQuickTask();
});

function addQuickTask() {
	let settings = getSettings();
	addTask(settings.quickTaskName, settings.quickTaskDescr, settings.quickTaskInterval);
}

function addTask(name, description, interval) {
	let settings = getSettings();
	let arr = [];
	arr = getTasks();
	arr.push({
		name: name,
		descr: description,
		interval: interval,
		intervalUnit: settings.intervalUnit,
		intervalUnitName: settings.intervalUnitName,
		timepast: 0,
		finished: false
	});
	updateTasks(arr);
	arr = getTasks(); // TODO:nodig?
	renderTasks(arr);// TODO:nodig?


}

// ----------------------------- REMOVE TASKS

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
			intervalUnit: arr[i].intervalUnit,
			intervalUnitName: arr[i].intervalUnitName,
			finished: arr[i].finished
		});
	}
	updateTasks(newarr);
	if (newarr.length === 0) setBgStatus();
	renderTasks(newarr);
}

// ----------------------------- RENDER TASKS - MAIN

function renderTasks(arr) {
	task_container.innerHTML = "";
	for (let i = 0; i < arr.length; i++) {
		task_container.appendChild(renderTask(arr[i], i));
	}
}
renderTasks(getTasks());

function renderTask(i, key) {
	let settings = getSettings();// nodig?
	let el = d.createElement("div");
	el.className = "task"
	el.id = 'task-' + key;
	el.appendChild(renderTaskElement("h3", "task-name", i.name));
	el.appendChild(renderTaskElement("div", "task-descr", i.descr));
	el.appendChild(renderTaskElement(
		"div",
		"task-countdown-total",
		(i.interval / i.intervalUnit),
		'',
		'',
		'Interval: ',
		i.intervalUnitName
	));
	el.appendChild(renderTaskElement(
		'div',
		'task-countdown-current',
		countdownTimer(
			key,
			'countdown-task-' + key
		),
		'countdown-' + el.id, key,
		(settings.countDown === true ? 'Time left: ' : 'Time passed: '),
		(settings.intervalUnitName)
	));

	let el2 = document.createElement('div');
	el2.className = 'buttons';
	el2.appendChild(resetTaskLink(key))
	el2.appendChild(removeTaskLink(key));
	el.appendChild(el2);

	return el;
}

function renderTaskElement(
	node = "div",
	className,
	content,
	id = undefined,
	key,
	contentPrefix = '',
	contentSuffix = ''
) {
	let taskEl = d.createElement(node);
	taskEl.className = className;

	if (content === undefined) { // first draw of Time left/Time past
		let i = getTasks()[key];
		content = (
			settings.countDown === true ?
				Math.round((i.interval - i.timepast) / i.intervalUnit)
				:
				Math.round(i.timepast / i.intervalUnit)
		)
	}

	taskEl.innerHTML = contentPrefix + content + ' ' + contentSuffix;
	id !== undefined ? taskEl.id = id : '';
	return taskEl;
}

// ----------------------------- RENDER TASKS - DETAILS

function countdownTimer(key, id) { // individual per task
	const lb = setInterval((idtmp = id) => {
		if (d.getElementById(id)) {

			let settings = getSettings();
			if (settings.countDown) cPrefix = 'Time left: ';
			else cPrefix = 'Time passed: ';

			let c = d.getElementById(id);
			let arr = getTasks();
			if (arr[key].timepast === arr[key].interval) {
				stopit();
			}
			if (settings.countDown) {
				let timeleft = Math.round((arr[key].interval - arr[key].timepast) / arr[key].intervalUnit);
				c.innerHTML = cPrefix + timeleft + ' ' + arr[key].intervalUnitName;
			}
			else {
				let timepast = Math.round(arr[key].timepast / arr[key].intervalUnit);
				c.innerHTML = cPrefix + timepast + ' ' + arr[key].intervalUnitName
			}
		}
	}, 1000); // run every second/1000ms
	function stopit() {
		clearInterval(lb);
	}
}

function removeTaskLink(key) {
	let el = d.createElement("button");
	el.innerHTML = "remove task";
	el.className = "text ctacolor2";
	el.id = 'del-' + key;
	el.addEventListener("click", () => {
		removeTask(key);
	});
	return el;
}

function resetTaskLink(key) {
	let el = d.createElement('button');
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
	if (!detectAnyFinished(arr)) setBgStatus();
	updateTasks(arr);
	renderTasks(arr);
}

// ----------------------------- DETECTIONS

function detectAnyFinished(arr = getTasks()) {
	for (i of arr) {
		if (i.finished) return true;
	}
}

// Detect any still running tasks
function detectAnyActive(arr = getTasks()) {
	for (i of arr) {
		if (i.finished === false) return true;
	}
}

// ----------------------------- ALWAYS RUNNING & WHEN DONE... 

function countdownAll() {
	const lb = setInterval(() => {
		let arr = getTasks();
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].timepast < arr[i].interval) {
				arr[i].timepast++;
			}
			if (arr[i].timepast == arr[i].interval && arr[i].finished !== true) {
				playSound();
				arr[i].finished = true;
				setBgStatus('alert');
			}
			updateTasks(arr);
		}
		if (!detectAnyActive()) {
			stopit();
		}
	}, 1000); // run every second/1000ms

	function stopit() {
		clearInterval(lb);
		localStorage.setItem('countDownAllStatus', 'stopped');
		setBgStatus('alert');
	}
}

function playSound() {
	const siren = new Audio('siren1.wav');
	siren.play();
}

function setBgStatus(status = 'normal') {
	if (status === 'alert') d.getElementById('backdrop').style.backgroundColor = 'red';
	else d.getElementById('backdrop').style.backgroundColor = 'black';
}

