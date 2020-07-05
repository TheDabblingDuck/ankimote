# Ankimote

**Ankimote** is an addon that adds remote control functionality to [Anki](https://apps.ankiweb.net/), the open source flashcards app.

After installing this addon, selecting 'Ankimote' from the Anki toolbar will start Ankimote and display a QR code and URL directing to the remote that can be accessed by any other device on the local network (usually your phone).

## Features

* Answer cards (again, hard, good, easy) from the remote and get visual feedback on the desktop app

* Scroll up, scroll down, undo from the remote

* One-hand (Swipes) and two-hand (Taps) control interfaces

* Switch decks without touching your computer

* Works with the AMBOSS addon to flip through popups

* 'Show Hints' action reveals hidden portions of cards in common decks such as Anking and Pepper

For developers:

* Custom JavaScript support for deeper interactions with cards

* Custom hook support for integration with other addons


## Limitations

* Both devices must be on the same network (usually the same WiFi name)

* The network must allow local communication (public networks like coffee shops and some schools may not work)

* Workaround: when the above conditions cannot be met, try enabling Bluetooth tethering on your phone and connect your computer to your phone's Bluetooth. In your computer's Bluetooth settings, use "connect to network" or similar to create an internet connection over Bluetooth between the two devices. Then find your phone's IP address on the Bluetooth connection, and use that IP address instead of the one Ankimote displays. Use the same port displayed by Ankimote. 


## Screenshots

Connect by scanning a QR or visiting the URL from a phone or other device that is on the same local network.
<img src="screenshots/qrcode.png" width="90%" >

Visual feedback in the desktop Anki app.
<img src="screenshots/feedback.png" width="90%" >

Swipe mode and swipe settings

<img src="screenshots/swipemode.png" width="40%" > <img src="screenshots/settings.png" width="40%" >

Tap mode (best in landscape)
<img src="screenshots/tapmode.png" width="90%" >
