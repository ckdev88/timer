// TODO FIXME: sometimes, on a timing mismatch, removing a timer causes more than one to be "removed",
// which probably means the new array isnt completely built, see fn def pauseTimerToggle &
// fn def removeTimer
// ----------------------------- GLOBAL CONSTANTS

/** @type {boolean} pageInit starts with true value, is set to false after first run */
let pageInit = true

/** @type {Document} d abbreviation of 'document' for loading speed & less code */
const d = document
const new_timer_btn = d.getElementById('new_timer_btn')
const new_timer_form = d.getElementById('new_timer_form')
const new_timer_form_head = d.getElementById('new_timer_form_head')
const new_timer_description = d.getElementById('new_timer_description')
const new_timer_interval = d.getElementById('new_timer_interval')
const new_timer_intervalUnit = d.getElementById('new_timer_intervalUnit')
const new_timer_quick = d.getElementById('new_timer_quick')
const timer_container = d.getElementById('timer_container')
const new_timer_name = d.getElementById('new_timer_name')
const settings_btn = d.getElementById('settings_btn')
const settings_form = d.getElementById('settings_form')
const clean_btn = d.getElementById('clean_btn')
const btn_create_timer = d.getElementById('btn_create_timer')

const setf_quickTimerName = d.getElementById('settings_form_quickTimerName')
const setf_quickTimerDescr = d.getElementById('settings_form_quickTimerDescr')
const setf_quickTimerInterval = d.getElementById('settings_form_quickTimerInterval')
const setf_intervalUnit = d.getElementById('settings_form_intervalUnit')
const setf_countDown = d.getElementById('settings_form_countDown')
const setf_language = d.getElementById('settings_form_language')
const btn_update_settings = d.getElementById('btn_update_settings')

const general_settings_head = d.getElementById('general_settings_head')
const quick_add_settings_head = d.getElementById('quick_add_settings_head')

const statusbar = d.getElementById('statusbar')

const current_time = d.getElementById('current_time')
const current_date = d.getElementById('current_date')

/**
 * Turn localstorage-string containing timers into an array and return it.
 * @var {String} timers
 * @returns {[]} timers
 */
function getTimers() {
	/** @type {[]} timers */
	let timers = JSON.parse(localStorage.getItem('timerTimers'))
	if (!timers) updateTimers([])
	else bgStatus(timers)
	return timers
}

/** @type {[]} timerspersec - Array of timers, refreshed every second */
let timerspersec = getTimers()
setInterval(() => {
	timerspersec = getTimers()
}, 1000)

/** @param {Array<any>} arr - state of localStorage.timerTimers */
function updateTimers(arr) {
	localStorage.setItem('timerTimers', JSON.stringify(arr))
	if (
		(detectAnyActive() === true && localStorage.getItem('countDownAllStatus') == 'stopped') ||
		arr.length === 0
	) {
		countdownAll()
		localStorage.setItem('countDownAllStatus', 'active')
	}
}

if (detectAnyActive() === true && pageInit === true) {
	// run once on init
	countdownAll()
	localStorage.setItem('countDownAllStatus', 'active')
}

/**
 * @type {{[string]:{[string]:string}}} - map with translations, strings
 */
const translationMap = {
	en: {
		localeString: 'en-US',
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
		seconds: 'seconds',
		s: 'seconds',
		Minutes: 'Minutes',
		minutes: 'minutes',
		m: 'minutes',
		Create_timer: 'Create timer',
		General_settings: 'General settings',
		Count_down: 'Count down to 0',
		Count_up: 'Count up from 0',
		Update_settings: 'Update settings',
		Quick_add_settings: 'Quick add settings',
		Starting_time: 'Starting time',
		Ending_time: 'Ending time',
		Time_left: 'Time left',
		Time_passed: 'Time passed',
		Quick_timer_default_name: 'Stretch',
		Quick_timer_default_description: 'Eat, walk, push-up, drink, some or all.',
		Timer_created: 'Timer created',
		Settings_updated: 'Settings updated',
		Select_time_unit: 'Select time unit',
		now: 'now',
	},
	pt: {
		localeString: 'pt-BR',
		pause: 'pausar',
		reset: 'redefinir',
		resume: 'continuar',
		remove: 'remover',
		New_timer: 'Novo timer',
		Quick_add: 'Adição rápida',
		Name: 'Nome',
		Description: 'Descrição',
		Time: 'Tempo',
		Seconds: 'Segundos',
		seconds: 'segundos',
		s: 'segundos',
		Minutes: 'Minutos',
		minutes: 'minutos',
		m: 'minutos',
		Create_timer: 'Criar timer',
		General_settings: 'Configurações gerais',
		Count_down: 'Contagem regressiva até zero',
		Count_up: 'Contagem a partir do zero',
		Update_settings: 'Atualizar',
		Quick_add_settings: 'Adição rápida configurações',
		Starting_time: 'Hora de início',
		Ending_time: 'Hora de termina',
		Time_left: 'Tempo restante',
		Time_passed: 'Tempo passado',
		Quick_timer_default_name: 'Alongar',
		Quick_timer_default_description: 'Comer, se movimentar, beber ou alguma coisa.',
		Timer_created: 'Timer criado',
		Settings_updated: 'Configurações atualizadas',
		Select_time_unit: 'Selecione a unidade de tempo',
		now: 'agora',
	},
}

// ----------------------------- SETUP DEFAULTS & SETTINGS

/** @type {string} language  */
let language
if (pageInit === true) {
	var browserLanguage = 'en'
	if (navigator.language.substring(0, 2) == 'pt') {
		browserLanguage = 'pt'
		setHtmlLang(browserLanguage)
	}
	language = browserLanguage
}

/** @interface {object} global settings used a default either per timer of for the entire application  */
const settings_d = {
	/**
	 * {number}
	 * @default 60 (seconds)
	 */
	intervalUnit: 60, // in seconds
	/**
	 * {string}
	 * @default ''
	 */
	intervalUnitName: '',
	countDown: true, // true: show time remaining, false: show time passed
	quickTimerInterval: 45 * 60, // totals value multiplied by value of settings.intervalUnit
	quickTimerName: getTranslation(language, 'Quick_timer_default_name'),
	quickTimerDescr: getTranslation(language, 'Quick_timer_default_description'),
	language: language,
}

settings_d.intervalUnitName = getIntervalUnitName(settings_d.intervalUnit)

if (localStorage.getItem('settings') === null) {
	localStorage.setItem('settings', [])
	localStorage.setItem('settings', JSON.stringify(settings_d))
}
const getSettings = () => JSON.parse(localStorage.getItem('settings'))
/**
 * {object}
 */
const settings = getSettings()

// ----------------------------- CONFIGURE SETTINGS

settings_btn.addEventListener('click', () => {
	settings_form.className == 'dblock' ? settingsForm('collapse') : settingsForm('expand')
})
/**
 * @param {'expand'|'collapse'} what
 * @returns {void}
 */
function settingsForm(what) {
	if (what == 'expand') {
		settings_btn.classList.replace('collapsed', 'expanded')
		settings_form.className = 'dblock'
		new_timer_form.className = 'dnone'
		new_timer_btn.classList.replace('expanded', 'collapsed')
	} else {
		settings_btn.classList.replace('expanded', 'collapsed')
		settings_form.className = 'dnone'
		new_timer_form.className = 'dblock'
		new_timer_btn.classList.replace('collapsed', 'expanded')
	}
}

function settingsFormDefaults() {
	setf_quickTimerName.setAttribute('value', settings.quickTimerName)
	setf_quickTimerDescr.innerText = settings.quickTimerDescr
	setf_quickTimerInterval.setAttribute('value', settings.quickTimerInterval / settings.intervalUnit)
	selectOption(setf_intervalUnit, settings.intervalUnit)
	selectOption(setf_countDown, String(settings.countDown))
	selectOption(setf_language, settings.language)
}
settingsFormDefaults()

settings_form.addEventListener('submit', (e) => {
	e.preventDefault()
	let data = new FormData(settings_form)
	settingsFormSubmit(data)
})

/**
 * @param {number} num
 * @returns {string}
 */
function getIntervalUnitName(num) {
	// 1 stands for 1 second, 60 is 1 minute
	if (num === 1) return getTranslation(language, 's')
	return getTranslation(language, 'm')
}

// TODO apply proper Interface of data parameter in JSDoc
/**
 * returns {void}
 */
function settingsFormSubmit(data) {
	// TODO apply proper Interface of settings const in JSDoc
	const settings = {
		intervalUnit: Number(data.get('settings_form_intervalUnit')),
		intervalUnitName: getIntervalUnitName(Number(data.get('settings_form_intervalUnit'))),
		countDown: Boolean(data.get('settings_form_countDown')),
		quickTimerInterval:
			Number(data.get('settings_form_quickTimerInterval')) *
			Number(data.get('settings_form_intervalUnit')),
		quickTimerName: data.get('settings_form_quickTimerName'),
		quickTimerDescr: data.get('settings_form_quickTimerDescr'),
		language: data.get('settings_form_language'),
	}
	if (settings.language !== getSettings().language) {
		changeLanguage(settings.language)
	}
	updateSettings(settings)

	showFeedback(btn_update_settings, 'Settings_updated')
	delete settings
}

/**
 * Apply JS selection to form elements for new tasks & default values
 * returns {void}
 * @param el {HtmlElement}  -- HTML Element
 * @param option {FormData.option}
 */
function selectOption(el, option) {
	option = option.toString()
	for (let i = 0; i < el.options.length; i++) {
		if (el.options[i].getAttribute('value') == option) {
			el.options[i].setAttribute('selected', 'selected')
		} else el.options[i].removeAttribute('selected')
	}
}

/**
 * returns {void}
 */
function updateSettings(arr) {
	localStorage.setItem('settings', JSON.stringify(arr))
	selectOption(new_timer_intervalUnit, getSettings().intervalUnit)

	if (detectAnyActive() === true && localStorage.getItem('countDownAllStatus') == 'stopped') {
		countdownAll()
		localStorage.setItem('countDownAllStatus', 'active')
	}
}

// ----------------------------- ADD TASKS - FORM
selectOption(new_timer_intervalUnit, settings.intervalUnit)

new_timer_btn.addEventListener('click', () => {
	new_timer_form.className == 'dblock'
		? expandCollapseForm('collapse')
		: expandCollapseForm('expand')
})

/**
 * returns {void}
 */
function expandCollapseForm(what) {
	if (what == 'expand') {
		new_timer_btn.classList.replace('collapsed', 'expanded')
		new_timer_form.className = 'dblock'
		settings_form.className = 'dnone'
		settings_btn.classList.replace('expanded', 'collapsed')
	}
	if (what === 'collapse') {
		new_timer_form.className = 'dnone'
		new_timer_btn.classList.replace('expanded', 'collapsed')
	}
}

new_timer_form.addEventListener('submit', (e) => {
	e.preventDefault()
	/**
	 * @type {FormData} - Data input of the New Timer form
	 */
	var data = new FormData(new_timer_form)
	timerFormSubmit(data)
})

/**
 * @param {FormData} data - data input of the New Timer form
 */
function timerFormSubmit(data) {
	// change some default settings first
	if (data.get('timer_intervalUnit') !== settings.intervalUnit) {
		settings.intervalUnit = Number(data.get('timer_intervalUnit'))
		settings.intervalUnitName = String(getIntervalUnitName(settings.intervalUnit))
		settings.language = getSettings().language
	}
	updateSettings(settings)

	addTimer(
		data.get('timer_name'),
		data.get('timer_description'),
		data.get('timer_interval') * Number(data.get('timer_intervalUnit'))
	)

	cleanForm()
}

/**
 * @param {HTMLElement} afterElement - next to which the feedback will be inserted
 * @param {string} textKey - translation key present in object translationMap
 */
function showFeedback(afterElement, textKey) {
	if (document.getElementsByClassName('feedback').length > 0) {
		document.getElementsByClassName('feedback')[0].remove()
	}
	let aftertext = document.createElement('div')
	aftertext.innerText = getTranslation(getSettings().language, textKey)
	aftertext.className = 'feedback'
	setTimeout(() => aftertext.remove(), 1500)
	return insertAfter(afterElement, aftertext)
}

/**
 * returns {void}
 */
function cleanForm() {
	new_timer_name.value = ''
	new_timer_description.value = ''
	new_timer_interval.value = ''
	new_timer_name.focus()
}

new_timer_quick.addEventListener('click', () => {
	addQuickTimer()
})

/**
 * returns {void}
 */
function addQuickTimer() {
	let settings = getSettings()
	addTimer(settings.quickTimerName, settings.quickTimerDescr, settings.quickTimerInterval)
}

/**
 * @param {string} name - Name for the new timer
 * @param {string} description - (optional) Description for the new timer
 * @param {number} interval - Number of seconds or minutes for the new timer
 */
function addTimer(name, description, interval) {
	let settings = getSettings()
	/** @type {[]} arr */
	arr = []
	const starttime = getCurrentTimeSimple()
	const endtime = getTimeSimple(false, interval)
	arr = getTimers()

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
		endtime: endtime,
	})
	updateTimers(arr)
	showFeedback(btn_create_timer, 'Timer_created')
	renderTimers(arr)
	delete arr
}

// ----------------------------- PAUSE/RESUME TASK
/**
 * @param key {number}
 */
function pauseTimerToggle(key) {
	arr = getTimers()
	const newarr = []
	let refresh = false // TODO: the refresh-variable is just a hotfix for issue TOOMANYLOADS
	// caused by toggling pause/resume
	for (let i = 0; i < arr.length; i++) {
		if (i === key) {
			arr[i].paused = !arr[i].paused
			if (arr[i].paused === false) refresh = true
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
			endtime: arr[i].endtime,
		})
	}

	updateTimers(newarr)
	renderTimers(newarr, false) // TODO: false isnt doing anything useful here, but somewhere here should be the proper bugfix for issue TOOMANYLOADS
	if (refresh === true) location.reload()

	delete arr
	delete newarr
}

// ----------------------------- REMOVE TASKS

/**
 * Remove a timer block
 * @param key {number} key of block containing a single timer
 */
function removeTimer(key) {
	arr = getTimers()
	/**
	 * @type {string|number[]} compose all timers except the one to be removed, to compose a new array of  timers */
	const newarr = []
	for (let i = 0; i < arr.length; i++) {
		if (i === key) continue // rebuild with all timers, but skip the specified one
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
		})
	}

	updateTimers(newarr)
	renderTimers(newarr)

	delete arr
	delete newarr
	return
}

function clearLocalStorage() {
	localStorage.clear()
	document.location = location
}

// ----------------------------- RENDER TASKS - MAIN
/**
 * @returns {void}
 */
function renderTimers(arr, paused = false) {
	timer_container.innerHTML = ''
	for (let i = 0; i < arr.length; i++) {
		if (paused === false) timer_container.appendChild(renderTimer(arr[i], i))
	}
}
renderTimers(getTimers())

function getCurrentTime() {
	const el = current_time
	const showtime = (el) => {
		el.innerHTML = getCurrentTimeSimple(true)
	}
	showtime(el)

	setInterval(() => {
		showtime(el)
	}, 1000)
}
getCurrentTime()

const currentTime = () => {
	current_time.innerHTML = getCurrentTimeSimple(true)
}
currentTime()

const getCurrentDate = (lang = getSettings().language) => {
	return new Date().toLocaleString([getTranslation(lang, 'localeString')], {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
	})
}
const setCurrentDate = (lang = getSettings().language) => {
	current_date.innerHTML = getCurrentDate(lang)
}
setCurrentDate()

/**
 * Creates the rendering of the timer
 * @param i {string} -- timer item
 * @param key {number}
 * @returns {HTMLElement}
 */
function renderTimer(i, key) {
	let settings = getSettings()
	let el = d.createElement('div')
	el.className = 'timer'
	if (i.paused) el.classList.add('paused')
	el.id = 'timer-' + key
	el.appendChild(renderTimerElement('h3', 'timer-name', i.name))
	el.appendChild(renderTimerElement('div', 'timer-descr', i.descr))
	el.appendChild(
		// first part of visual countdown: Time left/passed: xxx ...
		renderTimerElement(
			'div',
			'timer-countdown-current',
			countdownTimer(key, 'countdown-timer-' + key),
			'countdown-' + el.id,
			key,
			settings.countDown === true
				? '<span class="time_left_text">' + tl(getSettings().language, 'Time_left') + '</span>: '
				: '<span class="time_passed_text">' +
						tl(getSettings().language, 'Time_passed') +
						'</span>: '
		)
	)

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
	)
	el.appendChild(
		renderTimerElement(
			'div',
			'starttime',
			'<span class="starting_time_text">' +
				getTranslation(getSettings().language, 'Starting_time') +
				'</span>: ' +
				i.starttime
		)
	)
	el.appendChild(
		renderTimerElement(
			'div',
			'endtime',
			'<span class="ending_time_text">' +
				getTranslation(getSettings().language, 'Ending_time') +
				'</span>: ' +
				i.endtime
		)
	)
	let el2 = document.createElement('div')
	el2.className = 'buttons'
	if (!i.finished) el2.appendChild(pauseTimerToggleLink(key, !i.paused))
	el2.appendChild(resetTimerLink(key))
	el2.appendChild(removeTimerLink(key))
	el.appendChild(el2)

	return el
}

/**
 * Render the timer element, meaning 1 per timer.
 *
 * @param {string} node - HTML node
 * @param {string} className
 * @returns {void}
 *
 */
function renderTimerElement(
	node = 'div',
	className,
	content,
	id = undefined,
	key,
	contentPrefix = '',
	contentSuffix = ''
) {
	let timerEl = d.createElement(node)
	timerEl.className = className

	if (content === undefined) {
		// first draw of Time left/Time past
		let i = getTimers()[key]
		content =
			settings.countDown === true
				? Math.round((i.interval - i.timepast) / i.intervalUnit)
				: Math.round(i.timepast / i.intervalUnit)
	}

	timerEl.innerHTML = contentPrefix + content + ' ' + contentSuffix
	id !== undefined ? (timerEl.id = id) : ''
	return timerEl
}

// ----------------------------- RENDER TASKS - DETAILS
/**
 * Creates and renders the individual timer block
 * @param key {number} - key in timer in localStorage.timerTimers
 * @param id {string} - id of timer HTMLelement
 * @returns {void}
 */
function countdownTimer(key, id) {
	// individual per timer
	const tmpinterval = setInterval(() => {
		/*
		TODO: TOOMANYLOADS: there is still a bug that makes this run the amount of running timers for the only active timer, added by the amount of used pause/resume-toggles, every second (i.e. timer #0 can run 6 times per second) , this is hotfixed for now, by refreshing the page after resuming a timer, providing a clean array of timers, this issue in short is TOOMANYLOADS
		*/

		if (timerspersec[key] === undefined) {
			clearInterval(tmpinterval)
			stopit()
		} else {
			if (timerspersec[key].paused === true || timerspersec[key].paused === undefined) stopit()
			else {
				if (d.getElementById(id)) {
					let settings = getSettings()
					if (settings.countDown) {
						cPrefix =
							'<span class="time_left_text">' + tl(settings.language, 'Time_left') + '</span>: '
					} else {
						cPrefix =
							'<span class="time_passed_text">' + tl(settings.language, 'Time_passed') + '</span>: '
					}
					let c = d.getElementById(id)

					if (timerspersec[key].timepast === timerspersec[key].interval) {
						stopit()
					}
					if (timerspersec[key].paused === true) {
						// console.log('arr paused');
					} else {
						if (settings.countDown) {
							timeleft = Math.round(
								(timerspersec[key].interval - timerspersec[key].timepast) /
									timerspersec[key].intervalUnit
							)
							c.innerHTML = cPrefix + timeleft
						} else {
							timepast = Math.round(timerspersec[key].timepast / timerspersec[key].intervalUnit)
							c.innerHTML = cPrefix + timepast
						}
					}
				}
			}
		}
	}, 1000)
	function stopit() {
		clearInterval(tmpinterval)
	}
}

/**
 * @param key {number}
 * @param paused {boolean}
 */
function pauseTimerToggleLink(key, paused = false) {
	let el = d.createElement('button')
	el.className = 'text-btn'
	el.classList.add('pause')
	if (paused === true) {
		el.innerText = getTranslation(getSettings().language, 'pause')
		el.id = 'pause-' + key
	} else {
		el.innerText = getTranslation(getSettings().language, 'resume')
		el.id = 'resume-' + key
		el.classList.replace('pause', 'resume')
		document.title = 'Timer'
	}
	el.addEventListener('click', () => pauseTimerToggle(key))
	return el
}

/**
 * @param {number} key
 * @returns {HTMLButtonElement}
 */
function removeTimerLink(key) {
	let el = d.createElement('button')
	el.innerText = getTranslation(getSettings().language, 'remove')
	el.className = 'text-btn remove'
	el.id = 'del-' + key
	el.addEventListener('click', () => {
		removeTimer(key)
		location.reload()
	})
	return el
}

function resetTimerLink(key) {
	let el = d.createElement('button')
	el.innerText = getTranslation(getSettings().language, 'reset')
	el.className = 'text-btn'
	el.classList.add('reset')
	el.id = 'reset-' + key
	el.addEventListener('click', () => {
		resetTimer(key)
	})
	return el
}

function resetTimer(key) {
	var arr = getTimers()
	arr[key].timepast = 0
	arr[key].starttime = getCurrentTimeSimple()
	arr[key].endtime = getTimeSimple(false, arr[key].interval)
	arr[key].finished = false
	document.title = 'Timer'
	updateTimers(arr)
	renderTimers(arr)
	delete arr
}

// ----------------------------- DETECTIONS
/**
 * @param {Object} arr - array of localstorage.timerTimers
 */
function detectAnyFinished(arr = getTimers()) {
	for (i of arr) {
		if (i.finished === true) return true
	}
	return false
}

function detectAnyPaused(arr = getTimers()) {
	for (i of arr) {
		if (i.paused === true) return true
	}
	return false
}

// Detect any still running timers
function detectAnyActive(arr = getTimers()) {
	for (i of arr) {
		if (i.finished === false) return true
	}
	return false
}

// ----------------------------- ALWAYS RUNNING & WHEN DONE...
function countdownAll() {
	let blinkRunningOn = false
	/** @type {string|undefined} finishedTimer */
	let finishedTimer
	let blinkFinishedOn = false

	var countdownAllPerSecond = setInterval(() => {
		if (timerspersec) {
			arr = timerspersec
			for (let i = 0; i < arr.length; i++) {
				if (arr[i].paused === true) continue
				// re-render timers that are not paused
				if (arr[i].timepast < arr[i].interval && arr[i].paused === false) {
					arr[i].timepast++
				}
				if (arr[i].timepast == arr[i].interval && arr[i].finished !== true) {
					arr[i].finished = true
					playSound()
				}
				if (arr[i].finished === true) {
					finishedTimer = arr[i].name
					d.getElementById('timer-' + i).classList.add('finished')
				}
				updateTimers(arr)
			}
		}
		if (!detectAnyActive()) {
			stopit()
		}

		// tab/title manipulation for keepalive and notifying user, refreshed every second
		if (finishedTimer !== undefined && detectAnyFinished() === true) {
			blinkFinishedOn = !blinkFinishedOn
			if (!blinkFinishedOn) {
				document.title = finishedTimer + '!'
			} else document.title = finishedTimer
		} else {
			blinkRunningOn = !blinkRunningOn
			timerTitleBasic = 'Timer'
			if (!blinkRunningOn && document.title === timerTitleBasic) {
				document.title = timerTitleBasic + '.'
			} else {
				document.title = timerTitleBasic
			}
		}
	}, 1000)

	function stopit() {
		clearInterval(countdownAllPerSecond)
		localStorage.setItem('countDownAllStatus', 'stopped')
	}
}

function playSound() {
	const siren = new Audio('siren1.wav')
	siren.play()
}

// ----------------------------- MISC METHODS

/**
 * Returns a simplified time in HH:MM:SS .
 * @param {boolean} seconds - optional: to activate seconds display
 * @returns {string}
 */
// TODO remove this function when calls are replaced by reference to new getTimeSimple method
function getCurrentTimeSimple(seconds = false) {
	const now = new Date()
	let hours = now.getHours().toString()
	let minutes = now.getMinutes().toString()
	hours = !hours.slice(1) ? '0' + hours : hours
	minutes = !minutes.slice(1) ? '0' + minutes : minutes
	if (seconds) {
		let seconds = now.getSeconds().toString()
		seconds = !seconds.slice(1) ? '0' + seconds : seconds
		return hours + ':' + minutes + ':' + seconds
	}
	return hours + ':' + minutes
}

function getTimeSimple(seconds = false, secondsToAdd = 0) {
	let now = new Date()
	if (secondsToAdd > 0) {
		let addingSeconds = now.getSeconds() + secondsToAdd
		now.setSeconds(addingSeconds)
	}
	let hours = now.getHours().toString()
	let minutes = now.getMinutes().toString()
	hours = !hours.slice(1) ? '0' + hours : hours
	minutes = !minutes.slice(1) ? '0' + minutes : minutes
	if (seconds) {
		let seconds = now.getSeconds().toString()
		seconds = !seconds.slice(1) ? '0' + seconds : seconds
		return hours + ':' + minutes + ':' + seconds
	}
	return hours + ':' + minutes
}

// ----------------------------- BACKGROUND... LITERALLY

/**
 * Interact with html body background status
 * @param {[]} arr - Pass parameters of said timer item, to pass those to HTML body class interaction
 * @returns {void}
 */
function bgStatus(arr) {
	if (detectAnyFinished(arr)) setBgStatus('alert')
	else if (detectAnyPaused(arr)) setBgStatus('paused')
	else if (detectAnyActive(arr)) setBgStatus('running')
	else setBgStatus('normal')
}

/**
 * Change HTML body class to indicate timer status to user.
 * @param {string} status - Pass status (alert/paused/running) to change HTML body class
 * @returns {void}
 */
function setBgStatus(status = 'normal') {
	if (status === 'alert') statusbar.className = 'statusbar-alert'
	else if (status === 'paused') statusbar.className = 'statusbar-pause'
	else if (status === 'running') statusbar.className = 'statusbar-running'
	else statusbar.className = 'statusbar-default'
}

// ----------------------------- LANGUAGE DETECTION & SELECTION
/**
 * @param {'en'|'pt'} langkey - key used in object translationMap, key for language, either 'en' or 'pt'
 * @param {string} stringkey - value used in object translationMap, text that needs to be translated
 * @returns {{[string]:{[string]:string}}}
 */
function getTranslation(langkey, stringkey) {
	return translationMap[langkey][stringkey]
}

/** @param {string} lang */
function setHtmlLang(lang) {
	document.documentElement.lang = lang
}

/**
 * Set language of the app.
 * @param {string} lang - language code, current options: en,pt.
 * @returns {void}
 */
function changeLanguage(lang) {
	setHtmlLang(lang)
	newTextInElements('pause', getTranslation(lang, 'pause'))
	newTextInElements('resume', getTranslation(lang, 'resume'))
	newTextInElements('reset', getTranslation(lang, 'reset'))
	newTextInElements('remove', getTranslation(lang, 'remove'))

	new_timer_btn.innerText = getTranslation(lang, 'New_timer')
	new_timer_form_head.innerText = getTranslation(lang, 'New_timer')
	new_timer_quick.innerText = getTranslation(lang, 'Quick_add')

	new_timer_name.setAttribute('placeholder', getTranslation(lang, 'Name') + '...')
	new_timer_description.setAttribute('placeholder', getTranslation(lang, 'Description') + '...')
	new_timer_interval.setAttribute('placeholder', getTranslation(lang, 'Time') + '...')
	new_timer_intervalUnit.options[0].innerText = getTranslation(lang, 'Seconds')
	setf_intervalUnit.options[0].innerText = getTranslation(lang, 'Seconds')
	new_timer_intervalUnit.options[1].innerText = getTranslation(lang, 'Minutes')
	setf_intervalUnit.options[1].innerText = getTranslation(lang, 'Minutes')
	new_timer_intervalUnit.options[0].innerText = getTranslation(lang, 'seconds')
	setf_intervalUnit.options[0].innerText = getTranslation(lang, 'seconds')
	new_timer_intervalUnit.options[1].innerText = getTranslation(lang, 'minutes')
	setf_intervalUnit.options[1].innerText = getTranslation(lang, 'minutes')

	btn_create_timer.setAttribute('value', getTranslation(lang, 'Create_timer'))

	general_settings_head.innerText = getTranslation(lang, 'General_settings')
	setf_countDown.options[0].innerText = getTranslation(lang, 'Count_down')
	setf_countDown.options[1].innerText = getTranslation(lang, 'Count_up')
	quick_add_settings_head.innerText = getTranslation(lang, 'Quick_add_settings')
	btn_update_settings.setAttribute('value', getTranslation(lang, 'Update_settings'))

	newTextInElements('starting_time_text', getTranslation(lang, 'Starting_time'))
	newTextInElements('ending_time_text', getTranslation(lang, 'Ending_time'))
	newTextInElements('time_left_text', getTranslation(lang, 'Time_left'))
	newTextInElements('time_passed_text', getTranslation(lang, 'Time_passed'))

	setf_intervalUnit.setAttribute('aria-label', getTranslation(lang, 'Select_time_unit'))
	new_timer_intervalUnit.setAttribute('aria-label', getTranslation(lang, 'Select_time_unit'))

	setCurrentDate(lang)
}

/**
 * @returns {void}
 */
function newTextInElements(classname, newText) {
	var elements = d.getElementsByClassName(classname)
	for (i = 0; i < elements.length; i++) {
		elements[i].innerText = newText
	}
	delete elements
}

if (pageInit === true && settings.language === 'pt') {
	changeLanguage('pt')
}

function insertAfter(referenceNode, newNode) {
	referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling)
}

function detectColorScheme() {
	let theme = 'dark' // default to dark
	// local storage is used to override OS theme settings
	if (localStorage.getItem('theme') && localStorage.getItem('theme') == 'light') theme = 'light'
	else if (window.matchMedia('(prefers-color-scheme: dark)').matches) theme = 'dark' //OS theme setting detected as light
	// set preferred theme with a `data-theme` attribute
	document.documentElement.setAttribute('data-theme', theme)
	// TODO: create setting so user can override & save setting in localstorage
}
detectColorScheme()

pageInit = false
