import React from 'react';
import { EasierFocusApp } from './EasierFocusApp';

export default function Page() {
  return (
    <div className="easier-focus-page">
      <EasierFocusApp />
    </div>
  );
}

export function getServerData() {
  return {
    props: {
      title: 'Easier Focus',
      description: 'Tools for enhancing focus, managing ADHD, blocking distractions, and sustaining energy'
    }
  };
} 