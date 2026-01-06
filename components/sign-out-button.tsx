'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useState } from 'react';

export function SignOutButton() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSignOut = async () => {
        setIsLoading(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
        >
            <LogOut className="h-4 w-4" />
            {isLoading ? 'Signing out...' : 'Sign Out'}
        </button>
    );
}
