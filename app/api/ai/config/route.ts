import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
// Dynamic import for load balancer

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { aiLoadBalancer } = await import('@/lib/ai/load-balancer');
    const stats = aiLoadBalancer.getProviderStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get config' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { strategy } = await request.json();
    
    if (!['round-robin', 'intelligent', 'fallback'].includes(strategy)) {
      return NextResponse.json({ error: 'Invalid strategy' }, { status: 400 });
    }

    const { aiLoadBalancer } = await import('@/lib/ai/load-balancer');
    aiLoadBalancer.setStrategy(strategy);
    
    return NextResponse.json({ 
      message: 'Strategy updated',
      strategy,
      stats: aiLoadBalancer.getProviderStats()
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
  }
}
