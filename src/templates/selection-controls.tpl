<% if (selectedEntriesTotal || snapshotCount) { %>
    <div class="selected-indicator">
        <div class="total">
            <div class="count-label">Total</div>
            <div class="count"><%- entriesTotal %></div>
        </div>
        <div class="selected">
            <div class="count-label">Selected</div>
            <div class="count"><%- selectedEntriesTotal %></div>
        </div>
    </div>

    <div class="buttons-container">
        <button class="button black back <%- (snapshotCount > 0) ? 'active' : 'disabled' %>" data-action="zoom-outof-selection">◀</button>
        <button class="button black zoom <%- (selectedEntriesTotal) ? 'active' : 'disabled' %>" data-action="zoom-into-selection">Zoom in</button>
    </div>

    <% if (selectedEntriesTotal) { %>
        <div class="download-link" data-action="download-selected">
            Download selected as csv
        </div>
    <% } %>
<% } %>
