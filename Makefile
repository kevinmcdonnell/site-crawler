WDIO = ./node_modules/.bin/wdio

devbuild: build-npm-dev

test-ui-env: build-npm-dev
	rm -rf specs/*
	rm links.csv

	URL=$(URL) node crawler.js
	node create_tests.js

	$(WDIO) wdio.conf.js

# Clean built assets
build-clean:
	rm -rf node_modules

build-npm-dev:
	yarn install --ignore-optional
