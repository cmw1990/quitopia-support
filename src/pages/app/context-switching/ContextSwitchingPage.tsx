import React, { useState, useEffect } from 'react';
import {
    ContextSwitchingList
} from '@/components/adhd/context-switching/ContextSwitchingList';
import {
    ContextSwitchingForm
} from '@/components/adhd/context-switching/ContextSwitchingForm';
import {
    ContextSwitchingDetail
} from '@/components/adhd/context-switching/ContextSwitchingDetail';
import {
    ContextSwitchingActiveSession
} from '@/components/adhd/context-switching/ContextSwitchingActiveSession';
import {
    ContextSwitchingHistory
} from '@/components/adhd/context-switching/ContextSwitchingHistory';
import type { ContextSwitchTemplate } from '@/types/contextSwitching.ts';

// Placeholder type - replace with actual type if/when defined
type ContextSwitchSession = {
    id: string;
    template_id: string;
    status: 'in_progress' | 'completed' | 'cancelled';
    start_time: string;
    end_time?: string;
    // Add other relevant fields
};

type ViewMode = 'list' | 'create' | 'edit' | 'detail' | 'active' | 'history';

export const ContextSwitchingPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTemplate, setSelectedTemplate] = useState<ContextSwitchTemplate | null>(null);
  const [activeSession, setActiveSession] = useState<ContextSwitchSession | null>(null);
  const [listKey, setListKey] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectTemplate = (template: ContextSwitchTemplate) => {
    setSelectedTemplate(template);
    setViewMode('detail');
  };

  const handleEditTemplate = (template: ContextSwitchTemplate) => {
    setSelectedTemplate(template);
    setViewMode('edit');
  };

  const handleDeleteTemplate = async (templateId: string) => {
    console.log('Deleting template:', templateId);
    setListKey(Date.now());
    setViewMode('list');
  };

  const handleCreateSubmit = async (formData: Omit<ContextSwitchTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    setIsSubmitting(true);
    console.log('Creating template:', formData);
    setIsSubmitting(false);
    setListKey(Date.now());
    setViewMode('list');
  };

  const handleEditSubmit = async (formData: ContextSwitchTemplate) => {
    setIsSubmitting(true);
    console.log('Updating template:', formData);
    setIsSubmitting(false);
    setListKey(Date.now());
    setViewMode('list');
  };

  const handleCancelForm = () => {
    setSelectedTemplate(null);
    setViewMode('list');
  };

  const handleStartSwitch = (template: ContextSwitchTemplate) => {
    console.log('Starting switch with template:', template.id);
    const newSession = { id: 'session123', template_id: template.id, status: 'in_progress', start_time: new Date().toISOString() } as ContextSwitchSession;
    setActiveSession(newSession);
    setSelectedTemplate(template);
    setViewMode('active');
  };

  const handleSessionEnd = (session: ContextSwitchSession) => {
    console.log('Session ended:', session);
    setActiveSession(null);
    setSelectedTemplate(null);
    setViewMode('history');
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-4">Context Switching</h1>
      <div className="mb-4 space-x-2">
          <button onClick={() => setViewMode('list')} className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>List</button>
          <button onClick={() => setViewMode('create')} className={`px-3 py-1 rounded ${viewMode === 'create' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Create New</button>
          <button onClick={() => setViewMode('history')} className={`px-3 py-1 rounded ${viewMode === 'history' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>History</button>
      </div>

      {viewMode === 'list' && (
        <ContextSwitchingList
          key={listKey}
          onSelectTemplate={handleSelectTemplate}
          onEditTemplate={handleEditTemplate}
          onDeleteTemplate={handleDeleteTemplate}
        />
      )}
      {(viewMode === 'create' || viewMode === 'edit') && (
        <ContextSwitchingForm
          onSubmit={viewMode === 'create' ? handleCreateSubmit : handleEditSubmit}
          initialData={selectedTemplate || undefined}
          onCancel={handleCancelForm}
          isSubmitting={isSubmitting}
        />
      )}
      {viewMode === 'detail' && selectedTemplate && (
        <ContextSwitchingDetail
          template={selectedTemplate}
          onBack={handleCancelForm}
          onStartSwitch={handleStartSwitch}
        />
      )}
      {viewMode === 'active' && activeSession && selectedTemplate && (
        <ContextSwitchingActiveSession
          session={activeSession}
          template={selectedTemplate}
          onSessionEnd={handleSessionEnd}
        />
      )}
      {viewMode === 'history' && (
        <ContextSwitchingHistory />
      )}
    </div>
  );
};