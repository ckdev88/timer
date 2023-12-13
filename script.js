// Why this? To build a timer, timers and later a sort of agenda function for the day, connected with times, all using local storage, not needing any deployment server, just the html, js & css maybe even all in one html-file, so it's super easy to use.

// ----------------------------- GLOBAL CONSTANTS
const quicktest = false;
let pageInit = 1;

const d = document; // abstraction for loading speed & less code
const timer_new_btn = d.getElementById('timer_new_btn');
const timer_new_form = d.getElementById('timer_new_form');
const timer_new_name = d.getElementById('new_timer_name');
const timer_new_description = d.getElementById('new_timer_description');
const timer_new_interval = d.getElementById('new_timer_interval');
const timer_new_intervalUnit = d.getElementById('new_timer_intervalUnit');
const timer_new_quick = d.getElementById('timer_new_quick');
const timer_container = d.getElementById('timer_container');
const settings_btn = d.getElementById('settings_btn');
const settings_form = d.getElementById('settings_form');
const clean_btn = d.getElementById('clean_btn');

const setf_quickTimerName = d.getElementById('settings_form_quickTimerName');
const setf_quickTimerDescr = d.getElementById('settings_form_quickTimerDescr');
const setf_quickTimerInterval = d.getElementById('settings_form_quickTimerInterval');
const setf_intervalUnit = d.getElementById('settings_form_intervalUnit');
const setf_countDown = d.getElementById('settings_form_countDown');
const setf_language = d.getElementById('settings_form_language');
const backdrop = d.getElementById('backdrop');

function getTimers() {
	let timers = JSON.parse(localStorage.getItem('timerTimers'));
	if (!timers) updateTimers([]);
	else bgStatus(timers);
	return timers;
}

let cachedTimers = getTimers(); // null on clean localstorage

function updateTimers(arr) {
	localStorage.setItem('timerTimers', JSON.stringify(arr));
	if (
		(detectAnyActive() === true && localStorage.getItem('countDownAllStatus') == 'stopped') ||
		arr.length === 0
	) {
		countdownAll();
		localStorage.setItem('countDownAllStatus', 'active');
	}
}

if (detectAnyActive() === true) {
	countdownAll();
	localStorage.setItem('countDownAllStatus', 'active');
}
var translationMap = {
	en: {
		pause: 'pause',
		reset: 'reset',
		resume: 'resume',
		remove: 'remove',
		New_timer: 'New timer',
		Quick_add: 'Quick add',
		Name: 'Name',
		Description: 'Description',
		Time: 'Time',
		Seconds: 'Seconds',
		Minutes: 'Minutes',
		Create_timer: 'Create timer',
		General_settings: 'General settings',
		Count_down: 'Count down to 0',
		Count_up: 'Count up from 0',
		Update_settings: 'Update settings',
		Quick_add_settings: 'Quick add settings',
		Starting_time: 'Starting time',
		Time_left: 'Time left',
		Time_passed: 'Tempo passado',
	},
	pt: {
		pause: 'pausar',
		reset: 'redefinir',
		resume: 'continuar',
		remove: 'remover',
		New_timer: 'Novo timer',
		Quick_add: 'Adição rápido',
		Name: 'Nome',
		Description: 'Descrição',
		Time: 'Tempo',
		Seconds: 'Segundos',
		Minutes: 'Minutos',
		Create_timer: 'Criar timer',
		General_settings: 'Configurações gerais',
		Count_down: 'Contagem regressiva até zero',
		Count_up: 'Contagem a partir do zero',
		Update_settings: 'Atualizar',
		Quick_add_settings: 'Adição rápida configurações',
		Starting_time: 'Hora de início',
		Time_left: 'Tempo restante',
		Time_passed: 'Tempo passado',
	},
};

// ----------------------------- SETUP DEFAULTS & SETTINGS

var language = 'en';
if (navigator.language.substring(0, 2) == 'pt') language = 'pt';

let settings_d;

if (quicktest) {
	settings_d = {
		intervalUnit: 1, // in seconds
		intervalUnitName: '',
		countDown: true, // true: show time remaining, false: show time passed
		quickTimerInterval: 10, // totals value multiplied by value of settings.intervalUnit
		quickTimerName: 'TEST MODUS TASK',
		quickTimerDescr: '',
		language: language,
	};
} else {
	settings_d = {
		intervalUnit: 60, // in seconds
		intervalUnitName: '',
		countDown: true, // true: show time remaining, false: show time passed
		quickTimerInterval: 45 * 60, // totals value multiplied by value of settings.intervalUnit
		quickTimerName: 'Stretch',
		quickTimerDescr: 'Eat, walk, push-up, drink, some or all.',
		language: language,
	};
}

if (!language) language = getSettings().language;
if (language === 'pt') {
	settings_d.quickTimerName = 'Alongar';
	settings_d.quickTimerDescr = 'Comer, se movimentar, beber ou alguma coisa.';
}

settings_d.intervalUnitName = getIntervalUnitName(settings_d.intervalUnit);

if (localStorage.getItem('settings') === null) {
	localStorage.setItem('settings', []);
	localStorage.setItem('settings', JSON.stringify(settings_d));
}
const getSettings = () => JSON.parse(localStorage.getItem('settings'));
const settings = getSettings();

// ----------------------------- CONFIGURE SETTINGS

settings_btn.addEventListener('click', () => {
	settings_form.className == 'dblock' ? settingsForm('collapse') : settingsForm('expand');
});

function settingsForm(what) {
	if (what == 'expand') {
		settings_btn.classList.replace('collapsed2', 'expanded2');
		settings_form.className = 'dblock';
		timer_new_form.className = 'dnone';
		timer_new_btn.classList.replace('expanded', 'collapsed');
	}
	if (what == 'collapse') {
		settings_btn.classList.replace('expanded2', 'collapsed2');
		settings_form.className = 'dnone';
	}
}

function settingsFormDefaults() {
	setf_quickTimerName.setAttribute('value', settings.quickTimerName);
	setf_quickTimerDescr.innerText = settings.quickTimerDescr;
	setf_quickTimerInterval.setAttribute(
		'value',
		settings.quickTimerInterval / settings.intervalUnit
	);
	selectOption(setf_intervalUnit, settings.intervalUnit);
	selectOption(setf_countDown, String(settings.countDown));
	selectOption(setf_language, settings.language);
}
settingsFormDefaults();

settings_form.addEventListener('submit', (e) => {
	e.preventDefault();
	let data = new FormData(settings_form);
	settingsFormSubmit(data);
});

function getIntervalUnitName(num) {
	if (num === 1) return language == 'pt' ? 'segundos' : 'seconds';
	return language === 'pt' ? 'minutos' : 'minutes';
}
function settingsFormSubmit(data) {
	var settings = {
		intervalUnit: Number(data.get('settings_form_intervalUnit')),
		intervalUnitName: getIntervalUnitName(Number(data.get('settings_form_intervalUnit'))),
		countDown: Boolean(data.get('settings_form_countDown')),
		quickTimerInterval:
			Number(data.get('settings_form_quickTimerInterval')) *
			Number(data.get('settings_form_intervalUnit')),
		quickTimerName: data.get('settings_form_quickTimerName'),
		quickTimerDescr: data.get('settings_form_quickTimerDescr'),
		language: data.get('settings_form_language'),
	};
	if (settings.language !== getSettings().language) {
		changeLanguage(settings.language);
	}
	updateSettings(settings);
	delete settings;
}

function selectOption(el, option) {
	option = option.toString();
	for (let i = 0; i < el.options.length; i++) {
		if (el.options[i].getAttribute('value') == option) {
			el.options[i].setAttribute('selected', 'selected');
		} else el.options[i].removeAttribute('selected');
	}
}

function updateSettings(arr) {
	localStorage.setItem('settings', JSON.stringify(arr));
	selectOption(timer_new_intervalUnit, getSettings().intervalUnit);
	if (detectAnyActive() === true && localStorage.getItem('countDownAllStatus') == 'stopped') {
		countdownAll();
		localStorage.setItem('countDownAllStatus', 'active');
	}
}

// ----------------------------- ADD TASKS - FORM
selectOption(timer_new_intervalUnit, settings.intervalUnit);

timer_new_btn.addEventListener('click', () => {
	timer_new_form.className == 'dblock'
		? expandCollapseForm('collapse')
		: expandCollapseForm('expand');
});

function expandCollapseForm(what) {
	if (what == 'expand') {
		timer_new_btn.classList.replace('collapsed', 'expanded');
		timer_new_form.className = 'dblock';
		settings_form.className = 'dnone';
		settings_btn.classList.replace('expanded2', 'collapsed2');
	}
	if (what === 'collapse') {
		timer_new_form.className = 'dnone';
		timer_new_btn.classList.replace('expanded', 'collapsed');
	}
}

timer_new_form.addEventListener('submit', (e) => {
	e.preventDefault();
	var data = new FormData(timer_new_form);
	timerFormSubmit(data);
});

function timerFormSubmit(data) {
	// change some default settings first
	if (data.get('timer_intervalUnit') !== settings.intervalUnit) {
		settings.intervalUnit = Number(data.get('timer_intervalUnit'));
		settings.intervalUnitName = String(getIntervalUnitName(settings.intervalUnit));
	}
	updateSettings(settings);

	addTimer(
		data.get('timer_name'),
		data.get('timer_description'),
		data.get('timer_interval') * Number(data.get('timer_intervalUnit'))
	);
	cleanForm();
}

function cleanForm() {
	timer_new_name.value = '';
	timer_new_description.value = '';
	timer_new_interval.value = '';
	timer_new_name.focus();
}

timer_new_quick.addEventListener('click', () => {
	addQuickTimer();
});

function addQuickTimer() {
	let settings = getSettings();
	addTimer(settings.quickTimerName, settings.quickTimerDescr, settings.quickTimerInterval);
}

function addTimer(name, description, interval) {
	let settings = getSettings();
	arr = [];
	const starttime = getCurrentTimeSimple();
	arr = getTimers();

	arr.push({
		name: name,
		descr: description,
		interval: interval,
		intervalUnit: settings.intervalUnit,
		intervalUnitName: settings.intervalUnitName,
		timepast: 0,
		paused: false,
		finished: false,
		starttime: starttime,
	});
	updateTimers(arr);
	renderTimers(arr);
	delete arr;
}

// ----------------------------- PAUSE/RESUME TASK

function pauseTimerToggle(key) {
	arr = getTimers();
	var newarr = [];
	for (let i = 0; i < arr.length; i++) {
		if (i === key) {
			arr[i].paused = !arr[i].paused;
		}
		newarr.push({
			name: arr[i].name,
			descr: arr[i].descr,
			interval: arr[i].interval,
			timepast: arr[i].timepast,
			intervalUnit: arr[i].intervalUnit,
			intervalUnitName: arr[i].intervalUnitName,
			paused: arr[i].paused,
			finished: arr[i].finished,
			starttime: arr[i].starttime,
		});
	}

	updateTimers(newarr);
	renderTimers(newarr);

	delete arr;
	delete newarr;
}

// ----------------------------- REMOVE TASKS

function removeTimer(key) {
	arr = getTimers();

	var newarr = [];
	for (let i = 0; i < arr.length; i++) {
		if (i === key) continue; // rebuild with all timers, but skip the specified one
		newarr.push({
			name: arr[i].name,
			descr: arr[i].descr,
			interval: arr[i].interval,
			timepast: arr[i].timepast,
			intervalUnit: arr[i].intervalUnit,
			intervalUnitName: arr[i].intervalUnitName,
			paused: arr[i].paused,
			finished: arr[i].finished,
			starttime: arr[i].starttime,
		});
	}

	updateTimers(newarr);
	renderTimers(newarr);

	delete arr;
	delete newarr;
}

if (quicktest) {
	document.body.classList.add('quicktest');
	clean_btn.addEventListener('click', function () {
		clearLocalStorage();
	});
}

function clearLocalStorage() {
	localStorage.clear();
	document.location = location;
}

// ----------------------------- RENDER TASKS - MAIN
function renderTimers(arr) {
	timer_container.innerHTML = '';
	for (let i = 0; i < arr.length; i++) {
		timer_container.appendChild(renderTimer(arr[i], i));
	}
}
renderTimers(getTimers());

function renderTimer(i, key) {
	let settings = getSettings();
	let el = d.createElement('div');
	el.className = 'timer';
	if (i.paused) el.classList.add('paused');
	el.id = 'timer-' + key;
	el.appendChild(renderTimerElement('h3', 'timer-name', i.name));
	el.appendChild(renderTimerElement('div', 'timer-descr', i.descr));
	el.appendChild(
		// first part of visual countdown: Time left/passed: xxx ...
		renderTimerElement(
			'div',
			'timer-countdown-current',
			countdownTimer(key, 'countdown-timer-' + key),
			'countdown-' + el.id,
			key,
			settings.countDown === true
				? settings.language === 'pt'
					? '<span class="time_left_text">Tempo restante</span>: '
					: '<span class="time_left_text">Time left</span>: '
				: settings.language === 'pt'
				? '<span class="time_passed_text">Tempo passado</span>'
				: '<span class="time_passed_text">Time passed</span>: '
		)
	);

	el.appendChild(
		// second part of visual countdown: ... / xxx seconds/minutes
		renderTimerElement(
			'div',
			'timer-countdown-total',
			i.interval / i.intervalUnit,
			'',
			'',
			'&nbsp;/ ',
			i.intervalUnitName
		)
	);
	el.appendChild(
		renderTimerElement(
			'div',
			'starttime',
			'<span class="starting_time_text">' +
				(getSettings().language === 'pt' ? 'Hora de início' : 'Starting time') +
				'</span>: ' +
				i.starttime
		)
	);
	let el2 = document.createElement('div');
	el2.className = 'buttons';
	if (!i.finished) el2.appendChild(pauseTimerToggleLink(key, !i.paused));
	el2.appendChild(resetTimerLink(key));
	el2.appendChild(removeTimerLink(key));
	el.appendChild(el2);

	return el;
}

function renderTimerElement(
	node = 'div',
	className,
	content,
	id = undefined,
	key,
	contentPrefix = '',
	contentSuffix = ''
) {
	let timerEl = d.createElement(node);
	timerEl.className = className;

	if (content === undefined) {
		// first draw of Time left/Time past
		let i = getTimers()[key];
		content =
			settings.countDown === true
				? Math.round((i.interval - i.timepast) / i.intervalUnit)
				: Math.round(i.timepast / i.intervalUnit);
	}

	timerEl.innerHTML = contentPrefix + content + ' ' + contentSuffix;
	id !== undefined ? (timerEl.id = id) : '';
	return timerEl;
}

// ----------------------------- RENDER TASKS - DETAILS

function countdownTimer(key, id) {
	// individual per timer
	var lb = setInterval(() => {
		if (getTimers()[key].paused === true) stopit();
		if (d.getElementById(id)) {
			let settings = getSettings();
			if (settings.countDown)
				cPrefix =
					'<span class="time_left_text">' + tl(settings.language, 'Time_left') + '</span>: ';
			else
				cPrefix =
					'<span class="time_passed_text">' + tl(settings.language, 'Time_passed') + '</span>: ';
			let c = d.getElementById(id);
			let arr = getTimers();

			if (arr[key].timepast === arr[key].interval) {
				stopit();
			}
			if (arr[key].paused === true) {
				//console.log('arr paused');
			} else {
				if (settings.countDown) {
					timeleft = Math.round((arr[key].interval - arr[key].timepast) / arr[key].intervalUnit);
					c.innerHTML = cPrefix + timeleft;
				} else {
					timepast = Math.round(arr[key].timepast / arr[key].intervalUnit);
					c.innerHTML = cPrefix + timepast;
				}
			}
		}
	}, 1000);
	function stopit() {
		clearInterval(lb);
	}
}

function pauseTimerToggleLink(key, paused = false) {
	let el = d.createElement('button');
	el.className = 'text-btn';
	el.classList.add('pause');
	if (paused === true) {
		el.innerText = tl(getSettings().language, 'pause');
		el.id = 'pause-' + key;
	} else {
		el.innerText = tl(getSettings().language, 'resume'); // asdasd
		el.id = 'resume-' + key;
		el.classList.replace('pause', 'resume');
	}
	el.addEventListener('click', () => pauseTimerToggle(key));
	return el;
}

function removeTimerLink(key) {
	let el = d.createElement('button');
	el.innerText = tl(getSettings().language, 'remove');
	el.className = 'text-btn remove';
	el.id = 'del-' + key;
	el.addEventListener('click', () => {
		removeTimer(key);
	});
	return el;
}

function resetTimerLink(key) {
	let el = d.createElement('button');
	el.innerText = tl(getSettings().language, 'reset');
	el.className = 'text-btn';
	el.classList.add('reset');
	el.id = 'reset-' + key;
	el.addEventListener('click', () => {
		resetTimer(key);
	});
	return el;
}

function resetTimer(key) {
	let arr = getTimers();
	arr[key].timepast = 0;
	arr[key].starttime = getCurrentTimeSimple();
	arr[key].finished = false;
	updateTimers(arr);
	renderTimers(arr);
}

// ----------------------------- DETECTIONS
function detectAnyFinished(arr = getTimers()) {
	for (i of arr) {
		if (i.finished === true) return true;
	}
}

function detectAnyPaused(arr = getTimers()) {
	for (i of arr) {
		if (i.paused === true) return true;
	}
}

// Detect any still running timers
function detectAnyActive(arr = getTimers()) {
	if (arr) {
		for (i of arr) {
			if (i.finished === false) return true;
		}
	}
	return false;
}

// ----------------------------- ALWAYS RUNNING & WHEN DONE...

function countdownAll() {
	const lb = setInterval(() => {
		let arr = getTimers();
		// console.log('amount of timers', arr.length);
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].paused === true) continue;
			if (arr[i].timepast < arr[i].interval && arr[i].paused === false) {
				arr[i].timepast++;
			}
			if (arr[i].timepast == arr[i].interval && arr[i].finished !== true) {
				arr[i].finished = true;
				d.getElementById('timer-' + i).classList.add('finished');
				if (!quicktest) playSound();
			}
			updateTimers(arr);
		}
		if (!detectAnyActive()) {
			stopit();
		}
	}, 1000); // run every second/1000ms

	function stopit() {
		clearInterval(lb);
		localStorage.setItem('countDownAllStatus', 'stopped');
	}
}

function playSound() {
	const siren = new Audio('siren1.wav');
	siren.play();
}

// ----------------------------- MISC METHODS

function getCurrentTimeSimple() {
	const now = new Date();
	let hours = now.getHours().toString();
	let minutes = now.getMinutes().toString();
	hours = !hours.slice(1) ? '0' + hours : hours;
	minutes = !minutes.slice(1) ? '0' + minutes : minutes;
	return hours + ':' + minutes;
}

// ----------------------------- BACKGROUND... LITERALLY

function bgStatus(arr) {
	if (detectAnyFinished(arr)) setBgStatus('alert');
	else if (detectAnyPaused(arr)) setBgStatus('paused');
	else setBgStatus('normal');
}

function setBgStatus(status = 'normal') {
	if (status === 'alert') backdrop.className = 'backdrop-alert';
	else if (status === 'paused') backdrop.className = 'backdrop-pause';
	else backdrop.className = 'backdrop-default';
}

// ----------------------------- LANGUAGE DETECTION & SELECTION
function tl(langkey, stringkey) {
	return translationMap[langkey][stringkey];
}
function changeLanguage(lang) {
	newTextInElements('pause', tl(lang, 'pause'));
	newTextInElements('resume', tl(lang, 'resume'));
	newTextInElements('reset', tl(lang, 'reset'));
	newTextInElements('remove', tl(lang, 'remove'));

	d.getElementById('timer_new_btn').innerText = tl(lang, 'New_timer');
	d.getElementById('timer_new_form_head').innerText = tl(lang, 'New_timer');
	d.getElementById('timer_new_quick').innerText = tl(lang, 'Quick_add');

	d.getElementById('new_timer_name').setAttribute('placeholder', tl(lang, 'Name') + '...');
	d.getElementById('new_timer_description').setAttribute(
		'placeholder',
		tl(lang, 'Description') + '...'
	);
	d.getElementById('new_timer_interval').setAttribute('placeholder', tl(lang, 'Time') + '...');
	d.getElementById('new_timer_intervalUnit').options[0].innerText = tl(lang, 'Seconds');
	d.getElementById('settings_form_intervalUnit').options[0].innerText = tl(lang, 'Seconds');
	d.getElementById('new_timer_intervalUnit').options[1].innerText = tl(lang, 'Minutes');
	d.getElementById('settings_form_intervalUnit').options[1].innerText = tl(lang, 'Minutes');
	d.getElementById('btn_create_timer').setAttribute('value', tl(lang, 'Create_timer'));

	d.getElementById('general_settings_head').innerText = tl(lang, 'General_settings');
	d.getElementById('settings_form_countDown').options[0].innerText = tl(lang, 'Count_down');
	d.getElementById('settings_form_countDown').options[1].innerText = tl(lang, 'Count_up');
	d.getElementById('quick_add_settings_head').innerText = tl(lang, 'Quick_add_settings');
	d.getElementById('btn_update_settings').setAttribute('value', tl(lang, 'Update_settings'));

	newTextInElements('starting_time_text', tl(lang, 'Starting_time'));
	newTextInElements('time_left_text', tl(lang, 'Time_left'));
	newTextInElements('time_passed_text', tl(lang, 'Time_passed'));
}

function newTextInElements(classname, newText) {
	var elements = d.getElementsByClassName(classname);
	for (i = 0; i < elements.length; i++) {
		elements[i].innerText = newText;
	}
	delete elements;
}

if (pageInit === 1 && settings.language === 'pt') {
	changeLanguage('pt');
}
pageInit = 0;
