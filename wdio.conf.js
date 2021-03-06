const fs = require('fs');
const path = require('path');

const portConfigFile = path.join(process.cwd(), 'config/ports.json');
const portConfigObj = JSON.parse(fs.readFileSync(portConfigFile, 'utf8'));
const chai = require('chai');
const root = './';
let seleniumPort, seleniumTestpagePort;

global.expect = chai.expect;
global.assert = chai.assert;

// Determine which ports to use
// This allows the smoke test suite to run for different env/regions on
// the jenkins server
seleniumPort = portConfigObj.seleniumPort
seleniumTestpagePort = portConfigObj.seleniumTestpagePort

exports.config = {
    //
    // ==================
    // Specify Test Files
    // ==================
    // Define which test specs should run. The pattern is relative to the directory
    // from which `wdio` was called. Notice that, if you are calling `wdio` from an
    // NPM script (see https://docs.npmjs.com/cli/run-script) then the current working
    // directory is where your package.json resides, so `wdio` will be called from there.
    //
    specs: [
        './specs/*.spec.js'
    ],

    // Patterns to exclude.
    exclude: [
        // 'path/to/excluded/files'
    ],

    //
    // ============
    // Capabilities
    // ============
    // Define your capabilities here. WebdriverIO can run multiple capabilties at the same
    // time. Depending on the number of capabilities, WebdriverIO launches several test
    // sessions. Within your capabilities you can overwrite the spec and exclude option in
    // order to group specific specs to a specific capability.
    //
    // If you have trouble getting all important capabilities together, check out the
    // Sauce Labs platform configurator - a great tool to configure your capabilities:
    // https://docs.saucelabs.com/reference/platforms-configurator
    //
    capabilities: [{
        browserName: 'chrome',
        maxInstances: 10,
        chromeOptions: {
            args: ['--headless', '--disable-gpu', 'window-size=1920,1080']
        }
    }],
    //
    // ===================
    // Test Configurations
    // ===================
    // Define all options that are relevant for the WebdriverIO instance here
    //
    // Level of logging verbosity: silent | verbose | command | data | result | error
    logLevel: 'silent',

    // Enables colors for log output.
    coloredLogs: true,

    // Saves a screenshot to a given path if a command fails.
    screenshotPath: './screenshots',

    // Set a base URL in order to shorten url command calls. If your url parameter starts
    // with "/", the base url gets prepended.
    baseUrl: 'http://localhost:' + seleniumTestpagePort,

    // Default timeout for all waitForXXX commands.
    waitforTimeout: 80000,

    // Framework you want to run your specs with.
    framework: 'mocha',

    services: ['chromedriver', 'static-server'],
    path: '/',

    // Tell the selenium service which port to start selenium on
    seleniumArgs: {
        seleniumArgs: ['-port', seleniumPort, '-log', './reports/js/ui/selenium.log']
    },

    chromeDriverArgs: [
        `--port=${seleniumPort}`
    ],

    // Tell wdio which port the selenium server is on
    port: seleniumPort,

    staticServerLogs:true,

    // Test reporter for stdout.
    // The following are supported: dot (default), spec and xunit
    // see also: http://webdriver.io/guide/testrunner/reporters.html
    reporters: ['spec', 'junit'],

    reporterOptions: {
        junit: {
            outputDir: './reports/js/ui/results/'
        }
    },

    //
    // Options to be passed to Mocha.
    // See the full list at http://mochajs.org/
    mochaOpts: {
        ui: 'bdd',
        retries: 2,
        timeout: 80000
    },

    canRequireFile: function (fileName) {
        return fileName.search(/[^.]+.js/) === 0;
    },

    //
    // =====
    // Hooks
    // =====
    // Run functions before or after the test. If one of them returns with a promise, WebdriverIO
    // will wait until that promise got resolved to continue.
    //
    // Gets executed before all workers get launched.
    onPrepare: function () {
        var readdirRecursive = require('./lib/readdirRecursive');
        var fileSearch = require('./lib/fileSearch');
        var files, matches;

        // Search spec files for files containing ".only"
        files = readdirRecursive('./specs');
        matches = fileSearch(files, '.only');

        // Update the specs array if we have found some spec files with `.only`
        this.specs = matches.length > 0 ? matches : this.specs;
    },
    //
    // Gets executed before test execution begins. At this point you will have access to all global
    // variables like `browser`. It is the perfect place to define custom commands.
    before: function (val) {
        var readdirRecursive = require('./lib/readdirRecursive');
        var customCommandFiles;

        // Make custom commands available globally
        customCommandFiles = readdirRecursive('./customCommands');
        customCommandFiles.forEach((file) => {
            if (this.canRequireFile(file)) {
                require(root + file);
            }
        });

        // =================================================
        // Configure Browser Object prior to tests starting
        // =================================================

        // Set known timeout for scripts
        browser.timeouts('script', 50000);
    },

    // Gets executed after all tests are done. You still have access to all global variables from
    // the test.
    after: function (failures, pid) {
        // do something
    },

    afterTest: function (test) {
        const browserLogs = [];

        if (!test.err) {
            return;
        }

        // Show failures immediately so we don't have to wait until all tests
        // finish before seeing failures
        browser.log('browser').value.forEach(function (log) {
            /**
            * Filter for error messages
            */
            if (!log || typeof log.level !== 'string' || log.level.toLowerCase() !== 'severe') {
                return;
            }
            browserLogs.push(log.message);
        });

        const title = test.parent ? `${test.parent} ${test.title}` : test.title;

        const msg = `
--------------------------------------------------
Test: ${title}
Stacktrace: ${test.err.stack}
File: ${test.file}
Browser Errors: ${browserLogs.join('\n')}
-------------------------------------------------- \n`;

        console.log(msg);
    },
    //
    // Gets executed after all workers got shut down and the process is about to exit. It is not
    // possible to defer the end of the process using a promise.
    onComplete: function () {
        // do something
    }
};
