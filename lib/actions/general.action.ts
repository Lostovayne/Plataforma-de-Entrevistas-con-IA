import { db } from '@/firebase/admin';

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
  const {interviewId,userId,transcript} = params

  try {
    
  } catch (error) {
    console.error(`Error creating feedback: ${error}`)
  }

}
