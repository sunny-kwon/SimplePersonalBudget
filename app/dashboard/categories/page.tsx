import { CategoryManager } from '@/components/category-manager';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CategoriesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center border-b border-gray-200 pb-5">
                <Link
                    href="/dashboard"
                    className="mr-4 text-gray-500 hover:text-gray-700"
                >
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Manage Categories</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Create, edit, or delete your transaction categories.
                    </p>
                </div>
            </div>

            <div className="max-w-3xl">
                <CategoryManager />
            </div>
        </div>
    );
}
