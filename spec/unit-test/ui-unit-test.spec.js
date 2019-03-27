const { Builder, By } = require('selenium-webdriver');

const path = require('path');

describe('ui-unit-test', function () {
    let driver;

    beforeEach(function () {
        driver = new Builder()
            .forBrowser('chrome')
            .build();
    });

    afterEach(function () {
        driver.quit();
    });

    it('api', function (done) {
        driver.get('file://' + path.join(__dirname + '/api-test/api.html'));
        driver.findElements(By.tagName('svg')).then(function (svg) {
            expect(svg.length).toBe(2);
            done();
        });
    }, 10000);

    it('element-manager', function (done) {
        driver.get('file://' + path.join(__dirname + '/api-test/element-manager.html'));
        driver.findElements(By.tagName('svg')).then(function (svg) {
            expect(svg.length).toBe(4);
            done();
        });
    }, 10000);
});