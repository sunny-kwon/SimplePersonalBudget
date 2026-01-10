'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, History, Settings2, Wallet2 } from 'lucide-react';

export const links = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Transactions', href: '/transactions', icon: History },
    { name: 'Budget', href: '/budget', icon: Wallet2 },
    { name: 'Categories', href: '/categories', icon: Settings2 },
];

export function NavLinks() {
    const pathname = usePathname();

    return (
        <div className="flex items-center gap-1">
            {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isActive
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                        {link.name}
                    </Link>
                );
            })}
        </div>
    );
}
