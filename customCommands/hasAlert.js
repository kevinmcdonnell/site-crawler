browser.addCommand('hasAlert', function () {
    try {
        browser.getTitle();
    } catch (error) {
        return error.seleniumStack.type === 'UnexpectedAlertOpen';
    }

    return false;
});
