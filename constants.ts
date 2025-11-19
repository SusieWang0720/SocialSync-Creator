import React from 'react';

export const MODEL_TEXT = 'gemini-2.5-flash';
export const MODEL_IMAGE = 'imagen-4.0-generate-001';

// Aspect ratios must match valid values for Imagen if we pass them strictly, 
// but we also use them for CSS aspect ratio classes.
export const ASPECT_RATIOS = {
  LINKEDIN: '16:9',
  TWITTER: '16:9',
  INSTAGRAM: '3:4'
};

export const SAMPLE_IDEAS = [
  "Launching a new eco-friendly coffee cup line",
  "Sharing key takeaways from a recent tech conference",
  "Announcing a 24-hour flash sale on sneakers",
  "Reflecting on 5 years of remote work leadership"
];
