These settings apply immediately. Restarting Anki is not necessary.

Feedback

* Whether or not to show feedback toast for selected card ease (again, hard, good, easy). Options: true, false

Custom JS commands

* These 3 custom command slots can be used to interact with cards from the Ankimote remote.

* Example: "document.getElementById('io-revl-btn').onclick();"

* The above command will click the toggle button in an Image Occlusion card.

* Multi-line javascript should be converted to a single line with commands separated by semicolons.

* Example: "var x=document.getElementsByClassName('hint'); for(i=0;i<x.length;i++) { if(x[i].tagName=='A') { x[i].onclick(); } };"

* The above command finds all link elements with class name 'hint' and clicks them, thus revealing extra information in some popular decks.

* Use the addon 'AnkiWebView Inspector' to look at a card's code and test the JS command before entering it here.
