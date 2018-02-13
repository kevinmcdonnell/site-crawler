browser.addCommand('waitForAndClick', function (selector) {
    browser.waitForVisible(selector);
    browser.click(selector);
});
