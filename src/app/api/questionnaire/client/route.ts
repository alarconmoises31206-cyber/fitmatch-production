import { NextRequest, NextResponse } from 'next/server';

// Mock function - replace with your actual Supabase client
async function saveToDatabase(userId: string, responses: any, progress: number) {
  // TODO: Replace with actual Supabase integration
  console.log('Saving to database:', { userId, responses, progress });
  return { success: true };
}

export async function POST(request: NextRequest) {
  try {
    const { user_id, responses, progress_percentage } = await request.json();
    
    // Validate required fields
    const required = ['goal_primary', 'goal_timeframe_weeks', 'goal_intensity'];
    const missing = required.filter(field => !responses[field]);
    
    if (missing.length > 0) {
      return NextResponse.json(
        { error: 'missing_fields', fields: missing },
        { status: 400 }
      );
    }
    
    // Save to database
    await saveToDatabase(user_id, responses, progress_percentage);
    
    return NextResponse.json({ 
      status: 'ok', 
      message: 'Questionnaire saved successfully',
      progress: progress_percentage 
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: 'server_error', message: error.message },
      { status: 500 }
    );
  }
}