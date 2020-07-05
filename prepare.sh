find . -name '.DS_Store' -type f -delete
rm ankimote-alpha.ankiaddon
cd ankimote-ankiaddon
zip -r ../ankimote.ankiaddon *
