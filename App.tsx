import React, { useState, useCallback } from 'react';
import { Tone, Platform, PlatformResult } from './types';
import { generatePostContent, generateImageForPlatform } from './services/geminiService';
import { PostCard } from './components/PostCard';
import { IconSparkles } from './components/Icons';
import { ASPECT_RATIOS, SAMPLE_IDEAS } from './constants';

const App: React.FC = () => {
  const [idea, setIdea] = useState('');
  const [tone, setTone] = useState<Tone>(Tone.PROFESSIONAL);
  const [isGenerating, setIsGenerating] = useState(false);

  const [results, setResults] = useState<Record<Platform, PlatformResult>>({
    [Platform.LINKEDIN]: { platform: Platform.LINKEDIN, text: null, imagePrompt: null, imageUrl: null, isLoadingText: false, isLoadingImage: false },
    [Platform.TWITTER]: { platform: Platform.TWITTER, text: null, imagePrompt: null, imageUrl: null, isLoadingText: false, isLoadingImage: false },
    [Platform.INSTAGRAM]: { platform: Platform.INSTAGRAM, text: null, imagePrompt: null, imageUrl: null, isLoadingText: false, isLoadingImage: false },
  });

  const handleGenerate = useCallback(async () => {
    if (!idea.trim()) return;

    setIsGenerating(true);
    
    // Reset previous results but keep structure
    setResults(prev => ({
        [Platform.LINKEDIN]: { ...prev[Platform.LINKEDIN], text: null, imageUrl: null, isLoadingText: true, isLoadingImage: true, error: undefined },
        [Platform.TWITTER]: { ...prev[Platform.TWITTER], text: null, imageUrl: null, isLoadingText: true, isLoadingImage: true, error: undefined },
        [Platform.INSTAGRAM]: { ...prev[Platform.INSTAGRAM], text: null, imageUrl: null, isLoadingText: true, isLoadingImage: true, error: undefined },
    }));

    try {
      // Step 1: Generate Text & Prompts
      const generatedContent = await generatePostContent(idea, tone);

      // Update state with text and stop text loading
      setResults(prev => ({
        [Platform.LINKEDIN]: { ...prev[Platform.LINKEDIN], text: generatedContent.linkedin.postText, imagePrompt: generatedContent.linkedin.imagePrompt, isLoadingText: false },
        [Platform.TWITTER]: { ...prev[Platform.TWITTER], text: generatedContent.twitter.postText, imagePrompt: generatedContent.twitter.imagePrompt, isLoadingText: false },
        [Platform.INSTAGRAM]: { ...prev[Platform.INSTAGRAM], text: generatedContent.instagram.postText, imagePrompt: generatedContent.instagram.imagePrompt, isLoadingText: false },
      }));

      // Step 2: Trigger Image Generation in Parallel
      const platforms = [
        { key: Platform.LINKEDIN, prompt: generatedContent.linkedin.imagePrompt, ratio: ASPECT_RATIOS.LINKEDIN },
        { key: Platform.TWITTER, prompt: generatedContent.twitter.imagePrompt, ratio: ASPECT_RATIOS.TWITTER },
        { key: Platform.INSTAGRAM, prompt: generatedContent.instagram.imagePrompt, ratio: ASPECT_RATIOS.INSTAGRAM },
      ];

      await Promise.allSettled(platforms.map(async (p) => {
        try {
          const imageUrl = await generateImageForPlatform(p.prompt, p.ratio);
          setResults(prev => ({
            ...prev,
            [p.key]: { ...prev[p.key], imageUrl, isLoadingImage: false }
          }));
        } catch (err) {
          console.error(`Failed to generate image for ${p.key}`);
          setResults(prev => ({
            ...prev,
            [p.key]: { ...prev[p.key], isLoadingImage: false, error: "Image generation failed. Likely safety filter." }
          }));
        }
      }));

    } catch (error) {
      console.error("Main generation loop error:", error);
      // Stop all loaders on critical error
      setResults(prev => {
          const newResults = {...prev};
          Object.keys(newResults).forEach(k => {
              const key = k as Platform;
              newResults[key].isLoadingText = false;
              newResults[key].isLoadingImage = false;
              newResults[key].error = "Failed to generate content.";
          });
          return newResults;
      });
    } finally {
      setIsGenerating(false);
    }
  }, [idea, tone]);

  const fillSample = (text: string) => {
    setIdea(text);
  };

  return (
    <div className="min-h-screen bg-dark-950 text-gray-100 selection:bg-brand-500/30">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-dark-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-brand-500 to-purple-600 p-2 rounded-lg">
                    <IconSparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-purple-400">
                    SocialSync Creator
                </h1>
            </div>
            <div className="text-xs text-gray-500 font-mono hidden sm:block">
                Powered by Gemini 2.5 & Imagen 4
            </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Input Section */}
        <section className="mb-12 space-y-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-dark-800/50 rounded-2xl p-1">
                    <div className="bg-dark-900 rounded-xl p-6 border border-gray-800 shadow-2xl">
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            What's your post about?
                        </label>
                        <textarea
                            value={idea}
                            onChange={(e) => setIdea(e.target.value)}
                            placeholder="e.g., We just launched a new AI feature that helps designers work 2x faster..."
                            className="w-full h-32 bg-dark-950 text-white border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all p-4 text-lg resize-none placeholder-gray-600"
                        />
                        
                        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center space-x-4">
                                <label className="text-sm font-medium text-gray-400">Tone:</label>
                                <select
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value as Tone)}
                                    className="bg-dark-800 border-gray-700 text-white rounded-lg px-4 py-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                >
                                    {Object.values(Tone).map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={!idea.trim() || isGenerating}
                                className={`
                                    flex items-center justify-center space-x-2 px-8 py-3 rounded-lg font-semibold text-white transition-all shadow-lg shadow-brand-900/20
                                    ${!idea.trim() || isGenerating 
                                        ? 'bg-gray-700 cursor-not-allowed opacity-50' 
                                        : 'bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 transform hover:scale-105 active:scale-95'}
                                `}
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Creating Magic...</span>
                                    </>
                                ) : (
                                    <>
                                        <IconSparkles className="w-5 h-5" />
                                        <span>Generate Content</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Prompts */}
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                    <span className="text-sm text-gray-500 py-1">Try an example:</span>
                    {SAMPLE_IDEAS.map((sample, i) => (
                        <button
                            key={i}
                            onClick={() => fillSample(sample)}
                            className="text-xs bg-dark-800 hover:bg-dark-700 text-gray-300 px-3 py-1.5 rounded-full border border-gray-700 transition-colors"
                        >
                            {sample}
                        </button>
                    ))}
                </div>
            </div>
        </section>

        {/* Results Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <PostCard result={results[Platform.LINKEDIN]} />
            <PostCard result={results[Platform.TWITTER]} />
            <PostCard result={results[Platform.INSTAGRAM]} />
        </section>

      </main>
    </div>
  );
};

export default App;
