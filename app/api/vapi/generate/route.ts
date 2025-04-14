import { db } from '@/firebase/admin';
import { getRandomInterviewCover } from '@/lib/utils';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function GET() {
  return Response.json({ success: true, data: 'THANKS YOU!' }, { status: 200 });
}

export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userid } = await request.json();

  try {
    const { text: questions } = await generateText({
      model: google('gemini-2.0-flash-001'),
      prompt: `El rol del trabajo es ${role}.
      El nivel de experiencia del trabajo es ${level}.
      La pila tecnológica usada en el trabajo es ${techstack}.
      El enfoque entre preguntas de comportamiento y técnicas debe inclinarse hacia ${type}.
      La cantidad de preguntas requeridas es ${amount}.
      Por favor, devuelve únicamente las preguntas, sin ningún texto adicional.
      Las preguntas serán leídas por un asistente de voz, así que no uses barras ni asteriscos ni otros símbolos.
      Formatea las preguntas así:
      ["Pregunta 1", "Pregunta 2" ,"Pregunta 3" ].
      ¡Gracias! <3`,
    });

    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(','),
      questions: JSON.parse(questions),
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection('interviews').add(interview);
    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json({ success: false, error }, { status: 500 });
  }
}
