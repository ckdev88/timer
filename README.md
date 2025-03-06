# Timer
A simple timer application for multiple timers with a task/description, without any third party scripts or other files. Just the one HTML file, one JS file, one CSS file and one audio file. Optionally an extra audio file for background noise if you like.

Super easy and disctraction-free to use.

## Install / use
- Download the files as they are and run locally in the browser, or
- Visit https://ckdev88.github.io/timer

## Settings
Click the wheel-icon to open settings. You can click the icon again to close.

### General settings
General settings apply to the whole application
- Choose the direction of all timers: `Count down to 0` (default) or `Count up to 0`.
- Choose your language, currently supporting `English` (default) or `Portguese`

### Quick add settings
Quick add settings apply to a timer created by clicking `Quick add`
- Name (default: `Stretch`)
- Description (default: `Eat, walk, push-up, drink, some or all.`)
- Time amount (default: `45`)
- Time unit (default: `minutes`)

`Update settings` will, you guessed it, update the settings.

## Set the timer
- Fill in the `Name`, `Description` (optional) and the `Time` in `Minutes` or `Seconds` and hit `Create timer`
- Click `Quick add` to use the pre-set for a timer

## Timer options
Once a timer is added, you can either `pause`, `reset` or `remove`

## Audio
By default the following files are used from the ./audio/ directory:
- alert.wav : plays once when a timer is finished
- waves.opus : plays repeatedly when `Play audio` is clicked, until a timer is finished.

You can change the desired audio file by modifying const variables `backgroundAudio` and `alertAudio`.


Time to get stuff done!
