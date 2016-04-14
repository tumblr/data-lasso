<div class="row">DATA SOURCE</div>

<div class="row extra-spacing">
    <div class="column">
        <button data-js-selector="data-source-toggle" data-source="file" class="toggle toggle-file">FILE</button>
    </div>
    <div class="column">
        <button data-js-selector="data-source-toggle" data-source="url" class="toggle toggle-url">URL</button>
    </div>
</div>

<div class="row extra-spacing">
    <div class="column">
        <button data-js-selector="file-type-toggle" data-type="csv" class="toggle toggle-csv">CSV</button>
    </div>
    <div class="column">
        <button data-js-selector="file-type-toggle" data-type="tsv" class="toggle toggle-tsv">TSV</button>
    </div>
    <div class="column">
        <button data-js-selector="file-type-toggle" data-type="json" class="toggle toggle-json">JSON</button>
    </div>
</div>

<form class="file-upload-form" data-js-selector="file-upload-form">
    <div class="row">
        <input type="file" class="file-upload-input">
    </div>

    <div class="row">
        <button type="submit" class="button red">
            <span class="ready-state">UPLOAD</span>
            <span class="loading-state">LOADING ...</span>
        </button>
    </div>
</form>

<form class="url-form" data-js-selector="url-form">
    <div>
        <input type="text" placeholder="URL to a file" class="text-input url-input" data-js-selector="url-input" id="url">
    </div>

    <div class="row">
        <button class="button red">
            <span class="ready-state">UPLOAD</span>
            <span class="loading-state">LOADING ...</span>
        </button>
    </div>
</form>
