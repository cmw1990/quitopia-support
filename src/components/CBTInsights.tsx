import React, { useState, useEffect } from 'react';
import { cbtInsightsApi } from '../api/supabase-rest';
import { CBTInsight } from '../types/cbt';

const CBTInsights = () => {
  const [insights, setInsights] = useState<CBTInsight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCBTInsights = async () => {
      try {
        setIsLoading(true);
        const data = await cbtInsightsApi.getCBTInsights();
        setInsights(data);
      } catch (err: any) {
        console.error('Error loading CBT insights:', err);
        setError(err.message || 'Failed to load CBT insights. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCBTInsights();
  }, []);

  if (isLoading) {
    return (
      <div>
        <h2>CBT Insights</h2>
        <p>Loading CBT insights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2>CBT Insights</h2>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <h2>CBT Insights</h2>
      {insights.length > 0 ? (
        <ul>
          {insights.map((insight) => (
            <li key={insight.id}>
              <p>Date: {insight.date}</p>
              <p>Situation: {insight.situation}</p>
              <p>Thought: {insight.thought}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No CBT insights found.</p>
      )}
    </div>
  );
};

export default CBTInsights;
