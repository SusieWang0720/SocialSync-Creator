import React, { useState } from 'react';
import { Platform, PlatformResult } from '../types';
import { IconLinkedIn, IconTwitter, IconInstagram, IconCopy, IconDownload, IconMagic } from './Icons';

interface PostCardProps {
  result: PlatformResult;
}

export const PostCard: React.FC<PostCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (result.text) {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (result.imageUrl) {
      const link = document.createElement('a');
      link.href = result.imageUrl;
      link.download = `socialsync-${result.platform.toLowerCase()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getPlatformIcon = (p: Platform) => {
    switch (p) {
      case Platform.LINKEDIN: return <IconLinkedIn className="w-6 h-6 text-blue-600" />;
      case Platform.TWITTER: return <IconTwitter className="w-6 h-6 text-sky-500" />;
      case Platform.INSTAGRAM: return <IconInstagram className="w-6 h-6 text-pink-500" />;
    }
  };

  const getPlatformColor = (p: Platform) => {
      switch (p) {
          case Platform.LINKEDIN: return "border-t-blue-600 shadow-blue-900/20";
          case Platform.TWITTER: return "border-t-sky-500 shadow-sky-900/20";
          case Platform.INSTAGRAM: return "border-t-pink-500 shadow-pink-900/20";
      }
  }

  const aspectRatioClass = result.platform === Platform.INSTAGRAM ? 'aspect-[3/4]' : 'aspect-video';

  return (
    <div className={`bg-dark-800 rounded-xl border border-gray-800 border-t-4 shadow-xl ${getPlatformColor(result.platform)} flex flex-col h-full overflow-hidden transition-transform duration-300 hover:-translate-y-1`}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-800 bg-dark-900/50">
        <div className="flex items-center space-x-3">
          <div className="bg-white p-1.5 rounded-full">
            {getPlatformIcon(result.platform)}
          </div>
          <h3 className="font-bold text-lg text-white">{result.platform}</h3>
        </div>
        <button 
          onClick={handleCopy}
          disabled={!result.text}
          className={`p-2 rounded-lg transition-colors ${copied ? 'text-green-400 bg-green-400/10' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
          title="Copy Text"
        >
          {copied ? <span className="text-xs font-bold px-1">COPIED</span> : <IconCopy className="w-5 h-5" />}
        </button>
      </div>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col space-y-4 overflow-y-auto max-h-[600px]">
        
        {/* Text Section */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <IconMagic className="w-3 h-3" />
            <span>Generated Content</span>
          </div>
          
          {result.isLoadingText ? (
            <div className="space-y-2 animate-pulse">
               <div className="h-4 bg-gray-700 rounded w-3/4"></div>
               <div className="h-4 bg-gray-700 rounded w-full"></div>
               <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            </div>
          ) : result.text ? (
            <div className="text-gray-200 text-sm whitespace-pre-wrap leading-relaxed bg-dark-900 p-3 rounded-lg border border-gray-700/50">
              {result.text}
            </div>
          ) : (
            <div className="text-gray-500 text-sm italic">Waiting for input...</div>
          )}
        </div>

        {/* Image Section */}
        <div className="space-y-2 mt-auto">
           <div className="flex items-center justify-between">
             <div className="flex items-center space-x-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
               <IconMagic className="w-3 h-3" />
               <span>Generated Visual</span>
             </div>
             {result.imageUrl && (
                <button onClick={handleDownload} className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1">
                    <IconDownload className="w-3 h-3" />
                    <span>Download</span>
                </button>
             )}
           </div>

           <div 
             className={`relative w-full ${aspectRatioClass} bg-gray-900 rounded-lg overflow-hidden border border-gray-800 group`}
           >
              {result.isLoadingImage ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                    <div className="w-10 h-10 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin mb-3"></div>
                    <span className="text-xs animate-pulse">Generating art...</span>
                 </div>
              ) : result.imageUrl ? (
                <>
                  <img 
                    src={result.imageUrl} 
                    alt={`Generated for ${result.platform}`} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                   <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6 text-center">
                      <span className="text-[10px] uppercase tracking-widest text-brand-400 font-bold mb-2">Visual Prompt</span>
                      <p className="text-sm text-gray-200 font-medium leading-relaxed italic">"{result.imagePrompt}"</p>
                  </div>
                </>
              ) : result.error ? (
                <div className="absolute inset-0 flex items-center justify-center text-red-400 text-xs p-4 text-center border border-red-900/50 bg-red-900/10">
                  {result.error}
                </div>
              ) : (
                 <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-xs">
                    Waiting for content...
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};