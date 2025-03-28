import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterCreator?: string;
  canonicalUrl?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'Mission Fresh - Your Nicotine Cessation Journey',
  description = 'Track your nicotine cessation journey, manage your health, and discover tools to help you quit smoking for good.',
  keywords = 'nicotine cessation, quit smoking, health tracking, wellness journey',
  ogTitle,
  ogDescription,
  ogImage = '/images/mission-fresh-social.jpg',
  ogUrl,
  twitterCard = 'summary_large_image',
  twitterCreator = '@missionfreshapp',
  canonicalUrl,
}) => {
  const siteUrl = 'https://missionfresh.app';
  const finalOgTitle = ogTitle || title;
  const finalOgDescription = ogDescription || description;
  const finalOgUrl = ogUrl || canonicalUrl || siteUrl;

  return (
    <Helmet>
      {/* Basic Metadata */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={finalOgUrl} />
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:image" content={ogImage} />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:creator" content={twitterCreator} />
      <meta name="twitter:title" content={finalOgTitle} />
      <meta name="twitter:description" content={finalOgDescription} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Mobile-specific */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      
      {/* Theme Color */}
      <meta name="theme-color" content="#4F46E5" />
    </Helmet>
  );
};

export default SEO; 