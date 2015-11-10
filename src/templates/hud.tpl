<% _.each(entry, function (value, name) { %>
    <% if (attributesInUse.indexOf(name) !== -1) { %>
        <div class='attribute'>
            <label class="attribute-name"><%- name %></label>
            <span class="attribute-value"><%- value %></span>
        </div>
    <% } %>
<% }) %>
