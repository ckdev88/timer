// TODO: add countdown if only to test, i dont think this needs a web worker
//
// ----------------------------- GLOBAL CONSTANTS

/** @type {boolean} pageInit starts with true value, is set to false after first run */
let pageInit = true
let isUpdatingTimers = false // global flag to prevent recursion / infinite loop

const RUN_ONLINE = window.location.protocol === 'https:' || window.location.protocol === 'http:'
const TESTING = false
const AUDIO_SHUFFLE = !RUN_ONLINE
const INTERVALAMOUNT_DEFAULT = 50 // in minutes, if INTERVALUNIT_DEFAULT is 60
const INTERVALUNIT_DEFAULT = 60 // in seconds
/** @typedef {'en'|'pt'|'nl'} LanguageOptions */
/** @type { LanguageOptions } LANGUAGE_DEFAULT */
const LANGUAGE_DEFAULT = 'en'
/** @type [LanguageOptions] */
const LANGUAGE_SUPPORTED = ['en', 'nl', 'pt']
// const SHOW_STARTING_TIME = false

/**
 * @typedef {Object} Mood
 * @property {string} mood - name of the mood (rain, creativity, recharge)
 * @property {number} amount - number of audio files for this mood
 * @property {string} filetype - file extension for mood-related audio file
 */

/**
 * Array of available mood configurations with associated metadata
 * @type {Array<Mood>}
 * @constant
 */
let moods = []
let audioDir = './audio/'
if (RUN_ONLINE) {
    // demo-audio files for online use
    audioDir += 'demo/'
    moods = [
        {mood: 'brownnoise', amount: 2, filetype: 'opus', loop: true},
        {mood: 'lofi', amount: 4, filetype: 'opus', loop: false},
        {mood: 'rain', amount: 4, filetype: 'opus', loop: true}
    ]
} else {
    // locally stored audio
    moods = [
        {mood: 'lofi', amount: 4, filetype: 'opus', loop: false},
        {mood: 'creativity', amount: 156, filetype: 'mp3', loop: false},
        {mood: 'deepwork', amount: 222, filetype: 'mp3', loop: false},
        {mood: 'meditate', amount: 67, filetype: 'mp3', loop: true},
        {mood: 'rain', amount: 42, filetype: 'mp3', loop: true},
        {mood: 'recharge', amount: 112, filetype: 'mp3', loop: false}
    ]
}

const MOOD_DEFAULT = moods[0].mood // TODO low prio, voor later

/** @type {Settings} settings */
let settings = {}

// keep track of active timers
const activeIntervals = new Map() // key -> intervalId for individual timers
let countdownAllInterval = null // main timer interval

/** @type {{[string]:{[string]:string}}} - map with translations, strings */
const trl = {
    en: {
        localeString: 'en-US',
        pause: 'pause',
        reset: 'reset',
        resume: 'resume',
        remove: 'remove',
        done: 'done',
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
        Ending_estimate: 'Ending estimate',
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
        done: 'klaar',
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
        Ending_estimate: 'Einde verwacht',
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
        done: 'deu',
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
        mood: moods[0].mood
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

function getRandomBackgroundAudio() {
    // static first
    if (!settings.mood) {
        settings.mood = moods[0].mood
        updateSettings(settings)
    }
    // let themood = moods[moods.findIndex((item) => settings.mood === item.mood)]
    themood = moods.find((item) => settings.mood === item.mood)

    if (!themood) {
        themood = moods[0]
        settings.mood = themood.mood
        updateSettings(settings)
    }

    const filetype = '.' + themood.filetype
    const max = themood.amount
    const randomNumber = Math.ceil(Math.random() * max)
    const track = randomNumber + filetype

    // return audioDir + settings.mood + '/' + randomNumber + filetype
    return audioDir + settings.mood + '/' + track
}

// log('getRandomBackgroundAudio():', getRandomBackgroundAudio())
const audio = {
    dir: audioDir,
    background: new Audio(getRandomBackgroundAudio()),
    alert: new Audio(audioDir + 'alert.wav'),
    btn_play: d.getElementById('audio_play'),
    btn_pause: d.getElementById('audio_pause'),
    btn_next: d.getElementById('audio_next'), // FIXME to use or not to use.. not really used right now
    btn_change_mood: d.getElementById('audio_change_mood'), // FIXME to use or not to use.. not really used right now
    currentTrack: 1 // TODO communicate with localstorage 

}
audio.btn_play.innerText = getTranslation(settings.language, 'Play_audio')
audio.btn_pause.innerText = settings.mood || moods[0].mood

audio.background.addEventListener('ended', () => {
    log('audio ended');
    const currentMood = moods.find((item) => settings.mood === item.mood);
    if (!currentMood) return;
    console.log('currentMood:', currentMood)

    if (currentMood.loop) {
        // TODO check if `audio.background.loop = true` doesnt just suffice
        audio.background.currentTime = 0;
        audio.background.play();
        return;
    }
    audioPlayer('next');
});

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

// Below is kept (for now) as an example
// const timers = [
//     {
//         0: {
//             descr: 'Eat, walk, push-up, drink, some or all.',
//             endtime: '23:41',
//             endtime_timestamp: null,
//             finished: false,
//             done: false,
//             interval: 3000,
//             intervalUnit: 60,
//             name: 'stretch'
//         },
//     }
// ]

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
let timersArray = getTimers() || [] // Fallback to empty array if null

/**
 * Turn localstorage-string containing timers into an array and return it.
 * @returns {Array} timers
 */
const getTimers = () => {
    /** @type {Array} timers */
    const timers = JSON.parse(localStorage.getItem('timerTimers'))
    if (!timers) {
        updateTimers([])
        return []
    }
    bgStatus(timers) // TODO should just trigger whenever state of timer changes
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
    // prevent recursion
    if (isUpdatingTimers) return false
    isUpdatingTimers = true

    // log('Updating timers, count:', arr.length)
    localStorage.setItem('timerTimers', JSON.stringify(arr))

    // Update status bar based on timer states
    bgStatus(arr)

    // Always render when timers array changes (length or content)
    const shouldRender =
        arr.length !== timersArray.length || JSON.stringify(arr) !== JSON.stringify(timersArray)

    if (shouldRender) {
        // log('Rendering timers due to changes')
        renderTimers(arr)
    } else {
        // log('No render needed - timers unchanged')
    }

    // Update the global reference
    timersArray = arr

    // Only start countdown if needed - use detectAnyRunning instead of detectAnyActive
    const currentStatus = localStorage.getItem('countDownAllStatus')
    const anyRunning = getTimerState().anyRunning

    if (anyRunning && (currentStatus === 'stopped' || !countdownAllInterval)) {
        // log('Starting countdown from updateTimers')
        countdownAll()
    }

    isUpdatingTimers = false
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
    // log('settings:', settings)
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
    const optionProp = option.toString()
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

    if (
        getTimerState().anyActive === true &&
        localStorage.getItem('countDownAllStatus') === 'stopped'
    ) {
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
    const starttime_timestamp = Date.now()

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

    // Force update and render
    updateTimers(timersArray)

    // Ensure the timer is visible in the DOM
    renderTimers(timersArray)

    log('settings.autoplay', settings.autoplay)
    if (settings.autoplay === true) audioPlayer('play')
    showFeedback(btn_create_timer, 'Timer_created')

    // Debug log
    // log('Added timer, total timers:', timersArray.length)
}

// ----------------------------- PAUSE/RESUME TASK
/**
 * @param key {number}
 * @returns {void}
 */
function pauseTimerToggle(key) {
    const timer = timersArray[key]
    if (!timer) return

    timer.paused = !timer.paused

    // Update audio based on state
    if (!timer.paused && settings.autoplay === true) {
        // Timer is being resumed/unpaused
        audioPlayer('play')
    } else if (timer.paused) {
        // Timer is being paused - check if this was the last running timer
        const newState = getTimerState()
        if (!newState.anyRunning) {
            audioPlayer('pause')
        }
    }

    // Update the DOM
    const timerEl = document.getElementById('timer-' + key)
    if (timerEl) {
        // Toggle the paused class
        if (timer.paused) timerEl.classList.add('paused')
        else timerEl.classList.remove('paused')

        // Update the button
        updatePauseButton(key)
    }

    // CRITICAL: Restart countdown if we're resuming a timer and countdown isn't running
    if (!timer.paused) {
        const currentStatus = localStorage.getItem('countDownAllStatus')
        if (currentStatus === 'stopped' || !countdownAllInterval) {
            log('Resuming timer, restarting countdown...')
            countdownAll()
        }
    }

    bgStatus(timersArray)
    localStorage.setItem('timerTimers', JSON.stringify(timersArray))
}

/**
 * Updates just the pause/resume button for a specific timer without full re-render
 * @param {number} key
 */
function updatePauseButton(key) {
    const timer = timersArray[key]
    if (!timer) return

    // Remove existing pause/resume button
    const oldPauseBtn = document.getElementById('pause-' + key)
    const oldResumeBtn = document.getElementById('resume-' + key)
    if (oldPauseBtn) oldPauseBtn.remove()
    if (oldResumeBtn) oldResumeBtn.remove()

    // Create and insert the correct button
    const timerActionsWrapper = document.querySelector(`#timer-${key} .timer_actions_wrapper`)
    if (timerActionsWrapper) {
        const newButton = pauseTimerToggleLink(key, !timer.paused)
        timerActionsWrapper.insertBefore(newButton, timerActionsWrapper.firstChild)
    }
}

// ----------------------------- REMOVE TASKS

/**
 * Remove a timer block
 * @param key {number} - key of block containing a single timer
 * @returns {void}
 */
function removeTimer(key) {
    // Store state before removal to check if we're removing the last running timer
    const stateBeforeRemoval = getTimerState()

    //clean up interval for this timer
    if (activeIntervals.has(key)) {
        clearInterval(activeIntervals.get(key))
        activeIntervals.delete(key)
    }
    const newTimers = timersArray.filter((_i, index) => index !== key)
    // if (detectAnyActive() && settings.autoplay) audioPlayer() // TODO to keep or to remove?

    // If we removed the last running timer, pause audio
    if (stateBeforeRemoval.anyRunning) {
        const stateAfterRemoval = getTimerState(newTimers)
        if (!stateAfterRemoval.anyRunning) audioPlayer('pause')
    }

    updateTimers(newTimers)
}

// add cleanup function for page unload
function cleanupAllIntervals() {
    // clear individual timer intervals
    for (const intervalId of activeIntervals.values()) {
        clearInterval(intervalId)
    }
    activeIntervals.clear()

    // clear main interval
    if (countdownAllInterval) {
        clearInterval(countdownAllInterval)
        countdownAllInterval = null
    }
}

// add event listener for page unload
window.addEventListener('beforeunload', cleanupAllIntervals)
window.addEventListener('unload', cleanupAllIntervals)

/**
 * Update timer display without full DOM rebuild
 * @param {number} key - Timer index
 */
function updateTimerDisplay(key) {
    const displayEl = document.getElementById('countdown-timer-' + key)
    if (displayEl) {
        const timer = timersArray[key]
        if (!timer) return

        const settings = getSettings()
        let displayText
        let prefixText = ''
        const unitName = getTranslation(settings.language, getIntervalUnitName(timer.intervalUnit))

        if (settings.countDown) {
            const timeleft = Math.round((timer.interval - timer.timepast) / timer.intervalUnit)
            const totalUnits = timer.interval / timer.intervalUnit
            displayText = timeleft + ' / ' + totalUnits + ' ' + unitName
            prefixText =
                '<span class="time_left_text">' +
                getTranslation(settings.language, 'Time_left') +
                '</span>: '
        } else {
            const timepast = Math.round(timer.timepast / timer.intervalUnit)
            displayText = timepast + ' ' + unitName
            prefixText =
                '<span class="time_passed_text">' +
                getTranslation(settings.language, 'Time_passed') +
                '</span>: '
        }

        // Only update if changed
        const newContent = prefixText + displayText
        if (displayEl.innerHTML !== newContent) {
            displayEl.innerHTML = newContent
        }
    }
}

// ----------------------------- RENDER TASKS - MAIN
/**
 * @param {Timers} arr
 * @returns {void}
 */
function renderTimers(arr) {
    log('Rendering timers:', arr.length)

    // clear container completely for simplicity
    timer_container.innerHTML = ''

    if (!arr || arr.length === 0) {
        // log('No timers to render')
        return
    }
    // Render all timers
    for (let i = 0; i < arr.length; i++) {
        const timerEl = renderTimer(arr[i], i)
        timer_container.appendChild(timerEl)
        // log('Rendered timer:', arr[i].name)
    }
    log('Finished rendering all timers')
}

/**
 * str {string} - first arg: string to describe what value is about
 * val {unknown|undefined} - second arg: value to test
 */
function log(str, val) {
    if (RUN_ONLINE || !TESTING) return
    if (val) console.log(str, val)
    else console.log(str)
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
    log('Rendering timer:', i.name, 'key:', key, 'paused:', paused, 'done:', i.done)

    if (paused) return
    const settings = getSettings()
    const el = d.createElement('div')
    el.className = 'timer'
    if (i.paused) el.classList.add('paused')
    if (i.finished) el.classList.add('finished')
    if (i.done) el.classList.add('done') // Make sure done class is added
    el.id = 'timer-' + key

    // ... rest of the timer content ...
    el.appendChild(renderTimerElement('h3', 'timer-name', i.name))
    el.appendChild(renderTimerElement('div', 'timer-descr', i.descr))
    el.appendChild(
        renderTimerElement(
            'div',
            'timer-countdown-current',
            countdownTimer(key),
            'countdown-timer-' + key,
            key,
            settings.countDown === true
                ? '<span class="time_left_text">' +
                getTranslation(settings.language, 'Time_left') +
                '</span>: '
                : '<span class="time_passed_text">' +
                getTranslation(settings.language, 'Time_passed') +
                '</span>: ',
            ''
        )
    )

    const startEndTimeActionsWrapper = document.createElement('div')
    startEndTimeActionsWrapper.className = 'start_end_time_actions_wrapper'
    el.appendChild(startEndTimeActionsWrapper)

    const startTimeEndTimeWrapper = document.createElement('div')
    startTimeEndTimeWrapper.className = 'starttime_endtime_wrapper'
    // ... start/end time logic ...

    const timerActionsWrapper = document.createElement('div')
    timerActionsWrapper.className = 'timer_actions_wrapper buttons'

    // Only show pause/resume if not finished AND not done
    if (!i.finished && !i.done) {
        // This will show "resume" button because i.paused is true after reset
        timerActionsWrapper.appendChild(pauseTimerToggleLink(key, !i.paused))
    }

    timerActionsWrapper.appendChild(resetTimerLink(key))

    // Only show done button if finished but not done
    if (i.finished && !i.done) {
        timerActionsWrapper.appendChild(doneTimerLink(key))
    }

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
    if (idProp !== undefined) timerEl.id = idProp
    return timerEl
}

// ----------------------------- RENDER TASKS - DETAILS
/**
 * Creates and renders the individual timer block
 * @param key {number} - key in timer in localStorage.timerTimers
 * @param id {string} - id of timer HTMLelement
 * @returns {string} - The display text for the timer
 * @returns {void}
 */
function countdownTimer(key) {
    const timer = timersArray[key]
    if (!timer) return '0'

    const settings = getSettings()
    const unitName = getTranslation(settings.language, getIntervalUnitName(timer.intervalUnit))

    if (settings.countDown) {
        const timeleft = Math.round((timer.interval - timer.timepast) / timer.intervalUnit)
        const totalUnits = timer.interval / timer.intervalUnit
        return timeleft + ' / ' + totalUnits + ' ' + unitName
    } else {
        const timepast = Math.round(timer.timepast / timer.intervalUnit)
        return timepast + ' ' + unitName
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
    // log('Marking timer as done:', key)

    if (timersArray[key]) {
        timersArray[key].finished = true
        timersArray[key].done = true
        timersArray[key].paused = true

        // Check if this was the last running timer
        const newState = getTimerState()
        if (!newState.anyRunning) {
            audioPlayer('pause')
        }

        // Remove the old timer element
        const oldTimerEl = document.getElementById('timer-' + key)
        if (oldTimerEl) {
            oldTimerEl.remove()
        }

        // Re-render the timer
        const newTimerEl = renderTimer(timersArray[key], key)
        timer_container.appendChild(newTimerEl)

        // Update storage
        localStorage.setItem('timerTimers', JSON.stringify(timersArray))

        // Update status bar
        bgStatus(timersArray)

        document.title = 'Timer'

        // log('Timer re-rendered as done')
    }
}

/**
 * Updates the DOM to reflect the done state of a specific timer
 * @param {number} key
 */
function updateTimerDoneState(key) {
    const timer = timersArray[key]
    if (!timer) return

    const timerEl = document.getElementById('timer-' + key)
    if (!timerEl) return

    // Update classes
    timerEl.classList.add('finished', 'done')
    timerEl.classList.remove('paused') // Remove paused class since it's done

    // Remove the done button since it's no longer needed
    const doneBtn = document.getElementById('done-' + key)
    if (doneBtn) {
        doneBtn.remove()
    }

    // remove pause button if exists on done timer TODO dit kan beter met css
    const pauseBtn = document.getElementById('pause-' + key)
    const resumeBtn = document.getElementById('resume-' + key)
    if (pauseBtn) pauseBtn.remove()
    if (resumeBtn) resumeBtn.remove()

    log('DOM updated for done timer:', key)
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
    log('Resetting timer:', key)

    if (timersArray[key]) {
        // reset all timer properties but keep the current paused state
        timersArray[key].timepast = 0
        timersArray[key].starttime = getCurrentTimeSimple()
        timersArray[key].endtime = getTimeSimple(false, timersArray[key].interval)
        timersArray[key].finished = false
        timersArray[key].done = false

        // remove the old timer element
        const oldTimerEl = document.getElementById('timer-' + key)
        if (oldTimerEl) oldTimerEl.remove()

        // re-render the timer
        const newTimerEl = renderTimer(timersArray[key], key)
        timer_container.appendChild(newTimerEl)

        // Update storage
        localStorage.setItem('timerTimers', JSON.stringify(timersArray))

        // Update status bar
        bgStatus(timersArray)

        document.title = 'Timer'

        log('Timer reset and re-rendered successfully')
    }
}

// ----------------------------- DETECTIONS
function getTimerState(timers = timersArray) {
    if (timers === null) return false
    const anyRunning = timers.some((t) => !t.finished && !t.paused && !t.done)
    const anyFinished = timers.some((t) => t.finished && !t.done)
    const allPaused = timers.length > 0 && timers.every((t) => t.paused || t.finished || t.done)
    const anyActive = timers.some((t) => !t.finished)

    return {anyRunning, anyFinished, allPaused, anyActive}
}

// ----------------------------- ALWAYS RUNNING & WHEN DONE...
function countdownAll() {
    log('Starting countdownAll...')

    // Clear existing interval first
    if (countdownAllInterval) {
        clearInterval(countdownAllInterval)
        countdownAllInterval = null
    }

    // Don't start if no active timers or all are paused
    const state = getTimerState()
    const anyRunning = state.anyRunning // detectAnyRunning()
    const allPaused = state.allPaused //  detectAllPaused()

    if (!anyRunning || allPaused) {
        log('No running timers or all paused, stopping countdown')
        localStorage.setItem('countDownAllStatus', 'stopped')
        if (allPaused || !anyRunning) audioPlayer('pause') // Ensure audio is paused when no timers are running
        return
    }

    let lastUpdateTime = Date.now()
    let blinkRunningOn = false
    let finishedTimer = null
    let blinkFinishedOn = false
    const timerTitleBasic = 'Timer'

    log('Starting countdown interval with running timers')

    countdownAllInterval = setInterval(() => {
        const currentTime = Date.now()
        const elapsedSeconds = Math.floor((currentTime - lastUpdateTime) / 1000)
        lastUpdateTime = currentTime

        let needsFullRender = false
        let anyTimerChanged = false
        let currentFinishedTimer = null

        if (timersArray && timersArray.length > 0) {
            for (let i = 0; i < timersArray.length; i++) {
                const timer = timersArray[i]

                // Skip paused or finished timers
                if (timer.paused === true || timer.finished || timer.done) continue

                // log(`Updating timer ${i}: ${timer.name}, timepast: ${timer.timepast}`)

                // Store previous state to detect changes
                const previousTimepast = timer.timepast
                const previousFinished = timer.finished // TODO check if can be removed or used

                // Update timer progress based on actual elapsed time
                if (timer.timepast < timer.interval && timer.paused === false) {
                    timer.timepast = Math.min(timer.timepast + elapsedSeconds, timer.interval)
                    anyTimerChanged = true
                    // log(`Timer ${i} updated: ${timer.timepast}/${timer.interval}`)
                }

                // Check if timer finished
                if (timer.timepast >= timer.interval && timer.finished !== true) {
                    timer.finished = true
                    timer.timepast = timer.interval // Ensure we don't exceed the interval
                    needsFullRender = true
                    currentFinishedTimer = timer.name
                    log(`Timer ${i} finished: ${timer.name}`)

                    bgStatus(timersArray)

                    // Play alert when timer finishes
                    setTimeout(() => {
                        audioPlayer('pause')
                        setTimeout(() => {
                            playAlert()
                        }, TIMEOUT_SHORT)
                    }, TIMEOUT_SHORT)
                }

                // Update display for running timers if time changed
                if (timer.timepast !== previousTimepast && !timer.finished) {
                    updateTimerDisplay(i)
                }

                // Update finished state in DOM
                if (timer.finished === true) {
                    const timerEl = document.getElementById('timer-' + i)
                    if (timerEl) {
                        timerEl.classList.add('finished')
                        if (timer.done === true) timerEl.classList.add('done')
                    }
                }
            }

            // Update storage and render if something important changed
            if (anyTimerChanged || needsFullRender) {
                // log('Updating timers storage due to changes')
                localStorage.setItem('timerTimers', JSON.stringify(timersArray))

                if (needsFullRender) {
                    // log('Full render needed, updating...')
                    renderTimers(timersArray)
                }
            }

            // Update finished timer reference for blinking
            if (currentFinishedTimer) {
                finishedTimer = currentFinishedTimer
            }
        }

        // Check if we should stop the interval
        const shouldStop = !state.anyRunning || state.allPaused
        if (shouldStop) {
            log('Stopping countdown - no running timers or all paused')
            audioPlayer('pause')
            stopTimer()
            return
        }

        // Tab/title manipulation for user feedback
        // if (finishedTimer !== null && detectAnyFinished() === true) {
        if (finishedTimer !== null && state.anyFinished) {
            blinkFinishedOn = !blinkFinishedOn
            document.title = blinkFinishedOn ? finishedTimer + '!' : finishedTimer
        } else {
            blinkRunningOn = !blinkRunningOn
            document.title = blinkRunningOn ? timerTitleBasic + '.' : timerTitleBasic
        }
    }, 1000)

    localStorage.setItem('countDownAllStatus', 'active')

    function stopTimer() {
        if (countdownAllInterval) {
            clearInterval(countdownAllInterval)
            countdownAllInterval = null
        }
        localStorage.setItem('countDownAllStatus', 'stopped')
        document.title = 'Timer' // Reset title when stopped
    }
}

/**
 * Plays audio until an alert is played, signaling a break
 * @param {'play'|'pause'|'next'|'volume_up'|'volume_down'|'change_mood'} state - trigger play or pause, defaults to play
 * @returns {void}
 */
function audioPlayer(state = 'play') {
    switch (state) {
        case 'play':
            audio.background.loop = false // TODO apply `loop` property in `mood` object
            audio.background.play().catch(e => log('Audio play failed:', e));
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
            audio.background.pause();

            const currentMood = moods.find((item) => settings.mood === item.mood);
            if (!currentMood) return;

            let nextTrackNumber;

            if (AUDIO_SHUFFLE) nextTrackNumber = Math.ceil(Math.random() * currentMood.amount);
            else {
                audio.currentTrack = (audio.currentTrack % currentMood.amount) + 1;
                nextTrackNumber = audio.currentTrack;
            }

            const filetype = '.' + currentMood.filetype;
            const track = nextTrackNumber + filetype;
            const newSrc = audioDir + settings.mood + '/' + track;

            audio.background.src = newSrc;
            audio.background.load();

            audioPlayer('play')

            break
        case 'volume_up':
            log('voluming up')
            audio.background.volume = Math.min(audio.background.volume + 0.2, 1)
            log('volume to', audio.background.volume)
            break
        case 'volume_down':
            log('voluming down')
            audio.background.volume = Math.max(audio.background.volume - 0.2, 0.01) // 0.01 is temporary hack to prevent need for webworker (for now), just keep te music going on, just very soft
            log('volume to', audio.background.volume)
            break
        case 'change_mood':
            log('changing mood')
            settings.mood =
                moods[
                    (moods.findIndex((item) => item.mood === settings.mood) + 1) % moods.length
                ].mood
            updateSettings(settings)
            audio.btn_pause.innerText = settings.mood
            audioPlayer('next')
            break
    }

    // Update volume container visibility based on whether audio is playing
    if (!audio.background.paused) {
        document.getElementById('audio_volume_container').style.visibility = 'visible'
    } else {
        document.getElementById('audio_volume_container').style.visibility = 'hidden'
    }

    // loop volumes 0.2 to 1, sometimes value is a bit off, like 0.200001, so using 1.9 (0.19*10) as base and buffer
    const currentVolume = audio.background.volume
    for (let i = 1.9; i < 11; i += 2) {
        const rounded = i + 0.1
        document.getElementById(`audio_volume_${rounded}`).classList.value =
            Math.round(currentVolume * 10) > i ? 'active' : 'inactive'
    }
    // Update volume button visibility
    if (currentVolume >= 0.99)
        document.getElementById('audio_volume_up').style.visibility = 'hidden'
    else document.getElementById('audio_volume_up').style.visibility = 'visible'

    if (currentVolume <= 0.01)
        document.getElementById('audio_volume_down').style.visibility = 'hidden'
    else document.getElementById('audio_volume_down').style.visibility = 'visible'

    // TODO: check if can be improved with pure CSS / disabled html attribute on -/+ volume
    if (!audio.background.paused) {
        document.getElementById('audio_volume_container').style.visibility = 'visible'
    } else {
        document.getElementById('audio_volume_container').style.visibility = 'hidden'
        // Reset individual button visibility when hiding container
        document.getElementById('audio_volume_up').style.visibility = ''
        document.getElementById('audio_volume_down').style.visibility = ''
    }

    if (audio.background.volume >= 1)
        document.getElementById('audio_volume_up').style.visibility = 'hidden'
    else document.getElementById('audio_volume_up').style.visibility = 'visible'
    log('audio.background.volume:', audio.background.volume)
}

function playAlert() {
    audio.alert.play().catch((e) => log('Audio play failed:', e))
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
    if (!arr || arr.length === 0) {
        setBgStatus('normal')
        return
    }
    const state = getTimerState()
    if (state.anyFinished) setBgStatus('alert')
    else if (state.allPaused) setBgStatus('paused')
    else if (state.anyRunning) setBgStatus('running')
    else setBgStatus('normal')
    // if (!detectAnyActive() || detectAnyDone()) setBgStatus('normal')
    // else if (detectAnyFinished(arr)) setBgStatus('alert')
    // else if (detectAllPaused(arr)) setBgStatus('paused')
    // else if (detectAnyActive(arr)) setBgStatus('running')
    // else setBgStatus('normal')
}

/**
 * Change HTML body class to indicate timer status to user.
 * @param {string} status - Pass status (alert/paused/running) to change HTML body class
 * @returns {void}
 */
function setBgStatus(status = 'normal') {
    if (status === 'alert') statusbar.className = 'statusbar-alert'
    else if (status === 'paused') statusbar.className = 'statusbar-paused'
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
    for (let i = 0; i < elements.length; i++) {
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

function registerServiceWorker() {
    if (window.location.protocol === 'https:' || window.location.protocol === 'http:') {
        const manifestLink = document.createElement('link')
        manifestLink.rel = 'manifest'
        manifestLink.href = 'manifest.json'
        document.head.appendChild(manifestLink)

        if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
            navigator.serviceWorker
                .register('./sw.js')
                .then((registration) => {
                    if (TESTING) {
                        console.log('Service worker registered: ', registration)
                        // Check if PWA is installable
                        if (registration.installing) {
                            console.log('Service worker installing')
                        } else if (registration.waiting) {
                            console.log('Service worker installed')
                        } else if (registration.active) {
                            console.log('Service worker active')
                        }
                    }
                })
                .catch((registrationError) => {
                    if (TESTING) console.log('Service worker registration failed: ', registrationError)
                    // TODO something smart to log this error, like a load of a script, that can be "fetched" with stats, like GA
                })
        }
    }
}

// run service worker on app load
if (RUN_ONLINE) registerServiceWorker()
