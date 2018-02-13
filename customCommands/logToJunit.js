browser.addCommand('logToJunit', function (prefix, output) {
    let count = 1;

    if (typeof(output) !== 'string') {
        output = JSON.stringify(output);
    }

    // If string is more than 800 chars, split it up and emit it seperately
    // WDIO santizes strings to a max of 800 chars
    const chunks = output.match(/.{1,800}/g);

    chunks.forEach(function (chunk) {
        browser.emit('result',  {
            requestData: 'requestData',
            requestOptions: 'requestOptions',
            body: {
                value: `${prefix} ${count}/${chunks.length}: ${chunk}`
            }
        });
        count++;
    });

});
