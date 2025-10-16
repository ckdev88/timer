// TODO: add countdown if only to test, i dont think this needs a web worker
//
// ----------------------------- GLOBAL CONSTANTS

/** @type {boolean} pageInit starts with true value, is set to false after first run */
let pageInit = true

const INTERVALAMOUNT_DEFAULT = 50 // in minutes, if INTERVALUNIT_DEFAULT is 60
const INTERVALUNIT_DEFAULT = 60 // in seconds
/** @typedef {'en'|'pt'|'nl'} LanguageOptions */
/** @type { LanguageOptions } LANGUAGE_DEFAULT */
const LANGUAGE_DEFAULT = 'en'
/** @type [LanguageOptions] */
const LANGUAGE_SUPPORTED = ['en', 'nl', 'pt']

/**
 * @typedef {Object} Mood
 * @property {string} mood - name of the mood (rain, creativity, recharge)
 * @property {number} amount - number of audio files for this mood
 * @property {string} ext - file extension for mood-related audio file
 */

/**
 * Array of available mood configurations with associated metadata
 * @type {Array<Mood>}
 * @constant
 */
const moods = [
    { mood: 'rain', amount: 42, ext: 'mp3' },
    { mood: 'creativity', amount: 156, ext: 'mp3' },
    { mood: 'recharge', amount: 112, ext: 'mp3' },
    { mood: 'meditate', amount: 67, ext: 'mp3' },
    { mood: 'deepwork', amount: 222, ext: 'mp3' }
]

const MOOD_DEFAULT = 'rain' // TODO low prio, voor later

/** @type {Settings} settings */
let settings = {}

/** @type {{[string]:{[string]:string}}} - map with translations, strings */
const trl = {
    en: {
        localeString: 'en-US',
        pause: 'pause',
        reset: 'reset',
        resume: 'resume',
        remove: 'remove',
        Settings: 'Settings',
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
        Autoplay_on: 'Play audio automatically when timer starts',
        Autoplay_off: "Don't automatically play audio",
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
        Play_audio: 'Play audio',
        Pause_audio: 'Pause audio'
    },
    nl: {
        localeString: 'nl-NL',
        pause: 'pauze',
        reset: 'opnieuw',
        resume: 'vervolg',
        remove: 'verwijder',
        New_timer: 'Nieuwe timer',
        Settings: 'Instellingen',
        Quick_add: 'Snel nieuw',
        Name: 'Naam',
        Description: 'Beschrijving',
        Time: 'Tijd',
        Seconds: 'Seconden',
        seconds: 'seconden',
        s: 'seconden',
        Minutes: 'Minuten',
        minutes: 'minuten',
        m: 'minuten',
        Create_timer: 'Maak timer',
        General_settings: 'Algemene instellingen',
        Autoplay_on: 'Audio automatisch starten bij hervatting timer',
        Autoplay_off: 'Speel audio niet automatisch af',
        Count_down: 'Tel af naar 0',
        Count_up: 'Tel op van 0',
        Update_settings: 'Instellingen bijwerken',
        Quick_add_settings: 'Snel nieuw instellingen',
        Starting_time: 'Starttijd',
        Ending_time: 'Eindtijd',
        Time_left: 'Tijd over',
        Time_passed: 'Tijd gepasseerd',
        Quick_timer_default_name: 'Rekken',
        Quick_timer_default_description: 'Eten, lopen, strekken, zoiets.',
        Timer_created: 'Timer gemaakt',
        Settings_updated: 'Instellingen bijgewerkt',
        Select_time_unit: 'Selecteer tijdseenheid',
        now: 'nu',
        Play_audio: 'Speel audio',
        Pause_audio: 'Pauzeer audio'
    },
    pt: {
        localeString: 'pt-BR',
        pause: 'pausar',
        reset: 'redefinir',
        resume: 'continuar',
        remove: 'remover',
        New_timer: 'Novo timer',
        Settings: 'Configurações',
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
        Autoplay_on: 'Comença audio se timer comença', // que?
        Autoplay_off: 'Não comença audio automatico', // que?
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
        Play_audio: 'Tocar audio',
        Pause_audio: 'Pausar áudio'
    }
}
/**
 * @param {LanguageOptions} langkey - key used in object trl, key for language, either 'en' or 'pt'
 * @param {string} stringkey - value used in object trl, text that needs to be translated
 * @returns {Settings['language']}
 */
function getTranslation(langkey, stringkey) {
    return trl[langkey][stringkey]
}

/** @interface {Settings} settings */
settings = JSON.parse(localStorage.getItem('settings'))
if (settings === null) {
    /** @interface {Settings} global settings used by default either per timer of for the entire application  */
    settings = {
        intervalUnit: INTERVALUNIT_DEFAULT,
        intervalUnitName: getIntervalUnitName(INTERVALUNIT_DEFAULT),
        autoplay: true, // true: play audio, if not yet playing and a new timer is started/resumed
        countDown: true, // true: show time remaining, false: show time passed
        quickTimerInterval: INTERVALAMOUNT_DEFAULT * INTERVALUNIT_DEFAULT,
        quickTimerName: getTranslation(LANGUAGE_DEFAULT, 'Quick_timer_default_name'),
        quickTimerDescr: getTranslation(LANGUAGE_DEFAULT, 'Quick_timer_default_description'),
        language: LANGUAGE_DEFAULT,
        mood: MOOD_DEFAULT
    }
    localStorage.setItem('settings', JSON.stringify(settings))
}

const TIMEOUT_SHORT = 80

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
// const clean_btn = d.getElementById('clean_btn')
const btn_create_timer = d.getElementById('btn_create_timer')

const settings_form = {
    root: d.getElementById('settings_form'),
    quickTimerName: d.getElementById('settings_form_quickTimerName'),
    quickTimerDescr: d.getElementById('settings_form_quickTimerDescr'),
    quickTimerInterval: d.getElementById('settings_form_quickTimerInterval'),
    intervalUnit: d.getElementById('settings_form_intervalUnit'),
    autoplay: d.getElementById('settings_form_autoplay'),
    countDown: d.getElementById('settings_form_countDown'),
    language: d.getElementById('settings_form_language'),
    btn_update_settings: d.getElementById('btn_update_settings')
}

const general_settings_head = d.getElementById('general_settings_head')
const quick_add_settings_head = d.getElementById('quick_add_settings_head')

const statusbar = d.getElementById('statusbar')
const current_time = d.getElementById('current_time')
const current_date = d.getElementById('current_date')

const audioDir = './audio/'

function getRandomBackgroundAudio() {
    const themood = moods[moods.findIndex((item) => settings.mood === item.mood)]
    const max = themood.amount
    const ext = '.' + themood.ext
    const randomNumber = Math.ceil(Math.random() * max)
    return audioDir + settings.mood + '/' + randomNumber + ext
}

console.log('getRandomBackgroundAudio():', getRandomBackgroundAudio())
const audio = {
    dir: audioDir,
    background: new Audio(getRandomBackgroundAudio()),
    alert: new Audio(audioDir + 'alert.wav'),
    btn_play: d.getElementById('audio_play'),
    btn_pause: d.getElementById('audio_pause'),
    btn_next: d.getElementById('audio_next'), // FIXME to use or not to use.. not really used right now
    btn_change_mood: d.getElementById('audio_change_mood') // FIXME to use or not to use.. not really used right now
}
audio.btn_play.innerText = getTranslation(settings.language, 'Play_audio')
audio.btn_pause.innerText = settings.mood

/** @typedef {string} SimpleTime - Simple time in string format, like '12:59' */

/**
 * @typedef {object} Settings
 * @property {number} [intervalUnit=60] - Unit of interval per second (1 | 60)
 * @property {string} [intervalUnitName] - Second or minute, depending on current language/locale
 * @property {boolean} autoplay - Autoplay audio on timer start (true) or don't (false)
 * @property {boolean} countDown - Count up (false) or count down (true)
 * @property {number} quickTimerInterval - Totals value multiplied by value of settings.intervalUnit, e.g.: 45 * 60 will be 45 minutes
 * @property {string} quickTimerName
 * @property {string} quickTimerDescr
 * @property {LanguageOptions} language
 * @property {string} mood
 */

const timers = [
    {
        0: {
            descr: 'Eat, walk, push-up, drink, some or all.',
            endtime: '23:41',
            endtime_timestamp: null,
            finished: false,
            done: false,
            interval: 3000,
            intervalUnit: 60,
            name: 'stretch'
        },
        1: {
            descr: 'Eat, walk, push-up, drink, some or all.',
            endtime: '23:41',
            endtime_timestamp: null,
            finished: false,
            done: false,
            interval: 3000,
            intervalUnit: 60,
            name: 'stretch'
        }
    }
]

/**
 * @typedef {Object} Timer
 * @property {string} name - Timer name
 * @property {string} descr - Timer description
 * @property {number} interval - Interval value
 * @property {number} [intervalUnit=60]
 * @property {number} timepast
 * @property {boolean} [paused=false]
 * @property {boolean} finished - Whether the timer is finished
 * @property {boolean} done - Finished, but in green and without blinking alerts
 * @property {string} starttime
 * @property {string} endtime - End time in HH:MM format
 * @property {number|null} endtime_timestamp - End time as timestamp (null if not set)
 */

/**
 * @typedef {Object.<number, Timer>} Timers - Object with numeric keys mapping to Timer objects
 */

/**
 * @type {Timers[]}
 */
let timersArray = []
/**
 * Turn localstorage-string containing timers into an array and return it.
 * @var {String} timers
 * @returns {Timers} timers
 */
const getTimers = () => {
    /** @type {[]} timers */
    const timers = JSON.parse(localStorage.getItem('timerTimers'))
    if (!timers) updateTimers([])
    else bgStatus(timers) // TODO should just trigger whenever state of timer changes
    return timers
}

/** @type {Timers} timersArray - Array of timers, refreshed every second */
// TODO should do nothing when anyActive is false
timersArray = getTimers()
// setInterval(() => {
//     timersArray = getTimers()
// }, 1000)

/** @param {Timers} arr - state of localStorage.timerTimers */
function updateTimers(arr) {
    localStorage.setItem('timerTimers', JSON.stringify(arr))
    if (
        (detectAnyActive() === true && localStorage.getItem('countDownAllStatus') === 'stopped') ||
        arr.length === 0
    ) {
        runTimers()
    }
    renderTimers(arr)
}

if (pageInit === true) {
    countdownAll()
    localStorage.setItem('countDownAllStatus', 'active')
}

// ----------------------------- SETUP DEFAULTS & SETTINGS

/** @returns {LanguageOptions} 2-letter value of language code used by browser */
function getBrowserLanguage() {
    /** @type {LanguageOptions} */
    const langCode = navigator?.browserLanguage?.slice(0, 2)
    if (LANGUAGE_SUPPORTED.includes(langCode)) return langCode
    return LANGUAGE_DEFAULT
}
/** @type LanguageOptions */
const browserLanguage = getBrowserLanguage()

/** @returns {Settings} */
function getSettings() {
    return JSON.parse(localStorage.getItem('settings'))
}
const language = JSON.parse(localStorage.getItem('settings')).language ?? browserLanguage
/**
 * Set language of the app.
 * @param {LanguageOptions} lang
 * @returns {void}
 */
function setLanguage(lang = getBrowserLanguage()) {
    document.documentElement.lang = lang
    settings.language = lang
    translateElements(lang)
}
setLanguage(language)

// ----------------------------- CONFIGURE SETTINGS

/**
 * Expands or collapses the settings form
 * @param {'expand'|'collapse'} what
 * @returns {void}
 */
function settingsForm(what) {
    if (what === 'expand') {
        settings_btn.classList.replace('collapsed', 'expanded')
        settings_form.root.className = 'dblock'
        new_timer_form.className = 'dnone'
        new_timer_btn.classList.replace('expanded', 'collapsed')
    } else {
        settings_btn.classList.replace('expanded', 'collapsed')
        settings_form.root.className = 'dnone'
        new_timer_form.className = 'dblock'
        new_timer_btn.classList.replace('collapsed', 'expanded')
    }
}

/**
 * Sets the settings for timer added with `Quick add` and general settings
 * @returns {void}
 */
function settingsFormDefaults() {
    settings_form.quickTimerName.setAttribute('value', settings.quickTimerName)
    settings_form.quickTimerDescr.innerText = settings.quickTimerDescr
    settings_form.quickTimerInterval.setAttribute(
        'value',
        settings.quickTimerInterval / settings.intervalUnit
    )
    selectOption(settings_form.intervalUnit, settings.intervalUnit)
    selectOption(settings_form.autoplay, settings.autoplay ? 'true' : '')
    selectOption(settings_form.countDown, settings.countDown ? 'true' : '')
    selectOption(settings_form.language, settings.language)
}
settingsFormDefaults()

/**
 * Takes in either 1 or 60, returns s(econd) for 1, m(inute) for 60. Can further be handled by getTranslation
 * @param num {1|60}
 * @returns {'s'|'m'}
 */
function getIntervalUnitName(num) {
    if (num === 1) return 's'
    return 'm'
}

// TODO apply proper Interface of data parameter in JSDoc
/**
 * returns {void}
 */
function settingsFormSubmit(data) {
    /** @type { Settings } settings - Global settings config */
    const settings = {
        intervalUnit: Number(data.get('settings_form_intervalUnit')),
        autoplay: Boolean(data.get('settings_form_autoplay')),
        countDown: Boolean(data.get('settings_form_countDown')),
        quickTimerInterval:
            Number(data.get('settings_form_quickTimerInterval')) *
            Number(data.get('settings_form_intervalUnit')),
        quickTimerName: data.get('settings_form_quickTimerName'),
        quickTimerDescr: data.get('settings_form_quickTimerDescr'),
        language: data.get('settings_form_language')
    }
    console.log('settings:', settings)
    if (settings.language !== getSettings().language) setLanguage(settings.language)

    updateSettings(settings)

    showFeedback(settings_form.btn_update_settings, 'Settings_updated')
}

/**
 * Apply JS selection to form elements for new tasks & default values
 * returns {void}
 * @param el {HtmlElement}  -- HTML Element
 * @param option {FormData.option}
 */
function selectOption(el, option) {
    optionProp = option.toString()
    for (let i = 0; i < el.options.length; i++) {
        if (el.options[i].getAttribute('value') === optionProp) {
            el.options[i].setAttribute('selected', 'selected')
        } else el.options[i].removeAttribute('selected')
    }
}

/**
 * @param {Settings} arr
 * returns {void}
 */
function updateSettings(arr) {
    localStorage.setItem('settings', JSON.stringify(arr))
    selectOption(new_timer_intervalUnit, getSettings().intervalUnit)

    if (detectAnyActive() === true && localStorage.getItem('countDownAllStatus') === 'stopped') {
        countdownAll()
        localStorage.setItem('countDownAllStatus', 'active')
    }
}

// ----------------------------- ADD TASKS - FORM
selectOption(new_timer_intervalUnit, settings.intervalUnit)

/**
 * @param {'expand'|'collapse'} what
 * returns {void}
 */
function expandCollapseForm(what) {
    if (what === 'expand') {
        new_timer_btn.classList.replace('collapsed', 'expanded')
        new_timer_form.classList.replace('dnone', 'dblock')
        settings_form.root.classList.replace('dblock', 'dnone')
        settings_btn.classList.replace('expanded', 'collapsed')
    }
    if (what === 'collapse') {
        new_timer_form.classList.replace('dblock', 'dnone')
        new_timer_btn.classList.replace('expanded', 'collapsed')
    }
}

/**
 * @param {FormData} data - data input of the New Timer form
 */
function timerFormSubmit(data) {
    // change some default settings first
    if (data.get('timer_intervalUnit') !== settings.intervalUnit) {
        settings.intervalUnit = Number(data.get('timer_intervalUnit'))
        settings.intervalUnitName = getIntervalUnitName(
            settings.intervalUnit,
            getSettings().language
        )
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
 * Feedback is something like 'Timer created' or 'Settings updated'
 * @param {HTMLElement} afterElement - next to which the feedback will be inserted
 * @param {string} textKey - translation key present in object trl
 */
function showFeedback(afterElement, textKey) {
    if (document.getElementsByClassName('feedback').length > 0) {
        document.getElementsByClassName('feedback')[0].remove()
    }
    const aftertext = document.createElement('div')
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

/**
 * returns {void}
 */
function addQuickTimer() {
    const settings = getSettings()
    addTimer(settings.quickTimerName, settings.quickTimerDescr, settings.quickTimerInterval)
}

/**
 * @param {string} name - Name for the new timer
 * @param {string} description - (optional) Description for the new timer
 * @param {number} interval - Number of seconds for the new timer
 * @returns {void}
 */
function addTimer(name, description, interval) {
    const settings = getSettings()
    /** @type {SimpleTime} */
    const starttime = getCurrentTimeSimple()
    const endtime = getTimeSimple(false, interval)
    const starttime_timestamp = new Date().now

    timersArray.push({
        name: name,
        descr: description,
        interval: interval,
        intervalUnit: settings.intervalUnit,
        timepast: 0,
        paused: false,
        finished: false,
        done: false,
        starttime: starttime,
        starttime_timestamp: starttime_timestamp,
        endtime: endtime,
        endtime_timestamp: starttime_timestamp + interval * settings.intervalUnit * 1000
    })
    updateTimers(timersArray)
    settings.autoplay === true && audioPlayer('play')
    showFeedback(btn_create_timer, 'Timer_created')
}

function runTimers() {
    if (
        (detectAnyActive() === true && localStorage.getItem('countDownAllStatus') === 'stopped') ||
        timersArray.length === 0
        // 2025-10-02 TODO dit lijkt me niet heel logisch
    ) {
        countdownAll()
        localStorage.setItem('countDownAllStatus', 'active')
    }
}

// ----------------------------- PAUSE/RESUME TASK
/**
 * @param key {number}
 * @returns {void}
 */
function pauseTimerToggle(key) {
    for (let i = 0; i < timersArray.length; i++) {
        if (i === key) {
            timersArray[i].paused = !timersArray[i].paused
            !timersArray[i].paused && settings.autoplay === true && audioPlayer('play')
            if (detectAllPaused()) audioPlayer('pause')
        }
    }
    updateTimers(timersArray)
}

// ----------------------------- REMOVE TASKS

/**
 * Remove a timer block
 * @param key {number} - key of block containing a single timer
 * @returns {void}
 */
function removeTimer(key) {
    const newTimers = timersArray.filter((_i, index) => index !== key)
    // if (detectAnyActive() && settings.autoplay) audioPlayer() // TODO to keep or to remove?
    updateTimers(newTimers)
}

// ----------------------------- RENDER TASKS - MAIN
/**
 * @param {Timers} arr
 * @returns {void}
 */
function renderTimers(arr) {
    // TODO a part of timers can be reused if finished or paused, so no need to clean it up completely
    let curtime = new Date()
    curtime = curtime.getSeconds()

    // TODO prebuild timers that are paused or finished
    const pausedTimersHTMLElements = timer_container.getElementsByClassName('timer paused')
    const finishedTimersHTMLElements = timer_container.getElementsByClassName('timer finished')

    timer_container.innerHTML = ''
    if (pausedTimersHTMLElements.length > 0) timer_container.append(pausedTimersHTMLElements)
    if (finishedTimersHTMLElements.length > 0) timer_container.append(finishedTimersHTMLElements)

    for (let i = 0; i < pausedTimersHTMLElements.length; i++) {
        timer_container.appendChild(pausedTimersHTMLElements[i])
    }

    // show running timers first, these need to be refreshed every second
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].paused === false) {
            timer_container.appendChild(renderTimer(arr[i], i))
        }
    }
    // TODO finished & paused timers should be cached
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].finished === false && arr[i].paused === true) {
            timer_container.appendChild(renderTimer(arr[i], i))
        }
    }
}

function runCurrentTime() {
    const el = current_time
    const showtime = (el) => {
        el.innerHTML = getCurrentTimeSimple(true)
    }
    showtime(el)
    setInterval(() => {
        showtime(el)
    }, 1000)
}

const currentTime = () => {
    current_time.innerHTML = getCurrentTimeSimple(true)
}

function getCurrentDate(lang = getSettings().language) {
    return new Date().toLocaleString([getTranslation(lang, 'localeString')], {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    })
}

function setCurrentDate(lang = getSettings().language) {
    current_date.innerHTML = getCurrentDate(lang)
}

// load current timers & clock on load
renderTimers(getTimers())
runCurrentTime()
currentTime()
setCurrentDate()

/**
 * Creates the rendering of the timer, serves as a base for showing in renders: first, paused
 * @param i {string} timer item
 * @param key {number}
 * @param paused {boolean} reduce rebuilding when timer is paused
 * @returns {HTMLElement}
 */
function renderTimer(i, key, paused = false) {
    if (paused) return
    const settings = getSettings()
    const el = d.createElement('div')
    el.className = 'timer'
    if (i.paused) el.classList.add('paused')
    if (i.finished) el.classList.add('finished')
    if (i.done) el.classList.add('done')
    el.id = 'timer-' + key
    el.appendChild(renderTimerElement('h3', 'timer-name', i.name))
    el.appendChild(renderTimerElement('div', 'timer-descr', i.descr))
    el.appendChild(
        renderTimerElement(
            'div',
            'timer-countdown-current',
            countdownTimer(key, 'countdown-timer-' + key),
            'countdown-' + el.id,
            key,

            settings.countDown === true
                ? '<span class="time_left_text">' +
                      getTranslation(settings.language, 'Time_left') +
                      '</span>: '
                : '<span class="time_passed_text">' +
                      getTranslation(settings.language, 'Time_passed') +
                      '</span>: ',

            '&nbsp;/ ' +
                i.interval / i.intervalUnit +
                ' ' +
                getTranslation(settings.language, getIntervalUnitName(i.intervalUnit))
        )
    )

    const startEndTimeActionsWrapper = document.createElement('div')
    startEndTimeActionsWrapper.className = 'start_end_time_actions_wrapper'
    el.appendChild(startEndTimeActionsWrapper)

    const startTimeEndTimeWrapper = document.createElement('div')
    startTimeEndTimeWrapper.className = 'starttime_endtime_wrapper'

    startEndTimeActionsWrapper.appendChild(startTimeEndTimeWrapper)
    startTimeEndTimeWrapper.appendChild(
        renderTimerElement(
            'div',
            'starttime',
            '<span class="starting_time_text">' +
                getTranslation(settings.language, 'Starting_time') +
                '</span>: ' +
                i.starttime
        )
    )
    startTimeEndTimeWrapper.appendChild(
        renderTimerElement(
            'div',
            'endtime',
            '<span class="ending_time_text">' +
                getTranslation(settings.language, 'Ending_time') +
                '</span>: ' +
                i.endtime
        )
    )
    const timerActionsWrapper = document.createElement('div')
    timerActionsWrapper.className = 'timer_actions_wrapper buttons'

    if (!i.finished) timerActionsWrapper.appendChild(pauseTimerToggleLink(key, !i.paused))
    timerActionsWrapper.appendChild(resetTimerLink(key))
    if (i.finished) timerActionsWrapper.appendChild(doneTimerLink(key))
    timerActionsWrapper.appendChild(removeTimerLink(key))
    startEndTimeActionsWrapper.appendChild(timerActionsWrapper)

    return el
}

/**
 * Render the timer element, meaning 1 per timer.
 * @param {string} node - HTML node
 * @param {string} className
 * @param {any} content
 * @param {string} id
 * @param {number} key
 * @param {string} contentPrefix
 * @param {string} contentSuffix
 * @returns {void}
 */
function renderTimerElement(
    node,
    className,
    content,
    id,
    key,
    contentPrefix = '',
    contentSuffix = ''
) {
    const idProp = id && id !== undefined ? id : undefined
    let nodeProp = 'div'
    if (node && node !== 'div') nodeProp = node
    const timerEl = d.createElement(nodeProp)
    timerEl.className = className
    let contentProp = content
    if (contentProp === undefined) {
        // first draw of Time left/Time past
        const i = getTimers()[key]
        contentProp =
            settings.countDown === true
                ? Math.round((i.interval - i.timepast) / i.intervalUnit)
                : Math.round(i.timepast / i.intervalUnit)
    }

    timerEl.innerHTML = contentPrefix + contentProp + contentSuffix
    if (idProp !== undefined) timerEl.idProp = idProp
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
        if (
            timersArray[key] === undefined ||
            timersArray[key].paused === true ||
            timersArray[key].paused === undefined
        )
            stopTimer()
        else {
            if (d.getElementById(id)) {
                const settings = getSettings()
                if (settings.countDown)
                    cPrefix = `<span class="time_left_text">${getTranslation(settings.language, 'Time_left')}</span>: `
                else
                    cPrefix = `<span class="time_passed_text">${getTranslation(settings.language, 'Time_passed')}</span>: `

                const cSuffix = ` ${getTranslation(settings.language, getIntervalUnitName(timersArray[key].intervalUnit))}`
                const c = d.getElementById(id)

                if (timersArray[key].timepast === timersArray[key].interval) stopTimer()

                if (timersArray[key].paused === true) {
                    // console.log('arr paused');
                } else {
                    if (settings.countDown) {
                        timeleft = Math.round(
                            (timersArray[key].interval - timersArray[key].timepast) /
                                timersArray[key].intervalUnit
                        )
                        c.innerHTML =
                            cPrefix +
                            timeleft +
                            ' / ' +
                            timersArray[key].interval / timersArray[key].intervalUnit +
                            cSuffix
                    } else {
                        timepast = Math.round(
                            timersArray[key].timepast / timersArray[key].intervalUnit
                        )
                        c.innerHTML = cPrefix + timepast + cSuffix
                    }
                }
            }
        }
    }, 1000)
    function stopTimer() {
        clearInterval(tmpinterval)
    }
}

/**
 * Creates the pause/resume toggle button per timer
 * @param key {number}
 * @param paused {boolean}
 * @returns {HTMLButtonElement}
 */
function pauseTimerToggleLink(key, paused = false) {
    /** @type {HTMLButtonElement} el - rendering for button pause/resume */
    const el = d.createElement('button')
    el.className = 'control-btn'
    el.classList.add('pause')
    if (paused === true) {
        el.innerHTML = '<span>' + getTranslation(getSettings().language, 'pause') + '</span>'
        el.id = 'pause-' + key
    } else {
        el.innerHTML = '<span>' + getTranslation(getSettings().language, 'resume') + '</span>'
        el.id = 'resume-' + key
        el.classList.replace('pause', 'resume')
        document.title = 'Timer'
    }
    el.setAttribute('onClick', `pauseTimerToggle(${key})`)
    return el
}

/**
 * Creates the remove button per timer
 * @param {number} key
 * @returns {HTMLButtonElement}
 */
function removeTimerLink(key) {
    const el = d.createElement('button')
    el.innerHTML = '<span>' + getTranslation(getSettings().language, 'remove') + '</span>'
    el.className = 'control-btn remove'
    el.id = 'del-' + key
    el.setAttribute('onClick', `removeTimer(${key})`)
    return el
}

/**
 * Creates the done button per timer
 * @param {number} key
 * @returns {HTMLButtonElement}
 */
function doneTimerLink(key) {
    const el = d.createElement('button')
    el.innerHTML = '<span>' + getTranslation(getSettings().language, 'done') + '</span>'
    el.className = 'control-btn done'
    el.id = 'done-' + key
    el.setAttribute('onClick', `doneTimer(${key})`)
    return el
}
function doneTimer(key) {
    // TODO apply proper types, Timer typedef is a bit murky
    timersArray[key].finished = true
    timersArray[key].done = true
    document.title = 'Timer' // TODO this should become (in order) the first running timer, or the previous finished-without-done timer
    console.log('doneit')
    if (
        localStorage.getItem('audioPlay') === 'false' &&
        settings.autoplay === true &&
        detectAnyActive() &&
        audio.background.paused
    ) {
        audioPlayer('play')
    }
    updateTimers(timersArray)
}

/**
 * Creates the reset button per timer
 * @param {number} key
 * @returns {HTMLButtonElement}
 */
function resetTimerLink(key) {
    const el = d.createElement('button')
    el.innerHTML = '<span>' + getTranslation(getSettings().language, 'reset') + '</span>'
    el.className = 'control-btn'
    el.classList.add('reset')
    el.id = 'reset-' + key
    el.setAttribute('onClick', `resetTimer(${key})`)
    return el
}

function resetTimer(key) {
    // TODO apply proper types, Timer typedef is a bit murky
    timersArray[key].timepast = 0
    timersArray[key].starttime = getCurrentTimeSimple()
    timersArray[key].endtime = getTimeSimple(false, timersArray[key].interval)
    timersArray[key].finished = false
    timersArray[key].done = false
    document.title = 'Timer'
    if (
        localStorage.getItem('audioPlay') === 'false' &&
        settings.autoplay === true &&
        timersArray[key].paused === false
    ) {
        audioPlayer('play')
    }
    updateTimers(timersArray)
}

// ----------------------------- DETECTIONS
// TODO these should be replaced by webworker messages:

/**
 * @param {Timers} arr - array of localstorage.timerTimers
 */
function detectAnyFinished(arr = timersArray) {
    for (i of arr) {
        if (i.finished === true) return true
    }
    return false
}

function detectAnyDone(arr = timersArray) {
    for (i of arr) {
        if (i.done === true) return true
    }
    return false
}

function detectAnyPaused(arr = timersArray) {
    for (i of arr) {
        if (i.paused === true) return true
    }
    return false
}

// Detect any still running timers
function detectAnyActive(arr = timersArray) {
    for (i of arr) {
        if (i.finished === false) return true
    }
    return false
}

function detectAllPaused(arr = timersArray) {
    let count = 0
    for (i = 0; i < arr.length; i++) {
        if (arr[i].paused === true) count++
    }
    if (count === arr.length) {
        console.log('all paused')
        return true
    }
    return false
}

// ----------------------------- ALWAYS RUNNING & WHEN DONE...
function countdownAll() {
    let blinkRunningOn = false
    /** @type {string|undefined} finishedTimer */
    let finishedTimer
    let blinkFinishedOn = false

    if (detectAllPaused()) {
        console.log('alle pauserr')
        return
    }
    const countdownAllPerSecond = setInterval(() => {
        if (timersArray) {
            for (let i = 0; i < timersArray.length; i++) {
                if (timersArray[i].paused === true || timersArray[i].finished) continue
                // re-render timers that are not paused or finished
                if (
                    timersArray[i].timepast < timersArray[i].interval &&
                    timersArray[i].paused === false
                )
                    timersArray[i].timepast++
                if (
                    timersArray[i].timepast === timersArray[i].interval &&
                    timersArray[i].finished !== true
                ) {
                    timersArray[i].finished = true
                    setTimeout(() => {
                        audioPlayer('pause')
                        setTimeout(() => {
                            playAlert()
                        }, TIMEOUT_SHORT)
                    }, TIMEOUT_SHORT)
                }
                if (timersArray[i].finished === true) {
                    finishedTimer = timersArray[i].name
                    d.getElementById('timer-' + i).classList.add('finished')
                    if (timersArray[i].done === true)
                        d.getElementById('timer-' + i).classList.add('done')
                }
            }

            updateTimers(timersArray)
        }
        if (detectAllPaused() === true || !detectAnyActive()) {
            console.log('detected all paused or none active')
            audioPlayer('pause')
            stopTimer()
        }

        // tab/title manipulation for keepalive and notifying user, refreshed every second
        if (finishedTimer !== undefined && detectAnyFinished() === true) {
            blinkFinishedOn = !blinkFinishedOn
            if (!blinkFinishedOn) document.title = finishedTimer + '!'
            else document.title = finishedTimer
        } else {
            blinkRunningOn = !blinkRunningOn
            timerTitleBasic = 'Timer'
            if (!blinkRunningOn && document.title === timerTitleBasic)
                document.title = timerTitleBasic + '.'
            else document.title = timerTitleBasic
        }
    }, 1000)

    function stopTimer() {
        clearInterval(countdownAllPerSecond)
        localStorage.setItem('countDownAllStatus', 'stopped')
    }
}

/**
 * Plays audio until an alert is played, signaling a break
 * @param {'play'|'pause'|'next'|'volume_up'|'volume_down'|'change_mood'} state - trigger play or pause, defaults to play
 * @returns {void}
 */
function audioPlayer(state = 'play') {
    const wasPaused = audio.background.paused
    switch (state) {
        case 'play':
            audio.background.loop = false // TODO make this a setting
            audio.background.play()
            audio.btn_play.classList.add('dnone')
            audio.btn_pause.classList.remove('dnone')
            localStorage.setItem('audioPlay', true)
            break
        case 'pause':
            audio.btn_play.classList.remove('dnone')
            audio.btn_pause.classList.add('dnone')
            audio.background.pause()
            localStorage.setItem('audioPlay', false)
            break
        case 'next':
            audio.background.pause()
            audio.background.currentTime = 0 // Reset position
            audio.background.src = getRandomBackgroundAudio() // Clear source
            audio.background.load() // Force browser to release resources
            if (!wasPaused) audioPlayer('play')
            break
        case 'volume_up':
            if (audio.background.volume < 1) audio.background.volume += 0.2
            break
        case 'volume_down':
            if (audio.background.volume < 0.21) {
                audioPlayer('pause')
                console.log('do pause')
                break
            }
            audio.background.volume -= 0.2
            break
        case 'change_mood':
            settings.mood =
                moods[
                    (moods.findIndex((item) => item.mood === settings.mood) + 1) % moods.length
                ].mood
            updateSettings(settings)
            audio.btn_pause.innerText = settings.mood
            audioPlayer('next')
            break
    }
    // loop volumes 0.2 to 1, sometimes value is a bit off, like 0.200001, so using 1.9 (0.19*10) as base and buffer
    for (let i = 1.9; i < 11; i += 2) {
        const rounded = i + 0.1
        document.getElementById(`audio_volume_${rounded}`).classList.value =
            Math.round(audio.background.volume * 10) > i ? 'active' : 'inactive'
    }

    if (!audio.background.paused)
        document.getElementById('audio_volume_container').style.display = 'flex'
    else document.getElementById('audio_volume_container').style.display = 'none'
    if (audio.background.volume > 0.99)
        document.getElementById('audio_volume_up').style.visibility = 'hidden'
    else document.getElementById('audio_volume_up').style.visibility = 'visible'
    console.log('audio.background.volume:', audio.background.volume)
}

// function audioVolAdjust(increaseVolume=true){
//     let currentAudioVolume = audio.background.volume
//     console.log('currentAudioVolume:',current)
//     // if(increaseVolume)audio.background.volume = currentAudioVolume

// }

function playAlert() {
    audio.alert.play().catch((e) => console.log('Audio play failed:', e))
}

// ----------------------------- MISC METHODS
/**
 * Returns a simplified time in HH:MM:SS .
 * @param {boolean} seconds - optional: to activate seconds display
 * @returns {SimpleTime}
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

/**
 * Returns a simple time string-format for current time, like '12:59'
 * @param {boolean} seconds
 * @param {number} secondsToAdd
 * @returns {SimpleTime}
 */
function getTimeSimple(seconds = false, secondsToAdd = 0) {
    const now = new Date()
    if (secondsToAdd > 0) {
        const addingSeconds = now.getSeconds() + secondsToAdd
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
 * Interact with HTML body background status
 * @param {[]} arr - Pass parameters of said timer item, to pass those to HTML body class interaction
 * @returns {void}
 */
function bgStatus(arr) {
    if (!detectAnyActive() || detectAnyDone()) setBgStatus('normal')
    else if (detectAnyFinished(arr)) setBgStatus('alert')
    else if (detectAllPaused(arr)) setBgStatus('paused')
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

function translateElements(lang = getSettings().language) {
    newTextInElements('pause', getTranslation(lang, 'pause'))
    newTextInElements('resume', getTranslation(lang, 'resume'))
    newTextInElements('reset', getTranslation(lang, 'reset'))
    newTextInElements('remove', getTranslation(lang, 'remove'))

    new_timer_btn.querySelector('span').innerText = getTranslation(lang, 'New_timer')
    new_timer_form_head.innerText = getTranslation(lang, 'New_timer')
    new_timer_quick.innerText = getTranslation(lang, 'Quick_add')

    settings_btn.querySelector('span').innerText = getTranslation(lang, 'Settings')

    new_timer_name.setAttribute('placeholder', getTranslation(lang, 'Name') + '...')
    new_timer_description.setAttribute('placeholder', getTranslation(lang, 'Description') + '...')
    new_timer_interval.setAttribute('placeholder', getTranslation(lang, 'Time') + '...')
    new_timer_intervalUnit.options[0].innerText = getTranslation(lang, 'Seconds')
    settings_form.intervalUnit.options[0].innerText = getTranslation(lang, 'Seconds')
    new_timer_intervalUnit.options[1].innerText = getTranslation(lang, 'Minutes')
    settings_form.intervalUnit.options[1].innerText = getTranslation(lang, 'Minutes')
    new_timer_intervalUnit.options[0].innerText = getTranslation(lang, 'seconds')
    settings_form.intervalUnit.options[0].innerText = getTranslation(lang, 'seconds')
    new_timer_intervalUnit.options[1].innerText = getTranslation(lang, 'minutes')
    settings_form_intervalUnit.options[1].innerText = getTranslation(lang, 'minutes')

    btn_create_timer.setAttribute('value', getTranslation(lang, 'Create_timer'))

    general_settings_head.innerText = getTranslation(lang, 'General_settings')
    settings_form.autoplay.options[0].innerText = getTranslation(lang, 'Autoplay_on')
    settings_form.autoplay.options[1].innerText = getTranslation(lang, 'Autoplay_off')
    settings_form.countDown.options[0].innerText = getTranslation(lang, 'Count_down')
    settings_form.countDown.options[1].innerText = getTranslation(lang, 'Count_up')
    quick_add_settings_head.innerText = getTranslation(lang, 'Quick_add_settings')
    settings_form.btn_update_settings.setAttribute('value', getTranslation(lang, 'Update_settings'))

    newTextInElements('starting_time_text', getTranslation(lang, 'Starting_time'))
    newTextInElements('ending_time_text', getTranslation(lang, 'Ending_time'))
    newTextInElements('time_left_text', getTranslation(lang, 'Time_left'))
    newTextInElements('time_passed_text', getTranslation(lang, 'Time_passed'))

    audio.btn_play.innerText = getTranslation(lang, 'Play_audio')
    audio.btn_pause.innerText = settings.mood

    settings_form.intervalUnit.setAttribute('aria-label', getTranslation(lang, 'Select_time_unit'))
    new_timer_intervalUnit.setAttribute('aria-label', getTranslation(lang, 'Select_time_unit'))

    setCurrentDate(lang)
}

/**
 * Searches for HTML elements that contain `classname` and places `newText` value in it.
 * @param {string} classname
 * @param {string} newText
 * @returns {void}
 */
function newTextInElements(classname, newText) {
    const elements = d.getElementsByClassName(classname)
    for (i = 0; i < elements.length; i++) {
        elements[i].innerText = newText
    }
}

function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling)
}

/**
 * Set theme to dark if OS theme is dark
 * @returns void
 */
function detectColorScheme() {
    /** {'light'|'dark'} theme */
    let theme = 'dark' // default to dark
    // local storage is used to override OS theme settings
    if (localStorage.getItem('theme') && localStorage.getItem('theme') === 'light') theme = 'light'
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) theme = 'dark' //OS theme setting detected as light
    // set preferred theme with a `data-theme` attribute
    document.documentElement.setAttribute('data-theme', theme)
    // TODO: create setting so user can override & save setting in localstorage
}
detectColorScheme()

pageInit = false

// global button event listeners
settings_btn.addEventListener('click', () => {
    settings_form.root.className === 'dblock' ? settingsForm('collapse') : settingsForm('expand')
})
settings_form.root.addEventListener('submit', (e) => {
    e.preventDefault()
    const data = new FormData(settings_form.root)
    settingsFormSubmit(data)
})
new_timer_btn.addEventListener('click', () => {
    new_timer_form.classList.contains('dblock')
        ? expandCollapseForm('collapse')
        : expandCollapseForm('expand')
})
new_timer_form.addEventListener('submit', (e) => {
    e.preventDefault()
    /** @type {FormData} - Data input of the New Timer form */
    const data = new FormData(new_timer_form)
    timerFormSubmit(data)
})

new_timer_quick.addEventListener('click', () => addQuickTimer())
