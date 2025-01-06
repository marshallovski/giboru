function formatTemplate(template, values) {
    return template.replace(/%\{(\w+)\}/g, (match, key) => {
        return values[key] !== undefined ? values[key] : match;
    });
}