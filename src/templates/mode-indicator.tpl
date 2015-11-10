<% if (mode === 'normal') { %>
    <div class="view-mode">
        <strong>View mode</strong>
        <small>(SPACEBAR for selection mode)</small>
    </div>
<% } else if (mode === 'selection') { %>
    <div class="selection-mode">
        <strong>Selection mode</strong>
        <small>(ESC for view mode, LMB to select a 4-point rectangle)</small>
    </div>
<% } %>
