<form class="upload-form">
    <input type="file" class="file-upload">

    <div class="toggles">
        <div class="toggle">
            <input type="radio" value="csv" name="type" id="csv" checked="checked">
            <label class="filetype-label" for="csv">CSV</label>
        </div>
        <div class="toggle">
            <input type="radio" value="tsv" name="type" id="tsv">
            <label class="filetype-label" for="tsv">TSV</label>
        </div>
        <div class="toggle">
            <input type="radio" value="json" name="type" id="json">
            <label class="filetype-label" for="json">JSON</label>
        </div>
    </div>

    <button class="button red upload-button">
        <span class="ready-state">upload</span>
        <span class="loading-state">loading...</span>
    </button>
</form>
