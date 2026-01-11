'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wallet, Target, Plus, ArrowRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { createPortal } from 'react-dom';

interface OnboardingModalProps {
    onboardingCompleted: boolean;
}

export function DashboardTourHandler({ onboardingCompleted }: OnboardingModalProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!onboardingCompleted) {
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [onboardingCompleted]);

    const handleDismiss = async (redirectTo?: string) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await fetch('/api/user/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: true }),
            });
            setIsOpen(false);
            if (redirectTo) {
                router.push(redirectTo);
            } else {
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to complete onboarding:', error);
            setIsSubmitting(false);
        }
    };

    if (!mounted) return null;

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => handleDismiss()}
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] overflow-y-auto"
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDismiss();
                            }}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10 bg-white/50 backdrop-blur rounded-full"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="p-6 sm:p-8 space-y-6">
                            <div className="space-y-3 text-center">
                                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <Sparkles className="h-6 w-6 text-indigo-600" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
                                    Welcome to <span className="text-indigo-600">Simple Budget</span>
                                </h2>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                    Set up your money flow in three quick steps. It only takes a minute!
                                </p>
                            </div>

                            <div className="space-y-5">
                                <div className="flex gap-4 items-start">
                                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center mt-0.5">
                                        <Wallet className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="font-bold text-gray-900 text-sm">1. Organize your money</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            Group your expenses and income into "Money Buckets" that make sense to you.
                                        </p>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDismiss('/categories');
                                            }}
                                            className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-600 hover:gap-2 transition-all mt-1"
                                        >
                                            👉 Go to Categories <ArrowRight className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <div className="flex-shrink-0 w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center mt-0.5">
                                        <Target className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="font-bold text-gray-900 text-sm">2. Plan your budget</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            Assign every dollar a job. You'll see your progress live on the dashboard.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <div className="flex-shrink-0 w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center mt-0.5">
                                        <Plus className="h-4 w-4 text-amber-600" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="font-bold text-gray-900 text-sm">3. Track as you go</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            Log transactions as they happen to keep your dashboard accurate and intentional.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDismiss();
                                }}
                                disabled={isSubmitting}
                                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 active:scale-95"
                            >
                                {isSubmitting ? 'Loading...' : "Let's Get Started!"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
}
