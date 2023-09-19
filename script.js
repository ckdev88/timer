// abstract for loading speed & less code
const d = document;
//build a timer, tasks and later a sort of agenda function for the day, connected with times, all using local storage, not needing any deployment server, just the html, js & css maybe even all in one html-file, so it's super easy to use.

// TODO: make intervalUnit, intervalUnitName a task-specific thing

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
const task_new_btn = d.getElementById("task_new_btn");
const task_new_form = d.getElementById("task_new_form");
const task_new_quick = d.getElementById("task_new_quick");
const task_container = d.getElementById("task_container");
const settings_btn = d.getElementById('settings_btn');
const settings_form = d.getElementById('settings_form');

// ------------- define settings ---------------
const settings_d = {
	intervalUnit: 1, // in seconds
	intervalUnitName: '',
	countDown: true, // true: show time remaining, false: show time passed
	quickTaskInterval: 35 * 1, // totals value multiplied by value of settings.intervalUnit
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
		d.getElementById('settings_form_quickTaskName').setAttribute('value', settings.quickTaskName);
		d.getElementById('settings_form_quickTaskDescr').innerText = settings.quickTaskDescr;
		d.getElementById('settings_form_quickTaskInterval').setAttribute('value', settings.quickTaskInterval);
		selectOption(d.getElementById('settings_form_intervalUnit'), settings.intervalUnit);
		selectOption(d.getElementById('settings_form_countDown'), String(settings.countDown));
	}
	settingsFormDefaults();
}
viewSettings();

// const settings_form = d.getElementById('settings_form');
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
function updateSettings(arr) { localStorage.setItem('settings', JSON.stringify(arr)); }
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

function getTasks() { return JSON.parse(localStorage.getItem('timerTasks')) }
function updateTasks(arr) { localStorage.setItem('timerTasks', JSON.stringify(arr)) }
if (getTasks() === null) updateTasks([]);

// TODO: split newTaskSubmit in 3 functions...
// TODO: ... 1 with listener ...
// TODO: ... the other with adding the task ...
// TODO: ... (and one to empty form fields (& place focus on first field?))
function newTaskSubmit() {
	task_new_form.addEventListener("submit", (e) => {
		e.preventDefault();
		var data = new FormData(task_new_form);
		addTask(
			data.get("task_name"),
			data.get("task_descr"),
			data.get("task_interval"),
		);
		d.getElementById("new_task_name").value = "";
		d.getElementById("new_task_descr").value = "";
		d.getElementById("new_task_interval").value = "";
	});
}

function addTask(name, descr, interval) {
	if (name) {
		let timerArr = getTasks();

		// TODO: add task specific intervalUnit (& intervalUnitName)
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

// use quick add function for base setup, using all basic characteristics
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
			i.interval / i.intervalUnit,
			key,
			'countdown-task-' + key,
			settings.countDown
		),
		'countdown-' + el.id, key,
		(settings.countDown === true ? 'Time left: ' : 'Time passed: '),
		(settings.intervalUnitName)
	));
	el.appendChild(removeTaskLink(key));
	if (i.finished === true) el.appendChild(resetTaskLink(key));
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

	// TODO: make this hack neat, this hack only applies to the countdown div field
	if (content === undefined) {
		content = (
			settings.countDown === true ?
				(getTasks()[key].interval - getTasks()[key].timepast)
				:
				getTasks()[key].timepast
		)
	}

	taskEl.innerHTML = contentPrefix + content + ' ' + contentSuffix;
	id !== undefined ? taskEl.id = id : '';
	return taskEl;
}

function addQuickTask() {
	let settings = getSettings();
	let arr = [];
	arr = getTasks();
	arr.push({
		name: settings.quickTaskName,
		interval: settings.quickTaskInterval,
		intervalUnit: settings.intervalUnit,
		intervalUnitName: settings.intervalUnitName,
		timepast: 0,
		descr: settings.quickTaskDescr,
	});

	updateTasks(arr);
	let arr2 = getTasks();
	renderTasks(arr2);
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
	d.body.style.backgroundColor = 'black';
	updateTasks(arr);
	renderTasks(arr);
}

function addResetTaskLink(key) {
	el = resetTaskLink(key);
	d.getElementById('task-' + key).appendChild(el);
}

function countdownTimer(limit, key, id) {
	let settings = getSettings();
	if (settings.countDown) cPrefix = 'Time left: ';
	else cPrefix = 'Time passed: ';
	const lb = setInterval((max = limit, id2 = id) => {
		if (d.getElementById(id)) {
			let c = d.getElementById(id2);
			let arr = getTasks();
			max *= arr[key].intervalUnit;
			if (arr[key].timepast === max) {
				stopit();
			}
			if (settings.countDown) {
				c.innerHTML =
					cPrefix + ((max - arr[key].timepast) / arr[key].intervalUnit).toFixed(0) + ' ' + arr[key].intervalUnitName;
				// c.innerHTML = cPrefix + (300 / 60);
			}
			else {
				c.innerHTML =
					cPrefix + (arr[key].timepast / arr[key].intervalUnit).toFixed(0) + ' ' + arr[key].intervalUnitName;
			}
		}
	}, 1000);//run every second/1000ms
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
				d.body.style.backgroundColor = 'red';
			}
			if (arr[i].finished == true && !d.getElementById('reset-' + i)) {
				addResetTaskLink(i);
			}
			updateTasks(arr);
		}
	}, 1000);//run every second/1000ms
}
countdownAll();

function playSound() {
	const siren = new Audio('siren1.wav');
	siren.play();
}
