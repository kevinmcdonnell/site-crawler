describe('Load url: <%= test_url %>', function () {

    before(function () {
        browser.url("<%= test_url %>");
        browser.pause(5000);
    });

    it('Expect there to be no alerts', function () {
        expect(browser.hasAlert()).to.equal(false);
    });
});
