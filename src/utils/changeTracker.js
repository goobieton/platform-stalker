const detectChanges = (oldData = {}, newData = {}, parentKey = "") => {
    const changes = [];

    for (const key in newData) {
        const oldValue = oldData[key];
        const newValue = newData[key];
        const fieldName = parentKey ? `${parentKey}.${key}` : key;

        if (typeof oldValue === "object" && typeof newValue === "object" && oldValue !== null && newValue !== null) {
            changes.push(...detectChanges(oldValue, newValue, fieldName));
        } else if (oldValue !== newValue) {
            changes.push({
                field: fieldName,
                oldValue: oldValue === undefined ? "N/A" : oldValue,
                newValue: newValue === undefined ? "N/A" : newValue,
            });
        }
    }

    return changes;
};

module.exports = { detectChanges };