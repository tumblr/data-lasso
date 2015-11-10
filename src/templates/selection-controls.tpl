<% if (selectedEntries.length || (snapshotCount > 0)) { %>
    <div class="selected-indicator">
        <div class="total">
            <div class="count-label">Total</div>
            <div class="count"><%- entriesTotal %></div>
        </div>
        <div class="selected">
            <div class="count-label">Selected</div>
            <div class="count"><%- selectedEntries.length %></div>
        </div>
    </div>

    <div class="buttons-container">
        <button class="button black back <%- (snapshotCount > 0) ? 'active' : 'disabled' %>" data-action="zoom-outof-selection">◀</button>
        <button class="button black zoom <%- (selectedEntries.length) ? 'active' : 'disabled' %>" data-action="zoom-into-selection">Zoom in</button>
    </div>

    <% if (selectedEntries.length) { %>
        <div class="download-link" data-action="download-selected">
            Download selected as csv
        </div>
    <% } %>
<% } %>
