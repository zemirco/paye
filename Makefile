
BIN_DIR = node_modules/.bin
STANDARD = $(BIN_DIR)/standard
WATCHIFY = $(BIN_DIR)/watchify

.PHONY: standard
standard:
	$(STANDARD)

.PHONY: watch
watch:
	$(WATCHIFY) docs/index.js -o docs/bundle.js --debug --verbose

.PHONY: serve
serve:
	cd docs && python -m SimpleHTTPServer 3000
