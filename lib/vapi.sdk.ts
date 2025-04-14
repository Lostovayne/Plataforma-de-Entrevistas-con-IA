import Vapi from '@vapi-ai/web';

if (!process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN) {
  throw new Error('Missing NEXT_PUBLIC_VAPI_WEB_TOKEN environment variable');
}

export const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN);
