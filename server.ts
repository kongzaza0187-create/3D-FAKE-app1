import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI Client lazily/safely
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in environment.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // API Route: Generate 3D Model Spec from Prompt
  app.post('/api/generate-3d', async (req, res) => {
    try {
      const { prompt, category = 'custom' } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const ai = getGeminiClient();

      const systemInstruction = `You are a world-class 3D computational designer specializing in minimalist, sleek, high-tech 3D model architecture.
You construct 3D objects out of primitive meshes (box, sphere, cylinder, torus, cone, dodecahedron, icosahedron, ring, octahedron, capsule).
You MUST design models with a Carbon Black and Neon/Emerald Green aesthetic theme (#00FF66, #10B981, #121316, #1a1c22, #00E676).
Create a balanced 3D model composition with between 5 to 14 primitives.
Coordinate system: X (-5 to +5), Y (-3 to +5, Y=0 is ground level), Z (-5 to +5).
Ensure rotations are in radians (e.g. 0, Math.PI/4 = 0.785, Math.PI/2 = 1.57).
Set realistic scales and material properties (metalness 0.0-1.0, roughness 0.0-1.0, emissive intensity for neon glow parts).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `Create a minimalist, elegant 3D model for: "${prompt}". Category preference: ${category}.`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING },
              accentColor: { type: Type.STRING },
              designNotes: { type: Type.STRING },
              suggestedTweaks: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              lighting: {
                type: Type.OBJECT,
                properties: {
                  ambientIntensity: { type: Type.NUMBER },
                  directionalIntensity: { type: Type.NUMBER },
                  mainLightColor: { type: Type.STRING },
                  accentLightColor: { type: Type.STRING },
                  enableShadows: { type: Type.BOOLEAN },
                  studioMode: { type: Type.STRING },
                  bloom: { type: Type.BOOLEAN },
                },
                required: ['ambientIntensity', 'directionalIntensity', 'mainLightColor', 'accentLightColor', 'enableShadows', 'studioMode', 'bloom'],
              },
              parts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    shape: { type: Type.STRING },
                    position: {
                      type: Type.ARRAY,
                      items: { type: Type.NUMBER },
                    },
                    rotation: {
                      type: Type.ARRAY,
                      items: { type: Type.NUMBER },
                    },
                    scale: {
                      type: Type.ARRAY,
                      items: { type: Type.NUMBER },
                    },
                    color: { type: Type.STRING },
                    metalness: { type: Type.NUMBER },
                    roughness: { type: Type.NUMBER },
                    emissive: { type: Type.STRING },
                    emissiveIntensity: { type: Type.NUMBER },
                    wireframe: { type: Type.BOOLEAN },
                    opacity: { type: Type.NUMBER },
                    transparent: { type: Type.BOOLEAN },
                    rotationSpeed: {
                      type: Type.ARRAY,
                      items: { type: Type.NUMBER },
                    },
                    floatSpeed: { type: Type.NUMBER },
                    floatAmplitude: { type: Type.NUMBER },
                  },
                  required: ['id', 'name', 'shape', 'position', 'rotation', 'scale', 'color', 'metalness', 'roughness'],
                },
              },
            },
            required: ['id', 'title', 'description', 'category', 'accentColor', 'lighting', 'parts'],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Gemini API returned an empty response.');
      }

      const modelData = JSON.parse(responseText);
      // Ensure fallbacks for required fields
      modelData.id = modelData.id || `ai-3d-${Date.now()}`;
      modelData.lighting.studioMode = modelData.lighting.studioMode || 'carbon-grid';

      return res.json({ model: modelData });
    } catch (error: any) {
      console.error('Error in /api/generate-3d:', error);
      return res.status(500).json({ error: error.message || 'Failed to generate 3D model' });
    }
  });

  // API Route: Chat-based 3D Model Modifications
  app.post('/api/chat-3d', async (req, res) => {
    try {
      const { userInstruction, currentModel } = req.body;
      if (!userInstruction || !currentModel) {
        return res.status(400).json({ error: 'userInstruction and currentModel are required' });
      }

      const ai = getGeminiClient();

      const prompt = `Current 3D Model:
Title: ${currentModel.title}
Parts Count: ${currentModel.parts?.length || 0}
Current JSON:
${JSON.stringify(currentModel, null, 2)}

User Instruction for Modification:
"${userInstruction}"

Respond with JSON containing:
1. "assistantReply": Explanation in clear language describing what changes were made to the 3D model.
2. "updatedModel": The full updated 3D Model specification incorporating the user's requested changes while preserving the minimalist carbon black & neon green visual identity.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert 3D AI assistant modifying existing WebGL primitive compositions based on designer commands.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              assistantReply: { type: Type.STRING },
              updatedModel: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { type: Type.STRING },
                  accentColor: { type: Type.STRING },
                  designNotes: { type: Type.STRING },
                  suggestedTweaks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  lighting: {
                    type: Type.OBJECT,
                    properties: {
                      ambientIntensity: { type: Type.NUMBER },
                      directionalIntensity: { type: Type.NUMBER },
                      mainLightColor: { type: Type.STRING },
                      accentLightColor: { type: Type.STRING },
                      enableShadows: { type: Type.BOOLEAN },
                      studioMode: { type: Type.STRING },
                      bloom: { type: Type.BOOLEAN },
                    },
                  },
                  parts: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        shape: { type: Type.STRING },
                        position: {
                          type: Type.ARRAY,
                          items: { type: Type.NUMBER },
                        },
                        rotation: {
                          type: Type.ARRAY,
                          items: { type: Type.NUMBER },
                        },
                        scale: {
                          type: Type.ARRAY,
                          items: { type: Type.NUMBER },
                        },
                        color: { type: Type.STRING },
                        metalness: { type: Type.NUMBER },
                        roughness: { type: Type.NUMBER },
                        emissive: { type: Type.STRING },
                        emissiveIntensity: { type: Type.NUMBER },
                        wireframe: { type: Type.BOOLEAN },
                        opacity: { type: Type.NUMBER },
                        transparent: { type: Type.BOOLEAN },
                        rotationSpeed: {
                          type: Type.ARRAY,
                          items: { type: Type.NUMBER },
                        },
                        floatSpeed: { type: Type.NUMBER },
                        floatAmplitude: { type: Type.NUMBER },
                      },
                    },
                  },
                },
              },
            },
            required: ['assistantReply', 'updatedModel'],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Gemini API returned an empty response.');
      }

      const result = JSON.parse(responseText);
      return res.json(result);
    } catch (error: any) {
      console.error('Error in /api/chat-3d:', error);
      return res.status(500).json({ error: error.message || 'Failed to modify 3D model' });
    }
  });

  // API Route: AI Design Analysis
  app.post('/api/analyze-3d', async (req, res) => {
    try {
      const { model } = req.body;
      if (!model) {
        return res.status(400).json({ error: 'Model spec is required' });
      }

      const ai = getGeminiClient();

      const prompt = `Analyze this 3D model specification:
${JSON.stringify(model, null, 2)}

Provide design criticism and technical evaluation for a high-end minimalist industrial product design.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are a senior 3D design critique AI evaluator.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              rating: { type: Type.NUMBER },
              aestheticFeedback: { type: Type.STRING },
              polygonOptimization: { type: Type.STRING },
              colorBalance: { type: Type.STRING },
              designTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['rating', 'aestheticFeedback', 'polygonOptimization', 'colorBalance', 'designTips'],
          },
        },
      });

      const result = JSON.parse(response.text || '{}');
      return res.json({ advice: result });
    } catch (error: any) {
      console.error('Error in /api/analyze-3d:', error);
      return res.status(500).json({ error: error.message || 'Failed to analyze 3D model' });
    }
  });

  // Vite Middleware integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`3D Studio Server running at http://localhost:${PORT}`);
  });
}

startServer();
