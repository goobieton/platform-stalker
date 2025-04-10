const detectChanges = (oldData = {}, newData = {}, parentKey = "") => {
    const changes = [];

    for (const key in newData) {
        const oldValue = oldData[key];
        const newValue = newData[key];
        const fieldName = parentKey ? `${parentKey}.${key}` : key;

        if (Array.isArray(oldValue) && Array.isArray(newValue)) {
            // Detect changes in arrays (e.g., friend list)
            const oldIds = oldValue.map(item => item.id).sort();
            const newIds = newValue.map(item => item.id).sort();

            if (JSON.stringify(oldIds) !== JSON.stringify(newIds)) {
                changes.push({
                    field: fieldName,
                    oldValue: `Array with ${oldIds.length} items`,
                    newValue: `Array with ${newIds.length} items`,
                    details: {
                        additions: newValue.filter(item => !oldIds.includes(item.id)),
                        deletions: oldValue.filter(item => !newIds.includes(item.id)),
                    },
                });
            }
        } else if (typeof oldValue === "object" && typeof newValue === "object" && oldValue !== null && newValue !== null) {
            // Recurse for nested objects
            changes.push(...detectChanges(oldValue, newValue, fieldName));
        } else if (oldValue !== newValue) {
            // Basic value comparison
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