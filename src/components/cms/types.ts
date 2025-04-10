export interface CMSTestProps {
  content: {
    title: string;
    description: string;
    features: string[];
    status: 'draft' | 'published';
    lastModified: string;
  };
}

export interface CMSConfig {
  name: string;
  description: string;
  route: string;
  enabled: boolean;
}
