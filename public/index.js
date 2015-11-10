window.onload = function () {
    if (typeof DataLasso === 'undefined') {
        console.error('DataLasso not defined');
    } else {
        var options = {};
        var dataLasso = new DataLasso(options);
        document.body.appendChild(dataLasso.el);
    }

    // @TODO: Add a sample module
}
