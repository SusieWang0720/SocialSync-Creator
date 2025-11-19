export enum Tone {
  PROFESSIONAL = 'Professional',
  WITTY = 'Witty',
  URGENT = 'Urgent',
  EMPATHETIC = 'Empathetic',
  CONTROVERSIAL = 'Bold/Controversial'
}

export enum Platform {
  LINKEDIN = 'LinkedIn',
  TWITTER = 'Twitter/X',
  INSTAGRAM = 'Instagram'
}

export interface GeneratedPostContent {
  postText: string;
  imagePrompt: string;
}

export interface PlatformResult {
  platform: Platform;
  text: string | null;
  imagePrompt: string | null;
  imageUrl: string | null;
  isLoadingText: boolean;
  isLoadingImage: boolean;
  error?: string;
}

export interface GenerationResponse {
  linkedin: GeneratedPostContent;
  twitter: GeneratedPostContent;
  instagram: GeneratedPostContent;
}
