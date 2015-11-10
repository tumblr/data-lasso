<% if (attributes) { %>
    <form class="controls-form">

        <% _.each(mappings, function (axis, axisName) { %>
            <label class="axis-label" for="<%= axisName %>"><%= axisName %></label>
            <select name="<%= axisName %>" id="<%= axisName %>" class="axis-selector">
                <option value=""></option>

                <% _.each(attributes, function (attribute, attributeName) { %>
                    <% if (attributeName[0] !== '_') { %>
                        <% if (axis.attribute && axis.attribute === attributeName) { %>
                            <option selected="selected" value="<%- attributeName %>"><%- attributeName %></option>
                        <% } else { %>
                            <option value="<%- attributeName %>"><%- attributeName %></option>
                        <% } %>
                    <% } %>
                <% }); %>

            </select>
        <% }); %>

        <button class="button red">Go</button>
    </form>
<% } %>
