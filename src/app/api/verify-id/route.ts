import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Tesseract from 'tesseract.js';

// Helper function to calculate string similarity (Levenshtein distance)
function calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1.0;

    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1.0;

    const editDistance = levenshteinDistance(s1, s2);
    return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { application_id } = await request.json();

        if (!application_id) {
            return NextResponse.json({ error: 'Application ID required' }, { status: 400 });
        }

        // Fetch the application
        const { data: application, error: appError } = await supabase
            .from('seller_applications')
            .select('*')
            .eq('id', application_id)
            .single();

        if (appError || !application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        if (!application.student_id_url) {
            return NextResponse.json({ error: 'No ID card uploaded' }, { status: 400 });
        }

        // Download the image from Supabase storage
        const { data: imageData, error: downloadError } = await supabase
            .storage
            .from('private_documents')
            .download(application.student_id_url.split('/private_documents/')[1]);

        if (downloadError || !imageData) {
            return NextResponse.json({ error: 'Failed to download ID card' }, { status: 500 });
        }

        // Convert blob to buffer
        const arrayBuffer = await imageData.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Run OCR with Tesseract
        const { data: ocrResult } = await Tesseract.recognize(
            buffer,
            'eng',
            {
                logger: (m) => console.log(m),
            }
        );

        const extractedText = ocrResult.text;
        const ocrConfidence = ocrResult.confidence / 100; // Convert to 0-1 scale

        // Extract name from text (basic pattern matching)
        // Look for common patterns in Nigerian student IDs
        const lines = extractedText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        // Try to find the name (usually appears near the top, often after "NAME:" or similar)
        let extractedName = '';
        for (const line of lines) {
            // Look for lines that might contain the name
            if (line.match(/name/i) && lines.indexOf(line) < lines.length - 1) {
                extractedName = lines[lines.indexOf(line) + 1];
                break;
            }
            // Or just take longer lines (names are usually longer than single words)
            if (line.length > 10 && !line.match(/\d{4}/)) { // Avoid dates
                extractedName = line;
                break;
            }
        }

        // Calculate name match
        const nameSimilarity = calculateSimilarity(
            extractedName || '',
            application.full_name || ''
        );

        // Calculate overall confidence
        // 60% weight on OCR quality, 40% on name match
        const overallConfidence = (ocrConfidence * 0.6) + (nameSimilarity * 0.4);

        return NextResponse.json({
            verified: overallConfidence > 0.5,
            confidence: parseFloat(overallConfidence.toFixed(2)),
            extracted: {
                name: extractedName,
                full_text: extractedText,
            },
            match: {
                application_name: application.full_name,
                extracted_name: extractedName,
                name_match: nameSimilarity > 0.8,
                similarity_score: parseFloat(nameSimilarity.toFixed(2)),
            },
            ocr_confidence: parseFloat(ocrConfidence.toFixed(2)),
        });

    } catch (error: any) {
        console.error('Verification error:', error);
        return NextResponse.json(
            { error: 'Verification failed', details: error.message },
            { status: 500 }
        );
    }
}
