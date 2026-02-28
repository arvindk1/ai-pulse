import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch(
            `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID}`,
            {
                method: "GET",
                headers: {
                    // This is your secret XI_API_KEY from the environment
                    "xi-api-key": process.env.ELEVENLABS_API_KEY as string,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`ElevenLabs API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Return the signed URL snippet needed by the client
        return NextResponse.json({ token: data.signed_url });

    } catch (error) {
        console.error("Failed to generate ElevenLabs token:", error);
        return NextResponse.json(
            { error: "Failed to initialize voice session" },
            { status: 500 }
        );
    }
}
