export const exportToCSV = (logs) => {
    const header = 'Name,Group,Type,Time\n';
    const rows = logs.map(log => {
      const user = log.user || {};
      return `${user.name || 'N/A'},${user.group || 'N/A'},${log.type},${log.timestamp}`;
    });
    return header + rows.join('\n');
  };
  