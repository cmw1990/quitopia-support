const analyzeFocusTrends = (logs: FocusLog[]) => {
  // Filter and sort logs by selected period
  let filteredLogs = [...logs]; // Create a copy to avoid mutating the original array
  
  if (analysisPeriod === 'week') {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    filteredLogs = filteredLogs.filter(log => {
      const logDate = log.date ? new Date(log.date) : new Date(log.timestamp);
      return logDate >= oneWeekAgo;
    });
  } else if (analysisPeriod === 'month') {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    filteredLogs = filteredLogs.filter(log => {
      const logDate = log.date ? new Date(log.date) : new Date(log.timestamp);
      return logDate >= oneMonthAgo;
    });
  }
  
  // Sort logs by date, most recent first
  filteredLogs = filteredLogs.sort((a, b) => {
    const dateA = a.date ? new Date(a.date) : new Date(a.timestamp);
    const dateB = b.date ? new Date(b.date) : new Date(b.timestamp);
    return dateB.getTime() - dateA.getTime();
  });
  
  // Analyze techniques effectiveness
  const techniqueStats: { [key: string]: { count: number, totalFocus: number } } = {};
  
  filteredLogs.forEach(log => {
    const techniques = log.techniques || [];
    techniques.forEach(technique => {
      if (!techniqueStats[technique]) {
        techniqueStats[technique] = { count: 0, totalFocus: 0 };
      }
      techniqueStats[technique].count += 1;
      techniqueStats[technique].totalFocus += log.focusLevel;
    });
  });
} 