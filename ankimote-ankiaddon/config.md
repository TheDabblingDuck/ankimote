These settings apply immediately. Restarting Anki is not necessary.

**Deprecated Options: js1, js2, js3. Click 'Restore Defaults' to reset config and remove these.**

Feedback

* Whether or not to show feedback toast for selected card ease (again, hard, good, easy). Options: true, false

Custom Commands: cmd1, cmd2, cmd3, cmd4, cmd5

* These 5 custom command slots can be used to run any Python command from the Ankimote remote, thus allowing access to far more Anki functions.

* Enter name of command in cmd{n}-label

* Example commands pulled from [the _shortcutKeys function in Anki's reviewer.py](https://github.com/ankitects/anki/blob/bc5b6dfb6363f588d2e8ad0291ea7f91100ad7a7/qt/aqt/reviewer.py#L266):

    * Suspend card: "mw.reviewer.onSuspendCard()"

    * Suspend note: "mw.reviewer.onSuspend()"

    * Mark card: "mw.reviewer.onMark()"

    * Flag card: "mw.reviewer.setFlag(1)"

        * Replace the number: red=1, orange=2, green=3, blue=4

    * Bury card: "mw.reviewer.onBuryCard()"

    * Bury note: "mw.reviewer.onBuryNote()"

    * Delete note: "mw.reviewer.onDelete()"

    * Replay audio: "mw.reviewer.replayAudio()"

    * Pause audio: "mw.reviewer.on_pause_audio()"



Custom JavaScript

* To run JavaScript inside your card, use the above custom command slots with the Python function "mw.web.eval( \"[your JS code]\" )"

    * Example: "mw.web.eval( \"document.getElementById('io-revl-btn').onclick();\" )"

    * The above command will click the toggle button in an Image Occlusion card.

* Multi-line javascript should be converted to a single line with commands separated by semicolons.

    * Example: "mw.web.eval( \"var x=document.getElementsByClassName('hint'); for(i=0;i<x.length;i++) { if(x[i].tagName=='A') { x[i].onclick(); } };\" )"

    * The above command finds all link elements with class name 'hint' and clicks them, thus revealing extra information in some popular decks.

* Use the addon 'AnkiWebView Inspector' to look at a card's code and test the JS command before entering it here.
