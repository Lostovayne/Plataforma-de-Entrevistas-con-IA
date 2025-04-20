'use server';
import { feedbackSchema } from '@/constants';
import { db } from '@/firebase/admin';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';

export async function getInterviewByUserId(userId: string): Promise<Interview[] | null> {
  const interviews = await db
    .collection('interviews')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();

  return interviews.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
  })) as Interview[]; //* as Interview[] is a type assertion. It tells the compiler that the value is of type Interview[] and not any. It is used when the compiler cannot infer the type of a value
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection('interviews')
    .orderBy('createdAt', 'desc')
    .where('finalized', '==', true)
    .where('userId', '!=', userId)
    .limit(limit)
    .get();

  return interviews.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
  })) as Interview[];
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection('interviews').doc(id).get();
  return interview.data() as Interview | null;
}

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) => `- ${sentence.role}: ${sentence.content}\n`
      )
      .join('');

    const {
      object: { totalScore, categoryScores, strengths, areasForImprovement, finalAssessment },
    } = await generateObject({
      model: google('gemini-2.0-flash-001', {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `Usted es un entrevistador de IA que analiza un simulacro de entrevista. Su tarea consiste en evaluar al candidato basándose en categorías estructuradas. Sé minucioso y detallado en tu análisis. No seas indulgente con el candidato. Si hay errores o áreas de mejora, señálalos
      Transcripcion: ${formattedTranscript}
      
      Por favor, puntúe al candidato de 0 a 100 en las siguientes áreas. No añada categorías distintas de las indicadas:
        - Habilidades de comunicación**: Claridad, articulación, respuestas estructuradas.
        - Conocimientos técnicos**: Comprensión de conceptos clave para el puesto.
        - Resolución de problemas**: Capacidad para analizar problemas y proponer soluciones.
        - Adecuación cultural y al puesto**: Alineación con los valores de la empresa y el puesto de trabajo.
        - Confianza y claridad Confianza en las respuestas, compromiso y claridad.`,
      system:
        'Eres un entrevistador profesional analizando un simulacro de entrevista. Su tarea consiste en evaluar al candidato basándose en categorías estructuradas',
    });

    const feedback = await db.collection('feedbacks').add({
      interviewId,
      userId,
      transcript,
      totalScore,
      categoryScores,
      strengths,
      areasForImprovement,
      finalAssessment,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: 'Feedback creado exitosamente',
      feedbackId: feedback.id,
    };
  } catch (error) {
    console.error(`Error creating feedback: ${error}`);
    return {
      success: false,
      message: 'Failed to create feedback',
    };
  }
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const feedbacks = await db
    .collection('feedbacks')
    .where('interviewId', '==', interviewId)
    .where('userId', '==', userId)
    .limit(1)
    .get();

  if (feedbacks.empty) return null;

  const feedbackDoc = feedbacks.docs[0];

  return {
    ...feedbackDoc.data(),
    id: feedbackDoc.id,
  } as Feedback;
}
