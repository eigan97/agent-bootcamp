import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({ message: "¡Hola! La ruta está funcionando correctamente" });
}

