import { NextRequest, NextResponse } from 'next/server';

interface VoiceRequest {
  text: string;
  speaker?: string;
  variant?: number;
}

const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';

const SPEAKER_VOICE_MAP: Record<string, string | undefined> = {
  narrator: process.env.ELEVENLABS_VOICE_ID_NARRATOR,
  sam: process.env.ELEVENLABS_VOICE_ID_SAM,
  mike: process.env.ELEVENLABS_VOICE_ID_MIKE,
  jessica: process.env.ELEVENLABS_VOICE_ID_JESSICA,
  ashley: process.env.ELEVENLABS_VOICE_ID_ASHLEY,
  chris: process.env.ELEVENLABS_VOICE_ID_CHRIS,
  josh: process.env.ELEVENLABS_VOICE_ID_JOSH,
  emily: process.env.ELEVENLABS_VOICE_ID_EMILY,
  matt: process.env.ELEVENLABS_VOICE_ID_MATT,
  stranger: process.env.ELEVENLABS_VOICE_ID_STRANGER,
  hunter: process.env.ELEVENLABS_VOICE_ID_STRANGER,
};


function parseVoiceVariants(value: string | undefined, fallback: string): string[] {
  const values = (value || fallback)
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  return values.length > 0 ? values : [fallback];
}

function sanitizeText(input: string): string {
  return input.replace(/\s+/g, ' ').trim().slice(0, 500);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ElevenLabs API key is not configured.' }, { status: 501 });
  }

  try {
    const body = (await request.json()) as VoiceRequest;
    const text = sanitizeText(body.text || '');
    if (!text) {
      return NextResponse.json({ error: 'Text is required.' }, { status: 400 });
    }

    const speakerVoice = SPEAKER_VOICE_MAP[body.speaker || ''] || DEFAULT_VOICE_ID;
    const speakerVariants = speakerVoice.includes(',') ? speakerVoice : '';
    const voiceVariants = parseVoiceVariants(speakerVariants || process.env.ELEVENLABS_VOICE_VARIANTS, speakerVoice);
    const variantIndex = Math.max(0, Number(body.variant || 0)) % voiceVariants.length;
    const voiceId = voiceVariants[variantIndex] || speakerVoice;
    const upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        model_id: process.env.ELEVENLABS_MODEL_ID || 'eleven_flash_v2_5',
        text,
        voice_settings: {
          stability: 0.35,
          similarity_boost: 0.75,
          style: 0.35,
          use_speaker_boost: true,
        },
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const reason = await upstream.text().catch(() => 'Unknown TTS error');
      return NextResponse.json({ error: `ElevenLabs request failed: ${reason}` }, { status: 502 });
    }

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
