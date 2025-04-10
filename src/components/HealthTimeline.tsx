import React from 'react';

const HealthTimeline = () => {
  const events = [
    { date: '2025-03-10', description: 'Started taking new medication' },
    { date: '2025-03-05', description: 'Had a checkup with the doctor' },
    { date: '2025-02-20', description: 'Started exercising regularly' },
    { date: '2025-02-15', description: 'Got a good night\'s sleep' },
    { date: '2025-02-10', description: 'Started a new diet' },
  ];

  return (
    <div>
      <h2>Health Timeline</h2>
      <ul>
        {events.map((event, index) => (
          <li key={index}>
            <strong>{event.date}:</strong> {event.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HealthTimeline;
